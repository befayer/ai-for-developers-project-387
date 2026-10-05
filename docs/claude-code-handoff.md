# Claude Code handoff

Notes for continuing work in a cloud or sandboxed session.

## Origin

The code was imported from `befayer/ai-for-developers-project-386` (main@6f9dc10).
Project 387 adds an OpenCode agent in GitHub Actions; see `docs/roadmap.md`.

## Installing dependencies without access to nodejs.org

`better-sqlite3` builds a native module and node-gyp downloads Node headers from nodejs.org.
If that host is blocked, point node-gyp at local headers:

```bash
npm_config_nodedir=/usr npm ci --legacy-peer-deps   # headers in /usr/include/node
# or a custom Node install, e.g. npm_config_nodedir=/opt/node22
```

## Verification checklist

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, then
`PORT=4100 node dist-server/index.js` and check `/` and `/api/v1/health` return 200.
Docker may be unavailable in sandboxes; the image is built by Render.

## Things only the repository owner can do

- Push access for the session.
- Model provider and API key for OpenCode (repository secret).
- Render: create a Blueprint from this repo (service `befayer-call-calendar-387`).
- Settings → Actions → General: allow GitHub Actions to create pull requests (release-please, agent PRs).
- Install the `opencode-agent` GitHub App on this repository.
