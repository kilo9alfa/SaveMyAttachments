# SaveMe Deployment Guide

## How to Use SaveMe with Different Email Addresses

SaveMe is a Google Apps Script project that runs independently for each Google account. Here's how to deploy it for different email addresses.

---

## 🎯 Important Concepts

### Apps Script is Per-Account
- Each Gmail user needs their **own copy** of the SaveMe Apps Script project
- The script runs **in the user's Google account** (their Gmail, Drive, Sheets)
- Settings are stored per-account (API keys, folder IDs, etc.)

### You Cannot Share a Single Instance
- Apps Script projects are tied to the creating account
- To use SaveMe with multiple email addresses, you need **multiple deployments**

---

## 📦 Deployment Methods

### Method 1: Manual Copy (Recommended for Testing)

**Best for:** Testing with your own alternate Gmail accounts

**Steps:**

1. **Sign in to the target Gmail account** (the one you want to process emails for)

2. **Open Google Sheets**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new blank spreadsheet
   - Name it "SaveMe Email Tracker" (or any name)

3. **Open Apps Script Editor**
   - In the spreadsheet, go to **Extensions → Apps Script**
   - Delete the default `Code.gs` file content

4. **Copy All SaveMe Files**

   **Core Files (Required):**
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

   **How to add files:**
   - Click **+ (Plus icon)** next to "Files" in Apps Script editor
   - Select "Script" for `.gs` files
   - Select "HTML" for `.html` files
   - Copy/paste content from your source files
   - For `appsscript.json`: Click ⚙️ Project Settings → Check "Show appsscript.json manifest file"

5. **Refresh the Spreadsheet**
   - Close and reopen the Google Sheet
   - You should see **SaveMe** menu appear
   - First time: Authorize the script (review permissions)

6. **Configure Settings**
   - Go to **SaveMe → Configure Settings**
   - Set up Drive folder, API key (if using AI), etc.
   - Save configuration

7. **Test**
   - Run **SaveMe → Process Test Email**
   - Verify it processes from the correct Gmail account

---

### Method 2: Google Apps Script Library (For Multiple Users)

**Best for:** Sharing with team members or other users

**Steps:**

1. **Deploy Your Script as a Library**

   In your Apps Script editor:
   - Click **Deploy → New deployment**
   - Choose **Library**
   - Set version, description
   - Copy the **Script ID**

2. **Users Add the Library**

   Each user:
   - Creates their own Google Sheet
   - Opens Apps Script editor
   - Goes to **Libraries +**
   - Pastes your Script ID
   - Adds the library

   **Note:** This method is complex and requires additional wrapper code. Not recommended for most users.

---

### Method 3: GitHub + clasp (For Developers)

**Best for:** Managing code across multiple deployments

**What is clasp?**
- Command-line tool for Apps Script
- Allows you to `push` code from local files to Apps Script projects
- Great for version control and multiple deployments

**Setup:**

1. **Install clasp**
   ```bash
   npm install -g @google/clasp
   ```

2. **Login to Google Account**
   ```bash
   clasp login
   ```

3. **Clone Your Apps Script Project**
   ```bash
   clasp clone <SCRIPT_ID>
   ```

4. **Deploy to Different Account**

   For each new email address:

   a. **Login to the target account**
      ```bash
      clasp login --creds ~/path/to/credentials.json
      ```

   b. **Create a new Apps Script project**
      ```bash
      clasp create --type sheets --title "SaveMe Email Tracker"
      ```

   c. **Push your code**
      ```bash
      clasp push
      ```

   d. **Open the project**
      ```bash
      clasp open
      ```

   e. **Bind to a spreadsheet** (if needed)
      - In Apps Script editor: **Project Settings**
      - Link to existing Google Sheet

**Benefits:**
- ✅ Manage code in one place (GitHub)
- ✅ Push updates to multiple deployments
- ✅ Version control with git
- ✅ Automated deployment possible

**Drawbacks:**
- ❌ Requires technical knowledge
- ❌ Each user still needs their own project
- ❌ Configuration must be set per-deployment

---

## 🔐 Security & Privacy

### Data Isolation
- Each deployment is **completely independent**
- User A's settings, emails, and data are **NOT** accessible to User B
- Each user controls their own:
  - Gmail access
  - Drive storage
  - OpenRouter API key
  - Google Sheets data

### OAuth Permissions
Each user must authorize SaveMe to access:
- Gmail (read emails)
- Google Drive (save files)
- Google Sheets (log data)
- External API requests (OpenRouter)

### API Keys
- **Never share your OpenRouter API key**
- Each user should use their own API key
- API keys are stored in PropertiesService (encrypted by Google)

---

## 📝 Configuration for Each Deployment

When setting up SaveMe for a new email address, each user needs to configure:

### Required Settings
1. **Google Drive Folder**
   - Create a dedicated folder in their Drive
   - Copy the folder URL/ID

2. **OpenRouter API Key** (if using AI)
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Generate API key
   - Enter in SaveMe settings

