# Sprint Backlog — Phase 2 (21 Sep – 3 Oct 2026)

## Work Package Overview

| WP # | Title | Owner | Duration | Status |
|------|-------|-------|----------|--------|
| **E1** | State-Pack Architecture | A1 (Opus) | Days 1–2 | ?? Queued |
| **E2** | Election Day War-Room Logic | A2 (Fable) | Days 3–5 | ?? Queued |
| **E3** | Messaging Factory & Supervisor Console | A2 (Fable) | Days 6–8 | ?? Queued |
| **E4** | Canvass Engine Enhancement | A3 (Fable) | Days 9–10 | ?? Queued |
| **E5** | GitHub & CI/CD Setup | A1 (Opus) + A4 (Reviewer) | Days 11–12 | ?? In Progress |

---

## E1: Define State-Pack Architecture (A1 Lead, Days 1–2)

**Objective**: Extract Kwara data from hardcoded lib/kwara-election-data.ts into JSON state-pack.

### Tasks
- [ ] Review current lib/kwara-election-data.ts structure
- [ ] Design state-pack JSON schema (data.json, config.json, manifest.json)
- [ ] Extract INEC tree (16 LGAs, 193 wards, 2,886 PUs)
- [ ] Extract 2023 results by PU
- [ ] Create state-pack loader function
- [ ] Update lib/store.ts to inject state-pack at startup
- [ ] KayBam gate approval: Schema design OK?

### Gate Acceptance
- State-pack JSON validates
- kwara-election-data.ts extracted cleanly
- Loader tested in dev mode
- No data loss or PU deduplication issues

---

## E2: Build Election Day War-Room Logic (A2 Lead, Days 3–5)

**Objective**: Add per-party tally, spread meter (25% in 11/16), and cancellation alert.

### Tasks
- [ ] Add to lib/store.ts: tally_by_party_by_lga, spread_status, margin
- [ ] Modify command-center/page.tsx: tally table, spread meter, margin alert
- [ ] Modify ield-ops/page.tsx: EC8A photo upload form (UI only)
- [ ] Write E2E test: Simulate election, check spread rule logic
- [ ] KayBam gate approval: Spread meter math correct?

### Gate Acceptance
- Manual vote entry shows correct spread calculation
- 25% threshold check works for all 16 LGAs
- Cancellations > margin triggers warning
- Offline mode still works

---

## E3: Build Messaging Factory & Supervisor Console (A2 Lead, Days 6–8)

**Objective**: Message composer (HQ) + send console (supervisor).

### Tasks
- [ ] Add to lib/store.ts: Message store, Send log, Opt-out list
- [ ] Create comms/factory.tsx: Composer (text, language, audience, count preview)
- [ ] Create comms/supervisor-console.tsx: Send console (list, contacts, wa.me links)
- [ ] Create comms/reports.tsx: Message sent summary
- [ ] Add Kwara languages: Yorùbá, Nupe, Baatonum, Fulfulde
- [ ] Write E2E test: HQ ? Supervisor ? Send ? Log
- [ ] KayBam gate approval: Message flow end-to-end works?

### Gate Acceptance
- Message factory UI works
- Supervisor console lists messages correctly
- wa.me links pre-populate with message text
- Opt-out contacts are excluded

---

## E4: Enhance Canvass Engine (A3 Lead, Days 9–10)

**Objective**: Add PU-level staffing, member register link, training tracker.

### Tasks
- [ ] Extract agent roster from state-pack (1–2 per PU, ~3,000 agents)
- [ ] Modify canvass-command/page.tsx: PU-level view, agent assignment, coverage %
- [ ] Create "Import Member Register" form UI (no backend)
- [ ] Write E2E test: Coverage dashboard shows PU granularity
- [ ] KayBam gate approval: PU-level data correct?

### Gate Acceptance
- Ward view rolls up to LGA coverage correctly
- PU-level roster loads without deduplication issues
- Coverage % updated on agent assignment

---

## E5: Prepare GitHub & CI/CD (A1 + A4, Days 11–12)

**Objective**: GitHub repo + CI/CD pipelines ready for handoff.

### Tasks
- [ ] Create .github/workflows/build.yml, 	est.yml, deploy.yml
- [ ] Create docs/ARCHITECTURE.md, docs/STATE_ISOLATION.md
- [ ] Test: npm run build locally ? no errors
- [ ] Push to GitHub ? GH Actions build triggers
- [ ] Verify artifacts (webapp/out/) generated
- [ ] No secrets exposed in logs
- [ ] Create GitHub Issues for E1–E5 (assign to agents)

### Gate Acceptance
- \git push\ ? GH Actions build passes
- Artifacts generated
- No secrets exposed
- Branch protection on main

---

## Sprint 1 Timeline

**Week 1 (21–27 Sep)**:
- [x] Phase 1 analysis approved
- [ ] State-pack architecture spec'd (A1)
- [ ] War-room tally + spread meter built (A2)
- [ ] Messaging factory UI drafted (A2)

**Week 2 (28 Sep – 3 Oct)**:
- [ ] War-room logic finalized (A2)
- [ ] Messaging factory + supervisor console complete (A2)
- [ ] Canvass engine PU-level enhancement (A3)
- [ ] E2E tests passing
- [ ] Demo video recorded

**Demo Ready**: Sat 3 Oct 2026

---

**Last updated**: 2026-09-18
