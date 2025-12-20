/**
 * Google Drive Management
 * Handles file upload and folder organization
 *
 * NOTE: Uses Advanced Drive Service (Drive API v2) instead of DriveApp
 * because DriveApp requires full 'drive' scope, but Drive API v2 works
 * with 'drive.file' scope for files/folders created by this app.
 */

/**
 * Save email attachments to Google Drive with file naming templates
 * Uses Advanced Drive Service for drive.file scope compatibility
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

  // Verify folder exists using Advanced Drive Service v2
  try {
    Drive.Files.get(folderId);
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

      // Check for duplicate names using Advanced Drive Service
      var duplicateCheck = checkForDuplicateFile(folderId, fileName);
      if (duplicateCheck) {
        fileName = addTimestampToFileName(fileName);
        Logger.log('Duplicate found, renamed to: ' + fileName);
      }

      // Create the file using Advanced Drive Service v2
      var fileMetadata = {
        title: fileName,
        parents: [{ id: folderId }]
      };

      var file = Drive.Files.insert(fileMetadata, blob);

      var fileUrl = file.alternateLink;
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
 * Check if a file with the given name exists in the folder
 * Uses Advanced Drive Service - only finds files created by this app (drive.file scope)
 *
 * @param {string} folderId - Parent folder ID
 * @param {string} fileName - File name to check
 * @return {boolean} True if file exists
 */
function checkForDuplicateFile(folderId, fileName) {
  try {
    // Search for files with same name in the folder (v2 syntax)
    var query = "title = '" + fileName.replace(/'/g, "\\'") + "' and '" + folderId + "' in parents and trashed = false";
    var response = Drive.Files.list({
      q: query,
      maxResults: 1
    });

    return response.items && response.items.length > 0;
  } catch (e) {
    Logger.log('Error checking for duplicate: ' + e.toString());
    return false; // Assume no duplicate if we can't check
  }
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
 * Note: This file uses Advanced Drive Service (Drive API v2) instead of DriveApp
 * to comply with drive.file scope requirements. DriveApp methods like createFolder()
 * and getFolderById() require full 'drive' scope.
 */
