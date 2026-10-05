# CLAUDE.md

Project rules, commands and structure live in @AGENTS.md — follow them.
Domain language: @CONTEXT.md. Current development plan: docs/roadmap.md.

Claude Code specifics:

- Skills `plan`, `tdd`, `verify` are mirrored in `.claude/skills/`; `.agents/skills/` is the source, keep them identical.
- Before reporting a task as done, run the `verify` skill.
- Do not edit `.github/workflows/hexlet-check.yml` — it is managed by Hexlet.
- Environment notes for sandboxed sessions: docs/claude-code-handoff.md.
