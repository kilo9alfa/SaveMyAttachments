# Quick Deploy with clasp

The fastest way to deploy SaveMe to different email accounts.

## One-Time Setup (5 minutes)

### 1. Install clasp

```bash
npm install -g @google/clasp
```

### 2. Login with your TEST Gmail account

```bash
clasp login
```

This opens a browser window - **sign in with the TEST email account** you want to deploy to.

### 3. Done!

Now you can deploy SaveMe to any account in 30 seconds.

---

## Deploy to New Account (30 seconds)

From the SaveMe repository directory:

```bash
# Navigate to SaveMe repo
cd /Users/dpm/Documents/repos/SaveMe

# Create new Apps Script project (bound to a new Sheet)
clasp create --type sheets --title "SaveMe Email Tracker"

# Push all files to the new project
clasp push

# Open the project in browser
clasp open
```

That's it! The spreadsheet is created and all 13 files are uploaded automatically.

### What happens:

1. `clasp create` - Creates new Google Sheet + Apps Script project in your TEST account
2. `clasp push` - Uploads all `.gs`, `.html`, and `appsscript.json` files
3. `clasp open` - Opens the Sheet in your browser

### Then:

1. Refresh the Google Sheet
2. Click **SaveMe → Configure Settings**
3. Authorize the app
4. Configure and test

---

## Deploy to ANOTHER Account Later

To deploy to a third account:

```bash
# Logout from current account
clasp logout

# Login with the NEW account
clasp login

# Create and push
clasp create --type sheets --title "SaveMe Email Tracker"
clasp push
clasp open
```

---

## What Gets Pushed

clasp automatically finds and pushes:

- All `.gs` files (11 script files)
- All `.html` files (SettingsPanel.html)
- `appsscript.json` (manifest)

**Total: 13 files** - uploaded in 2 seconds!

---

## Troubleshooting

### "clasp: command not found"

**Solution:** Install clasp first:
```bash
npm install -g @google/clasp
```

If you don't have npm:
```bash
# Install Node.js first (includes npm)
# Download from: https://nodejs.org/
```

### "User has not enabled the Apps Script API"

**Solution:** Enable it at https://script.google.com/home/usersettings

### Already have a .clasp.json file

**Solution:** Delete it first, or create in a new folder:
```bash
rm .clasp.json
clasp create --type sheets --title "SaveMe Email Tracker"
clasp push
```

---

## Time Comparison

| Method | First Time | Subsequent Deploys |
|--------|------------|-------------------|
| **clasp** | 5 min setup + 30 sec deploy | 30 seconds |
| **Manual copy-paste** | 15 minutes | 15 minutes each time |

**Recommendation:** If you plan to deploy to 2+ accounts, use clasp. It's worth the 5-minute setup.

---

## Manual Alternative

If you don't want to use clasp, see: **MANUAL_COPY_HELPER.md**
