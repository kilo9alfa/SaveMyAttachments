# OAuth Verification - Scope Justifications

**App Name:** SaveMyAttachments
**Developer:** dp@databeacon.aero
**Cloud Project:** savemyattachments (811650947375)
**App Type:** Google Workspace Add-on (Gmail backup & organization)

---

## Scope Justifications

### 1. `https://www.googleapis.com/auth/gmail.readonly` (RESTRICTED)

**Why we need this scope:**
SaveMyAttachments needs to read Gmail messages to back up emails and attachments to Google Drive. Users configure search filters (like "from:client@company.com has:attachment") and our app reads matching emails to extract:
- Email metadata (sender, date, subject)
- Email body content (for AI summarization)
- Attachments for backup to Drive

**Specific API calls:**
- `GmailApp.search()` - Search for emails matching user's filter criteria
- `GmailApp.getMessageById()` - Retrieve specific message details
- `message.getFrom()`, `message.getSubject()`, `message.getDate()` - Extract metadata
- `message.getPlainBody()`, `message.getBody()` - Get email content for AI processing
- `message.getAttachments()` - Retrieve attachments for Drive backup

**User benefit:**
Users can automatically back up important emails and attachments from their Gmail to organized Google Drive folders, with AI-generated summaries in Google Sheets for easy searching. This prevents data loss and creates a searchable archive.

**Privacy commitment:**
Email content is only processed by the user's own OpenRouter API key (they control the AI provider). We do not store, transmit, or access any email content on our servers.

---

### 2. `https://www.googleapis.com/auth/gmail.modify` (RESTRICTED)

**Why we need this scope:**
SaveMyAttachments applies Gmail labels to emails after processing them. This prevents duplicate processing of the same email and provides visual tracking in Gmail inbox.

**Specific API calls:**
- `GmailApp.getUserLabelByName()` - Get or create "SaveMe/Processed" label
- `GmailApp.createLabel()` - Create label if it doesn't exist
- `thread.addLabel()` or `message.addLabel()` - Apply label to processed emails

**User benefit:**
Users can see which emails have been backed up (labeled) versus which haven't. Labels prevent the app from processing the same email multiple times, avoiding duplicate files in Drive and duplicate rows in Sheets.

**Privacy commitment:**
We only add labels for tracking purposes. We never modify, delete, or move email messages. Users can manually remove labels to reprocess emails if needed.

---

### 3. `https://www.googleapis.com/auth/drive` (SENSITIVE)

**Why we need this scope:**
SaveMyAttachments saves email files (PDF/HTML/TXT conversions) and email attachments to user-specified Google Drive folders. Users provide a Drive folder URL where backups should be saved, and our app needs to:
- Access the specified folder (requires read to navigate folder hierarchy)
- Create organized subfolders (e.g., by date, sender, label)
- Upload email files and attachments
- Generate shareable links for the Sheets index

**Specific API calls:**
- `DriveApp.getFolderById()` - Access user's specified backup folder
- `folder.createFolder()` - Create organized subfolder structure (e.g., "2024/11/Client Name/")
- `folder.createFile()` - Upload email PDFs and attachments
- `file.getUrl()` - Get Drive links to add to Sheets index
- `DriveApp.getFilesByName()` - Check for duplicate filenames

**User benefit:**
Users get organized, searchable backups of their emails and attachments in Drive, with automatic folder organization (by date, sender, label, etc.) and custom file naming. All files are in the user's own Drive, accessible forever.

**Why we need full `drive` scope vs. `drive.file`:**
We need to access existing folders that users specify for backup destinations. The `drive.file` scope only allows access to files created by our app, but users want to specify their own existing Drive folders (personal or Shared Drives) as backup locations.

**Privacy commitment:**
We only access the specific folder(s) the user configures for backups. We create files but never read, modify, or delete existing Drive files outside our backup process.

---

### 4. `https://www.googleapis.com/auth/spreadsheets` (SENSITIVE)

**Why we need this scope:**
SaveMyAttachments creates a searchable index in Google Sheets with metadata about each processed email. Users specify a Sheet URL where the index should be created. Our app writes rows containing:
- Email date, sender, subject
- AI-generated summary
- Attachment count
- Drive links to backed-up files
- Custom data extracted via AI questions (optional)

