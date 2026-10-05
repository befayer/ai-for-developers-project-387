# Roadmap: agent workflow

Goal: an OpenCode agent in GitHub Actions takes an issue through
triage → PR → review → scheduled checks → final verification.

## Stages

1. **Import and plan** — project 386 imported, CI green, this roadmap.
2. **Agent setup** — OpenCode workflow reacting to `/oc` comments; model secret; GitHub App installed.
3. **Triage** — on new issues the agent applies labels from `docs/agents/triage-labels.md` and asks for missing details.
4. **Fix via PR** — `/oc explain` on an issue, then `/oc fix` opens a PR that follows AGENTS.md (Conventional Commits, issue reference, test for every booking rule).
5. **Review** — agent reviews PRs; human approves and merges.
6. **Schedule** — periodic agent run (e.g. weekly) to check open issues and dependency health.
7. **Final check** — release-please release, Render deploy, README with demo.

## Issues to create

### 1. Bug: a taken slot is offered again after a 409 conflict
`BookingForm` only shows the error when the server answers 409; `BookingPage` keeps the stale
slot list, so the guest can pick the same taken time again.
Expected: after 409 the slots are reloaded and the selection is cleared.
Agent scenario: `/oc explain` → `/oc fix` → review.

### 2. Bug: booking comment is lost
The booking form has a «Комментарий» textarea (`name="note"`), but the value is not sent
and `api/main.tsp` has no `note` field. Expected: optional note stored and shown to the owner.
Purpose: check automatic triage (bug label, area: contract + UI + server).

### 3. Feature: guest cannot cancel a booking
### 4. Feature: owner cannot close a day for bookings
