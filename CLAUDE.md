# SaveMe - Gmail AI Assistant

A Google Workspace Add-on that automatically processes incoming emails, saves attachments to Google Drive, and creates organized summaries in Google Sheets using AI.

## Project Overview

**Type:** Google Apps Script Add-on
**Status:** Active Development
**Target Platform:** Google Workspace Marketplace
**AI Provider:** OpenRouter.ai (user brings their own API key)

## ⚠️ Important: Safety Features & Limitations

See [LIMITATIONS.md](LIMITATIONS.md) for user-facing documentation.

### Built-in Safety Features (Implemented)

1. **Execution Time Monitoring** (GmailProcessor.gs:15-17, 55-62, 77-84)
   - Monitors execution time continuously
   - Stops gracefully at 5 minutes (before 6-min limit)
   - Prevents data loss from sudden timeout
   - Returns `stats.stoppedEarly = true` for UI display

2. **Properties Service Auto-Cleanup** (EmailTracker.gs:73-90)
   - Automatically removes oldest entries when >5000 messages tracked
   - Warns when approaching 9KB property size limit
   - Prevents hitting Properties Service limits
   - Logs cleanup actions for transparency

3. **Progress Tracking** (EmailTracker.gs:106-144, Code.gs:432-477)
   - Estimates total emails in date range
   - Calculates percent complete
   - Estimates runs needed and time to completion
   - UI: Menu → Tools → View Progress

4. **Quota Error Detection** (GmailProcessor.gs:164-189)
   - Detects Gmail API quota errors
   - Detects execution timeouts
   - Provides helpful error messages
   - Sets `stats.stoppedReason` with specific error

5. **OpenRouter Error Handling** (OpenRouterService.gs:51-68, 76-88)
   - Detects rate limits (429)
   - Detects invalid API key (401)
   - Detects insufficient credits (402)
   - Detects network/timeout errors
   - Returns descriptive error messages

### Google Apps Script Limits

| Limit | Value | Impact |
|-------|-------|--------|
| Execution Time | 6 minutes max | Can process ~50-100 emails per run |
| Properties Service (per property) | 9KB | ~5000-7000 message IDs |
| Properties Service (total) | 500KB | All settings + tracking |
| Gmail API Quota | Generous | Thousands of operations per day |
| URL Fetch calls | 20,000/day | OpenRouter API calls |

### Large-Scale Processing Strategy

**For 2000+ emails:**
1. Enable automation (every 15 minutes)
2. Let run for 1-2 days in background
3. Use "View Progress" to monitor
4. System handles execution time limits automatically
5. Auto-cleanup manages Properties Service limits

**Automation handles:**
- Batch processing (10-20 emails per run)
- Execution time limit (stops at 5 min, continues next run)
- Properties cleanup (auto-removes oldest entries)
- Error recovery (skips quota errors, continues next run)

### Core Functionality

1. **Email Monitoring** - Automatically detects new emails based on user-defined filters
2. **Email & Attachment Backup** - Saves complete emails (PDF/HTML/Plain Text) AND attachments to Google Drive
3. **Smart Organization** - Dynamic folder structures with custom naming templates (organize by date, sender, label, etc.)
4. **Multiple Rules Engine** - Create unlimited workflows for different email types (invoices, receipts, clients, etc.)
5. **AI Summarization** - Generates concise email summaries using OpenRouter.ai (200+ model choices)
6. **Spreadsheet Index** - Creates searchable Google Sheets database with email metadata, summaries, and Drive links
7. **Advanced Filtering** - File type filters, size limits, sender whitelists/blacklists
8. **Custom AI Questions** - Define custom questions per rule to extract structured data into specific Sheet columns (e.g., "Is this an invoice that needs to be paid?" → "invoice-pending"/"invoice-paid")

### Key Differentiators vs. Competitors

- **AI-Powered Intelligence** - Unlike competitors, we provide AI summaries and insights, not just backup
- **Custom Data Extraction** - Define custom AI questions to extract structured data (invoice status, amounts, categories, etc.) into Sheet columns
- **User-controlled AI costs** - Users bring their own OpenRouter API key (no hidden AI fees)
- **Model flexibility** - Access to 200+ models (GPT-4, Claude, Gemini, Llama, Mistral, etc.)
- **Searchable Database** - Google Sheets integration creates a queryable index (competitors only save files)
- **PDF Content Analysis** - AI analyzes both email text AND extracted PDF content for comprehensive understanding
- **Better Value** - More features at lower price point than market leader ($69-99/year vs $80-100/year)
- **Privacy-focused** - No email content stored on our servers or processed through our accounts
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
├── CustomQuestions.gs         # Custom AI question processing & structured data extraction
├── SettingsManager.gs         # User configuration storage & retrieval
├── TriggerManager.gs          # Automated email checking setup
├── Sidebar.html               # User settings configuration UI
├── RuleBuilder.html           # Visual rule creation interface
├── Models.html                # Model selector with pricing info
├── Onboarding.html            # First-time setup wizard
├── appsscript.json            # Manifest with OAuth scopes
└── CLAUDE.md                  # This file
```

### Data Flow

```
Gmail Inbox
    ↓
[Apply Rules Engine] → Match email to rule(s)
    ↓
[Email Filter] → Skip if already processed or doesn't match
    ↓
[Email Conversion] → Convert to PDF/HTML/Text (optional)
    ↓
[Extract Attachments] → Filter by type/size
    ↓
[Extract PDF Text] → Extract text content from PDF attachments (if present)
    ↓
[Folder Template] → Build dynamic folder path (e.g., "2024/11/sender@company.com/")
    ↓
[File Naming] → Apply custom naming template (e.g., "2024-11-04_Subject_Line.pdf")
    ↓
[Save to Drive] → Upload email + attachments to organized folders
    ↓
