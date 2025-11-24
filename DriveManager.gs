/**
 * Google Drive Management
 * Handles file upload and folder organization
 */

/**
 * Save email attachments to Google Drive with file naming templates
 *
 * @param {Array} attachments - Array of GmailAttachment objects
 * @param {Object} config - Configuration object (includes folderId and fileNamingTemplate)
 * @param {GmailMessage} message - Gmail message object (optional, for template variables)
 * @return {Object} Object with urls array and files array (name + url)
 */
function saveAttachmentsToDrive(attachments, config, message) {
  // Support legacy calls with just folderId
  var folderId = (typeof config === 'string') ? config : config.folderId;
  var useTemplates = (typeof config === 'object') && config.fileNamingTemplate && message;

  var folder;

  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    Logger.log('Error accessing Drive folder: ' + e.toString());
    throw new Error('Cannot access Drive folder. Please check the folder ID in settings.');
  }

  var links = [];
  var filesInfo = [];

  for (var i = 0; i < attachments.length; i++) {
    var attachment = attachments[i];
    try {
      var originalFileName = attachment.getName();
      var blob = attachment.copyBlob();

      Logger.log('Saving attachment: ' + originalFileName);

      // Apply file naming template if configured
      var fileName = originalFileName;
      if (useTemplates) {
        fileName = applyFileNamingTemplate(config.fileNamingTemplate, message, originalFileName);
        Logger.log('Applied template, new name: ' + fileName);
      }

      // Check for duplicate names and add timestamp if needed
      var existingFiles = folder.getFilesByName(fileName);
      if (existingFiles.hasNext()) {
        fileName = addTimestampToFileName(fileName);
        Logger.log('Duplicate found, renamed to: ' + fileName);
      }

      // Create the file in Drive
      var file = folder.createFile(blob.setName(fileName));
      var fileUrl = file.getUrl();
      links.push(fileUrl);
      filesInfo.push({
        name: fileName,
        url: fileUrl
      });

      Logger.log('Saved: ' + fileName + ' -> ' + fileUrl);

    } catch (e) {
      Logger.log('Error saving attachment ' + attachment.getName() + ': ' + e.toString());
      var errorMsg = '[Error saving ' + attachment.getName() + ']';
      links.push(errorMsg);
      filesInfo.push({
        name: errorMsg,
        url: ''
      });
    }
  }

  return {
    urls: links,
    files: filesInfo
  };
}

/**
 * Add timestamp to filename to avoid duplicates
 *
 * @param {string} fileName - Original filename
 * @return {string} Filename with timestamp
 */
function addTimestampToFileName(fileName) {
  var parts = fileName.split('.');
  var extension = parts.length > 1 ? parts.pop() : '';
  var name = parts.join('.');

  var timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd_HHmmss'
  );

  return name + '_' + timestamp + (extension ? '.' + extension : '');
}

/**
 * Extract Drive folder/file ID from URL
 *
 * @param {string} url - Google Drive URL
 * @return {string} Extracted ID
 */
function extractIdFromUrl(url) {
  var match = url.match(/[-\w]{25,}/);
  return match ? match[0] : url;
}

/**
 * Note: Folder creation removed to comply with drive.file scope requirements.
 * Users select folders via Google Picker instead of dynamic folder creation.
 * See PickerHelper.gs for folder selection implementation.
 */
