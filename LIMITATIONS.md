# SaveMyAttachments - Limitations & Best Practices

## Understanding Google Apps Script Limitations

SaveMyAttachments runs on Google Apps Script, which has important limitations you should understand for large-scale email processing.

---

## 🚨 Critical Limitations

### 1. **Execution Time Limit**
- **Maximum:** 6 minutes per execution
- **Safety Buffer:** We stop at 5 minutes to prevent data loss
- **Impact:** Processing 50-100 emails typically takes 3-5 minutes

**What this means:**
- You **cannot** process 2000 emails in one run
- Large backlogs require multiple runs (automation handles this)

**Solution:**
✅ Enable automation (Settings → Automation → Every 15 minutes)
✅ Let it run for several hours to process large backlogs
✅ Use "View Progress" to monitor completion

---

### 2. **Properties Service Size Limit**
- **Limit:** 9KB per property, 500KB total
- **Tracking Capacity:** ~5,000-7,000 processed email IDs
- **Auto-cleanup:** Oldest entries removed automatically when limit approached

**What this means:**
- After processing ~5,000 emails, oldest entries are auto-removed
- Emails may be reprocessed if removed from tracking AND deleted from sheet
- This is normal and expected behavior

**Solution:**
✅ Auto-cleanup happens automatically
✅ Keep emails in sheet to prevent reprocessing
✅ Use "Clear Processed Tracking" if you want to intentionally reprocess

---

### 3. **Gmail API Quotas**
- **Daily Quota:** Generous but not unlimited
- **Read Operations:** Thousands per day
- **Error Recovery:** Automatic quota error detection

**What this means:**
- Searching for 2000+ emails multiple times per day may hit quota
- Quota resets daily (24 hours)

**Solution:**
✅ Reduce batch size if you hit quota (Settings → Batch Size → 5-10)
✅ Wait 24 hours for quota reset
✅ Avoid running "Process Now" excessively

---

### 4. **OpenRouter API Rate Limits**
- **Varies by model:** Each AI model has different rate limits
- **Typical:** 10-100 requests per minute depending on model
- **Error Recovery:** Automatic detection and helpful error messages

**What this means:**
- AI summaries may fail if you exceed rate limits
- Failed summaries show: `[Summary failed - Rate limit exceeded]`

**Solution:**
✅ Choose models with higher rate limits (Claude Haiku, GPT-3.5 Turbo)
✅ Reduce batch size during initial large processing
✅ Disable AI temporarily for very large backlogs (can re-enable later)

---

## 📊 Processing Large Email Backlogs

### Scenario: 2000 Emails from Last Year

**Settings:**
- Days Back: 365
- Batch Size: 10-20 (recommended)
- Automation: Enabled (every 15 minutes)

**Expected Timeline:**
- **Total Runs Needed:** 100-200 runs
- **With Automation (15 min):** 25-50 hours (1-2 days)
- **With Automation (5 min):** 8-16 hours

**Progress Monitoring:**
1. Open spreadsheet
2. Menu → Tools → View Progress
3. See: "Processed: 150/2000 (7%)"
4. Estimated time remaining shown

---

## 🎯 Best Practices

### For Initial Large Backlog (500+ emails):

1. **Start Conservative:**
   ```
   Settings → Batch Size: 10
   Settings → Days Back: 30 (start small)
   Settings → Automation: Every 15 minutes
   ```

2. **Monitor First Few Runs:**
   - Check execution time in logs
   - Verify no errors
   - Increase batch size if runs finish quickly (<2 min)

3. **Gradually Increase Scope:**
   - After 30 days processed successfully
   - Increase Days Back to 90, then 180, then 365
   - This prevents overwhelming the system

4. **Use Progress Tracking:**
   - Menu → Tools → View Progress
   - Provides estimates and completion time

### For Ongoing Maintenance (< 50 new emails/day):

```
Settings → Batch Size: 20
Settings → Automation: Every 15 minutes
```

This handles typical daily email volume effortlessly.

---

## ⚠️ Warning Signs & Solutions

### Warning: "Stopped Early - Execution time limit"
**Cause:** Batch size too large or emails have many large attachments

**Solution:**
```
Settings → Batch Size: Reduce by 50% (e.g., 20 → 10)
```

---

### Warning: "Gmail API quota exceeded"
**Cause:** Too many Gmail searches in 24 hours

**Solution:**
- Wait 24 hours for quota reset
- Reduce batch size
- Avoid manual "Process Now" repeatedly

---

### Warning: "Properties approaching limit"
**Cause:** Processing >5,000 emails

**Solution:**
- Auto-cleanup happens automatically
- This is normal - oldest entries removed
- Keep emails in sheet to prevent reprocessing

---

### Warning: "[Summary failed - Rate limit exceeded]"
**Cause:** OpenRouter rate limit hit

