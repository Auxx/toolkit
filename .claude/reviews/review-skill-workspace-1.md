# Review: `workspace` skill (#1)

Source: `libs/toolkit-nx/src/generators/skills/files/workspace/SKILL.md`
(identical to the generated `.claude/skills/workspace/SKILL.md`).

Stated purpose: explain to agents how the workspace is structured and how to
explore its contents **before writing any code**.

## Verdict

It does part of the job. The skill explains the Nx basics (list projects,
inspect a project, run a target) and the Angular feature layout, and its facts
are mostly right. It does **not** fulfil the "explore before writing code" part
of its purpose:

1. The description is unlikely to trigger the skill at the moment when it is
   needed.
2. The body is reference material. It never gives a workflow for exploring.
3. Some of the examples and instructions don't match what an agent will actually
   see when it runs the commands.

## What was verified

All commands were run against this workspace (Nx 23.2.1):

| Claim in skill                                                           | Result                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx nx show projects` prints a plain list                               | **Only on a TTY.** An agent's shell is not a TTY, so it prints JSON: `["toolkit-nx","test","@toolkit/source"]`.                                                                                                                                                        |
| Example lists 2 projects                                                 | There are 3. The root project `@toolkit/source` is also listed.                                                                                                                                                                                                        |
| `npx nx show project <p> --web=false` prints the `Name:/Root:/...` block | **Only on a TTY.** Without one it prints the full resolved JSON (`root`, `sourceRoot`, `targets.*.executor`, …). The human format needs `--json=false`.                                                                                                                |
| Output includes "dependencies"                                           | Only _implicit_ dependencies. Real project dependencies are not shown. They come from `nx graph --print`.                                                                                                                                                              |
| `npx nx run <project>:<target>`                                          | Correct.                                                                                                                                                                                                                                                               |
| Detect Angular via `targets.build.executor` in `project.json`            | The idea is right, but reading `project.json` is unreliable. Targets inferred by plugins are not in it: `toolkit-nx`'s `lint`/`test` come from `nx.json` plugins. `nx show project` already shows the resolved executor, e.g. `@angular/build:application` for `test`. |
| Features live under `<Source Root>/<feature>`                            | Correct. Matches `featurePath()` in `lib/path-helper/path-helper.ts`.                                                                                                                                                                                                  |
| File naming `<name>.component.ts`, `.dialog.ts`, `.page.ts`, …           | Consistent with the generators and the `toolkit-nx` skill.                                                                                                                                                                                                             |

## Issues

### 1. The description won't trigger the skill reliably (high)

```yaml
description: |
  Workspace structure and exploration skill.
  Use to understand the structure of a workspace, and explore its projects.
```

The description is the only part of the skill the agent sees when it decides
whether to load it. This one restates the name and gives no trigger condition.
The purpose is "before writing any code", so the description should say exactly
that, and name the situations where it applies. Compare the `toolkit-nx`
description, which lists concrete triggers.

Suggested:

```yaml
description: |
  How this Nx monorepo is organised and how to explore it. Use BEFORE writing
  or changing code in this workspace: to find which project/feature owns
  something, where a new file should go, how projects depend on each other,
  or which lint/test/build targets to run. Use instead of guessing paths or
  browsing directories blindly.
