/**
 * File Naming Template Engine
 * Applies custom naming templates to files using variable substitution
 */

/**
 * Apply file naming template to attachment
 *
 * @param {string} template - Template string with {{Variable}} placeholders
 * @param {GmailMessage} message - Gmail message object
 * @param {string} originalFileName - Original attachment filename
 * @return {string} Processed filename
 */
function applyFileNamingTemplate(template, message, originalFileName) {
  if (!template) {
    return originalFileName; // Fallback to original name
  }

  var fileName = template;
  var date = message.getDate();
  var timeZone = Session.getScriptTimeZone();

  // Date/Time variables
  fileName = fileName.replace(/\{\{Year\}\}/g, Utilities.formatDate(date, timeZone, 'yyyy'));
  fileName = fileName.replace(/\{\{Month\}\}/g, Utilities.formatDate(date, timeZone, 'MM'));
  fileName = fileName.replace(/\{\{MonthName\}\}/g, Utilities.formatDate(date, timeZone, 'MMMM'));
  fileName = fileName.replace(/\{\{MonthShort\}\}/g, Utilities.formatDate(date, timeZone, 'MMM'));
  fileName = fileName.replace(/\{\{Day\}\}/g, Utilities.formatDate(date, timeZone, 'dd'));
  fileName = fileName.replace(/\{\{Date\}\}/g, Utilities.formatDate(date, timeZone, 'yyyy-MM-dd'));
  fileName = fileName.replace(/\{\{DateTime\}\}/g, Utilities.formatDate(date, timeZone, 'yyyy-MM-dd_HHmmss'));
  fileName = fileName.replace(/\{\{Time\}\}/g, Utilities.formatDate(date, timeZone, 'HHmmss'));
  fileName = fileName.replace(/\{\{Hour\}\}/g, Utilities.formatDate(date, timeZone, 'HH'));
  fileName = fileName.replace(/\{\{Minute\}\}/g, Utilities.formatDate(date, timeZone, 'mm'));
  fileName = fileName.replace(/\{\{Second\}\}/g, Utilities.formatDate(date, timeZone, 'ss'));

  // Sender variables
  var from = message.getFrom();
  var senderEmail = extractEmail(from);
  var senderName = extractName(from);

  fileName = fileName.replace(/\{\{Sender\}\}/g, sanitizeFileName(senderName));
  fileName = fileName.replace(/\{\{SenderEmail\}\}/g, sanitizeFileName(senderEmail));
  fileName = fileName.replace(/\{\{SenderDomain\}\}/g, sanitizeFileName(senderEmail.split('@')[1] || senderEmail));

  // Subject variable
  var subject = message.getSubject() || 'No Subject';
  fileName = fileName.replace(/\{\{Subject\}\}/g, sanitizeFileName(subject));

  // Attachment variables
  if (originalFileName) {
    var fileNameWithoutExt = originalFileName.replace(/\.[^.]+$/, '');
    var extension = originalFileName.split('.').pop().toLowerCase();

    fileName = fileName.replace(/\{\{AttachmentName\}\}/g, sanitizeFileName(fileNameWithoutExt));
    fileName = fileName.replace(/\{\{OriginalName\}\}/g, sanitizeFileName(originalFileName));
    fileName = fileName.replace(/\{\{Extension\}\}/g, extension);

    // Add extension if not present in template
    if (!fileName.match(/\.[a-zA-Z0-9]+$/)) {
      fileName += '.' + extension;
    }
  }

  // Message ID (for uniqueness)
  var messageId = message.getId().substring(0, 8);
  fileName = fileName.replace(/\{\{MessageID\}\}/g, messageId);

  // Clean up any remaining unreplaced variables
  fileName = fileName.replace(/\{\{[^}]+\}\}/g, '');

  // Limit filename length (max 255 chars for most filesystems)
  if (fileName.length > 200) {
    var parts = fileName.split('.');
    var ext = parts.pop();
    var name = parts.join('.');
    fileName = name.substring(0, 200 - ext.length - 1) + '.' + ext;
  }

  return fileName;
}

/**
 * Apply email body naming template
 *
 * @param {string} template - Template string with {{Variable}} placeholders
 * @param {GmailMessage} message - Gmail message object
 * @param {string} format - File format (pdf, html, txt)
 * @return {string} Processed filename
 */
