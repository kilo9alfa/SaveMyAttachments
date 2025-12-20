/**
 * Email Converter
 * Converts email messages to various formats (PDF, HTML, Plain Text)
 */

/**
 * Convert email message to specified format(s)
 *
 * @param {GmailMessage} message - Gmail message object
 * @param {string} format - Format to convert to: 'pdf', 'html', 'txt', or 'all'
 * @return {Array} Array of blob objects with converted files
 */
function convertEmail(message, format) {
  var blobs = [];

  try {
    if (format === 'all') {
      // Convert to all formats
      blobs.push(convertEmailToPDF(message));
      blobs.push(convertEmailToHTML(message));
      blobs.push(convertEmailToPlainText(message));
    } else if (format === 'pdf') {
      blobs.push(convertEmailToPDF(message));
    } else if (format === 'html') {
      blobs.push(convertEmailToHTML(message));
    } else if (format === 'txt') {
      blobs.push(convertEmailToPlainText(message));
    } else {
      // Default to PDF
      blobs.push(convertEmailToPDF(message));
    }

    return blobs;

  } catch (e) {
    Logger.log('Error converting email: ' + e.toString());
    throw e;
  }
}

/**
 * Convert email to PDF format
 * Uses Advanced Drive Service for drive.file scope compatibility
 *
 * @param {GmailMessage} message - Gmail message object
 * @return {Blob} PDF blob
 */
function convertEmailToPDF(message) {
  try {
    // Build HTML representation
    var html = buildEmailHTML(message);

    // Create a temporary file from HTML using Advanced Drive Service v2
    var tempFileName = 'temp_email_' + message.getId() + '.html';
    var htmlBlob = Utilities.newBlob(html, MimeType.HTML, tempFileName);

    var fileMetadata = {
      title: tempFileName
    };

    // Create temp HTML file
    var tempFile = Drive.Files.insert(fileMetadata, htmlBlob);

    // Get the file and convert to PDF
    // Note: Since we created the file, drive.file scope can access it
    var pdfBlob = DriveApp.getFileById(tempFile.id).getAs(MimeType.PDF);

    // Clean up temp file
    Drive.Files.trash(tempFile.id);

    // Set proper filename (will be applied by calling function)
    pdfBlob.setName('email.pdf');

    Logger.log('Converted email to PDF');
    return pdfBlob;

  } catch (e) {
    Logger.log('Error converting email to PDF: ' + e.toString());
    throw new Error('Failed to convert email to PDF: ' + e.message);
  }
}

/**
 * Convert email to HTML format
 *
 * @param {GmailMessage} message - Gmail message object
 * @return {Blob} HTML blob
 */
function convertEmailToHTML(message) {
  try {
    var html = buildEmailHTML(message);
    var blob = Utilities.newBlob(html, MimeType.HTML, 'email.html');

    Logger.log('✅ Converted email to HTML');
    return blob;

  } catch (e) {
    Logger.log('Error converting email to HTML: ' + e.toString());
    throw new Error('Failed to convert email to HTML: ' + e.message);
  }
}

/**
 * Convert email to plain text format
 *
 * @param {GmailMessage} message - Gmail message object
 * @return {Blob} Plain text blob
 */
