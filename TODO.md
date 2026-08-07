# Deployment Preparation: Final Manual Steps

The project build is currently stabilized after major dependency upgrades and configuration fixes. The following manual steps are required to resolve the remaining 3 TypeScript errors before successful deployment.

## 1. Fix Component Imports [DONE]
The components were failing to import constants because they were attempting to import from `src/lib/constants` (a file that does not exist or has no exports) instead of `src/lib/constants.tsx` or `src/lib/ui-constants`.

- **Action Taken:** Updated imports in `www.displaycellpros.com-refractored` to use the correct paths.

## 2. Resolve Vercel Auth OIDC Import [DONE]
The build is successful with `@vercel/functions@^3.8.0`. `createSigner` is no longer used; `awsCredentialsProvider` from `@vercel/functions/oidc` is the current recommended approach and is implemented in `src/lib/db.ts`.

## 3. Resolve Prisma Client Generation [DONE]
- **Action Taken:** Added `prisma generate` to the `build` script in `package.json`.

## 4. ESLint and Build Optimization [DONE]
- **Action Taken:** Downgraded ESLint to v9 to match Next.js 15 requirements.
- **Action Taken:** Optimized `src/lib/auth0.ts` for `VERCEL_URL` detection.
- **Action Taken:** Updated CSP headers in `middleware.ts` and `vercel.json`.

## 4. Final Deployment
Once the above steps are completed:
1. Run `npx tsc --noEmit` to verify 0 errors.
2. Run `npm run build` to verify production build success.
3. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```