[Email + PDF Content] → OpenRouter API → [AI Summary + Custom Question Answers]
    ↓
[Structured Data] → Extract answers to custom questions (e.g., invoice status, amounts, categories)
    ↓
[Combine Data] → Append row to Google Sheet with Drive links + custom columns
    ↓
[Mark as Processed] → Update tracking & apply label
```

## User Configuration

### Required Settings (Per Rule)

1. **Rule Name** - Descriptive name for this workflow (e.g., "Client Invoices", "Receipts")
2. **Gmail Filter** - Gmail search syntax (e.g., `from:client@company.com has:attachment`, `label:important`)
3. **OpenRouter API Key** - From openrouter.ai/keys (global setting)
4. **AI Model Selection** - Choice of 200+ models (can be different per rule)
5. **Google Sheet URL** - Destination spreadsheet for this rule
6. **Drive Folder URL** - Base folder where files are saved (can use Shared Drives)

### Save Options (Per Rule)

- **Save Email Body** - Yes/No
  - Format: PDF, HTML, Plain Text, or All
- **Save Attachments** - Yes/No
  - File type filters (e.g., only PDFs, only images)
  - Size limits (min/max MB)

### Organization Settings (Per Rule)

- **Folder Structure Template** - Dynamic path patterns:
  - `{year}/{month}/{day}` → `2024/11/04/`
  - `{sender_email}/{year-month}` → `client@company.com/2024-11/`
  - `{label}/{sender_name}` → `Important/John Smith/`
  - `{subject_keyword}/` → Auto-extract keywords from subject

- **File Naming Template** - Custom naming patterns:
  - `{YYYYMMDD}-{subject}.pdf` → `20241104-Invoice #1234.pdf`
  - `{sender_name}_{YYYY-MM-DD_HHmmss}` → `John Smith_2024-11-04_143022`
  - `{label}_{subject}_{attachment_name}` → `Receipt_Dinner_receipt.pdf`

### AI & Sheets Settings (Per Rule)

- **Summary Prompt** - Custom AI instruction template
- **Sheet Column Mapping** - Customize what data goes in which columns
- **AI Processing** - Enable/disable AI summarization for this rule

### Custom AI Questions (Per Rule)

Define custom questions that the AI will answer for each processed email. The AI analyzes both the email body and extracted PDF content to provide structured answers that populate specific Google Sheets columns.

**Question Configuration:**
- **Question Text** - The question to ask the AI (e.g., "Is this an invoice that needs to be paid?")
- **Column Name** - Target column in Google Sheet for the answer
- **Expected Values** - Predefined answer options (e.g., "invoice-pending", "invoice-paid", "not-invoice")
- **Answer Format** - Type of answer expected (text, number, date, boolean, category)
- **Default Value** - Fallback value if AI cannot determine answer

**Example Use Cases:**

1. **Invoice Status Detection**
   - Question: "Is this an invoice that needs to be paid?"
   - Column: "Invoice Status"
   - Expected Values: "invoice-pending", "invoice-paid", "not-invoice"
   - Format: Category

2. **Amount Extraction**
   - Question: "What is the total amount or invoice total mentioned?"
   - Column: "Amount"
   - Expected Values: Dollar amount or "N/A"
   - Format: Number

3. **Priority Classification**
   - Question: "What is the urgency level of this email?"
   - Column: "Priority"
   - Expected Values: "urgent", "normal", "low"
   - Format: Category

4. **Due Date Extraction**
   - Question: "What is the due date or deadline mentioned?"
   - Column: "Due Date"
   - Expected Values: Date in YYYY-MM-DD format or "No due date"
   - Format: Date

5. **Category Detection**
   - Question: "What category does this email belong to?"
   - Column: "Category"
   - Expected Values: "sales", "support", "billing", "hr", "other"
   - Format: Category

6. **Action Required**
   - Question: "Does this email require action from me?"
   - Column: "Action Required"
   - Expected Values: "yes", "no"
   - Format: Boolean

**Features:**
- Unlimited questions per rule (Pro tier) / 5 questions per rule (Standard tier)
- AI analyzes both email body AND PDF attachment content
- Structured output ensures consistent data format
- Multiple choice or free-form answers
- Questions can be enabled/disabled per rule
- Different questions for different rule types

### Advanced Filters (Per Rule)

- **Sender Whitelist** - Only process emails from these addresses/domains
- **Sender Blacklist** - Exclude emails from these addresses/domains
- **Subject Keywords** - Required words in subject line
- **Date Range** - Only process emails from specific date range
- **Attachment Requirements** - Must have/must not have attachments
- **Min/Max Attachment Count** - e.g., only emails with 1-5 attachments

### Global Settings

- **Processing Schedule** - How often to check for new emails (5, 10, 15, 30 minutes, or hourly)
- **Concurrent Rules** - Process all matching rules or stop after first match
- **Error Notifications** - Email me when errors occur
- **Daily Summary** - Send daily report of processed emails

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

### Email Conversion to PDF/HTML

