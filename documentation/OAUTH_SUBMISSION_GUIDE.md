# OAuth Verification Submission Guide

**App Name:** SaveMyAttachments
**Cloud Project:** savemyattachments (811650947375)
**Developer:** dp@databeacon.aero
**Estimated Review Time:** 2-6 weeks

---

## Prerequisites Checklist

Before submitting, ensure you have:

- [x] ✅ OAuth Consent Screen fully configured
- [x] ✅ All 5 scopes added and tested
- [x] ✅ Apps Script project linked to Cloud Project
- [x] ✅ Test users added (dp@databeacon.aero)
- [x] ✅ Privacy Policy published at https://thecoralblock.pages.dev/privacy
- [x] ✅ Terms of Service published at https://thecoralblock.pages.dev/terms
- [x] ✅ App domain configured (thecoralblock.pages.dev)
- [ ] 📹 Video demonstration recorded (optional but highly recommended)
- [ ] 📝 Written justifications prepared (see OAUTH_VERIFICATION_JUSTIFICATIONS.md)

---

## Step-by-Step Submission Process

### Step 1: Access the OAuth Consent Screen

1. Go to Google Cloud Console:
   https://console.cloud.google.com/apis/credentials/consent?project=811650947375

2. Sign in with **dp@databeacon.aero**

3. Verify you're in the **savemyattachments** project (check top bar)

### Step 2: Prepare for Verification

1. Click the **"PREPARE FOR VERIFICATION"** button (if available)
   - OR look for **"SUBMIT FOR VERIFICATION"** button
   - OR look for **"Publish App"** → "Prepare for verification"

2. You'll see a form with several sections to complete

### Step 3: Complete the Verification Form

#### Section 1: App Information

**OAuth Client Type:**
- Select: **"Web application"** or **"Apps Script"**

**Application Homepage:**
```
https://thecoralblock.pages.dev
```

**Privacy Policy URL:**
```
https://thecoralblock.pages.dev/privacy
```

**Terms of Service URL:**
```
https://thecoralblock.pages.dev/terms
```

**Application Logo:**
- Upload your app logo (128x128 pixels minimum)
- If you don't have one yet, you can create a simple text logo or use a placeholder

#### Section 2: Authorized Domains

**Add these domains:**
```
thecoralblock.pages.dev
```

(After domain transfer completes, you can update to `thecoralblock.com`)

#### Section 3: Developer Contact Information

**Email address:**
```
dp@databeacon.aero
```

**Phone number (optional):**
- Add if you have one, otherwise leave blank

#### Section 4: App Description

**Short Description (60 characters max):**
```
Automated Gmail backup to Drive with AI summaries
```

**Long Description (detailed explanation):**
```
SaveMyAttachments is a Google Workspace Add-on that helps users automatically back up their Gmail emails and attachments to Google Drive with AI-powered summaries and organized folder structures.

KEY FEATURES:
• Automated email and attachment backup to Google Drive
• AI-generated email summaries using user's own OpenRouter API key
• Searchable Google Sheets index with metadata and Drive links
• Customizable organization (folders by date, sender, label, etc.)
• Multiple workflow rules for different email types
• Support for 200+ AI models (GPT-4, Claude, Gemini, Llama, etc.)
• Gmail labels for processed email tracking
• Full user control over data and AI costs

HOW IT WORKS:
1. Users configure Gmail search filters (e.g., "from:client@company.com has:attachment")
2. App reads matching emails and extracts attachments
3. Emails are converted to PDF/HTML/TXT and saved to user's Drive folder
4. AI generates concise summaries via user's OpenRouter API key
5. Metadata and Drive links are added to user's Google Sheet
6. Gmail labels track which emails have been processed

DATA PRIVACY:
• All processing happens within the user's Google account
• Email content sent to AI only via user's own API key
• No data stored on our servers
• Users maintain full control over their data
• Open source code available for transparency

TARGET USERS:
• Individuals who want automated email backups
• Businesses needing email archiving for compliance
• Teams collaborating on shared email archives
• Anyone wanting searchable email history with AI insights
```

**YouTube Video Link (demo):**
```
[Upload your demo video to YouTube as unlisted and paste URL here]
OR
[Upload to Google Drive with link sharing enabled and paste URL here]
```

If you haven't recorded the video yet, you can leave this blank initially, but Google may request it.

#### Section 5: Scope Justifications

For **each of the 5 scopes**, you'll need to provide detailed justifications. Use the text from `OAUTH_VERIFICATION_JUSTIFICATIONS.md`.

**Scope 1: `https://www.googleapis.com/auth/gmail.readonly`**

