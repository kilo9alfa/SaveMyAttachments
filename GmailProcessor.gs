/**
 * Gmail Processing
 * Fetches and processes emails from Gmail
 */

/**
 * Process new emails using rules engine (primary function)
 * Calls migration automatically, processes all enabled rules, then catch-all if enabled
 *
 * @return {Object} Result object with stats and per-rule breakdown
 */
function processNewEmailsWithRules() {
  // Track execution time (Apps Script has 6-minute limit)
  var startTime = new Date().getTime();
  var MAX_EXECUTION_TIME = 5 * 60 * 1000; // 5 minutes

  var totalStats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    found: 0,
    errorMessages: [],
    stoppedEarly: false,
    stoppedReason: null,
    ruleBreakdown: {},
    executionTime: 0
  };

  try {
    Logger.log('=== PROCESSING WITH RULES ENGINE ===');

    // Auto-migrate from old config if needed
    migrateToRulesIfNeeded();

    // Get global config
    var globalConfig = getConfig();

    // Track which messages have been processed (to avoid duplicates across rules)
    var processedMessageIds = [];

    // Get all enabled rules, sorted by priority
    var rules = getAllRules()
      .filter(function(rule) { return rule.enabled; })
      .sort(function(a, b) { return (a.order || 999) - (b.order || 999); });

    Logger.log('Found ' + rules.length + ' enabled rule(s)');

    // STEP 1: Process each rule in order
    for (var i = 0; i < rules.length; i++) {
      // Check if user requested stop
      if (shouldStopProcessing()) {
        totalStats.stoppedEarly = true;
        totalStats.stoppedReason = 'Stopped by user request';
        break;
      }

      // Check execution time
      var elapsedTime = new Date().getTime() - startTime;
      if (elapsedTime > MAX_EXECUTION_TIME) {
        Logger.log('⏱️ Execution time limit approaching, stopping rule processing');
        totalStats.stoppedEarly = true;
        totalStats.stoppedReason = 'Execution time limit (5 minutes)';
        break;
      }

      var rule = rules[i];
      Logger.log('\n--- Processing Rule: ' + rule.name + ' ---');

      var ruleStats = processRule(rule, globalConfig, processedMessageIds, startTime, MAX_EXECUTION_TIME);

      // Add to global stats
      totalStats.found += ruleStats.found;
      totalStats.processed += ruleStats.processed;
      totalStats.skipped += ruleStats.skipped;
      totalStats.errors += ruleStats.errors;
      totalStats.ruleBreakdown[rule.name] = ruleStats;

      if (ruleStats.errorMessages.length > 0) {
        totalStats.errorMessages = totalStats.errorMessages.concat(ruleStats.errorMessages);
      }

      if (ruleStats.stoppedEarly) {
        totalStats.stoppedEarly = true;
        totalStats.stoppedReason = ruleStats.stoppedReason;
        break; // Stop processing remaining rules
      }

      // Update rule statistics
      if (ruleStats.processed > 0) {
        updateRuleStats(rule.id, ruleStats.processed);
      }
    }

    // STEP 2: Process catch-all (if enabled and time permits)
    if (globalConfig.catchAllEnabled !== false) { // Default is true
      var elapsedTime = new Date().getTime() - startTime;
      if (elapsedTime < MAX_EXECUTION_TIME) {
        Logger.log('\n--- Processing Catch-All (unmatched emails) ---');

        var catchAllStats = processCatchAll(globalConfig, processedMessageIds, startTime, MAX_EXECUTION_TIME);

        totalStats.found += catchAllStats.found;
        totalStats.processed += catchAllStats.processed;
        totalStats.skipped += catchAllStats.skipped;
        totalStats.errors += catchAllStats.errors;
        totalStats.ruleBreakdown['Catch-All'] = catchAllStats;

        if (catchAllStats.errorMessages.length > 0) {
          totalStats.errorMessages = totalStats.errorMessages.concat(catchAllStats.errorMessages);
        }

        if (catchAllStats.stoppedEarly) {
          totalStats.stoppedEarly = true;
          totalStats.stoppedReason = catchAllStats.stoppedReason;
        }
      } else {
        Logger.log('⏱️ No time remaining for catch-all processing');
        totalStats.stoppedEarly = true;
        totalStats.stoppedReason = 'Execution time limit (5 minutes)';
      }
    } else {
      Logger.log('\n--- Catch-All Disabled ---');
      Logger.log('Only rule-matched emails will be processed');
    }

    // Calculate total execution time
    totalStats.executionTime = Math.round((new Date().getTime() - startTime) / 1000);

    Logger.log('\n=== RULES ENGINE PROCESSING COMPLETE ===');
    Logger.log('Total execution time: ' + totalStats.executionTime + ' seconds');
    Logger.log('Total found: ' + totalStats.found);
    Logger.log('Total processed: ' + totalStats.processed);
    Logger.log('Total skipped: ' + totalStats.skipped);
    Logger.log('Total errors: ' + totalStats.errors);

    if (totalStats.stoppedEarly) {
      Logger.log('⚠️ STOPPED EARLY: ' + totalStats.stoppedReason);
    }

    return totalStats;

  } catch (e) {
    Logger.log('Error in processNewEmailsWithRules: ' + e.toString());
    totalStats.errors++;
    totalStats.errorMessages.push('Fatal error: ' + e.message);
    totalStats.executionTime = Math.round((new Date().getTime() - startTime) / 1000);
    return totalStats;
  }
}