```

### 2. No exploration workflow (high)

The skill lists capabilities but never says _what to do, in which order_, before
writing code. Add a short procedure, for example:

1. `npx nx show projects --type app` / `--type lib` to find candidate projects.
   Ignore the root project `@toolkit/source`.
2. `npx nx show project <p>` to get `root`, `sourceRoot` and the target
   executors (this also tells you whether the project is Angular).
3. List `<sourceRoot>` to see which features exist. Reuse an existing feature
   before creating a new one.
4. Read one or two existing artefacts of the same type in that feature (and
   `<feature>.routes.ts`, and `app.routes.ts` for how features are wired in).
   Match their conventions.
5. Check dependencies with `npx nx graph --print` (and `tsconfig.base.json`
   `paths` for library import aliases) before importing across projects.
6. To create artefacts, hand over to the `toolkit-nx` skill.

Step 6 matters: the two skills currently don't reference each other.

### 3. Examples don't match what an agent sees (medium)

Agents run commands without a TTY, so they get JSON. The skill describes the
human format (`Root`, `Source Root`, `Targets`), whose keys differ from the JSON
keys (`root`, `sourceRoot`, `targets`). Choose one of these fixes:

- Document the JSON output (recommended: it is complete and parseable), and name
  the keys that matter: `root`, `sourceRoot`, `projectType`,
  `targets.<t>.executor`. Or
- Tell the agent to pass `--json=false` to get the format shown.

Also update the `nx show projects` example to include `@toolkit/source` and
explain what it is. Better still, use generic project names: this file ships in
a published package, and consumer workspaces won't contain `toolkit-nx` or
`test`.

### 4. Angular detection should not depend on `project.json` (medium)

Replace "look at `project.json`" with "check `targets.build.executor` from
`nx show project <p>`". `project.json` can be missing or incomplete when targets
are inferred by plugins. In this repo, `toolkit-nx`'s `lint`/`test` targets are
not in its `project.json`.

### 5. Missing high-value commands (medium)

- `npx nx show projects --type app|lib` and `--with-target <t>` (both verified).
- `npx nx show projects --affected`. Useful for deciding what to verify after a
  change.
- `npx nx run-many -t lint test` / `npx nx affected -t lint test`, as the
  verification counterpart to the single-project `nx run`.
- `npx nx graph --print` for real dependencies (the skill says `show project`
  shows dependencies, but it only shows implicit ones).

### 6. Directory tree mistakes (low)

- In every artefact block, two lines use the "last item" connector (`└──`): the
  `.stories.ts` line and the `.spec.ts` line. The `.stories.ts` line should be
  `├──`.
- Trailing spaces after `<component-name>/ ` etc.
- "functional directory layout and Markdown diagram" reads oddly. "directory
  layout of a feature" is enough.
- The tree doesn't show where features sit next to the existing Angular `app/`
  folder (`<sourceRoot>/app/` holds `app.ts`, `app.routes.ts`, `app.config.ts`).
  Agents will see `app/` and may wonder whether features belong inside it.

### 7. Inconsistent with the `toolkit-nx` skill (low)

`toolkit-nx` says features live in `<projectRoot>/src/<feature>`. This skill
says `<Source Root>/<feature>`. The code uses `sourceRoot`, so this skill is
right and `toolkit-nx` should switch to `<sourceRoot>`. Ideally the layout is
described in one place and the other skill links to it, so the two cannot drift
apart.

`toolkit-nx` also says "Application projects live inside `apps/`, library
projects live inside `libs/`". That belongs in this skill, which doesn't mention
it at all.

### 8. Unclear scope for other artefacts (low)

"there can also be other types of artefacts like guards and interceptors" does
not say where they go. Say whether they follow the same
`<feature>/<type>/<name>/` pattern (e.g. `guards/`, `interceptors/`) or are
created ad hoc, and that no generator exists for them.

### 9. Libraries are not covered (low)

The text says Angular projects "can be either an application or a library", but
all the guidance is app-oriented. Say whether libraries use the same feature
layout and how they expose code (`src/index.ts` public API, `tsconfig.base.json`
path alias).

## Related finding outside the skill text

`libs/toolkit-nx/src/generators/skills/skills.spec.ts` was not updated when
`workspace` was added to `knownSkills`. It still expects exactly one skill
directory and currently **fails**:

```
expect(tree.children(agentsTarget).length).toBe(1);   // actual: 2
```

It should expect 2 and assert that `workspace/SKILL.md` exists in both targets.

## Summary of recommended changes

1. Rewrite the description with explicit triggers ("before writing or changing
   code…").
2. Add a numbered exploration workflow that ends by handing over to
   `toolkit-nx`.
3. Fix the command output examples (JSON vs `--json=false`), mention the root
   project, and use generic names.
4. Detect Angular from `nx show project`, not `project.json`.
5. Add `--type`, `--with-target`, `--affected`, `run-many`/`affected`, and
   `nx graph --print`.
6. Fix the tree connectors and add `app/` and `apps/`/`libs/` context.
7. Align `toolkit-nx` with `<sourceRoot>`, and keep the layout in one place.
8. Fix `skills.spec.ts`.
