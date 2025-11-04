# SaveMe - Gmail AI Assistant

A Google Workspace Add-on that automatically processes incoming emails, saves attachments to Google Drive, and creates organized summaries in Google Sheets using AI.

## Project Overview

**Type:** Google Apps Script Add-on
**Status:** Planning Phase
**Target Platform:** Google Workspace Marketplace
**AI Provider:** OpenRouter.ai (user brings their own API key)

### Core Functionality

1. **Email Monitoring** - Automatically detects new emails based on user-defined filters
2. **Attachment Management** - Extracts and saves attachments to specified Google Drive folder
3. **AI Summarization** - Generates concise email summaries using OpenRouter.ai (200+ model choices)
4. **Spreadsheet Logging** - Creates organized rows in Google Sheets with email metadata and links

### Key Differentiators

- **User-controlled AI costs** - Users provide their own OpenRouter API key
- **Model flexibility** - Access to 200+ models (GPT-4, Claude, Gemini, Llama, etc.)
- **No subscription AI fees** - Flat pricing model without per-email charges
- **Privacy-focused** - No email content stored or processed through developer's systems

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
├── DriveManager.gs            # Attachment extraction & Drive upload
├── SheetsManager.gs           # Spreadsheet row creation & management
├── OpenRouterService.gs       # AI API integration & summarization
├── SettingsManager.gs         # User configuration storage & retrieval
├── TriggerManager.gs          # Automated email checking setup
├── Sidebar.html               # User settings configuration UI
├── Models.html                # Model selector with pricing info
├── Onboarding.html            # First-time setup wizard
├── appsscript.json            # Manifest with OAuth scopes
└── CLAUDE.md                  # This file
```

### Data Flow

```
Gmail Inbox
    ↓
[Email Filter] → Skip if already processed
    ↓
[Extract Attachments] → Save to Drive folder
    ↓
[Email Content] → OpenRouter API → [AI Summary]
    ↓
[Combine Data] → Append row to Google Sheet
    ↓
[Mark as Processed] → Update tracking
```

## User Configuration

### Required Settings

1. **OpenRouter API Key** - From openrouter.ai/keys
2. **AI Model Selection** - Choice of 200+ models
3. **Google Sheet URL** - Destination spreadsheet
4. **Drive Folder URL** - Where attachments are saved
5. **Email Filter** - Gmail search syntax (optional)
6. **Summary Prompt** - Custom AI instruction template

### Optional Settings

- Processing schedule (frequency)
- Column customization for Sheets
- Attachment file type filters
- Sender whitelist/blacklist
- Subject line keywords

## Implementation Details

### OpenRouter Integration

```javascript
// OpenRouterService.gs
function generateSummary(emailContent, apiKey, model, customPrompt) {
  var url = 'https://openrouter.ai/api/v1/chat/completions';

  var prompt = customPrompt || 'Summarize this email in 5-10 words, focusing on the main action or topic:';

  var payload = {
    model: model, // e.g., "anthropic/claude-3.5-sonnet"
    messages: [
      {
        role: "user",
        content: prompt + "\n\n" + emailContent
      }
    ],
    max_tokens: 100,
    temperature: 0.3
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'HTTP-Referer': 'https://saveme-gmail-assistant.com',
      'X-Title': 'SaveMe Gmail AI Assistant'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      Logger.log('OpenRouter API Error: ' + response.getContentText());
      return '[Summary failed - API Error]';
    }

    var result = JSON.parse(response.getContentText());
    return result.choices[0].message.content.trim();
  } catch (e) {
    Logger.log('OpenRouter API Exception: ' + e.toString());
    return '[Summary failed - ' + e.message + ']';
  }
}

// Get list of available models from OpenRouter
function fetchAvailableModels() {
  var url = 'https://openrouter.ai/api/v1/models';
  var response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText()).data;
}
```

### Gmail Processing

```javascript
// GmailProcessor.gs
function processNewEmails() {
  var settings = getUserSettings();

  if (!settings.apiKey || !settings.sheetUrl || !settings.folderUrl) {
    throw new Error('Configuration incomplete. Please open settings.');
  }

  // Build Gmail search query
  var query = buildSearchQuery(settings);
  var threads = GmailApp.search(query, 0, 10); // Process 10 at a time

  threads.forEach(function(thread) {
    var messages = thread.getMessages();

    messages.forEach(function(message) {
      var messageId = message.getId();

      // Check if already processed
      if (isProcessed(messageId)) {
        return; // Skip
      }

      try {
        processEmail(message, settings);
        markAsProcessed(messageId);
      } catch (e) {
        Logger.log('Error processing email ' + messageId + ': ' + e);
        logError(messageId, e.toString());
      }
    });
  });
}

