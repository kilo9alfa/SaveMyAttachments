# Google Workspace Marketplace - OAuth Best Practices

**Purpose:** Document learnings about OAuth scopes, avoiding sensitive/restricted scopes, and bypassing CASA security assessments for Google Workspace Add-ons.

**Last Updated:** November 25, 2025

---

## TL;DR - Key Principles

1. **Use narrowest possible scopes** - Google rewards minimal access with easier verification
2. **Avoid restricted scopes** - They require expensive CASA assessments ($15k-$75k)
3. **Use Advanced Drive Service** instead of DriveApp for `drive.file` scope compatibility
4. **Use container-bound/Editor Add-on architecture** for `spreadsheets.currentonly` scope
5. **Never use full `drive` or `spreadsheets` scopes** unless absolutely necessary

---

## Scope Classification

Google classifies OAuth scopes into three categories:

| Category | Verification | CASA Required | Examples |
|----------|-------------|---------------|----------|
| **Non-sensitive** | Basic verification | No | `drive.file`, `spreadsheets.currentonly`, `script.*` |
| **Sensitive** | Standard verification | No | `gmail.readonly`, `calendar.readonly` |
| **Restricted** | Enhanced verification | **YES ($15k-$75k)** | `gmail`, `drive`, `spreadsheets` (full access) |

**Goal:** Use only non-sensitive and sensitive scopes. Avoid restricted scopes entirely.

---

## Scope Recommendations by Use Case

### Reading Emails
| Need | Recommended Scope | Avoid |
|------|------------------|-------|
| Read email content/attachments | `gmail.readonly` (sensitive) | `gmail` (restricted) |
| Send emails | `gmail.send` (sensitive) | `gmail` (restricted) |
| Full email management | Consider if really needed | `gmail` (restricted) |

### Google Drive Access
| Need | Recommended Scope | Avoid |
|------|------------------|-------|
| Save files app creates | `drive.file` (non-sensitive) | `drive` (restricted) |
| Read user's existing files | `drive.readonly` (sensitive) | `drive` (restricted) |
| Full Drive access | Consider if really needed | `drive` (restricted) |

### Google Sheets Access
| Need | Recommended Scope | Avoid |
|------|------------------|-------|
| Access current spreadsheet only | `spreadsheets.currentonly` (non-sensitive) | `spreadsheets` (restricted) |
| Access any spreadsheet by URL | Consider redesigning | `spreadsheets` (restricted) |

### Google Calendar Access
| Need | Recommended Scope | Avoid |
|------|------------------|-------|
| Read calendar events | `calendar.readonly` (sensitive) | `calendar` (restricted) |
| Create/modify events | `calendar.events` (sensitive) | `calendar` (restricted) |

---

## Technical Implementation Patterns

### Pattern 1: Drive File Access with `drive.file` Scope

**Problem:** `DriveApp` methods like `createFolder()`, `getFoldersByName()` require full `drive` scope.

**Solution:** Use **Advanced Drive Service** (Drive API v2) instead.

```javascript
// appsscript.json - Enable Advanced Drive Service
{
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v2",
        "serviceId": "drive"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive.file"
  ]
}
```

```javascript
// Creating a folder (drive.file compatible)
function createAppFolder() {
  var folderMetadata = {
    title: 'MyAppFolder',  // v2 uses 'title', not 'name'
    mimeType: 'application/vnd.google-apps.folder'
  };

  var folder = Drive.Files.insert(folderMetadata);
  // Save folder.id - app can access this folder with drive.file scope
  return folder;
}

// Saving a file to the folder (drive.file compatible)
function saveFile(folderId, blob, fileName) {
  var fileMetadata = {
    title: fileName,
    parents: [{ id: folderId }]  // v2 syntax
  };

  var file = Drive.Files.insert(fileMetadata, blob);
  return file.alternateLink;  // v2 uses 'alternateLink', not 'webViewLink'
}

// Getting a file (only works for files app created)
function getFile(fileId) {
  return Drive.Files.get(fileId);
}
```

**Key Points:**
- `Drive.Files.insert()` creates files/folders accessible with `drive.file`
- App can ONLY access files it created (not user's existing files)
- Use v2 API syntax: `title` (not `name`), `alternateLink` (not `webViewLink`)
- Don't use `DriveApp` methods - they require full `drive` scope

### Pattern 2: Spreadsheet Access with `spreadsheets.currentonly`

**Problem:** Accessing spreadsheets by URL requires full `spreadsheets` scope.

**Solution:** Design as an **Editor Add-on** that only accesses the active spreadsheet.

```javascript
// appsscript.json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly"
  ]
}
```

```javascript
// Accessing the current spreadsheet (spreadsheets.currentonly compatible)
function getCurrentSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function writeToSheet(data) {
  var sheet = getCurrentSheet();
  sheet.appendRow(data);
}

// This will FAIL with spreadsheets.currentonly:
// SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/...')
// SpreadsheetApp.openById('spreadsheet-id')
```

**Key Points:**
- Use `getActiveSpreadsheet()` - works with `spreadsheets.currentonly`
- Don't use `openByUrl()` or `openById()` - requires full `spreadsheets` scope
- Design your add-on to work with the spreadsheet where it's installed
- User data stays in their own spreadsheet

### Pattern 3: UI Dialogs and Sidebars

```javascript
// appsscript.json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.container.ui"
  ]
}
```

```javascript
// Showing dialogs (requires script.container.ui)
function showSettings() {
  var html = HtmlService.createHtmlOutputFromFile('Settings')
    .setWidth(500)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
```

### Pattern 4: External API Calls

```javascript
// appsscript.json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

```javascript
// Calling external APIs (requires script.external_request)
function callExternalAPI(apiKey, data) {
  var options = {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + apiKey },
    payload: JSON.stringify(data),
    contentType: 'application/json'
  };

  return UrlFetchApp.fetch('https://api.example.com/endpoint', options);
}
```

### Pattern 5: Scheduled Triggers

```javascript
// appsscript.json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
```

```javascript
// Managing triggers (requires script.scriptapp)
function createDailyTrigger() {
  ScriptApp.newTrigger('processEmails')
    .timeBased()
    .everyHours(1)
    .create();
}

