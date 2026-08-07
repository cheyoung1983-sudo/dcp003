# Deployment Preparation: Final Manual Steps

The project build is currently stabilized after major dependency upgrades and configuration fixes. The following manual steps are required to resolve the remaining 3 TypeScript errors before successful deployment.

## 1. Fix Component Imports [DONE]
The components were failing to import constants because they were attempting to import from `src/lib/constants` (a file that does not exist or has no exports) instead of `src/lib/constants.tsx` or `src/lib/ui-constants`.

- **Action Taken:** Updated imports in `www.displaycellpros.com-refractored` to use the correct paths.

## 2. Resolve Vercel Auth OIDC Import [DONE]
The build is successful with `@vercel/functions@^3.8.0`. `createSigner` is no longer used; `awsCredentialsProvider` from `@vercel/functions/oidc` is the current recommended approach and is implemented in `src/lib/db.ts`.

## 3. Resolve Prisma Client Generation [DONE]
- **Action Taken:** Added `prisma generate` to the `build` script in `package.json`.

## 5. Fix reCAPTCHA API Response Parsing Error [DONE]
- **Problem:** Client-side `onSubmit` failed with `SyntaxError` when `/api/recaptcha/assess` returned a 404 HTML page.
- **Action Taken:** Updated `src/app/page.tsx` to check `res.ok` and handle non-JSON responses gracefully.
- **Action Taken:** Aligned JSON payload between frontend and backend.
- **Action Taken:** Updated `src/proxy.ts` to bypass Auth0 middleware for `/api/recaptcha` routes to prevent 404 interference.
- **Action Taken:** Updated `src/app/api/recaptcha/assess/route.ts` to use environment variables for `siteKey` and `projectId`.

## 6. Implement Sign in with Google [DONE]
- **Action Taken:** Added Google Identity Services script to `RootLayout`.
- **Action Taken:** Initialized One Tap and Automatic Sign-in with FedCM support.
- **Action Taken:** Created `GoogleSignInButton` component and added it to the sign-in page.
- **Action Taken:** Implemented backend callback handler at `src/app/api/auth/google/callback/route.ts` using `google-auth-library` to verify ID tokens.
- **Action Taken:** Updated `src/proxy.ts` to bypass Auth0 middleware for Google Auth routes.

## 7. Build Error: Missing Auth0 Secrets on Vercel [ACTION REQUIRED]
The Vercel build failed because `AUTH0_CLIENT_SECRET` and `AUTH0_SECRET` are missing in the Vercel Project Settings. 

- **Fix Applied:** Updated `src/lib/auth0.ts` with a mock `handleAuth` fallback to allow the build to complete.
- **Action Required:** You must add these variables to your Vercel Dashboard to enable authentication:
  1. Go to **Vercel Project Settings > Environment Variables**.
  2. Add `AUTH0_CLIENT_SECRET` (from your Auth0 dashboard).
  3. Add `AUTH0_SECRET` (a random 32-character string).
  4. Redeploy.

## 4. Final Deployment
Once the above steps are completed:
1. Run `npx tsc --noEmit` to verify 0 errors.
2. Run `npm run build` to verify production build success.
3. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```
