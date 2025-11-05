# SaveMe - Google Workspace Marketplace Publishing Guide

Complete guide to publishing SaveMe on the Google Workspace Marketplace for free or paid distribution.

---

## 📊 Publishing Overview

### What is Google Workspace Marketplace?

The official app store for Google Workspace (Gmail, Drive, Sheets, etc.). Users can:
- Discover and install add-ons
- Purchase paid subscriptions
- Review and rate apps
- Get automatic updates

**Your app runs in users' Google accounts** - just like how SaveMe works now, but distributed to millions of users with one-click install.

---

## 💰 Monetization Options

### Option A: Free (Open Source / Community)

**Pros:**
- ✅ Wider adoption
- ✅ No payment complexity
- ✅ Build reputation
- ✅ Community contributions
- ✅ Faster approval process

**Cons:**
- ❌ No direct revenue
- ❌ Must support for free
- ❌ Harder to justify development time

**Best for:**
- Portfolio project
- Open source contribution
- Building user base first

### Option B: Freemium

**Free Tier:**
- Basic email backup
- 10 emails/month
- No AI features

**Paid Tier ($69-99/year):**
- Unlimited emails
- AI summaries
- All features

**Pros:**
- ✅ Try before buy
- ✅ Large user base
- ✅ Conversion funnel
- ✅ Free users spread word

**Cons:**
- ❌ Support free users
- ❌ Complex tier management
- ❌ Low conversion rates (2-5% typical)

### Option C: Paid Subscription (Recommended)

**SaveMe Standard: $69/year**
**SaveMe Pro: $99/year**

**Pros:**
- ✅ Direct revenue
- ✅ Sustainable development
- ✅ Professional positioning
- ✅ Quality users (invested)

**Cons:**
- ❌ Smaller user base
- ❌ Need strong value proposition
- ❌ Competitor comparison

**Revenue Projections (Year 1):**
- Conservative: 100 users × $69 = $6,900/year
- Moderate: 500 users × $80 avg = $40,000/year
- Optimistic: 1000 users × $85 avg = $85,000/year

**After Google's 5% cut:**
- Conservative: $6,555
- Moderate: $38,000
- Optimistic: $80,750

### Option D: One-time Payment

**SaveMe License: $149 one-time**

**Pros:**
- ✅ Higher per-user revenue
- ✅ Simple for users (no recurring)
- ✅ Easier accounting

**Cons:**
- ❌ No recurring revenue
- ❌ Must constantly acquire new users
- ❌ Hard to fund ongoing support
- ❌ Less common for SaaS

---

## 📋 Publishing Checklist

### Pre-Publishing Requirements

**Code Quality:**
- [ ] All features working
- [ ] Error handling complete
- [ ] No console.log() in production
- [ ] Code comments and documentation
- [ ] Performance optimized

**Testing:**
- [ ] Tested with 100+ emails
- [ ] Tested with multiple Gmail accounts
- [ ] Tested all AI models
- [ ] Tested all file types
- [ ] Edge cases handled (no attachments, empty body, etc.)

**Security:**
- [ ] No API keys in code
- [ ] Input validation on all fields
- [ ] OAuth scopes minimized
- [ ] Data encryption (Google handles this)
- [ ] XSS prevention

**Documentation:**
- [ ] User guide (README.md)
- [ ] Setup instructions
- [ ] FAQ
- [ ] Troubleshooting guide
- [ ] Privacy policy
- [ ] Terms of service

---

## 🔐 Step 1: OAuth Verification (CRITICAL)

**This is the hardest part and can take 2-4 weeks.**

### Why Required?

Google must verify your app is safe before users can install it. Prevents:
- Malicious apps stealing data
- Spam/phishing
- Privacy violations

### Verification Process

1. **Submit App for Verification**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to: APIs & Services → OAuth consent screen
   - Click "Submit for Verification"

2. **Provide Required Information**
   - App name: SaveMe - Gmail AI Assistant
   - App logo (512x512px)
   - App homepage URL
   - Privacy policy URL (required!)
   - Terms of service URL
   - Support email
   - Authorized domains