function applyEmailNamingTemplate(template, message, format) {
  if (!template) {
    // Default: Subject_Date.format
    var subject = sanitizeFileName(message.getSubject() || 'Email');
    var date = Utilities.formatDate(message.getDate(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return subject + '_' + date + '.' + format;
  }

  // Use same logic as attachment naming, but no original filename
  var fileName = applyFileNamingTemplate(template, message, null);

  // Add format extension if not present
  if (!fileName.match(/\.[a-zA-Z0-9]+$/)) {
    fileName += '.' + format;
  } else {
    // Replace extension with format
    fileName = fileName.replace(/\.[a-zA-Z0-9]+$/, '.' + format);
  }

  return fileName;
}

/**
 * Sanitize filename to remove invalid characters
 *
 * @param {string} name - Filename to sanitize
 * @return {string} Sanitized filename
 */
function sanitizeFileName(name) {
  if (!name) return 'unnamed';

  // Remove or replace invalid characters for filenames
  // Invalid: / \ : * ? " < > |
  var sanitized = name
    .replace(/[\/\\:*?"<>|]/g, '_')  // Replace invalid chars with underscore
    .replace(/\s+/g, '_')            // Replace spaces with underscore
    .replace(/_+/g, '_')             // Collapse multiple underscores
    .replace(/^_+|_+$/g, '')         // Trim underscores from ends
    .substring(0, 150);              // Limit length

  return sanitized || 'unnamed';
}

/**
 * Parse file extension filtering settings
 *
 * @param {string} extensionsString - Comma-separated list of extensions
 * @return {Array} Array of lowercase extensions without dots
 */
function parseExtensions(extensionsString) {
  if (!extensionsString || extensionsString.trim() === '') {
    return [];
  }

  return extensionsString
    .split(',')
    .map(function(ext) {
      return ext.trim().toLowerCase().replace(/^\./, ''); // Remove leading dot if present
    })
    .filter(function(ext) {
      return ext.length > 0;
    });
}

/**
 * Check if file extension is allowed based on filtering rules
 *
 * @param {string} fileName - Filename to check
 * @param {string} allowedExtensions - Comma-separated allowed extensions
 * @param {string} disallowedExtensions - Comma-separated disallowed extensions
 * @return {boolean} True if file is allowed
 */
function isExtensionAllowed(fileName, allowedExtensions, disallowedExtensions) {
  var extension = fileName.split('.').pop().toLowerCase();

  // Parse extension lists
  var allowed = parseExtensions(allowedExtensions);
  var disallowed = parseExtensions(disallowedExtensions);

  // If disallow list exists and includes this extension, reject
  if (disallowed.length > 0 && disallowed.indexOf(extension) >= 0) {
    Logger.log('File rejected by disallow list: ' + fileName + ' (.' + extension + ')');
    return false;
  }

  // If allow list exists, only accept if extension is in it
  if (allowed.length > 0) {
    var isAllowed = allowed.indexOf(extension) >= 0;
    if (!isAllowed) {
      Logger.log('File rejected by allow list: ' + fileName + ' (.' + extension + ')');
    }
    return isAllowed;
  }

  // No restrictions, allow all
  return true;
}

/**
 * Test function for file naming
 */
function testFileNaming() {
  // Create a mock message for testing
  var threads = GmailApp.search('has:attachment', 0, 1);
  if (threads.length === 0) {
    Logger.log('No emails found for testing');
    return;
  }

  var message = threads[0].getMessages()[0];

  // Test various templates
  var templates = [
    '{{Year}}.{{Month}}.{{Day}}-{{AttachmentName}}',
    '{{Date}}_{{Sender}}_{{Subject}}',
    '{{Year}}/{{Month}}/{{AttachmentName}}',
    '{{DateTime}}_{{Subject}}',
    '{{Sender}}_{{Date}}'
  ];

  Logger.log('=== File Naming Template Tests ===');
  Logger.log('Email: ' + message.getSubject());
  Logger.log('From: ' + message.getFrom());
  Logger.log('');

  templates.forEach(function(template) {
    var result = applyFileNamingTemplate(template, message, 'invoice.pdf');
    Logger.log('Template: ' + template);
    Logger.log('Result: ' + result);
    Logger.log('');
  });
}
