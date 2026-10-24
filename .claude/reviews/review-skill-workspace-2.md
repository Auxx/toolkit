# Review: `workspace` skill (#2)

Source: `libs/toolkit-nx/src/generators/skills/files/workspace/SKILL.md`
(identical to the generated `.claude/skills/workspace/SKILL.md`).

Previous review: `.claude/reviews/review-skill-workspace-1.md`.

## Verdict

The skill is much better than before and now mostly fulfils its purpose. The
description has clear triggers, there is an exploration workflow that hands over
to `toolkit-nx`, the command examples match what an agent sees without a TTY,
and the missing commands have been added. `skills.spec.ts` is fixed.

What is left is mostly about order and precision:

1. The exploration workflow is the last section. An agent reads 200 lines of
   reference material before reaching the procedure the skill exists for.
2. Two statements are still wrong or misleading: `implicitDependencies` is
   described as "the list of projects that the specific project depends on", and
   `nx graph --print` is said to "visualise" the graph.
3. Angular detection relies on a `build` target. Non-buildable Angular libraries
   don't have one.
4. Some items from review #1 were not addressed: generic project names,
   `apps/`/`libs/`, the `<sourceRoot>` mismatch in `toolkit-nx`, and the library
   public API.

## Status of review #1 findings

| # | Finding                                  | Status                                                                                                                           |
| - | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Description won't trigger                | **Fixed.**                                                                                                                       |
| 2 | No exploration workflow                  | **Fixed**, but placed at the end (see issue 1).                                                                                  |
| 3 | Examples don't match non-TTY output      | **Mostly fixed.** JSON is documented and the root project is explained. Names are still specific to this repo (see issue 6).     |
| 4 | Angular detection via `project.json`     | **Fixed.** Now uses `nx show project`. The `build`-only rule is new trouble (see issue 4).                                       |
| 5 | Missing commands                         | **Fixed.** `--type`, `--affected`, `run-many`, `affected` and `graph --print` added. `--with-target` was left out (see issue 8). |
| 6 | Tree connectors, `app/`, `apps/`/`libs/` | **Partly.** Connectors and wording fixed, `app/` mentioned. `apps/`/`libs/` still absent.                                        |
| 7 | Inconsistent with `toolkit-nx`           | **Not fixed.** `toolkit-nx` still says `<projectRoot>/src/<feature>`.                                                            |
| 8 | Other artefacts (guards, interceptors)   | **Partly.** "Similar folder structure" is mentioned, but not the exact path or that no generator exists.                         |
| 9 | Libraries                                | **Partly.** The layout now applies to libraries too. Public API (`src/index.ts`) not mentioned.                                  |
| — | `skills.spec.ts` failing                 | **Fixed.** Expects 2 skills and checks `workspace/SKILL.md` in both targets.                                                     |

## What was verified

All commands were run against this workspace (Nx, non-TTY shell, as an agent
runs them):

