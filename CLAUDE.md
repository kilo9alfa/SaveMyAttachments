# SaveMe - Gmail AI Assistant

A Google Workspace Add-on that automatically processes incoming emails, saves attachments to Google Drive, and creates organized summaries in Google Sheets using AI.

## Project Overview

**Type:** Google Apps Script Add-on
**Status:** MVP Complete - Preparing for Marketplace Launch
**Target Platform:** Google Workspace Marketplace
**AI Provider:** OpenRouter.ai (user brings their own API key)

## Core Functionality

1. **Email Monitoring** - Automatically detects new emails based on user-defined filters
2. **Email & Attachment Backup** - Saves complete emails (PDF/HTML/Plain Text) AND attachments to Google Drive
3. **Smart Organization** - Dynamic folder structures with custom naming templates
4. **Multiple Rules Engine** - Create unlimited workflows for different email types
5. **AI Summarization** - Generates concise email summaries using OpenRouter.ai (200+ model choices)
6. **Spreadsheet Index** - Creates searchable Google Sheets database with email metadata, summaries, and Drive links
7. **Advanced Filtering** - File type filters, size limits, sender whitelists/blacklists
8. **Custom AI Questions** - Extract structured data into specific Sheet columns (e.g., "Invoice status?", "Amount?", "Due date?")

## Key Differentiators vs. Competitors

- **AI-Powered Intelligence** - AI summaries and insights, not just backup
- **Custom Data Extraction** - Structured data extraction into Sheet columns
- **User-controlled AI costs** - Users bring their own OpenRouter API key
- **Model flexibility** - Access to 200+ models (GPT-4, Claude, Gemini, Llama, Mistral, etc.)
- **Searchable Database** - Google Sheets integration creates a queryable index
- **PDF Content Analysis** - AI analyzes both email text AND extracted PDF content
- **Better Value** - More features at lower price point ($69-99/year vs $80-100/year)
- **Privacy-focused** - No email content stored on our servers
- **Shared Drive Support** - Team collaboration features included

## Technical Architecture

### Technology Stack

- **Runtime:** Google Apps Script (JavaScript-based, serverless)
- **APIs:** Gmail API, Drive API, Sheets API, OpenRouter API
- **UI Framework:** HTML Service (for settings panel)
- **Storage:** PropertiesService (user preferences)
- **Triggers:** Time-based triggers (every 5-15 minutes)

### Project Structure

```
SaveMe/
├── Code.gs                    # Main orchestration & menu setup
├── GmailProcessor.gs          # Email fetching, parsing & filtering
├── DriveManager.gs            # File upload, folder organization & naming
├── EmailConverter.gs          # Email to PDF/HTML/Plain Text conversion
├── PDFExtractor.gs            # Extract text content from PDF attachments
├── SheetsManager.gs           # Spreadsheet row creation & management
├── RulesEngine.gs             # Multiple workflow rules management
├── FolderTemplates.gs         # Dynamic folder structure creation
├── FileNaming.gs              # Custom file naming template engine
├── FilterManager.gs           # File type, size, sender filtering
├── OpenRouterService.gs       # AI API integration & summarization
├── CustomQuestions.gs         # Custom AI question processing & data extraction
├── SettingsManager.gs         # User configuration storage & retrieval
├── TriggerManager.gs          # Automated email checking setup
├── EmailTracker.gs            # Processing tracking & progress monitoring
├── Sidebar.html               # User settings configuration UI
├── RuleBuilder.html           # Visual rule creation interface
├── Models.html                # Model selector with pricing info
├── Onboarding.html            # First-time setup wizard
└── appsscript.json            # Manifest with OAuth scopes
```

## Safety Features & Limitations

See [LIMITATIONS.md](LIMITATIONS.md) for user-facing documentation.

### Built-in Safety Features (Implemented)

1. **Execution Time Monitoring** - Stops gracefully at 5 minutes (before 6-min limit)
2. **Properties Service Auto-Cleanup** - Removes oldest entries when >5000 messages tracked
3. **Progress Tracking** - Estimates completion time and progress percentage
4. **Quota Error Detection** - Detects Gmail API quota errors and timeouts
5. **OpenRouter Error Handling** - Detects rate limits, invalid API keys, insufficient credits

### Google Apps Script Limits

