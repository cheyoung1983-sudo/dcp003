# Implementation Plan: Fix "Sitemap is HTML" Error

The goal is to resolve the Google Search Console error by providing a valid XML sitemap and a `robots.txt` file. This will help search engines correctly index the site and avoid misidentifying the sitemap as an HTML page.

## User Review Required

> [!IMPORTANT]
> **Domain Name:** I am using `https://displaycellpros.com` as the base URL for the sitemap. Please confirm if this is the correct canonical domain.

## Proposed Changes

### [SEO Configuration]

#### [NEW] [sitemap.xml](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/public/sitemap.xml)
- Create a standard XML sitemap in the `public/` directory.
- Include the main landing page URL.

#### [NEW] [robots.txt](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/public/robots.txt)
- Create a `robots.txt` file in the `public/` directory.
- Allow all user agents and point to the new `sitemap.xml` URL.

## Verification Plan

### Automated Tests
- None (standard static files).

### Manual Verification
1. Run `npm run dev`.
2. Navigate to `http://localhost:5173/sitemap.xml` and `http://localhost:5173/robots.txt` to ensure they are served correctly as static files.
3. Use an online XML sitemap validator to check the syntax.
4. **Action for User:** Once deployed, go to Google Search Console and re-submit `https://displaycellpros.com/sitemap.xml`.
