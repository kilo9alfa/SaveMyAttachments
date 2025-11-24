/**
 * Folder and Spreadsheet Selection Helper
 * Simple URL-based selection (no Google Picker - avoids iframe/cookie issues)
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

/**
 * Show spreadsheet selection prompt
 * User pastes Google Sheets URL
 */
function showSpreadsheetPicker() {
  var ui = SpreadsheetApp.getUi();

  var response = ui.prompt(
    'Select Spreadsheet',
    'Paste the URL of the Google Sheet where you want to log emails:\n\n' +
    'Example: https://docs.google.com/spreadsheets/d/ABC123xyz/edit\n\n' +
    'Or just paste the spreadsheet ID (ABC123xyz)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var input = response.getResponseText().trim();

    if (!input) {
      ui.alert('Error', 'Please provide a spreadsheet URL or ID', ui.ButtonSet.OK);
      return;
    }

    // Extract ID from URL or use as-is
    var spreadsheetId = extractIdFromUrl(input);

    // Try to access the spreadsheet to verify permissions
    try {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var spreadsheetName = spreadsheet.getName();

      var result = saveSpreadsheetId(spreadsheetId, spreadsheetName);

      if (result.success) {
        ui.alert('Success', result.message, ui.ButtonSet.OK);
      } else {
        ui.alert('Error', result.message, ui.ButtonSet.OK);
      }
    } catch (e) {
      ui.alert('Error',
        'Cannot access that spreadsheet. Make sure:\n' +
        '1. The spreadsheet exists\n' +
        '2. You have permission to access it\n' +
        '3. The URL/ID is correct\n\n' +
        'Error: ' + e.message,
        ui.ButtonSet.OK);
    }
  }
}

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
 * Save selected spreadsheet ID from Picker
 * @param {string} spreadsheetId - The selected spreadsheet ID
 * @param {string} spreadsheetName - The selected spreadsheet name
 * @return {Object} Success status
 */
function saveSpreadsheetId(spreadsheetId, spreadsheetName) {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('SHEET_ID', spreadsheetId);
    userProperties.setProperty('SHEET_NAME', spreadsheetName);

    Logger.log('✅ Saved spreadsheet: ' + spreadsheetName + ' (ID: ' + spreadsheetId + ')');

    return {
      success: true,
      message: 'Spreadsheet selected: ' + spreadsheetName
    };
  } catch (e) {
    Logger.log('❌ Error saving spreadsheet: ' + e);
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
 * Get currently selected spreadsheet name
 * @return {string} Spreadsheet name or "Not selected"
 */
function getSelectedSpreadsheetName() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('SHEET_NAME') || 'Not selected';
}
