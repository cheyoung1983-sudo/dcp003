### Implementation Plan: Consolidation of Application Integrations

This plan outlines the steps to consolidate redundant backend and AI integrations by prioritizing Auth0 for authentication, Cloud SQL (PostgreSQL) for data persistence, and Google Gemini for AI features.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions have been confirmed. Proceeding with these will result in the removal of redundant services (Firebase, OpenAI).

- **Authentication Service**: Auth0 (confirmed as primary).
- **Database Architecture**: PostgreSQL / Cloud SQL (confirmed as primary).
- **AI Provider**: Google Gemini (confirmed as primary).
- **Analytics**: Keep both Vercel Analytics and Speed Insights.

### 1. Overview & Core Concept

- **What It Does**: Streamlines the backend by removing redundant Firebase and OpenAI dependencies, ensuring the application relies on a unified, high-performance stack: Auth0, PostgreSQL, and Google Gemini.
- **Target Audience**: Bench technicians and repair intake staff at Spokane HQ Lab.
- **Key Value**: Reduces architectural complexity, improves maintainability, and standardizes on preferred Google-integrated services.

### 2. User Experience & Visual Design

- **Flows**: The user experience remains largely consistent, with authentication flows transitioning fully to Auth0. AI interactions will be powered exclusively by Gemini, maintaining the current UI/UX for chats and diagnostic triage.
- **Visuals**: No changes to the existing visual design, typography, or layout.

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Removal of Firebase**
    - *Chosen Approach*: Remove all Firebase SDKs, integrations, and usage.
    - *Why*: User confirmed Auth0 and PostgreSQL as the primary services.
    - *Alternatives Considered*: Hybrid model (rejected due to redundancy).
- **Decision 2: Standardizing on Google Gemini**
    - *Chosen Approach*: Migrate OpenAI calls to `@google/genai`.
    - *Why*: Simplifies AI stack and aligns with user preference.

### 4. Technical Architecture & Data Strategy

```text
┌────────────────────┐      ┌─────────────────────────┐
│  Frontend (Vite)   │─────▶│  Server (Express/Node)  │
└────────────────────┘      └────────────┬────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
      ┌──────────▼──────────┐                         ┌──────────▼──────────┐
      │  Auth0 (Auth/RBAC)  │                         │    PostgreSQL       │
      │                     │                         │   (Cloud SQL)       │
      └─────────────────────┘                         └──────────┬──────────┘
                                                                 │
                                                      ┌──────────▼──────────┐
                                                      │   Google Gemini     │
                                                      │      (AI/LLM)       │
                                                      └─────────────────────┘
```

- **Data Model**: PostgreSQL will be the source of truth, managed via Prisma.
- **State Management**: Client-side state will remain, with database sync through backend API routes.
- **AI Integration**: Server-side proxy at `/api/gemini/*` using `@google/genai`.
