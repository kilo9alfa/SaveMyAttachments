# Phase 1: Complete! 🎉

## What Was Built

Phase 1 adds **scheduled processing**, **batch email handling**, and **advanced filtering** to SaveMe.

### New Features

#### 1. **Automated Scheduled Processing**
- Set up time-based triggers (every 5, 10, 15, 30, or 60 minutes)
- Automatic email checking and processing in the background
- Start/stop automation from the menu
- View automation status anytime

#### 2. **Batch Processing**
- Process up to 20 emails at once (configurable)
- Smart duplicate detection - never process the same email twice
- Processing statistics (found, processed, skipped, errors)
- Manual batch processing available from menu

#### 3. **Email Tracking System**
- Tracks all processed emails using message IDs
- Persistent storage (survives script restarts)
- Fast cache-based checking
- View count of processed emails
- Option to clear tracking and start fresh

#### 4. **Advanced Filtering**
- Filter by sender (`from:email@domain.com`)
- Filter by Gmail label (`label:important`)
- Filter by date range (last N days)
- Custom Gmail search queries
- Combine multiple filters

#### 5. **Enhanced Menu & UI**
- Organized menu with submenus
- Automation controls
- Batch processing options
- Tools and utilities
- Status monitoring

### New Files Created

1. **EmailTracker.gs** - Tracks processed emails to avoid duplicates
2. **TriggerManager.gs** - Manages scheduled automation and triggers

### Updated Files

1. **Code.gs** - New menu items and automation UI
2. **Config.gs** - Extended configuration with automation settings
3. **GmailProcessor.gs** - Batch processing and filtering logic

## How to Test Phase 1

### Step 1: Update Your Scripts

1. Go to your Apps Script editor
2. Create two new files:
   - `EmailTracker.gs` - Copy from `/Users/dpm/Documents/repos/SaveMe/EmailTracker.gs`
   - `TriggerManager.gs` - Copy from `/Users/dpm/Documents/repos/SaveMe/TriggerManager.gs`

3. Update existing files:
   - Replace `Code.gs` with the updated version
   - Replace `Config.gs` with the updated version
   - Replace `GmailProcessor.gs` with the updated version

4. **Save all files** (Cmd+S / Ctrl+S)

5. **Refresh your Google Sheet** - You should see the updated SaveMe menu with emojis!

### Step 2: Test Batch Processing

1. Make sure you have several emails with attachments in your Gmail (last 7 days)

2. Click **SaveMe** → **📧 Process New Emails Now**

3. You should see a results dialog showing:
   - How many emails were found
   - How many were processed
   - How many were skipped (already processed)
   - Any errors

4. Check your Google Sheet - you should see multiple rows (one per email)

5. Click **📧 Process New Emails Now** again
   - This time all emails should be skipped (already processed)

### Step 3: Test Automation

1. Click **SaveMe** → **🤖 Automation** → **Start Automation**

2. Enter `15` (for 15 minutes) when prompted

3. Click OK - you should see "Automation Started!" confirmation

4. Wait 15 minutes, then check your Sheet
   - New emails (if any) should be automatically processed

5. Check status: **SaveMe** → **🤖 Automation** → **View Status**
   - Should show "✅ ENABLED" and "Every 15 minutes"

6. To stop: **SaveMe** → **🤖 Automation** → **Stop Automation**

### Step 4: Test Filtering

Currently, filtering is configured via the Config.gs settings. To test:

#### Option A: Edit Config Directly (Temporary for testing)

In `Config.gs`, temporarily modify the `getConfig` function:

```javascript
// Add a sender filter for testing
senderFilter: 'example@domain.com',  // Replace with actual sender
```

Or use custom Gmail search:

```javascript
// Custom filter
emailFilter: 'from:someone@email.com has:attachment',
```

Then run "Process New Emails Now" and see it only process matching emails.

#### Option B: Wait for Settings UI (Phase 2)

We'll add a proper settings dialog in the next phase where you can configure filters via UI.

### Step 5: Test Tracking Tools

