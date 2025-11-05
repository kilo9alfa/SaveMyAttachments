# SaveMe Configuration Options

## New Configurable Parameters

You can now configure these settings through the SaveMe menu:

---

## 1. Batch Size 📧

**Menu:** SaveMe → Tools → Set Batch Size

**What it does:** Controls how many emails are processed per run

**Default:** 10 emails
**Range:** 1-50 emails
**Recommended:** 10-20 emails

**Examples:**
- **5** - Process slowly, good for debugging
- **10** - Default, balanced
- **20** - Process more quickly
- **50** - Maximum, process many at once

---

## 2. AI Model 🤖

**Menu:** SaveMe → Tools → Set AI Model

**What it does:** Choose which AI model generates email summaries

**Default:** `anthropic/claude-3.5-sonnet`

### Popular OpenRouter Models:

| Model | Provider | Cost | Quality | Speed |
|-------|----------|------|---------|-------|
| **anthropic/claude-3.5-sonnet** | Anthropic | ~$3/1M tokens | ⭐⭐⭐⭐⭐ Best | Medium |
| **anthropic/claude-3-haiku** | Anthropic | ~$0.25/1M tokens | ⭐⭐⭐⭐ Good | Fast |
| **openai/gpt-4-turbo** | OpenAI | ~$10/1M tokens | ⭐⭐⭐⭐⭐ Excellent | Medium |
| **openai/gpt-3.5-turbo** | OpenAI | ~$0.50/1M tokens | ⭐⭐⭐ Good | Fast |
| **google/gemini-pro** | Google | Free tier available | ⭐⭐⭐⭐ Good | Fast |
| **meta-llama/llama-3-70b-instruct** | Meta | ~$0.70/1M tokens | ⭐⭐⭐⭐ Good | Medium |
| **mistralai/mistral-7b-instruct** | Mistral | ~$0.10/1M tokens | ⭐⭐⭐ Decent | Very Fast |

### More Models Available:

- **openai/gpt-4** - Original GPT-4 (~$30/1M tokens)
- **anthropic/claude-2** - Previous Claude (~$8/1M tokens)
- **google/palm-2** - Google's PaLM model
- **cohere/command** - Cohere's model
- **ai21/j2-ultra** - AI21's Jurassic model

**Full list:** https://openrouter.ai/models

---

## 3. AI Prompt (Summary Question) ❓

**Menu:** SaveMe → Tools → Set AI Prompt

**What it does:** Customize what question the AI answers about each email

**Default:** "Summarize this email in 5-10 words, focusing on the main action or topic:"

### Example Prompts:

#### For Summaries:
```
Summarize this email in 5-10 words, focusing on the main action or topic:
```

#### For Action Items:
```
Extract all action items and tasks from this email as a bullet list:
```

#### For Urgency:
```
On a scale of 1-10, how urgent is this email? Explain in one sentence:
```

#### For Requests:
```
What is the sender requesting or asking for? Answer in one sentence:
```

#### For Dates:
```
Extract all dates, deadlines, and time-sensitive information:
```

#### For Sentiment:
```
What is the tone/sentiment of this email? (positive/negative/neutral) and main topic:
```

#### For Decision Required:
```
Does this email require a decision or response? What is being asked?
```

#### For Meeting Info:
```
Extract meeting details (date, time, location, attendees) if any:
```

#### For Financial:
```
Extract any financial amounts, invoice numbers, or payment information:
```

#### For Categories:
```
Categorize this email: Invoice/Receipt/Meeting/Request/FYI/Other - and summarize:
```

---

## Other Configuration Options

### Days Back
**Menu:** SaveMe → Tools → Set Date Range (Days Back)
- How far back to search for emails
- Default: 7 days
- Range: 1-365 days

### Minimum Attachment Size
**Menu:** SaveMe → Tools → Set Minimum Attachment Size
- Filters out small attachments (signatures, inline images)
- Default: 5 KB
- Range: 0-100 KB

### Processing Order
- Currently: Newest emails first (most recent at top)
- Rows insert at top of spreadsheet

---

## How to Configure

### Method 1: Through Menu
1. Open your Google Sheet
2. Click **SaveMe** in the menu
3. Go to **Tools**
4. Select the setting you want to change
5. Enter new value
6. Click OK

### Method 2: View Current Settings
1. **SaveMe → Tools → View Diagnostics**
2. Shows all current configuration values

### Method 3: Reset Everything
1. **SaveMe → Tools → Nuclear Clear**
2. This resets all settings to defaults

---

## Cost Estimation

### Email Processing Costs (per 1000 emails):

| Model | Cost Estimate |
|-------|---------------|
| Claude 3.5 Sonnet | ~$0.30-0.50 |
| Claude 3 Haiku | ~$0.03-0.05 |
| GPT-3.5 Turbo | ~$0.05-0.10 |
| Mistral 7B | ~$0.01-0.02 |

**Note:** Actual costs depend on email length and prompt complexity

---

## Tips

### For Best Results:
1. **Use Claude 3.5 Sonnet** for highest quality summaries
2. **Use Claude Haiku or GPT-3.5** for cost-effective processing
3. **Use Mistral 7B** for cheapest option

### For Custom Prompts:
1. Keep prompts concise and specific
2. Ask for structured output (bullet points, scale, etc.)
3. Test with a few emails first
4. Adjust based on results

### For Batch Size:
1. Start with 10 emails per batch
2. Increase if processing is stable
3. Decrease if you see timeouts
4. Use 1-5 for testing/debugging

---

## Examples of Combined Settings

### Configuration for Invoices:
- **Batch Size:** 20
- **Model:** claude-3-haiku (cheap but good)
- **Prompt:** "Extract invoice number, amount, due date, and vendor:"

### Configuration for Meeting Requests:
- **Batch Size:** 10
- **Model:** gpt-3.5-turbo
- **Prompt:** "Extract meeting date, time, attendees, and purpose:"

### Configuration for Daily Summary:
- **Batch Size:** 50
- **Model:** mistral-7b-instruct (very cheap)
- **Prompt:** "One word category: Meeting/Invoice/Request/FYI/Other"

---

## Monitoring Usage

To see your OpenRouter usage and costs:
1. Visit https://openrouter.ai/dashboard
2. Check your usage statistics
3. Set up spending limits if needed

---

## Next Steps

1. **Update your Apps Script files** with the latest code
2. **Refresh your spreadsheet**
3. **Configure your preferences:**
   - Set batch size (default 10 is good)
   - Choose AI model (Sonnet for quality, Haiku for cheap)
   - Customize prompt if needed
4. **Process emails** with your new settings!

The configuration is now much more flexible. You can optimize for cost, quality, or specific information extraction based on your needs!