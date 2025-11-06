# One Row Per Attachment - Major Update

This is a significant structural change to how SaveMe stores data in Google Sheets.

---

## What Changed

### Before (Old Structure)
```
One row per email with multiple attachments in one cell:

| Date | Sender | Subject | Summary | Attachments | Drive Links |
|------|--------|---------|---------|-------------|-------------|
| 2025-11-05 | john@example.com | Invoice | Payment due | 3 | file1.pdf, file2.pdf, file3.pdf |
```

### After (New Structure)
```
One row per attachment (email data duplicated for each attachment):

| Date | Sender | Subject | Summary | Attachment |
|------|--------|---------|---------|------------|
| 2025-11-05 | john@example.com | Invoice | Payment due | file1.pdf |
| 2025-11-05 | john@example.com | Invoice | Payment due | file2.pdf |
| 2025-11-05 | john@example.com | Invoice | Payment due | file3.pdf |
```

---

## Benefits

### 1. **Easier to Work With**
- Each row has exactly ONE attachment
- No need to parse multiple links from one cell
- Simpler filtering and sorting

### 2. **Better for Data Analysis**
- Can count attachments easily (just count rows)
- Can filter by specific file types
- Can create pivot tables by attachment

### 3. **Cleaner Display**
- One clickable filename per row
- No more complex rich text formatting
- More spreadsheet-friendly

### 4. **Better for Future Features**
- Each attachment can have its own custom fields
- Can add "Attachment Size", "File Type" columns later
- Can process attachments differently

---

## How It Works

### Email Processing Flow

1. **Email arrives** with 3 attachments (2 real files, 1 tiny signature image)

2. **Filter attachments** by size (removes < 5 KB)
   - Before: 3 attachments
   - After: 2 attachments (signature removed)

3. **Save to Drive** - All attachments saved at once

4. **Create rows** - Loop through each attachment:
   ```javascript
   for (var i = 0; i < attachments.length; i++) {
     addToSheet({
       messageId: messageId,
       timestamp: date,
       sender: from,
       subject: subject,
       summary: summary,  // Same for all rows
       attachmentName: file.name,
       attachmentUrl: file.url
     });
   }
   ```

5. **Result** - 2 rows in Sheet (one per attachment)

### AI Summary Generation

**Important:** The AI summary is generated **once per email**, not once per attachment.

This saves:
- API calls
- Money
- Processing time

All rows from the same email share the same summary.

---

## Column Structure

### New Headers
```
[Message ID] | Date | Sender | Subject | AI Summary | Attachment
   (hidden)
```

**Removed:**
- "Attachments" count column (always 1 now)
- "Drive Links" column (merged into "Attachment")

**Simplified:**
- One clean "Attachment" column with clickable filename

---

## Files Modified

### 1. **GmailProcessor.gs** (lines 194-209)
**Before:**
```javascript
// Create one row with all attachments
addToSheet({
  attachmentCount: 3,
  driveLinks: 'file1.pdf, file2.pdf, file3.pdf'
});
```

**After:**
```javascript
// Create one row per attachment
for (var i = 0; i < files.length; i++) {
  addToSheet({
    attachmentName: files[i].name,
    attachmentUrl: files[i].url
  });
}
```

### 2. **SheetsManager.gs** (lines 6-64)
- Removed rich text formatting (not needed anymore)
- Simplified headers
- Single HYPERLINK formula per row

**Before:**
```javascript
// Complex rich text with multiple links
var richTextValue = SpreadsheetApp.newRichTextValue();
// ... 20 lines of code ...
```

**After:**
```javascript
// Simple HYPERLINK formula
attachmentCell.setFormula('=HYPERLINK("' + url + '", "' + name + '")');
```

### 3. **DriveManager.gs**
No changes needed - already returns array of `{name, url}` objects

---

## How to Apply

### Step 1: Update Files
Update these files in Apps Script:
1. `GmailProcessor.gs`
2. `SheetsManager.gs`

**Save all** (Cmd+S / Ctrl+S)

### Step 2: Start Fresh
Since the structure changed, you need a clean sheet:

1. **SaveMe → 🔧 Tools → Clear Everything & Start Fresh**
2. Confirm twice
3. Sheet will be empty with new headers

### Step 3: Process Emails
- **SaveMe → 📧 Process New Emails Now**
- You'll see multiple rows for emails with multiple attachments

---

## Examples

### Example 1: Email with 2 Attachments

**Email:**
- From: accounting@company.com
- Subject: Monthly Report
- Attachments: report.pdf (125 KB), summary.xlsx (45 KB)

**Result in Sheet:**
```
Row 1: | 2025-11-05 | accounting@company.com | Monthly Report | Financial report summary | report.pdf    |
Row 2: | 2025-11-05 | accounting@company.com | Monthly Report | Financial report summary | summary.xlsx  |
```

