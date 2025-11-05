/**
 * Configuration Management
 * Stores and retrieves user settings using PropertiesService
 */

/**
 * Get current configuration
 */
function getConfig() {
  var userProperties = PropertiesService.getUserProperties();

  return {
    // Core settings
    apiKey: userProperties.getProperty('OPENROUTER_API_KEY'),
    model: userProperties.getProperty('MODEL') || 'anthropic/claude-3.5-sonnet',
    folderId: userProperties.getProperty('DRIVE_FOLDER_ID'),
    maxTokens: parseInt(userProperties.getProperty('MAX_TOKENS') || '100'),

    // What to Save (NEW)
    saveEmailBody: userProperties.getProperty('SAVE_EMAIL_BODY') === 'true',
    emailFormat: userProperties.getProperty('EMAIL_FORMAT') || 'pdf',
    saveAttachments: userProperties.getProperty('SAVE_ATTACHMENTS') !== 'false', // Default true

    // File Naming (NEW)
    fileNamingTemplate: userProperties.getProperty('FILE_NAMING_TEMPLATE') || '{{Year}}.{{Month}}.{{Day}}-{{AttachmentName}}',
    emailNamingTemplate: userProperties.getProperty('EMAIL_NAMING_TEMPLATE') || '{{Year}}-{{Month}}-{{Day}}_{{Subject}}',

    // File Filtering (NEW)
    maxAttachmentSizeMB: parseInt(userProperties.getProperty('MAX_ATTACHMENT_SIZE_MB') || '0'),
    allowedExtensions: userProperties.getProperty('ALLOWED_EXTENSIONS') || '',
    disallowedExtensions: userProperties.getProperty('DISALLOWED_EXTENSIONS') || '',

    // Automation settings
    automationEnabled: userProperties.getProperty('AUTOMATION_ENABLED') || 'false',
    automationInterval: userProperties.getProperty('AUTOMATION_INTERVAL') || '15',
    batchSize: parseInt(userProperties.getProperty('BATCH_SIZE') || '10'), // Default 10 emails per batch
    daysBack: parseInt(userProperties.getProperty('DAYS_BACK') || '7'),

    // AI settings
    summaryPrompt: userProperties.getProperty('SUMMARY_PROMPT') || 'Summarize this email in 5-10 words, focusing on the main action or topic:',
    newestFirst: userProperties.getProperty('NEWEST_FIRST') !== 'false', // Default true

    // Filtering settings
    emailFilter: userProperties.getProperty('EMAIL_FILTER') || '',
    senderFilter: userProperties.getProperty('SENDER_FILTER') || '',
    labelFilter: userProperties.getProperty('LABEL_FILTER') || '',
    minAttachmentSizeKB: parseInt(userProperties.getProperty('MIN_ATTACHMENT_SIZE_KB') || '5'),

    // Notification settings
    notifyOnErrors: userProperties.getProperty('NOTIFY_ON_ERRORS') || 'false',
    lastScheduledRun: userProperties.getProperty('LAST_SCHEDULED_RUN')
  };
}

/**
 * Save a configuration value
 */
function saveConfig(key, value) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty(key, value);
  Logger.log('Saved config: ' + key);
}

/**
 * Get the current spreadsheet (where results will be logged)
 */
function getCurrentSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

/**
 * Clear all configuration (useful for testing)
 */
function clearConfig() {
  PropertiesService.getUserProperties().deleteAllProperties();
  Logger.log('Configuration cleared');
}
