# Google Cloud Project & OAuth Setup Guide

This guide walks you through setting up the Google Cloud Project and OAuth consent screen required for publishing SaveMyAttachments on Google Workspace Marketplace.

**Timeline:** 2-6 weeks for OAuth verification (after setup)
**Cost:** Free (Apps Script & OAuth are free)

---

## 🔄 Current Session Status (2025-11-08)

**Development Account:** dp@databeacon.aero (will transfer to david@thecoralblock.com later)

**Completed:**
- ✅ Created Google Cloud Project
  - Project ID: `savemyattachments`
  - Project Number: (recorded in session)
- ✅ Enabled required APIs
  - Gmail API ✓
  - Google Drive API ✓
  - Google Sheets API ✓
- ✅ OAuth Consent Screen - App Information section
  - App name: SaveMyAttachments
  - User support email: dp@databeacon.aero
  - Home page: https://thecoralblock.pages.dev
  - Privacy policy: https://thecoralblock.pages.dev/docs/privacy-policy.html
  - Terms of service: https://thecoralblock.pages.dev/docs/terms-of-service.html
  - Authorized domains: thecoralblock.pages.dev, thecoralblock.com
- ✅ OAuth Consent Screen - Branding section (saved, logo skipped for now)

**Currently Working On:**
- 🔄 OAuth Consent Screen - Scopes section
  - **Issue:** After completing Branding section, need to navigate to Scopes page
  - **Next step:** Click "SAVE AND CONTINUE" at bottom of Branding page, OR navigate via "EDIT APP" → Step 2: Scopes
  - **Goal:** Add 5 required scopes (gmail.readonly, gmail.modify, drive.file, spreadsheets, script.external_request)

**Still To Do:**
- ⏳ OAuth Consent Screen - Test Users section
- ⏳ OAuth Consent Screen - Summary & save
- ⏳ Link Apps Script project to Cloud Project (need Project Number)
- ⏳ Update appsscript.json manifest
- ⏳ Test OAuth flow
- ⏳ Wait for domain transfer (thecoralblock.com pending, 3-7 days)
- ⏳ Transfer ownership to david@thecoralblock.com (after email ready)
- ⏳ Update OAuth Consent Screen with custom domain email
- ⏳ Prepare OAuth verification materials (video, documentation)
- ⏳ Submit for OAuth verification

**Parallel Pending Tasks:**
- ⏳ Domain transfer: thecoralblock.com (Squarespace → Cloudflare) - 3-7 days
- ⏳ Add custom domain to Cloudflare Pages (after transfer completes)
- ⏳ Configure iCloud+ custom email for thecoralblock.com (after transfer)
- ⏳ Create email addresses: david@, support@, privacy@

---

## Overview

To publish SaveMyAttachments on Google Workspace Marketplace, you need:

1. ✅ Google Cloud Project
2. ✅ Enabled APIs (Gmail, Drive, Sheets)
3. ✅ OAuth Consent Screen configured
4. ✅ OAuth Verification approved by Google
5. ✅ Apps Script project linked to Cloud Project

---

## Part 1: Create Google Cloud Project

### Step 1.1: Go to Google Cloud Console

Open: https://console.cloud.google.com

