# AWS Guidance
- Prefer the AWS MCP Server for AWS interactions — it provides sandboxed
  execution, observability, and audit logging. If unavailable, use the
  AWS CLI directly.
- Before starting a task, check whether a relevant AWS skill is available.
  Load the skill with `retrieve_skill` and prefer its guidance over
  general knowledge.
- When uncertain about specific AWS details (API parameters, permissions,
  limits, error codes), verify against documentation rather than guessing.
  State uncertainty explicitly if you cannot confirm.
- When creating infrastructure, prefer infrastructure-as-code (AWS CDK or
  CloudFormation) over direct CLI commands.
- When working with infrastructure, follow AWS Well-Architected Framework
  principles.
- Do not use em dashes in AWS resource names or descriptions. Use
  hyphens instead.

## Secret Safety
- MUST load the `aws-secrets-manager` skill first for any secret,
  credential, API key, token, or password task. MUST NOT call
  `secretsmanager get-secret-value` or `batch-get-secret-value`, and MUST
  not hit the Secrets Manager Agent daemon directly. MUST use
  `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` with
  `asm-exec` so the secret resolves at runtime without entering context.

## Display & Cell Pros -- Project Standards

### Triage AI
- The Triage AI (`/api/triage`) uses **OpenAI GPT-4o** via `OPENAI_API_KEY`.
- Always return JSON with `text` + `detectedSpecs` fields (`brand`, `model`, `tier`,
  `issue`, `pricingTier`, `step`).
- Apply the Lexical Firewall (`@/lib/lexical-firewall`) to all AI response text before
  sending to the client.
- Scope is strictly hardware: screens, batteries, charging ports, buttons, motherboards.
  No software support, cooking, general math, or unrelated topics.
- Pricing tiers:
  - Tier 1: Core Power / Battery ($69-$97)
  - Tier 2: Elite Display Renewal (from $139)
  - Tier 3: Specialized Diagnostics (custom quote)
- Never disclose raw cost margin multipliers.

### Quote Engine (`/api/generate-quote`)
- Logic lives in `src/lib/repair-logic.ts` (`calculateQuoteInternal`).
- Uses a 3-tier parts quality model: budget / pro / auth (OEM).
- Applies 80% overhead margin on top of parts + labor costs.
- Supports corporate discount (15% off subtotal) and battery upsell add-on.
- WA sales tax lookup: `WA_TAX_DATA` in `repair-logic.ts` covers Spokane (9.0%),
  Seattle (10.35%), Bellevue/Redmond (10.1%), Tacoma (10.3%), and more.
- Do NOT change margin or labor rate constants without explicit user approval.

### Second AI System (`/api/chat`)
- Uses the Vercel AI SDK (`ai` package) with model `xai/grok-4.5` by default.
- Auth via `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN` (falls back to `OPENAI_API_KEY`).
- This is a separate general-purpose chat endpoint -- NOT the Triage AI.
- The model string can be overridden per-request via the `model` field in the request body.

### Tech Stack Constraints
- **Deployment**: Vercel only (`vercel deploy --prod --yes`). No Google Cloud, Firebase,
  or Netlify for this project.
- **Auth**: Auth0 proxy middleware (`src/middleware.ts` + `src/proxy.ts`). Do not use
  Firebase Auth or plain NextAuth sessions without Auth0.
  - Auth0 tenant: `icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com`
  - Auth0 Client ID (fallback): `iHyCQzrHYenv4lrkCFy4v9528jtJUUHl`
  - `AUTH0_SECRET` must be >= 32 characters (64 hex recommended) for SDK v4.
- **Database**: Neon PostgreSQL via Prisma + `@neondatabase/serverless`. No SQLite in
  any environment (dev or prod).
  - Build script MUST be `prisma generate && next build` -- skipping `prisma generate`
    breaks Vercel deploys. This is already set in `package.json`; do not remove it.
  - Known schema debt: the `tickets` table is queried by `/api/tickets` but is NOT in
    `prisma/schema.prisma` (only NextAuth models exist). Add a `Ticket` model before
    running `prisma migrate`.
- **AI providers**:
  - Triage AI (`/api/triage`): OpenAI GPT-4o via `OPENAI_API_KEY`. Do not substitute.
  - Chat API (`/api/chat`): Vercel AI SDK + xAI Grok (`xai/grok-4.5`). Uses
    `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`.
- **Google integrations -- explicit exceptions** (these ARE present and active):
  - `@google-cloud/recaptcha-enterprise` -- powers `/api/recaptcha/assess` for bot
    protection. Environment vars: `RECAPTCHA_SITE_KEY`, `RECAPTCHA_PROJECT_ID`.
  - Google Sign-In / One Tap -- `GoogleSignInButton.tsx` + `/api/auth/google/callback`.
    Uses `google-auth-library` to verify ID tokens server-side.
  - All other Google/Firebase integrations remain excluded.
- **Shopify**: Storefront API (GraphQL, `api/2025-01`) for parts/products in Store view.
  - Domain env: `DCP_SANDBOX_SHOPIFY_STORE_DOMAIN` or `SHOPIFY_STORE_DOMAIN`.
  - Token env: `DCP_SANDBOX_SHOPIFY_STOREFRONT_ACCESS_TOKEN` or
    `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
- **AWS CloudFront**: `src/lib/cloudfront.ts` signs asset URLs using
  `@aws-sdk/cloudfront-signer`. Requires `CLOUDFRONT_KEY_PAIR_ID_1` and
  `CLOUDFRONT_PRIVATE_KEY_1` environment variables.

### Deployment & Domain
- Custom domains: `displaycellpros.com` and `www.displaycellpros.com` under Vercel
  team `dcpllc` (account `cheyoung1983-8351`).
- Use `vercel deploy --prod --yes` for production deployments.
- Domain inspection: `vercel domains inspect <domain>`.
- All traffic should resolve to `www.displaycellpros.com` (apex redirects to www).

### Vercel Cron
- A daily cron runs at midnight UTC: `{ path: "/api/cron/refresh", schedule: "0 0 * * *" }`
  defined in `vercel.json`. It refreshes the stored Vercel OAuth token.
- Do NOT remove the `crons` block from `vercel.json`.

### Security Headers
- CSP and security headers are set in TWO places:
  1. `vercel.json` (static, applies to all requests via Vercel CDN)
  2. `src/middleware.ts` (runtime, production only, applied by Edge middleware)
- If you update headers, update BOTH files to stay in sync. Conflicting headers
  cause unpredictable browser security behavior.