/**
 * Process emails for a specific rule
 *
 * @param {Object} rule - Rule object
 * @param {Object} globalConfig - Global configuration
 * @param {Array} processedMessageIds - Array of already processed message IDs (to avoid duplicates)
 * @param {number} startTime - Processing start time
 * @param {number} maxExecutionTime - Maximum execution time in ms
 * @return {Object} Stats for this rule
 */
function processRule(rule, globalConfig, processedMessageIds, startTime, maxExecutionTime) {
  var stats = {
    found: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
    stoppedEarly: false,
    stoppedReason: null
  };

  try {
    // Merge rule config with global config
    var config = mergeRuleWithGlobalConfig(rule, globalConfig);

    // Build Gmail search query for this rule
    var query = rule.gmailFilter || 'has:attachment';

    // Add date range from global config
    var daysBack = config.daysBack || 7;
    query += ' newer_than:' + daysBack + 'd';

    Logger.log('Rule Gmail query: ' + query);

    // Search Gmail
    var threads = GmailApp.search(query, 0, 50);

    if (threads.length === 0) {
      Logger.log('No emails found for this rule');
      return stats;
    }

    Logger.log('Found ' + threads.length + ' thread(s) for rule: ' + rule.name);

    // Reverse to process newest first
    threads.reverse();

    var maxEmails = config.batchSize || 20;
    var processedCount = 0;

    // Process each thread
    for (var i = 0; i < threads.length; i++) {
      // Check execution time
      var elapsedTime = new Date().getTime() - startTime;
      if (elapsedTime > maxExecutionTime) {
        Logger.log('⏱️ Time limit reached during rule processing');
        stats.stoppedEarly = true;
        stats.stoppedReason = 'Execution time limit (5 minutes)';
        break;
      }

      // Stop if batch limit reached
      if (processedCount >= maxEmails) {
        Logger.log('Reached batch limit for this rule (' + maxEmails + ')');
        break;
      }

      var thread = threads[i];
      var messages = thread.getMessages();
      messages.reverse(); // Newest first

      for (var j = 0; j < messages.length; j++) {
        // Check if user requested stop
        if (shouldStopProcessing()) {
          stats.stoppedEarly = true;
          stats.stoppedReason = 'Stopped by user request';
          break;
        }

        // Check time again
        var elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime > maxExecutionTime) {
          stats.stoppedEarly = true;
          stats.stoppedReason = 'Execution time limit (5 minutes)';
          break;
        }

        if (processedCount >= maxEmails) {
          break;
        }

        var message = messages[j];
        var messageId = message.getId();

        stats.found++;

        // Skip if already processed by another rule in this run
        if (processedMessageIds.indexOf(messageId) !== -1) {
          Logger.log('  ⏭️ Already processed by previous rule: ' + messageId);
          stats.skipped++;
          continue;
        }

        // Skip if already processed in previous runs
        if (isEmailProcessed(messageId)) {
          Logger.log('  ❌ Already in tracking: ' + messageId);
          stats.skipped++;
          continue;
        }

        // Skip if already in sheet (check rule's specific sheet)
        if (isEmailInSheet(messageId, config.sheetId)) {
          Logger.log('  ❌ Already in sheet: ' + messageId);
          stats.skipped++;
          markEmailAsProcessed(messageId, message.getSubject());
          continue;
        }

        Logger.log('  ✅ Processing: ' + message.getSubject());

        try {
          // Mark as processed BEFORE processing
          markEmailAsProcessed(messageId, message.getSubject());
          processedMessageIds.push(messageId); // Add to run-level tracking

          // Process the email with merged config
          var result = processEmail(message, config);

          if (result.success) {
            stats.processed++;
            processedCount++;
          } else {
            stats.errors++;
            stats.errorMessages.push(rule.name + ' - ' + message.getSubject() + ': ' + result.error);
          }

        } catch (e) {
          Logger.log('  Error: ' + e.toString());
          stats.errors++;
          stats.errorMessages.push(rule.name + ' - ' + message.getSubject() + ': ' + e.message);
        }
      }

      if (stats.stoppedEarly) {
        break;
      }
    }

    Logger.log('Rule "' + rule.name + '" - Processed: ' + stats.processed + ', Skipped: ' + stats.skipped + ', Errors: ' + stats.errors);

  } catch (e) {
    Logger.log('Error processing rule "' + rule.name + '": ' + e.toString());
    stats.errors++;
    stats.errorMessages.push('Rule error: ' + e.message);
  }

  return stats;
}

