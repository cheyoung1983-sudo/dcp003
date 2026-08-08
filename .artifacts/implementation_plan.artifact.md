# Implementation Plan - Professional Compliance & Mobile Readiness

Elevate the project's professional posture by establishing a "Mobile Readiness" framework, documenting Android/iOS app signing requirements, and consolidating all cross-platform verification steps (SHA-1, reCAPTCHA, and Redundancy) into the Compliance Lab.

## User Review Required

> [!NOTE]
> **Native Android Shell**: Since our current architecture is a Vite/React web app, these Android signing steps (SHA-1) are preparations for a **Native Android Shell** (e.g., via Trusted Web Activities or Capacitor) or for linking a future native mobile app to the same Firebase backend.
>
> **Keystore Safety**: Never commit your `.keystore` or `.jks` files to this repository. Only track the public SHA-1 fingerprints.

## Proposed Changes

### 1. Mobile Readiness Framework

#### [MODIFY] [OAuthDocumentationPanel.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/components/OAuthDocumentationPanel.tsx)
- Add a new **"Mobile Readiness (Android/iOS)"** section to the checklist.
- Include placeholders for tracking **SHA-1 (Debug)** and **SHA-1 (Release)** fingerprints.
- Document the `keytool` command provided in your instructions for easy technician access.
- **[New]** Add **"External Client ID Safelisting"** as an optional task for cross-project authentication.

### 2. Cross-Platform Identity Consolidation

#### [MODIFY] [App.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/App.tsx)
- Update the **Compliance Lab** tab to clearly distinguish between **Web-Native** (Auth.js) and **Mobile-Native** (Firebase SHA-1) identity requirements.

### 3. Release Checklist Documentation

#### [NEW] [mobile_readiness.artifact.md](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.artifacts/mobile_readiness.artifact.md)
- Create a dedicated guide summarizing:
    - How to generate the SHA-1 fingerprints using `keytool` (per your instructions).
    - How to register the Android app in the `displaycellpros-com` Firebase console.
    - Integration steps for linking the web backend to a native mobile client.

## Verification Plan

### Automated Tests
- Build verification to ensure no breaking changes in the Documentation component.

### Manual Verification
- **Compliance Check**: Open the Lab Portal and verify the new "Mobile Readiness" checklist is visible.
- **Copy-Paste Test**: Verify the `keytool` command is easy to copy for future use.
