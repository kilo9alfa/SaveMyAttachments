# OAuth Verification Video - SILENT VERSION (NO VOICE NEEDED)

**Video Length:** 2-3 minutes
**Format:** Screen recording only with text overlays
**Recording Tool:** QuickTime (Mac), OBS, Loom, or screen recorder of choice
**Audio:** None required (or add background music if you want)

---

## Why This Works

Google just needs to **see** how you use each scope. No voice narration required. Many developers submit silent videos with text overlays.

---

## Pre-Recording Setup (10 minutes)

### 1. Create Test Accounts/Files

- [ ] Gmail account with 1-2 emails that have attachments
- [ ] Empty Google Drive folder for backup destination
- [ ] Empty Google Sheet for the index
- [ ] OpenRouter API key (get free at openrouter.ai - or skip AI demo)

### 2. Prepare Text Overlays

Open TextEdit or Notes and prepare these text slides (you'll show them during recording):

```
=== SLIDE 1 ===
SaveMyAttachments
OAuth Verification Demo

Developer: dp@databeacon.aero
Project: savemyattachments

=== SLIDE 2 ===
Step 1: OAuth Authorization
User grants 5 scopes:
• gmail.readonly - Read emails
• gmail.modify - Apply labels
• drive - Save backups
• spreadsheets - Write index
• external_request - Call AI API

=== SLIDE 3 ===
Step 2: Read Gmail
Finding emails with attachments
Extracting email content and files

=== SLIDE 4 ===
Step 3: Save to Google Drive
Creating organized folder structure
Uploading email PDF and attachments

=== SLIDE 5 ===
Step 4: Write to Google Sheets
Adding row with:
• Email metadata
• AI summary
• Drive links

=== SLIDE 6 ===
Step 5: Apply Gmail Label
Marking email as processed
Prevents duplicate processing

=== SLIDE 7 ===
Privacy & Security
✓ All processing in user's Google account
✓ Email sent to AI via user's API key only
✓ No data stored on our servers
✓ User controls all data

Thank you!
thecoralblock.com
```

### 3. Recording Setup

- [ ] Close unnecessary browser tabs/windows
- [ ] Increase browser zoom to 125-150% (easier to see)
- [ ] Clear browser cookies (to show fresh OAuth consent screen)
- [ ] Open Apps Script project in browser
- [ ] Have text overlays ready to display
- [ ] Test your screen recorder

---

## Simple Recording Script (2-3 minutes total)

### Scene 1: Title Slide (5 seconds)

**Show:** SLIDE 1 in TextEdit (full screen)
**Duration:** 5 seconds
**Action:** Just display the title slide

---

### Scene 2: OAuth Consent Screen (30 seconds)

**Show:** SLIDE 2 in corner of screen
**Action:**
1. Open Apps Script: https://script.google.com/d/1vZn5nX42_97wDjhcKVFl41l5uxNkE6q_eIgkneS9EuCdeyrD0-SRWrn1/edit
2. Click Run on `testOAuthScopes` function
3. Click "Review Permissions"
4. Select your Google account
5. **IMPORTANT:** Show the "unverified app" screen
6. Click "Advanced" → "Go to SaveMyAttachments (unsafe)"
7. **PAUSE** on the permissions screen showing all 5 scopes
8. **Let viewer read the 5 permissions** (hold for 3-4 seconds)
9. Click "Allow"

**Key moment:** Make sure the 5 permissions are clearly visible on screen

---

### Scene 3: Gmail Reading (20 seconds)

**Show:** SLIDE 3 in corner
**Action:**
1. Open Gmail inbox
2. Show 1-2 emails with attachments
3. Open SaveMyAttachments settings (or show the code)
4. Show Gmail search filter: "has:attachment"
5. Click "Process Now" or run processing function

**Alternative:** Just show Gmail inbox with emails that will be processed

---

### Scene 4: Drive Backup (25 seconds)

**Show:** SLIDE 4 in corner
**Action:**
1. Open your empty Google Drive folder (before processing)
2. After processing, refresh Drive folder
3. Show created files:
   - Email PDF
   - Attachments saved
4. Show organized folder structure (if you set up subfolders)
5. Open one of the saved email PDFs to show content

**Key moment:** Show Drive folder before (empty) and after (files created)

---

### Scene 5: Sheets Index (20 seconds)

**Show:** SLIDE 5 in corner
**Action:**
1. Open your empty Google Sheet (before processing)
2. After processing, show the new row added with:
   - Email date
   - Sender
   - Subject
   - AI summary (or "[Summary]" if you skipped AI)
   - Drive link (show it's clickable)
3. Click the Drive link to show it works

**Key moment:** Show Sheet before (empty/headers only) and after (row added)

---

### Scene 6: Gmail Label (15 seconds)

**Show:** SLIDE 6 in corner
**Action:**
1. Go back to Gmail inbox
2. Show the email now has "SaveMe/Processed" label
3. Show label in left sidebar (if visible)

**Key moment:** Clear visual of label applied to processed email

---

### Scene 7: Privacy Statement (10 seconds)

**Show:** SLIDE 7 (full screen)
**Duration:** Hold for 8-10 seconds so viewer can read
**Action:** Just display the privacy slide

---

## Recording Options

### Option A: One Continuous Recording (Easiest)
- Record everything in one take
- Show text overlays by switching to TextEdit window
- If you mess up, just keep going - doesn't need to be perfect

### Option B: Record Segments & Combine
- Record each scene separately
- Combine with iMovie, QuickTime, or any video editor
- Easier to get each part right
- Takes slightly longer

**Recommendation:** Option A - one continuous recording is fine!

---

## QuickTime Recording Steps (Mac)

1. **Start Recording:**
   - Open QuickTime Player
   - File → New Screen Recording
   - Click red record button
   - Select area or full screen
   - Click "Start Recording"

2. **During Recording:**
   - Follow the script above
   - Switch between browser and TextEdit for text overlays
   - Take your time - you can speed up later

3. **Stop Recording:**
   - Click stop button in menu bar
   - File → Save
   - Save as "SaveMyAttachments-OAuth-Demo.mov"

4. **Upload to YouTube:**
   - Go to youtube.com
   - Click "Create" → "Upload video"
   - Upload your .mov file
   - Set to "Unlisted" (not Public, not Private)
   - Title: "SaveMyAttachments OAuth Verification Demo"
   - Description: "OAuth scope demonstration for Google verification"
   - Click "Publish"
   - Copy the YouTube URL

---

## Tips for Better Video

✅ **DO:**
- Show browser at 125-150% zoom (easier to see)
- Pause on important screens (OAuth consent, permissions list)
- Show before/after (empty Drive folder → files created)
- Keep it simple - doesn't need to be fancy
- 2-3 minutes is perfect

❌ **DON'T:**
- Don't worry about perfection - rough is fine
- Don't include personal/sensitive emails (use test data)
- Don't rush - let viewers see each step
- Don't add fancy effects - simple screen recording is best

---

## Checklist Before Recording

- [ ] Test emails with attachments ready in Gmail
- [ ] Empty Drive folder created
- [ ] Empty Sheet created
- [ ] Apps Script project open in browser
- [ ] Text overlays prepared in TextEdit
- [ ] Browser zoom at 125-150%
- [ ] Browser cookies cleared (for fresh OAuth consent)
- [ ] Unnecessary tabs/windows closed
- [ ] Screen recorder tested and ready

---

## After Recording

- [ ] Watch the video once to ensure all 5 scopes are shown
- [ ] Check video is 2-5 minutes (not too short, not too long)
- [ ] Upload to YouTube as **Unlisted**
- [ ] Copy YouTube URL
- [ ] Paste URL into Google OAuth verification form
- [ ] Submit verification request

---

## Example Timeline (2:30 video)

- 0:00-0:05 - Title slide
- 0:05-0:35 - OAuth consent flow (showing 5 scopes)
- 0:35-0:55 - Gmail reading demo
- 0:55-1:20 - Drive backup demo
- 1:20-1:40 - Sheets index demo
- 1:40-1:55 - Gmail label demo
- 1:55-2:05 - Privacy statement
- 2:05-2:10 - Thank you / website

**Total: ~2 minutes 10 seconds** ✅

---

## You Can Do This!

This is just a simple screen recording showing:
1. ✅ OAuth consent screen with your 5 scopes
2. ✅ Reading Gmail
3. ✅ Saving to Drive
4. ✅ Writing to Sheets
5. ✅ Applying Gmail label
6. ✅ Privacy statement

**No voice, no fancy editing, no stress.** Just show Google how the app works.

**Estimated time investment:**
- Setup: 10 minutes
- Recording: 15-30 minutes (including retakes)
- Upload: 5 minutes
- **Total: 30-45 minutes**

---

**Ready to record? Follow this script and you'll have your video in under an hour!**
