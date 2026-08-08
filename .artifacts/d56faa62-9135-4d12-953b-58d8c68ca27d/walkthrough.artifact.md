# reCAPTCHA Enterprise Upgrade Walkthrough

I have successfully upgraded the project's bot protection to **reCAPTCHA Enterprise**. This migration enhances security by providing detailed risk scores and leveraging the modern Google Cloud SDK.

## Changes Made

### 1. Dependency Management
- Added `@google-cloud/recaptcha-enterprise` to [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json).
- Installed the new dependency via `npm install`.

### 2. Environment Configuration
- Updated [.env.local](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env.local) and [.env](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env) with:
  - `GOOGLE_CLOUD_PROJECT_ID="displaycellpros-com"`
  - New Enterprise Site Key: `6LeqGV0tAAAAAC_MQbIkcyZa2L-LvTNhSlmxKaLo`
  - New Enterprise Secret Key: `6LeqGV0tAAAAAD5aaO8C0ignXzqmI9VR9qKvubQJ`

### 3. Backend Verification Logic
- Refactored [api/lib/recaptcha.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/recaptcha.ts) to use `RecaptchaEnterpriseServiceClient`.
- Implemented a score-based validation (threshold set to `0.5`).
- Maintained a legacy fallback mechanism for robust transition.
- Updated [api/tickets.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/tickets.ts) to include the `SUBMIT_TICKET` action name for more precise assessment.

### 4. Frontend Integration
- Refactored [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx) to remove hardcoded site keys.
- The reCAPTCHA widget now dynamically pulls the site key from `import.meta.env.VITE_RECAPTCHA_SITE_KEY`, with the new key as a safe fallback.

### 5. Development Environment Optimization
Updated [vite.config.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/vite.config.ts).
- Configured explicit HMR host and protocol for better reliability.
- Added a proxy rule for `/api` to route requests to the local Vercel dev server (port 3000).

### 6. Build & Middleware Fixes
Updated [middleware.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/middleware.ts), [package.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/package.json), and [tsconfig.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/tsconfig.json).
- Replaced Next.js-specific `NextResponse` with `@vercel/edge` `next` to support Vite projects on Vercel.
- Added `@vercel/node` and `@vercel/edge` dependencies to provide necessary types for API handlers and middleware.
- Configured `tsconfig.json` with `vite/client` types to resolve `import.meta.env` errors.
- Updated `QuoteResponse` interface in `src/types.ts` to include missing `bookingSummary` property.

### 7. SEO & Sitemap Fix
Added [sitemap.xml](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/public/sitemap.xml) and [robots.txt](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/public/robots.txt) to the `public/` directory.
- Created a valid XML sitemap for `https://displayandcellpros.com`.
- Added a `robots.txt` file pointing to the sitemap to resolve Google Search Console "Sitemap is HTML" errors.

## Verification
- **Lint Check:** Successfully ran `npm run lint` (using `tsc --noEmit`), confirming all TypeScript errors are resolved.
- **Static Files:** Verified that `sitemap.xml` and `robots.txt` are placed in the correct directory for deployment.

### Automated Check
- Ran `npm install` to confirm dependency resolution.
- Verified that all hardcoded instances of the old site key have been removed.

### Manual Verification Steps
1. Start the development server: `npm run dev`.
2. Navigate to the login or triage sections.
3. Ensure the reCAPTCHA widget renders correctly.
4. Submit a test ticket and verify that the backend assessment succeeds.

> [!IMPORTANT]
> **Google Cloud Authentication:** The backend uses the official Google Cloud SDK. Ensure your Vercel environment has appropriate Google Cloud credentials configured (via OIDC or Service Account) to allow the `recaptchaenterprise.assessments.create` permission.
