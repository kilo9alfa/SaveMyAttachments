# Transfer Apps Script Project Ownership to support@thecoralblock.com

## Current Situation

- **Apps Script Project ID:** `13Z1zjTT1AE5wmk-6UP8tqblgcBWEqYTViQ-M7I4A0Z5u_DYVJs4NMo-i`
- **Current Owner:** Unknown (likely dp@databeacon.aero or another account)
- **Desired Owner:** support@thecoralblock.com
- **Status:** Previously submitted to Google Workspace Marketplace

## Steps to Transfer Ownership

### Option 1: Add support@thecoralblock.com as Editor (Recommended)

1. **Open the Apps Script project** with the current owner account:
   - Go to: https://script.google.com/d/13Z1zjTT1AE5wmk-6UP8tqblgcBWEqYTViQ-M7I4A0Z5u_DYVJs4NMo-i/edit

2. **Click the Share button** (top right, person icon)

3. **Add support@thecoralblock.com** as Editor:
   - Enter: support@thecoralblock.com
   - Set role: **Editor**
   - Click Send

4. **Verify access** by logging in as support@thecoralblock.com and accessing the project

### Option 2: Transfer Google Cloud Project Ownership

Since this project is linked to Google Cloud Project (savemyattachments), you should also transfer that:

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com/iam-admin/iam?project=savemyattachments

2. **Add support@thecoralblock.com as Owner:**
   - Click **Grant Access**
   - Enter: support@thecoralblock.com
   - Select role: **Owner**
   - Click Save

3. **Remove old owner** (after verifying support@ has access):
   - Find the old owner email
   - Click the pencil icon → Delete

## After Transfer Complete

Once support@thecoralblock.com has access:

1. **Update .clasp.json** to use the correct script ID
2. **Login with clasp** as support@thecoralblock.com
3. **Push the add-on manifest updates** we just created
4. **Deploy as add-on** for marketplace

## Testing with testingsavemyattachments@gmail.com

After the project is owned by support@thecoralblock.com:

1. **Install as test user:**
   - In Apps Script project, click **Deploy → Test deployments**
   - Click **Install**
   - Login as testingsavemyattachments@gmail.com
   - Grant permissions

2. **Open any Google Sheet** with testingsavemyattachments@gmail.com
   - The SaveMyAttachments menu should appear
   - Click **Extensions → SaveMyAttachments** to see the add-on card

## Current Updates Ready to Push

We've added proper Workspace Add-on manifest to `appsscript.json`:
- Add-on name and branding
- Homepage trigger (onHomepage function)
- Menu registration (onOpen function)
- Proper OAuth scopes for Marketplace

Once you have access as support@thecoralblock.com, run:
```bash
clasp push
```

This will update the Marketplace-submitted project with the new add-on structure.
