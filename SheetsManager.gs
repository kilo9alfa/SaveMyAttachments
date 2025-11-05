/**
 * Google Sheets Management
 * Handles spreadsheet logging and data organization
 */

/**
 * Add email data to the current spreadsheet
 * Each row represents ONE attachment from an email
 *
 * @param {Object} data - Email data object with timestamp, sender, subject, etc.
 */
function addToSheet(data) {
  var sheet = getCurrentSheet();

  // Ensure headers exist (with Message ID as first hidden column)
  if (sheet.getLastRow() === 0) {
    var headers = ['Message ID', 'Date', 'Sender', 'Subject', 'Attachment', 'AI Summary'];
    sheet.appendRow(headers);

    // Format header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');

    // Hide Message ID column
    sheet.hideColumns(1);

    // Freeze header row
    sheet.setFrozenRows(1);

    Logger.log('Created header row (AI Summary is now last column)');
  }

  // Add data row (one row per attachment)
  // NEW ORDER: Message ID, Date, Sender, Subject, Attachment, AI Summary
  var rowData = [
    data.messageId || '',
    data.timestamp,
    data.sender,
    data.subject,
    '', // Attachment link (added below with formula)
    data.summary || '' // AI Summary (last column, may be empty)
  ];

  // Insert at row 2 (after headers) to keep newest at top
  // Or use appendRow() to add at bottom
  var config = getConfig();
  var insertAtTop = config.newestFirst || true; // Default to newest first

  var targetRow;
  if (insertAtTop && sheet.getLastRow() > 0) {
    // Insert after header row
    sheet.insertRowAfter(1);
    targetRow = 2;
    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Append at bottom (original behavior)
    sheet.appendRow(rowData);
    targetRow = sheet.getLastRow();
  }

  var lastRow = targetRow;

  // Format the date column (column 2)
  sheet.getRange(lastRow, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // Add attachment as clickable link (column 5 - moved before AI Summary)
  if (data.attachmentName && data.attachmentUrl) {
    var attachmentCell = sheet.getRange(lastRow, 5);

    // Use HYPERLINK formula for clean clickable filename
    attachmentCell.setFormula('=HYPERLINK("' + data.attachmentUrl + '", "' + data.attachmentName + '")');
  }

  // Auto-resize columns for better readability
  sheet.autoResizeColumns(2, 6);

  Logger.log('Added row ' + lastRow + ' for attachment: ' + data.attachmentName);
}

/**
 * Check if an email is already in the sheet (by message ID)
 *
 * @param {string} messageId - Gmail message ID
 * @return {boolean} True if email is already in sheet
 */
function isEmailInSheet(messageId) {
  var sheet = getCurrentSheet();

  // If no data yet, return false
  if (sheet.getLastRow() <= 1) {
    return false;
  }

  // Get all message IDs from column 1
  var messageIds = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();

  // Check if this message ID exists
  for (var i = 0; i < messageIds.length; i++) {
    if (messageIds[i][0] === messageId) {
      return true;
    }
  }

  return false;
}

/**
 * Clear all data from the sheet (keeping headers)
 * Useful for testing
 */
function clearSheetData() {
  var sheet = getCurrentSheet();

  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
    Logger.log('Cleared sheet data');
  }
}

/**
 * Create a new sheet for SaveMe data
 * (For future use when working with specific sheets)
 */
function createSaveMeSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.insertSheet('SaveMe Emails');

  // Add headers
  var headers = ['Date', 'Sender', 'Subject', 'AI Summary', 'Attachments', 'Drive Links'];
  sheet.appendRow(headers);

  // Format header
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 6);

  Logger.log('Created SaveMe sheet');
  return sheet;
}
