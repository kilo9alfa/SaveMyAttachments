/**
 * Debug Manager
 * Tools for diagnosing why emails aren't being processed
 */

/**
 * Export full logs to a text file in Drive
 * Returns shareable link
 */
function exportLogsToDrive() {
  var config = getConfig();

  if (!config.folderId) {
    throw new Error('Drive folder not configured. Please set up Drive folder in settings first.');
  }

  var folder = DriveApp.getFolderById(config.folderId);

  // Get current timestamp
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  var fileName = 'SaveMe_Logs_' + timestamp + '.txt';

  // Build log content
  var logContent = '='.repeat(80) + '\n';
  logContent += 'SAVEME DEBUG LOGS\n';
  logContent += 'Generated: ' + new Date().toString() + '\n';
  logContent += '='.repeat(80) + '\n\n';

  // Add configuration
  logContent += '--- CONFIGURATION ---\n';
  logContent += JSON.stringify(config, null, 2) + '\n\n';

  // Add diagnostics
  logContent += '--- DIAGNOSTICS ---\n';
  var diagnostics = getDiagnosticsData();
  logContent += JSON.stringify(diagnostics, null, 2) + '\n\n';

  // Add recent Apps Script logs (if available from Logger)
  logContent += '--- RECENT EXECUTION LOGS ---\n';
  logContent += 'Note: Full execution logs are in Apps Script editor (View → Logs)\n';
  logContent += 'Run Process New Emails, then immediately run this export to capture logs.\n\n';

  // Add processed emails list
  logContent += '--- RECENTLY PROCESSED EMAILS ---\n';
  var recentlyProcessed = getRecentlyProcessed(20);
  if (recentlyProcessed.length > 0) {
    for (var i = 0; i < recentlyProcessed.length; i++) {
      var item = recentlyProcessed[i];
      var date = new Date(item.date);
      logContent += date.toISOString() + ' | ' + item.subject + ' | ' + item.id + '\n';
    }
  } else {
    logContent += 'No processed emails in tracking.\n';
  }
  logContent += '\n';

  // Add sheet contents
  logContent += '--- SHEET CONTENTS (First 10 rows) ---\n';
  var sheet = getCurrentSheet();
  if (sheet.getLastRow() > 0) {
    var data = sheet.getRange(1, 1, Math.min(sheet.getLastRow(), 10), sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      logContent += 'Row ' + (i + 1) + ': ' + JSON.stringify(data[i]) + '\n';
    }
  } else {
    logContent += 'Sheet is empty.\n';
  }
  logContent += '\n';

  logContent += '='.repeat(80) + '\n';
  logContent += 'END OF LOG FILE\n';
  logContent += '='.repeat(80) + '\n';

  // Create file in Drive
  var file = folder.createFile(fileName, logContent, MimeType.PLAIN_TEXT);

  // Make it shareable (anyone with link can view)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var url = file.getUrl();

  Logger.log('Logs exported to: ' + url);

  return {
    success: true,
    url: url,
    fileName: fileName
  };
}

/**
 * UI function to export logs
 */
