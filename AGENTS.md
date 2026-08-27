# AGENTS.md

Runbook for this repo's toolchain quirks and the working agreement
for commits.

## Toolchain

### Always use Windows node, not WSL's

`D:\Tugas\LLM\endminsworkshop` is on a DrvFs mount under WSL. npm
through WSL is unreliable here — it uses hardlinks and cross-device
operations that fail on DrvFs. **Always run install/build/dev/test
through Windows' own `node` / `npm`.** Two ways:

- Open a Windows PowerShell / `cmd.exe` prompt at the project root
  and run `npm install`, `npm run dev`, etc. directly.
- From a WSL shell, route through `cmd.exe`:
  ```bash
  cmd.exe /c "cd /d D:\Tugas\LLM\endminsworkshop && npx vitest run"
  ```
  This is what the dev loop looks like from a WSL session.

### Why not switch to WSL's filesystem?

The Windows side is the source of truth for the editor (it's where
your code lives in Windows). Keeping it there lets editors and
explorers on either side see the same files. Build artifacts work
correctly when `node` is the Windows one.

## Commit & Push Policy

**After every meaningful unit of work, commit and push to `main`.**

The repo has a one-shot alias for this:

```bash
git cp "Short message describing the change"
```

This runs `git add -A`, `git commit -m "<message>"`, and
`git push origin main`. Co-author footer is added by the alias.

Concrete checkpoint triggers:

- After each new feature lands.
- After fixing a bug.
- After a typo or comment-only cleanup, batched with the next
  substantive change is fine.

When in doubt, push — a noisy history is better than losing work.

## Repo

- Remote: `git@github.com:Rokuko-L/endfield-factory-planner.git`
- Branch: `main` (default)
- Git identity (from `git config --global`): name `Rokuko`,
  email `dhafinrifki1245@gmail.com`

## Editor Structure Cheat Sheet

- Adding a new machine: edit `src/data.ts`, append to
  `ALL_MACHINE_TYPES`. The editor picks it up via the dropdown
  automatically.
- Adding a new behavior: write core logic in a `src/*.ts` module
  (one concern per file), wire it into `main.ts`, render via
  `src/renderer.ts`. Don't put state in the renderer.
- Adding a test: drop a `*.test.ts` into `test/`. The Vitest
  config picks up anything under `test/`.
- Strict TypeScript is on. New code must type-check clean
  (`npm run typecheck`).