### Optional Settings
- Batch size
- AI model selection
- AI prompt customization
- File naming templates
- File extension filtering
- Processing schedule
- Date range

---

## 🚀 Testing with Different Email Address

### Quick Test Process

1. **Open Incognito/Private Browser Window**
   - This keeps sessions separate

2. **Sign in to Test Email Account**
   - Go to [gmail.com](https://gmail.com)
   - Sign in with the target email address

3. **Create New Google Sheet**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create blank spreadsheet

4. **Copy SaveMe Code**
   - Follow "Method 1: Manual Copy" steps above

5. **Send Test Email to This Account**
   - From another account, send email with attachment

6. **Run SaveMe**
   - Configure settings
   - Process test email
   - Verify it works with the test account's Gmail

---

## 🎁 Packaging for Distribution

### If You Want to Share SaveMe with Others

#### Option A: Share GitHub Repository

**Steps:**
1. Users clone/download from GitHub
2. Users manually copy files to their Apps Script project
3. Users configure their own settings

**Provide:**
- README with setup instructions
- List of required files
- Configuration guide

#### Option B: Google Workspace Marketplace (Future)

**For commercial distribution:**
- Submit to Google Workspace Marketplace
- Users install with one click
- Requires OAuth verification
- Pricing/licensing options available

**Requirements:**
- Complete OAuth verification process
- Privacy policy and terms of service
- Support infrastructure
- App icon and screenshots

See `IMPLEMENTATION_PLAN.md` for marketplace publishing details.

#### Option C: Template Spreadsheet

**Create a template:**
1. Set up SaveMe in a Google Sheet
2. Share the sheet as "Template"
3. Users make a copy: **File → Make a copy**
4. Users configure their own settings

**Limitations:**
- Users get a copy of your code (not updates)
- Each user must still authorize
- Configuration not preserved (each user configures fresh)

**How to create:**
```
1. Set up SaveMe in a clean Google Sheet
2. File → Share → Get link
3. Change permissions: "Anyone with the link can view"
4. Share URL with users
5. Users: File → Make a copy
```

---

## 📊 Multiple Email Addresses - Same Person

### If YOU want to use SaveMe with multiple Gmail accounts you own:

**Best Approach:**
1. Keep **separate Google Sheets** for each email account
2. Deploy SaveMe in each sheet (separate Apps Script projects)
3. Each deployment connects to its respective Gmail

**Why Separate?**
- Apps Script can only access the Gmail of the authenticated user
- Cannot cross-authenticate to different Gmail accounts
- Clean separation of data

**Alternative (Advanced):**
- Use Gmail forwarding/filters to route all emails to one account
- Process everything in single SaveMe instance
- Not recommended (loses account separation)

---

## 🔧 Troubleshooting Different Deployments

### "Cannot access Gmail"
- Check which Google account is signed in
- Apps Script uses the account that owns the Sheet
- Sign out and sign back in to correct account

### "Settings not saving"
- PropertiesService is per-project
- Each deployment has independent settings
- Reconfigure for each new deployment

### "Emails not processing"
- Verify Gmail filter syntax for that account
- Check if emails exist in that specific Gmail
- Run diagnostics: **SaveMe → Info & Monitoring → View Diagnostics**

---

## 📚 Additional Resources

- **Apps Script Documentation:** https://developers.google.com/apps-script
- **clasp Documentation:** https://github.com/google/clasp
- **SaveMe Setup Guide:** `SETUP.md`
- **SaveMe Implementation Plan:** `IMPLEMENTATION_PLAN.md`

---

## ✅ Quick Deployment Checklist

For each new email address:

- [ ] Sign in to target Gmail account
- [ ] Create new Google Sheet
- [ ] Open Apps Script editor
- [ ] Copy all SaveMe files (13 files total)
- [ ] Update appsscript.json with correct permissions
- [ ] Refresh spreadsheet
- [ ] Authorize SaveMe (grant permissions)
- [ ] Create Drive folder for attachments
- [ ] Get OpenRouter API key (if using AI)
- [ ] Configure settings (SaveMe → Configure Settings)
- [ ] Test with sample email (SaveMe → Process Test Email)
- [ ] Set up automation (optional)

**Time estimate:** 10-15 minutes per deployment

---

## 💡 Pro Tips

1. **Use consistent folder structure** across deployments
   - Makes troubleshooting easier
   - Same file naming templates

2. **Document your settings** for each deployment
   - Keep a text file with configuration values
   - Easy to replicate settings

3. **Test thoroughly** before enabling automation
   - Process 5-10 emails manually first
   - Verify AI summaries quality
   - Check Drive file organization

4. **Set up separate OpenRouter accounts** for cost tracking
   - If managing multiple users
   - Each user gets their own bill/usage stats

5. **Version control your code**
   - Keep master copy in GitHub
   - Easy to deploy updates to all instances

---

**Last Updated:** 2025-01-05
**Version:** 1.0.0