| Limit | Value | Impact |
|-------|-------|--------|
| Execution Time | 6 minutes max | ~50-100 emails per run |
| Properties Service (per property) | 9KB | ~5000-7000 message IDs |
| Gmail API Quota | Generous | Thousands of operations per day |
| URL Fetch calls | 20,000/day | OpenRouter API calls |

### Large-Scale Processing Strategy

For 2000+ emails: Enable automation (every 15 minutes), let run for 1-2 days in background. System handles execution time limits, properties cleanup, and error recovery automatically.

## User Configuration

### Required Settings (Per Rule)

1. **Rule Name** - Descriptive name for workflow
2. **Gmail Filter** - Gmail search syntax (e.g., `from:client@company.com has:attachment`)
3. **OpenRouter API Key** - From openrouter.ai/keys (global setting)
4. **AI Model Selection** - Choice of 200+ models (can be different per rule)
5. **Google Sheet URL** - Destination spreadsheet for this rule
6. **Drive Folder URL** - Base folder where files are saved (can use Shared Drives)

### Organization Settings

- **Folder Structure Template** - Dynamic path patterns:
  - `{year}/{month}/{day}`, `{sender_email}/{year-month}`, `{label}/{sender_name}`
- **File Naming Template** - Custom naming patterns:
  - `{YYYYMMDD}-{subject}.pdf`, `{sender_name}_{YYYY-MM-DD_HHmmss}`

### Custom AI Questions

Define custom questions that AI answers for each email. AI analyzes both email body and PDF content to provide structured answers for specific Sheet columns.

**Example Use Cases:**
- Invoice status detection: "Is this an invoice that needs to be paid?"
- Amount extraction: "What is the total amount mentioned?"
- Priority classification: "What is the urgency level?"
- Due date extraction: "What is the due date mentioned?"

**Features:**
- Unlimited questions per rule (Pro tier) / 5 questions per rule (Standard tier)
- AI analyzes both email body AND PDF attachment content
- Structured output ensures consistent data format
- Multiple choice or free-form answers

## Implementation Reference

All core functionality is implemented in the following files. See file comments for detailed implementation:

- **OpenRouterService.gs** - AI API integration, summary generation, model fetching
- **GmailProcessor.gs** - Email processing loop, query building, execution time monitoring
- **DriveManager.gs** - File uploads, folder organization, duplicate handling
- **SheetsManager.gs** - Spreadsheet writing, header management, custom columns
- **CustomQuestions.gs** - Question processing, answer validation, format handling
- **EmailTracker.gs** - Processing tracking, progress estimation, auto-cleanup
- **RulesEngine.gs** - Rule matching, filtering logic, multi-rule support

## OAuth Scopes Required

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

## Monetization Strategy

### Pricing Tiers (Annual Subscription)

**Standard Edition - $69/year**
- Unlimited email processing, AI summaries, Google Sheets index
- Up to 10 workflow rules
- Up to 5 custom AI questions per rule
- Processing every 15-30 minutes
- Email support

**Pro Edition - $99/year**
- Everything in Standard, plus:
- Unlimited workflow rules
- Unlimited custom AI questions per rule
- Shared Drive support (team collaboration)
- Processing every 5-10 minutes (faster)
- Priority support (48-hour response)

### Competitive Positioning

| Feature | Competitor ($79.95/year) | SaveMe Standard ($69) | SaveMe Pro ($99) |
|---------|--------------------------|----------------------|------------------|
| Email + Attachment Backup | ✓ | ✓ | ✓ |
| **AI Summaries** | ❌ | ✓ | ✓ |
| **Custom AI Questions** | ❌ | 5 per rule | Unlimited |
| **PDF Content Analysis** | ❌ | ✓ | ✓ |
| **Google Sheets Index** | ❌ | ✓ | ✓ |
| Workflow Rules | 5 | 10 | Unlimited |
| Shared Drive Support | Enterprise only | ❌ | ✓ |
| Processing Frequency | Hourly | 15-30 min | 5-10 min |

## Security & Privacy

### Data Handling
- API keys stored in PropertiesService (encrypted by Google)
- Email content sent directly to user's OpenRouter account
- No email content stored long-term
- No data shared with third parties
- Processed message IDs cached for deduplication only

### Privacy Policy Requirements
- Explain data flow clearly
- Specify OpenRouter.ai as AI processor
- User controls their own data
- No data retention beyond processing
- Right to delete all data

