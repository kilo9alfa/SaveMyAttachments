/**
 * OpenRouter API Integration
 * Handles AI summarization via OpenRouter.ai
 */

/**
 * Generate an AI summary of email content
 *
 * @param {string} emailContent - The email body text to summarize
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model - Model to use (default: anthropic/claude-3.5-sonnet)
 * @param {string} customPrompt - Optional custom prompt
 * @return {string} AI-generated summary
 */
function generateSummary(emailContent, apiKey, model, customPrompt) {
  var url = 'https://openrouter.ai/api/v1/chat/completions';

  var prompt = customPrompt || 'Summarize this email in 5-10 words, focusing on the main action or topic:';

  var payload = {
    model: model || 'anthropic/claude-3.5-sonnet',
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
    Logger.log('Calling OpenRouter API...');
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    Logger.log('OpenRouter response code: ' + responseCode);

    if (responseCode !== 200) {
      var errorText = response.getContentText();
      Logger.log('OpenRouter API Error: ' + errorText);

      // Check for specific error types
      if (responseCode === 429) {
        Logger.log('⚠️ OpenRouter rate limit exceeded');
        return '[Summary failed - Rate limit exceeded]';
      } else if (responseCode === 401) {
        Logger.log('⚠️ OpenRouter API key invalid');
        return '[Summary failed - Invalid API key]';
      } else if (responseCode === 402) {
        Logger.log('⚠️ OpenRouter insufficient credits');
        return '[Summary failed - Insufficient credits]';
      } else {
        return '[Summary failed - API Error: ' + responseCode + ']';
      }
    }

    var result = JSON.parse(response.getContentText());
    var summary = result.choices[0].message.content.trim();

    Logger.log('Summary generated: ' + summary);
    return summary;

  } catch (e) {
    var errorMsg = e.toString();
    Logger.log('OpenRouter API Exception: ' + errorMsg);

    // Provide helpful error messages
    if (errorMsg.indexOf('DNS') !== -1 || errorMsg.indexOf('network') !== -1) {
      return '[Summary failed - Network error]';
    } else if (errorMsg.indexOf('timeout') !== -1) {
      return '[Summary failed - Request timeout]';
    } else {
      return '[Summary failed - ' + e.message + ']';
    }
  }
}

/**
 * Get list of available models from OpenRouter
 * (For future use in model selector UI)
 */
function fetchAvailableModels() {
  var url = 'https://openrouter.ai/api/v1/models';

  try {
    var response = UrlFetchApp.fetch(url);
    return JSON.parse(response.getContentText()).data;
  } catch (e) {
    Logger.log('Error fetching models: ' + e.toString());
    return [];
  }
}

/**
 * Get model pricing with weekly cache
 * Fetches from OpenRouter API and caches for 7 days
 * Falls back to hardcoded pricing if API fails
 *
 * @return {Object} Model pricing map (model ID -> price per million tokens)
 */
function getModelPricing() {
  var userProperties = PropertiesService.getUserProperties();
  var cachedPricing = userProperties.getProperty('MODEL_PRICING_CACHE');
  var cacheTimestamp = userProperties.getProperty('MODEL_PRICING_TIMESTAMP');

  // Check if cache is valid (less than 7 days old)
  var now = new Date().getTime();
  var weekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  if (cachedPricing && cacheTimestamp) {
    var age = now - parseInt(cacheTimestamp);
    if (age < weekInMs) {
      Logger.log('Using cached model pricing (age: ' + Math.round(age / (24 * 60 * 60 * 1000)) + ' days)');
      return JSON.parse(cachedPricing);
    }
  }

  // Cache expired or missing - fetch fresh pricing
  Logger.log('Fetching fresh model pricing from OpenRouter...');

  try {
    var models = fetchAvailableModels();
    var pricing = {};

    models.forEach(function(model) {
      if (model.pricing && model.pricing.prompt) {
        // OpenRouter returns pricing in dollars per token, convert to per million tokens
        var pricePerToken = parseFloat(model.pricing.prompt);
        pricing[model.id] = pricePerToken * 1000000;
      }
    });

    // Cache the pricing
    userProperties.setProperty('MODEL_PRICING_CACHE', JSON.stringify(pricing));
    userProperties.setProperty('MODEL_PRICING_TIMESTAMP', now.toString());

    Logger.log('Cached pricing for ' + Object.keys(pricing).length + ' models');
    return pricing;

  } catch (e) {
    Logger.log('Error fetching pricing from API, using fallback: ' + e.toString());

    // Fallback to hardcoded pricing
    return {
      'anthropic/claude-3.5-sonnet': 3.00,
      'anthropic/claude-3-haiku': 0.25,
      'anthropic/claude-3-opus': 15.00,
      'openai/gpt-4-turbo': 10.00,
      'openai/gpt-3.5-turbo': 0.50,
      'google/gemini-pro': 0.00,
      'meta-llama/llama-3-70b-instruct': 0.70,
      'mistralai/mistral-7b-instruct': 0.10
    };
  }
}

/**
 * Force refresh of pricing cache (for manual testing)
 */
function refreshPricingCache() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('MODEL_PRICING_CACHE');
  userProperties.deleteProperty('MODEL_PRICING_TIMESTAMP');

  var pricing = getModelPricing();
  Logger.log('Pricing cache refreshed with ' + Object.keys(pricing).length + ' models');
  return pricing;
}
