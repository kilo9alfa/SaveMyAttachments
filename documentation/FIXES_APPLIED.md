# Bug Fixes Applied - Phase 1 Issues

Based on your testing feedback, I've fixed all 5 issues you identified. Here's what was changed:

## ✅ Issue 1: First Email Duplicated

**Problem:** The first email was being processed twice.

**Root Cause:** The email was being marked as processed AFTER it was added to the sheet, so if there was an error or the process was interrupted, it could be processed again.

**Fix:**
- Changed `GmailProcessor.gs` to mark emails as processed **BEFORE** calling `processEmail()`
- This ensures even if processing fails, the email won't be retried immediately
- Location: `GmailProcessor.gs:79-80`

```javascript
// Mark as processed BEFORE processing (prevents duplicates)
markEmailAsProcessed(messageId, message.getSubject());
```

---

## ✅ Issue 2: Processing More Than 20 Emails

**Problem:** Script processed 34+ emails even though batch size was set to 20.

**Root Cause:** The code was limiting to 20 **threads**, but each thread can contain multiple messages. A thread with 3 messages counts as 1 thread but 3 emails.

**Fix:**
- Added a `processedCount` variable that tracks actual emails processed
- Changed to use `for` loops instead of `forEach` so we can `break` when limit reached
- Now stops at exactly 20 **emails**, not threads
- Location: `GmailProcessor.gs:39-55`

```javascript
var processedCount = 0;

for (var i = 0; i < threads.length; i++) {
  // Stop if we've reached the batch limit
  if (processedCount >= maxEmails) {
    Logger.log('Reached batch limit of ' + maxEmails + ' emails, stopping');
    break;
  }
  // ... process messages ...
  processedCount++;
}
```

---

## ✅ Issue 3: Wrong Attachment Count (7-8 when incorrect)

**Problem:** Emails showing 7-8 attachments when they don't actually have that many real attachments.

**Root Cause:** Gmail includes inline images, email signatures with logos, tracking pixels, and other embedded content as "attachments". These are typically very small (1-5 KB).

**Fix:**
- Created `filterAttachmentsBySize()` function that filters out small attachments
- Default minimum size: 5 KB (configurable)
- Only attachments ≥ 5 KB are counted and saved
- Logs show: "Total attachments: 8, After filtering: 2"
- Location: `GmailProcessor.gs:214-245`

**Before:**
```javascript
attachmentCount: emailData.attachments.length  // All attachments
```

**After:**
```javascript
var filteredAttachments = filterAttachmentsBySize(emailData.attachments, config);
attachmentCount: filteredAttachments.length  // Only real attachments
```

---

## ✅ Issue 4: Configurable Minimum Attachment Size

**Problem:** Need ability to configure the minimum attachment size threshold.

**Fix:**
- Added `minAttachmentSizeKB` to configuration (default: 5 KB)
- Added menu item: **SaveMe** → **🔧 Tools** → **Set Minimum Attachment Size**
- UI dialog to change the threshold
- Stored in: `Config.gs:29`

**How to Use:**
1. Click **SaveMe** → **🔧 Tools** → **Set Minimum Attachment Size**
2. Enter a number in KB (e.g., `3`, `5`, or `10`)
3. Click OK

**Recommended Values:**
- `3` KB - More permissive, catches small PDFs
- `5` KB - Default, good balance (filters most inline images)
- `10` KB - More strict, only larger attachments

---

## ✅ Issue 5: Don't Overwrite Edited Columns

**Problem:** If you edit a cell in the Sheet and re-run processing, the row gets overwritten.

**Root Cause:** No way to detect if an email was already added to the sheet - only tracked in the processing system.

**Fix:**
- **Added hidden "Message ID" column** (Column A) to the Sheet
- Message ID is Gmail's unique identifier for each email
- Before processing, checks if message ID exists in sheet
- If exists, skips processing entirely (even if tracking was cleared)
- The Message ID column is automatically hidden so it doesn't clutter your view

**How It Works:**
1. New function `isEmailInSheet(messageId)` checks Column A for the ID
2. If found, email is skipped: `GmailProcessor.gs:70-76`
3. Sheet structure now: `[Message ID (hidden), Date, Sender, Subject, AI Summary, Attachments, Drive Links]`

**Important Notes:**
- **Existing sheets:** If you already have data, the new column will be added on the next processing run
- **To reprocess an email:** Delete its row from the sheet AND clear processed tracking
- **Message ID column is hidden** but you can unhide it: Right-click column A → Unhide

---

## Files Modified

### 1. **GmailProcessor.gs**
- Fixed batch limiting logic (lines 12-110)
- Added `filterAttachmentsBySize()` function (lines 214-245)
- Mark emails as processed before processing (line 79)
- Check if email is in sheet before processing (lines 70-76)
- Pass message ID to `addToSheet()` (line 190)

