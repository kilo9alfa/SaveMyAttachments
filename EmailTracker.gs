/**
 * Email Processing Tracker
 * Keeps track of which emails have been processed to avoid duplicates
 */

/**
 * Check if an email has already been processed
 *
 * @param {string} messageId - Gmail message ID
 * @return {boolean} True if already processed
 */
function isEmailProcessed(messageId) {
  // Use v2 cache key to avoid old orphaned entries
  var cacheKeyPrefix = 'processed_v2_';

  // Check cache first (fast)
  var cache = CacheService.getUserCache();
  var cacheValue = cache.get(cacheKeyPrefix + messageId);
  if (cacheValue !== null) {
    Logger.log('Found in cache: ' + messageId);
    return true;
  }

  // Check properties (persistent) - use V2 to ignore old entries
  var props = PropertiesService.getUserProperties();
  var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES_V2') || '[]');

  var found = processed.some(function(item) {
    return item.id === messageId;
  });

  if (found) {
    Logger.log('Found in properties V2: ' + messageId);
  }

  return found;
}

/**
 * Mark an email as processed
 *
 * @param {string} messageId - Gmail message ID
 * @param {string} subject - Email subject (for logging)
 */
function markEmailAsProcessed(messageId, subject) {
  // Use v2 cache key to avoid old orphaned entries
  var cacheKeyPrefix = 'processed_v2_';
  var cache = CacheService.getUserCache();
  var cacheKey = cacheKeyPrefix + messageId;
  cache.put(cacheKey, 'true', 21600);

  // Track this cache key so we can delete it later
  var props = PropertiesService.getUserProperties();
  var cacheKeys = JSON.parse(props.getProperty('CACHE_KEYS_V2') || '[]');
  if (cacheKeys.indexOf(cacheKey) === -1) {
    cacheKeys.push(cacheKey);
    // Keep only last 1000 keys
    if (cacheKeys.length > 1000) {
      cacheKeys = cacheKeys.slice(-1000);
    }
    props.setProperty('CACHE_KEYS_V2', JSON.stringify(cacheKeys));
  }

  // Add to properties (persistent) - use V2 to start fresh
  var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES_V2') || '[]');

  processed.push({
    id: messageId,
    subject: subject,
    date: Date.now()
  });

  // Keep only last 1000 messages (prevent property size limits)
  if (processed.length > 1000) {
    processed = processed.slice(-1000);
  }

  props.setProperty('PROCESSED_MESSAGES_V2', JSON.stringify(processed));

  Logger.log('Marked as processed V2: ' + messageId + ' - ' + subject);
}

/**
 * Get count of processed emails
 *
 * @return {number} Number of processed emails
 */
function getProcessedCount() {
  var props = PropertiesService.getUserProperties();
  var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES_V2') || '[]');
  return processed.length;
}

/**
 * Clear all processed email tracking
 * Useful for testing or starting fresh
 */
function clearProcessedEmails() {
  var props = PropertiesService.getUserProperties();
  var cache = CacheService.getUserCache();

  Logger.log('Starting clear processed emails');

  // Get tracked cache keys (both V1 and V2)
  var cacheKeysV1 = JSON.parse(props.getProperty('CACHE_KEYS') || '[]');
  var cacheKeysV2 = JSON.parse(props.getProperty('CACHE_KEYS_V2') || '[]');
  var allCacheKeys = cacheKeysV1.concat(cacheKeysV2);
  Logger.log('Found ' + allCacheKeys.length + ' tracked cache keys');

  // Clear cache using tracked keys
  if (allCacheKeys.length > 0) {
    cache.removeAll(allCacheKeys);
    Logger.log('Cleared ' + allCacheKeys.length + ' cache entries');
  }

  // Also clear cache keys for all message IDs in properties (double safety)
  var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES_V2') || '[]');
  var manualKeys = [];
  for (var i = 0; i < processed.length; i++) {
    manualKeys.push('processed_v2_' + processed[i].id);
    manualKeys.push('processed_' + processed[i].id); // Old V1 format too
  }
  if (manualKeys.length > 0) {
    cache.removeAll(manualKeys);
    Logger.log('Also cleared ' + manualKeys.length + ' manual cache keys based on message IDs');
  }

  var clearedCount = processed.length;
  Logger.log('Clearing ' + clearedCount + ' processed email entries from tracking');

  // Delete properties (both V1 and V2)
  props.deleteProperty('PROCESSED_MESSAGES');    // Old V1
  props.deleteProperty('PROCESSED_MESSAGES_V2'); // New V2
  props.deleteProperty('CACHE_KEYS_V2');
  props.deleteProperty('CACHE_KEYS'); // Old version
  Logger.log('Cleared all PROCESSED_MESSAGES and CACHE_KEYS properties');

  Logger.log('✓ Cleared all processed email tracking (both Properties and Cache)');

  return clearedCount;
}

/**
 * Nuclear option: Clear ALL cache and properties
 * Use this if regular clearing doesn't work
 */
function nuclearClearEverything() {
  var props = PropertiesService.getUserProperties();
  var cache = CacheService.getUserCache();

  Logger.log('🔥 NUCLEAR CLEAR: Removing ALL cache and SaveMe properties');

  // Clear cache using tracked keys (CacheService doesn't have getKeys() method!)
  try {
    // Get all tracked cache keys from properties
    var cacheKeysV1 = JSON.parse(props.getProperty('CACHE_KEYS') || '[]');
    var cacheKeysV2 = JSON.parse(props.getProperty('CACHE_KEYS_V2') || '[]');
    var allCacheKeys = cacheKeysV1.concat(cacheKeysV2);

    if (allCacheKeys.length > 0) {
      cache.removeAll(allCacheKeys);
      Logger.log('Removed ' + allCacheKeys.length + ' tracked cache keys');
    }

    // Also try to clear common cache key patterns manually
    var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES_V2') || '[]');
    var manualKeys = [];
    for (var i = 0; i < processed.length; i++) {
      manualKeys.push('processed_v2_' + processed[i].id);
      manualKeys.push('processed_' + processed[i].id); // Old V1 format
    }
    if (manualKeys.length > 0) {
      cache.removeAll(manualKeys);
      Logger.log('Removed ' + manualKeys.length + ' manual cache keys');
    }
  } catch (e) {
    Logger.log('Cache clear error: ' + e.toString());
  }

  // Delete all SaveMe-related properties
  var allProps = props.getProperties();
  var deletedCount = 0;
  for (var key in allProps) {
    if (key.indexOf('PROCESSED') !== -1 || key.indexOf('CACHE_KEYS') !== -1 || key.indexOf('SaveMe') !== -1) {
      props.deleteProperty(key);
      deletedCount++;
      Logger.log('Deleted property: ' + key);
    }
  }

  Logger.log('Deleted ' + deletedCount + ' properties total');
  Logger.log('✓ Nuclear clear complete');

  return deletedCount;
}

/**
 * Get list of recently processed emails
 *
 * @param {number} limit - Number of recent emails to return (default: 10)
 * @return {Array} Array of processed email objects
 */
function getRecentlyProcessed(limit) {
  limit = limit || 10;

  var props = PropertiesService.getUserProperties();
  var processed = JSON.parse(props.getProperty('PROCESSED_MESSAGES_V2') || '[]');

  // Sort by date descending and return latest
  processed.sort(function(a, b) {
    return b.date - a.date;
  });

  return processed.slice(0, limit);
}
