/**
 * Folder Selection Helper
 * Simple URL-based selection (no Google Picker - avoids iframe/cookie issues)
 *
 * NOTE: Spreadsheet selection is NOT needed for container-bound scripts.
 * Container-bound scripts write to the current spreadsheet automatically.
 */

/**
 * Show folder selection prompt
 * User pastes Drive folder URL
 */
function showFolderPicker() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.prompt(
    'Select Drive Folder',
    'Paste the URL of the Google Drive folder where you want to save files:\n\n' +
    'Example: https://drive.google.com/drive/folders/ABC123xyz\n\n' +
    'Or just paste the folder ID (ABC123xyz)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var input = response.getResponseText().trim();

    if (!input) {
      ui.alert('Error', 'Please provide a folder URL or ID', ui.ButtonSet.OK);
      return;
    }

    // Extract ID from URL or use as-is
    var folderId = extractIdFromUrl(input);

    // Try to access the folder to verify permissions
    try {
      var folder = DriveApp.getFolderById(folderId);
      var folderName = folder.getName();

      var result = saveFolderId(folderId, folderName);

      if (result.success) {
        ui.alert('Success', result.message, ui.ButtonSet.OK);
      } else {
        ui.alert('Error', result.message, ui.ButtonSet.OK);
      }
    } catch (e) {
      ui.alert('Error',
        'Cannot access that folder. Make sure:\n' +
        '1. The folder exists\n' +
        '2. You have permission to access it\n' +
        '3. The URL/ID is correct\n\n' +
        'Error: ' + e.message,
        ui.ButtonSet.OK);
    }
  }
}

// Spreadsheet selection removed - not needed for container-bound scripts
// Container-bound scripts automatically write to the current spreadsheet

/**
 * Save selected folder ID from Picker
 * @param {string} folderId - The selected folder ID
 * @param {string} folderName - The selected folder name
 * @return {Object} Success status
 */
function saveFolderId(folderId, folderName) {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('DRIVE_FOLDER_ID', folderId);
    userProperties.setProperty('DRIVE_FOLDER_NAME', folderName);

    Logger.log('✅ Saved folder: ' + folderName + ' (ID: ' + folderId + ')');

    return {
      success: true,
      message: 'Folder selected: ' + folderName
    };
  } catch (e) {
    Logger.log('❌ Error saving folder: ' + e);
    return {
      success: false,
      message: 'Error: ' + e.message
    };
  }
}

/**
 * Get currently selected folder name
 * @return {string} Folder name or "Not selected"
 */
function getSelectedFolderName() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('DRIVE_FOLDER_NAME') || 'Not selected';
}

/**
 * Save folder ID from Settings Panel
 * Called from SettingsPanel.html when user clicks "Save Folder"
 * @param {string} folderUrl - The folder URL or ID pasted by user
 * @return {Object} Success status with folder name
 */
function saveFolderIdFromPanel(folderUrl) {
  // Extract ID from URL or use as-is
  var folderId = extractIdFromUrl(folderUrl);

  // Try to access the folder to verify permissions
  try {
    var folder = DriveApp.getFolderById(folderId);
    var folderName = folder.getName();

    var result = saveFolderId(folderId, folderName);
    return result;
  } catch (e) {
    Logger.log('Error accessing folder: ' + e.toString());
    return {
      success: false,
      message: 'Cannot access folder. Check URL/ID and permissions.'
    };
  }
}