**Solution:**
- Reduce batch size temporarily
- Switch to faster model (Claude Haiku instead of Sonnet)
- Disable AI temporarily for large backlogs:
  ```
  Settings → Enable AI: Uncheck
  Process backlog
  Settings → Enable AI: Check
  ```

---

## 💡 Cost Optimization

### For Large Backlogs (1000+ emails):

**Option 1: Disable AI Initially**
- Process attachments only (fast & free)
- Re-enable AI later for future emails
- Cost: $0

**Option 2: Use Cheapest Model**
- Switch to Mistral 7B (~$0.10 per 1000 emails)
- Or Claude Haiku (~$0.25 per 1000 emails)
- Still intelligent, much cheaper
- Cost: $0.10-0.25

**Option 3: Process Everything with Best Model**
- Use Claude 3.5 Sonnet (~$3 per 1000 emails)
- Highest quality summaries
- Cost: $3

**View cost estimates:**
- Menu → Tools → View Cost Estimates
- Shows projected costs before processing

---

## 🔧 Advanced: Manual Multi-Run Strategy

If automation is disabled and you want to process manually:

### Quick Manual Processing:
```bash
# Repeat this 10-20 times:
1. Menu → Process New Emails Now
2. Wait 30 seconds
3. Repeat
```

Each run processes 10-20 emails (based on batch size).

**Estimated time:**
- 10 runs = 20-30 minutes
- 50 runs = 2-3 hours
- 100 runs = 4-6 hours

**Pro tip:** Enable automation instead! It does this automatically while you work.

---

## 📈 System Health Monitoring

### Check Health Regularly:

**Menu → Tools → View Diagnostics**
```
✅ Sheet rows: 150
✅ Tracked emails: 150
✅ Cache keys: 150
```

All three should be similar numbers.

**Menu → Tools → View Progress**
```
✅ Processed: 150/2000 (7%)
⏳ Estimated remaining: 1850 emails
⏱️ Time: ~300 minutes (~5 hours)
```

**Menu → Tools → Export Logs to Drive**
- Creates shareable log file
- Useful for debugging issues
- Share with support if needed

---

## 🚀 Recommended Workflow

### First-Time Setup (Large Backlog):

1. **Configure Settings:**
   - API key, Drive folder, AI model
   - Batch Size: 10
   - Days Back: 30 (start small)
   - Automation: Enabled (every 15 minutes)

2. **Test First Run:**
   - Menu → Process New Emails Now
   - Verify: Emails appear in sheet
   - Verify: Files appear in Drive

3. **Check Progress:**
   - Menu → Tools → View Progress
   - Note estimated time

4. **Let Automation Run:**
   - Close spreadsheet
   - Come back in a few hours
   - Check progress again

5. **Expand Gradually:**
   - Increase Days Back: 90 → 180 → 365
   - Increase Batch Size if runs finish quickly

### Ongoing Usage:

- **No action needed!** Automation handles everything
- Check sheet periodically to see new emails
- Use "View Progress" to monitor status

---

## 📞 Troubleshooting

### Problem: No emails found
**Check:**
- Settings → Days Back (try increasing)
- Settings → Gmail Filter (is it too restrictive?)
- Gmail actually has emails with attachments in date range

### Problem: Emails found but not processed
**Check:**
- Menu → Tools → View Diagnostics
- Look for "Already in sheet" or "Found in cache"
- Use "Clear Everything" to start fresh if needed

### Problem: Execution timeout errors
**Solution:**
- Reduce Batch Size to 5
- Check if attachments are very large (>25MB)
- Increase automation interval (15 min → 30 min)

### Problem: Everything seems stuck
**Nuclear Option:**
1. Menu → Tools → Nuclear Clear (Force Reset)
2. Reconfigure settings
3. Enable automation
4. Let it run

This clears all tracking and starts completely fresh.

---

## 📚 Additional Resources

- **View Logs:** Menu → Tools → Export Logs to Drive
- **Cost Estimates:** Menu → Tools → View Cost Estimates
- **Progress Tracking:** Menu → Tools → View Progress
- **GitHub Issues:** https://github.com/kilo9alfa/SaveMe/issues

---

## ✅ Summary: Key Takeaways

1. ✅ **Batch processing is normal** - Large backlogs require multiple runs
2. ✅ **Automation is your friend** - Enable it and let it work in background
3. ✅ **Start small, scale up** - Test with 30 days before going to 365
4. ✅ **Monitor progress** - Use "View Progress" to track completion
5. ✅ **Auto-cleanup is normal** - System manages itself after 5000 emails
6. ✅ **Cost-conscious?** - Disable AI or use cheaper models for backlogs
7. ✅ **Be patient** - Processing 2000 emails takes 1-2 days with automation

**Most important:** Enable automation and let it run. Check back in a few hours to see progress!
