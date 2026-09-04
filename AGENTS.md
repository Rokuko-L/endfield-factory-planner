# AGENTS.md

Runbook for this repo's toolchain quirks and the working agreement
for commits. The documentation itself lives in [Docs/](Docs/overview.md).

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

## Agent Playground — playing/testing the app as an agent

To "play" the editor directly (test existing or new features) instead of
only reading code, load the page and use the `window.__ew` API — it
drives the real editor code paths and returns text, so it works for both
vision-capable and text-only agents (`__ew.help()` is self-documenting).

Run `npm run dev`, open the page via browser automation, then e.g.
`await __ew.place('Furnace', 10, 5)` / `await __ew.connect(...)` /
`__ew.dump()` for an ASCII view of the whole board. Full reference:
[Docs/reference/agent-playground.md](Docs/reference/agent-playground.md).
Headless alternative: pure-logic vitest suites (`npm test`).

## Repo

- Remote: `git@github.com:Rokuko-L/endminsworkshop.git`
- Branch: `main` (default)
- Git identity (from `git config --global`): name `Rokuko`,
  email `dhafinrifki1245@gmail.com`