3. **Justify Sensitive Scopes**

   Google will ask **why** you need each permission:

   **Gmail (gmail.readonly):**
   ```
   SaveMe needs to read Gmail messages to:
   - Extract email metadata (sender, subject, date)
   - Download attachments for backup
   - Generate AI-powered summaries of email content

   Users maintain full control and can revoke access anytime.
   ```

   **Drive (drive):**
   ```
   SaveMe needs Drive access to:
   - Save email attachments to user's Drive folder
   - Create PDF/HTML copies of emails
   - Organize files in user-specified folders

   SaveMe only creates files, never modifies or deletes existing files.
   ```

   **Sheets (spreadsheets):**
   ```
   SaveMe needs Sheets access to:
   - Create searchable index of processed emails
   - Log metadata (date, sender, subject, summary)
   - Provide queryable database of email history

   Users can edit/delete data anytime.
   ```

   **External Requests (script.external_request):**
   ```
   SaveMe needs external requests to:
   - Send email content to OpenRouter.ai for AI summarization
   - User provides their own OpenRouter API key
   - No data sent to other services

   AI feature is optional and can be disabled.
   ```

4. **Video Demonstration Required**

   Google requires a video showing:
   - How users grant permissions
   - What data your app accesses
   - How data is used
   - Where data is stored

   **Create a screencast:**
   - Show authorization flow
   - Process sample email
   - Show data in Drive and Sheets
   - Demonstrate privacy controls
   - Duration: 2-5 minutes

5. **Security Assessment**

   Google may require:
   - Source code review
   - Security questionnaire
   - Penetration testing (for high-risk apps)
   - Privacy impact assessment

6. **Review Timeline**
   - Initial review: 3-5 business days
   - Follow-up questions: 1-2 weeks
   - Re-review if changes needed: 3-5 days
   - **Total: 2-6 weeks typically**

### Common Rejection Reasons

1. **Insufficient privacy policy**
   - Must explain exactly what data you collect
   - How you use it
   - Who you share it with (e.g., OpenRouter)
   - User's rights (access, deletion, portability)

2. **Too many scopes**
   - Only request what you absolutely need
   - Explain necessity of each scope

3. **Unclear branding**
   - App name must match functionality
   - Logo must be professional
   - Consistent naming across all materials

4. **Missing documentation**
   - No help docs
   - No support contact
   - No terms of service

---

## 📄 Step 2: Legal Documents (REQUIRED)

### Privacy Policy

**Must include:**

```markdown
# Privacy Policy for SaveMe

Last updated: [DATE]

## Data Collection
SaveMe accesses:
- Gmail messages (subject, sender, date, body, attachments)
- Google Drive (for file storage)
- Google Sheets (for data logging)

## How We Use Data
- Email content: Sent to OpenRouter.ai for AI summarization (optional)
- Attachments: Saved to your Google Drive folder
- Metadata: Logged in your Google Sheet

## Data Storage
- All data stays in YOUR Google account
- SaveMe does not store data on external servers
- OpenRouter.ai processes email text only when AI is enabled

## Third-Party Services
- OpenRouter.ai: AI summarization (you provide API key)
- No other third parties have access to your data

## Your Rights
- Access: View all data in your Drive/Sheets
- Deletion: Delete data anytime from Drive/Sheets
- Revoke: Revoke SaveMe access in Google Account settings

## Contact
Email: [YOUR EMAIL]
Website: [YOUR WEBSITE]
```

**Host at:** yourdomain.com/privacy or GitHub Pages

### Terms of Service

**Must include:**

```markdown
# Terms of Service for SaveMe

## Acceptance of Terms
By using SaveMe, you agree to these terms.

## Service Description
SaveMe is a Gmail backup and AI assistant tool.

## User Responsibilities
- Provide valid Google account
- Provide OpenRouter API key for AI features (optional)
- Comply with Google's Terms of Service

## Limitations
- SaveMe is provided "as is"
- No guarantee of uptime or data integrity
- User responsible for backup of processed data

## Subscription Terms (if paid)
- Annual billing: $69-99/year
- Cancel anytime
- No refunds for partial periods
- Automatic renewal

## Intellectual Property
- SaveMe code: [Your License, e.g., MIT, Commercial]
- User data: Belongs to user

## Termination
- User can delete app anytime
- We may suspend service for Terms violations

## Changes to Terms
- We may update terms with notice
- Continued use = acceptance

## Contact
Email: [YOUR EMAIL]
```