Paste this:
```
SaveMyAttachments reads Gmail messages to back up emails and attachments to Google Drive. Users configure search filters (e.g., "from:client@company.com has:attachment") and our app reads matching emails to extract metadata (sender, date, subject), email body content (for AI summarization), and attachments for backup.

API calls used:
- GmailApp.search() - Find emails matching user's filter
- GmailApp.getMessageById() - Retrieve message details
- message.getFrom(), message.getSubject(), message.getDate() - Extract metadata
- message.getPlainBody(), message.getBody() - Get content for AI processing
- message.getAttachments() - Retrieve attachments for Drive backup

User benefit: Automated backup of important emails and attachments with AI summaries for easy searching.

Privacy: Email content processed only via user's own OpenRouter API key. No data stored on our servers.
```

**Scope 2: `https://www.googleapis.com/auth/gmail.modify`**

Paste this:
```
SaveMyAttachments applies Gmail labels to processed emails to prevent duplicate processing and provide visual tracking in Gmail inbox.

API calls used:
- GmailApp.getUserLabelByName() - Get or create "SaveMe/Processed" label
- GmailApp.createLabel() - Create label if doesn't exist
- thread.addLabel() or message.addLabel() - Apply label to processed emails

User benefit: Visual tracking of which emails have been backed up. Prevents duplicate processing.

Privacy: We only add labels for tracking. We never modify, delete, or move email messages.
```

**Scope 3: `https://www.googleapis.com/auth/drive`**

Paste this:
```
SaveMyAttachments saves email files (PDF/HTML/TXT) and attachments to user-specified Google Drive folders with organized subfolder structures.

API calls used:
- DriveApp.getFolderById() - Access user's specified backup folder
- folder.createFolder() - Create organized subfolders (e.g., "2024/11/Client/")
- folder.createFile() - Upload email PDFs and attachments
- file.getUrl() - Get Drive links for Sheets index
- DriveApp.getFilesByName() - Check for duplicate filenames

User benefit: Organized, searchable backups in Drive with automatic folder organization and custom file naming.

Why full drive scope: We need to access existing folders that users specify for backup destinations. The drive.file scope only allows access to files created by our app, but users want to specify their own existing Drive folders (personal or Shared Drives).

Privacy: We only access folders users configure for backups. We create files but never read, modify, or delete existing Drive files.
```

**Scope 4: `https://www.googleapis.com/auth/spreadsheets`**

Paste this:
```
SaveMyAttachments creates a searchable index in Google Sheets with metadata about each processed email (date, sender, subject, AI summary, attachment count, Drive links).

API calls used:
- SpreadsheetApp.openById() - Open user's specified Sheet
- sheet.getLastRow() - Check if headers exist
- sheet.appendRow() - Add new row for each processed email
- sheet.getRange().setNumberFormat() - Format date columns
- sheet.getRange().setFontWeight() - Bold header row

User benefit: Searchable database of all backed-up emails with AI summaries and Drive links. Users can filter, sort, and search to quickly find emails.

Privacy: We only write to the Sheet the user specifies. We never read, modify, or delete other Sheets.
```

**Scope 5: `https://www.googleapis.com/auth/script.external_request`**

Paste this:
```
SaveMyAttachments calls the OpenRouter API to generate AI summaries of emails. Users provide their own OpenRouter API key and choose from 200+ AI models.

API calls used:
- UrlFetchApp.fetch('https://openrouter.ai/api/v1/chat/completions') - Call OpenRouter API
- Send email content + custom prompt to AI model
- Receive summary text (e.g., "Invoice #1234 due Nov 30 - $500")

User benefit: Intelligent, concise summaries of each email automatically added to Sheets index. Makes it easy to understand email content at a glance.

Privacy: Users provide their own OpenRouter API key - they control which AI provider processes their data. Email content goes directly from user's Google account → OpenRouter (via user's API key) → back to user's Google account. We never receive, store, or process email content on our servers.

Why OpenRouter: Unified API gateway giving users choice of 200+ models with transparent pricing. Users maintain full control over AI costs and data processing.
```

#### Section 6: Security Assessment Questionnaire

Google will ask questions like:

**Q: Does your app store user data?**
```
No. SaveMyAttachments does not store any user data on our servers. All email processing happens within the user's Google account. Backups are saved to the user's own Google Drive, and the index is written to the user's own Google Sheets. The only data stored is the user's configuration (API key, folder URLs, search filters) which is stored securely in Google's PropertiesService within the user's Apps Script project.
```