### 2. **SheetsManager.gs**
- Added Message ID as first column (lines 16, 35-36)
- Hide Message ID column automatically (line 26)
- Added `isEmailInSheet()` function (lines 64-89)
- Updated column numbers for date/links (lines 50, 54)

### 3. **Config.gs**
- Added `minAttachmentSizeKB` config option (line 29)

### 4. **Code.gs**
- Added "Set Minimum Attachment Size" menu item (line 25)
- Added `setMinAttachmentSize()` function (lines 352-381)

---

## How to Apply These Fixes

### Option A: Update Existing Scripts (Recommended)

1. **In Apps Script editor**, update these 4 files:
   - Replace `GmailProcessor.gs` with the new version
   - Replace `SheetsManager.gs` with the new version
   - Replace `Config.gs` with the new version
   - Replace `Code.gs` with the new version

2. **Save all files** (Cmd+S / Ctrl+S)

3. **Refresh your Google Sheet** (F5 or Cmd+R)

### Option B: Fresh Start

If you want to start clean:

1. **Delete all rows** in your current sheet (keep the headers if you want)
2. **Apply the updates** as described in Option A
3. **Clear processed tracking:** SaveMe → Tools → Clear Processed Tracking
4. **Run:** SaveMe → Process New Emails Now

The new Message ID column will be created automatically.

---

## Testing the Fixes

### Test 1: Duplicate Prevention
1. Clear processed tracking
2. Process new emails
3. Immediately run "Process New Emails Now" again
4. **Expected:** All emails should be skipped (already processed)

### Test 2: Batch Limit
1. Make sure you have 30+ emails with attachments
2. Run "Process New Emails Now"
3. **Expected:** Exactly 20 emails processed, then stops
4. Check logs: Should show "Reached batch limit of 20 emails, stopping"

### Test 3: Attachment Filtering
1. Find an email with inline images (newsletters are good for this)
2. Process it
3. **Expected:** Attachment count should be lower than before
4. Check logs: Should show "Total attachments: 8, After filtering: 2" (or similar)

### Test 4: Configurable Size
1. Go to: SaveMe → Tools → Set Minimum Attachment Size
2. Enter `3` (or another value)
3. Process an email
4. **Expected:** More/fewer attachments based on the threshold

### Test 5: No Overwrites
1. Process an email
2. Edit one of its cells (e.g., change the summary)
3. Clear processed tracking
4. Run "Process New Emails Now" again
5. **Expected:** The edited row remains unchanged (email is skipped)

---

## Configuration Reference

### New Config Option

**MIN_ATTACHMENT_SIZE_KB** (default: 5)
- Minimum attachment size in KB
- Attachments smaller than this are ignored
- Set via: SaveMe → Tools → Set Minimum Attachment Size
- Or manually: `saveConfig('MIN_ATTACHMENT_SIZE_KB', '5')`

### All Current Config Options

```javascript
// Core settings
OPENROUTER_API_KEY - Your AI API key
MODEL - AI model (default: anthropic/claude-3.5-sonnet)
DRIVE_FOLDER_ID - Where to save files
MAX_TOKENS - AI response length (default: 100)

// Automation
AUTOMATION_ENABLED - true/false
AUTOMATION_INTERVAL - Minutes between runs (5, 10, 15, 30, 60)
BATCH_SIZE - Max emails per run (default: 20)
DAYS_BACK - Search last N days (default: 7)

// Filtering
EMAIL_FILTER - Custom Gmail search
SENDER_FILTER - Filter by sender
LABEL_FILTER - Filter by label
MIN_ATTACHMENT_SIZE_KB - Min attachment size (default: 5)

// Notifications
NOTIFY_ON_ERRORS - Email on errors (default: false)
```

---

## Troubleshooting

### "TypeError: Cannot call method getSize of undefined"
- This can happen if an attachment object is malformed
- The `filterAttachmentsBySize()` function now has null checks
- If it persists, check Apps Script logs for the specific email

### Message ID column visible after update
- Right-click column A → Hide column
- Or delete the sheet and let it recreate with the column hidden

### Still seeing duplicates
- Make sure you applied the GmailProcessor.gs update
- Check that line 79 has: `markEmailAsProcessed(messageId, message.getSubject());`
- Clear your processed tracking and try again

### Attachment count still wrong
- Check your MIN_ATTACHMENT_SIZE_KB setting
- Try increasing it to 10 KB
- Check the execution logs to see which attachments were filtered

---

## Summary

All 5 issues have been fixed:

1. ✅ **No more duplicates** - Mark as processed BEFORE processing
2. ✅ **Exact batch limit** - Stops at exactly 20 emails, not threads
3. ✅ **Correct attachment count** - Filters out inline images/signatures
4. ✅ **Configurable filtering** - Set minimum size via UI
5. ✅ **Protected edits** - Message ID prevents overwrites

**Next Steps:** Apply the updates and test!

Let me know if you encounter any issues or need adjustments to the filtering thresholds.