function convertEmailToPlainText(message) {
  try {
    var text = '';

    // Header information
    text += 'From: ' + message.getFrom() + '\n';
    text += 'To: ' + message.getTo() + '\n';

    var cc = message.getCc();
    if (cc) {
      text += 'CC: ' + cc + '\n';
    }

    text += 'Date: ' + Utilities.formatDate(message.getDate(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') + '\n';
    text += 'Subject: ' + message.getSubject() + '\n';

    // Attachments info
    var attachments = message.getAttachments();
    if (attachments.length > 0) {
      text += 'Attachments: ' + attachments.length + ' file(s)\n';
      attachments.forEach(function(att) {
        text += '  - ' + att.getName() + ' (' + formatFileSize(att.getSize()) + ')\n';
      });
    }

    text += '\n' + '='.repeat(70) + '\n\n';

    // Email body
    text += message.getPlainBody();

    var blob = Utilities.newBlob(text, MimeType.PLAIN_TEXT, 'email.txt');

    Logger.log('✅ Converted email to Plain Text');
    return blob;

  } catch (e) {
    Logger.log('Error converting email to Plain Text: ' + e.toString());
    throw new Error('Failed to convert email to Plain Text: ' + e.message);
  }
}

/**
 * Build HTML representation of email
 * Creates a nicely formatted HTML version of the email
 *
 * @param {GmailMessage} message - Gmail message object
 * @return {string} HTML string
 */
function buildEmailHTML(message) {
  var html = '<!DOCTYPE html>\n<html>\n<head>\n';
  html += '<meta charset="UTF-8">\n';
  html += '<title>' + escapeHtml(message.getSubject()) + '</title>\n';
  html += '<style>\n';
  html += 'body { font-family: Arial, Helvetica, sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }\n';
  html += '.email-header { background: #f5f5f5; padding: 20px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #1a73e8; }\n';
  html += '.header-row { margin-bottom: 8px; }\n';
  html += '.header-label { font-weight: bold; color: #555; display: inline-block; width: 80px; }\n';
  html += '.header-value { color: #333; }\n';
  html += '.email-body { padding: 20px; background: white; border: 1px solid #ddd; border-radius: 5px; }\n';
  html += '.attachments { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }\n';
  html += '.attachments h3 { margin-top: 0; color: #555; font-size: 14px; }\n';
  html += '.attachment-item { padding: 8px; background: white; margin: 5px 0; border-radius: 3px; border: 1px solid #e0e0e0; }\n';
  html += '</style>\n';
  html += '</head>\n<body>\n';

  // Email header section
  html += '<div class="email-header">\n';
  html += '<div class="header-row"><span class="header-label">From:</span> <span class="header-value">' + escapeHtml(message.getFrom()) + '</span></div>\n';
  html += '<div class="header-row"><span class="header-label">To:</span> <span class="header-value">' + escapeHtml(message.getTo()) + '</span></div>\n';

  var cc = message.getCc();
  if (cc) {
    html += '<div class="header-row"><span class="header-label">CC:</span> <span class="header-value">' + escapeHtml(cc) + '</span></div>\n';
  }

  var date = Utilities.formatDate(message.getDate(), Session.getScriptTimeZone(), 'EEEE, MMMM dd, yyyy \'at\' HH:mm:ss');
  html += '<div class="header-row"><span class="header-label">Date:</span> <span class="header-value">' + date + '</span></div>\n';
  html += '<div class="header-row"><span class="header-label">Subject:</span> <span class="header-value"><strong>' + escapeHtml(message.getSubject()) + '</strong></span></div>\n';

  html += '</div>\n';

  // Attachments info (if any)
  var attachments = message.getAttachments();
  if (attachments.length > 0) {
    html += '<div class="attachments">\n';
    html += '<h3>📎 Attachments (' + attachments.length + '):</h3>\n';
    attachments.forEach(function(att) {
      html += '<div class="attachment-item">📄 ' + escapeHtml(att.getName()) + ' (' + formatFileSize(att.getSize()) + ')</div>\n';
    });
    html += '</div>\n';
  }

  // Email body
  html += '<div class="email-body">\n';

  // Try to get HTML body first, fall back to plain text
  try {
    var bodyHtml = message.getBody();
    if (bodyHtml) {
      html += bodyHtml;
    } else {
      // Fallback to plain text with line breaks
      html += '<pre style="white-space: pre-wrap; font-family: inherit;">' + escapeHtml(message.getPlainBody()) + '</pre>\n';
    }
  } catch (e) {
    // If HTML body fails, use plain text
    html += '<pre style="white-space: pre-wrap; font-family: inherit;">' + escapeHtml(message.getPlainBody()) + '</pre>\n';
  }

  html += '</div>\n';

  html += '</body>\n</html>';

  return html;
}

/**
 * Escape HTML special characters
 *
 * @param {string} text - Text to escape
 * @return {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format file size in human-readable format
 *
 * @param {number} bytes - Size in bytes
 * @return {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  var k = 1024;
  var sizes = ['Bytes', 'KB', 'MB', 'GB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Test function for email conversion
 */
function testEmailConversion() {
  var threads = GmailApp.search('has:attachment', 0, 1);
  if (threads.length === 0) {
    Logger.log('No emails found for testing');
    return;
  }

  var message = threads[0].getMessages()[0];

  Logger.log('=== Email Conversion Test ===');
  Logger.log('Email: ' + message.getSubject());
  Logger.log('From: ' + message.getFrom());
  Logger.log('');

  // Test all formats
  try {
    Logger.log('Testing PDF conversion...');
    var pdfBlob = convertEmailToPDF(message);
    Logger.log('✅ PDF: ' + pdfBlob.getName() + ' (' + formatFileSize(pdfBlob.getBytes().length) + ')');

    Logger.log('Testing HTML conversion...');
    var htmlBlob = convertEmailToHTML(message);
    Logger.log('✅ HTML: ' + htmlBlob.getName() + ' (' + formatFileSize(htmlBlob.getBytes().length) + ')');

    Logger.log('Testing Plain Text conversion...');
    var txtBlob = convertEmailToPlainText(message);
    Logger.log('✅ TXT: ' + txtBlob.getName() + ' (' + formatFileSize(txtBlob.getBytes().length) + ')');

    Logger.log('');
    Logger.log('All conversions successful!');

  } catch (e) {
    Logger.log('❌ Error during conversion: ' + e.toString());
  }
}
