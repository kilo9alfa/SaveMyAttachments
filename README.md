# SaveMyAttachments

A Google Workspace Add-on that automatically saves Gmail attachments to Google Drive, logs email metadata to Google Sheets, and generates AI-powered summaries using OpenRouter.

## Features

- **Automatic Attachment Backup** - Save Gmail attachments to Google Drive automatically
- **Email Body Export** - Save email content as PDF, HTML, or plain text
- **AI-Powered Summaries** - Generate intelligent summaries using 200+ AI models via OpenRouter
- **Rules Engine** - Create multiple workflows with custom filters, folders, and AI prompts
- **Flexible Filtering** - Use Gmail search syntax to target specific emails
- **Searchable Index** - All email metadata logged to Google Sheets with clickable Drive links
- **Scheduled Processing** - Automate with configurable intervals (15, 30, 60 minutes)
- **Custom File Naming** - Template-based naming with date, subject, and sender variables

## Installation

### Option 1: Google Workspace Marketplace
*(Coming soon)*

### Option 2: Manual Installation (Apps Script)

1. Create a new Google Sheet
2. Go to **Extensions** > **Apps Script**
3. Delete the default `Code.gs` content
4. Copy all `.gs` and `.html` files from this repository into the Apps Script editor
5. Enable the **Drive API** (Advanced Service):
   - In Apps Script, click **Services** (+ icon)
   - Find **Drive API** and click **Add**
   - Keep version as `v2`
6. Save and refresh your Google Sheet
7. The **SaveMyAttachments** menu will appear

## Setup

1. **Configure Settings** - Go to `SaveMyAttachments` > `Configure Settings`
2. **Set Drive Folder** - Create a new folder or enter an existing folder URL
3. **Add OpenRouter API Key** (optional) - Get one at [openrouter.ai/keys](https://openrouter.ai/keys)
4. **Create Rules** (optional) - Go to `Manage Rules` to set up custom workflows
5. **Process Emails** - Click `Process New Emails Now` to start

## Usage

### Menu Options

| Menu Item | Description |
|-----------|-------------|
| Process New Emails Now | Manually process emails matching your filters |
| Stop Processing | Halt any running processing |
| Configure Settings | Open settings panel |
| Manage Rules | Create and edit processing rules |
| Tools > Process Most Recent Email | Test your configuration |
| Tools > View Progress | See processing statistics |
| Tools > View Cost Estimates | Estimated OpenRouter API costs |

### Rules Engine

Create custom rules to process different email types differently:

```
Rule: Client Invoices
├── Gmail Filter: from:client@company.com subject:invoice
├── Priority: 10 (lower = higher priority)
├── Drive Folder: /Invoices
└── AI Prompt: "Extract invoice number, amount, and due date"
```

Rules are processed in priority order. The first matching rule handles each email.

### Gmail Filter Examples

```
has:attachment                    # All emails with attachments
from:sender@example.com          # From specific sender
subject:invoice has:attachment   # Subject contains "invoice"
label:important                  # Has "important" label
newer_than:7d has:attachment     # Last 7 days with attachments
```

## Configuration

### Global Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Drive Folder | Where attachments are saved | (required) |
| Save Email Body | Export email content | false |
| Email Format | PDF, HTML, or Text | PDF |
| Save Attachments | Save file attachments | true |
| Days to Look Back | How far back to search | 7 days |
| Batch Size | Emails per processing run | 10 |

### AI Settings (Optional)

| Setting | Description | Default |
|---------|-------------|---------|
| Enable AI | Toggle AI summaries | false |
| API Key | OpenRouter API key | (none) |
| Model | AI model for summaries | claude-3.5-sonnet |
| Max Tokens | Response length limit | 100 |
| Summary Prompt | Question to ask AI | "Summarize in 5-10 words" |

### File Naming Templates

Use these variables in naming templates:

| Variable | Description |
|----------|-------------|
| `{{Year}}` | 4-digit year |
| `{{Month}}` | 2-digit month |
| `{{Day}}` | 2-digit day |
| `{{Subject}}` | Email subject |
| `{{Sender}}` | Sender email |
| `{{AttachmentName}}` | Original filename |

Example: `{{Year}}.{{Month}}.{{Day}}-{{AttachmentName}}`

## OAuth Scopes

This add-on uses narrow OAuth scopes to protect your privacy:

| Scope | Purpose |
|-------|---------|
| `gmail.readonly` | Read emails and attachments (no send/delete access) |
| `drive.file` | Access only files created by this add-on |
| `spreadsheets.currentonly` | Access only the spreadsheet it's bound to |
| `script.external_request` | Connect to OpenRouter API |
| `script.container.ui` | Display settings dialogs |
| `script.scriptapp` | Create automation triggers |

**Note:** The `drive.file` scope means this add-on can only access folders it creates - it cannot see or modify your other Drive files.

## Architecture

```
SaveMyAttachments/
├── Code.gs              # Main entry point, menu setup
├── Config.gs            # Configuration management
├── GmailProcessor.gs    # Email processing logic
├── DriveManager.gs      # Google Drive operations
├── SheetsManager.gs     # Spreadsheet logging
├── RulesEngine.gs       # Rules-based routing
├── EmailTracker.gs      # Duplicate prevention
├── EmailConverter.gs    # PDF/HTML export
├── FileNaming.gs        # Template-based naming
├── OpenRouterService.gs # AI API integration
├── TriggerManager.gs    # Scheduled automation
├── DebugManager.gs      # Logging and diagnostics
├── SettingsPanel.html   # Settings UI
├── RulesManager.html    # Rules management UI
└── appsscript.json      # Project manifest
```

## Troubleshooting

### Emails Not Processing

1. Check your Gmail filter in Gmail search to verify it matches emails
2. Verify "Days to Look Back" includes your target emails
3. Use `Tools > View Diagnostics` to check tracking state
4. Try `Tools > Clear Email Tracking` to reset

### AI Summaries Not Working

1. Verify API key is entered in settings
2. Check "Enable AI Processing" is toggled on
3. Use `Tools > Test OpenRouter Connection` to validate
4. Check your OpenRouter balance at [openrouter.ai](https://openrouter.ai)

### Files Not Saving to Drive

1. Verify Drive folder is configured in settings
2. Check attachment size filters (min/max)
3. Verify allowed file extensions if configured

## Cost Estimates

AI summaries via OpenRouter are pay-as-you-go:

| Model | Cost per 1000 emails |
|-------|---------------------|
| Claude 3.5 Sonnet | ~$1.60 |
| Claude 3 Haiku | ~$0.14 |
| GPT-3.5 Turbo | ~$0.27 |
| Mistral 7B | ~$0.05 |

*Estimates based on ~540 tokens per email. Actual costs may vary.*

## Privacy

- **Your data stays yours** - Emails are processed within your Google account
- **No external servers** - Only OpenRouter API is contacted (if AI enabled)
- **Narrow permissions** - Add-on can only access what it creates
- **API key storage** - Stored securely in Google's PropertiesService

## Disclaimer

**USE AT YOUR OWN RISK.** This software is provided "as is" without warranty of any kind. The authors are not responsible for any data loss, unexpected charges (including OpenRouter API costs), or any other damages arising from the use of this software. Always test with a small batch of emails before enabling automation. Back up important data before use.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

- Check the [User Manual](MANUAL.html) for detailed documentation
- Open an issue on GitHub for bugs or feature requests
