# Transfer SaveMyAttachments Ownership to support@thecoralblock.com

## Current Status

- **Apps Script Project ID:** `1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K`
- **Current Owner:** testingsavemyattachments@gmail.com
- **Target Owner:** support@thecoralblock.com
- **Status:** ✅ All code pushed (Google Picker + drive.file scope)

## Step 1: Add support@thecoralblock.com as Editor

1. **Login as testingsavemyattachments@gmail.com**

2. **Open the Apps Script project:**
   - Go to: https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit

3. **Click the Share button** (top right corner, person icon with +)

4. **Add support@thecoralblock.com:**
   - Enter email: support@thecoralblock.com
   - Set role: **Editor**
   - Click **Send**

5. **Verify** - support@thecoralblock.com should receive email invitation

## Step 2: Verify Access with support@thecoralblock.com

1. **Login as support@thecoralblock.com**

2. **Check email** for "testingsavemyattachments@gmail.com shared an item with you"

3. **Click the link** or go directly to:
   - https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit

4. **Verify** you can see all the code files

## Step 3: Create Container-Bound Script for Testing

Since this is a standalone script, to test the menu you need to attach it to a spreadsheet:

### Option A: Manual Copy (Recommended for Testing)

1. **As support@thecoralblock.com:**
   - Go to https://sheets.google.com
   - Create new blank spreadsheet
   - Click **Extensions → Apps Script**

2. **Copy all files** from the standalone project:
   - Open standalone: https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit
   - Copy each .gs and .html file
   - Paste into container-bound script
   - Save all files

3. **Refresh the spreadsheet:**
   - Go back to the Google Sheet
   - Refresh the page (Cmd+R / Ctrl+R)
   - **SaveMyAttachments menu should appear!**

4. **Authorize when prompted:**
   - Click any menu item
   - Grant OAuth permissions
   - Test the menu functions

### Option B: Use Clasp to Clone

```bash
# As support@thecoralblock.com
clasp login
clasp pull
# Then attach to a spreadsheet manually
```

## Step 4: Testing with testingsavemyattachments@gmail.com

Once container-bound script is set up:

1. **Share the spreadsheet** with testingsavemyattachments@gmail.com (Editor access)

2. **Login as testingsavemyattachments@gmail.com**

3. **Open the shared spreadsheet** - menu should appear

4. **Test Google Picker:**
   - Click **SaveMyAttachments → 📁 Select Drive Folder/Spreadsheet → 📂 Select Drive Folder**
   - Folder picker should open
   - Select a folder
   - Verify it's saved

5. **Test spreadsheet picker** similarly

## What's Been Deployed

✅ **Google Picker Implementation** (v1.1):
- PickerHelper.gs - Server-side picker functions
- FolderPicker.html - Folder selection UI
- SpreadsheetPicker.html - Spreadsheet selection UI
- Updated menu with picker options

✅ **OAuth Scopes** (Marketplace-ready):
- gmail.readonly
- drive.file (changed from drive - saves $15k-$75k CASA assessment!)
- script.external_request

✅ **All 19 code files** pushed to Apps Script project

## For Future Marketplace Publishing

Once testing is complete with container-bound script:

1. We'll need to convert to proper Workspace Add-on
2. Add add-on manifest to appsscript.json
3. Link to Google Cloud Project (savemyattachments)
4. Submit to Workspace Marketplace

But for now, container-bound script is perfect for testing all functionality!

## Quick Reference

**Standalone Project (for reference):**
- URL: https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit
- Owner: testingsavemyattachments@gmail.com
- Editor: support@thecoralblock.com (after Step 1)

**Container-Bound Project (for testing):**
- Create via: Extensions → Apps Script in any Google Sheet
- Owner: support@thecoralblock.com
- Tester: testingsavemyattachments@gmail.com (share spreadsheet)

**GitHub Repo:**
- https://github.com/kilo9alfa/SaveMe
- Latest commit: 825aea9 (manifest fix)
