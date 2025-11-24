# SaveMe - Update Instructions

## What Was Fixed

I've added diagnostic tools and improved the "Clear Everything & Start Fresh" feature to help resolve the issue you were experiencing.

---

## Files Updated

### 1. **Code.gs**
Added/improved:
- ✅ New menu item: "View Diagnostics" (under Tools)
- ✅ New function: `showDiagnostics()` - Shows current state of sheet and tracking
- ✅ Improved: `clearEverythingUI()` - More robust clearing with verification

### 2. **EmailTracker.gs**
- ✅ Updated: `clearProcessedEmails()` - Now returns count of cleared emails

---

## How to Apply Updates

### Step 1: Update Your Apps Script Files

1. Open your Google Apps Script editor
2. **Update Code.gs:**
   - Copy the entire contents of `/Users/dpm/Documents/repos/SaveMe/Code.gs`
   - Paste into your Code.gs file
   - Save (Cmd+S / Ctrl+S)

3. **Update EmailTracker.gs:**
   - Copy the entire contents of `/Users/dpm/Documents/repos/SaveMe/EmailTracker.gs`
   - Paste into your EmailTracker.gs file
   - Save

### Step 2: Refresh Your Spreadsheet

1. Close your Google Sheet (completely close the tab)
2. Reopen the spreadsheet
3. Wait for the script to load (~5 seconds)
4. The SaveMe menu should refresh

---

## New Features Available

### 1. View Diagnostics (NEW!)

**Location:** SaveMe → 🔧 Tools → View Diagnostics

**What it shows:**
- Current number of rows in your sheet
- Number of Message IDs present
- Number of emails in tracking system
- Whether cache is working

**When to use:**
- Before clearing everything (to see current state)
- After clearing (to verify it worked)
- If emails aren't being processed (to diagnose why)

### 2. Clear Everything & Start Fresh (IMPROVED!)

**Location:** SaveMe → 🔧 Tools → Clear Everything & Start Fresh

**What's new:**
- Completely clears the sheet (simpler method)
- Shows verification after clearing (tells you exactly what was cleared)
- Better error handling
- Logs everything to help diagnose issues

**What it does:**
1. Clears ALL rows from sheet (including headers)
2. Clears ALL processed email tracking
3. Verifies and shows you the results

---

## Testing Steps

### Step 1: Run Diagnostics (Before Clearing)

1. **SaveMe → 🔧 Tools → View Diagnostics**
2. Take note of the numbers:
   - Sheet rows
   - Tracked emails

### Step 2: Clear Everything

1. **SaveMe → 🔧 Tools → Clear Everything & Start Fresh**
2. Confirm twice (it will ask you)
3. You'll see a success message showing:
   - Sheet rows: 0
   - Tracked emails: 0

### Step 3: Run Diagnostics (After Clearing)

1. **SaveMe → 🔧 Tools → View Diagnostics**
2. Verify both numbers are now 0

### Step 4: Process Emails

1. **SaveMe → 📧 Process New Emails Now**
2. You should see:
   - Found: X emails (the ones matching your filter)
   - Processed: X (should be > 0)
   - Skipped: 0 (nothing should be skipped anymore)

---

## What Should Happen

### ✅ Expected Behavior After "Clear Everything":

```
BEFORE Clear:
- Sheet rows: 127 (for example)
- Tracked emails: 64

AFTER Clear:
- Sheet rows: 0
- Tracked emails: 0

AFTER Processing:
- Sheet rows: 2+ (headers + new data)
- Emails are processed fresh
- No "already processed" skips
```

### ❌ If It's Not Working:

If after clearing you still see:
- Sheet rows: > 0
- Tracked emails: > 0
- Emails being skipped

Then:
1. Run Diagnostics and share the output with me
2. Check the Apps Script logs: View → Logs (in script editor)
3. Look for any error messages

---

## Quick Reference

| Feature | What It Does | When to Use |
|---------|--------------|-------------|
| **View Diagnostics** | Shows current state | Before/after clearing, debugging |
| **View Processed Count** | Shows just the tracking count | Quick check |
| **Clear Processed Tracking Only** | Clears tracking, keeps sheet rows | When you want to keep data |
| **Clear Everything & Start Fresh** | Clears EVERYTHING | Complete reset |

---

## Troubleshooting

### Problem: Menu doesn't show new items

**Solution:**
1. Make sure you saved Code.gs after updating
2. Close and reopen the spreadsheet
3. Wait 5-10 seconds for script to initialize

### Problem: "Clear Everything" doesn't seem to work

**Solution:**
1. Run "View Diagnostics" to see current state
2. Try the clear operation
3. Run "View Diagnostics" again
4. Share both results with me if numbers don't change

### Problem: Emails still being skipped after clearing

**Solution:**
1. Run "View Diagnostics" - should show 0 tracked emails
2. If not 0, the clear didn't work properly
3. Check Apps Script logs for errors
4. Try running `clearProcessedEmails()` directly from script editor

---

## What Changed Under the Hood

### Old "Clear Everything" Logic:
```javascript
// Complex logic to delete rows while keeping headers
if (sheet.getLastRow() > 1) {
  sheet.deleteRows(2, sheet.getLastRow() - 1);
} else if (sheet.getLastRow() === 1) {
  sheet.clear();
}
```

**Problem:** Sometimes this logic didn't fully clear everything

### New "Clear Everything" Logic:
```javascript
// Simple: just clear the entire sheet
sheet.clear();
// Headers will be recreated when processing starts
```

**Benefit:** More reliable, simpler, easier to verify

---

## Next Steps

1. ✅ Update Code.gs and EmailTracker.gs
2. ✅ Refresh your spreadsheet
3. ✅ Run "View Diagnostics" to see current state
4. ✅ Run "Clear Everything & Start Fresh"
5. ✅ Verify with "View Diagnostics" (should show 0s)
6. ✅ Run "Process New Emails Now"
7. ✅ Check that emails are actually processed (not skipped)

---

## Questions?

After you've applied these updates, if you're still having issues:
1. Run "View Diagnostics" and share the output
2. Check the Apps Script logs (View → Logs)
3. Let me know what message you're seeing

The diagnostics tool will help us quickly identify what's going wrong!
