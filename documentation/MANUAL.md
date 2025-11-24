# SaveMyAttachments - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start Guide](#quick-start-guide)
3. [Global Settings](#global-settings)
4. [Rules Engine](#rules-engine)
5. [Processing Emails](#processing-emails)
6. [Understanding Your Data](#understanding-your-data)
7. [Tools & Utilities](#tools--utilities)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Introduction

**SaveMyAttachments** is a Google Workspace Add-on that automatically processes your Gmail emails, saves attachments to Google Drive, logs email data to Google Sheets, and generates AI-powered summaries using OpenRouter.

### Key Features

- **Multiple Workflow Rules**: Create unlimited rules for different email types (invoices, receipts, clients, etc.)
- **AI-Powered Summaries**: Get intelligent email summaries using 200+ AI models
- **Smart Organization**: Save emails and attachments to organized folders in Google Drive
- **Searchable Index**: All email data logged in Google Sheets with clickable links
- **Flexible Filtering**: Use Gmail search syntax to target specific emails
- **Catch-All Mode**: Process unmatched emails with default settings

---

## Quick Start Guide

### Step 1: Initial Setup

1. Open your Google Sheet
2. Go to **SaveMyAttachments** menu → **⚙️ Configure Settings**
3. Configure required settings:
   - **OpenRouter API Key**: Get yours at [openrouter.ai/keys](https://openrouter.ai/keys)
   - **Google Drive Folder**: Where attachments will be saved
   - **AI Model**: Choose from 200+ available models

### Step 2: Create Your First Rule

1. Go to **SaveMyAttachments** menu → **📋 Manage Rules**
2. Click **Create New Rule**
3. Fill in:
   - **Rule Name**: e.g., "Client Invoices"
   - **Gmail Filter**: e.g., `from:client@company.com has:attachment`
   - **Priority**: Lower number = higher priority (default: 999)
4. Optional: Set custom folder, sheet, or AI prompt
5. Click **Save Rule**

### Step 3: Process Emails

1. Go to **SaveMyAttachments** menu → **📧 Process New Emails Now**
2. Wait for processing to complete
3. Check your Google Sheet for results
4. Check your Drive folder for saved attachments

### Step 4: Automate (Optional)

Go to **Configure Settings** → **Automation** section to enable automatic processing every 15-30 minutes.

---

## Global Settings

### Required Settings

#### OpenRouter API Key
- **What it is**: Your personal API key from OpenRouter
- **Get it**: [openrouter.ai/keys](https://openrouter.ai/keys)
- **Cost**: Pay-as-you-go (typically $0.001-0.03 per email depending on model)
- **Security**: Stored securely in Google's PropertiesService

#### Google Drive Folder
- **What it is**: Where your attachments and email PDFs will be saved
- **Options**:
  - Create new folder (recommended)
  - Use existing folder
  - Shared Drive support available
- **Format**: Paste the full Drive folder URL

### AI Settings

#### AI Model Selection
Choose from 200+ models:
- **GPT-4 Turbo**: Most capable, ~$0.01-0.03/email
- **Claude 3.5 Sonnet**: Excellent quality, ~$0.01-0.02/email
- **Gemini Pro**: Good balance, ~$0.001-0.005/email
- **Llama 3.1 70B**: Budget-friendly, ~$0.0005-0.001/email

#### Default AI Prompt
The default prompt used for all emails unless overridden by a rule.

**Default**: `Summarize this email in 5-10 words, focusing on the main action or topic:`

**Custom Examples**:
- `Extract the invoice number, amount, and due date`
- `List all action items mentioned`
- `Identify the sender's main request`

#### Max Response Tokens
- **Range**: 20-500
- **Default**: 100
- **Impact**: Higher = more detailed but more expensive

#### Enable AI Processing
Toggle to enable/disable AI summaries globally. When disabled, emails are still saved but no AI summaries are generated.

### Rules Processing Mode

#### Catch-All Mode (Default: Enabled)
- **Enabled**: Process emails matching rules PLUS all other emails with default settings
- **Disabled**: Process ONLY emails that match specific rules

### What to Save

#### Save Email Body
Choose whether to save the email content itself (separate from attachments).

**Formats**:
- PDF
- HTML
- Plain Text
- All formats

#### Save Attachments
Toggle whether to save email attachments to Drive.

### Processing Settings

#### Days to Look Back
How many days of emails to check (default: 7 days).

#### Batch Size
Number of emails to process per run (default: 10).

#### Attachment Filters
- **Min Size**: Minimum attachment size in KB
- **Max Size**: Maximum attachment size in MB
- **Allowed Extensions**: Only save specific file types (e.g., `pdf,xlsx,docx`)

---

## Rules Engine

### What Are Rules?

Rules are independent workflows that let you process different types of emails differently. Each rule can have:
- Its own Gmail filter
- Custom destination folder/sheet
- Custom AI prompt
- Different priority

### How Rules Work

1. **Rules are processed in priority order** (1 = highest priority)
2. **Each email is processed by the first matching rule only**
3. **Emails that don't match any rule**:
   - Processed by catch-all (if enabled)
   - Ignored (if catch-all disabled)

### Creating a Rule

#### Basic Settings

**Rule Name** (Required)
- Descriptive name for this workflow
- Examples: "Client Invoices", "Team Reports", "Receipts"

**Gmail Filter** (Required)
- Use Gmail search syntax (same as Gmail search box)
- Examples:
  - `from:client@company.com has:attachment`
  - `subject:invoice has:attachment`
  - `label:important from:boss@company.com`
  - `has:attachment newer_than:7d`

**Priority** (Required, Default: 999)
- Range: 1-999
- Lower number = higher priority
- Examples:
  - `1` = Highest (processed first)
  - `50` = High
  - `500` = Medium
  - `999` = Low (processed last)

#### Destinations (Optional)

**Drive Folder URL**
- Leave blank to use global default
- Paste full Drive folder URL to use different folder
- Supports Shared Drives

**Spreadsheet URL**
- Leave blank to use current spreadsheet
- Paste full spreadsheet URL including `#gid=` to target specific sheet/tab
- Example: `https://docs.google.com/spreadsheets/d/ABC.../edit#gid=1774276023`
- The system automatically extracts the spreadsheet ID and sheet gid

#### AI Settings (Optional)

**Custom AI Prompt**
- Leave blank to use global default prompt
- Specify custom prompt for this rule's emails
- Examples:
  - For invoices: `Extract invoice number, total amount, and due date`
  - For receipts: `Extract merchant name, date, and total amount`
  - For reports: `Summarize key findings and recommendations`

### Rule Examples

#### Example 1: Client Invoices
```
Name: Client Invoices
Gmail Filter: from:client@company.com subject:invoice
Priority: 10
Drive Folder: [Custom folder for invoices]
Spreadsheet: [Sheet with "Invoices" tab, using #gid]
AI Prompt: Extract invoice number, amount, and due date
```

#### Example 2: Team Reports
```
Name: Team Reports
Gmail Filter: from:team@company.com label:reports
Priority: 50
Drive Folder: [Default]
Spreadsheet: [Default]
AI Prompt: Summarize key findings and action items
```

#### Example 3: Receipts
```
Name: Receipts
Gmail Filter: subject:receipt OR subject:payment
Priority: 100
Drive Folder: [Receipts folder]
Spreadsheet: [Expenses sheet]
AI Prompt: Extract merchant, date, and total amount
```

### Managing Rules

#### Edit Rule
1. Go to **Manage Rules**
2. Click **✏️ Edit** on any rule
3. Modify fields in the form
4. Click **Save Rule**

#### Enable/Disable Rule
- Click **Disable** to pause a rule without deleting it
- Click **Enable** to reactivate a paused rule
- Disabled rules show as ⏸️ (paused)

#### Delete Rule
1. Click **🗑️ Delete** on any rule
2. Confirm deletion
3. Rule is permanently removed (cannot be undone)

#### View Rule Statistics
Each rule displays:
- **Processed**: Total emails processed by this rule
- **Last run**: When the rule last processed an email
- **Priority**: Rule's priority level

---

## Processing Emails

### Manual Processing

**Process New Emails Now**
- Menu: **SaveMyAttachments** → **📧 Process New Emails Now**
- Processes emails matching your rules + catch-all (if enabled)
- Runs once immediately
- Shows progress and results

**Stop Processing**
- Menu: **SaveMyAttachments** → **🛑 Stop Processing**
- Stops currently running email processing
- Completes current email before stopping
- Useful if processing is taking too long

### Test Mode

**Process Most Recent Email (Test)**
- Menu: **SaveMyAttachments** → **🔧 Tools** → **🧪 Process Most Recent Email (Test)**
- Processes just your most recent email
- Great for testing configuration before automating
- Ignores "already processed" checks

### Automated Processing

Enable automatic processing in **Configure Settings** → **Automation**:
- Every 15 minutes
- Every 30 minutes
- Every hour

The system runs in the background and processes new emails automatically.

---

## Understanding Your Data

### Google Sheets Structure

Each processed attachment creates one row:

| Column | Description |
|--------|-------------|
| **Message ID** | Hidden column - unique email identifier |
| **Date** | Email date/time |
| **Sender** | Email sender address |
| **Subject** | Email subject line |
| **Attachment** | Clickable link to file in Drive |
| **AI Summary** | AI-generated summary (if enabled) |

**Features**:
- **Clickable Links**: Click attachment name to open in Drive
- **Sortable**: Sort by date, sender, subject
- **Searchable**: Use Sheets' search (Ctrl+F) to find emails
- **Newest First**: Most recent emails appear at top (configurable)

### Google Drive Organization

**Folder Structure**:
```
Your Drive Folder/
├── email_2024-11-06_Subject_Line.pdf
├── email_2024-11-06_Subject_Line.html
├── attachment_file1.pdf
├── attachment_file2.xlsx
└── ...
```

**File Naming**:
- Email bodies: `email_YYYY-MM-DD_Subject.pdf`
- Attachments: Original filename preserved
- Duplicates: Timestamp appended `_YYYYMMDD_HHmmss`

---

## Tools & Utilities

### View Progress
- Shows current processing status
- Email counts by rule
- Last processing time

### View Diagnostics
- System health check
- Configuration validation
- Common issues detection

### View Processed Count
- Total emails processed
- Breakdown by rule
- Historical statistics

### View Cost Estimates
- Estimated OpenRouter API costs
- Cost per email by model
- Monthly projections

### Export Logs to Drive
- Exports full system logs
- Shareable link generated
- Useful for support/debugging

### Test OpenRouter Connection
- Verifies API key is valid
- Tests connectivity
- Shows available models

### Clear Functions

**Clear Processed Tracking Only**
- Clears the list of processed email IDs
- Keeps all other settings and rules
- Emails will be reprocessed on next run

**Clear Everything & Start Fresh**
- Clears tracking + sheet contents
- Keeps settings and rules
- Fresh start while preserving configuration

**Nuclear Clear (Force Reset)**
- Most aggressive reset
- Clears tracking, resets rule statistics
- Preserves rules and settings
- Use only if having issues

---

## Troubleshooting

### Emails Not Being Processed

**Check 1: Gmail Filter**
- Test your Gmail filter directly in Gmail search box
- Make sure emails match the filter syntax
- Use **Tools** → **Process Most Recent Email (Test)** to debug

**Check 2: Already Processed**
- System tracks processed emails to avoid duplicates
- Use **Clear Processed Tracking Only** to reset tracking

**Check 3: Rules Order**
- Remember: First matching rule wins
- Check rule priorities
- Higher priority rules (lower number) are checked first

**Check 4: Catch-All Mode**
- If disabled, only rule-matched emails are processed
- Enable in **Configure Settings** → **Rules Processing Mode**

### AI Summaries Not Working

**Check 1: API Key**
- Verify API key in settings
- Use **Test OpenRouter Connection** to validate
- Check balance at [openrouter.ai](https://openrouter.ai)

**Check 2: AI Enabled**
- Check **Enable AI Processing** toggle in settings
- Verify model is selected

**Check 3: Credits**
- Ensure OpenRouter account has credits
- Add credits at [openrouter.ai](https://openrouter.ai)

### Files Not Saving to Drive

**Check 1: Folder Permissions**
- Make sure you own the Drive folder
- Check folder hasn't been deleted
- Verify folder URL in settings

**Check 2: Attachment Size**
- Check min/max attachment size settings
- Large attachments may timeout

**Check 3: File Type Filters**
- Verify allowed extensions settings
- Some file types may be filtered out

### Sheet Not Updating

**Check 1: Sheet Permissions**
- Make sure sheet hasn't been deleted
- Verify you have edit permissions
- Check correct sheet is specified

**Check 2: Sheet Tab**
- If using `#gid=` in URL, verify tab exists
- Check tab hasn't been renamed/deleted

---

## FAQ

### General Questions

**Q: How much does it cost?**
A: SaveMyAttachments is available on the Google Workspace Marketplace with subscription pricing. In addition to the subscription fee, you pay for your own OpenRouter API usage (typically $0.001-0.03 per email depending on model choice).

**Q: Is my data secure?**
A: Yes. Your API key is stored in Google's secure PropertiesService. Email content is sent directly to OpenRouter (your account) for AI processing. We never see your emails or data.

**Q: Can I use this with a team?**
A: Yes! Use Shared Drives for collaboration. Each team member needs their own OpenRouter API key.

**Q: How many emails can I process?**
A: No hard limits. The system processes emails in batches to stay within Google Apps Script execution limits (typically 10-20 emails per run).

**Q: Can I process old emails?**
A: Yes! Adjust **Days to Look Back** in settings. But remember: old emails will be processed as "new" if you haven't processed them before.

### Rules Questions

**Q: What happens if an email matches multiple rules?**
A: Only the first matching rule (by priority order) processes the email. If you want both rules to process it, you'll need to manually trigger or adjust filters.

**Q: Can rules have the same priority?**
A: Yes, but processing order is unpredictable. Best practice: use unique priorities.

**Q: Do rules affect catch-all processing?**
A: No. Rules are checked first, then catch-all processes remaining emails (if enabled).

**Q: Can I have rules without destinations?**
A: Yes. Leave destinations blank to use global defaults.

### Technical Questions

**Q: How do I know which rule processed an email?**
A: Check the **Manage Rules** panel - each rule shows how many emails it has processed.

**Q: Can I export/import rules?**
A: Not currently. This feature is planned for future releases.

**Q: What happens if processing times out?**
A: Processing stops after 5 minutes (Google Apps Script limit). Unprocessed emails will be processed on the next run.

**Q: Can I process specific emails only?**
A: Yes! Use Gmail filters to target specific emails. Make catch-all mode disabled to process ONLY rule-matched emails.

**Q: How do I upgrade to a better AI model?**
A: Just change the model in **Configure Settings** → **AI Model**. New emails will use the new model.

---

## Support

For issues, questions, or feature requests:
- Check this manual first
- Use **Tools** → **Export Logs to Drive** to generate diagnostic logs
- Email support with your logs

---

## Appendix: Gmail Filter Examples

### Basic Filters
```
has:attachment                          # All emails with attachments
from:sender@example.com                 # From specific sender
subject:invoice                         # Subject contains "invoice"
label:important                         # Has "important" label
```

### Advanced Filters
```
from:client@company.com has:attachment newer_than:7d
# From client, with attachment, last 7 days

subject:(invoice OR receipt) has:attachment
# Subject contains "invoice" or "receipt", with attachment

from:*@company.com label:team has:attachment
# From anyone at company.com domain, labeled "team"

has:attachment larger:5MB
# Attachments larger than 5MB

from:boss@company.com (subject:urgent OR subject:important)
# From boss, subject contains "urgent" or "important"
```

### Combining Filters
```
from:client@company.com subject:invoice has:attachment newer_than:30d
```

**Test filters in Gmail first**: Copy your filter to Gmail search box to see what emails it matches.

---

**Version**: 1.0
**Last Updated**: November 2025
