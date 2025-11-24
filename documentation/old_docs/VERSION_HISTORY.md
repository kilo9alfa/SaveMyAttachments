# SaveMyAttachments - Version History

## 📌 Version 1.0 - Pre-Rules Engine
**Tag:** `v1.0-pre-rules`
**Branch:** `stable-v1.0-pre-rules`
**Date:** January 2025
**Commit:** `7ff4110`

### Description
Stable version before implementing the multiple rules engine. This is the last version with single-configuration mode.

### Features Included
- ✅ Single configuration mode (one workflow)
- ✅ Email processing with AI summaries (OpenRouter integration)
- ✅ Save emails as PDF/HTML/Plain Text
- ✅ Save attachments to Google Drive
- ✅ Google Sheets integration (searchable index)
- ✅ File naming templates
- ✅ File filtering (size, extension)
- ✅ Safety features:
  - Execution time monitoring (5-min limit)
  - Properties Service auto-cleanup (>5000 emails)
  - Progress tracking with estimates
  - Quota error detection
- ✅ Comprehensive error handling
- ✅ Automation (configurable intervals)
- ✅ Documentation (LIMITATIONS.md)
- ✅ Menu: Process Now, Settings, Tools
- ✅ Rebranded as "SaveMyAttachments"

### Known Limitations
- Only one configuration/workflow
- All emails processed the same way
- Single destination sheet and folder

---

## 🚀 Version 2.0 - Rules Engine (In Development)
**Planned Features:**
- Multiple independent workflows (rules)
- Each rule: Filter + AI Prompt + Sheet + Folder
- Catch-all mode for unmatched emails
- Per-rule statistics
- Backwards compatible migration

---

## 📋 How to Use These Versions

### View the Pre-Rules Version

**Option 1: View in GitHub**
```
https://github.com/kilo9alfa/SaveMe/tree/v1.0-pre-rules
```

**Option 2: Checkout locally (temporary)**
```bash
# View the tagged version
git checkout v1.0-pre-rules

# Look around, test, etc.
# When done, return to main:
git checkout main
```

**Option 3: Checkout the branch (for development)**
```bash
# Switch to stable branch
git checkout stable-v1.0-pre-rules

# Make changes if needed
git add .
git commit -m "Hotfix for v1.0"
git push origin stable-v1.0-pre-rules

# Return to main
git checkout main
```

### Restore Pre-Rules Version (Emergency Rollback)

**If rules engine has major issues:**
```bash
# WARNING: This discards all work after v1.0-pre-rules

# Option A: Reset main to tag
git checkout main
git reset --hard v1.0-pre-rules
git push origin main --force

# Option B: Make branch the new main
git checkout stable-v1.0-pre-rules
git checkout -b new-main
git push origin new-main
# Then update GitHub default branch to new-main
```

### Deploy Pre-Rules Version to Apps Script

```bash
# Checkout the version
git checkout v1.0-pre-rules

# Deploy
clasp push

# Return to main when done
git checkout main
```

---

## 🏷️ Tagging Convention for Future Versions

### Version Numbering
- **v1.x** - Pre-rules, single configuration
- **v2.x** - Rules engine
- **v3.x** - Future major features

### Tag Format
```bash
# Release tags
git tag -a v2.0 -m "Version 2.0 - Rules Engine Release"

# Pre-release tags
git tag -a v2.0-beta.1 -m "Version 2.0 Beta 1"
git tag -a v2.0-rc.1 -m "Version 2.0 Release Candidate 1"

# Feature milestone tags
git tag -a v2.0-alpha-rules -m "Rules engine alpha"

# Push tags
git push origin v2.0
```

### Branch Convention
- `main` - Current development
- `stable-v1.0-pre-rules` - Maintenance branch for v1.0
- `stable-v2.0` - Maintenance branch for v2.0 (create when v2 is released)

---

## 📊 Comparison Table

| Feature | v1.0 (Pre-Rules) | v2.0 (Rules Engine) |
|---------|------------------|---------------------|
| Workflows | 1 (single config) | Unlimited |
| Gmail Filters | 1 | Multiple per rule |
| AI Prompts | 1 (global) | Per rule + global default |
| Destination Sheets | 1 | Multiple per rule |
| Destination Folders | 1 | Multiple per rule |
| Catch-All | N/A (processes all) | Optional toggle |
| Backwards Compatible | - | ✅ Yes (auto-migration) |
| Pricing Tier | Standard: 1 workflow | Standard: 5 rules, Pro: Unlimited |

---

## 🔧 Development Guidelines

### Before Major Changes
1. Create a tag: `git tag -a vX.Y-pre-feature -m "Before feature"`
2. Create a branch: `git branch stable-vX.Y`
3. Push both: `git push origin vX.Y-pre-feature stable-vX.Y`
4. Document in this file

### After Release
1. Tag the release: `git tag -a vX.Y -m "Release X.Y"`
2. Update this file with release notes
3. Push tag: `git push origin vX.Y`

---

**Last Updated:** January 2025
