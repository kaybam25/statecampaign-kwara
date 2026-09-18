# State Isolation Design — Phase 3 Database Contract

Last updated: 2026-09-18
Phase: 3 (Backend + Database)
Applies to: PostgreSQL schema with Row-Level Security (RLS)

## Overview

State isolation is the core security constraint for StateCampaign. A single deployment in Phase 3 will support multiple states (Kwara, Ogun, Abia, etc.), but no cross-state data leakage is ever permitted.

This document defines the database contract all Phase 3 backend code must follow.

## Core Rules

### 1. Every table must have state_id

All tables must include state_id column as foreign key to state_meta(state_id).

Example:
CREATE TABLE polling_unit (
  id UUID PRIMARY KEY,
  state_id UUID NOT NULL REFERENCES state_meta(state_id),
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  registered_voters INT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(state_id, code)
);

Rationale: Enables partition-by-state at database layer and RLS row filtering.

### 2. All queries must filter by state_id

CORRECT: SELECT * FROM polling_unit WHERE state_id = ? AND code = ?;
WRONG: SELECT * FROM polling_unit WHERE code = ?;

### 3. Row-Level Security (RLS) enforced on all tables

ALTER TABLE polling_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent ENABLE ROW LEVEL SECURITY;

CREATE POLICY state_isolation ON polling_unit
  USING (state_id = current_user.state_id)
  WITH CHECK (state_id = current_user.state_id);

Rationale: Defense-in-depth. Even if app logic is bypassed, database layer enforces isolation.

### 4. Auth context includes state_id

JWT or session context must include:
- user_id: UUID
- state_id: UUID (REQUIRED)
- role: 'supervisor' | 'agent' | 'secretary'

## Schema (Phase 3)

### Meta Tables

state_meta table with state_id, state_code, state_name, created_at, deleted_at
user_account table with id, state_id, email, role, created_at

### Election Data Tables

lga, ward, polling_unit, results_2023

### Operational Tables

agent, contact, opt_out, message, send_log, tally_entry, audit_log

All must include state_id column and enforce RLS policies.

## Data Deletion Policy (NDPA 2023 Compliance)

End of election cycle: All contact data purged (NDPA requires "necessary for specified purpose")
Voter register: Deleted 30 days post-election
Audit log: Retained 2 years (legal hold)

## Testing Strategy

### Unit Tests
- RLS policy enforcement (query should return empty set for non-matching state)
- FK constraints enforce state_id consistency

### Integration Tests
Test that RLS blocks cross-state read and write operations.

## Migration Path (Phase 2 → Phase 3)

Phase 2 (Current): Client-side Zustand store, localStorage for demo
- No multi-state support yet
- State-pack JSON as read-only config

Phase 3 Transition:
1. Create PostgreSQL schema with RLS
2. Add backend API routes (Express/Fastify) with auth context
3. Migrate Zustand store to API calls (tally, messaging, etc.)
4. Switch from localStorage to backend persistence
5. Enable multi-state via subdomain routing or state header

Backwards Compat: Phase 2 app can still demo offline; API layer added alongside.

## Checklist for Backend Review

- [ ] Every table has state_id column
- [ ] Every query filters by state_id (audit via query logs)
- [ ] RLS enabled on all tables
- [ ] RLS policies tested with multiple state contexts
- [ ] Foreign keys enforce state_id consistency
- [ ] Deletion logic respects NDPA timeline
- [ ] Audit log captures all mutations (INSERT, UPDATE, DELETE)
- [ ] User auth context includes state_id and role

See also: ARCHITECTURE.md (system design) | DEPLOYMENT.md (build & release)
