/**
 * Folder Management Helper
 * Auto-creates dedicated SaveMyAttachments folder (compatible with drive.file scope)
 *
 * NOTE: Uses Advanced Drive Service (Drive API v2) instead of DriveApp
 * because DriveApp.createFolder() requires full 'drive' scope,
 * but Drive.Files.insert() works with 'drive.file' scope.
 *
 * APPROACH: Instead of using Google Picker (which has cookie/auth issues in Apps Script),
 * we auto-create a dedicated folder. Since the app creates it, drive.file scope can access it.
 */

/**
 * Get or create the SaveMyAttachments folder using Advanced Drive Service
 * @return {Object} Folder info with ID and name
 */
function getOrCreateSaveFolder() {
  var userProperties = PropertiesService.getUserProperties();
  var folderId = userProperties.getProperty('DRIVE_FOLDER_ID');

  // Check if we already have a valid folder
  if (folderId) {
    try {
      // Use Advanced Drive Service v2 to get folder info
      var folder = Drive.Files.get(folderId);
      return {
        success: true,
        folderId: folderId,
        folderName: folder.title,
        folderUrl: folder.alternateLink,
        message: 'Using existing folder: ' + folder.title
      };
    } catch (e) {
      // Folder no longer accessible, create new one
      Logger.log('Existing folder not accessible, creating new one: ' + e);
    }
  }

  // Create new folder using Advanced Drive Service v2
  try {
    var folderName = 'SaveMyAttachments';

    // Create folder metadata (v2 uses 'title' not 'name')
    var folderMetadata = {
      title: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    // Create the folder using Drive API v2
    var folder = Drive.Files.insert(folderMetadata);

    // Save folder info
    userProperties.setProperty('DRIVE_FOLDER_ID', folder.id);
    userProperties.setProperty('DRIVE_FOLDER_NAME', folderName);

    Logger.log('Created new folder: ' + folderName + ' (ID: ' + folder.id + ')');

    return {
      success: true,
      folderId: folder.id,
      folderName: folderName,
      folderUrl: folder.alternateLink,
      message: 'Created new folder: ' + folderName,
      isNew: true
    };
  } catch (e) {
    Logger.log('Error creating folder: ' + e);
    return {
      success: false,
      message: 'Error creating folder: ' + e.message
    };
  }
}

/**
 * Get currently configured folder info using Advanced Drive Service
 * @return {Object} Folder info or status
 */
function getFolderInfo() {
  var userProperties = PropertiesService.getUserProperties();
  var folderId = userProperties.getProperty('DRIVE_FOLDER_ID');

  if (!folderId) {
    return {
      configured: false,
      message: 'No folder configured yet'
    };
  }

  try {
    // Use Advanced Drive Service v2 to get folder info
    var folder = Drive.Files.get(folderId);
    return {
      configured: true,
      folderId: folderId,
      folderName: folder.title,
      folderUrl: folder.alternateLink
    };
  } catch (e) {
    return {
      configured: false,
      message: 'Folder no longer accessible'
    };
  }
}

/**
 * Reset folder configuration (for testing or if user wants to start over)
 */
function resetFolderConfig() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('DRIVE_FOLDER_ID');
  userProperties.deleteProperty('DRIVE_FOLDER_NAME');
  Logger.log('Folder configuration reset');
  return { success: true, message: 'Folder configuration reset' };
}
