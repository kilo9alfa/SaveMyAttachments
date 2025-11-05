/**
 * Gmail Processing
 * Fetches and processes emails from Gmail
 */

/**
 * Process new emails in batch (main automated function)
 *
 * @param {Object} config - Configuration object
 * @return {Object} Result object with stats
 */
function processNewEmails(config) {
  config = config || getConfig();

  var stats = {
    found: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    errorMessages: []
  };

  try {
    // Build search query
    var query = buildSearchQuery(config);
    Logger.log('Search query: ' + query);

    // Get emails (batch of 20 max per run)
    var maxEmails = config.batchSize || 20;
    var threads = GmailApp.search(query, 0, 50); // Get more threads but limit messages

    if (threads.length === 0) {
      Logger.log('❌ No new emails found matching criteria');
      Logger.log('   Search query was: ' + query);
      return stats;
    }

    Logger.log('✅ Found ' + threads.length + ' thread(s) to check');
    Logger.log('   Batch limit: ' + maxEmails + ' emails');

    // Reverse threads to process newest first
    threads.reverse();
    Logger.log('   Processing order: Newest to oldest');

    var processedCount = 0;

    // Process each thread
    for (var i = 0; i < threads.length; i++) {
      // Stop if we've reached the batch limit
      if (processedCount >= maxEmails) {
        Logger.log('Reached batch limit of ' + maxEmails + ' emails, stopping');
        break;
      }

      var thread = threads[i];
      var messages = thread.getMessages();

      // Reverse messages within thread to process newest first
      messages.reverse();

      for (var j = 0; j < messages.length; j++) {
        // Stop if we've reached the batch limit
        if (processedCount >= maxEmails) {
          break;
        }

        var message = messages[j];
        var messageId = message.getId();

        stats.found++;

        Logger.log('Checking message: ' + messageId + ' - ' + message.getSubject());

        // Skip if already processed
        var isProcessed = isEmailProcessed(messageId);
        Logger.log('  isEmailProcessed() = ' + isProcessed);
        if (isProcessed) {
          Logger.log('  ❌ SKIPPING - Found in tracking (cache or properties)');
          stats.skipped++;
          continue;
        }

        // Skip if already in sheet (prevents overwriting edited rows)
        var isInSheet = isEmailInSheet(messageId);
        Logger.log('  isEmailInSheet() = ' + isInSheet);
        if (isInSheet) {
          Logger.log('  ❌ SKIPPING - Found in sheet');
          stats.skipped++;
          markEmailAsProcessed(messageId, message.getSubject()); // Mark as processed
          continue;
        }

        Logger.log('  ✅ PROCESSING this email');

        try {
          // Mark as processed BEFORE processing (prevents duplicates)
          markEmailAsProcessed(messageId, message.getSubject());

          // Process the email
          var result = processEmail(message, config);

          if (result.success) {
            stats.processed++;
            processedCount++;
          } else {
            stats.errors++;
            stats.errorMessages.push(message.getSubject() + ': ' + result.error);
          }

        } catch (e) {
          Logger.log('Error processing message ' + messageId + ': ' + e.toString());
          stats.errors++;
          stats.errorMessages.push(message.getSubject() + ': ' + e.message);
        }
      }
    }

    Logger.log('=== PROCESSING COMPLETE ===');
    Logger.log('Found: ' + stats.found + ' emails in Gmail search');
    Logger.log('Processed: ' + stats.processed + ' emails');
    Logger.log('Skipped: ' + stats.skipped + ' emails (already processed or in sheet)');
    Logger.log('Errors: ' + stats.errors + ' emails');

    if (stats.found === 0) {
      Logger.log('⚠️ No emails found - check your Gmail search query and date range');
    } else if (stats.processed === 0 && stats.found > 0) {
      Logger.log('⚠️ Emails were found but none were processed - check logs above for skip reasons');
    }

    return stats;

  } catch (e) {
    Logger.log('Error in processNewEmails: ' + e.toString());
    stats.errors++;
    stats.errorMessages.push('Fatal error: ' + e.message);
    return stats;
  }
}

