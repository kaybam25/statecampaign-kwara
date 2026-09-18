# StateCampaign Kwara — Agent Development Guide

**Project**: CampaignOS Kwara v2 (Production-Ready Demo)  
**Status**: Phase 2 Initialization (Sprint 1: 21 Sep – 3 Oct 2026)  
**Owner**: KayBam (kaybam25@gmail.com)  
**GitHub**: https://github.com/kaybam25/statecampaign-kwara  

---

## Project Overview

StateCampaign Kwara is a state-isolated gubernatorial campaign platform built on Next.js 14, designed to support the PDP campaign in Kwara State, Nigeria for the 2027 election (6 Feb 2027).

**Key constraints**:
- **State isolation**: No cross-state data possible (single-state per deployment)
- **Offline-first**: Election Day war-room works without internet
- **Compliance**: Electoral Act s.77 (member register), s.60 (result protection), NDPA 2023 (data handling)
- **Timeline**: 2-week sprint (Phase 2) + 3-week hardening sprint

---

## Tech Stack

**Frontend**:
- Next.js 14.2 (App Router)
- TypeScript
- Tailwind CSS 4
- Zustand (state management)
- Recharts (charting)
- react-leaflet + OpenStreetMap (mapping)

**Mobile**: Capacitor (iOS/Android wrapper)

**Backend** (Phase 3): Node.js + PostgreSQL

---

## 15 Critical Gaps (From v1.5 Review)

Priority acceptance criteria for v2 launch: **Close gaps 1–4**.

| # | Gap | Severity | Status |
|---|-----|----------|--------|
| 1 | No per-party tally on Election Day | HIGH | ?? Week 1 |
| 2 | No constitutional win-rule check (25% in 11/16) | HIGH | ?? Week 1 |
| 3 | No EC8A evidence chain | HIGH | ?? Week 2 |
| 4 | No senatorial-district (zoning) view | HIGH | ?? Week 2 |
| 5-15 | Additional gaps | MEDIUM-LOW | ?? Sprint 2 |

---

## Kwara Election Facts

- **State**: Kwara
- **LGAs**: 16
- **Wards**: 193
- **Polling Units**: 2,886 (real INEC)
- **2023 Result**: APC 59.4% vs PDP 33.8%
- **Win Rule**: 25% in at least 11/16 LGAs
- **Election Date**: 6 Feb 2027
- **Languages**: Yorùbá, Nupe, Baatonum, Fulfulde, Hausa

---

## Daily Gate (KayBam Review)

- **Time**: 90 minutes daily
- **Approvals**: Merged PRs, build artifacts, spec changes
- **Fallback**: 2 missed gates ? 14-day sprint

---

**Last updated**: 2026-09-18
