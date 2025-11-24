# Quick Setup: Container-Bound Script for Testing

## The Problem

The standalone Apps Script project doesn't show menus because it's not attached to a spreadsheet.

## Simple Solution (5 minutes)

### Step 1: Create New Spreadsheet

1. **Login as support@thecoralblock.com** (or testingsavemyattachments@gmail.com)
2. Go to: https://sheets.google.com
3. Click **+ Blank** to create new spreadsheet
4. Rename it: "SaveMyAttachments Test"

### Step 2: Open Script Editor

1. Click **Extensions → Apps Script**
2. This opens the container-bound script editor
3. You'll see one file: `Code.gs` with `myFunction()`

### Step 3: Copy Files from Standalone Project

**Open the standalone project in another tab:**
- https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit

**Copy these files one by one:**

#### Core Code Files (13 files)
1. **Code.gs** - Replace the default myFunction with our Code.gs content
2. **Config.gs** - Click + next to Files, select Script, name it Config.gs
3. **DebugManager.gs**
4. **DriveManager.gs**
5. **EmailConverter.gs**
6. **EmailTracker.gs**
7. **FileNaming.gs**
8. **GmailProcessor.gs**
9. **OpenRouterService.gs**
10. **PickerHelper.gs** (NEW - for Google Picker)
11. **RulesEngine.gs**
12. **SheetsManager.gs**
13. **TriggerManager.gs**

#### HTML Files (5 files)
1. **FolderPicker.html** (NEW - for Google Picker) - Click +, select HTML
2. **SpreadsheetPicker.html** (NEW - for Google Picker)
3. **MANUAL.html**
4. **RulesManager.html**
5. **SettingsPanel.html**

#### Configuration File
1. **appsscript.json** - Click ⚙️ Project Settings, scroll down, check "Show appsscript.json", then go back to Editor and edit it

**For each file:**
- In standalone project: Click the file → Select all (Cmd+A / Ctrl+A) → Copy (Cmd+C / Ctrl+C)
- In container-bound project: Create file → Paste (Cmd+V / Ctrl+V) → Save (Cmd+S / Ctrl+S)

### Step 4: Save and Reload

1. **Save all files** in the script editor (Cmd+S / Ctrl+S)
2. **Go back to the spreadsheet tab**
3. **Refresh the page** (Cmd+R / Ctrl+R)
4. **Wait 5-10 seconds**
5. **Look for "SaveMyAttachments" menu** in the menu bar!

### Step 5: Authorize

1. **Click SaveMyAttachments menu**
2. Click any menu item (e.g., "⚙️ Configure Settings")
3. **Grant permissions** when prompted:
   - Click "Advanced"
   - Click "Go to SaveMyAttachments (unsafe)"
   - Review permissions
   - Click "Allow"

### Step 6: Test Google Picker

1. **Click SaveMyAttachments → 📁 Select Drive Folder/Spreadsheet → 📂 Select Drive Folder**
2. Google Picker should open
3. Select any folder
4. You should see "Folder selected: [folder name]" confirmation

Success! The menu is working! 🎉

## Alternative: Use Clasp Clone Command

If you're comfortable with command line:

```bash
# Pull from standalone project
cd /Users/david/code/SaveMe
clasp pull

# Create new sheet and get its ID from URL
# Then create container-bound project linked to that sheet
clasp create --type sheets --title "SaveMyAttachments Test" --rootDir .
```

But manual copy-paste is usually faster and more reliable.

## Troubleshooting

**Menu doesn't appear?**
- Wait 30 seconds and refresh again
- Check if all files were copied (18 .gs and .html files + appsscript.json)
- Open script editor, click Run → Select "onOpen" → Click Run
- If error appears, check which file is missing

**Google Picker doesn't open?**
- Make sure FolderPicker.html and SpreadsheetPicker.html were copied
- Make sure PickerHelper.gs was copied
- Check browser console for errors (F12)

**OAuth authorization issues?**
- Make sure appsscript.json has correct scopes:
  - gmail.readonly
  - drive.file
  - script.external_request

## After Testing

Once you confirm the menu works in the container-bound script:

1. **Share the spreadsheet** with testingsavemyattachments@gmail.com
2. Have them test with their account
3. Verify Google Picker works for both users
4. Test the full email processing workflow

This container-bound version is for testing only. For Marketplace publishing, we'll need to convert back to a proper Workspace Add-on structure.
