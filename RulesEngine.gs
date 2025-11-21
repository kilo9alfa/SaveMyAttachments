/**
 * Rules Engine
 * Manages multiple email processing workflows
 */

/**
 * Get all rules from storage
 * @return {Array} Array of rule objects
 */
function getAllRules() {
  var props = PropertiesService.getUserProperties();
  var rulesJson = props.getProperty('RULES') || '[]';

  try {
    return JSON.parse(rulesJson);
  } catch (e) {
    Logger.log('Error parsing RULES: ' + e.toString());
    return [];
  }
}

/**
 * Get a single rule by ID
 * @param {string} ruleId - Rule ID
 * @return {Object|null} Rule object or null if not found
 */
function getRuleById(ruleId) {
  var rules = getAllRules();

  for (var i = 0; i < rules.length; i++) {
    if (rules[i].id === ruleId) {
      return rules[i];
    }
  }

  return null;
}

/**
 * Save or update a rule
 * @param {Object} rule - Rule object to save
 * @return {Object} Saved rule with ID
 */
function saveRule(rule) {
  var rules = getAllRules();

  // Extract IDs from URLs if needed
  if (rule.driveFolderId) {
    rule.driveFolderId = extractIdFromUrl(rule.driveFolderId);
  }
  if (rule.sheetId) {
    // Extract both spreadsheet ID and gid from URL
    var sheetInfo = extractSheetInfoFromUrl(rule.sheetId);
    rule.sheetId = sheetInfo.spreadsheetId;
    rule.sheetGid = sheetInfo.gid; // Store gid for finding specific sheet
  }

  // Find existing rule
  var existingIndex = -1;
  for (var i = 0; i < rules.length; i++) {
    if (rules[i].id === rule.id) {
      existingIndex = i;
      break;
    }
  }

  // Add ID if new rule
  if (!rule.id) {
    rule.id = Utilities.getUuid();
    rule.totalProcessed = 0;
    rule.lastRun = null;
  }

  // Update or add
  if (existingIndex >= 0) {
    rules[existingIndex] = rule;
  } else {
    rules.push(rule);
  }

  // Save to properties
  var props = PropertiesService.getUserProperties();
  props.setProperty('RULES', JSON.stringify(rules));

  Logger.log('Saved rule: ' + rule.name + ' (ID: ' + rule.id + ')');

  return rule;
}

/**
 * Delete a rule
 * @param {string} ruleId - Rule ID to delete
 * @return {boolean} True if deleted
 */
function deleteRule(ruleId) {
  var rules = getAllRules();
  var initialLength = rules.length;

  // Filter out the rule
  rules = rules.filter(function(rule) {
    return rule.id !== ruleId;
  });

  if (rules.length === initialLength) {
    Logger.log('Rule not found: ' + ruleId);
    return false;
  }

  // Save updated list
  var props = PropertiesService.getUserProperties();
  props.setProperty('RULES', JSON.stringify(rules));

  Logger.log('Deleted rule: ' + ruleId);
  return true;
}

/**
 * Toggle rule enabled/disabled
 * @param {string} ruleId - Rule ID
 * @param {boolean} enabled - New enabled state
 * @return {boolean} Success
 */
function toggleRuleEnabled(ruleId, enabled) {
  var rule = getRuleById(ruleId);

  if (!rule) {
    Logger.log('Rule not found: ' + ruleId);
    return false;
  }

  rule.enabled = enabled;
  saveRule(rule);

  Logger.log('Toggled rule ' + rule.name + ': ' + (enabled ? 'enabled' : 'disabled'));
  return true;
}

/**
 * Update rule statistics after processing
 * @param {string} ruleId - Rule ID
 * @param {number} processedCount - Number of emails processed
 */
function updateRuleStats(ruleId, processedCount) {
  var rule = getRuleById(ruleId);

  if (!rule) {
    Logger.log('Rule not found for stats update: ' + ruleId);
    return;
  }

  rule.totalProcessed = (rule.totalProcessed || 0) + processedCount;
  rule.lastRun = new Date().toISOString();

  saveRule(rule);
}

/**
 * Migrate existing single config to rules system
 * Called automatically on first load
 * @return {boolean} True if migration performed
 */