### Example 2: Email with 1 Real Attachment + 1 Signature

**Email:**
- From: client@email.com
- Subject: Contract Signed
- Attachments: contract.pdf (500 KB), signature.png (2 KB)

**After filtering (< 5 KB removed):**
```
Row 1: | 2025-11-05 | client@email.com | Contract Signed | Signed contract received | contract.pdf |
```

Only 1 row because signature.png was filtered out.

---

## Duplicate Prevention

### How It Works
The Message ID (hidden column A) prevents duplicates:
- Email processed once → Message ID stored in all rows for that email
- Next run checks: "Does this Message ID exist in Sheet?"
- If yes → Skip (even though there are multiple rows)

### Example:
```
Email ABC123 has 2 attachments → Creates 2 rows with same Message ID

Row 1: Message ID = ABC123 | ... | file1.pdf
Row 2: Message ID = ABC123 | ... | file2.pdf

Next run: Check if ABC123 exists → YES (found in row 1) → Skip email
```

---

## Benefits for Future Features

This structure makes it easier to add:

### 1. **Attachment-Specific Data**
```
| Attachment | File Size | File Type | Extracted Text |
```

### 2. **Custom AI Questions Per Attachment**
```
| Attachment | Is Invoice? | Amount | Due Date |
| invoice.pdf | Yes | $1,250 | 2025-12-01 |
```

### 3. **Attachment Status Tracking**
```
| Attachment | Status | Processed Date |
| report.pdf | Reviewed | 2025-11-06 |
```

---

## Comparison

| Feature | Old (One Row per Email) | New (One Row per Attachment) |
|---------|------------------------|------------------------------|
| Rows per email | 1 | Equals number of attachments |
| Attachment display | Multiple links in one cell | One link per row |
| Filtering | Hard to filter by specific file | Easy - each file is a row |
| Sorting | Can't sort by attachment | Can sort by filename |
| Data analysis | Complex | Simple |
| Pivot tables | Difficult | Easy |
| Future features | Limited | Flexible |

---

## Testing

### Test 1: Single Attachment
1. Find email with 1 attachment
2. Process it
3. **Expected:** 1 row with clickable filename

### Test 2: Multiple Attachments
1. Find email with 3+ attachments
2. Process it
3. **Expected:** 3 rows, same email info, different filenames
4. Each attachment clickable

### Test 3: Filtered Small Attachments
1. Find email with newsletter (lots of tiny images)
2. Process it
3. **Expected:** Only rows for real attachments (> 5 KB)
4. Tiny images not shown

### Test 4: Duplicate Prevention
1. Process an email
2. Count rows created
3. Run "Process New Emails Now" again
4. **Expected:** Email skipped (not duplicated)

---

## Potential Issues & Solutions

### Issue: "Too many rows!"
**Problem:** Email with 50 attachments creates 50 rows

**Solution:**
- Increase minimum attachment size filter (e.g., 10 KB instead of 5 KB)
- Add maximum attachments per email limit (future feature)

### Issue: "I want to see all attachments in one row"
**Problem:** Preferred old structure

**Solution:**
- Use Pivot Table or QUERY formula to group by email
- Example: `=QUERY(A:F, "SELECT B, C, D, E, COUNT(F) GROUP BY B, C, D, E")`

### Issue: "Duplicate Message IDs in Sheet"
**Problem:** Same email appears multiple times

**Clarification:**
- This is expected! Same email ID appears once per attachment
- This is NOT a bug - it's the new design
- Duplicate prevention still works correctly

---

## Migration Notes

### If You Have Existing Data

**Option 1: Keep old data, start fresh from now**
1. Rename current sheet to "Old Data"
2. Create new sheet
3. Process new emails in new sheet

**Option 2: Start completely fresh**
1. Export old data (Download as CSV)
2. Clear everything & start fresh
3. Keep old CSV as backup

### No Automatic Migration

There's no automatic way to convert old rows to new structure because:
- Old rows don't have individual attachment names
- Multiple links were stored as comma-separated text
- Would require parsing and splitting

**Recommendation:** Start fresh with new structure going forward.

---

## Summary

✅ **Changed:** One row per attachment (instead of one row per email)

✅ **Benefits:**
- Simpler data structure
- Easier filtering and sorting
- Better for analysis
- Cleaner display

✅ **Removed:**
- Attachments count column
- Drive Links column
- Rich text formatting

✅ **Added:**
- Single "Attachment" column
- One clean clickable link per row

✅ **Maintained:**
- 5 KB minimum size filtering
- Duplicate prevention
- AI summary (generated once per email)
- All other features

**Ready to test!** Clear everything and process some emails to see the new structure in action.