```javascript
// EmailConverter.gs
function convertEmailToPDF(message) {
  var html = buildEmailHTML(message);

  // Create temporary HTML file
  var tempHtml = HtmlService.createHtmlOutput(html).getContent();

  // Use Google Docs to convert HTML to PDF
  var blob = Utilities.newBlob(tempHtml, 'text/html', 'temp.html');
  var file = DriveApp.createFile(blob);

  // Convert to PDF
  var pdfBlob = file.getAs('application/pdf');
  pdfBlob.setName(message.getSubject() + '.pdf');

  // Clean up temp file
  file.setTrashed(true);

  return pdfBlob;
}

function buildEmailHTML(message) {
  var html = '<html><head><style>' +
    'body { font-family: Arial, sans-serif; padding: 20px; }' +
    '.header { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }' +
    '.label { font-weight: bold; }' +
    '</style></head><body>';

  html += '<div class="header">';
  html += '<div><span class="label">From:</span> ' + message.getFrom() + '</div>';
  html += '<div><span class="label">Date:</span> ' + message.getDate() + '</div>';
  html += '<div><span class="label">Subject:</span> ' + message.getSubject() + '</div>';
  html += '</div>';

  html += '<div class="body">' + message.getBody() + '</div>';
  html += '</body></html>';

  return html;
}

function saveEmailAsHTML(message) {
  var html = buildEmailHTML(message);
  return Utilities.newBlob(html, 'text/html', message.getSubject() + '.html');
}

function saveEmailAsPlainText(message) {
  var text = 'From: ' + message.getFrom() + '\n';
  text += 'Date: ' + message.getDate() + '\n';
  text += 'Subject: ' + message.getSubject() + '\n';
  text += '\n' + message.getPlainBody();

  return Utilities.newBlob(text, 'text/plain', message.getSubject() + '.txt');
}
```

### Rules Engine

```javascript
// RulesEngine.gs
function getAllRules() {
  var props = PropertiesService.getUserProperties();
  var rulesJson = props.getProperty('RULES') || '[]';
  return JSON.parse(rulesJson);
}

function saveRule(rule) {
  var rules = getAllRules();

  // Add or update rule
  var existingIndex = rules.findIndex(r => r.id === rule.id);
  if (existingIndex >= 0) {
    rules[existingIndex] = rule;
  } else {
    rule.id = Utilities.getUuid();
    rules.push(rule);
  }

  var props = PropertiesService.getUserProperties();
  props.setProperty('RULES', JSON.stringify(rules));
  return rule;
}

function deleteRule(ruleId) {
  var rules = getAllRules();
  rules = rules.filter(r => r.id !== ruleId);

  var props = PropertiesService.getUserProperties();
  props.setProperty('RULES', JSON.stringify(rules));
}

function matchEmailToRules(message) {
  var rules = getAllRules();
  var matchedRules = [];

  rules.forEach(function(rule) {
    if (emailMatchesRule(message, rule)) {
      matchedRules.push(rule);
    }
  });

  return matchedRules;
}

function emailMatchesRule(message, rule) {
  // Check Gmail search filter
  if (rule.gmailFilter) {
    var threads = GmailApp.search(rule.gmailFilter + ' rfc822msgid:' + message.getId(), 0, 1);
    if (threads.length === 0) return false;
  }

  // Check sender whitelist
  if (rule.senderWhitelist && rule.senderWhitelist.length > 0) {
    var from = message.getFrom().toLowerCase();
    var matches = rule.senderWhitelist.some(sender => from.includes(sender.toLowerCase()));
    if (!matches) return false;
  }

  // Check sender blacklist
  if (rule.senderBlacklist && rule.senderBlacklist.length > 0) {
    var from = message.getFrom().toLowerCase();
    var blocked = rule.senderBlacklist.some(sender => from.includes(sender.toLowerCase()));
    if (blocked) return false;
  }

  // Check subject keywords
  if (rule.subjectKeywords && rule.subjectKeywords.length > 0) {
    var subject = message.getSubject().toLowerCase();
    var matches = rule.subjectKeywords.some(keyword => subject.includes(keyword.toLowerCase()));
    if (!matches) return false;
  }

  // Check attachment requirements
  if (rule.requireAttachments && message.getAttachments().length === 0) {
    return false;
  }

  return true;
}
```

### Folder Templates

```javascript
// FolderTemplates.gs
function buildFolderPath(template, message) {
  var path = template;

  // Date variables
  var date = message.getDate();
  path = path.replace(/\{year\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy'));
  path = path.replace(/\{month\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM'));
  path = path.replace(/\{day\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd'));
  path = path.replace(/\{year-month\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM'));

  // Sender variables
  var from = message.getFrom();
  var senderEmail = extractEmail(from);
  var senderName = extractName(from);

  path = path.replace(/\{sender_email\}/g, sanitizeFolderName(senderEmail));
  path = path.replace(/\{sender_name\}/g, sanitizeFolderName(senderName));

  // Subject variable
  var subject = message.getSubject();
  path = path.replace(/\{subject\}/g, sanitizeFolderName(subject));

  // Label variable (first label)
  var thread = GmailApp.getMessageById(message.getId()).getThread();
  var labels = thread.getLabels();
  if (labels.length > 0) {
    path = path.replace(/\{label\}/g, sanitizeFolderName(labels[0].getName()));
  } else {
    path = path.replace(/\{label\}/g, 'No Label');
  }

  return path;
}

function createFolderPath(baseFolderId, folderPath) {
  var parts = folderPath.split('/').filter(part => part.length > 0);
  var currentFolder = DriveApp.getFolderById(baseFolderId);

  parts.forEach(function(part) {
    var folders = currentFolder.getFoldersByName(part);
    if (folders.hasNext()) {
      currentFolder = folders.next();
    } else {
      currentFolder = currentFolder.createFolder(part);
    }
  });

  return currentFolder;
}

function sanitizeFolderName(name) {
  // Remove invalid characters for folder names
  return name.replace(/[\/\\<>:"|?*]/g, '_').substring(0, 100);
}

function extractEmail(fromString) {
  var match = fromString.match(/<(.+?)>/);
  return match ? match[1] : fromString;
}

function extractName(fromString) {
  var match = fromString.match(/^(.+?)\s*</);
  return match ? match[1].trim().replace(/["']/g, '') : fromString;
}
```

### File Naming Templates