function migrateToRulesIfNeeded() {
  var props = PropertiesService.getUserProperties();

  // Already using rules?
  var existingRules = props.getProperty('RULES');
  if (existingRules) {
    Logger.log('Already using rules system');
    return false;
  }

  // Has old config?
  var folderId = props.getProperty('DRIVE_FOLDER_ID');
  if (!folderId) {
    Logger.log('No existing config to migrate');
    return false;
  }

  Logger.log('=== MIGRATING TO RULES SYSTEM ===');

  // Create default rule from existing config
  var defaultRule = {
    id: Utilities.getUuid(),
    name: "My Emails (Migrated)",
    enabled: true,
    order: 1,

    // Gmail filtering
    gmailFilter: props.getProperty('EMAIL_FILTER') || 'has:attachment',

    // Destinations
    driveFolderId: folderId,
    sheetId: getCurrentSheet().getParent().getId(), // Current spreadsheet

    // AI settings (will use global if not specified)
    aiPrompt: props.getProperty('SUMMARY_PROMPT'),

    // Optional overrides (only if different from global)
    // model, daysBack, etc. will inherit from global

    // Stats
    totalProcessed: 0,
    lastRun: null
  };

  // Save as first rule
  var rules = [defaultRule];
  props.setProperty('RULES', JSON.stringify(rules));

  Logger.log('✅ Migration complete: Created default rule');
  Logger.log('   Rule name: ' + defaultRule.name);
  Logger.log('   Gmail filter: ' + defaultRule.gmailFilter);
  Logger.log('   Drive folder: ' + defaultRule.driveFolderId);

  return true;
}

/**
 * Merge rule-specific config with global config
 * Rule settings override global defaults
 *
 * @param {Object} rule - Rule object
 * @param {Object} globalConfig - Global configuration
 * @return {Object} Merged configuration
 */
function mergeRuleWithGlobalConfig(rule, globalConfig) {
  return {
    // Always use global API key
    apiKey: globalConfig.apiKey,

    // Rule-specific destinations with fallback to global
    folderId: rule.driveFolderId || globalConfig.folderId,
    sheetId: rule.sheetId || globalConfig.sheetId,
    sheetGid: rule.sheetGid || '', // Sheet gid to find specific tab

    // Rule overrides or global fallback
    model: rule.model || globalConfig.model,
    summaryPrompt: rule.aiPrompt || globalConfig.summaryPrompt,
    daysBack: rule.daysBack || globalConfig.daysBack,
    batchSize: rule.batchSize || globalConfig.batchSize,

    // AI settings
    enableAI: rule.enableAI !== undefined ? rule.enableAI : globalConfig.enableAI,
    maxTokens: rule.maxTokens || globalConfig.maxTokens,

    // What to save
    saveEmailBody: rule.saveEmailBody !== undefined ? rule.saveEmailBody : globalConfig.saveEmailBody,
    emailFormat: rule.emailFormat || globalConfig.emailFormat,
    saveAttachments: rule.saveAttachments !== undefined ? rule.saveAttachments : globalConfig.saveAttachments,

    // File settings
    minAttachmentSizeKB: rule.minAttachmentSizeKB || globalConfig.minAttachmentSizeKB,
    maxAttachmentSizeMB: rule.maxAttachmentSizeMB || globalConfig.maxAttachmentSizeMB,
    allowedExtensions: rule.allowedExtensions || globalConfig.allowedExtensions,
    disallowedExtensions: rule.disallowedExtensions || globalConfig.disallowedExtensions,

    // File naming
    fileNamingTemplate: rule.fileNamingTemplate || globalConfig.fileNamingTemplate,
    emailNamingTemplate: rule.emailNamingTemplate || globalConfig.emailNamingTemplate,

    // Processing settings
    newestFirst: globalConfig.newestFirst
  };
}

/**
 * Create an empty rule with defaults
 * Used when user clicks "Create New Rule"
 * @return {Object} Empty rule template
 */
function createEmptyRule() {
  return {
    id: null, // Will be assigned on save
    name: "New Rule",
    enabled: true,
    order: 999, // Default to low priority

    gmailFilter: "has:attachment",
    driveFolderId: "",
    sheetId: "",
    sheetGid: "",  // Sheet gid to find specific tab

    aiPrompt: "",  // Will use global if empty

    totalProcessed: 0,
    lastRun: null
  };
}