function buildSearchQuery(settings) {
  var query = 'is:unread';

  if (settings.emailFilter) {
    query = settings.emailFilter;
  }

  // Exclude already processed (using label)
  query += ' -label:saveme-processed';

  return query;
}

function processEmail(message, settings) {
  // Extract email data
  var data = {
    date: message.getDate(),
    from: message.getFrom(),
    subject: message.getSubject(),
    body: message.getPlainBody().substring(0, 5000), // Limit for AI
    attachments: message.getAttachments()
  };

  // Save attachments to Drive
  var driveLinks = [];
  if (data.attachments.length > 0) {
    driveLinks = saveAttachmentsToDrive(data.attachments, settings.folderUrl);
  }

  // Generate AI summary
  var summary = generateSummary(data.body, settings.apiKey, settings.model, settings.prompt);

  // Add row to Sheet
  addToSheet({
    timestamp: data.date,
    sender: data.from,
    subject: data.subject,
    summary: summary,
    attachmentCount: data.attachments.length,
    driveLinks: driveLinks.join(', ')
  }, settings.sheetUrl);
}
```

### Drive Management

```javascript
// DriveManager.gs
function saveAttachmentsToDrive(attachments, folderUrl) {
  var folderId = extractIdFromUrl(folderUrl);
  var folder = DriveApp.getFolderById(folderId);
  var links = [];

  attachments.forEach(function(attachment) {
    try {
      var fileName = attachment.getName();
      var blob = attachment.copyBlob();

      // Check for duplicate names
      var existingFiles = folder.getFilesByName(fileName);
      if (existingFiles.hasNext()) {
        fileName = addTimestamp(fileName);
      }

      var file = folder.createFile(blob.setName(fileName));
      links.push(file.getUrl());

      Logger.log('Saved attachment: ' + fileName);
    } catch (e) {
      Logger.log('Error saving attachment: ' + e);
      links.push('[Error saving file]');
    }
  });

  return links;
}

function addTimestamp(fileName) {
  var parts = fileName.split('.');
  var extension = parts.pop();
  var name = parts.join('.');
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  return name + '_' + timestamp + '.' + extension;
}

function extractIdFromUrl(url) {
  // Extract ID from Google Drive URL
  var match = url.match(/[-\w]{25,}/);
  return match ? match[0] : url;
}
```

### Sheets Management

```javascript
// SheetsManager.gs
function addToSheet(data, sheetUrl) {
  var sheetId = extractIdFromUrl(sheetUrl);
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheet = spreadsheet.getActiveSheet();

  // Ensure headers exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Sender', 'Subject', 'AI Summary', 'Attachments', 'Drive Links']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  // Add data row
  sheet.appendRow([
    data.timestamp,
    data.sender,
    data.subject,
    data.summary,
    data.attachmentCount,
    data.driveLinks
  ]);

  // Format the new row
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}
```

### Settings Management

```javascript
// SettingsManager.gs
function saveUserSettings(settings) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperties({
    'OPENROUTER_API_KEY': settings.apiKey,
    'MODEL': settings.model,
    'SHEET_URL': settings.sheetUrl,
    'FOLDER_URL': settings.folderUrl,
    'EMAIL_FILTER': settings.emailFilter || 'is:unread',
    'SUMMARY_PROMPT': settings.prompt || 'Summarize this email in 5-10 words:'
  });
  return true;
}

function getUserSettings() {
  var userProperties = PropertiesService.getUserProperties();
  return {
    apiKey: userProperties.getProperty('OPENROUTER_API_KEY'),
    model: userProperties.getProperty('MODEL') || 'anthropic/claude-3.5-sonnet',
    sheetUrl: userProperties.getProperty('SHEET_URL'),
    folderUrl: userProperties.getProperty('FOLDER_URL'),
    emailFilter: userProperties.getProperty('EMAIL_FILTER'),
    prompt: userProperties.getProperty('SUMMARY_PROMPT')
  };
}

