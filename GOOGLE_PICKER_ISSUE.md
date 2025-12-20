# Google Picker API Issue in Apps Script

## Summary

Google Picker API cannot be reliably used in Google Apps Script container-bound scripts when displayed via `showModalDialog()` due to third-party cookie restrictions in the iframe sandbox environment.

## The Problem

### What We're Trying to Do
- Allow users to select a Google Drive folder where SaveMyAttachments will save files
- Use `drive.file` OAuth scope (non-restricted) to avoid $15k-$75k CASA security assessment
- Comply with Google OAuth team's recommendation to use Google Picker for folder selection

### Why Google Picker Fails

**Technical Issue:** Google Picker requires third-party cookies to authenticate and function properly. When displayed in an Apps Script modal dialog via `HtmlService.showModalDialog()`, the Picker runs in a sandboxed iframe that has strict cookie restrictions.

**Error Encountered:**
```
Can't access your Google Account

We can't access this content right now. Try signing into your Google account or allowing cookie access to proceed.
```

### Implementation Attempted

```javascript
// PickerHelper.gs
function showFolderPickerDialog() {
  var html = HtmlService.createHtmlOutputFromFile('FolderPickerNew')
    .setWidth(600)
    .setHeight(425)
    .setTitle('Select Drive Folder');

  SpreadsheetApp.getUi().showModalDialog(html, 'Select Drive Folder');
}

function getOAuthToken() {
  return ScriptApp.getOAuthToken();
}
```

```html
<!-- FolderPickerNew.html -->
<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript" src="https://apis.google.com/js/api.js"></script>
</head>
<body>
  <h2>Select Drive Folder</h2>
  <div id="status">Loading Google Picker...</div>

  <script>
    var accessToken = '';
    var pickerApiLoaded = false;

    function onApiLoad() {
      gapi.load('picker', {'callback': onPickerApiLoad});
    }

    function onPickerApiLoad() {
      pickerApiLoaded = true;
      google.script.run
        .withSuccessHandler(function(token) {
          accessToken = token;
          createPicker();
        })
        .getOAuthToken();
    }

    function createPicker() {
      if (pickerApiLoaded && accessToken) {
        var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setSelectFolderEnabled(true);

        var picker = new google.picker.PickerBuilder()
            .setOAuthToken(accessToken)
            .addView(view)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
      }
    }

    function pickerCallback(data) {
      if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        var folderId = doc[google.picker.Document.ID];
        var folderName = doc[google.picker.Document.NAME];

        google.script.run
          .withSuccessHandler(function(result) {
            // Success - close dialog
            google.script.host.close();
          })
          .saveFolderId(folderId, folderName);
      }
    }

    onApiLoad();
  </script>
</body>
</html>
```

### Specific Failure Points

1. **Cookie Dialog Appears:** When Picker loads, browser shows "Allow cookies" prompt
2. **Authentication Fails:** Even after allowing cookies, authentication fails with "Can't access your Google Account"
3. **Iframe Sandbox Restrictions:** Apps Script's `HtmlService.createHtmlOutputFromFile()` creates a sandboxed iframe with strict security policies
4. **Third-Party Cookie Blocking:** Modern browsers block third-party cookies by default, and the Picker API requires them to authenticate

## Why This Matters

### OAuth Scope Requirements

We need to use `drive.file` scope because:
- **Restricted scopes** (`drive`, `drive.readonly`) require CASA security assessment
- **CASA assessment cost:** $15,000 - $75,000 per year
- **Google's recommendation:** Use `drive.file` + Google Picker for folder selection

### The Catch-22

- `drive.file` scope only allows access to:
  - Files created by the app
  - Files selected via Google Picker
  - Files explicitly opened by the user