function exportLogsUI() {
  var ui = SpreadsheetApp.getUi();

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Exporting logs to Drive...', 'SaveMe', 5);

    var result = exportLogsToDrive();

    ui.alert('Logs Exported!',
      '✅ Logs saved to Drive\n\n' +
      'File: ' + result.fileName + '\n\n' +
      '📎 Shareable link:\n' + result.url + '\n\n' +
      'You can now share this link with support or debugging.',
      ui.ButtonSet.OK);

  } catch (e) {
    ui.alert('Error', 'Failed to export logs: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Show exactly what Gmail search is being used
 */
function showSearchQuery() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  var query = buildSearchQuery(config);

  var message = '🔍 GMAIL SEARCH DETAILS\n\n';
  message += '📝 FULL SEARCH QUERY:\n';
  message += query + '\n\n';

  message += '⚙️ QUERY COMPONENTS:\n';
  message += '- Base: has:attachment\n';
  message += '- Date range: newer_than:' + config.daysBack + 'd\n';

  if (config.emailFilter) {
    message += '- Custom filter: ' + config.emailFilter + '\n';
  }
  if (config.senderFilter) {
    message += '- Sender filter: from:' + config.senderFilter + '\n';
  }
  if (config.labelFilter) {
    message += '- Label filter: label:' + config.labelFilter + '\n';
  }

  message += '\n📊 SEARCH SETTINGS:\n';
  message += '- Days back: ' + config.daysBack + '\n';
  message += '- Batch size: ' + config.batchSize + '\n';
  message += '- Min attachment size: ' + config.minAttachmentSizeKB + ' KB\n\n';

  message += '💡 TO TEST THIS QUERY:\n';
  message += '1. Copy the full query above\n';
  message += '2. Paste it in Gmail search box\n';
  message += '3. See what emails it finds';

  ui.alert('Gmail Search Query', message, ui.ButtonSet.OK);
}

/**
 * Test if a specific email would be processed
 */
function testSpecificEmail() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.prompt(
    'Test Specific Email',
    'Enter a subject line of an email you expect to be processed:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var searchSubject = response.getResponseText();
  var config = getConfig();

  Logger.log('=== TESTING SPECIFIC EMAIL ===');
  Logger.log('Looking for: ' + searchSubject);

  // Search for this specific email
  var query = 'subject:"' + searchSubject + '" has:attachment';
  Logger.log('Test query: ' + query);

  var threads = GmailApp.search(query, 0, 1);

  if (threads.length === 0) {
    ui.alert('Not Found',
      'Email not found with query:\n' + query + '\n\n' +
      'This email either:\n' +
      '1. Doesn\'t exist\n' +
      '2. Has no attachments\n' +
      '3. Is in Trash/Spam',
      ui.ButtonSet.OK);
    return;
  }

  var message = threads[0].getMessages()[0];
  var messageId = message.getId();

  // Check all the conditions
  var results = '📧 EMAIL FOUND\n\n';
  results += 'Subject: ' + message.getSubject() + '\n';
  results += 'From: ' + message.getFrom() + '\n';
  results += 'Date: ' + message.getDate() + '\n';
  results += 'Message ID: ' + messageId + '\n\n';

  // Check if processed
  var isProcessed = isEmailProcessed(messageId);
  results += '🔍 PROCESSING CHECKS:\n';
  results += '- Is processed (cache/props): ' + (isProcessed ? '❌ YES (will skip)' : '✅ NO') + '\n';

  var isInSheet = isEmailInSheet(messageId);
  results += '- Is in sheet: ' + (isInSheet ? '❌ YES (will skip)' : '✅ NO') + '\n';

  // Check attachments
  var attachments = message.getAttachments();
  results += '\n📎 ATTACHMENTS:\n';
  results += '- Total count: ' + attachments.length + '\n';

  if (attachments.length > 0) {
    for (var i = 0; i < Math.min(3, attachments.length); i++) {
      var att = attachments[i];
      var sizeKB = Math.round(att.getSize() / 1024);
      var willKeep = sizeKB >= config.minAttachmentSizeKB;
      results += '- ' + att.getName() + ' (' + sizeKB + ' KB) - ' +
                 (willKeep ? '✅ Will keep' : '❌ Too small') + '\n';
    }
  }

  // Check if it matches current search
  var currentQuery = buildSearchQuery(config);
  var matchesQuery = GmailApp.search(currentQuery + ' rfc822msgid:' + messageId, 0, 1).length > 0;

  results += '\n📋 MATCHES CURRENT SEARCH:\n';
  results += matchesQuery ? '✅ YES - Would be found' : '❌ NO - Would NOT be found';

  if (!matchesQuery) {
    results += '\n\nCurrent search query:\n' + currentQuery;
    results += '\n\nThis email doesn\'t match because it\'s either:\n';
    results += '- Older than ' + config.daysBack + ' days\n';
    results += '- Doesn\'t match filters';
  }

  ui.alert('Email Test Results', results, ui.ButtonSet.OK);
}

/**
 * List all properties and their values
 */
function showAllProperties() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getUserProperties();
  var allProps = props.getProperties();

  var message = '📦 ALL USER PROPERTIES\n\n';

  var count = 0;
  for (var key in allProps) {
    count++;
    var value = allProps[key];

    // Truncate long values
    if (value.length > 100) {
      value = value.substring(0, 100) + '... [' + value.length + ' chars]';
    }

    message += key + ':\n' + value + '\n\n';

    if (count >= 10) {
      message += '... and ' + (Object.keys(allProps).length - 10) + ' more\n';
      break;
    }
  }

  if (count === 0) {
    message += '(No properties found)';
  }

  ui.alert('User Properties', message, ui.ButtonSet.OK);
}

/**
 * Manually clear specific cache keys
 */