/**
 * Build Gmail search query from configuration
 *
 * @param {Object} config - Configuration object
 * @return {string} Gmail search query
 */
function buildSearchQuery(config) {
  var parts = [];

  // Custom filter from config (if provided)
  if (config.emailFilter) {
    parts.push(config.emailFilter);
  } else {
    // Default: has attachment
    parts.push('has:attachment');
  }

  // Date range filter
  var daysBack = config.daysBack || 7;
  parts.push('newer_than:' + daysBack + 'd');

  // Sender filter (if configured)
  if (config.senderFilter) {
    parts.push('from:' + config.senderFilter);
  }

  // Label filter (if configured)
  if (config.labelFilter) {
    parts.push('label:' + config.labelFilter);
  }

  // Exclude already processed (future: could use Gmail labels)
  // For now we rely on the tracking system

  return parts.join(' ');
}

/**
 * Process a single email message
 *
 * @param {GmailMessage} message - Gmail message object
 * @param {Object} config - Configuration object
 * @return {Object} Result object
 */
function processEmail(message, config) {
  try {
    Logger.log('Processing: ' + message.getSubject());

    var messageId = message.getId();

    // Extract email data
    var emailData = {
      date: message.getDate(),
      from: message.getFrom(),
      subject: message.getSubject(),
      body: message.getPlainBody().substring(0, 5000), // Limit to 5000 chars
      attachments: message.getAttachments()
    };

    var allSavedFiles = []; // Track all saved files (attachments + email body)

    // 1. SAVE EMAIL BODY (if enabled)
    if (config.saveEmailBody) {
      Logger.log('  📧 Saving email body as ' + config.emailFormat + '...');
      try {
        var emailBlobs = convertEmail(message, config.emailFormat);

        for (var i = 0; i < emailBlobs.length; i++) {
          var blob = emailBlobs[i];

          // Apply email naming template
          var fileName = applyEmailNamingTemplate(config.emailNamingTemplate, message, blob.getName().split('.').pop());
          blob.setName(fileName);

          // Save to Drive
          var folder = DriveApp.getFolderById(config.folderId);
          var file = folder.createFile(blob);

          allSavedFiles.push({
            name: file.getName(),
            url: file.getUrl(),
            type: 'email'
          });

          Logger.log('  ✅ Saved email body: ' + file.getName());
        }
      } catch (e) {
        Logger.log('  ⚠️ Error saving email body: ' + e.toString());
        // Continue processing attachments even if email body fails
      }
    }

    // 2. SAVE ATTACHMENTS (if enabled)
    if (config.saveAttachments !== false) {
      // Filter attachments by size
      var filteredAttachments = filterAttachmentsBySize(emailData.attachments, config);
      Logger.log('  Total attachments: ' + emailData.attachments.length + ', After size filtering (>' + config.minAttachmentSizeKB + 'KB): ' + filteredAttachments.length);

      // Filter by extension
      filteredAttachments = filterAttachmentsByExtension(filteredAttachments, config);
      Logger.log('  After extension filtering: ' + filteredAttachments.length);

      // Save attachments
      if (filteredAttachments.length > 0) {
        var driveResult = saveAttachmentsToDrive(filteredAttachments, config, message);
        Logger.log('  💾 Saved ' + driveResult.files.length + ' attachments');

        // Add to allSavedFiles
        for (var i = 0; i < driveResult.files.length; i++) {
          driveResult.files[i].type = 'attachment';
          allSavedFiles.push(driveResult.files[i]);
        }
      }
    }

    // Check if we saved anything
    if (allSavedFiles.length === 0) {
      Logger.log('  ⚠️ SKIPPING - No files saved (no attachments or email body)');
      return {
        success: false,
        error: 'No files saved after filtering'
      };
    }

    // 3. GENERATE AI SUMMARY (once for the email)
    var summary = '[No AI summary]';
    if (config.apiKey) {
      summary = generateSummary(emailData.body, config.apiKey, config.model, config.summaryPrompt);
    }

    // 4. ADD ROWS TO SHEET (one row per saved file)
    for (var i = 0; i < allSavedFiles.length; i++) {
      var file = allSavedFiles[i];

      addToSheet({
        messageId: messageId,
        timestamp: emailData.date,
        sender: emailData.from,
        subject: emailData.subject,
        summary: summary,
        attachmentName: file.name,
        attachmentUrl: file.url
      });

      Logger.log('  ✅ Added row for: ' + file.name + ' (' + file.type + ')');
    }

    return {
      success: true,
      subject: emailData.subject,
      summary: summary,
      filesaved: allSavedFiles.length
    };

  } catch (e) {
    Logger.log('Error processing email: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Filter attachments by minimum size to exclude inline images, signatures, etc.
 *
 * @param {Array} attachments - Array of GmailAttachment objects
 * @param {Object} config - Configuration object
 * @return {Array} Filtered attachments
 */
function filterAttachmentsBySize(attachments, config) {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  // Get minimum size in KB (default 5 KB)
  var minSizeKB = config.minAttachmentSizeKB || 5;
  var minSizeBytes = minSizeKB * 1024;

  var filtered = [];

  for (var i = 0; i < attachments.length; i++) {
    var attachment = attachments[i];
    var size = attachment.getSize();

    if (size >= minSizeBytes) {
      filtered.push(attachment);
      Logger.log('Keeping attachment: ' + attachment.getName() + ' (' + Math.round(size/1024) + ' KB)');
    } else {
      Logger.log('Filtering out small attachment: ' + attachment.getName() + ' (' + Math.round(size/1024) + ' KB)');
    }
  }

  return filtered;
}

/**
 * Filter attachments by file extension
 *
 * @param {Array} attachments - Array of GmailAttachment objects
 * @param {Object} config - Configuration object
 * @return {Array} Filtered attachments
 */
function filterAttachmentsByExtension(attachments, config) {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  // If no extension filtering is configured, return all
  if (!config.allowedExtensions && !config.disallowedExtensions) {
    return attachments;
  }

  var filtered = [];

  for (var i = 0; i < attachments.length; i++) {
    var attachment = attachments[i];
    var fileName = attachment.getName();

    if (isExtensionAllowed(fileName, config.allowedExtensions, config.disallowedExtensions)) {
      filtered.push(attachment);
    }
  }

  return filtered;
}

/**
 * Process the most recent email (for manual testing)
 * This is kept for backward compatibility with the test button
 *
 * @param {Object} config - Configuration object
 * @return {Object} Result object
 */
function processMostRecentEmail(config) {
  try {
    var query = buildSearchQuery(config);
    var threads = GmailApp.search(query, 0, 1);

    if (threads.length === 0) {
      return {
        success: false,
        error: 'No emails found matching your filters in the last ' + (config.daysBack || 7) + ' days.'
      };
    }

    var messages = threads[0].getMessages();
    var message = messages[messages.length - 1];

    Logger.log('Processing most recent: ' + message.getSubject());

    var result = processEmail(message, config);

    if (result.success) {
      markEmailAsProcessed(message.getId(), message.getSubject());
      result.attachmentCount = message.getAttachments().length;
      result.subject = message.getSubject();
    }

    return result;

  } catch (e) {
    Logger.log('Error in processMostRecentEmail: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Extract sender email from "Name <email@domain.com>" format
 */
function extractEmail(fromString) {
  var match = fromString.match(/<(.+?)>/);
  return match ? match[1] : fromString;
}

/**
 * Extract sender name from "Name <email@domain.com>" format
 */
function extractName(fromString) {
  var match = fromString.match(/^(.+?)\s*</);
  return match ? match[1].trim().replace(/["']/g, '') : fromString;
}
