# Review: `toolkit-nx` skill

Reviewed: `.claude/skills/toolkit-nx/SKILL.md` and `references/*.md`. These are
identical to the source in
`libs/toolkit-nx/src/generators/skills/files/toolkit-nx/`, which the `skills`
generator copies into `.claude/skills` and `.agents/skills`. **Make all fixes in
the source under `libs/`**, then re-run the generator.

I checked each finding against the generator code and against dry runs and real
runs on `apps/test`. The temporary files were removed afterwards.

## Verdict

**The skill partly does its job.** Its structure is sound: a short router
`SKILL.md` plus one reference per generator, a dry-run-first workflow, and a
format/lint/test loop at the end. In practice, though, an agent following it
will often either not load it or produce broken output:

1. **It triggers on the wrong things.** The description fires when the _user
   says_ "create component", but not when the agent itself decides it needs a
   new service or page while doing a larger task. That second case is the one
   you care about most. Pipes, directives and dialogs are also missing from the
   description.
2. **Its naming instruction is wrong.** It tells the agent to "convert to camel
   case". That gives inconsistent folders, names and routes, and **breaks the
   page generator** (see C1).
3. **It leaves out things the agent must know.** Features must exist before
   anything else is created. Generators fail silently with exit code 0. The page
   generator registers its own route. Nothing wires a feature into the app's
   routes. There is a `--type=dialog` option, and the `--translations` /
   transloco dependency is never mentioned.

## Critical issues

### ✅ C1. "Convert to camel case" produces broken output

All six references tell the agent to convert project, feature and artifact names
to camel case. The generators treat the raw `--name` / `--feature` as a **folder
name**, but run it through `names().fileName` (kebab-case) for **file names**:

| Input                                           | Result                                                                                                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feature --name=userProfile`                    | `src/userProfile/user-profile.routes.ts`                                                                                                                         |
| `page --feature=userProfile --name=userDetails` | `src/userProfile/pages/userDetails/user-details.page.ts` **and CREATEs a second `userProfile.routes.ts`**, because `featureRoutesPath` uses the raw feature name |
| `page --feature=orders --name=orderList`        | folder `pages/orderList/`, route `{ path: 'orderList', … }` (camelCase URL)                                                                                      |

Projects are worse still: `--project` must match the Nx project name exactly.
Camel-casing `my-app` to `myApp` makes `readProjectConfiguration` throw.

**Fix:** tell the agent to use **kebab-case** for `--feature` and `--name` (e.g.
`user-profile`). That is the only input for which folder, file and route names
line up. For `--project`, use the exact name from `nx show projects`. Ideally
also normalise in the generators with `names(x).fileName` in `path-helper.ts`
and `page.ts`, so the skill isn't the only safeguard.

### ✅ C2. The description doesn't cover "every time the agent creates something"

```yaml
description: |
  Create Angular components, features, pages, and services.
  INVOKE IMMEDIATELY when user mentions adding, creating
  components, features, pages, and services.
  Trigger words - create component, create feature, create page, create service.
triggers: [...]
```

- The description is the only thing the model sees when deciding whether to load
  the skill. Right now it only covers the user explicitly asking. It should also
  cover the agent's own intent, e.g. "implement a settings screen", which
  implies a page, a service and probably components.
- **Pipes, directives and dialogs are missing.** The body routes to the pipe and
  directive references, but an agent that needs a pipe has no reason to load the
  skill.
- It doesn't say what the skill replaces. With `@nx/angular` and
  `@schematics/angular` installed, agents will reach for
  `nx g @nx/angular:component`, `ng g`, or write files by hand.
- `triggers:` is not a frontmatter field Claude Code recognises, so it is
  ignored. It is harmless, but it gives a false sense of coverage.

**Suggested description:**

```yaml
description: >
  Required workflow for adding ANY new Angular artifact (feature, page, component,
  dialog, service, pipe, directive) to an application in this Nx workspace,
  using the @hexmode/toolkit-nx generators. Use whenever you are about to create a
  new .ts/.html/.scss Angular file, whether the user asked for it directly
  ("add a component", "create a service") or it is a step in a larger task
  ("build a settings screen", "add an orders feature"). Use instead of
  `nx g @nx/angular:*`, `ng generate`, or hand-writing the files.