**Q: Does your app share user data with third parties?**
```
Email content is sent to OpenRouter.ai for AI summarization, but only via the user's own API key. The user controls which AI provider (via OpenRouter's 200+ model options) processes their email content. We (the app developers) never receive, transmit through our servers, or access user email content. Users can review OpenRouter's privacy policy at openrouter.ai.
```

**Q: What data does your app collect?**
```
We collect minimal configuration data:
- User's OpenRouter API key (encrypted in PropertiesService)
- Gmail search filter preferences
- Google Drive folder URL for backups
- Google Sheet URL for index
- Processed email IDs for duplicate prevention (stored locally in user's PropertiesService)

We do NOT collect:
- Email content
- Attachments
- Email metadata beyond what's needed for immediate processing
- User behavior or analytics
```

**Q: How do you secure user data?**
```
Security measures:
1. API keys stored in Google PropertiesService (encrypted by Google)
2. No server-side storage - all data remains in user's Google account
3. Minimal permissions - only access what user configures
4. Error handling to prevent data exposure in logs
5. Open source code for transparency and security audits
6. No background data collection
```

**Q: Do you have a privacy policy?**
```
Yes. Privacy Policy: https://thecoralblock.pages.dev/privacy
Terms of Service: https://thecoralblock.pages.dev/terms
```

**Q: Is your app open source?**
```
Yes. The code is available on GitHub for transparency and security audits. (You can add GitHub URL when you publish the repo)
```

#### Section 7: Verification Artifacts

**Demo Video:**
- Upload your video to YouTube (unlisted) or Google Drive
- Paste the shareable link

**Screenshots:**
- OAuth consent screen
- App settings panel
- Example of processed emails in Drive
- Example of Sheets index with AI summaries
- Gmail with labels applied

**Additional Documentation (optional):**
- Link to your user manual: Add MANUAL.md to your website

### Step 4: Review and Submit

1. **Review all sections** - Make sure everything is accurate
2. **Double-check URLs** - Privacy policy, terms, app homepage
3. **Verify email** - Make sure dp@databeacon.aero is correct
4. **Click "Submit for Verification"**

### Step 5: Wait for Review

**Timeline:**
- Initial review: 1-3 days (automated checks)
- Full review: 2-6 weeks (manual review by Google)
- Possible follow-up questions: Google may email you for clarification

**What happens next:**
1. Google reviews your submission
2. They may request additional information or changes
3. They'll test your OAuth flow and scope usage
4. You'll receive email notification of approval or requested changes

**Email notifications go to:**
- dp@databeacon.aero (developer contact)
- You may also see updates in Cloud Console

---

## After Approval

Once approved, you can:

1. **Publish your app** to users outside test users
2. **Submit to Google Workspace Marketplace** (separate process)
3. **Remove the "unverified app" warning** from OAuth consent screen
4. **Scale to unlimited users**

---

## If You Get Rejected

**Common reasons for rejection:**
1. Insufficient scope justifications → Use our detailed justifications
2. Missing demo video → Record video following our script
3. Privacy policy issues → Ensure privacy policy is complete and accurate
4. App not functional → Make sure test users can actually use the app

**How to fix:**
1. Review Google's feedback email carefully
2. Make requested changes
3. Resubmit with explanations of what you fixed

**Google is usually helpful** - they'll tell you exactly what needs to be fixed.

---

## Tips for Faster Approval

1. ✅ **Record the video** - Apps with videos get approved faster
2. ✅ **Be detailed** - More detail in justifications = less back-and-forth
3. ✅ **Test thoroughly** - Make sure app actually works before submitting
4. ✅ **Accurate privacy policy** - Must match what app actually does
5. ✅ **Respond quickly** - If Google emails questions, respond within 1-2 days

---

## Contact Information

**If Google contacts you:**
- Respond from: dp@databeacon.aero
- Be professional and detailed
- Provide screenshots/videos if requested
- Update submission in Cloud Console

**Status tracking:**
- Check: https://console.cloud.google.com/apis/credentials/consent?project=811650947375
- Look for "Verification status" or "Publishing status"

---

## Next Steps After This Guide

1. [ ] Record demo video (3-5 minutes) following OAUTH_VIDEO_SCRIPT.md
2. [ ] Upload video to YouTube (unlisted) or Google Drive
3. [ ] Create app logo (128x128 pixels minimum)
4. [ ] Review privacy policy and terms one more time
5. [ ] Submit OAuth verification request
6. [ ] Wait 2-6 weeks for approval
7. [ ] Plan Marketplace submission (after OAuth approval)

---

**Current Status:** Ready to submit! 🚀

**Last Updated:** November 16, 2025
**Developer:** dp@databeacon.aero
