/**
 * Google Picker Helper
 * Handles folder and spreadsheet selection via Google Picker API
 */

/**
 * Get OAuth token for Google Picker
 * @return {string} OAuth token
 */
function getOAuthToken() {
  return ScriptApp.getOAuthToken();
}

/**
 * Show folder picker dialog
 * Opens Google Picker to let user select a Drive folder
 */
function showFolderPicker() {
  var html = HtmlService.createHtmlOutputFromFile('FolderPicker')
    .setWidth(600)
    .setHeight(425)
    .setTitle('Select Drive Folder');

  SpreadsheetApp.getUi().showModalDialog(html, 'Select Drive Folder');
}

/**
 * Show spreadsheet picker dialog
 * Opens Google Picker to let user select a Google Sheet
 */
function showSpreadsheetPicker() {
  var html = HtmlService.createHtmlOutputFromFile('SpreadsheetPicker')
    .setWidth(600)
    .setHeight(425)
    .setTitle('Select Spreadsheet');

  SpreadsheetApp.getUi().showModalDialog(html, 'Select Spreadsheet');
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
