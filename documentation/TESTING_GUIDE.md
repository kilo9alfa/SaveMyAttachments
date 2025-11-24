# SaveMe Testing Guide - Deploy to Different Email Account

Quick guide for testing SaveMe with a different Gmail account.

**Time Required:** 10-15 minutes

---

## Prerequisites

- Access to a different Gmail account (your test email)
- All SaveMe source files from this repository
- OpenRouter API key (can use the same one or create a new one)

---

## Step-by-Step Testing Process

### 1. Open Incognito/Private Browser Window

This keeps your test account session separate from your main account.

- **Chrome:** Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
- **Safari:** File → New Private Window
- **Firefox:** Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)

### 2. Sign In to Test Gmail Account

1. Go to [gmail.com](https://gmail.com)
2. Sign in with your test email address
3. Verify you're signed in to the correct account

### 3. Create New Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** to create new spreadsheet
3. Name it: "SaveMe Email Tracker - Test" (or any name)

### 4. Open Apps Script Editor

1. In the spreadsheet, go to **Extensions → Apps Script**
2. Delete the default `function myFunction() {}` code in `Code.gs`

### 5. Copy All SaveMe Files

You need to create **13 files total** in the Apps Script editor.

#### Core Script Files (.gs)

For each `.gs` file, click **+ (Plus icon)** → **Script**:

1. **Code.gs** - Copy from `/Users/dpm/Documents/repos/SaveMe/Code.gs`
2. **Config.gs** - Copy from `/Users/dpm/Documents/repos/SaveMe/Config.gs`
3. **GmailProcessor.gs** - Copy from repository
4. **DriveManager.gs** - Copy from repository
5. **EmailConverter.gs** - Copy from repository
6. **FileNaming.gs** - Copy from repository
7. **OpenRouterService.gs** - Copy from repository
8. **EmailTracker.gs** - Copy from repository
9. **SheetsManager.gs** - Copy from repository
10. **TriggerManager.gs** - Copy from repository
11. **DebugManager.gs** - Copy from repository

#### HTML File

Click **+ (Plus icon)** → **HTML**:

12. **SettingsPanel.html** - Copy from repository

#### Manifest File

13. **appsscript.json**
   - Click **⚙️ Project Settings** (gear icon in left sidebar)
   - Check ✅ **"Show appsscript.json manifest file in editor"**
   - Go back to **Editor** tab
   - Click on `appsscript.json` in file list
   - Replace entire contents with code from repository

**Important:** Make sure `appsscript.json` includes all required OAuth scopes:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.container.ui"
  ]
}
```

### 6. Save the Apps Script Project

1. Click **💾 Save project** (disk icon) or Ctrl/Cmd+S
2. Name the project: "SaveMe - Test Account"

### 7. Refresh the Spreadsheet

1. Close the Apps Script editor tab
2. Go back to your Google Sheet tab
3. **Refresh the page** (F5 or Cmd+R)
4. Wait 5-10 seconds for the script to load

You should see a new **SaveMe** menu appear in the menu bar!

### 8. Authorize SaveMe (First Time Only)

1. Click **SaveMe → ⚙️ Configure Settings**
2. You'll see an authorization dialog:
   - "SaveMe needs permission to access your data"
   - Click **Review Permissions**
3. Choose your test Gmail account
4. Click **Advanced** → **Go to SaveMe - Test Account (unsafe)**
   - (It says "unsafe" because it's an unpublished script - this is normal)
5. Click **Allow** to grant all permissions

**Permissions you're granting:**
- Read Gmail emails
- Add labels to emails
- Create files in Google Drive
- Write to this Google Sheet
- Make external API requests (OpenRouter)

### 9. Configure Settings

The settings panel should now open. Fill in:

#### 📁 Google Drive (Required)

1. **Create a test Drive folder:**
   - Open [drive.google.com](https://drive.google.com) in another tab
   - Create new folder: "SaveMe Test Attachments"
   - Open the folder
   - Copy the URL from address bar (it will look like `https://drive.google.com/drive/folders/FOLDER_ID_HERE`)

2. **Paste the folder URL** into "Drive Folder" field in settings

#### 🤖 AI Summarization (Optional)