## Current Status & Next Steps

**Status:** MVP features complete, documentation ready
**Website:** The Coral Block (thecoralblock.com)
**Repository:** https://github.com/kilo9alfa/thecoralblock
**Timeline:** 4-6 weeks to marketplace submission (2-6 weeks for Google OAuth review)

### Marketplace Launch Preparation (Current Focus)

**Website & Domain:**
1. ✅ Website deployed to Cloudflare Pages (https://thecoralblock.pages.dev)
2. ✅ Privacy Policy and Terms of Service pages live
3. ✅ Product landing page for SaveMyAttachments created
4. ✅ Initiated domain transfer from Squarespace to Cloudflare
5. ⏳ Domain transfer pending (3-7 days, automated)

**Google Cloud Project Setup:**
1. ✅ Created Google Cloud Project (ID: savemyattachments)
2. ✅ Enabled 3 required APIs (Gmail, Drive, Sheets)
3. ✅ OAuth Consent Screen - App Information completed
4. ✅ OAuth Consent Screen - Branding completed
5. 🔄 OAuth Consent Screen - Scopes section (IN PROGRESS)
6. ⏳ OAuth Consent Screen - Test Users section (next)
7. ⏳ Link Apps Script project to Cloud Project
8. ⏳ Test OAuth flow

**Strategy Decision (Nov 8, 2025):**
- **Current approach:** Start with dp@databeacon.aero instead of waiting for david@thecoralblock.com
- **Rationale:** Faster time to market - OAuth verification takes 2-6 weeks
- **Transfer plan:** Once david@thecoralblock.com is ready, transfer project ownership via Google Cloud IAM

### Parallel Tracks

**Track 1: Google Cloud & OAuth (ACTIVE NOW)**
1. ✅ Create Google Cloud Project with dp@databeacon.aero
2. 🔄 Configure OAuth Consent Screen with .pages.dev URLs (on Scopes step)
3. ⏳ Link Apps Script project
4. ⏳ Test OAuth flow
5. ⏳ Wait for domain transfer (3-7 days, background)
6. ⏳ Transfer project ownership to david@thecoralblock.com
7. ⏳ Update OAuth Consent Screen with custom domain
8. ⏳ Prepare verification materials (video demo, written justifications)
9. ⏳ Submit for OAuth verification (2-6 weeks)

**Track 2: Domain & Email (WAITING)**
1. ✅ Domain transfer initiated
2. ⏳ Add custom domain to Cloudflare Pages
3. ⏳ Configure DNS in Cloudflare for iCloud email
4. ⏳ Add thecoralblock.com to iCloud+
5. ⏳ Create email addresses: david@, support@, privacy@

### Post-Launch Feature Roadmap

**v1.1 - Analytics & Insights** (Month 3)
- Processing statistics dashboard
- Cost tracking (OpenRouter usage calculator)
- Email volume charts and trends

**v1.2 - Advanced AI Features** (Month 6)
- Enhanced custom questions (conditional questions, multi-value extraction)
- Audio/video attachment transcription
- OCR for scanned documents
- Advanced invoice/receipt data extraction

**v1.3 - Integrations** (Month 9)
- Slack notifications
- Zapier webhooks
- Google Calendar event creation
- CRM integrations (HubSpot, Salesforce)

## Resources & References

### Official Documentation
- [Google Apps Script](https://developers.google.com/apps-script)
- [Gmail API](https://developers.google.com/gmail/api)
- [Drive API](https://developers.google.com/drive/api)
- [Sheets API](https://developers.google.com/sheets/api)
- [OpenRouter API Docs](https://openrouter.ai/docs)

### Marketplace Resources
- [Workspace Marketplace SDK](https://developers.google.com/workspace/marketplace)
- [OAuth Verification](https://support.google.com/cloud/answer/9110914)
- [Publishing Guidelines](https://developers.google.com/workspace/marketplace/listing-configuration)

---

**Project Status:** MVP Features Complete - Now Focused on Google Workspace Marketplace Launch
**Last Updated:** 2025-11-24
**Current Phase:** Configuring Google Cloud Project OAuth Consent Screen + Domain transfer in progress
**Estimated Timeline:** 4-6 weeks to marketplace submission
**Next Step:** Complete OAuth Consent Screen Scopes section
