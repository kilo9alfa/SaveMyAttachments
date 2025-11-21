# OAuth Verification Video - SIMPLIFIED SILENT VERSION

**Video Length:** 2-3 minutes
**Format:** Screen recording with text overlays (NO VOICE NEEDED)
**Recording Tool:** QuickTime (Mac), OBS, Loom, or any screen recorder
**Text Tool:** Any video editor, or just type in TextEdit/Notes and screen record it

---

## Quick Setup (5 minutes)

**Before recording:**

1. ✅ Gmail account with 1-2 test emails with attachments
2. ✅ Empty Google Drive folder (for backup demo)
3. ✅ Empty Google Sheet (for index demo)
4. ✅ OpenRouter API key (free from openrouter.ai - optional, can skip)
5. ✅ Clear browser cookies to show fresh OAuth consent
6. ✅ Open a text editor (TextEdit/Notes) with your text overlays ready

**Prepare these text overlays in advance:**

```
Slide 1: "SaveMyAttachments - OAuth Verification Demo"
Slide 2: "Step 1: User authorizes app with 5 OAuth scopes"
Slide 3: "Step 2: App reads Gmail to find emails with attachments"
Slide 4: "Step 3: App saves email and attachments to Google Drive"
Slide 5: "Step 4: App writes index row to Google Sheets with AI summary"
Slide 6: "Step 5: App applies Gmail label to mark email as processed"
Slide 7: "All processing happens in user's Google account. No data stored on our servers."
```

---

## Recording Instructions (15-30 minutes)

### Setup Your Screen:
1. Close all unnecessary windows/tabs
2. Increase browser zoom to 125-150% for readability
3. Have text overlays ready in a separate window
4. Start screen recording (QuickTime: File → New Screen Recording)

---

## SIMPLIFIED VIDEO SCRIPT

### Section 1: Introduction (30 seconds)

**[Screen: Your website homepage]**

**Say:**
> "Hello, my name is [Your Name] and I'm the developer of SaveMyAttachments, a Google Workspace Add-on that helps users automatically back up their Gmail emails and attachments to Google Drive with AI-powered summaries.
>
> In this video, I'll demonstrate how SaveMyAttachments uses each of the requested OAuth scopes and why they're necessary for the app to function."

---

### Section 2: OAuth Consent Flow (1 minute)

**[Screen: Apps Script editor with SaveMyAttachments open]**

**Say:**
> "Let me show you the initial authorization flow that users experience when they first set up SaveMyAttachments."

**Actions:**
1. Click "Run" on a function (e.g., `testOAuthScopes`)
2. Click "Review Permissions"
3. Select your Google account

**[Screen: OAuth consent screen]**

**Say:**
> "Users see this consent screen requesting 5 permissions. I'll explain each one and show exactly how we use it."

**Point to each permission and read it:**
- View and manage your mail
- See, edit, create, and delete all of your Google Drive files
- See, edit, create, and delete all your Google Sheets spreadsheets
- Connect to an external service
- Allow this application to run when you are not present

**Click "Advanced" → "Go to SaveMyAttachments (unsafe)"**

**Say:**
> "This 'unsafe' warning appears because we haven't completed OAuth verification yet - that's what we're doing now."

**Click "Allow"**

---

### Section 3: Gmail Scopes Demo (1.5 minutes)

**[Screen: Gmail inbox]**

**Say:**
> "SaveMyAttachments needs two Gmail scopes: gmail.readonly and gmail.modify. Let me show you why."

#### Gmail.readonly:

**[Screen: Apps Script settings panel]**

**Say:**
> "Users configure a Gmail search filter - for example, 'from:client@company.com has:attachment' - to specify which emails to back up."

**Actions:**
1. Open SaveMyAttachments settings (or show code)
2. Show Gmail search filter field
3. Enter example: "has:attachment"

**Say:**
> "The app uses GmailApp.search() to find emails matching this filter, then reads the email metadata - sender, date, subject - and retrieves attachments. We also read the email body to generate AI summaries."

**[Screen: Show execution log with GmailApp calls or code]**

**Say:**
> "Here you can see the GmailApp.search() call finding emails matching the user's filter."

#### Gmail.modify:

**[Screen: Gmail inbox]**

**Say:**
> "After processing an email, we apply a Gmail label - 'SaveMe/Processed' - to prevent duplicate processing."

**Actions:**
1. Show an email without the label
2. Process it
3. Show the label applied

**Say:**
> "This uses the gmail.modify scope to add labels. We never delete, move, or modify email content - only add tracking labels."

---

### Section 4: Drive Scope Demo (1 minute)

**[Screen: Google Drive folder]**

**Say:**
> "SaveMyAttachments needs the full drive scope to save backups to user-specified folders."