**Host at:** yourdomain.com/terms

---

## 🎨 Step 3: Marketplace Listing Assets

### App Icon

**Requirements:**
- 512x512px (primary)
- 128x128px (thumbnail)
- PNG format with transparency
- Must represent SaveMe functionality

**Design tips:**
- Simple, recognizable at small sizes
- Gmail + AI theme
- Professional color scheme
- No Google trademarks

**Tools:**
- Figma (free)
- Canva (free)
- Hire designer on Fiverr ($20-50)

### Screenshots

**Requirements:**
- 1280x800px
- 3-5 screenshots minimum
- PNG or JPEG
- Show key features

**Suggested screenshots:**
1. Settings panel (show configuration)
2. Gmail processing (show automation)
3. Google Sheets index (show results)
4. Drive folder organization (show files)
5. AI summary example (show value)

**Add annotations:**
- Arrows pointing to key features
- Short text descriptions
- Highlight unique value (AI summaries)

### Promotional Video (Optional but Recommended)

**Length:** 60-90 seconds

**Script:**
```
[0-10s] Problem: "Gmail attachments pile up, hard to find"
[10-20s] Solution: "SaveMe automatically saves to Drive"
[20-40s] Demo: Show processing emails, AI summaries
[40-60s] Benefits: "Organized, searchable, intelligent"
[60-90s] CTA: "Install SaveMe today"
```

**Tools:**
- Loom (free screen recording)
- Camtasia (paid, $250)
- Hire on Fiverr ($50-200)

---

## 💳 Step 4: Payment Setup (For Paid Apps)

### Google Merchant Account