**Specific API calls:**
- `SpreadsheetApp.openById()` - Open user's specified Sheet
- `sheet.getLastRow()` - Check if headers exist
- `sheet.appendRow()` - Add new row for each processed email
- `sheet.getRange().setNumberFormat()` - Format date columns
- `sheet.getRange().setFontWeight()` - Bold header row

**User benefit:**
Users get a searchable database of all backed-up emails with AI summaries and Drive links. They can filter, sort, and search the Sheet to quickly find emails (e.g., "find all invoices from November"). This is more powerful than Drive search alone.

**Privacy commitment:**
We only write to the Sheet the user specifies. We never read, modify, or delete other Sheets. Email content is summarized via the user's own OpenRouter API key - we don't process it.

---

### 5. `https://www.googleapis.com/auth/script.external_request` (NON-SENSITIVE)

**Why we need this scope:**
SaveMyAttachments calls the OpenRouter API to generate AI summaries of emails and answer custom questions about email content. Users provide their own OpenRouter API key (from openrouter.ai/keys) and choose from 200+ AI models.

**Specific API calls:**
- `UrlFetchApp.fetch('https://openrouter.ai/api/v1/chat/completions')` - Call OpenRouter API to generate summaries
- Send email content + custom prompt to AI model
- Receive summary text (e.g., "Invoice #1234 due Nov 30 - $500")

**User benefit:**
Users get intelligent, concise summaries of each email automatically added to their Sheets index. This makes it easy to understand email content at a glance without opening the original email or PDF. Custom AI questions extract structured data (invoice amounts, due dates, categories) into Sheet columns for filtering and analysis.

**Privacy commitment:**
- Users provide their own OpenRouter API key - they control which AI provider processes their data
- Email content goes directly from user's Google account → OpenRouter (via user's API key) → back to user's Google account
- We (the app developer) never receive, store, or process email content on our servers
- Users can choose any of 200+ models including privacy-focused options

**Why OpenRouter specifically:**
OpenRouter is a unified API gateway that gives users choice of 200+ AI models (GPT-4, Claude, Gemini, Llama, etc.) with transparent pricing. Users maintain full control over their AI costs and data processing preferences.

---

## Data Handling & Privacy Practices

### Data Flow:
```
Gmail → Apps Script (user's Google account) → User's Drive folder
                ↓
         User's OpenRouter API key → AI model → Summary
                ↓
         User's Google Sheet
```

### What we DO:
✅ Process email content **within the user's Google account** only
✅ Send email content to AI via **user's own API key**
✅ Save backups to **user's own Drive**
✅ Write index to **user's own Sheet**

### What we DON'T do:
❌ Store email content on our servers
❌ Transmit email content through our servers
❌ Access user data outside the backup process
❌ Share data with third parties (except user's chosen AI via their API key)
❌ Read or modify files we didn't create

### User Control:
- Users configure which emails to process (Gmail search filters)
- Users specify where backups are saved (Drive folder URL)
- Users specify which Sheet to use for the index
- Users provide their own AI API key (they control AI provider and costs)
- Users can disable automation anytime
- Users can delete all processed email tracking anytime

---

## Security Measures

1. **API Key Security:**
   - User's OpenRouter API key stored in PropertiesService (encrypted by Google)
   - Never logged or exposed in error messages
   - Only used for OpenRouter API calls

2. **Minimal Permissions:**
   - We only request scopes absolutely necessary for core functionality
   - We only access specific files/folders user configures
   - No background data collection

3. **Error Handling:**
   - Comprehensive error handling to prevent data loss
   - Execution time monitoring to stay within Google's limits
   - Automatic cleanup of Properties Service to prevent quota issues

4. **Transparency:**
   - Open source code (available on GitHub)
   - Detailed documentation explaining all features
   - Clear privacy policy on website

---

## App Verification Checklist

- [x] Privacy Policy published at: https://thecoralblock.pages.dev/privacy
- [x] Terms of Service published at: https://thecoralblock.pages.dev/terms
- [x] App domain: thecoralblock.pages.dev (will migrate to thecoralblock.com after domain transfer)
- [x] Support email: dp@databeacon.aero
- [x] Developer contact: dp@databeacon.aero
- [x] All scopes tested and functional
- [x] OAuth Consent Screen configured
- [x] Apps Script project linked to Cloud Project

---

**Last Updated:** November 16, 2025
**Developer:** dp@databeacon.aero
**Website:** https://thecoralblock.pages.dev