| Claim in skill                                               | Result                                                                                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nx show projects` prints a JSON list                        | Correct: `["toolkit-nx","test","@toolkit/source"]`.                                                                                                                            |
| `--type app` / `--type lib`                                  | Correct, but `--type app` **also returns `@toolkit/source`**: `["test","@toolkit/source"]`.                                                                                    |
| `--affected`                                                 | Correct. Compared against `defaultBase` (`master` in `nx.json`).                                                                                                               |
| `nx show project <p> --web=false` prints the JSON shown      | Keys are correct (`$schema`, `root`, `sourceRoot`, `projectType`, `targets`, `tags`, `implicitDependencies`, plus `metadata`, `release`). Real output is minified on one line. |
| `implicitDependencies` = projects this project depends on    | **Misleading.** Only the manually declared ones. Real dependencies come from `nx graph --print`.                                                                               |
| `nx graph --print` "visualises" the graph                    | It prints JSON: `{"graph":{"nodes":{…},"dependencies":{…}}}`. 9 KB for 3 projects, because `nodes` includes every target's full config.                                        |
| `run-many -t lint,test`                                      | Correct.                                                                                                                                                                       |
| Angular `build` executors contain `angular`                  | Correct for `test`: `@angular/build:application`. Its `test` target is `@angular/build:unit-test`.                                                                             |
| Feature layout under `<sourceRoot>/<feature>/<type>/<name>/` | Correct. Matches `featurePath()` / `getComponentFolder()`.                                                                                                                     |
| `<sourceRoot>/app` is a feature                              | Partly. It holds `app.ts`, `app.html`, `app.config.ts`, `app.routes.ts` (exports `appRoutes`), which don't follow the artefact layout.                                         |

## Issues

### 1. Put the workflow first (high)

The skill's purpose is "how to explore before writing code". The procedure for
that is in the last section. The rest of the file is reference material
supporting the workflow. Agents tend to act on what they read first and skim the
rest.

Move "Exploration workflow" right after the intro paragraph. Link each step to
the section that explains it, e.g. "2. Get project details (see
[Get project details](#get-project-details))". Then the rest of the file reads
as a reference.

### 2. `implicitDependencies` description is wrong (medium)

> `implicitDependencies` element indicates the list of projects that the
> specific project depends on.

This was flagged in review #1. An agent that sees `[]` will conclude the project
has no dependencies. Nx builds most dependencies from imports and
`package.json`, and they don't appear here. Suggested:

> `implicitDependencies` lists only dependencies declared manually in the
> project configuration. It is usually empty. Do not use it to find what a
> project depends on; use `npx nx graph --print` instead (see below).

### 3. `nx graph --print` needs explaining (medium)

"To visualise the dependency graph" suggests a picture. With `--print` it prints
JSON, and most of it is target configuration the agent doesn't need. In a real
workspace with dozens of projects it is a very large blob. Say what to look at:

````markdown
## Workspace dependency graph

`npx nx graph --print` prints the project graph as JSON. The part that matters
is `graph.dependencies`: a map from each project name to the projects it
depends on (`[{ "source": "a", "target": "b", "type": "static" }]`). Ignore
`graph.nodes`, which repeats every project's full configuration.

To print only the dependencies:

```shell
npx nx graph --print | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0)).graph.dependencies, null, 2))"
```
````

(`jq '.graph.dependencies'` is shorter, but `jq` isn't guaranteed to be
installed. `node` always is in an Nx workspace.)

Do the same for `nx show project`. The real output is a single minified line
that contains `inputs`, `options`, etc. for every target. Tell the agent which
keys to read, and show `executor` inside `targets` in the example: the Angular
detection rule depends on it, but the example elides it as `{ ... }`.

### 4. Angular detection should not require a `build` target (medium)

> Angular projects have `targets.build.executor` property set and it contains
> word `angular`.

Nx generates non-buildable Angular libraries by default, and those have no
`build` target. Following this rule, an agent would conclude such a library is
not Angular. Make the rule: "any target executor contains `angular` (e.g.
`build`: `@angular/build:application`, `@nx/angular:package`; `test`:
`@angular/build:unit-test`)". Add a fallback: `@angular/core` imports in
`<sourceRoot>`.

### 5. Root project wording (low)

- `--type app` also returns the root project (verified). The ignore note sits
  under the plain `nx show projects` example, so add "it also shows up in
  `--type app`".
- "a project with a name format `@<workspace>/source` matches the package name
  in `package.json`" mixes two ideas. A more robust rule: "the project whose
  `root` is `.` is the workspace root project. It has no targets. Ignore it."
  (verified: `root: "."`, no targets). That works in workspaces where the
  package name isn't `@x/source`.

### 6. Repo-specific names in a published skill (low)

This file ships in `@hexmode/toolkit-nx` and is generated into consumer
workspaces. `toolkit-nx`, `test` and `@toolkit/source` won't exist there, and
`npx nx run toolkit-nx:lint` will fail when copied. Use placeholders like
`["my-app","shared-ui","@my-org/source"]` and `npx nx run my-app:lint`, which
the agent clearly can't copy literally. Same for the `show project` example
(`libs/toolkit-nx`, `npm:public`, `nx-release-publish`).

### 7. `app/` folder: say what it is and what to do with it (low)

> Folder `<sourceRoot>/app` is a feature called `app`. This is a non-standard
> approach to Angular projects.

The second sentence gives the agent nothing to act on. What it needs to know:

- `app/` is the application shell: `app.ts` (root component), `app.config.ts`
  (providers), `app.routes.ts` (root routes).
- Features are siblings of `app/`, not inside it.
- The feature generator creates `<feature>.routes.ts`, which exports `routes`,
  but does **not** register it. The agent has to lazy-load it from
  `app.routes.ts` by hand
  (`loadChildren: () => import('../orders/orders.routes').then(m => m.routes)`).
  Workflow step 4 hints at this; spell it out.
- Whether app-wide artefacts may go in `app/components/…` etc. (generators allow
  `--feature app`).

### 8. Smaller gaps (low)

- **Verification.** The workflow ends at "hand over to `toolkit-nx`", which
  verifies with `npm run lint` / `npm run test` (= `run-many --all`). This skill
  documents `nx run`, `run-many` and `affected` without saying which one to use
  when. Add a final step: "After changes, run `npx nx affected -t lint,test` (or
  the project's own targets with `nx run`)." Or point to the `npm` scripts so
  both skills agree.
- **`--affected` base.** It compares against `defaultBase` in `nx.json`. On the
  default branch with a clean tree it returns nothing. Mention `--base=<ref>`
  (and that uncommitted changes are included).
- **`--with-target <t>`** (from review #1) is still useful, e.g.
  `npx nx show projects --with-target test` to find what can be tested.
  Verified: `["toolkit-nx","test"]`.
- **Libraries.** Say how a library exposes code: `<root>/src/index.ts` is its
  public API, and other projects import it by the alias in `tsconfig.base.json`
  `paths`, never by relative path. Step 5 touches on this; the reference part
  doesn't.
- **Other artefacts.** Instead of "similar folder structure", give the path
  (`<feature>/guards/<name>/<name>.guard.ts`, `.spec.ts` next to it) and say
  there is no generator, so these are written by hand.
- **`apps/` / `libs/`.** Still only in `toolkit-nx`. One sentence here would do,
  though `root` from `nx show project` is the reliable source anyway.
- **Consistency.** Step 2 runs `nx show project <project>` without
  `--web=false`; the section uses it. Pick one (keep `--web=false`, it is
  harmless and guarantees no browser opens). "NX" → "Nx".

## Related finding outside the skill text

`toolkit-nx` `SKILL.md` "Layout of generated code" still says features live in
`<projectRoot>/src/<feature>`. The generators use `sourceRoot`. It also repeats
the whole layout that this skill now owns. Replace that section with "See the
`workspace` skill for the project and feature layout", so the two can't drift
apart. Its description also says "to an application", but the generators don't
check `projectType` and work for libraries too.

## Summary of recommended changes

1. Move the exploration workflow to the top and link its steps to the reference
   sections. Add a final verification step.
2. Fix the `implicitDependencies` description and point to the graph instead.
3. Explain `nx graph --print` output (`graph.dependencies`) and how to extract
   it. Show `executor` in the `show project` example.
4. Detect Angular from any target's executor, not only `build`.
5. Identify the root project by `root: "."`. Note that it appears in
   `--type app`.
6. Use placeholder project names.
7. Explain `app/` as the shell and how feature routes are wired in.
8. Add `--with-target`, `--base`, library public API, guard/interceptor paths.
9. Remove the duplicated layout from `toolkit-nx` and point it at this skill.