1. **View Processed Count:**
   - Click **SaveMe** → **🔧 Tools** → **View Processed Count**
   - Should show how many emails have been processed

2. **Clear Tracking (Optional):**
   - Click **SaveMe** → **🔧 Tools** → **Clear Processed Tracking**
   - This will allow emails to be processed again
   - Useful for testing

## Configuration Options

These are stored in `PropertiesService` and can be configured via code or UI:

### Core Settings
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `MODEL` - AI model to use (default: `anthropic/claude-3.5-sonnet`)
- `DRIVE_FOLDER_ID` - Where to save attachments
- `MAX_TOKENS` - Max tokens for AI (default: 100)

### Automation Settings
- `AUTOMATION_ENABLED` - true/false
- `AUTOMATION_INTERVAL` - Minutes between runs (5, 10, 15, 30, 60)
- `BATCH_SIZE` - Max emails to process per run (default: 20)
- `DAYS_BACK` - How many days to search (default: 7)

### Filtering Settings
- `EMAIL_FILTER` - Custom Gmail search query
- `SENDER_FILTER` - Filter by sender email
- `LABEL_FILTER` - Filter by Gmail label

### Notification Settings
- `NOTIFY_ON_ERRORS` - Send email notification on errors (default: false)

## Advanced Gmail Search Queries

You can use any Gmail search syntax in the `EMAIL_FILTER` setting:

```
# Emails from specific sender with attachments
from:john@example.com has:attachment

# Emails with specific label
label:receipts has:attachment

# Emails with subject keyword
subject:invoice has:attachment

# Multiple criteria
from:accounting@company.com OR from:billing@company.com has:attachment

# Larger attachments only
from:someone@email.com larger:1M

# Exclude certain senders
has:attachment -from:spam@example.com
```

## Troubleshooting

### "No new emails found"
- Check your filters - they might be too restrictive
- Make sure you have emails with attachments in the date range
- Try increasing `DAYS_BACK` setting

### Automation not running
- Check if triggers are set up: **View** → **Triggers** in Apps Script editor
- You should see a trigger for `runScheduledProcessing`
- Check Apps Script logs: **View** → **Executions**

### Emails being processed multiple times
- Tracking system should prevent this
- If it happens, check the execution logs for errors
- The tracking cache might have expired (6 hour limit)

### Script timeout errors
- Reduce `BATCH_SIZE` to process fewer emails per run
- Large attachments can cause timeouts
- Consider filtering to exclude very large files

## What's Next?

### Phase 2 Features (Coming Soon)
- Enhanced Settings UI with dialog interface
- Configure filters visually (no code editing)
- Save/load filter presets
- Multiple workflow rules
- Email notification preferences

### Phase 3 Features (Advanced)
- PDF text extraction
- Custom AI questions for data extraction
- Dynamic folder organization by date/sender
- Custom file naming templates
- Processing dashboard with charts

## Performance & Costs

### Apps Script Quotas
- **Trigger quota:** 90 minutes/day for free accounts
- **At 15-min intervals:** ~96 runs/day (well within limits)
- **Batch size of 20:** Up to 1,920 emails/day

### OpenRouter Costs
- **Claude 3.5 Sonnet:** ~$0.01-0.02 per email
- **Processing 100 emails/day:** ~$1-2/day
- **Monthly (3,000 emails):** ~$30-60/month

### Optimization Tips
1. Use faster/cheaper models for simple emails (e.g., `anthropic/claude-3-haiku`)
2. Increase automation interval (30 or 60 minutes) to reduce runs
3. Use specific filters to only process important emails
4. Disable AI summaries for certain email types (future feature)

## Support

If you encounter issues:

1. Check **View** → **Logs** in Apps Script editor
2. Look for error messages in the execution logs
3. Try the "Test" functions to isolate the problem
4. Clear processed tracking if emails aren't being processed

---

**Phase 1 Status:** ✅ Complete and ready for testing!

**Next Step:** Test all the new features and let me know if you'd like to move to Phase 2 or if anything needs adjustment!