1. **Sign up at:** [Google Payment Center](https://pay.google.com/merchant)

2. **Verification:**
   - Business name
   - Tax ID (EIN or SSN)
   - Bank account (for payouts)
   - Address verification

3. **Processing time:** 1-2 weeks

### Pricing Configuration

**In Google Cloud Console:**
- APIs & Services → Workspace Marketplace SDK
- Monetization → Configure pricing

**Options:**
```json
{
  "pricingModel": "SUBSCRIPTION",
  "subscriptionPeriod": "ANNUAL",
  "pricing": {
    "USD": {
      "value": "69.00",
      "currencyCode": "USD"
    }
  },
  "freeTrial": {
    "enabled": true,
    "days": 14
  }
}
```

### Revenue Split

- **Google takes:** 5% of revenue
- **You receive:** 95% of revenue
- **Payment schedule:** NET 30 (monthly payout)
- **Minimum payout:** $10

**Example:**
- 100 users × $69/year = $6,900
- Google fee (5%): -$345
- **Your revenue:** $6,555/year = $546/month

### Tax Considerations

**US Sellers:**
- Must report income to IRS
- Google provides 1099-K form (if >$600/year)
- Collect sales tax in applicable states

**International Sellers:**
- VAT in EU (if selling to EU customers)
- GST in applicable countries
- Consult local tax advisor

---

## 🚀 Step 5: Publishing Process

### 1. Create Cloud Project

```bash
# Go to Google Cloud Console
https://console.cloud.google.com

# Create new project
Project name: SaveMe Gmail Assistant
Project ID: saveme-gmail-assistant

# Enable APIs
- Gmail API
- Drive API
- Google Sheets API
- Apps Script API
```

### 2. Configure OAuth Consent Screen

```
Application type: External
App name: SaveMe - Gmail AI Assistant
User support email: [YOUR EMAIL]
App logo: [UPLOAD 512x512 PNG]
Application homepage: [YOUR WEBSITE]
Application privacy policy: [YOUR PRIVACY URL]
Application terms of service: [YOUR TERMS URL]
Authorized domains: [YOUR DOMAIN]

Scopes:
- https://www.googleapis.com/auth/gmail.readonly
- https://www.googleapis.com/auth/drive
- https://www.googleapis.com/auth/spreadsheets
- https://www.googleapis.com/auth/script.external_request

Test users (during development):
- [YOUR EMAIL]
- [BETA TESTER EMAILS]
```

### 3. Create Marketplace Listing

**Navigate to:**
- Cloud Console → APIs & Services → Workspace Marketplace SDK
- Click "Configure Listing"

**Fill in:**

**App Details:**
```
App name: SaveMe - Gmail AI Assistant
Short description (80 chars):
"Automatically save Gmail attachments to Drive with AI-powered summaries"

Long description (4000 chars):
[See template below]

Category: Productivity
Language: English

Support:
- Email: support@yourdomain.com
- URL: https://yourdomain.com/support
```

**App Assets:**
- Icon (512x512): [UPLOAD]
- Icon (128x128): [UPLOAD]
- Screenshots (1280x800): [UPLOAD 3-5]
- Video URL: [YOUTUBE/VIMEO LINK]

**Pricing:**
- Pricing model: Subscription
- Price: $69.00 USD/year
- Free trial: 14 days
- Cancel anytime

### 4. Submit for Review

**Pre-submission checklist:**
- [ ] All fields completed
- [ ] Privacy policy live
- [ ] Terms of service live
- [ ] Screenshots uploaded
- [ ] Icon uploaded
- [ ] OAuth verified
- [ ] Test users added
- [ ] Beta testing complete

**Click "Submit for Review"**

### 5. Review Process

**Timeline:** 1-4 weeks

**Google checks:**
1. Privacy policy content
2. OAuth scopes justification
3. App functionality
4. User experience
5. Terms compliance
6. Branding consistency

**Possible outcomes:**
- ✅ **Approved:** App goes live immediately
- ⚠️ **More info needed:** Respond to questions, resubmit
- ❌ **Rejected:** Fix issues, resubmit (can take 2+ iterations)

---

## 📝 Marketplace Listing Template

### Long Description (4000 char limit)

```markdown
**Save Gmail Attachments Automatically with AI-Powered Intelligence**

SaveMe is the only Gmail backup tool that combines automatic attachment saving with AI-powered email summaries, creating a searchable knowledge base of your email history.

**🎯 What SaveMe Does:**

✓ **Automatic Email Backup**
   - Saves emails as PDF, HTML, or plain text
   - Preserves formatting and attachments
   - Organized by date, sender, or custom rules

✓ **Smart Attachment Management**
   - Saves all attachments to Google Drive
   - Custom file naming templates
   - Filters by type and size

✓ **AI-Powered Summaries** (Unique!)
   - Generates intelligent email summaries
   - 200+ AI model choices via OpenRouter
   - Custom prompts for your needs
   - Extract action items, dates, key info

✓ **Searchable Google Sheets Index**
   - Every email logged with metadata
   - AI summaries in searchable format
   - Filter and query your email history
   - Export to CSV anytime

**💼 Perfect For:**

- **Freelancers:** Save client communications
- **Small Business:** Organize invoices and receipts
- **Teams:** Share email archives in Drive
- **Everyone:** Never lose important attachments

**🆚 Why Choose SaveMe?**

| Feature | Competitors | SaveMe |
|---------|-------------|--------|
| Email Backup | ✓ | ✓ |
| Attachment Saving | ✓ | ✓ |
| **AI Summaries** | ✗ | ✓ |
| **Sheets Integration** | ✗ | ✓ |
| **200+ AI Models** | ✗ | ✓ |
| **Cost Transparency** | ✗ | ✓ |
| Price/year | $80+ | $69 |

**🔒 Privacy & Security:**

- All data stays in YOUR Google account
- SaveMe never stores your emails
- Optional AI (you provide API key)
- Revoke access anytime

**🚀 Quick Setup (5 minutes):**

1. Install SaveMe
2. Configure Drive folder
3. (Optional) Add OpenRouter API key for AI
4. Process emails!

**💰 Transparent Pricing:**

SaveMe Standard: $69/year
- Unlimited emails
- All backup features
- AI summaries (your API key)
- Up to 10 workflow rules

SaveMe Pro: $99/year
- Everything in Standard
- Unlimited workflow rules
- Shared Drive support
- Priority support

**14-day free trial. Cancel anytime.**

**📚 Support:**

- Comprehensive documentation
- Video tutorials
- Email support
- Active community

**Try SaveMe risk-free today!**
```

---

## 🧪 Step 6: Beta Testing

### Before Public Launch

**Recruit 10-20 beta testers:**
- Colleagues
- Friends
- Online communities (Reddit, ProductHunt)
- Gmail power users

**Provide:**
- Free access (or discount code)
- Beta testing instructions
- Feedback form

**Test:**
1. Installation process
2. Authorization flow
3. Configuration ease
4. Email processing accuracy
5. AI summary quality
6. Performance (100+ emails)
7. Error handling
8. Support documentation
9. Payment flow (if paid)

**Collect feedback:**
- Google Form survey
- Usage analytics
- Bug reports
- Feature requests

**Iterate:**
- Fix critical bugs
- Improve UX pain points
- Update documentation
- Refine pricing (if needed)

---

## 📈 Post-Launch Strategy

### Marketing

**Launch Channels:**
1. **ProductHunt**
   - Schedule launch day
   - Prepare maker post
   - Engage with comments
   - Aim for "Product of the Day"

2. **Reddit**
   - r/gsuite
   - r/productivity
   - r/selfhosted
   - Provide value, don't spam

3. **Social Media**
   - Twitter/X announcement
   - LinkedIn (B2B focus)
   - Facebook groups

4. **Content Marketing**
   - Blog post: "How SaveMe saves 10 hours/week"
   - Video tutorial on YouTube
   - Case studies

5. **SEO**
   - Optimize website for "Gmail backup"
   - "Gmail attachment saver"
   - "AI email assistant"

### Retention

**Onboarding:**
- Welcome email with quick start
- In-app tutorial
- Success metrics (emails processed)

**Engagement:**
- Weekly summary emails (optional)
- Feature announcements
- Tips & tricks

**Support:**
- Response time: <48 hours
- Knowledge base
- FAQ
- Community forum (future)

### Growth Metrics

**Track:**
- Installs per day/week/month
- Active users (DAU/MAU)
- Conversion rate (free trial → paid)
- Churn rate
- Support tickets
- User reviews/ratings

**Target (Year 1):**
- Month 1: 50 installs
- Month 3: 200 installs
- Month 6: 500 installs
- Month 12: 1000 installs
- Conversion: 30% (free trial → paid)
- Revenue: $20,000-40,000/year

---

## ⚠️ Common Pitfalls

### 1. OAuth Verification Hell
**Problem:** Rejected multiple times, takes months
**Solution:** Follow guidelines exactly, provide detailed justifications

### 2. Poor Documentation
**Problem:** Users don't understand setup
**Solution:** Video tutorials, step-by-step guide, FAQ

### 3. Pricing Too Low
**Problem:** Can't fund support and development
**Solution:** Research competition, value-based pricing

### 4. No Marketing
**Problem:** Great product, no users
**Solution:** Content marketing before launch

### 5. Ignoring Support
**Problem:** Bad reviews from unanswered questions
**Solution:** Dedicated support time, auto-responders

---

## 📊 Success Checklist

**Month 1:**
- [ ] OAuth verified
- [ ] Marketplace listing live
- [ ] 50+ installs
- [ ] 4+ star rating
- [ ] Active support (<48h response)

**Month 3:**
- [ ] 200+ installs
- [ ] 10+ paying customers
- [ ] Featured in Marketplace (goal)
- [ ] Content marketing ongoing

**Month 6:**
- [ ] 500+ installs
- [ ] $1,000+/month revenue
- [ ] Product-market fit validated
- [ ] Roadmap based on feedback

**Month 12:**
- [ ] 1,000+ installs
- [ ] $3,000+/month revenue
- [ ] Sustainable business
- [ ] Plan v2.0 features

---

## 🔗 Resources

**Official Docs:**
- [Workspace Marketplace Developer Guide](https://developers.google.com/workspace/marketplace)
- [OAuth Verification](https://support.google.com/cloud/answer/9110914)
- [Publishing Guidelines](https://developers.google.com/workspace/marketplace/listing-configuration)

**Tools:**
- [clasp](https://github.com/google/clasp) - Apps Script CLI
- [Google Cloud Console](https://console.cloud.google.com)
- [Payment Center](https://pay.google.com/merchant)

**Communities:**
- r/gsuite
- Stack Overflow (google-apps-script tag)
- Google Workspace Developers Community

---

**Last Updated:** 2025-01-05
**SaveMe Version:** 1.0.0
**Estimated Time to Publish:** 4-8 weeks