```javascript
// FileNaming.gs
function applyFileNamingTemplate(template, message, originalFileName) {
  var fileName = template;

  // Date/time variables
  var date = message.getDate();
  fileName = fileName.replace(/\{YYYY\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy'));
  fileName = fileName.replace(/\{MM\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM'));
  fileName = fileName.replace(/\{DD\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd'));
  fileName = fileName.replace(/\{HH\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'HH'));
  fileName = fileName.replace(/\{mm\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'mm'));
  fileName = fileName.replace(/\{ss\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'ss'));

  fileName = fileName.replace(/\{YYYYMMDD\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMdd'));
  fileName = fileName.replace(/\{YYYY-MM-DD\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
  fileName = fileName.replace(/\{YYYY-MM-DD_HHmmss\}/g, Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss'));

  // Sender variables
  var from = message.getFrom();
  fileName = fileName.replace(/\{sender_email\}/g, sanitizeFileName(extractEmail(from)));
  fileName = fileName.replace(/\{sender_name\}/g, sanitizeFileName(extractName(from)));

  // Subject
  fileName = fileName.replace(/\{subject\}/g, sanitizeFileName(message.getSubject()));

  // Original attachment name
  fileName = fileName.replace(/\{attachment_name\}/g, originalFileName || 'email');

  // Add extension if not present
  if (!fileName.match(/\.\w+$/)) {
    var ext = originalFileName ? originalFileName.split('.').pop() : 'pdf';
    fileName += '.' + ext;
  }

  return fileName;
}

function sanitizeFileName(name) {
  // Remove invalid characters for file names
  return name.replace(/[\/\\<>:"|?*]/g, '_').substring(0, 150);
}
```

### Filter Manager

```javascript
// FilterManager.gs
function filterAttachments(attachments, rule) {
  if (!rule.fileFilters) return attachments;

  var filtered = attachments.filter(function(attachment) {
    var fileName = attachment.getName();
    var fileSize = attachment.getBytes().length;

    // File type filter
    if (rule.fileFilters.allowedTypes && rule.fileFilters.allowedTypes.length > 0) {
      var extension = fileName.split('.').pop().toLowerCase();
      if (!rule.fileFilters.allowedTypes.includes(extension)) {
        Logger.log('Filtered out ' + fileName + ' - wrong type');
        return false;
      }
    }

    // File size filter (in bytes)
    if (rule.fileFilters.minSize && fileSize < rule.fileFilters.minSize * 1024) {
      Logger.log('Filtered out ' + fileName + ' - too small');
      return false;
    }

    if (rule.fileFilters.maxSize && fileSize > rule.fileFilters.maxSize * 1024 * 1024) {
      Logger.log('Filtered out ' + fileName + ' - too large');
      return false;
    }

    return true;
  });

  return filtered;
}
```

### PDF Text Extraction

```javascript
// PDFExtractor.gs
function extractTextFromPDFs(attachments) {
  var extractedTexts = [];

  attachments.forEach(function(attachment) {
    var fileName = attachment.getName().toLowerCase();

    // Only process PDF files
    if (!fileName.endsWith('.pdf')) {
      return;
    }

    try {
      // Create temporary file in Drive to extract text
      var blob = attachment.copyBlob();
      var tempFile = DriveApp.createFile(blob);

      // Convert PDF to Google Doc to extract text
      var docFile = Drive.Files.copy({
        mimeType: 'application/vnd.google-apps.document'
      }, tempFile.getId());

      // Get the text content
      var doc = DocumentApp.openById(docFile.id);
      var text = doc.getBody().getText();

      extractedTexts.push({
        fileName: attachment.getName(),
        text: text.substring(0, 10000) // Limit to 10k chars per PDF
      });

      // Clean up temporary files
      DriveApp.getFileById(tempFile.getId()).setTrashed(true);
      DriveApp.getFileById(docFile.id).setTrashed(true);

      Logger.log('Extracted text from PDF: ' + attachment.getName());
    } catch (e) {
      Logger.log('Error extracting text from ' + attachment.getName() + ': ' + e);
      extractedTexts.push({
        fileName: attachment.getName(),
        text: '[PDF text extraction failed]'
      });
    }
  });

  return extractedTexts;
}

function combineEmailAndPDFContent(emailBody, pdfTexts) {
  var combined = 'EMAIL CONTENT:\n' + emailBody + '\n\n';

  if (pdfTexts && pdfTexts.length > 0) {
    combined += 'PDF ATTACHMENTS:\n\n';
    pdfTexts.forEach(function(pdf) {
      combined += '--- ' + pdf.fileName + ' ---\n';
      combined += pdf.text + '\n\n';
    });
  }

  return combined;
}
```

### Custom Questions Engine

