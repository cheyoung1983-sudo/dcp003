<div style="text-align: center;">
  <img width="1200" height="475" alt="Display & Cell Pros Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Display & Cell Pros - On-Site Smartphone Repair

This repository contains the web application for Display & Cell Pros, providing on-site smartphone repair services in the Spokane metro area. Built with Next.js, Tailwind CSS, and integrated with Auth0, Shopify, and Google reCAPTCHA Enterprise.

## Getting Started

### Prerequisites

- **Node.js**: v18.x or later
- **PostgreSQL**: For the database (managed via Prisma)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/displaycellpros.git
    cd displaycellpros
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add the following variables:
    ```env
    DATABASE_URL="your-postgresql-url"
    OPENAI_API_KEY="your-openai-api-key"
    RECAPTCHA_SITE_KEY="6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj"
    # See .env.example for more
    ```

4.  **Database Migration**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Locally**:
    ```bash
    npm run dev
    ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Features

- **On-Site Quote Calculator**: Dynamic pricing for screen, battery, and port repairs.
- **Bot Protection**: Google reCAPTCHA Enterprise integration.
- **Enterprise Auth**: Auth0 proxy middleware for secure client portals.
- **Inventory Integration**: Shopify-backed parts and service management.