/**
 * Process catch-all (emails not matched by any rule)
 *
 * @param {Object} globalConfig - Global configuration
 * @param {Array} processedMessageIds - Array of message IDs already processed by rules
 * @param {number} startTime - Processing start time
 * @param {number} maxExecutionTime - Maximum execution time in ms
 * @return {Object} Stats for catch-all
 */
function processCatchAll(globalConfig, processedMessageIds, startTime, maxExecutionTime) {
  var stats = {
    found: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
    stoppedEarly: false,
    stoppedReason: null
  };

  try {
    // Use global config for catch-all
    var config = globalConfig;

    // Build basic Gmail query (same as old single-config mode)
    var query = buildSearchQuery(config);

    Logger.log('Catch-all Gmail query: ' + query);

    // Search Gmail
    var threads = GmailApp.search(query, 0, 50);

    if (threads.length === 0) {
      Logger.log('No emails found for catch-all');
      return stats;
    }

    Logger.log('Found ' + threads.length + ' thread(s) for catch-all');

    threads.reverse();

    var maxEmails = config.batchSize || 20;
    var processedCount = 0;

    for (var i = 0; i < threads.length; i++) {
      var elapsedTime = new Date().getTime() - startTime;
      if (elapsedTime > maxExecutionTime) {
        Logger.log('⏱️ Time limit reached during catch-all processing');
        stats.stoppedEarly = true;
        stats.stoppedReason = 'Execution time limit (5 minutes)';
        break;
      }

      if (processedCount >= maxEmails) {
        break;
      }

      var thread = threads[i];
      var messages = thread.getMessages();
      messages.reverse();

      for (var j = 0; j < messages.length; j++) {
        var elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime > maxExecutionTime) {
          stats.stoppedEarly = true;
          stats.stoppedReason = 'Execution time limit (5 minutes)';
          break;
        }

        if (processedCount >= maxEmails) {
          break;
        }

        var message = messages[j];
        var messageId = message.getId();

        stats.found++;

        // Skip if already processed by a rule in this run
        if (processedMessageIds.indexOf(messageId) !== -1) {
          Logger.log('  ⏭️ Already processed by rule: ' + messageId);
          stats.skipped++;
          continue;
        }

        // Skip if already processed in previous runs
        if (isEmailProcessed(messageId)) {
          stats.skipped++;
          continue;
        }

        // Skip if already in sheet (check global sheet for catch-all)
        if (isEmailInSheet(messageId, config.sheetId)) {
          stats.skipped++;
          markEmailAsProcessed(messageId, message.getSubject());
          continue;
        }

        Logger.log('  ✅ Processing (catch-all): ' + message.getSubject());

        try {
          markEmailAsProcessed(messageId, message.getSubject());

          var result = processEmail(message, config);

          if (result.success) {
            stats.processed++;
            processedCount++;
          } else {
            stats.errors++;
            stats.errorMessages.push('Catch-all - ' + message.getSubject() + ': ' + result.error);
          }

        } catch (e) {
          Logger.log('  Error: ' + e.toString());
          stats.errors++;
          stats.errorMessages.push('Catch-all - ' + message.getSubject() + ': ' + e.message);
        }
      }

      if (stats.stoppedEarly) {
        break;
      }
    }

    Logger.log('Catch-all - Processed: ' + stats.processed + ', Skipped: ' + stats.skipped + ', Errors: ' + stats.errors);

  } catch (e) {
    Logger.log('Error in catch-all processing: ' + e.toString());
    stats.errors++;
    stats.errorMessages.push('Catch-all error: ' + e.message);
  }

  return stats;
}

/**
 * Process new emails in batch (legacy function for backwards compatibility)
 * Used by old code paths and when no rules are configured
 *
 * @param {Object} config - Configuration object
 * @return {Object} Result object with stats
 */