```javascript
// CustomQuestions.gs
function processCustomQuestions(message, attachments, rule, apiKey, model) {
  // Check if rule has custom questions enabled
  if (!rule.customQuestions || rule.customQuestions.length === 0) {
    return {};
  }

  // Extract email content
  var emailBody = message.getPlainBody().substring(0, 5000);

  // Extract PDF content if present
  var pdfTexts = [];
  if (attachments && attachments.length > 0) {
    pdfTexts = extractTextFromPDFs(attachments);
  }

  // Combine email and PDF content
  var fullContent = combineEmailAndPDFContent(emailBody, pdfTexts);

  // Process each question
  var answers = {};

  rule.customQuestions.forEach(function(question) {
    if (!question.enabled) return;

    try {
      var answer = askCustomQuestion(
        fullContent,
        question,
        apiKey,
        model
      );

      answers[question.columnName] = answer;
      Logger.log('Custom question "' + question.questionText + '" answered: ' + answer);
    } catch (e) {
      Logger.log('Error processing custom question: ' + e);
      answers[question.columnName] = question.defaultValue || 'Error';
    }
  });

  return answers;
}

function askCustomQuestion(content, question, apiKey, model) {
  var url = 'https://openrouter.ai/api/v1/chat/completions';

  // Build the prompt with instructions for structured output
  var prompt = buildQuestionPrompt(question, content);

  var payload = {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are a data extraction assistant. Analyze the provided content and answer the question with ONLY the requested value. Do not add explanations or additional text."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 150,
    temperature: 0.1 // Low temperature for consistent extraction
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
      return question.defaultValue || 'API Error';
    }

    var result = JSON.parse(response.getContentText());
    var answer = result.choices[0].message.content.trim();

    // Validate answer against expected values if provided
    if (question.expectedValues && question.expectedValues.length > 0) {
      var lowerAnswer = answer.toLowerCase();
      var validValue = question.expectedValues.find(function(val) {
        return val.toLowerCase() === lowerAnswer;
      });

      if (validValue) {
        return validValue;
      } else {
        // Try partial match
        var partialMatch = question.expectedValues.find(function(val) {
          return lowerAnswer.includes(val.toLowerCase());
        });

        if (partialMatch) {
          return partialMatch;
        } else {
          Logger.log('Answer "' + answer + '" not in expected values, using default');
          return question.defaultValue || answer;
        }
      }
    }

    // Format answer based on type
    return formatAnswer(answer, question.answerFormat);

  } catch (e) {
    Logger.log('Custom question API exception: ' + e);
    return question.defaultValue || 'Error';
  }
}

function buildQuestionPrompt(question, content) {
  var prompt = 'CONTENT TO ANALYZE:\n' + content + '\n\n';
  prompt += 'QUESTION: ' + question.questionText + '\n\n';

  if (question.expectedValues && question.expectedValues.length > 0) {
    prompt += 'VALID RESPONSES (choose one):\n';
    question.expectedValues.forEach(function(val) {
      prompt += '- ' + val + '\n';
    });
    prompt += '\nRespond with ONLY one of the valid responses above.\n';
  } else {
    prompt += 'RESPONSE FORMAT: ' + question.answerFormat + '\n';
    prompt += 'Provide a concise answer in the requested format.\n';
  }

  return prompt;
}

function formatAnswer(answer, format) {
  switch(format) {
    case 'number':
      // Extract number from text
      var numMatch = answer.match(/[\d,]+\.?\d*/);
      return numMatch ? numMatch[0].replace(/,/g, '') : 'N/A';

    case 'date':
      // Validate date format
      if (answer.match(/\d{4}-\d{2}-\d{2}/)) {
        return answer;
      } else {
        return 'Invalid date';
      }

    case 'boolean':
      var lower = answer.toLowerCase();
      if (lower.includes('yes') || lower.includes('true')) return 'Yes';
      if (lower.includes('no') || lower.includes('false')) return 'No';
      return 'Unknown';

    case 'category':
    case 'text':
    default:
      return answer;
  }
}

// Update SheetsManager to support custom columns
function addToSheetWithCustomColumns(data, customAnswers, sheetUrl) {
  var sheetId = extractIdFromUrl(sheetUrl);
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheet = spreadsheet.getActiveSheet();

  // Build header row including custom columns
  var baseHeaders = ['Date', 'Sender', 'Subject', 'AI Summary', 'Attachments', 'Drive Links'];
  var customHeaders = Object.keys(customAnswers);
  var allHeaders = baseHeaders.concat(customHeaders);

  // Ensure headers exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(allHeaders);
    sheet.getRange(1, 1, 1, allHeaders.length).setFontWeight('bold');
  }

  // Build data row
  var baseData = [
    data.timestamp,
    data.sender,
    data.subject,
    data.summary,
    data.attachmentCount,
    data.driveLinks
  ];

  var customData = customHeaders.map(function(header) {
    return customAnswers[header] || '';
  });

  var rowData = baseData.concat(customData);

  // Add data row
  sheet.appendRow(rowData);

  // Format the new row
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
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

### Phase 1: MVP - Core Features (Weeks 1-2)
- [ ] Set up Google Apps Script project
- [ ] Implement OpenRouter API integration
- [ ] Build Gmail reading and filtering logic
- [ ] Create email to PDF/HTML/Text conversion
- [ ] Implement basic Drive upload (single folder)
- [ ] Build Google Sheets logging with AI summaries
- [ ] Create simple settings UI (single rule)
- [ ] Test end-to-end with manual trigger
- [ ] Add error handling and logging

**Deliverable:** Working prototype that saves emails + attachments with AI summaries

### Phase 2: Standard Edition Features (Week 3)
- [ ] Implement Rules Engine (unlimited rules)
- [ ] Build visual Rule Builder UI
- [ ] Add dynamic folder structure templates
- [ ] Implement custom file naming templates
- [ ] Create attachment filtering (type, size)
- [ ] Add sender whitelist/blacklist
- [ ] Build model selector with pricing info
- [ ] Add manual "Process Now" button
- [ ] Implement configuration validation
- [ ] Add PDF text extraction functionality
- [ ] Build Custom AI Questions engine (5 per rule limit for Standard)

**Deliverable:** Standard tier ready with multi-rule support and basic custom questions

### Phase 3: Pro Edition Features (Week 4)
- [ ] Add Shared Drive support
- [ ] Implement advanced filtering (subject keywords, date ranges)
- [ ] Add custom Sheet column mapping
- [ ] Unlock unlimited custom AI questions per rule
- [ ] Build Custom Questions UI (visual question builder)
- [ ] Add question templates library (invoices, receipts, etc.)
- [ ] Create processing dashboard/activity log
- [ ] Build onboarding wizard
- [ ] Add batch processing optimization
- [ ] Implement daily/weekly summary emails
- [ ] Add export/import rules feature

**Deliverable:** Pro tier complete with all advanced features including unlimited custom questions

### Phase 4: Polish & Testing (Week 5)
- [ ] Set up time-based triggers with configurable frequency
- [ ] Implement duplicate detection
- [ ] Add retry logic for failed API calls
- [ ] Rate limiting and quota management
- [ ] Comprehensive error handling
- [ ] Email notifications for errors
- [ ] Performance optimization
- [ ] Cross-browser testing

**Deliverable:** Production-ready code

### Phase 5: Documentation & Publishing (Week 6)
- [ ] Write comprehensive user documentation
- [ ] Create video tutorials (setup, rules, features)
- [ ] Design app icon and screenshots
- [ ] Write privacy policy and terms of service
- [ ] Security audit
- [ ] Set up support system (email, docs site)
- [ ] Google Workspace Marketplace submission
- [ ] OAuth verification review
- [ ] Beta testing with 10-20 users

**Deliverable:** Published on Marketplace

## Monetization Strategy

### Pricing Tiers (Annual Subscription)

#### Standard Edition - $69/year
**Target:** Individual users, small teams
**Features:**
- Unlimited email processing
- Save emails in PDF, HTML, or Plain Text formats
- Save attachments to Google Drive
- AI-powered email summaries (OpenRouter integration)
- Google Sheets searchable index
- **Up to 10 workflow rules**
- **Up to 5 custom AI questions per rule**
- PDF content analysis and text extraction
- Dynamic folder organization templates
- Custom file naming templates
- File type and size filtering
- Sender whitelist/blacklist
- Processing every 15-30 minutes
- Email support

**Value Proposition:** More affordable than competitors ($79.95) with AI intelligence they don't have

#### Pro Edition - $99/year
**Target:** Power users, businesses, teams
**Everything in Standard, plus:**
- **Unlimited workflow rules**
- **Unlimited custom AI questions per rule**
- **Shared Drive support** (team collaboration)
- Advanced filtering (subject keywords, date ranges, attachment count)
- Custom Google Sheets column mapping
- Processing dashboard & activity logs
- Multiple OpenRouter models per rule
- **Processing every 5-10 minutes** (faster)
- Batch processing optimization
- Export/import rules
- Daily/weekly email summaries
- **Priority support** (48-hour response)

**Value Proposition:** Feature parity with market leader ($99.95) plus unique AI capabilities

### Competitive Positioning

| Feature | Competitor ($79.95/year) | SaveMe Standard ($69) | SaveMe Pro ($99) |
|---------|--------------------------|----------------------|------------------|
| Email + Attachment Backup | ✓ | ✓ | ✓ |
| **AI Summaries** | ❌ | ✓ | ✓ |
| **Custom AI Questions** | ❌ | 5 per rule | Unlimited |
| **PDF Content Analysis** | ❌ | ✓ | ✓ |
| **Google Sheets Index** | ❌ | ✓ | ✓ |
| **User Controls AI Costs** | ❌ | ✓ | ✓ |
| Workflow Rules | 5 | 10 | Unlimited |
| Shared Drive Support | Enterprise only | ❌ | ✓ |
| Dynamic Folders | ✓ | ✓ | ✓ |
| Custom File Naming | ✓ | ✓ | ✓ |
| Processing Frequency | Hourly | 15-30 min | 5-10 min |
| Daily Email Limit | 500 | Unlimited | Unlimited |

**Key Differentiators:**
1. **AI Intelligence** - We're the only solution with AI-powered summaries
2. **Structured Data Extraction** - Custom AI questions extract specific data into Sheet columns
3. **PDF Content Analysis** - AI reads and understands PDF attachments, not just filenames
4. **Better Value** - Standard tier is $10 cheaper with unique features
5. **Searchable Database** - Sheets integration makes emails queryable
6. **User-Controlled Costs** - No hidden AI fees, choose your own model
7. **Model Flexibility** - 200+ models (GPT-4, Claude, Gemini, Llama)

### Revenue Projections

**Conservative Scenario (Year 1):**
- 100 Standard customers × $69 = $6,900
- 50 Pro customers × $99 = $4,950
- **Total:** $11,850/year

**Moderate Scenario (Year 1):**
- 500 Standard customers × $69 = $34,500
- 200 Pro customers × $99 = $19,800
- **Total:** $54,300/year

**Optimistic Scenario (Year 1):**
- 1,000 Standard customers × $69 = $69,000
- 500 Pro customers × $99 = $49,500
- **Total:** $118,500/year

**Conversion Rate Assumption:** 30% Standard, 70% Pro (based on feature value)

## Feature Enhancements (Post-Launch)

### v1.1 - Analytics & Insights (Month 3)
- Processing statistics dashboard
- Cost tracking (OpenRouter usage calculator)
- Email volume charts and trends
- Storage usage metrics
- Most active senders/labels

### v1.2 - Advanced AI Features (Month 6)
- **Enhanced Custom Questions**
  - Question templates marketplace (community-shared question sets)
  - Conditional questions (only ask if previous answer matches criteria)
  - Multi-value extraction (extract multiple items from a single email)
  - Confidence scores for extracted data
- Audio/video attachment transcription
- OCR for scanned documents and images
- Smart categorization and auto-tagging
- Advanced invoice/receipt data extraction (line items, tax breakdowns)
- Sentiment analysis
- Multi-language email translation

### v1.3 - Integrations (Month 9)
- Slack notifications for important emails
- Zapier webhooks
- Google Calendar event creation
- Task creation (Google Tasks, Todoist, Asana)
- CRM integrations (HubSpot, Salesforce)

### v1.4 - Enterprise Features (Year 2)
- Multiple Google account support
- Team management and permissions
- Centralized billing and admin dashboard
- Audit logs and compliance reporting
- SLA guarantees
- Custom model hosting options

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

**Primary Tagline:**
"The Only Gmail Backup Tool with AI-Powered Intelligence"

**Secondary Messaging:**
- "Save, Organize, and Understand Your Gmail with AI"
- "Automated Email Backup + AI Summaries + Searchable Database"
- "Gmail Archiving Meets Artificial Intelligence"
- "Bring Your Own AI Model - 200+ Choices"

**Key Value Props:**
1. **For individuals:** "Never lose important emails or attachments again - with AI summaries to find what you need fast"
2. **For businesses:** "Automate email archiving and get intelligent insights for compliance and knowledge management"
3. **For power users:** "Ultimate flexibility - choose your AI model, organize your way"

**Competitive Angle:**
- vs. Digital Inspiration: "Same backup features + AI intelligence for less money"
- vs. Manual methods: "Stop manually saving attachments - automate everything with smart organization"
- vs. Google Takeout: "Live, ongoing backup with searchable index and AI insights"

## Success Metrics

### Key Performance Indicators
- Active users (DAU/MAU)
- Email processing volume
- **Conversion rate (Standard → Pro)** - Target: 30%
- User retention (30/60/90 day) - Target: 80%/70%/60%
- Average emails processed per user
- Average rules per user (complexity indicator)
- Support ticket volume - Target: <5% of users
- User rating in Marketplace - Target: 4.5+ stars
- Net Promoter Score (NPS) - Target: 40+

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

## Next Steps - CURRENT FOCUS: Minimum Viable Launch

**Status:** Core features implemented. Now focused on Google Workspace Marketplace publishing requirements.

### Immediate Priority: Marketplace Launch Preparation

#### Phase 1: Website & Legal Requirements (Week 1)
- [ ] **Create website with required legal pages**
  - Privacy Policy (MANDATORY for OAuth verification)
  - Terms of Service (MANDATORY for OAuth verification)
  - Support/Contact page
  - Simple landing page describing SaveMyAttachments
  - Can be simple GitHub Pages or basic HTML site

- [ ] **Google Cloud Project Setup**
  - Create/configure Google Cloud Project
  - Enable required APIs (Gmail, Drive, Sheets)
  - Configure OAuth Consent Screen with:
    - App name, logo, support email
    - Links to privacy policy & terms (public URLs required)
    - Justification for each scope

#### Phase 2: OAuth Verification (Week 2-7)
- [ ] **Submit OAuth Verification Request**
  - Complete security questionnaire
  - Record video demonstration of app functionality
  - Document why each sensitive/restricted scope is needed
  - Submit to Google for review
  - **Timeline: 2-6 weeks for Google to review and approve**

#### Phase 3: Marketplace Assets (Week 2-3, parallel with OAuth)
- [ ] **Create visual assets**
  - App icon (128x128, 220x140, 32x32 pixels)
  - Screenshots (5+ showing key features)
  - Demo video (optional but recommended)

- [ ] **Prepare listing content**
  - App description (short and long versions)
  - Feature list
  - Category selection
  - Support email/URL
  - Pricing tier information

#### Phase 4: Final Testing & Polish (Week 3-4)
- [ ] **Comprehensive testing**
  - Test all features end-to-end
  - Error handling validation
  - Performance testing with large email volumes
  - Test with different Google Workspace accounts

- [ ] **Documentation review**
  - User manual complete ✅
  - In-app help text
  - Support documentation

- [ ] **Beta testing** (optional but recommended)
  - 5-10 real users
  - Collect feedback
  - Fix critical bugs

#### Phase 5: Marketplace Submission (Week 5-6)
- [ ] **Create marketplace listing**
  - Upload all assets
  - Configure pricing
  - Set up payment (if not free tier)
  - Submit for Google review

- [ ] **Final review checklist**
  - OAuth verification approved ✅
  - All legal pages live ✅
  - Assets uploaded ✅
  - Testing complete ✅
  - Support system ready ✅

### Future Enhancements (Post-Launch)

These features are planned for future releases after successful marketplace launch:

#### Phase A: Advanced Organization (v1.1)
- **Dynamic Folder Structure Templates**
  - `{year}/{month}/{day}` → `2024/11/06/`
  - `{sender_email}/{year-month}` → `client@company.com/2024-11/`
  - `{label}/{sender_name}` → `Important/John Smith/`

- **Custom File Naming Templates**
  - `{YYYYMMDD}-{subject}.pdf` → `20241104-Invoice #1234.pdf`
  - `{sender_name}_{YYYY-MM-DD_HHmmss}` → `John Smith_2024-11-04_143022`

