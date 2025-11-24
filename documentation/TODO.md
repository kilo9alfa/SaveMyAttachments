# SaveMyAttachments - Current Tasks

**Last Updated:** 2025-11-24
**Current Focus:** Google Picker Implementation & OAuth Verification

---

## ✅ Completed

1. ✅ Implement Google Picker for Drive folder selection
2. ✅ Implement Google Picker for Spreadsheet selection
3. ✅ Change OAuth scope from `drive` to `drive.file` (saves $15k-$75k CASA assessment)
4. ✅ Remove spreadsheets scope (using Picker instead)
5. ✅ Remove dynamic folder creation logic (not compatible with drive.file)
6. ✅ Push all changes to Apps Script
7. ✅ Create container-bound test script with clasp
8. ✅ Reorganize documentation (move 38 old files to old_docs/)

---

## 🔄 In Progress

### 1. Test Google Picker Implementation
**Owner:** support@thecoralblock.com + testingsavemyattachments@gmail.com
**Container-Bound Test Script:**
- Spreadsheet: https://drive.google.com/open?id=1EapBDhR9d-d-lHhlExMopIFj1BxkilCJRb2yE7_eVzw
- Script: https://script.google.com/d/11RaPkayo-EmiKbATuNUzUSBbRCIWD1HE9Yfl-FNLtu6fvFAmbPtOrlky/edit

**Test Checklist:**
- [ ] Open spreadsheet and verify "SaveMyAttachments" menu appears
- [ ] Authorize OAuth permissions
- [ ] Test folder picker (SaveMyAttachments → Select Drive Folder)
- [ ] Test spreadsheet picker (SaveMyAttachments → Select Spreadsheet)
- [ ] Verify selections are saved
- [ ] Test with testingsavemyattachments@gmail.com (share spreadsheet)
- [ ] Test with support@thecoralblock.com

### 2. Transfer Project Ownership
**From:** testingsavemyattachments@gmail.com
**To:** support@thecoralblock.com

**Standalone Project (for reference):**
- Script ID: `1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K`
- URL: https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit
- Action: Add support@thecoralblock.com as Editor

---

## 📋 Next Steps

### 3. Update OAuth Response Documentation
**File:** `2025.11.24.Google_OAuth_Response.md`
**Changes Needed:**
- Update to reflect drive.file scope (not drive)
- Remove references to dynamic folder creation
- Add Google Picker explanation
- Update justification for why drive.file is sufficient

### 4. Record Demo Video with New Picker Workflow
**Script:** `2025.11.24.Demo_Video_Script_ElevenLabs.txt`
**Checklist:** `2025.11.24.Video_Recording_Checklist.md`

**Key Scenes to Show:**
1. OAuth consent screen (drive.file, gmail.readonly, script.external_request)
2. Opening spreadsheet with SaveMyAttachments menu
3. Using Google Picker to select Drive folder
4. Using Google Picker to select spreadsheet
5. Processing an email and saving to selected folder
6. Showing data in selected spreadsheet
7. Confirming data segregation (user's OpenRouter key)

### 5. Send Updated Response to Google OAuth Team
**Reference:** `2025.11.24.GoogleEmail.md` (original email from Google)
**Draft Response:** `2025.11.24.Google_OAuth_Response.md` (needs update)

**Key Points to Address:**
- ✅ DeepSeek models blocked (3-layer protection)
- ✅ Scope mismatch fixed (manifest updated)
- ✅ **NEW:** Changed from drive to drive.file scope
- ✅ **NEW:** Implemented Google Picker for folder/sheet selection
- ✅ **NEW:** No more dynamic folder creation
- Include new demo video link

---

## 📁 Documentation Structure

**Essential Files (in /documentation):**
- `TODO.md` - This file
- `CLAUDE.md` - Project documentation for Claude Code
- `2025.11.24.GoogleEmail.md` - Original email from Google OAuth team
- `2025.11.24.Google_OAuth_Response.md` - Draft response to Google
- `2025.11.24.Demo_Video_Script_ElevenLabs.txt` - Audio script for demo video
- `2025.11.24.Video_Recording_Checklist.md` - Video recording guide

**Archived Files (in /documentation/old_docs):**
- 38 old documentation files (previous guides, fixes, deprecated docs)

---

## 🎯 Success Criteria

**For Testing Phase:**
- [ ] Menu appears and works in container-bound script
- [ ] Google Picker opens and allows folder selection
- [ ] Google Picker opens and allows spreadsheet selection
- [ ] Selections are saved to PropertiesService
- [ ] Works for both support@ and testingsavemyattachments@ accounts

**For OAuth Approval:**
- [ ] Demo video shows complete workflow with Picker
- [ ] Response addresses all 3 Google concerns
- [ ] Explanation of drive.file scope change is clear
- [ ] Data segregation architecture is demonstrated
- [ ] DeepSeek blocking is visible in demo

**For Marketplace Launch:**
- [ ] OAuth verification approved
- [ ] Container-bound script tested thoroughly
- [ ] Documentation updated for users
- [ ] Support email configured (support@thecoralblock.com)
- [ ] Privacy policy and terms of service live

---

## 📞 Contacts

**Project Owner:** support@thecoralblock.com
**Test Account:** testingsavemyattachments@gmail.com
**Google Cloud Project:** savemyattachments (Project ID)
**GitHub Repo:** https://github.com/kilo9alfa/SaveMe

---

## 🔗 Quick Links

**Test Spreadsheet:**
https://drive.google.com/open?id=1EapBDhR9d-d-lHhlExMopIFj1BxkilCJRb2yE7_eVzw

**Container-Bound Script:**
https://script.google.com/d/11RaPkayo-EmiKbATuNUzUSBbRCIWD1HE9Yfl-FNLtu6fvFAmbPtOrlky/edit

**Standalone Script (Reference):**
https://script.google.com/d/1gH6Y8JaOLnu431FjeOIsOmMj9PSq-wqz6rVKn4-qOYsdNdVlIJVRJa6K/edit

**Google Cloud Console:**
https://console.cloud.google.com/apis/dashboard?project=savemyattachments
