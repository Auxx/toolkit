# Review 2: `toolkit-nx` skill

Reviewed: the source of the skill in
`libs/toolkit-nx/src/generators/skills/files/toolkit-nx/` (`SKILL.md` and
`references/*.md`), the installed copy in `.claude/skills/toolkit-nx/`, and the
generator code the skill describes.

I checked the findings with dry runs and one real run on `apps/test`
(`feature orders` + `page orderList`, then `nx run-many -t lint test`). The
generated files were deleted afterwards and the working tree is clean.

## Verdict

**Mostly yes. The skill is much better than in the first review.** The
description now fires when the agent itself needs to create something, not only
when the user asks. It lists every artifact type and says what the skill
replaces. The shared workflow now lives in `SKILL.md`. Names are kebab-case.
Inputs are no longer "user must specify". There is a layout section. Dialogs and
translations are documented. The generators now `throw`, so a missing or
duplicate feature fails with exit code 1 (confirmed). A separate fix
(`path-helper.ts` now normalises names) means folders and file names come out
kebab-case whatever the input.

Three problems still stop it from fully doing its job:

1. **Agents in this workspace still get the old skill.** `.claude/skills` holds
   an outdated copy (see R1).
2. **Following the skill to create a page breaks `npm run test`** (see R2).
3. **After creating a feature, the agent is told to leave the routing to the
   user**, so new pages can't be reached (see R4).

## Remaining critical issues

### R1. The installed copy is out of date

`.claude/skills/toolkit-nx/` (and `.agents/skills/`) are gitignored copies
written by the `skills` generator. They were not regenerated after commits
`b4109d1` and `58057e6`. The copy an agent loads today still says:

- "convert to **camel case**";
- "**A user must specify** the following";
- nothing about layout, dialogs, `--translations`, or "do NOT use
  `@nx/angular`";
- a single "SHOULD … component, feature, page, or service" (no pipes or
  directives).

Only the frontmatter `description` is new. The agent therefore triggers on the
improved description and then follows the old, broken instructions.

**Fix:** run `npx nx g @hexmode/toolkit-nx:skills`. To stop this happening
again, consider a check in CI or a pre-commit hook that diffs the source against
`.claude/skills`. Alternatively, commit the generated copy in this repo, since
this workspace is where the skill is developed.

### R2. Every generated page fails to compile, and the skill says nothing about it

`page.ts` always passes `translations: true`. The template then imports
`TranslocoDirective` from `@jsverse/transloco`, which is **not installed**. The
real run gave:

```
✘ [ERROR] TS2307: Cannot find module '@jsverse/transloco' …
    apps/test/src/orders/pages/order-list/order-list.page.ts:2:35
✘ [ERROR] NG1010: 'imports' must be an array of components, directives, pipes, or NgModules.
NX  Running targets lint, test for project test failed  →  test:test
```

So an agent that follows the skill exactly reaches step 3 ("Verify") with a
failure it didn't cause. It will then either remove the transloco code by hand
(undoing generator output) or escalate. `create-component.md` also suggests
`--translations=true` with no hint that this needs a library the workspace may
not have.

**Fix (pick one):**

- Generator: don't force `translations: true` in `page.ts`. Expose
  `--translations` on the page schema, defaulting to `false`, or only when
  `@jsverse/transloco` is in `package.json`.
- Skill: add a rule saying that pages always include Transloco, so
  `@jsverse/transloco` must be installed and configured. Also say to use
  `--translations=true` on components only when it is.

### R3. Kebab-case is required for pages, but "convert project to kebab-case" is wrong

Folders and file names are now normalised. **`page.ts` still uses the raw
`options.name`** for the route's import path and URL. Confirmed with
`--name=orderList`:

```ts
import { OrderListPage } from "./pages/orderList/order-list.page";   // folder is pages/order-list → broken import
export const routes: Route[] = [{ path: 'orderList', component: OrderListPage }];
```

The skill's kebab-case rule avoids this, but only if the agent applies it, and
nothing tells the agent that it matters. Separately, every reference says
"Project name … convert to a kebab-case". The project name must match the Nx
project **exactly** (`readProjectConfiguration` throws otherwise), and project
names are not guaranteed to be kebab-case.

**Fix:**

- Skill: "`--project` = the exact name from `npx nx show projects --type=app`.
  `--feature` / `--name` = kebab-case (`order-list`)."
- Generator: in `page.ts`, use `names(options.name).fileName` for both the
  import path and the route `path`, so the skill is no longer the only
  safeguard.

## Important gaps

### R4. Wiring the feature into the app is left to "the user"

`create-feature.md`: _"features are not wired automatically; the user should add
it manually."_ The skill's reader is the agent, and the agent is the one
building the screen. As written, it will create a feature and pages that the app
can't reach, and then report success.