#### Phase B: Enhanced Filtering (v1.2)
- Sender whitelist/blacklist per rule
- Subject keyword requirements
- Min/max attachment count
- Date range filtering
- Per-rule attachment filters (file type, size)

#### Phase C: Better UX (v1.3)
- Model selector UI with pricing comparison
- Processing dashboard with real-time stats
- Onboarding wizard for first-time setup
- Email notifications on errors
- Daily/weekly summary reports

#### Phase D: Power Features (v1.4)
- Export/import rules (backup/sharing)
- Custom Sheet column mapping
- Batch reprocessing of old emails
- Advanced analytics dashboard
- Multiple AI models per rule
- **Gmail label management**:
  - Automatically label processed emails (e.g., "SaveMe/Processed")
  - Visual tracking in Gmail inbox
  - Bulk remove labels tool for fresh start

---

**Current Status:** MVP features complete, documentation ready, website repository created and pushed to GitHub
**Website:** The Coral Block (thecoralblock.com)
**Repository:** https://github.com/kilo9alfa/thecoralblock
**Timeline:** 5-7 weeks to marketplace submission (2-6 weeks of that is Google OAuth review)

**Domain Strategy:**
- Domain registrar: Cloudflare (transferring from Squarespace for simplicity)
- Website hosting: Cloudflare Pages (login via Apple account)
- Email: iCloud+ Custom Email Domain (second domain, already have iCloud+)
- DNS: All managed in Cloudflare (easier - everything in one place)