function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
}
```

---

## Complete appsscript.json Template

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v2",
        "serviceId": "drive"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
```

---

## Drive API v2 vs v3 Reference

Google Apps Script Advanced Drive Service uses v2 by default. Here's the syntax difference:

| Operation | v2 Syntax | v3 Syntax |
|-----------|-----------|-----------|
| Create file/folder | `Drive.Files.insert(metadata, blob)` | `Drive.Files.create(metadata, blob)` |
| File name property | `title` | `name` |
| Web link property | `alternateLink` | `webViewLink` |
| Parent folder | `parents: [{ id: folderId }]` | `parents: [folderId]` |
| Trash file | `Drive.Files.trash(fileId)` | `Drive.Files.update({ trashed: true }, fileId)` |

**Important:** In Apps Script editor, only v2 is typically available. Use v2 syntax.

---

## OAuth Verification Process

### What Google Reviews

1. **Scope justification** - Why do you need each scope?
2. **Privacy policy** - Must explain data handling
3. **Demo video** - Show the OAuth flow and app functionality
4. **Homepage** - Must have a legitimate website

### Timeline

- **Non-sensitive scopes only:** 1-2 weeks
- **Sensitive scopes (e.g., gmail.readonly):** 2-4 weeks
- **Restricted scopes (CASA required):** 2-6 months + $15k-$75k

### Tips for Faster Approval

1. Use narrowest scopes possible
2. Provide clear justification for each scope
3. Show OAuth consent screen in demo video
4. Have complete privacy policy and terms of service
5. Respond quickly to Google's questions

---

## Common Mistakes to Avoid

### 1. Using DriveApp with drive.file scope
```javascript
// WRONG - requires full 'drive' scope
DriveApp.createFolder('MyFolder');
DriveApp.getFoldersByName('MyFolder');

// CORRECT - works with 'drive.file' scope
Drive.Files.insert({ title: 'MyFolder', mimeType: 'application/vnd.google-apps.folder' });
```

### 2. Accessing spreadsheets by URL
```javascript
// WRONG - requires full 'spreadsheets' scope
SpreadsheetApp.openByUrl('https://docs.google.com/...');

// CORRECT - works with 'spreadsheets.currentonly' scope
SpreadsheetApp.getActiveSpreadsheet();
```

### 3. Requesting more scopes than needed
```javascript
// WRONG - requesting restricted scope when not needed
"oauthScopes": ["https://www.googleapis.com/auth/drive"]

// CORRECT - minimal scope for app-created files only
"oauthScopes": ["https://www.googleapis.com/auth/drive.file"]
```

### 4. Forgetting to declare scopes in manifest
```javascript
// WRONG - missing scope declaration causes runtime errors
// (no oauthScopes in appsscript.json)

// CORRECT - explicitly declare all needed scopes
"oauthScopes": [
  "https://www.googleapis.com/auth/script.container.ui",
  "https://www.googleapis.com/auth/script.scriptapp"
]
```

---

## Architecture Decision Tree

```
Need to access Google Drive?
├── Only files YOUR app creates?
│   └── Use drive.file + Advanced Drive Service ✓
├── Need to browse/access user's existing files?
│   └── Use drive.readonly (sensitive) or drive (restricted - requires CASA)
│
Need to access Google Sheets?
├── Only the spreadsheet where add-on is running?
│   └── Use spreadsheets.currentonly + Editor Add-on architecture ✓
├── Need to access any spreadsheet by URL?
│   └── Use spreadsheets (restricted - requires CASA) or redesign
│
Need to access Gmail?
├── Only read emails?
│   └── Use gmail.readonly (sensitive) ✓
├── Need to send emails?
│   └── Use gmail.send (sensitive) ✓
├── Need full email management?
│   └── Use gmail (restricted - requires CASA)
```

---

## CASA Assessment Details

If you must use restricted scopes:

- **Cost:** $15,000 - $75,000 (varies by assessor and scope)
- **Duration:** 2-6 months
- **Annual renewal:** Required
- **Assessors:** Must use Google-approved security assessors

**Recommendation:** Redesign your app to avoid restricted scopes whenever possible.

---

## References

- [OAuth Scope Reference](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Apps Script OAuth Scopes](https://developers.google.com/apps-script/concepts/scopes)
- [Advanced Drive Service](https://developers.google.com/apps-script/advanced/drive)
- [OAuth Verification FAQ](https://support.google.com/cloud/answer/9110914)
- [CASA Assessment Info](https://developers.google.com/identity/protocols/oauth2/app-verification)

---

## Changelog

- **2025-11-25:** Initial version based on SaveMyAttachments OAuth verification experience