**Sign in:** Use your Google account (the one you'll use for development)

### Step 1.2: Create New Project

1. Click **Select a project** (top left, near "Google Cloud")
2. Click **NEW PROJECT** (top right)
3. Fill in details:
   - **Project name:** `SaveMyAttachments` or `The Coral Block`
   - **Organization:** None (or your organization if you have one)
   - **Location:** No organization
4. Click **CREATE**

**Wait:** Project creation takes ~30 seconds

### Step 1.3: Note Your Project ID

Once created, you'll see:
- **Project name:** SaveMyAttachments
- **Project ID:** savemyattachments-xxxxx (auto-generated)
- **Project number:** 123456789012

**📝 Save the Project ID** - you'll need it later

---

## Part 2: Enable Required APIs

### Step 2.1: Navigate to APIs & Services

1. In left sidebar, click **APIs & Services** → **Library**
2. Or use search: "API Library"

### Step 2.2: Enable Gmail API

1. Search for: `Gmail API`
2. Click **Gmail API** from results
3. Click **ENABLE**
4. Wait for activation (~10 seconds)

### Step 2.3: Enable Google Drive API

1. Click **← Back** or search again
2. Search for: `Google Drive API`
3. Click **Google Drive API** from results
4. Click **ENABLE**

### Step 2.4: Enable Google Sheets API

1. Search for: `Google Sheets API`
2. Click **Google Sheets API** from results
3. Click **ENABLE**

### Step 2.5: Verify APIs are Enabled

1. Go to **APIs & Services** → **Enabled APIs & services**
2. You should see:
   - ✅ Gmail API
   - ✅ Google Drive API
   - ✅ Google Sheets API

---

## Part 3: Configure OAuth Consent Screen

This is **the most important part** for marketplace publishing.

### Step 3.1: Navigate to OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Or search: "OAuth consent screen"

### Step 3.2: Choose User Type

**Select:** **External**

**Why?**
- Internal is only for Google Workspace organizations
- External allows anyone with Google account to install
- Required for Marketplace publishing

Click **CREATE**

### Step 3.3: App Information

Fill in the form:

#### App name
```
SaveMyAttachments
```

#### User support email
```
support@thecoralblock.com
```

**Note:** You can use `.pages.dev` email for now, update later when custom domain email is ready

**Temporary workaround:** Use your personal Gmail for now, update once you have support@thecoralblock.com

#### App logo (optional for now)
- Skip for now
- Add later (128x128 pixel PNG)

#### Application home page
```
https://thecoralblock.pages.dev
```

**Update later:** Change to `https://thecoralblock.com` once domain transfer completes

#### Application privacy policy link
```
https://thecoralblock.pages.dev/docs/privacy-policy.html
```

**Update later:** Change to `https://thecoralblock.com/docs/privacy-policy.html`

#### Application terms of service link
```
https://thecoralblock.pages.dev/docs/terms-of-service.html
```

**Update later:** Change to `https://thecoralblock.com/docs/terms-of-service.html`

#### Authorized domains

Add these domains (one per line):
```
thecoralblock.pages.dev
thecoralblock.com
```

**Note:** Add both now so you can switch later without re-verification

Click **SAVE AND CONTINUE**

### Step 3.4: Scopes

This section defines what permissions your app needs.

Click **ADD OR REMOVE SCOPES**

#### Required Scopes for SaveMyAttachments

Search for and add these scopes:

**Gmail Scopes:**
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.modify
```

**Justification:**
- `gmail.readonly`: Read email content for processing and AI summarization
- `gmail.modify`: Add labels to mark processed emails (optional feature)

**Drive Scopes:**
```
https://www.googleapis.com/auth/drive.file
```

**Justification:**
- `drive.file`: Save email attachments and email PDFs to user's Google Drive

**Sheets Scopes:**
```
https://www.googleapis.com/auth/spreadsheets
```

**Justification:**
- `spreadsheets`: Create and update rows in user's spreadsheet with email metadata and summaries

**Additional Required Scope:**
```
https://www.googleapis.com/auth/script.external_request
```

**Justification:**
- `script.external_request`: Make API calls to OpenRouter.ai for AI-powered email summaries using user's API key

#### Add Scopes

1. Search for each scope above
2. Check the checkbox
3. Click **UPDATE** at bottom

You should now see all 5 scopes listed.

Click **SAVE AND CONTINUE**

### Step 3.5: Test Users (Optional for Development)

During development, you can add test users:

**Add your Google account:**
```
your-email@gmail.com
```

This allows you to test before publishing.

Click **SAVE AND CONTINUE**

### Step 3.6: Summary

Review all information:
- ✅ App name: SaveMyAttachments
- ✅ Support email: (your email)
- ✅ Privacy policy: thecoralblock.pages.dev link
- ✅ Terms of service: thecoralblock.pages.dev link
- ✅ Scopes: 5 scopes added

Click **BACK TO DASHBOARD**

---

## Part 4: Link Apps Script Project to Cloud Project

### Step 4.1: Get Your Project Number

1. In Google Cloud Console, go to **Dashboard**
2. Find **Project number** (e.g., 123456789012)
3. **Copy this number**

### Step 4.2: Open Your Apps Script Project

1. Go to: https://script.google.com
2. Open your SaveMyAttachments project
3. Or open the Google Sheet and go to **Extensions** → **Apps Script**

### Step 4.3: Link to Cloud Project

1. In Apps Script editor, click ⚙️ **Project Settings** (left sidebar)
2. Scroll to **Google Cloud Platform (GCP) Project**
3. Click **Change project**
4. Paste your **Project number** from Step 4.1
5. Click **Set project**

### Step 4.4: Verify Link

You should see:
- ✅ Project number: 123456789012
- ✅ Status: Linked

---

## Part 5: Update appsscript.json Manifest

### Step 5.1: Open Manifest

In Apps Script editor:
1. Click **Project Settings** (⚙️)
2. Check ✅ **Show "appsscript.json" manifest file in editor**
3. Go back to **Editor**
4. Open **appsscript.json** file

### Step 5.2: Update OAuth Scopes

Make sure your `appsscript.json` includes all required scopes:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "webapp": {
    "access": "MYSELF",
    "executeAs": "USER_DEPLOYING"
  }
}
```

### Step 5.3: Save Changes

1. Click **Save** (💾 icon)
2. Apps Script automatically updates permissions

---

## Part 6: Prepare OAuth Verification

Google requires OAuth verification for apps using sensitive/restricted scopes (like Gmail).

### Step 6.1: What Google Needs

**Required materials:**

1. **Video demonstration** (~2-5 minutes)
   - Show app functionality
   - Demonstrate why each scope is needed
   - Show user consent flow

2. **Written explanation**
   - Describe app purpose
   - Justify each scope
   - Explain data handling

3. **Privacy policy** (✅ Already done!)
   - https://thecoralblock.pages.dev/docs/privacy-policy.html

4. **Terms of service** (✅ Already done!)
   - https://thecoralblock.pages.dev/docs/terms-of-service.html

5. **App homepage** (✅ Already done!)
   - https://thecoralblock.pages.dev

### Step 6.2: Scope Justifications

**Prepare answers for each scope:**

#### Gmail Read (gmail.readonly)
**Why needed:**
```
SaveMyAttachments reads email content to:
1. Extract email metadata (sender, date, subject)
2. Generate AI-powered summaries using OpenRouter
3. Save attachments to Google Drive
4. Log email data to Google Sheets

Without this scope, the app cannot access email content for processing.
```

#### Gmail Modify (gmail.modify)
**Why needed:**
```
SaveMyAttachments adds labels to processed emails to:
1. Mark emails as processed (avoid duplicates)
2. Provide visual tracking in Gmail inbox
3. Allow users to filter processed emails

This is optional functionality and can be disabled by users.
```

#### Drive File (drive.file)
**Why needed:**
```
SaveMyAttachments saves files to Google Drive:
1. Email attachments (PDFs, images, documents)
2. Email content as PDF/HTML/plain text

We use drive.file (not full Drive access) which only allows:
- Creating new files
- Accessing files created by this app

We cannot access user's existing Drive files.
```

#### Spreadsheets
**Why needed:**
```
SaveMyAttachments creates organized logs in Google Sheets:
1. Email metadata (date, sender, subject)
2. AI-generated summaries
3. Links to saved attachments in Drive

This creates a searchable database of processed emails.
```

#### External Request (script.external_request)
**Why needed:**
```
SaveMyAttachments makes API calls to OpenRouter.ai:
1. User brings their own OpenRouter API key
2. Email content sent to OpenRouter for AI summarization
3. User controls which AI model to use (200+ options)

This external API call is essential for AI functionality.
Privacy: Email content goes directly from user's environment to
user's OpenRouter account. We never see the data.
```

### Step 6.3: Create Verification Document

Create a document (Google Doc or PDF) with:

1. **App Overview**
   - What SaveMyAttachments does
   - Target users (Gmail users who want AI-powered email organization)
   - Key features

2. **Scope Justifications** (use text above)

3. **Data Handling**
   - Email content: Processed locally, sent to user's OpenRouter account
   - Attachments: Saved to user's Google Drive
   - API keys: Stored in Google PropertiesService (encrypted)
   - No data stored on our servers

4. **User Control**
   - Users bring their own API keys
   - Users choose which emails to process
   - Users can disable features
   - Users own all their data

Save this document - you'll upload it during verification.

---

## Part 7: Submit OAuth Verification Request

**Don't do this yet!** We'll submit once:
- ✅ Domain transfer complete (use custom domain URLs)
- ✅ Email setup complete (use support@thecoralblock.com)
- ✅ Video demonstration recorded
- ✅ All materials prepared

### Step 7.1: When Ready to Submit

1. Go to Google Cloud Console
2. **APIs & Services** → **OAuth consent screen**
3. Click **SUBMIT FOR VERIFICATION** button
4. Upload verification materials:
   - Video demonstration
   - Written justifications
   - Any additional documentation

### Step 7.2: Wait for Google Review

**Timeline:** 2-6 weeks (sometimes faster)

**Google will:**
- Review your app
- Test functionality
- Verify scope usage
- Check privacy policy/terms
- May ask questions (respond promptly!)

**Once approved:**
- ✅ App can be published to Marketplace
- ✅ Users can install without warning screens
- ✅ No "unverified app" warnings

---

## Current Status & Next Steps

### ✅ What We Can Do Now

1. **Create Google Cloud Project** ← Start here
2. **Enable APIs**
3. **Configure OAuth Consent Screen** (use `.pages.dev` URLs for now)
4. **Link Apps Script project**
5. **Test with your own account**

### ⏳ What We'll Do Later (After Domain Transfer)

1. **Update OAuth consent screen URLs** (change to `thecoralblock.com`)
2. **Update support email** (change to `support@thecoralblock.com`)
3. **Record video demonstration**
4. **Submit OAuth verification**

---

## Checklist

**Part 1: Google Cloud Project**
- [ ] Create new project
- [ ] Note project ID
- [ ] Note project number

**Part 2: Enable APIs**
- [ ] Enable Gmail API
- [ ] Enable Google Drive API
- [ ] Enable Google Sheets API

**Part 3: OAuth Consent Screen**
- [ ] Select External user type
- [ ] Fill in app information
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Add 5 required scopes
- [ ] Save configuration

**Part 4: Link Apps Script**
- [ ] Get Cloud Project number
- [ ] Link in Apps Script settings
- [ ] Verify link successful

**Part 5: Update Manifest**
- [ ] Show appsscript.json in editor
- [ ] Add all OAuth scopes
- [ ] Save changes

**Part 6: Prepare Verification**
- [ ] Draft scope justifications
- [ ] Create verification document
- [ ] Prepare data handling explanation

**Part 7: Submit (Later)**
- [ ] Record video demo
- [ ] Update URLs to custom domain
- [ ] Update support email
- [ ] Submit for verification

---

**Ready to start?** Let's begin with **Part 1: Create Google Cloud Project**!
