# SaveMe Deployment Checklist

Quick reference for deploying SaveMe to a new Gmail account.

---

## Pre-Deployment

- [ ] Open incognito/private browser window
- [ ] Sign in to target Gmail account
- [ ] Create new Google Sheet (name: "SaveMe Email Tracker - [Account Name]")
- [ ] Open Apps Script editor (Extensions → Apps Script)
- [ ] Delete default `Code.gs` content

---

## File Creation (13 files total)

### Script Files (.gs) - Click **+ → Script** for each

- [ ] **Code.gs** - Main orchestration & menu
- [ ] **Config.gs** - Configuration management
- [ ] **GmailProcessor.gs** - Email processing logic
- [ ] **DriveManager.gs** - Drive file operations
- [ ] **EmailConverter.gs** - Email to PDF/HTML/TXT
- [ ] **FileNaming.gs** - Template engine
- [ ] **OpenRouterService.gs** - AI integration
- [ ] **EmailTracker.gs** - Duplicate prevention
- [ ] **SheetsManager.gs** - Spreadsheet operations
- [ ] **TriggerManager.gs** - Automation triggers
- [ ] **DebugManager.gs** - Diagnostics & logging

### HTML Files - Click **+ → HTML**

- [ ] **SettingsPanel.html** - Configuration UI

### Manifest - Enable in Project Settings

- [ ] **appsscript.json** - OAuth scopes & config
  - Go to ⚙️ Project Settings
  - Check ✅ "Show appsscript.json manifest file in editor"
  - Go back to Editor
  - Replace entire content

---

## Post-Deployment

- [ ] Save Apps Script project (💾 or Ctrl/Cmd+S)
- [ ] Name project: "SaveMe - [Account Name]"
- [ ] Close Apps Script editor
- [ ] Refresh Google Sheet (F5)
- [ ] Wait for **SaveMe** menu to appear
- [ ] Click **SaveMe → Configure Settings**
- [ ] Authorize app (Review Permissions → Allow)

---

## Configuration

### Required Settings

- [ ] **Drive Folder:** Create folder in Drive, paste URL
- [ ] **OpenRouter API Key:** (if AI enabled) Paste from openrouter.ai/keys

### Optional Settings

- [ ] **AI Summarization:** Enable/disable
- [ ] **Save Email Body:** Choose format (PDF/HTML/TXT)
- [ ] **File Naming Templates:** Customize naming patterns
- [ ] **Batch Size:** Emails per run (default: 20)
- [ ] **Days Back:** How far to look (default: 7)
- [ ] **Gmail Filter:** Email search criteria

### Save

- [ ] Click **💾 Save Settings**
- [ ] Verify: "Settings saved successfully!" message

---

## Testing

- [ ] Send test email to this account (with attachment)
- [ ] Click **SaveMe → Process Test Email**
- [ ] Verify success message appears
- [ ] Check Google Sheet for new row
- [ ] Check Drive folder for saved files
- [ ] Click attachment link to verify it opens

---

## Automation (Optional)

- [ ] Click **SaveMe → Automation → Start Automation**
- [ ] Choose frequency (15 min recommended)
- [ ] Verify status: **SaveMe → Automation → View Status**

---

## Verification Checklist

- [ ] SaveMe menu appears in spreadsheet
- [ ] Settings save successfully
- [ ] Test email processes without errors
- [ ] Files appear in Drive folder
- [ ] Sheet row contains correct data
- [ ] Attachment link is clickable
- [ ] AI summary appears (if enabled)
- [ ] No duplicate rows on second run

---

## Troubleshooting

If something doesn't work:

1. **Check Logs:**
   - Apps Script editor → View → Logs
   - Look for error messages

2. **Check Diagnostics:**
   - SaveMe → Info & Monitoring → View Diagnostics

3. **Common Issues:**
   - Wrong Drive folder URL → Copy full URL from browser
   - Invalid API key → Check openrouter.ai/keys
   - No emails found → Verify Gmail filter syntax
   - Permission errors → Re-authorize app

---

## Files Source Location

All files are in: `/Users/dpm/Documents/repos/SaveMe/`

- Code.gs
- Config.gs
- GmailProcessor.gs
- DriveManager.gs
- EmailConverter.gs
- FileNaming.gs
- OpenRouterService.gs
- EmailTracker.gs
- SheetsManager.gs
- TriggerManager.gs
- DebugManager.gs
- SettingsPanel.html
- appsscript.json

---

## Deployment Time

**Estimated:** 10-15 minutes per account

---

## Support Files

- **Full Guide:** `TESTING_GUIDE.md`
- **Deployment Options:** `DEPLOYMENT_GUIDE.md`
- **Configuration Help:** `CONFIGURATION_OPTIONS.md`
- **Setup Instructions:** `SETUP.md`

---

**Last Updated:** 2024-11-05
**Version:** 1.0