function processNewEmails(config) {
  config = config || getConfig();

  // Track execution time (Apps Script has 6-minute limit)
  var startTime = new Date().getTime();
  var MAX_EXECUTION_TIME = 5 * 60 * 1000; // 5 minutes (leave 1 min buffer)

  var stats = {
    found: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
    stoppedEarly: false,
    stoppedReason: null
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
      // Check execution time (stop gracefully before timeout)
      var elapsedTime = new Date().getTime() - startTime;
      if (elapsedTime > MAX_EXECUTION_TIME) {
        Logger.log('⏱️ Execution time limit approaching (' + Math.round(elapsedTime / 1000) + 's), stopping gracefully');
        stats.stoppedEarly = true;
        stats.stoppedReason = 'Execution time limit (5 minutes)';
        break;
      }

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
        // Check execution time in inner loop too
        var elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime > MAX_EXECUTION_TIME) {
          Logger.log('⏱️ Time limit reached in message processing');
          stats.stoppedEarly = true;
          stats.stoppedReason = 'Execution time limit (5 minutes)';
          break;
        }

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

    var totalTime = Math.round((new Date().getTime() - startTime) / 1000);

    Logger.log('=== PROCESSING COMPLETE ===');
    Logger.log('Total execution time: ' + totalTime + ' seconds');
    Logger.log('Found: ' + stats.found + ' emails in Gmail search');
    Logger.log('Processed: ' + stats.processed + ' emails');
    Logger.log('Skipped: ' + stats.skipped + ' emails (already processed or in sheet)');
    Logger.log('Errors: ' + stats.errors + ' emails');

    if (stats.stoppedEarly) {
      Logger.log('⚠️ STOPPED EARLY: ' + stats.stoppedReason);
      Logger.log('   Run again to continue processing remaining emails');
    }

    if (stats.found === 0) {
      Logger.log('⚠️ No emails found - check your Gmail search query and date range');
    } else if (stats.processed === 0 && stats.found > 0) {
      Logger.log('⚠️ Emails were found but none were processed - check logs above for skip reasons');
    }

    return stats;

  } catch (e) {
    Logger.log('Error in processNewEmails: ' + e.toString());

    // Check for specific quota/limit errors
    var errorMsg = e.toString();

    if (errorMsg.indexOf('quota') !== -1 || errorMsg.indexOf('limit') !== -1 || errorMsg.indexOf('rate') !== -1) {
      Logger.log('⚠️ QUOTA/RATE LIMIT ERROR DETECTED');
      stats.errors++;
      stats.errorMessages.push('Gmail API quota exceeded. Wait 24 hours or reduce batch size.');
      stats.stoppedEarly = true;
      stats.stoppedReason = 'Gmail API quota exceeded';
    } else if (errorMsg.indexOf('timeout') !== -1 || errorMsg.indexOf('Exceeded maximum execution time') !== -1) {
      Logger.log('⏱️ EXECUTION TIMEOUT');
      stats.errors++;
      stats.errorMessages.push('Execution timeout. Reduce batch size.');
      stats.stoppedEarly = true;
      stats.stoppedReason = 'Execution timeout (> 6 minutes)';
    } else {
      stats.errors++;
      stats.errorMessages.push('Fatal error: ' + e.message);
    }

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

          // Save to Drive using Advanced Drive Service v2 (drive.file scope compatible)
          var fileMetadata = {
            title: fileName,
            parents: [{ id: config.folderId }]
          };
          var file = Drive.Files.insert(fileMetadata, blob);

          allSavedFiles.push({
            name: file.title,
            url: file.alternateLink,
            type: 'email'
          });

          Logger.log('  Saved email body: ' + file.title);
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

    // 3. GENERATE AI SUMMARY (once for the email, if enabled)
    var summary = '';
    if (config.enableAI && config.apiKey && emailData.body && emailData.body.trim().length > 0) {
      Logger.log('  🤖 Generating AI summary...');
      summary = generateSummary(emailData.body, config.apiKey, config.model, config.summaryPrompt);
    } else {
      if (!config.enableAI) {
        Logger.log('  ⚠️ AI summary disabled in settings');
      } else if (!config.apiKey) {
        Logger.log('  ⚠️ No API key configured');
      } else if (!emailData.body || emailData.body.trim().length === 0) {
        Logger.log('  ⚠️ Email has no body, skipping AI summary');
      }
    }

    // 4. ADD ROWS TO SHEET (one row per saved file)
    // If inserting at top (newestFirst), add files in REVERSE order
    // so they end up in correct order after being pushed down
    var insertAtTop = config.newestFirst || true;

    if (insertAtTop) {
      // Reverse order: last file first, so it ends up at bottom of email's files
      for (var i = allSavedFiles.length - 1; i >= 0; i--) {
        var file = allSavedFiles[i];

        addToSheet({
          messageId: messageId,
          timestamp: emailData.date,
          sender: emailData.from,
          subject: emailData.subject,
          summary: summary,
          attachmentName: file.name,
          attachmentUrl: file.url
        }, config.sheetId, config.sheetGid);

        Logger.log('  ✅ Added row for: ' + file.name + ' (' + file.type + ')');
      }
    } else {
      // Normal order when appending at bottom
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
        }, config.sheetId, config.sheetGid);

        Logger.log('  ✅ Added row for: ' + file.name + ' (' + file.type + ')');
      }
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
