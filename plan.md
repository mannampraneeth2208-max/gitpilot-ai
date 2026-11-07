# GitPilot Control Room plan

## Scope

A responsive operator dashboard for GitPilot's autonomous engineering runtime. It presents contribution history, active work, evidence, approvals, repositories, opportunities, agents, and provider health. It provides server-mediated provider credential rotation without exposing secret values to the browser. Gmail is optional for notifications only; no Gmail password is requested or stored.

## Implementation approach

The project uses a dependency-light Node HTTP server with a static frontend. The browser talks only to same-origin `/api/*` routes. The server keeps a demo data adapter for Preview and accepts `GITPILOT_API_BASE` for the real runtime gateway. Provider credentials are write-only server inputs stored through environment/secrets integration in production; the UI displays provider, status, masked fingerprint, and last-rotated timestamp only. Approval actions require an operator session and are forwarded server-side to the GitPilot API.

## Project structure

- `server.js`: static serving and server-side API boundary.
- `public/index.html`: dashboard shell and accessible navigation.
- `public/app.js`: state, rendering, filters, approval/settings interactions.
- `public/styles.css`: visual system and responsive layout.
- `public/manus-routes.json`: route manifest.
- `plan.md`, `TODO.md`: implementation record.

## Design

Three candidate directions: Terminal Observatory (0.06), Editorial Operations Desk (0.08), Night Shift Control Room (0.04). Chosen direction: **Terminal Observatory**.

- **Design movement:** quiet mission-control instrumentation with editorial hierarchy.
- **Core principles:** evidence before optimism; dense but breathable information; clear human gates; calm failure visibility.
- **Color philosophy:** warm paper base and ink for trust, amber for attention, electric blue for active work, green only for verified outcomes, red reserved for blockers.
- **Layout paradigm:** a left rail for modes, a wide telemetry canvas, and a right-side approval queue rather than centered cards everywhere.
- **Signature elements:** signal dots, monospaced evidence labels, and a thin amber “mission line” running through contribution history.
- **Interaction philosophy:** every action says what it changes and whether approval is required; secret fields are explicitly write-only.
- **Animation:** restrained 160ms transitions; no looping motion except the live-status pulse.
- **Typography:** Inter/system sans for reading and IBM Plex Mono-like system monospace for IDs, states, and evidence.
- **Brand essence:** GitPilot turns repository work into traceable, approval-gated contributions; precise, candid, operational.
- **Brand voice:** direct and evidence-led. “Nothing is complete without proof.” “Approve the change, not the promise.”
- **Wordmark:** compact GP monogram formed by two offset signal brackets.
- **Signature color:** amber `#f2a93b` against deep ink `#17191f`.