**Actions:**
1. Show an empty Drive folder
2. Show the folder URL in settings
3. Process a test email with attachment

**[Screen: Drive folder after processing]**

**Say:**
> "After processing, the email PDF and attachments are saved to Drive with organized folder structures and custom file naming."

**Actions:**
1. Show created folders (e.g., "2024/11/Client Name/")
2. Open a saved email PDF
3. Show saved attachments

**Say:**
> "We need full drive scope - not just drive.file - because users specify existing folders where they want backups saved. We only access folders the user configures, and we only create files - we never read or delete existing Drive content."

---

### Section 5: Sheets Scope Demo (45 seconds)

**[Screen: Empty Google Sheet]**

**Say:**
> "SaveMyAttachments creates a searchable index in Google Sheets with metadata about each backed-up email."

**Actions:**
1. Show the Sheet URL in settings
2. Process a test email
3. Show the new row added to Sheet

**[Screen: Google Sheet with new row]**

**Say:**
> "Each row contains the email date, sender, subject, AI summary, and clickable Drive links to the backed-up files. Users can search, filter, and sort this index to quickly find emails."

**Point to columns:**
- Date
- Sender
- Subject
- AI Summary
- Drive Links

---

### Section 6: External Request Scope Demo (1 minute)

**[Screen: OpenRouter dashboard or settings]**

**Say:**
> "SaveMyAttachments uses the script.external_request scope to call the OpenRouter API for AI-generated email summaries."

**Actions:**
1. Show OpenRouter API key field in settings
2. Show model selection (e.g., "Claude 3.5 Sonnet")

**Say:**
> "Users provide their own OpenRouter API key, giving them full control over which AI model processes their data and what it costs. We support over 200 models."

**[Screen: Show AI summary being generated or code calling OpenRouter]**

**Say:**
> "When an email is processed, we send the email content to OpenRouter via the user's API key, receive a concise summary, and add it to the Sheets index."

**[Screen: Show Sheet with AI summary]**

**Say:**
> "Here you can see the AI-generated summary: [read example summary]. This makes it easy to understand email content at a glance."

**Say:**
> "Importantly, email content goes directly from the user's Google account to OpenRouter via their API key. We - the app developers - never receive, store, or process email content on our servers."

---

### Section 7: Privacy & Data Handling (30 seconds)

**[Screen: Your privacy policy page or diagram]**

**Say:**
> "Let me emphasize our privacy commitment: All email processing happens within the user's Google account. Email content is sent to AI only via the user's own API key. Backups are saved to the user's own Drive, and the index is written to the user's own Sheet.
>
> We never store, transmit, or access email content on our servers. Users maintain full control over their data."

**[Screen: Your privacy policy URL]**

**Say:**
> "Our complete privacy policy is available at thecoralblock.pages.dev/privacy, and users can delete all processed email tracking anytime from within the app."

---

### Section 8: Conclusion (15 seconds)

**[Screen: Your website or app]**

**Say:**
> "Thank you for reviewing SaveMyAttachments. This app helps users protect their important emails and attachments with automated backups, intelligent AI summaries, and full user control over their data.
>
> If you have any questions, please contact me at dp@databeacon.aero."

**[End screen: Show contact info]**
- App Name: SaveMyAttachments
- Developer: dp@databeacon.aero
- Website: thecoralblock.pages.dev
- Privacy Policy: thecoralblock.pages.dev/privacy

---

## Recording Tips

1. **Video Quality:**
   - Record in 1080p (1920x1080) minimum
   - Use clear audio (built-in mic is usually fine)
   - Speak clearly and at moderate pace
   - No background music needed

2. **Screen Setup:**
   - Close unnecessary tabs/windows
   - Use a clean browser profile
   - Increase browser zoom to 125-150% for readability
   - Full screen browser for recording

3. **Demo Account:**
   - Use a test Gmail account (not your primary)
   - Have 2-3 test emails with simple attachments ready
   - Use simple test data (no real client emails)

4. **Upload:**
   - Upload to YouTube (unlisted or public)
   - Or use Google Drive (ensure link sharing is enabled)
   - Or submit directly in verification form

5. **Length:**
   - Aim for 3-5 minutes
   - Don't rush but stay focused
   - Show actual usage, not just code

---

## Post-Recording Checklist

- [ ] Video clearly shows OAuth consent screen
- [ ] All 5 scopes are demonstrated with real usage
- [ ] Privacy practices are explained
- [ ] Video is under 10 minutes
- [ ] Audio is clear
- [ ] Video URL is shareable (YouTube unlisted or Drive link)
- [ ] Video is ready to submit with verification request

---

**Ready to record?** Follow this script, but feel free to adapt to your natural speaking style. The key is showing Google *exactly* how you use each scope and *why* users benefit.