```

### ✅ C3. Generators fail silently

If the feature doesn't exist, `component`, `page`, `service`, `pipe` and
`directive` print `Feature "x" does not exist.`, write nothing, and **exit 0**.
I confirmed this. `feature` does the same when the feature already exists. An
agent that checks only the exit code, or skims the dry-run output, will think it
succeeded.

**Fix:** state this in `SKILL.md`:

- A feature must exist before creating anything inside it. Check
  `<sourceRoot>/<feature>/`, and run the feature generator first if it's
  missing.
- After a dry run, confirm the output contains `CREATE` lines. A "does not
  exist" or "already exists" message means nothing happened.

(Better still, have the generators `throw` so Nx exits non-zero.)

## Important gaps

### ✅ I1. "A user must specify…" leads to needless questions

Step 1 of every reference says the _user_ must supply project, feature and name.
In a workspace with one app (`test`), or where the feature is obvious from
context, this pushes the agent to ask needless questions or to stall. Replace it
with a resolution order:

1. Project: `npx nx show projects --type=app`. If there is exactly one, use it.
2. Feature: list existing feature folders under the project's `sourceRoot`, then
   pick from the request and context.
3. Ask the user only if a value is still ambiguous.

### ✅ I2. Missing knowledge about what the generators actually do

Add a short "what you get" section so the agent doesn't redo or undo generator
work:

- **Layout:** features live at `<sourceRoot>/<feature>/`, which is
  `apps/test/src/<feature>`, _not_ `src/app/<feature>`. Artifacts go in
  `<feature>/{components,pages,dialogs,services,pipes,directives}/<name>/`.
- **Generated files:** components, pages and dialogs get `.ts`, `.html`,
  `.scss`, `.spec.ts` and `.stories.ts`. Services, pipes and directives get
  `.ts` and `.spec.ts`.
- **Class and selector names:** `OrderListPage`, `UserCardComponent`, and
  selector `<prefix>-<name>`, where the prefix comes from `project.json` and
  defaults to `app`. Directive selectors are camelCase.
- **The page generator registers its own route** in `<feature>.routes.ts`. The
  agent must not add it again.
- **Nothing wires the feature into the app.** After creating a feature, the
  agent needs to add a lazy route to `app.routes.ts`, e.g.
  `{ path: 'orders', loadChildren: () => import('../orders/orders.routes').then(m => m.routes) }`.
  The skill should say so explicitly. Otherwise new pages are unreachable.

### ✅ I3. Undocumented options: dialogs and translations

- `component` accepts `--type=component|page|dialog`. **Dialogs have no
  reference and no mention**, so an agent asked for a dialog will make a plain
  component.
- `component` accepts `--translations`. `page` always forces
  `translations: true`, and then imports `TranslocoDirective` from
  `@jsverse/transloco`, **which isn't a dependency of this workspace**. Every
  generated page will fail to compile until that is fixed. The skill should at
  least warn about this, and the page generator should probably not force it.

Add a `--type=dialog` row to the component reference (or a separate
`create-dialog.md`) and document `--translations`.

### ✅ I4. Instructions to avoid plain Angular/Nx generators are too weak

"These code generators SHOULD be used" is the only directive. Make it explicit
that the agent must **not** use `@nx/angular:*` / `ng g` generators or
hand-write these files. It should only fall back to doing so, and tell the user,
when no toolkit generator covers the artifact (e.g. guards, interceptors,
resolvers, models, or code in libraries).

## Minor issues

- **Too much duplication.** The six references are about 90% identical: the
  principles, dry run, modify, format and verify steps. That costs tokens on
  every load and lets the copies drift; they already differ (see the next two
  bullets). Move the shared workflow into `SKILL.md` once, and keep each
  reference to its command, its options, what it generates, and its gotchas. You
  could also put a one-table command cheat sheet in `SKILL.md`, so simple cases
  don't need a second file read at all.
- **`create-feature.md`** stops after `npm run format`, with no lint/test step
  and no "wire into app routes" step.
- **The "empty test suites" warning** appears only in the pipe and directive
  references. Either it applies everywhere or nowhere.
- **Commands use bare `nx`.** `nx` is only in `node_modules/.bin`, so use
  `npx nx …`, which works whether or not Nx is installed globally.
- **`npm run lint` / `npm run test`** run every project. That is fine now, but
  it will get slow. Consider `npx nx affected -t lint test`. `defaultBase` is
  already set to `master`.
- **Inconsistent spelling:** "artefact" vs "artifact" across the files.
- **Generator schemas (outside the skill, but they affect `--help` output agents
  may read):** `pipe-schema.json` and `directive-schema.json` were copied from
  `service` and still say `"$id": "Service"` and "Name of a new service".

## Suggested `SKILL.md` shape

```markdown
---
name: toolkit-nx
description: <see C2>
---