function manualCacheClear() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.prompt(
    'Manual Cache Clear',
    'Enter a Message ID to clear from cache (or "all" to try clearing all):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var input = response.getResponseText();
  var cache = CacheService.getUserCache();

  if (input.toLowerCase() === 'all') {
    // Try to clear all possible keys
    var cleared = 0;

    // Try V1 keys
    var props = PropertiesService.getUserProperties();
    var oldProcessed = JSON.parse(props.getProperty('PROCESSED_MESSAGES') || '[]');
    oldProcessed.forEach(function(item) {
      try {
        cache.remove('processed_' + item.id);
        cleared++;
      } catch (e) {}
    });

    // Try V2 keys
    var v2Keys = JSON.parse(props.getProperty('CACHE_KEYS_V2') || '[]');
    v2Keys.forEach(function(key) {
      try {
        cache.remove(key);
        cleared++;
      } catch (e) {}
    });

    ui.alert('Cache Clear', 'Attempted to clear ' + cleared + ' cache keys', ui.ButtonSet.OK);
  } else {
    // Clear specific message ID
    cache.remove('processed_' + input);
    cache.remove('processed_v2_' + input);
    ui.alert('Cache Clear', 'Cleared cache for message ID: ' + input, ui.ButtonSet.OK);
  }
}

/**
 * Find emails that should be processed but aren't
 */
function findMissingEmails() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig();

  SpreadsheetApp.getActiveSpreadsheet().toast('Searching for emails...', 'SaveMe', 10);

  // Search for ALL emails with attachments in date range
  var query = 'has:attachment newer_than:' + config.daysBack + 'd';
  var threads = GmailApp.search(query, 0, 10);

  var results = '🔍 EMAILS WITH ATTACHMENTS (Last ' + config.daysBack + ' days)\n\n';
  results += 'Found ' + threads.length + ' threads\n\n';

  var processed = 0;
  var notProcessed = 0;
  var noAttachments = 0;

  for (var i = 0; i < Math.min(5, threads.length); i++) {
    var message = threads[i].getMessages()[0];
    var messageId = message.getId();

    results += (i + 1) + '. ' + message.getSubject() + '\n';
    results += '   From: ' + message.getFrom() + '\n';
    results += '   Date: ' + message.getDate() + '\n';

    var attachments = message.getAttachments();
    var largeAttachments = 0;
    for (var j = 0; j < attachments.length; j++) {
      if (attachments[j].getSize() >= config.minAttachmentSizeKB * 1024) {
        largeAttachments++;
      }
    }

    results += '   Attachments: ' + attachments.length + ' total, ' + largeAttachments + ' > ' + config.minAttachmentSizeKB + 'KB\n';

    if (isEmailProcessed(messageId) || isEmailInSheet(messageId)) {
      results += '   Status: ✅ Already processed\n\n';
      processed++;
    } else if (largeAttachments === 0) {
      results += '   Status: ⚠️ No large attachments\n\n';
      noAttachments++;
    } else {
      results += '   Status: ❌ NOT PROCESSED (should be!)\n\n';
      notProcessed++;
    }
  }

  results += '\nSUMMARY:\n';
  results += '- Already processed: ' + processed + '\n';
  results += '- Not processed (should be): ' + notProcessed + '\n';
  results += '- No large attachments: ' + noAttachments;

  ui.alert('Missing Emails Analysis', results, ui.ButtonSet.OK);
}

/**
 * Reset EVERYTHING - the most aggressive clear possible
 */
function absoluteReset() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    '☢️ ABSOLUTE RESET',
    'This will:\n' +
    '1. Delete ALL user properties (including config)\n' +
    '2. Clear the sheet\n' +
    '3. Try to clear all cache\n\n' +
    'You will need to reconfigure settings after this.\n\n' +
    'Are you ABSOLUTELY sure?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    // Clear sheet
    var sheet = getCurrentSheet();
    sheet.clear();

    // Delete ALL properties
    PropertiesService.getUserProperties().deleteAllProperties();

    // Try to clear cache (best effort)
    var cache = CacheService.getUserCache();
    try {
      // We can't enumerate keys, but we can try common patterns
      for (var i = 0; i < 1000; i++) {
        try {
          cache.remove('processed_' + i);
          cache.remove('processed_v2_' + i);
        } catch (e) {}
      }
    } catch (e) {}

    ui.alert('Complete!',
      '✅ Absolute reset complete!\n\n' +
      '⚠️ You must now:\n' +
      '1. Configure Settings (API key, Drive folder)\n' +
      '2. Set your preferences\n' +
      '3. Process emails fresh\n\n' +
      'Everything has been completely reset.',
      ui.ButtonSet.OK);

  } catch (e) {
    ui.alert('Error', 'Reset failed: ' + e.message, ui.ButtonSet.OK);
  }
}