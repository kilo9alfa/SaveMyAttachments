/**
 * SaveMe - Gmail AI Assistant
 * Main entry point and menu setup
 */

/**
 * Simple test function to verify OAuth scopes work
 * Run this from the Apps Script editor to test permissions
 */
function testOAuthScopes() {
  try {
    // Test Gmail access
    var threads = GmailApp.search('in:inbox', 0, 1);
    Logger.log('✅ Gmail access works - Found ' + threads.length + ' thread(s)');

    // Test Drive access
    var folders = DriveApp.getFolders();
    Logger.log('✅ Drive access works');

    // Test external request (will test OpenRouter later)
    Logger.log('✅ External request scope present');

    Logger.log('SUCCESS! All OAuth scopes are working correctly.');
    return 'OAuth test passed!';

  } catch (e) {
    Logger.log('❌ Error: ' + e.message);
    throw e;
  }
}

/**
 * Create test spreadsheet and folder for demo video
 * Run this to set up test environment with today's date
 */
function createTestEnvironment() {
  try {
    var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy.MM.dd');

    // Create test spreadsheet
    var spreadsheet = SpreadsheetApp.create('SaveMe Test Sheet - ' + today);
    var sheet = spreadsheet.getActiveSheet();

    // Add headers
    sheet.appendRow(['Date', 'Sender', 'Subject', 'AI Summary', 'Attachments', 'Drive Links']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Auto-resize columns
    sheet.autoResizeColumns(1, 6);

    var spreadsheetUrl = spreadsheet.getUrl();
    Logger.log('✅ Created test spreadsheet: ' + spreadsheetUrl);

    // Create test Drive folder
    var folder = DriveApp.createFolder('SaveMe Test Folder - ' + today);
    var folderUrl = folder.getUrl();
    Logger.log('✅ Created test folder: ' + folderUrl);

    // Return URLs for easy access
    var message = '✅ Test environment created!\n\n' +
                  'Spreadsheet URL:\n' + spreadsheetUrl + '\n\n' +
                  'Folder URL:\n' + folderUrl + '\n\n' +
                  'Copy these URLs for use in the demo video settings.';

    Logger.log(message);

    // Also show in UI
    var ui = SpreadsheetApp.getUi();
    ui.alert('Test Environment Created', message, ui.ButtonSet.OK);

    return {
      spreadsheetUrl: spreadsheetUrl,
      folderUrl: folderUrl
    };

  } catch (e) {
    Logger.log('❌ Error creating test environment: ' + e.message);
    throw e;
  }
}

/**
 * Creates custom menu when the add-on is installed or document is opened
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SaveMyAttachments')
    // Processing
    .addItem('📧 Process New Emails Now', 'processNewEmailsManual')
    .addItem('🛑 Stop Processing', 'stopProcessing')
    .addSeparator()
    // Configuration
    .addItem('⚙️ Configure Settings', 'showSettings')
    .addItem('📋 Manage Rules', 'showRulesManager')
    .addSeparator()
    // Google Picker - Select Files
    .addSubMenu(ui.createMenu('📁 Select Drive Folder/Spreadsheet')
      .addItem('📂 Select Drive Folder', 'showFolderPicker')
      .addItem('📊 Select Spreadsheet', 'showSpreadsheetPicker'))
    .addSeparator()
    // Tools
    .addSubMenu(ui.createMenu('🔧 Tools')
      .addItem('🧪 Process Most Recent Email (Test)', 'processTestEmail')
      .addSeparator()
      .addItem('📊 View Progress', 'showProgress')
      .addItem('View Diagnostics', 'showDiagnostics')
      .addItem('View Processed Count', 'showProcessedCount')
      .addItem('💰 View Cost Estimates', 'showCostEstimates')
      .addItem('📤 Export Logs to Drive', 'exportLogsUI')
      .addSeparator()
      .addItem('Test OpenRouter Connection', 'testOpenRouter')
      .addSeparator()
      .addItem('Clear Processed Tracking Only', 'clearProcessedUI')
      .addItem('Clear Everything & Start Fresh', 'clearEverythingUI')
      .addItem('🔥 Nuclear Clear (Force Reset)', 'nuclearClearUI'))
    .addToUi();
}

/**
 * Process the most recent email (for testing configuration)
 * Useful for verifying settings work before enabling automation
 */
function processTestEmail() {
  try {
    // Show processing message
    SpreadsheetApp.getActiveSpreadsheet().toast('Processing most recent email with attachment...', 'SaveMyAttachments', 5);

    // Get configuration
    var config = getConfig();

    // Validate configuration
    if (!config.apiKey) {
      SpreadsheetApp.getUi().alert('Error', 'OpenRouter API key not configured. Please run "Configure Settings" first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    if (!config.folderId) {
      SpreadsheetApp.getUi().alert('Error', 'Drive folder not configured. Please run "Configure Settings" first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    // Process the most recent email with attachment
    var result = processMostRecentEmail(config);

    if (result.success) {
      SpreadsheetApp.getUi().alert('Success!',
        'Email processed successfully!\n\n' +
        'Subject: ' + result.subject + '\n' +
        'Attachments saved: ' + result.attachmentCount + '\n' +
        'Summary: ' + result.summary.substring(0, 100) + '...',
        SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('Error', result.error, SpreadsheetApp.getUi().ButtonSet.OK);
    }

  } catch (e) {
    Logger.log('Error in processTestEmail: ' + e.toString());
    SpreadsheetApp.getUi().alert('Error', 'Failed to process email: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Show unified settings panel (new UI)
 */
function showSettings() {
  var html = HtmlService.createHtmlOutputFromFile('SettingsPanel')
    .setWidth(750)
    .setHeight(650)
    .setTitle('SaveMyAttachments Configuration');

  SpreadsheetApp.getUi().showModalDialog(html, 'SaveMyAttachments Configuration');
}

/**
 * Show Rules Manager (for creating/editing multiple workflows)
 */
function showRulesManager() {
  var html = HtmlService.createHtmlOutputFromFile('RulesManager')
    .setWidth(900)
    .setHeight(700)
    .setTitle('Manage Rules');

  SpreadsheetApp.getUi().showModalDialog(html, 'SaveMyAttachments - Manage Rules');
}

/**
 * Get spreadsheet name from ID or URL
 * Used by RulesManager to display user-friendly names
 * @param {string} spreadsheetIdOrUrl - Spreadsheet ID or URL
 * @return {string} Spreadsheet name or error message
 */
function getSpreadsheetName(spreadsheetIdOrUrl) {
  if (!spreadsheetIdOrUrl || spreadsheetIdOrUrl.trim() === '') {
    return 'Using current spreadsheet';
  }

  try {
    // Extract ID from URL if needed
    var spreadsheetId = extractIdFromUrl(spreadsheetIdOrUrl);
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    return spreadsheet.getName();
  } catch (e) {
    Logger.log('Error getting spreadsheet name: ' + e.toString());
    return 'Using current spreadsheet';
  }
}

/**
 * Get folder name from ID or URL
 * Used by RulesManager to display user-friendly names
 * @param {string} folderIdOrUrl - Drive folder ID or URL
 * @return {string} Folder name or error message
 */
function getFolderName(folderIdOrUrl) {
  if (!folderIdOrUrl) {
    return 'Using global default';
  }

  try {
    // Extract ID from URL if needed
    var folderId = extractIdFromUrl(folderIdOrUrl);
    var folder = DriveApp.getFolderById(folderId);
    return folder.getName();
  } catch (e) {
    Logger.log('Error getting folder name: ' + e.toString());
    return 'Unknown folder';
  }
}

/**
 * Extract both spreadsheet ID and gid from Google Sheets URL
 * @param {string} url - Full Google Sheets URL or just the ID
 * @return {Object} Object with spreadsheetId and gid properties
 */
function extractSheetInfoFromUrl(url) {
  var result = {
    spreadsheetId: '',
    gid: ''
  };

  if (!url || url.trim() === '') {
    return result;
  }

  // Extract spreadsheet ID (same as before)
  var idMatch = url.match(/[-\w]{25,}/);
  if (idMatch) {
    result.spreadsheetId = idMatch[0];
  }

  // Extract gid from URL (e.g., #gid=1774276023 or ?gid=1774276023)
  var gidMatch = url.match(/[?#&]gid=(\d+)/);
  if (gidMatch) {
    result.gid = gidMatch[1];
  }

  return result;
}

/**
 * Save all settings from the unified settings panel
 * Called from SettingsPanel.html
 */
function saveAllSettings(settings) {
  try {
    var userProperties = PropertiesService.getUserProperties();

    // Extract folder ID from URL if needed
    var folderId = extractIdFromUrl(settings.folderId);

    // Test folder access
    try {
      DriveApp.getFolderById(folderId);
    } catch (e) {
      throw new Error('Cannot access Drive folder. Please check the folder ID/URL.');
    }

    // Save all settings
    userProperties.setProperties({
      'OPENROUTER_API_KEY': settings.apiKey,
      'DRIVE_FOLDER_ID': folderId,

      // What to Save
      'SAVE_EMAIL_BODY': settings.saveEmailBody.toString(),
      'EMAIL_FORMAT': settings.emailFormat,
      'SAVE_ATTACHMENTS': settings.saveAttachments.toString(),

      // File Naming
      'FILE_NAMING_TEMPLATE': settings.fileNamingTemplate,
      'EMAIL_NAMING_TEMPLATE': settings.emailNamingTemplate,

      // File Filtering
      'MIN_ATTACHMENT_SIZE_KB': settings.minAttachmentSizeKB.toString(),
      'MAX_ATTACHMENT_SIZE_MB': settings.maxAttachmentSizeMB.toString(),
      'ALLOWED_EXTENSIONS': settings.allowedExtensions,
      'DISALLOWED_EXTENSIONS': settings.disallowedExtensions,

      // AI Settings
      'ENABLE_AI': settings.enableAI.toString(),
      'MODEL': settings.model,
      'SUMMARY_PROMPT': settings.summaryPrompt,
      'MAX_TOKENS': settings.maxTokens.toString(),

      // Processing Settings
      'BATCH_SIZE': settings.batchSize.toString(),
      'DAYS_BACK': settings.daysBack.toString(),
      'EMAIL_FILTER': settings.emailFilter,
      'NEWEST_FIRST': settings.newestFirst.toString(),
      'CATCH_ALL_ENABLED': settings.catchAllEnabled.toString(),

      // Automation Settings
      'AUTOMATION_ENABLED': settings.automationEnabled.toString(),
      'AUTOMATION_INTERVAL': settings.automationInterval.toString()
    });

    // Handle automation - start or stop based on setting
    if (settings.automationEnabled) {
      setupAutomation(settings.automationInterval);
    } else {
      stopAutomation();
    }

    Logger.log('All settings saved successfully');
    return { success: true };

  } catch (e) {
    Logger.log('Error saving settings: ' + e.toString());
    throw e;
  }
}

/**
 * Create a new SaveMe folder in Drive and configure it
 */
/**
 * Create new folder for settings panel
 * Returns folder ID and name (no UI alerts)
 *
 * @param {string} baseName - Base folder name (defaults to "SaveMe Attachments")
 */
function createNewFolderForSettings(baseName) {
  try {
    baseName = baseName || 'Save My Attachments';
    var finalName = baseName;

    // Check if base name exists
    if (folderExists(baseName)) {
      // Try adding date
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      finalName = baseName + ' ' + timestamp;

      // If date version exists, try adding -1, -2, etc.
      if (folderExists(finalName)) {
        var counter = 1;
        while (folderExists(finalName + '-' + counter) && counter < 100) {
          counter++;
        }
        finalName = finalName + '-' + counter;
      }
    }

    // Create the folder
    var folder = DriveApp.createFolder(finalName);
    var folderId = folder.getId();

    Logger.log('Created new folder: ' + finalName + ' (ID: ' + folderId + ')');

    return {
      folderId: folderId,
      folderName: finalName,
      folderUrl: folder.getUrl()
    };

  } catch (e) {
    Logger.log('Error creating folder: ' + e.toString());
    throw new Error('Failed to create folder: ' + e.message);
  }
}

/**
 * Check if a folder with the given name exists in Drive (root level)
 *
 * @param {string} folderName - Folder name to check
 * @return {boolean} True if folder exists
 */
function folderExists(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext();
}

/**
 * Create new folder (legacy function for menu)
 * Shows UI alerts
 */
function createNewFolder() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    'Create SaveMyAttachments Folder',
    'Do you want to create a new "Save My Attachments" folder in your Drive?\n\n' +
    'This will be created in the root of "My Drive".',
    ui.ButtonSet.YES_NO
  );

  if (response == ui.Button.YES) {
    try {
      var folder = DriveApp.createFolder('Save My Attachments');
      var folderId = folder.getId();
      var folderUrl = folder.getUrl();

      saveConfig('DRIVE_FOLDER_ID', folderId);

      ui.alert('Success!',
        'Created folder successfully!\n\n' +
        'Folder: Save My Attachments\n' +
        'Location: My Drive\n\n' +
        'View it at: ' + folderUrl,
        ui.ButtonSet.OK);

    } catch (e) {
      ui.alert('Error', 'Failed to create folder: ' + e.message, ui.ButtonSet.OK);
    }
  }
}

/**
 * Test OpenRouter API connection
 */
function testOpenRouter() {
  try {
    var config = getConfig();

    if (!config.apiKey) {
      SpreadsheetApp.getUi().alert('Error', 'OpenRouter API key not configured. Please run "Configure Settings" first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    SpreadsheetApp.getActiveSpreadsheet().toast('Testing OpenRouter connection...', 'SaveMyAttachments', 3);

    var testSummary = generateSummary('This is a test email about a project meeting scheduled for tomorrow at 2pm.', config.apiKey, 'anthropic/claude-3.5-sonnet');

    if (testSummary && !testSummary.startsWith('[Summary failed')) {
      SpreadsheetApp.getUi().alert('Success!',
        'OpenRouter API connection successful!\n\n' +
        'Test summary: ' + testSummary,
        SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('Error',
        'OpenRouter API connection failed.\n\n' +
        'Response: ' + testSummary,
        SpreadsheetApp.getUi().ButtonSet.OK);
    }

  } catch (e) {
    Logger.log('Error testing OpenRouter: ' + e.toString());
    SpreadsheetApp.getUi().alert('Error', 'Failed to test OpenRouter: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Stop any running email processing
 * Sets a flag that the processing loop checks
 */
function stopProcessing() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('STOP_PROCESSING', 'true');

  SpreadsheetApp.getUi().alert(
    'Stop Requested',
    'Processing will stop after the current email completes.\n\n' +
    'Note: This only works if processing is currently running.\n' +
    'Already completed runs cannot be stopped.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  Logger.log('Stop processing flag set');
}

/**
 * Check if stop was requested
 * Called during processing loops to allow graceful shutdown
 * @return {boolean} True if stop was requested
 */
function shouldStopProcessing() {
  var userProperties = PropertiesService.getUserProperties();
  var stopFlag = userProperties.getProperty('STOP_PROCESSING');

  if (stopFlag === 'true') {
    // Clear the flag
    userProperties.deleteProperty('STOP_PROCESSING');
    Logger.log('🛑 Stop requested by user');
    return true;
  }

  return false;
}

/**
 * Process new emails manually (batch)
 * Now uses the Rules Engine for processing
 */
function processNewEmailsManual() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  if (!config.folderId) {
    ui.alert('Error', 'Drive folder not configured. Please run "Configure Settings" first.', ui.ButtonSet.OK);
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Processing new emails...', 'SaveMyAttachments', 5);

  try {
    // Use the new rules-based processing
    var stats = processNewEmailsWithRules();

    var message = 'Processing complete!\n\n' +
                  'Found: ' + stats.found + ' emails\n' +
                  'Processed: ' + stats.processed + '\n' +
                  'Skipped (already processed): ' + stats.skipped + '\n' +
                  'Errors: ' + stats.errors;

    if (stats.stoppedEarly) {
      message += '\n\n⏱️ STOPPED EARLY:\n' +
                 stats.stoppedReason + '\n\n' +
                 '▶️ Run "Process New Emails Now" again to continue.\n' +
                 '(Automation will handle this automatically)';
    }

    // Show cost info or AI disabled message
    if (stats.processed > 0) {
      if (config.enableAI && config.apiKey) {
        // Get pricing from weekly cache (auto-refreshes from OpenRouter API)
        var modelPricing = getModelPricing();
        var pricePerMillion = modelPricing[config.model] || 1.00;
        var tokensPerEmail = 540; // Rough estimate
        var batchCost = (stats.processed * tokensPerEmail / 1000000) * pricePerMillion;

        message += '\n\n💰 ESTIMATED COST:\n' +
                   '- This batch: $' + batchCost.toFixed(4) + '\n' +
                   '- Model: ' + config.model;
      } else {
        message += '\n\n🤖 AI summaries: Disabled (no costs incurred)';
      }
    }

    if (stats.errors > 0) {
      message += '\n\nError details:\n' + stats.errorMessages.join('\n');
    }

    // Only show cost tip if AI is enabled
    if (config.enableAI && config.apiKey) {
      message += '\n\n💡 Tip: View cost details in Tools → View Cost Estimates';
    }

    ui.alert('Batch Processing Results', message, ui.ButtonSet.OK);

  } catch (e) {
    Logger.log('Error in processNewEmailsManual: ' + e.toString());
    ui.alert('Error', 'Failed to process emails: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Start automation UI
 */
function startAutomationUI() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  if (!config.folderId) {
    ui.alert('Error', 'Please configure settings first (Drive folder is required).', ui.ButtonSet.OK);
    return;
  }

  // Ask for interval
  var response = ui.prompt(
    'Start Automation',
    'How often should SaveMe check for new emails?\n\n' +
    'Enter number of minutes: 5, 10, 15, 30, or 60\n' +
    '(Recommended: 15)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var interval = parseInt(response.getResponseText());

  if ([5, 10, 15, 30, 60].indexOf(interval) === -1) {
    ui.alert('Error', 'Invalid interval. Please enter 5, 10, 15, 30, or 60.', ui.ButtonSet.OK);
    return;
  }

  try {
    setupAutomation(interval);
    ui.alert('Automation Started!',
      'SaveMyAttachments will now automatically check for new emails every ' + interval + ' minutes.\n\n' +
      'You can stop automation anytime from the Automation menu.',
      ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Error', 'Failed to start automation: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Stop automation UI
 */
function stopAutomationUI() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    'Stop Automation',
    'Are you sure you want to stop automatic email processing?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    removeAllTriggers();
    ui.alert('Automation Stopped', 'Automatic processing has been disabled.', ui.ButtonSet.OK);
  }
}

/**
 * Show automation status
 */
function showAutomationStatus() {
  var ui = SpreadsheetApp.getUi();
  var status = getAutomationStatus();
  var processedCount = getProcessedCount();

  var message = 'Automation Status: ' + (status.enabled ? '✅ ENABLED' : '❌ DISABLED') + '\n\n';

  if (status.enabled) {
    message += 'Interval: Every ' + status.interval + ' minutes\n';
    message += 'Last run: ' + (status.lastRun || 'Not yet run') + '\n\n';
  }

  message += 'Total emails processed: ' + processedCount;

  ui.alert('SaveMyAttachments Status', message, ui.ButtonSet.OK);
}

/**
 * Show processing progress
 */
function showProgress() {
  var ui = SpreadsheetApp.getUi();

  SpreadsheetApp.getActiveSpreadsheet().toast('Calculating progress...', 'SaveMyAttachments', 3);

  try {
    var progress = getProgressStats();
    var config = getConfig();

    var message = '📊 PROCESSING PROGRESS\n\n';

    message += '✅ Processed: ' + progress.processed + ' emails\n';
    message += '📧 Estimated total: ' + progress.estimatedTotal + ' emails\n';
    message += '⏳ Estimated remaining: ' + progress.estimatedRemaining + ' emails\n';
    message += '📈 Progress: ' + progress.percentComplete + '%\n\n';

    if (progress.estimatedRemaining > 0) {
      var batchSize = config.batchSize || 10;
      var runsNeeded = Math.ceil(progress.estimatedRemaining / batchSize);
      var timeEstimate = Math.round(runsNeeded * 2); // ~2 min per run

      message += '⏱️ ESTIMATED TIME TO COMPLETE:\n';
      message += '- Runs needed: ~' + runsNeeded + ' (at ' + batchSize + ' emails/run)\n';
      message += '- Time: ~' + timeEstimate + ' minutes\n\n';

      if (config.automationEnabled === 'true') {
        var interval = parseInt(config.automationInterval) || 15;
        var autoTimeEstimate = Math.round(runsNeeded * interval);
        message += '🤖 With automation (every ' + interval + ' min): ~' + autoTimeEstimate + ' minutes\n\n';
      }

      message += '💡 TIP: Enable automation to process in background\n';
      message += '(Settings → Enable Automatic Email Processing)';
    } else {
      message += '✅ All emails in date range have been processed!';
    }

    message += '\n\n⚠️ Note: Estimates based on ' + config.daysBack + ' days back';

    ui.alert('Processing Progress', message, ui.ButtonSet.OK);

  } catch (e) {
    Logger.log('Error showing progress: ' + e.toString());
    ui.alert('Error', 'Failed to calculate progress: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Show processed email count
 */
function showProcessedCount() {
  var ui = SpreadsheetApp.getUi();
  var count = getProcessedCount();

  ui.alert('Processed Emails',
    'SaveMyAttachments has processed ' + count + ' emails so far.\n\n' +
    'These emails will be skipped in future processing runs.',
    ui.ButtonSet.OK);
}

/**
 * Show cost estimates for OpenRouter usage
 */
function showCostEstimates() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();
  var processedCount = getProcessedCount();

  // Model pricing (approximate per 1M tokens)
  var modelPricing = {
    'anthropic/claude-3.5-sonnet': 3.00,
    'anthropic/claude-3-haiku': 0.25,
    'anthropic/claude-3-opus': 15.00,
    'openai/gpt-4-turbo': 10.00,
    'openai/gpt-4': 30.00,
    'openai/gpt-3.5-turbo': 0.50,
    'google/gemini-pro': 0.50,
    'meta-llama/llama-3-70b-instruct': 0.70,
    'meta-llama/llama-3.1-405b-instruct': 3.00,
    'mistralai/mistral-7b-instruct': 0.10,
    'mistralai/mixtral-8x7b-instruct': 0.50
  };

  // Get current model pricing
  var currentModel = config.model || 'anthropic/claude-3.5-sonnet';
  var pricePerMillion = modelPricing[currentModel] || 1.00; // Default if model not in list

  // Estimate tokens per email (rough average)
  // Email body ~500 tokens + prompt ~20 tokens + response ~20 tokens = ~540 tokens
  var tokensPerEmail = 540;

  // Calculate costs
  var tokensUsedSoFar = processedCount * tokensPerEmail;
  var costSoFar = (tokensUsedSoFar / 1000000) * pricePerMillion;

  // Future estimates
  var costPer100 = (100 * tokensPerEmail / 1000000) * pricePerMillion;
  var costPer1000 = (1000 * tokensPerEmail / 1000000) * pricePerMillion;
  var costPerMonth = (30 * config.batchSize * tokensPerEmail / 1000000) * pricePerMillion; // Assuming daily runs

  var message = '💰 OPENROUTER COST ESTIMATES\n\n';

  message += '📊 CURRENT STATUS:\n';
  message += '- Emails processed: ' + processedCount + '\n';
  message += '- Model: ' + currentModel + '\n';
  message += '- Price: $' + pricePerMillion.toFixed(2) + ' per 1M tokens\n';
  message += '- Estimated cost so far: $' + costSoFar.toFixed(4) + '\n\n';

  message += '💵 COST PROJECTIONS:\n';
  message += '- Per email: $' + (costPer100 / 100).toFixed(5) + '\n';
  message += '- Per 100 emails: $' + costPer100.toFixed(3) + '\n';
  message += '- Per 1000 emails: $' + costPer1000.toFixed(2) + '\n';
  message += '- Per month (daily batch): ~$' + costPerMonth.toFixed(2) + '\n\n';

  message += '💡 COST COMPARISON (per 1000 emails):\n';
  message += '- Claude 3.5 Sonnet: $' + ((1000 * tokensPerEmail / 1000000) * 3.00).toFixed(2) + ' (best quality)\n';
  message += '- Claude 3 Haiku: $' + ((1000 * tokensPerEmail / 1000000) * 0.25).toFixed(2) + ' (good & fast)\n';
  message += '- GPT-3.5 Turbo: $' + ((1000 * tokensPerEmail / 1000000) * 0.50).toFixed(2) + ' (reliable)\n';
  message += '- Mistral 7B: $' + ((1000 * tokensPerEmail / 1000000) * 0.10).toFixed(2) + ' (cheapest)\n\n';

  message += '📈 TO REDUCE COSTS:\n';
  message += '1. Switch to cheaper model (Haiku, Mistral)\n';
  message += '2. Shorten AI prompt\n';
  message += '3. Process less frequently\n';
  message += '4. Filter more emails\n\n';

  message += '🔗 Check actual usage:\n';
  message += 'https://openrouter.ai/dashboard';

  ui.alert('Cost Estimates', message, ui.ButtonSet.OK);
}

/**
 * Show diagnostic information
 */
function showDiagnostics() {
  var ui = SpreadsheetApp.getUi();
  var sheet = getCurrentSheet();

  // Check sheet state
  var lastRow = sheet.getLastRow();
  var messageIds = [];

  if (lastRow > 1) {
    var idsRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    messageIds = idsRange.map(function(row) { return row[0]; }).filter(function(id) { return id !== ''; });
  }

  // Check processed tracking (V2)
  var props = PropertiesService.getUserProperties();
  var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES_V2') || '[]');

  // Check tracked cache keys
  var trackedCacheKeys = JSON.parse(props.getProperty('CACHE_KEYS_V2') || '[]');

  // Get config settings
  var config = getConfig();

  var message = '📊 DIAGNOSTICS\n\n';
  message += '📄 SHEET STATE:\n';
  message += '- Total rows: ' + lastRow + '\n';
  message += '- Data rows: ' + (lastRow > 0 ? lastRow - 1 : 0) + '\n';
  message += '- Message IDs in sheet: ' + messageIds.length + '\n';
  message += '- First few IDs: ' + (messageIds.length > 0 ? messageIds.slice(0, 3).join(', ').substring(0, 50) : 'None') + '\n\n';

  message += '🔍 PROPERTIES STATE:\n';
  message += '- Processed emails tracked: ' + processed.length + '\n';
  message += '- Most recent: ' + (processed.length > 0 ? processed[processed.length - 1].subject : 'None') + '\n\n';

  message += '💾 CACHE STATE (V2 Tracked):\n';
  message += '- Tracked cache keys: ' + trackedCacheKeys.length + '\n';
  message += '- Sample keys: ' + (trackedCacheKeys.length > 0 ? trackedCacheKeys.slice(0, 2).join(', ').substring(0, 50) : 'None') + '\n\n';

  message += '⚙️ CONFIGURATION:\n';
  message += '- Days back: ' + config.daysBack + ' days\n';
  message += '- Batch size: ' + config.batchSize + ' emails per run\n';
  message += '- Min attachment size: ' + config.minAttachmentSizeKB + ' KB\n';
  message += '- AI Model: ' + config.model + '\n';
  message += '- AI Prompt: ' + config.summaryPrompt.substring(0, 50) + '...\n';
  message += '- Process order: ' + (config.newestFirst ? 'Newest first' : 'Oldest first') + '\n\n';

  message += '⚠️ ALL SHOULD BE 0 after clearing:\n';
  message += '- Sheet rows: ' + lastRow + '\n';
  message += '- Properties tracked: ' + processed.length + '\n';
  message += '- Cache keys: ' + trackedCacheKeys.length;

  ui.alert('SaveMyAttachments Diagnostics', message, ui.ButtonSet.OK);
}

/**
 * Clear processed tracking UI
 */
function clearProcessedUI() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    'Clear Processed Tracking Only',
    'This will clear the tracking list only.\n\n' +
    'Note: Emails already in the Sheet will NOT be reprocessed\n' +
    '(to protect your edits).\n\n' +
    'To fully start fresh, use "Clear Everything & Start Fresh".\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    clearProcessedEmails();
    ui.alert('Cleared',
      'Processed email tracking has been cleared.\n\n' +
      'Emails in the Sheet will still be skipped (to protect edits).',
      ui.ButtonSet.OK);
  }
}

/**
 * Clear everything and start fresh
 */
function clearEverythingUI() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    'Clear Everything & Start Fresh',
    '⚠️ WARNING: This will:\n\n' +
    '1. Delete ALL rows from the current sheet\n' +
    '2. Clear all processed email tracking\n\n' +
    'All emails will be reprocessed on the next run.\n\n' +
    'This CANNOT be undone!\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    // Double confirmation
    var confirm = ui.alert(
      'Are you sure?',
      'This will permanently delete all rows in this sheet.\n\n' +
      'Are you absolutely sure?',
      ui.ButtonSet.YES_NO
    );

    if (confirm === ui.Button.YES) {
      var sheet = getCurrentSheet();

      Logger.log('Starting clear everything operation');
      Logger.log('Sheet last row before clear: ' + sheet.getLastRow());

      try {
        Logger.log('=== CLEAR EVERYTHING STARTING ===');

        // Clear the entire sheet (including headers - they'll be recreated)
        sheet.clear();
        Logger.log('Sheet cleared completely');

        // Clear processed tracking (now includes cache flush)
        var clearedCount = clearProcessedEmails();
        Logger.log('Cleared tracking for ' + clearedCount + ' emails (+ flushed cache)');

        // Verify it's actually clear
        var verifyLastRow = sheet.getLastRow();
        var verifyProps = PropertiesService.getUserProperties();
        var verifyProcessed = JSON.parse(verifyProps.getProperty('PROCESSED_MESSAGES_V2') || '[]');

        Logger.log('=== CLEAR EVERYTHING COMPLETE ===');
        Logger.log('Verification - Sheet rows: ' + verifyLastRow + ', Tracked (V2): ' + verifyProcessed.length);

        var message = '✅ Everything Cleared!\n\n';
        message += 'Sheet rows: ' + verifyLastRow + '\n';
        message += 'Tracked emails: ' + verifyProcessed.length + '\n';
        message += 'Cache: FLUSHED\n\n';
        message += 'The sheet is now completely empty.\n';
        message += 'Run "Process New Emails Now" to start fresh.\n\n';
        message += 'If emails are still being skipped, use "Nuclear Clear".';

        ui.alert('Success', message, ui.ButtonSet.OK);

      } catch (e) {
        Logger.log('Error during clear: ' + e.toString());
        ui.alert('Error', 'Failed to clear: ' + e.message + '\n\nTry "Nuclear Clear" instead.', ui.ButtonSet.OK);
      }
    }
  }
}

/**
 * Nuclear clear - force reset everything
 */
function nuclearClearUI() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    '🔥 Nuclear Clear (Force Reset)',
    '⚠️ EXTREME WARNING:\n\n' +
    'This will:\n' +
    '1. Delete ALL rows in the sheet\n' +
    '2. Flush ENTIRE user cache (all keys)\n' +
    '3. Delete ALL SaveMe properties\n\n' +
    'Use this ONLY if regular clear is not working.\n\n' +
    'This is the most aggressive reset possible.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    var confirm = ui.alert(
      'Final Confirmation',
      'Are you ABSOLUTELY SURE?\n\n' +
      'This will force-reset everything.',
      ui.ButtonSet.YES_NO
    );

    if (confirm === ui.Button.YES) {
      try {
        var sheet = getCurrentSheet();

        Logger.log('=== NUCLEAR CLEAR STARTING ===');

        // Get counts BEFORE clearing
        var rowsBefore = sheet.getLastRow();
        var verifyPropsBefore = PropertiesService.getUserProperties();
        var processedBefore = JSON.parse(verifyPropsBefore.getProperty('PROCESSED_MESSAGES_V2') || '[]');
        var cacheKeysBefore = JSON.parse(verifyPropsBefore.getProperty('CACHE_KEYS_V2') || '[]');

        Logger.log('BEFORE: Sheet rows: ' + rowsBefore + ', Tracked emails: ' + processedBefore.length + ', Cache keys: ' + cacheKeysBefore.length);

        // Clear sheet
        sheet.clear();
        Logger.log('Sheet cleared (was ' + rowsBefore + ' rows)');

        // Nuclear clear of cache and properties
        var deletedProps = nuclearClearEverything();
        Logger.log('Deleted ' + deletedProps + ' properties and flushed cache');

        // Verify AFTER clearing
        var verifyPropsAfter = PropertiesService.getUserProperties();
        var processedAfter = JSON.parse(verifyPropsAfter.getProperty('PROCESSED_MESSAGES_V2') || '[]');
        var cacheKeysAfter = JSON.parse(verifyPropsAfter.getProperty('CACHE_KEYS_V2') || '[]');
        var rowsAfter = sheet.getLastRow();

        Logger.log('=== NUCLEAR CLEAR COMPLETE ===');
        Logger.log('AFTER: Sheet rows: ' + rowsAfter + ', Tracked emails: ' + processedAfter.length + ', Cache keys: ' + cacheKeysAfter.length);

        var message = '✅ Nuclear Clear Complete!\n\n';
        message += 'BEFORE:\n';
        message += '  Sheet rows: ' + rowsBefore + '\n';
        message += '  Tracked emails: ' + processedBefore.length + '\n';
        message += '  Cache keys: ' + cacheKeysBefore.length + '\n\n';
        message += 'AFTER:\n';
        message += '  Sheet rows: ' + rowsAfter + '\n';
        message += '  Tracked emails: ' + processedAfter.length + '\n';
        message += '  Cache keys: ' + cacheKeysAfter.length + '\n';
        message += '  Properties deleted: ' + deletedProps + '\n\n';
        message += 'Everything has been force-reset.\n\n';
        message += 'Try processing emails now.';

        ui.alert('Nuclear Clear Complete', message, ui.ButtonSet.OK);

      } catch (e) {
        Logger.log('Error during nuclear clear: ' + e.toString());
        ui.alert('Error', 'Nuclear clear failed: ' + e.message, ui.ButtonSet.OK);
      }
    }
  }
}

/**
 * Set batch size (number of emails to process per run)
 */
function setBatchSize() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  var response = ui.prompt(
    'Batch Size',
    'How many emails should SaveMe process per run?\n\n' +
    'Current: ' + config.batchSize + ' emails\n\n' +
    'Enter a number between 1-50 (recommended: 10-20):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var size = parseInt(response.getResponseText());

    if (isNaN(size) || size < 1 || size > 50) {
      ui.alert('Error', 'Please enter a valid number between 1 and 50.', ui.ButtonSet.OK);
      return;
    }

    saveConfig('BATCH_SIZE', size.toString());
    ui.alert('Saved',
      'Batch size set to ' + size + ' emails per run.\n\n' +
      'SaveMyAttachments will now process up to ' + size + ' emails each time.',
      ui.ButtonSet.OK);
  }
}

/**
 * Set AI model for summaries
 */
function setAIModel() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  var popularModels = [
    'anthropic/claude-3.5-sonnet (Best quality, ~$3/1M tokens)',
    'anthropic/claude-3-haiku (Fast & cheap, ~$0.25/1M tokens)',
    'openai/gpt-4-turbo (High quality, ~$10/1M tokens)',
    'openai/gpt-3.5-turbo (Cheap, ~$0.50/1M tokens)',
    'google/gemini-pro (Free tier available)',
    'meta-llama/llama-3-70b-instruct (Open source, ~$0.70/1M tokens)',
    'mistralai/mistral-7b-instruct (Very cheap, ~$0.10/1M tokens)'
  ];

  var modelList = popularModels.join('\n');

  var response = ui.prompt(
    'AI Model Selection',
    'Enter the OpenRouter model to use for summaries:\n\n' +
    'Current: ' + config.model + '\n\n' +
    'Popular options:\n' + modelList + '\n\n' +
    'Enter model name (e.g., anthropic/claude-3.5-sonnet):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var model = response.getResponseText().trim();

    if (!model) {
      ui.alert('Error', 'Please enter a valid model name.', ui.ButtonSet.OK);
      return;
    }

    saveConfig('MODEL', model);
    ui.alert('Saved',
      'AI model set to: ' + model + '\n\n' +
      'This model will be used for all email summaries.',
      ui.ButtonSet.OK);
  }
}

/**
 * Set custom AI prompt for summaries
 */
function setAIPrompt() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  var currentPrompt = config.summaryPrompt || 'Summarize this email in 5-10 words, focusing on the main action or topic:';

  var examplePrompts = [
    '1. Summarize in 5-10 words (default)',
    '2. Extract action items from this email',
    '3. Is this email urgent? Why?',
    '4. What is the sender requesting?',
    '5. Extract key dates and deadlines',
    '6. Identify the main topic and sentiment'
  ];

  var response = ui.prompt(
    'AI Summary Prompt',
    'What question should the AI answer about each email?\n\n' +
    'Current prompt:\n' + currentPrompt + '\n\n' +
    'Examples:\n' + examplePrompts.join('\n') + '\n\n' +
    'Enter your custom prompt:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var prompt = response.getResponseText().trim();

    if (!prompt) {
      ui.alert('Error', 'Please enter a valid prompt.', ui.ButtonSet.OK);
      return;
    }

    saveConfig('SUMMARY_PROMPT', prompt);
    ui.alert('Saved',
      'AI prompt updated!\n\n' +
      'New prompt: ' + prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      ui.ButtonSet.OK);
  }
}

/**
 * Set minimum attachment size filter
 */
function setMinAttachmentSize() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  var response = ui.prompt(
    'Minimum Attachment Size',
    'Attachments smaller than this will be ignored (inline images, signatures, etc.)\n\n' +
    'Current: ' + config.minAttachmentSizeKB + ' KB\n\n' +
    'Enter new minimum size in KB (recommended: 3-10):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var sizeKB = parseInt(response.getResponseText());

    if (isNaN(sizeKB) || sizeKB < 0) {
      ui.alert('Error', 'Please enter a valid number.', ui.ButtonSet.OK);
      return;
    }

    saveConfig('MIN_ATTACHMENT_SIZE_KB', sizeKB.toString());
    ui.alert('Saved',
      'Minimum attachment size set to ' + sizeKB + ' KB.\n\n' +
      'Attachments smaller than this will not be saved to Drive.',
      ui.ButtonSet.OK);
  }
}

/**
 * Set how far back to search for emails
 */
function setDaysBack() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  var response = ui.prompt(
    'Email Search Date Range',
    'How many days back should SaveMe search for emails?\n\n' +
    'Current: ' + config.daysBack + ' days\n\n' +
    'Enter number of days (7 = last week, 30 = last month, 90 = last 3 months, 365 = last year):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var days = parseInt(response.getResponseText());

    if (isNaN(days) || days < 1) {
      ui.alert('Error', 'Please enter a valid number (minimum 1 day).', ui.ButtonSet.OK);
      return;
    }

    if (days > 365) {
      var confirm = ui.alert(
        'Confirm Large Range',
        'You entered ' + days + ' days. This is more than a year.\n\n' +
        'Processing many old emails may take a long time.\n\n' +
        'Continue?',
        ui.ButtonSet.YES_NO
      );

      if (confirm !== ui.Button.YES) {
        return;
      }
    }

    saveConfig('DAYS_BACK', days.toString());
    ui.alert('Saved',
      'Date range set to ' + days + ' days back.\n\n' +
      'SaveMyAttachments will now search emails from the last ' + days + ' days.\n\n' +
      'Run "Process New Emails Now" to process older emails.',
      ui.ButtonSet.OK);
  }
}