**Current Status (as of Nov 8, 2025):**

**Website & Domain:**
1. ✅ Website repository created and pushed to GitHub (thecoralblock)
2. ✅ Website deployed to Cloudflare Pages (https://thecoralblock.pages.dev)
3. ✅ Privacy Policy and Terms of Service pages live
4. ✅ Product landing page for SaveMyAttachments created
5. ✅ Received Squarespace authorization code
6. ✅ Initiated domain transfer from Squarespace to Cloudflare
7. ⏳ Domain transfer pending (3-7 days, automated)

**Google Cloud Project Setup:**
8. ✅ Created Google Cloud Project (ID: savemyattachments)
9. ✅ Enabled 3 required APIs (Gmail, Drive, Sheets)
10. ✅ OAuth Consent Screen - App Information completed
11. ✅ OAuth Consent Screen - Branding completed (logo skipped)
12. 🔄 OAuth Consent Screen - Scopes section (IN PROGRESS - need to navigate to page)
13. ⏳ OAuth Consent Screen - Test Users section (next)
14. ⏳ Link Apps Script project to Cloud Project
15. ⏳ Test OAuth flow

**Strategy Decision (REVISED on Nov 8):**
- **Changed approach:** Start with dp@databeacon.aero instead of waiting for david@thecoralblock.com
- **Rationale:** Faster time to market - OAuth verification takes 2-6 weeks, domain transfer is automated anyway
- **Transfer plan:** Once david@thecoralblock.com is ready, transfer project ownership via Google Cloud IAM
- **Timeline benefit:** Start OAuth verification ~1 week earlier

**Parallel Tracks:**

**Track 1: Google Cloud & OAuth (ACTIVE NOW)**
1. ✅ Create Google Cloud Project with dp@databeacon.aero
2. 🔄 Configure OAuth Consent Screen with .pages.dev URLs (in progress - on Scopes step)
3. ⏳ Link Apps Script project
4. ⏳ Test OAuth flow
5. ⏳ Wait for domain transfer to complete (background process, 3-7 days)
6. ⏳ Transfer project ownership to david@thecoralblock.com (after email ready)
7. ⏳ Update OAuth Consent Screen with custom domain URLs and support email
8. ⏳ Prepare verification materials (video demo, written justifications)
9. ⏳ Submit for OAuth verification (2-6 weeks)

**Track 2: Domain & Email (WAITING)**
1. ✅ Domain transfer initiated (pending 3-7 days)
2. ⏳ Add custom domain to Cloudflare Pages (after transfer completes)
3. ⏳ Configure DNS in Cloudflare for iCloud email
4. ⏳ Add thecoralblock.com as second domain to iCloud+
5. ⏳ Create email addresses: david@, support@, privacy@

---

## Competitive Analysis Summary

**Main Competitor:** Save Emails to Google Drive by Digital Inspiration
- **Pricing:** $79.95/year (Standard), $99.95/year (Enterprise)
- **Strengths:** Established product, proven reliability, comprehensive backup
- **Weaknesses:** No AI features, no searchable database, hourly processing only

**Our Advantages:**
1. ✅ **AI-powered summaries** - Unique feature, high value-add
2. ✅ **Custom AI questions** - Extract structured data (invoice status, amounts, categories) into Sheet columns
3. ✅ **PDF content analysis** - AI reads and understands PDF attachments, not just filenames
4. ✅ **Google Sheets index** - Makes emails searchable/queryable with custom columns
5. ✅ **User controls AI costs** - Transparency and flexibility
6. ✅ **Better pricing** - $69 vs $79.95 for similar features
7. ✅ **Faster processing** - Every 5-10 min vs hourly
8. ✅ **200+ AI models** - Ultimate flexibility

**Feature Parity Required:**
- ✓ Email to PDF/HTML/Text conversion
- ✓ Dynamic folder organization
- ✓ Custom file naming templates
- ✓ Multiple workflow rules
- ✓ File type/size filtering
- ✓ Shared Drive support (Pro tier)

**Market Opportunity:**
- Competitor has proven market demand
- Our AI features address unmet need for email understanding
- Price point is competitive while offering more value
- Sheets integration creates vendor lock-in (good for retention)

---

**Project Status:** MVP Features Complete - Now Focused on Google Workspace Marketplace Launch
**Last Updated:** 2025-11-08
**Current Phase:** Actively configuring Google Cloud Project OAuth Consent Screen + Domain transfer in progress
**Estimated Timeline:** 4-6 weeks to marketplace submission (started OAuth setup early)
**Next Step:** Complete OAuth Consent Screen Scopes section (see Track 1 above)

## Feature Enhancement: Custom AI Questions

This feature allows users to define custom questions that the AI will answer for each processed email. The AI analyzes both the email body AND extracted PDF content to provide structured answers that populate specific Google Sheets columns.

**Key Benefits:**
- **Structured Data Extraction** - Turn unstructured email content into queryable database fields
- **Flexible & Powerful** - Ask any question, get structured answers (categories, amounts, dates, yes/no)
- **PDF-Aware** - AI reads PDF invoices, receipts, documents to extract data accurately
- **Business Intelligence** - Build dashboards, filter/sort by custom fields, track KPIs
- **Workflow Automation** - Different questions for different email types (invoices, support, sales)

**Example Use Cases:**
- Invoice management: "Payment status?", "Amount?", "Due date?"
- Customer support: "Urgency level?", "Issue category?", "Customer name?"
- Sales pipeline: "Lead quality?", "Budget mentioned?", "Next action?"
- Receipts: "Vendor name?", "Total amount?", "Expense category?"
- HR emails: "Leave dates?", "Leave type?", "Days requested?"