- Cannot access folders by URL/ID (user paste approach doesn't work)
- Cannot browse/search Drive without Picker
- **But Picker doesn't work in Apps Script modal dialogs!**

## Alternative Approaches Considered

### 1. URL-Based Folder Selection (FAILED)
**Approach:** User pastes folder URL, app extracts ID and accesses folder

```javascript
function saveFolderIdFromPanel(folderUrl) {
  var folderId = extractIdFromUrl(folderUrl);
  var folder = DriveApp.getFolderById(folderId); // FAILS with drive.file scope
  // Error: "Cannot access folder. Check URL/ID and permissions."
}
```

**Why it fails:** `drive.file` scope doesn't allow accessing arbitrary folders by ID

### 2. Create Folder by Name (FAILED)
**Approach:** User enters folder name, app creates or finds it

```javascript
function createFolderByName(folderName) {
  // Check if folder exists
  var folders = DriveApp.getFoldersByName(folderName); // FAILS
  // Error: "Specified permissions are not sufficient to call DriveApp.getFoldersByName"
}
```

**Why it fails:** `getFoldersByName()` requires `drive` or `drive.readonly` scope

### 3. Auto-Create Dedicated Folder (IMPLEMENTED ✅)
**Approach:** App automatically creates a dedicated "SaveMyAttachments" folder

```javascript
function getOrCreateSaveFolder() {
  var userProperties = PropertiesService.getUserProperties();
  var folderId = userProperties.getProperty('DRIVE_FOLDER_ID');

  // Check if we already have a valid folder
  if (folderId) {
    try {
      var folder = DriveApp.getFolderById(folderId);
      return { success: true, folderId: folderId, folderName: folder.getName() };
    } catch (e) {
      // Folder no longer accessible, create new one
    }
  }

  // Create new folder - THIS WORKS with drive.file scope
  var folder = DriveApp.createFolder('SaveMyAttachments');
  userProperties.setProperty('DRIVE_FOLDER_ID', folder.getId());

  return {
    success: true,
    folderId: folder.getId(),
    folderName: 'SaveMyAttachments',
    isNew: true
  };
}
```

**Why it works:**
- App creates the folder, so `drive.file` scope can access it
- No Picker needed
- No cookie/authentication issues
- User can move/rename folder afterward, app keeps ID reference

## Technical Details

### Apps Script Sandbox Modes

Apps Script HTML Service has three sandbox modes:
1. **IFRAME** (default) - Most restrictive, blocks third-party cookies
2. **NATIVE** - Deprecated, being phased out
3. **EMULATED** - Legacy mode, also deprecated

Even with different sandbox modes, the Picker authentication issue persists because:
- Browser security policies block third-party cookies in iframes
- Apps Script URLs are different domain from Picker API
- No way to set `SameSite=None` cookie attributes in Apps Script

### OAuth Token Flow

The OAuth token flow works correctly:
```javascript
ScriptApp.getOAuthToken() // Returns valid token
```

But the Picker API requires additional authentication that fails in the iframe:
1. Picker loads in iframe within Apps Script dialog
2. Picker tries to set authentication cookies
3. Browser blocks cookies (third-party context)
4. Picker cannot authenticate user
5. Shows "Can't access your Google Account" error

## Potential Solutions to Explore

### Option 1: Use Web App Instead of Modal Dialog

Deploy as web app instead of showing Picker in modal dialog:

```javascript
function showFolderPickerWebApp() {
  var url = ScriptApp.getService().getUrl();
  var html = '<script>window.open("' + url + '?page=picker", "_blank");</script>';
  var userInterface = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(userInterface, 'Opening Picker...');
}

function doGet(e) {
  if (e.parameter.page === 'picker') {
    return HtmlService.createHtmlOutputFromFile('FolderPickerNew')
      .setTitle('Select Folder');
  }
}
```

**Pros:**
- Opens in new window, not iframe
- Different security context
- May avoid cookie issues

**Cons:**
- Less seamless user experience
- Popup blocker issues
- State management complexity
- Still may have authentication issues

### Option 2: Use Full `drive` Scope + CASA Assessment

Accept the cost and use full `drive` scope:

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive"
  ]
}
```

**Pros:**
- Can access folders by URL/ID
- No Picker needed
- Reliable folder selection

**Cons:**
- $15,000 - $75,000 annual CASA assessment cost
- Longer OAuth verification process
- Higher security scrutiny

### Option 3: Hybrid Approach - Document Picker

Use Picker to select a **file** in the target folder, then use parent folder:

```javascript
// Picker configured for files instead of folders
var view = new google.picker.DocsView()
    .setIncludeFolders(true);

function pickerCallback(data) {
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    var doc = data[google.picker.Response.DOCUMENTS][0];
    var fileId = doc[google.picker.Document.ID];

    // Get parent folder of selected file
    var file = DriveApp.getFileById(fileId);
    var folders = file.getParents();
    if (folders.hasNext()) {
      var folder = folders.next();
      saveFolderId(folder.getId(), folder.getName());
    }
  }
}
```

**Pros:**
- Might work better than folder picker
- Uses `drive.file` scope
- User controls which folder

**Cons:**
- Confusing UX (select file to choose folder)
- Still has same iframe/cookie issues
- May not work at all

### Option 4: Use Different UI Context

Show Picker in sidebar instead of modal dialog:

```javascript
function showFolderPickerSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('FolderPickerNew')
    .setTitle('Select Folder');
  SpreadsheetApp.getUi().showSidebar(html);
}
```

**Pros:**
- Different iframe context
- More space for Picker UI
- Persistent across user actions

**Cons:**
- May still have same cookie issues
- Takes up screen space
- Less intuitive than modal dialog

## Current Implementation Status

**Implemented Solution:** Auto-create dedicated folder (Option 3 from alternatives)

**Status:** ✅ Working
- No Picker needed
- No authentication issues
- Complies with `drive.file` scope requirements
- Simple, reliable user experience

**Files Modified:**
- `PickerHelper.gs` - Removed Picker code, added auto-create logic
- `SettingsPanel.html` - Updated UI to show folder info and creation button
- `FolderPickerNew.html` - Still exists but not used (archived for reference)

## References

- [Google Picker API Documentation](https://developers.google.com/picker)
- [Apps Script HTML Service](https://developers.google.com/apps-script/guides/html)
- [OAuth Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes#drive)
- [Apps Script Sandbox Modes](https://developers.google.com/apps-script/guides/html/restrictions)
- [Third-party Cookie Restrictions](https://developers.google.com/privacy-sandbox/3pcd)

## Questions for Alternative Solutions

If exploring Picker-based solutions:

1. **Web App Deployment:**
   - Can we deploy Picker as standalone web app?
   - How to maintain state between web app and container-bound script?
   - Security implications of web app approach?

2. **Cookie Configuration:**
   - Can we set `SameSite=None; Secure` in Apps Script?
   - Alternative authentication methods for Picker?
   - Browser-specific workarounds?

3. **Different Picker Configuration:**
   - Does document picker work better than folder picker?
   - Can we use Picker outside of iframe context?
   - Alternative Google APIs for folder selection?

4. **Scope Alternatives:**
   - Is there a middle-ground scope between `drive.file` and `drive`?
   - Can we request folder-specific permissions?
   - OAuth incremental authorization possibilities?

---

**Last Updated:** 2024-11-24
**Status:** Auto-create folder solution implemented and working
**Picker Status:** Not usable in current Apps Script modal dialog context
