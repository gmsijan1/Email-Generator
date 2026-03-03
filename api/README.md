# API Routes

## Email Generation

The `/api/generate-email` endpoint generates sales email drafts using OpenAI.

### Environment Variable: EMAIL_PROMPT_TEMPLATE

The prompt template is loaded from the `EMAIL_PROMPT_TEMPLATE` environment variable so the actual prompt is not exposed in the codebase.

**Setup:**

1. **Local development:** Add `EMAIL_PROMPT_TEMPLATE` to `.env.local` (already configured).

2. **Vercel:** In your project → Settings → Environment Variables, add:
   - Name: `EMAIL_PROMPT_TEMPLATE`
   - Value: Copy from `.env.local`

**Placeholders:** `{{COMPANY_NAME}}`, `{{SENDER_NAME_TITLE}}`, `{{PRODUCT_SERVICE}}`, `{{EFFECTIVE_DIFFERENTIATOR}}`, `{{PROSPECT_FIRST_NAME}}`, `{{PROSPECT_TITLE}}`, `{{PROSPECT_COMPANY}}`, `{{EFFECTIVE_CATEGORY}}`, `{{SOCIAL_PROOF_DISPLAY}}`, `{{RESULT_DISPLAY}}`, `{{EFFECTIVE_SOCIAL_PROOF_STYLE}}`, `{{TONE}}`, `{{CTA_TYPE}}`, `{{EFFECTIVE_PRIMARY_PAIN}}`, `{{SIGNATURE_LINE_3}}`

**Output cleanup:** `outputCleanup.config.js` defines patterns for stripping leaked prompt content and replacing placeholders. Add new patterns there to scale.