- **Enable AI:** Check ✅ to enable AI summaries
- **OpenRouter API Key:** Paste your API key from [openrouter.ai/keys](https://openrouter.ai/keys)
  - You can use the same API key from your main account
  - Or create a new account/key for cost tracking
- **AI Model:** Leave default (`anthropic/claude-3.5-sonnet`) or choose another
- **Summary Prompt:** Leave default or customize

#### 📋 What to Save (Optional)

- **Save Email Body:** Check if you want full email saved as PDF/HTML/TXT
- **Save Attachments:** Check to save attachments (default: on)

#### 📄 File Naming (Optional)

Leave defaults or customize:
- **Attachment Template:** `{{Year}}.{{Month}}.{{Day}}-{{AttachmentName}}`
- **Email Template:** `{{Year}}-{{Month}}-{{Day}}_{{Subject}}`

#### 📊 Processing Options

- **Batch Size:** 20 (how many emails to process per run)
- **Days Back:** 7 (how far back to look for emails)
- **Newest First:** ✅ Checked (process newest emails first)

#### 🔍 Gmail Filter

- Leave blank for default: `has:attachment` (all emails with attachments)
- Or customize: `from:specific@email.com has:attachment`

#### 🎯 File Filtering (Optional)

Leave blank unless you want to filter by file type:
- **Allowed Extensions:** e.g., `pdf,docx,xlsx` (only these types)
- **Min Size (KB):** 5 (skip tiny files like signatures)
- **Max Size (MB):** 0 (no limit, or set like 25)

### 10. Save Configuration

Click **💾 Save Settings** button at bottom

You should see: ✅ "Settings saved successfully!"

### 11. Send Test Email to This Account

From your main email or another account:

1. Send an email **TO** your test Gmail account
2. Include:
   - A subject line (e.g., "SaveMe Test Email")
   - Some body text (e.g., "This is a test email to verify SaveMe works correctly.")
   - At least one attachment (PDF, image, document, etc.)

Wait for it to arrive in the test account's inbox.

### 12. Run Manual Test

Back in the Google Sheet:

1. Click **SaveMe → 🧪 Process Test Email**
2. Wait 5-30 seconds (depending on email size and AI model)
3. You should see a success message with:
   - Subject of the processed email
   - Number of files saved
   - AI summary (if enabled)

### 13. Verify Results

#### Check Google Sheet

The spreadsheet should now have:
- **Header row:** Message ID, Date, Sender, Subject, Attachment, AI Summary
- **Data row(s):** One row for each file saved
- **Clickable attachment links** in the "Attachment" column

#### Check Google Drive

1. Go to your "SaveMe Test Attachments" folder in Drive
2. You should see:
   - Email body file (if "Save Email Body" was enabled): `2024-11-05_SaveMe_Test_Email.pdf`
   - Attachment files with custom naming: `2024.11.05-filename.pdf`

#### Check Logs (if something went wrong)

1. Go to Apps Script editor
2. Click **Execution log** (bottom section)
3. Or click **View → Logs** (Ctrl/Cmd+Enter)
4. Look for error messages or processing details

### 14. Test Automation (Optional)

If manual test worked, you can enable automation:

1. Click **SaveMe → 🤖 Automation → Start Automation**
2. Choose frequency: 15 minutes (recommended for testing)
3. Click **Start**

Now SaveMe will automatically check for new emails every 15 minutes!

To verify it's running:
- Click **SaveMe → 🤖 Automation → View Status**
- You should see "Automation is ACTIVE"

**To stop automation:**
- Click **SaveMe → 🤖 Automation → Stop Automation**

---

## Troubleshooting

### "No emails found matching your filters"

**Cause:** Gmail filter didn't match any emails

**Solutions:**
1. Check that test email has an attachment (default filter is `has:attachment`)
2. Make sure email is within "Days Back" range (default: 7 days)
3. Try changing Gmail filter in settings to be more specific:
   - `from:your-main-email@gmail.com has:attachment`
4. Click **SaveMe → 📊 Info & Monitoring → View Diagnostics** to see search query

### "Cannot find folder" or "Drive folder ID is invalid"

**Cause:** Incorrect folder URL/ID

**Solutions:**
1. Open the Drive folder in your browser
2. Make sure you're signed in to the TEST account (not your main account)
3. Copy the FULL URL from address bar
4. The URL should look like: `https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
5. Paste entire URL into settings (script will extract the ID automatically)

### "OpenRouter API Error"

**Cause:** Invalid API key or quota exceeded

**Solutions:**
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Verify API key is correct (starts with `sk-or-v1-`)
3. Check your OpenRouter account has credits
4. Or disable AI in settings to test without AI summaries

### "Email has no body, skipping AI summary"

**This is normal!** Some emails have only HTML content, no plain text body.

**Solutions:**
- This won't prevent email from being saved
- Attachment will still be saved
- AI Summary column will be empty for this email
- No action needed

### Multiple Rows for Same Email

**This is expected behavior!** SaveMe creates **one row per file saved**.

**Example:** If you save email body as PDF AND save 2 attachments = 3 rows total:
- Row 1: Email PDF file
- Row 2: Attachment 1
- Row 3: Attachment 2

All rows have the same Message ID (hidden column A).

### Settings Not Saving

**Cause:** Permission issue or validation error

**Solutions:**
1. Check browser console for errors:
   - Right-click → Inspect → Console tab
2. Make sure required fields are filled:
   - Drive Folder (always required)
   - API Key (only if AI enabled)
3. Try refreshing the page and opening settings again

---

## What to Test

### Core Functionality Checklist

- [ ] Settings panel opens and saves successfully
- [ ] Manual test processes one email correctly
- [ ] Email body saved to Drive (if enabled)
- [ ] Attachments saved to Drive with custom naming
- [ ] AI summary appears in Sheet (if enabled)
- [ ] Clickable Drive links work in Sheet
- [ ] No duplicate processing (run manual test twice on same email)
- [ ] Processing logs show no errors
- [ ] File naming template applied correctly

### Optional Testing

- [ ] Different email formats (plain text, HTML, mixed)
- [ ] Large attachments (>5MB)
- [ ] Multiple attachments in one email
- [ ] Emails with no attachments (should be skipped)
- [ ] Custom Gmail filters (e.g., `from:specific@email.com`)
- [ ] File type filtering (allowed/disallowed extensions)
- [ ] Automation trigger (runs every 15 minutes)
- [ ] Cost estimates (SaveMe → View Cost Estimates)

---

## Comparing Test Account vs. Main Account

### What's Different

1. **Completely separate Apps Script project**
   - Each Gmail account has its own copy of the code
   - Settings are independent
   - No data sharing between accounts

2. **Separate Google Drive storage**
   - Each account saves to its own Drive folder
   - Files are owned by that account

3. **Independent OpenRouter usage**
   - You can use the same API key (shared billing)
   - Or use different API keys (separate billing/tracking)

4. **Separate Google Sheets**
   - Each account logs to its own spreadsheet
   - No way to combine data (unless you manually export/import)

### What's the Same

- Same source code (functionality)
- Same AI models available
- Same features and capabilities

---

## Next Steps After Testing

### If Test Successful ✅

1. **Test with more emails:**
   - Send 5-10 test emails with different formats
   - Enable automation and let it run for a few hours
   - Monitor the Sheet and Drive folder

2. **Optimize settings:**
   - Adjust AI prompt for better summaries
   - Test different file naming templates
   - Set up custom Gmail filters for different email types

3. **Consider multi-account strategy:**
   - Use main account for personal emails
   - Use work account for business emails
   - Keep them separate or consolidate (your choice)

### If Test Failed ❌

1. **Check Apps Script execution log:**
   - Apps Script editor → View → Logs
   - Look for red error messages

2. **Verify all files copied:**
   - Should have 13 files total in Apps Script editor
   - Missing files will cause errors

3. **Re-authorize:**
   - Delete and recreate the Apps Script project
   - Make sure you authorized with the correct account

4. **Contact for help:**
   - Share error messages from logs
   - Share screenshot of settings panel
   - Share screenshot of diagnostics output

---

## Cleaning Up Test Account (Optional)

When done testing, you can clean up:

1. **Stop automation:**
   - SaveMe → Automation → Stop Automation

2. **Delete test files:**
   - Empty "SaveMe Test Attachments" folder in Drive
   - Or delete the entire folder

3. **Clear Sheet:**
   - SaveMe → Tools → Clear Everything & Start Fresh
   - Or delete the entire spreadsheet

4. **Remove Apps Script project:**
   - Apps Script editor → Overview (left sidebar)
   - Three dots menu → Move to trash

---

## Files Needed for Deployment

Here's the complete list of files to copy from your repository:

### Script Files (.gs) - 11 files
1. `/Users/dpm/Documents/repos/SaveMe/Code.gs`
2. `/Users/dpm/Documents/repos/SaveMe/Config.gs`
3. `/Users/dpm/Documents/repos/SaveMe/GmailProcessor.gs`
4. `/Users/dpm/Documents/repos/SaveMe/DriveManager.gs`
5. `/Users/dpm/Documents/repos/SaveMe/EmailConverter.gs`
6. `/Users/dpm/Documents/repos/SaveMe/FileNaming.gs`
7. `/Users/dpm/Documents/repos/SaveMe/OpenRouterService.gs`
8. `/Users/dpm/Documents/repos/SaveMe/EmailTracker.gs`
9. `/Users/dpm/Documents/repos/SaveMe/SheetsManager.gs`
10. `/Users/dpm/Documents/repos/SaveMe/TriggerManager.gs`
11. `/Users/dpm/Documents/repos/SaveMe/DebugManager.gs`

### HTML Files - 1 file
12. `/Users/dpm/Documents/repos/SaveMe/SettingsPanel.html`

### Manifest - 1 file
13. `/Users/dpm/Documents/repos/SaveMe/appsscript.json`

**Total: 13 files**

---

## Quick Reference: Test Email Template

Send this email to your test account:

**To:** your-test-account@gmail.com
**Subject:** SaveMe Test Email
**Body:**
```
This is a test email to verify SaveMe is working correctly.

Testing features:
- Email body conversion to PDF
- Attachment saving to Drive
- AI-powered email summarization
- Google Sheets logging

If you see this in your SaveMe spreadsheet with a Drive link, it worked!
```

**Attachments:** Add 1-2 files (PDF, image, or document)

---

**Testing Time:** Approximately 15-20 minutes total

**Support:** If you run into issues, check the logs first (Apps Script editor → View → Logs)