# Creating Angular artifacts with @hexmode/toolkit-nx

ALWAYS create features, pages, components, dialogs, services, pipes and
directives with these generators — never with `@nx/angular:*`, `ng generate`, or
by hand-writing the files.

## Quick reference

| Artifact  | Command (add `--no-interactive`; run with `--dry-run` first)                  | Output                                  |
|-----------|--------------------------------------------------------------------------------|-----------------------------------------|
| feature   | `npx nx g @hexmode/toolkit-nx:feature --project=P --name=F`                    | `<src>/F/F.routes.ts`                   |
| page      | `npx nx g @hexmode/toolkit-nx:page --project=P --feature=F --name=N`           | `F/pages/N/` + route added to F.routes  |
| component | `… :component --project=P --feature=F --name=N [--type=dialog] [--translations]` | `F/components/N/` or `F/dialogs/N/`     |
| service   | `… :service  --project=P --feature=F --name=N`                                 | `F/services/N/`                         |
| pipe      | `… :pipe     --project=P --feature=F --name=N`                                 | `F/pipes/N/`                            |
| directive | `… :directive --project=P --feature=F --name=N`                                | `F/directives/N/`                       |

## Rules
- Names: kebab-case for F and N (`user-profile`); P = exact name from `npx nx show projects`.
- Resolve P and F from the workspace/context; ask only if ambiguous.
- Feature must exist first. Generators exit 0 on failure — confirm `CREATE` lines in output.
- Page routes are registered automatically; new features must be added to `app.routes.ts` manually.
- Pages import `@jsverse/transloco` …

## Workflow
1. Resolve inputs → 2. dry run → 3. run → 4. adapt generated code →
5. `npm run format` → 6. lint + test; fix small issues, escalate large ones.

Details per generator: references/…
```

## Priority

| #  | Change                                                                          | Effort |
| -- | ------------------------------------------------------------------------------- | ------ |
| C1 | Replace "camel case" with kebab-case and the exact project name                 | XS     |
| C2 | Rewrite the description (agent intent, all artifact types, "instead of …")      | XS     |
| C3 | Document feature-first ordering and silent exit-0 failures                      | XS     |
| I2 | Add a layout / "what you get" section and the app route wiring step             | S      |
| I3 | Document `--type=dialog` and `--translations`; resolve the transloco dependency | S      |
| I1 | Infer inputs instead of requiring the user to supply them                       | XS     |
| —  | Deduplicate the references into `SKILL.md` and add the cheat sheet              | S      |
| —  | Generator-side hardening (normalise names, throw on missing feature)            | S      |
