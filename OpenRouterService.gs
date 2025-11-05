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
      return '[Summary failed - API Error: ' + responseCode + ']';
    }

    var result = JSON.parse(response.getContentText());
    var summary = result.choices[0].message.content.trim();

    Logger.log('Summary generated: ' + summary);
    return summary;

  } catch (e) {
    Logger.log('OpenRouter API Exception: ' + e.toString());
    return '[Summary failed - ' + e.message + ']';
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
