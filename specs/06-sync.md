# Sync: P2P Vocabulary Sharing

## Overview

Enable anonymous vocabulary sharing across users via a lightweight relay server, with offline-first design and privacy preservation.

## User Stories

- As a user, I want my shared vocabulary to be available to others even when I'm offline
- As a user, I want to discover vocabulary from others without revealing my identity
- As a user, I want sync to happen silently in the background without interrupting my practice

## Requirements

### Sync Client (from P2P-SYNC-PROTOCOL.md)

- [ ] REST API client for relay server communication
- [ ] Endpoints: POST/GET descriptions, POST confirmations, GET sync delta
- [ ] Device registration with anonymous device ID
- [ ] Delta sync using cursor-based pagination
- [ ] Background sync on app focus and periodic interval

### Offline Queue (from P2P-SYNC-PROTOCOL.md)

- [ ] Queue pending operations when offline (IndexedDB store)
- [ ] Operation types: create_description, create_confirmation
- [ ] Flush queue when connectivity restored
- [ ] Retry with exponential backoff (1s, 2s, 4s, max 30s)
- [ ] Conflict resolution: last-write-wins for descriptions, additive for confirmations

### Privacy (from P2P-SYNC-PROTOCOL.md)

- [ ] Anonymous sharing by default (no account required)
- [ ] Only explicitly shared descriptions leave the device
- [ ] No tracking, no analytics, no identifiers beyond device ID
- [ ] Device ID is random, regeneratable

### Sync Status UI

- [ ] Sync indicator in app header (syncing, synced, offline)
- [ ] Last sync timestamp
- [ ] Manual sync trigger

## Acceptance Criteria

- [ ] Descriptions sync to relay server when shared
- [ ] Confirmations propagate correctly
- [ ] Offline queue persists and flushes on reconnect
- [ ] Retry logic handles transient failures
- [ ] No data leaves device unless explicitly shared
- [ ] Sync status displays correctly in UI
- [ ] `npm run check` passes

## Dependencies

- spec 01-foundation (IndexedDB, stores)
- spec 04-vocabulary (descriptions and confirmations)
- Relay server (external, not built in this app)

## Out of Scope

- Building the relay server (separate project)
- Direct peer-to-peer connections
- User accounts or authentication

## Reference Docs

- docs/P2P-SYNC-PROTOCOL.md (full protocol spec)
- src/lib/types/sync.ts (Zod schemas already defined)