**Fix:** tell the agent to do it, and show how. In this workspace the target is
`apps/test/src/app/app.routes.ts` (`export const appRoutes`). The feature file
exports `routes`:

```ts
{ path: 'orders', loadChildren: () => import('../orders/orders.routes').then(m => m.routes) }
```

Also mention that the page generator registers the page's route in
`<feature>.routes.ts`. That is stated, which is good. The agent must not add it
again, and it must not remove it while "modifying generated code".

### R5. Nothing says how to find the project and feature

Removing "a user must specify" was right, but nothing replaced it. Add a short
lookup order to `SKILL.md`:

1. Project: `npx nx show projects --type=app`. If there is exactly one (`test`
   today), use it.
2. Feature: list the folders under `<sourceRoot>` and pick one from context. If
   none fits, create one with the feature generator. **Exclude `app/`.** It
   exists in every Angular app (`apps/test/src/app`) and passes
   `assertFeatureExists`, so `--feature=app` would quietly generate into
   `src/app/components/…`.
3. Ask the user only if it is still ambiguous.

Also say what failure looks like now that the generators throw:
`Feature "x" does not exist.` means run the feature generator first.
`Feature "x" already exists.` means reuse it.

### R6. "Do NOT hand-write the files" is too absolute

The generators cover features, pages, components, dialogs, services, pipes and
directives only. Guards, resolvers, interceptors, models/interfaces, `*.routes`
edits, and code inside `libs/` have no generator. The description says "Use
whenever you are about to create a new .ts … Angular file" and the body says "Do
NOT … hand-write". Together they push the agent to force-fit things (for
example, a guard as a "service") or to stall.

**Fix:** add one line: "If no generator covers the artifact, write it by hand
following the layout below, and say so to the user."

## Minor issues

- **`npx nx` vs `nx`:** only `create-component.md` uses `npx nx`. The other five
  references use bare `nx`, which is not on `PATH` unless Nx is installed
  globally.
- **Still a lot of duplication:** each reference repeats the same Key
  Principles, dry run and run steps, and differs only in the generator name and
  the `--feature` flag. A single table in `SKILL.md` (as suggested in review 1)
  would let the agent work without a second file read. Keep a reference file
  only for `component` (because of `--type` and `--translations`) and `feature`
  (because of wiring).
- **Vague dry-run check:** "If files are created in the wrong location, adjust
  your options" doesn't say what correct looks like. Say: expect `CREATE` lines
  under `<sourceRoot>/<feature>/<type-folder>/<kebab-name>/`, plus
  `UPDATE <feature>.routes.ts` for pages.
- **`--type=page` on the component generator:** the schema allows it, but it
  skips route registration. Say "use the page generator for pages, never
  `component --type=page`".
- **Layout section:** "Features live inside `<projectRoot>/src/`" is really the
  project's `sourceRoot`. Also, the line about libraries in `libs/` suggests the
  generators work for libraries, but the description says applications only.
  Make this consistent.
- **Storybook:** components get a `.stories.ts` that imports
  `@storybook/angular`, which is not installed. It didn't cause an error in my
  run (the transloco error came first), so I haven't verified whether it breaks
  anything. Agents may still try to "fix" it. Either install it or mention it.
- **Grammar:** "Do NOT use `nx g @nx/angular:*`, `ng generate`, or hand-writing
  the files." should be "…or hand-write the files". Also, "convert to a
  kebab-case" should be "convert to kebab-case".
- **Leftover schemas (from review 1, not fixed):** `pipe-schema.json` and
  `directive-schema.json` still say `"$id": "Service"` and "Name of a new
  service". Agents that run `--help` see the wrong text.
- **`skill-review.md`** marks every item ✅. C1 (the project-name part), I2
  (wiring) and I3 (the transloco dependency) are only partly done.

## Priority

| #  | Change                                                                                  | Where             | Effort |
| -- | --------------------------------------------------------------------------------------- | ----------------- | ------ |
| R1 | Regenerate `.claude/skills` / `.agents/skills`; guard against drift                     | workflow          | XS     |
| R2 | Stop forcing transloco on pages, or document the dependency                             | generator / skill | S      |
| R4 | Tell the agent to wire new features into `app.routes.ts`, with a snippet                | skill             | XS     |
| R3 | Exact project name; explain why kebab matters; normalise in `page.ts`                   | skill + generator | XS     |
| R5 | Add the project/feature lookup order (exclude `app/`) and the error meanings            | skill             | XS     |
| R6 | Add a fallback for artifacts without a generator                                        | skill             | XS     |
| —  | `npx` everywhere, merge the references into a table, clearer dry-run check, minor fixes | skill             | S      |
