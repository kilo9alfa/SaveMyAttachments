# SaveMe - Setup Guide (Proof-of-Concept)

This guide will help you set up and test the SaveMe Gmail AI Assistant proof-of-concept.

## Prerequisites

1. **Google Account** with access to Gmail, Drive, and Sheets
2. **OpenRouter API Key** - Get one free at [openrouter.ai/keys](https://openrouter.ai/keys)
   - Sign up for free
   - Add credits ($5 minimum recommended)
   - Generate an API key

## Setup Instructions

### Step 1: Create a New Google Sheets Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "SaveMe Email Tracker" (or whatever you prefer)
4. Keep this tab open - we'll use it to run the script

### Step 2: Create a Google Drive Folder

1. Go to [drive.google.com](https://drive.google.com)
2. Create a new folder called "SaveMe Attachments" (or whatever you prefer)
3. **Right-click the folder** → Select **"Get link"**
4. Copy the **folder ID** from the URL
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Example: `1a2b3c4d5e6f7g8h9i0j` is the folder ID
5. Keep this ID handy - you'll need it in a moment

### Step 3: Open Apps Script Editor

1. In your Google Sheets spreadsheet, click **Extensions** → **Apps Script**
2. You'll see a new tab with a file called `Code.gs`
3. Delete the default `myFunction()` code in `Code.gs`

### Step 4: Add the Script Files

You need to create 6 files in the Apps Script editor:

#### Create Files

1. **Keep the existing Code.gs** and paste the contents from `/Users/dpm/Documents/repos/SaveMe/Code.gs`

2. **Create Config.gs:**
   - Click the **+** next to Files
   - Choose **Script**
   - Name it `Config`
   - Paste contents from `/Users/dpm/Documents/repos/SaveMe/Config.gs`

3. **Create OpenRouterService.gs:**
   - Click **+** → **Script**
   - Name it `OpenRouterService`
   - Paste contents from `/Users/dpm/Documents/repos/SaveMe/OpenRouterService.gs`

4. **Create GmailProcessor.gs:**
   - Click **+** → **Script**
   - Name it `GmailProcessor`
   - Paste contents from `/Users/dpm/Documents/repos/SaveMe/GmailProcessor.gs`

5. **Create DriveManager.gs:**
   - Click **+** → **Script**
   - Name it `DriveManager`
   - Paste contents from `/Users/dpm/Documents/repos/SaveMe/DriveManager.gs`

6. **Create SheetsManager.gs:**
   - Click **+** → **Script**
   - Name it `SheetsManager`
   - Paste contents from `/Users/dpm/Documents/repos/SaveMe/SheetsManager.gs`

#### Update the Manifest

7. **Update appsscript.json:**
   - Click on **appsscript.json** in the file list (gear icon)
   - Replace its contents with the contents from `/Users/dpm/Documents/repos/SaveMe/appsscript.json`

### Step 5: Save and Authorize

1. Click the **Save** icon (💾) or press `Cmd+S` / `Ctrl+S`
2. Give your project a name: "SaveMe Gmail Assistant"
3. Go back to your **Google Sheets tab**
4. **Refresh the page** (this is important!)
5. You should see a new menu called **"SaveMe"** appear at the top

### Step 6: Authorize Permissions

1. Click **SaveMe** → **Configure Settings**
2. You'll see a permission dialog:
   - Click **Continue**
   - Select your Google account
   - Click **Advanced** → **Go to SaveMe Gmail Assistant (unsafe)**
     - (Don't worry - this is your own script running under your account)
   - Click **Allow**

### Step 7: Configure Settings

1. Click **SaveMe** → **Configure Settings**
2. Enter your **OpenRouter API Key**
3. Click OK
4. Enter your **Google Drive Folder ID** (from Step 2)
5. Click OK
6. You should see "Settings Saved" confirmation

### Step 8: Test the Connection

1. Click **SaveMe** → **Test OpenRouter Connection**
2. Wait a few seconds
3. You should see a success message with a test summary
4. If you get an error, check your API key

### Step 9: Process Your First Email

1. **Make sure you have at least one email with an attachment in your Gmail** (from the last 7 days)
2. Click **SaveMe** → **Process Test Email**
3. Wait 5-10 seconds for processing
4. You should see a success dialog showing:
   - Email subject
   - Number of attachments saved
   - AI-generated summary

### Step 10: Check the Results

1. **In your Google Sheet:**
   - You should see a new row with the email details
   - Column headers: Date, Sender, Subject, AI Summary, Attachments, Drive Links

2. **In your Google Drive folder:**
   - You should see the email attachments saved there
   - Click the Drive links in the spreadsheet to verify

## Troubleshooting

### Error: "No emails with attachments found"
- Send yourself an email with an attachment
- Wait a minute and try again

### Error: "OpenRouter API Error"
- Check that your API key is correct
- Make sure you have credits on your OpenRouter account
- Try the "Test OpenRouter Connection" function

### Error: "Cannot access Drive folder"
- Verify the folder ID is correct
- Make sure you copied just the ID, not the full URL
- Try creating a new folder and using that ID

### Error: "Script timeout"
- Large attachments can take time
- Try with a smaller attachment first

### Nothing happens when I click the menu
- Refresh your Google Sheets page
- Make sure all 6 .gs files are created and saved
- Check the Apps Script console for errors

## What This Proof-of-Concept Does

✅ Fetches the most recent email with attachments from your Gmail
✅ Saves all attachments to your designated Google Drive folder
✅ Generates an AI summary using OpenRouter (Claude 3.5 Sonnet)
✅ Logs everything to a Google Sheet with clickable Drive links
✅ Handles duplicate filenames by adding timestamps

## What's Next?

Once you've verified this works, we can add:
- Automatic processing (scheduled triggers)
- Multiple rules for different email types
- PDF text extraction
- Custom AI questions
- Folder organization templates
- And all the other features in CLAUDE.md!

## Cost Estimate

- **Google Apps Script:** Free
- **Google Drive storage:** Free (up to 15GB)
- **Google Sheets:** Free
- **OpenRouter API:** ~$0.01-0.02 per email with Claude 3.5 Sonnet

Example: 100 emails/month ≈ $1-2/month in AI costs

## Support

If you run into issues:
1. Check the **View** → **Logs** menu in Apps Script
2. Look for error messages
3. Verify all configuration settings
4. Make sure you have the required permissions

---

**Ready to test?** Follow the steps above and process your first email!
