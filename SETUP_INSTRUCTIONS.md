# Setup Instructions for Testing SaveMyAttachments

## Problem

The current Apps Script project (ID: `1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K`) is a **standalone script**.

The `onOpen()` menu function only works in **container-bound scripts** (scripts attached to a specific Google Sheet).

## Solution: Create Container-Bound Script

### Option 1: Manual Setup (Recommended for Testing)

1. **Open Google Sheets** as testingsavemyattachments@gmail.com
   - Go to https://sheets.google.com
   - Create a new blank spreadsheet

2. **Open Script Editor**
   - Click **Extensions → Apps Script**
   - This creates a container-bound script

3. **Copy All Files**
   - Go to the standalone project: https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit
   - Copy each file's content:
     - Code.gs
     - Config.gs
     - DebugManager.gs
     - DriveManager.gs
     - EmailConverter.gs
     - EmailTracker.gs
     - FileNaming.gs
     - GmailProcessor.gs
     - OpenRouterService.gs
     - PickerHelper.gs (NEW)
     - RulesEngine.gs
     - SheetsManager.gs
     - TriggerManager.gs
   - Create matching files in the container-bound script
   - Paste the content

4. **Copy HTML Files**
   - FolderPicker.html (NEW)
   - SpreadsheetPicker.html (NEW)
   - MANUAL.html
   - RulesManager.html
   - SettingsPanel.html

5. **Update appsscript.json**
   - Replace with:
   ```json
   {
     "timeZone": "America/New_York",
     "dependencies": {},
     "exceptionLogging": "STACKDRIVER",
     "runtimeVersion": "V8",
     "oauthScopes": [
       "https://www.googleapis.com/auth/gmail.readonly",
       "https://www.googleapis.com/auth/drive.file",
       "https://www.googleapis.com/auth/script.external_request"
     ]
   }
   ```

6. **Save and Reload**
   - Save all files (Ctrl+S / Cmd+S)
   - Go back to the spreadsheet
   - Refresh the page
   - You should see "SaveMyAttachments" menu appear

7. **Authorize**
   - Click **SaveMyAttachments** menu
   - Click any menu item
   - You'll be prompted to authorize OAuth scopes
   - Accept the permissions

### Option 2: Use Existing Standalone Script

The standalone script can still be used, but you need to run functions manually:

1. Go to: https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit

2. Select a function from the dropdown (e.g., `showFolderPicker`)

3. Click **Run** button

4. The function will execute, but without the spreadsheet menu UI

### Option 3: Convert to Workspace Add-on (Future)

For Marketplace publishing, we'll need to:
1. Add add-on manifest to appsscript.json
2. Configure add-on settings (name, icon, scopes)
3. Create installable triggers
4. Submit to Workspace Marketplace

This is required for public distribution but not for testing.

## Testing the Google Picker

Once you have a container-bound script:

1. **Test Folder Picker:**
   - Click **SaveMyAttachments → 📁 Select Drive Folder/Spreadsheet → 📂 Select Drive Folder**
   - Google Picker should open
   - Select a folder
   - Check that it's saved: **Tools → View Diagnostics**

2. **Test Spreadsheet Picker:**
   - Click **SaveMyAttachments → 📁 Select Drive Folder/Spreadsheet → 📊 Select Spreadsheet**
   - Google Picker should open
   - Select a spreadsheet
   - Check that it's saved: **Tools → View Diagnostics**

## Current Deployment Info

- **Standalone Script ID:** 1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K
- **Deployment ID:** AKfycbwy8CmgIs1AtVZ3GwCn2rgmBtqBA8Y86m8G9Hmg7-6gtvgFndlt3mmvvYIx8P5DbKN-Yw
- **Account:** testingsavemyattachments@gmail.com
- **Version:** v1.1-google-picker
- **OAuth Scopes:** gmail.readonly, drive.file, script.external_request

## Quick Test Alternative

Run `testOAuthScopes()` from the standalone script editor:
1. Open: https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit
2. Select function: `testOAuthScopes`
3. Click **Run**
4. Authorize when prompted
5. Check **Execution log** for success message
