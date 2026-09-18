# Build & Deployment Guide

Last updated: 2026-09-18
Applies to: Phase 2 (Static Export) + Phase 3 (Backend)

## Quick Start

### Web (Static Export)

\\\ash
cd webapp
npm install
npm run build
# Outputs: webapp/out/
\\\

### Android APK (Capacitor)

\\\ash
cd webapp
npm run build

# Copy to Capacitor project
cp -r out/* ../android-app/www/

# Build APK
cd ../android-app
npm run android-build
\\\

## Phase 2: Static Export (Current)

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Build Steps

\\\ash
# 1. Clone repository
git clone https://github.com/kaybam25/statecampaign-kwara.git
cd statecampaign-kwara

# 2. Install dependencies
cd webapp
npm install

# 3. Type check
npm run type-check

# 4. Lint
npm run lint

# 5. Build static export
npm run build

# Output: webapp/out/ (all HTML/CSS/JS, ready to serve)
\\\

### Output Structure

\\\
webapp/out/
├── index.html           # Home page
├── command-center/      # War-room collation
├── comms/               # Message factory
├── canvass-command/     # Canvassing dashboard
├── field-ops/           # EC8A evidence
├── _next/               # Next.js assets (images, fonts)
├── _app/                # App shell
└── 404.html             # Error page
\\\

## Deployment Targets

### 1. GitHub Pages (Free, No Backend)

After building, push to gh-pages branch and enable in GitHub Settings.

### 2. Vercel (Recommended for Next.js)

Install Vercel CLI and run: vercel --prod --cwd webapp

### 3. S3 + CloudFront (AWS)

Create S3 bucket, upload webapp/out/ contents, and set up CloudFront distribution.

### 4. Self-Hosted (nginx)

Copy webapp/out/ to server and configure nginx with SPA routing.

## GitHub Actions CI/CD

Build workflow runs on every push to main and develop branches.
Test workflow runs unit and E2E tests.
Deploy workflow is manual trigger with environment selection.

## Phase 3: Backend + Database (Planned)

When Phase 2 needs API:
1. Multi-state deployment (API routes by subdomain or state header)
2. Real-time agent location tracking
3. Audit log immutability (Postgres WAL)
4. Member register lookup (Electoral Act s.77)
5. Persistent user sessions + role-based access control

## State-Pack Versioning & Deployment

State-packs are versioned and deployed with each release.

Kwara state-pack: state-packs/kwara/v1/
- data.json (INEC tree + 2023 results)
- config.json (Candidates, languages, thresholds)
- manifest.json (Version, checksum)

Each release tags state-packs with version number (v1.0.0, etc).

See also: ARCHITECTURE.md | STATE_ISOLATION.md