function clearUserSettings() {
  PropertiesService.getUserProperties().deleteAllProperties();
}
```

### Trigger Management

```javascript
// TriggerManager.gs
function setupEmailTrigger() {
  // Remove existing triggers first
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'processNewEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger (every 15 minutes)
  ScriptApp.newTrigger('processNewEmails')
    .timeBased()
    .everyMinutes(15)
    .create();
}

function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
}
```

### Processing Tracking

```javascript
// Code.gs - Helper functions
function isProcessed(messageId) {
  var cache = CacheService.getUserCache();
  return cache.get('processed_' + messageId) !== null;
}

function markAsProcessed(messageId) {
  var cache = CacheService.getUserCache();
  // Store for 7 days (max is 6 hours for cache, so we'll use Properties too)
  cache.put('processed_' + messageId, 'true', 21600); // 6 hours

  // Also store in Properties for longer persistence
  var props = PropertiesService.getUserProperties();
  var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES') || '[]');
  processed.push({id: messageId, date: Date.now()});

  // Keep only last 1000 messages
  if (processed.length > 1000) {
    processed = processed.slice(-1000);
  }

  props.setProperty('PROCESSED_MESSAGES', JSON.stringify(processed));
}
```

## OAuth Scopes Required

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

## Development Roadmap

### Phase 1: Core Development (Week 1)
- [ ] Set up Google Apps Script project
- [ ] Implement OpenRouter API integration
- [ ] Build Gmail reading and filtering logic
- [ ] Create Drive upload functionality
- [ ] Implement Sheets writing with headers
- [ ] Test end-to-end with manual trigger
- [ ] Add error handling and logging

### Phase 2: User Experience (Week 2)
- [ ] Build settings sidebar UI
- [ ] Implement configuration validation
- [ ] Add model selector with pricing info
- [ ] Create test connection button
- [ ] Add manual "Process Now" button
- [ ] Implement onboarding wizard
- [ ] Add status/activity log viewer

### Phase 3: Automation & Polish (Week 3)
- [ ] Set up time-based triggers
- [ ] Implement duplicate detection
- [ ] Add retry logic for failed API calls
- [ ] Create processing status tracking
- [ ] Add batch processing for multiple emails
- [ ] Implement rate limiting
- [ ] Add email notification for errors

### Phase 4: Publishing Preparation (Week 4)
- [ ] Security audit and testing
- [ ] Write privacy policy
- [ ] Create user documentation
- [ ] Design app icon and screenshots
- [ ] Record demo video
- [ ] Set up support email/system
- [ ] Google Workspace Marketplace submission
- [ ] OAuth verification review

## Feature Enhancements (Future)

### v1.1 - Advanced Filtering
- Multiple email accounts support
- Sender whitelist/blacklist
- Subject keyword filters
- Attachment type filters
- Date range processing

### v1.2 - Customization
- Custom column mapping
- Template-based summaries
- Multi-language support
- Folder organization by sender/date
- Custom Sheet formatting

### v1.3 - Analytics
- Processing statistics dashboard
- Cost tracking (OpenRouter usage)
- Email volume charts
- Response time metrics

### v1.4 - Integrations
- Slack notifications
- Zapier webhooks
- Calendar event creation
- Task creation (Google Tasks, Todoist)

## Monetization Strategy

### Option 1: Freemium Model
- **Free Tier:** 50 emails/month
- **Pro Tier:** $7.99/month - Unlimited emails
- **Business Tier:** $19.99/month - Multiple accounts, priority support

### Option 2: One-Time Purchase
- **Standard:** $39 - Lifetime license
- **Pro:** $79 - Lifetime + priority updates

### Option 3: Free + Premium Features
- **Free:** Core functionality
- **Premium ($4.99/month):**
  - Advanced filters
  - Custom prompts
  - Batch processing
  - Analytics dashboard
  - Priority support

**Recommended:** Option 1 (Freemium) for recurring revenue

## Cost Analysis

### User's AI Costs (via OpenRouter)
- GPT-4 Turbo: ~$0.01-0.03 per email
- Claude 3.5 Sonnet: ~$0.01-0.02 per email
- Gemini Pro: ~$0.001-0.005 per email
- Llama 3.1 70B: ~$0.0005-0.001 per email

Example: 100 emails/month with Claude = ~$1-2/month

### Developer Costs
- Google Workspace Marketplace: $5 one-time fee
- Domain registration: ~$15/year
- Support/hosting: Minimal (Apps Script is free)

## Security & Privacy

### Data Handling
- API keys stored in PropertiesService (encrypted by Google)
- Email content sent directly to user's OpenRouter account
- No email content stored long-term
- No data shared with third parties
- Processed message IDs cached for deduplication only

### OAuth Permissions
- `gmail.readonly` - Read emails only
- `gmail.modify` - Add labels for tracking (optional)
- `drive.file` - Create files only (not full Drive access)
- `spreadsheets` - Write to specific Sheets
- `external_request` - Call OpenRouter API

### Privacy Policy Requirements
- Explain data flow clearly
- Specify OpenRouter.ai as AI processor
- User controls their own data
- No data retention beyond processing
- Right to delete all data

## Support & Documentation

### User Documentation
1. Getting Started Guide
2. OpenRouter setup instructions
3. Model selection guide
4. Troubleshooting common issues
5. FAQ section

### Support Channels
- Email support
- GitHub issues (for bug reports)
- Documentation site
- Video tutorials

## Testing Checklist

### Functional Testing
- [ ] Email processing with various formats
- [ ] Attachment handling (PDF, images, docs)
- [ ] Large attachments (>25MB)
- [ ] No attachment emails
- [ ] Multiple attachments
- [ ] OpenRouter API failures
- [ ] Rate limiting scenarios
- [ ] Duplicate email handling
- [ ] Gmail filter syntax

### Integration Testing
- [ ] Google Sheets formatting
- [ ] Drive folder permissions
- [ ] OAuth consent flow
- [ ] Settings persistence
- [ ] Trigger reliability

### Security Testing
- [ ] API key security
- [ ] OAuth scope minimization
- [ ] Error message sanitization
- [ ] Input validation

## Marketing & Launch

### Pre-Launch
1. Create landing page
2. Set up support email
3. Record demo video
4. Write blog post/announcement
5. Prepare social media content

### Launch Channels
- Google Workspace Marketplace
- Product Hunt
- Reddit (r/productivity, r/gsuite)
- Hacker News
- Twitter/X
- LinkedIn

### Positioning
- "AI-Powered Email Organization for Google Workspace"
- "Your AI Assistant for Gmail - Bring Your Own Model"
- "Automate Email Management with Any AI Model"

## Success Metrics

### Key Performance Indicators
- Active users (DAU/MAU)
- Email processing volume
- Conversion rate (free → paid)
- User retention (30/60/90 day)
- Average emails processed per user
- Support ticket volume
- User rating in Marketplace

## Resources & References

### Official Documentation
- [Google Apps Script](https://developers.google.com/apps-script)
- [Gmail API](https://developers.google.com/gmail/api)
- [Drive API](https://developers.google.com/drive/api)
- [Sheets API](https://developers.google.com/sheets/api)
- [OpenRouter API Docs](https://openrouter.ai/docs)

### Development Tools
- [Apps Script Editor](https://script.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [OpenRouter Dashboard](https://openrouter.ai/dashboard)

### Marketplace Resources
- [Workspace Marketplace SDK](https://developers.google.com/workspace/marketplace)
- [OAuth Verification](https://support.google.com/cloud/answer/9110914)
- [Publishing Guidelines](https://developers.google.com/workspace/marketplace/listing-configuration)

## Next Steps

1. **Set up Google Cloud Project**
   - Create new project
   - Enable Gmail, Drive, Sheets APIs
   - Configure OAuth consent screen

2. **Create Apps Script Project**
   - New standalone script project
   - Copy file structure outlined above
   - Configure manifest (appsscript.json)

3. **Build MVP Features**
   - Start with manual email processing
   - Add OpenRouter integration
   - Test with personal Gmail account

4. **Iterate & Test**
   - Get beta testers
   - Collect feedback
   - Refine UX and error handling

5. **Prepare for Launch**
   - Complete documentation
   - Security audit
   - Submit to Marketplace

---

**Project Status:** Planning Complete - Ready for Development
**Last Updated:** 2025-11-04
**Estimated Launch:** 4-6 weeks from start
