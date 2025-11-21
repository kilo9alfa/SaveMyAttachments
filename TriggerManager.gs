/**
 * Trigger Management
 * Handles scheduled automation of email processing
 */

/**
 * Set up automatic email processing trigger
 *
 * @param {number} intervalMinutes - How often to run (5, 10, 15, 30, or 60)
 */
function setupAutomation(intervalMinutes) {
  // Remove any existing SaveMe triggers first
  removeAllTriggers();

  // Validate interval
  var validIntervals = [5, 10, 15, 30, 60];
  if (validIntervals.indexOf(intervalMinutes) === -1) {
    throw new Error('Invalid interval. Must be 5, 10, 15, 30, or 60 minutes.');
  }

  // Create new time-based trigger
  var trigger = ScriptApp.newTrigger('runScheduledProcessing')
    .timeBased()
    .everyMinutes(intervalMinutes)
    .create();

  // Save the trigger settings
  saveConfig('AUTOMATION_ENABLED', 'true');
  saveConfig('AUTOMATION_INTERVAL', intervalMinutes.toString());

  Logger.log('Automation enabled: every ' + intervalMinutes + ' minutes');

  return {
    enabled: true,
    interval: intervalMinutes,
    triggerId: trigger.getUniqueId()
  };
}

/**
 * This is the function that runs automatically on schedule
 * It's called by the time-based trigger
 * Now uses the Rules Engine for processing
 */
function runScheduledProcessing() {
  Logger.log('===== Scheduled processing started =====');

  try {
    var config = getConfig();

    // Check if automation is still enabled
    if (config.automationEnabled !== 'true') {
      Logger.log('Automation is disabled, skipping');
      return;
    }

    // Process new emails using rules engine
    var stats = processNewEmailsWithRules();

    Logger.log('Scheduled processing complete:');
    Logger.log('- Found: ' + stats.found);
    Logger.log('- Processed: ' + stats.processed);
    Logger.log('- Skipped: ' + stats.skipped);
    Logger.log('- Errors: ' + stats.errors);

    // Send notification email if there were errors (optional)
    if (stats.errors > 0 && config.notifyOnErrors === 'true') {
      sendErrorNotification(stats);
    }

  } catch (e) {
    Logger.log('Error in scheduled processing: ' + e.toString());

    // Log to a special error sheet (optional)
    logScheduledError(e);
  }

  Logger.log('===== Scheduled processing finished =====');
}

/**
 * Stop automation (alias for removeAllTriggers)
 */
function stopAutomation() {
  removeAllTriggers();
}

/**
 * Remove all SaveMe automation triggers
 */
function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(function(trigger) {
    // Only remove triggers for runScheduledProcessing
    if (trigger.getHandlerFunction() === 'runScheduledProcessing') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log('Deleted trigger: ' + trigger.getUniqueId());
    }
  });

  saveConfig('AUTOMATION_ENABLED', 'false');
  Logger.log('All automation triggers removed');
}

/**
 * Check if automation is currently enabled
 *
 * @return {Object} Status object with enabled and interval
 */
function getAutomationStatus() {
  var config = getConfig();
  var triggers = ScriptApp.getProjectTriggers();

  var activeTriggers = triggers.filter(function(trigger) {
    return trigger.getHandlerFunction() === 'runScheduledProcessing';
  });

  return {
    enabled: config.automationEnabled === 'true' && activeTriggers.length > 0,
    interval: parseInt(config.automationInterval || '15'),
    triggerCount: activeTriggers.length,
    lastRun: config.lastScheduledRun || 'Never'
  };
}

/**
 * Send error notification email
 *
 * @param {Object} stats - Processing statistics
 */
function sendErrorNotification(stats) {
  try {
    var userEmail = Session.getActiveUser().getEmail();

    var subject = 'SaveMe: Processing Errors (' + stats.errors + ' errors)';

    var body = 'SaveMe encountered errors during scheduled processing:\n\n';
    body += 'Processed: ' + stats.processed + '\n';
    body += 'Errors: ' + stats.errors + '\n\n';
    body += 'Error details:\n';

    stats.errorMessages.forEach(function(msg) {
      body += '- ' + msg + '\n';
    });

    body += '\n\nPlease check your Google Apps Script logs for more details.';

    GmailApp.sendEmail(userEmail, subject, body);
    Logger.log('Sent error notification to: ' + userEmail);

  } catch (e) {
    Logger.log('Failed to send error notification: ' + e.toString());
  }
}

/**
 * Log scheduled processing errors
 *
 * @param {Error} error - The error object
 */
function logScheduledError(error) {
  try {
    var sheet = getCurrentSheet();

    // Add error row with special formatting
    sheet.appendRow([
      new Date(),
      '[SYSTEM ERROR]',
      'Scheduled Processing Failed',
      error.message,
      0,
      ''
    ]);

    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 6).setBackground('#ffebee');

  } catch (e) {
    Logger.log('Failed to log error to sheet: ' + e.toString());
  }
}
