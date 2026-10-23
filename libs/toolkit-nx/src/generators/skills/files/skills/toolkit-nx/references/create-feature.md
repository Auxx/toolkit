# create-feature

Create a new feature inside an Angular application project. This generator
creates an empty `<feature>.routes.ts` file and wires it into the application
routes automatically - there is no need to add the route manually.

## Routing

The generator adds a lazy-loaded route to the routes array in
`<sourceRoot>/app/app.routes.ts` (the first variable of type `Route[]` or
`Routes`):

```ts
{ path: '<feature-name>', loadChildren: () => import('../<feature-name>/<feature-name>.routes').then(m => m.routes) }
```

- The route is inserted before the wildcard route (`path: '**'`), if there is
  one; otherwise it is appended.
- Pages created with the page generator are registered in `<feature>.routes.ts`,
  so they are reachable at `/<feature-name>/<page-name>`.
- If `app.routes.ts` does not exist (for example, in a library), or has no
  routes array, the generator still creates the feature and leaves routing
  unchanged. It prints
  `"<path>" does not exist. Add the routes of feature "<feature-name>" manually.`
  or `No routes array of type Route[] or Routes found in "<path>". …`. In that
  case, wire the feature into the routes the project uses yourself, following
  the snippet above, and mention it in your report.
- Change the generated route only if the task needs something else (for example,
  a different URL, a guard, or a non-lazy route).

## Key Principles

- **Always use `--no-interactive`** - Prevents prompts that would hang execution
- Feature generator is invoked using `nx g @hexmode/toolkit-nx:feature` followed
  by required arguments.
- All Angular artefacts should be part of features inside the project. Run this
  generator first if the required feature does not exist yet.

## Steps

### 1. Generator arguments

- Project name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--project` argument)
- Feature name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--name` argument)

### 2. Dry-Run to Verify File Placement

**Always run with `--dry-run` first** to verify files will be created in the
correct location:

```shell
nx g @hexmode/toolkit-nx:feature --project=<project-name> --name=<feature-name> --no-interactive --dry-run
```

Review the output carefully. If files are created in the wrong location, adjust
your options.

### 3. Run the Generator

Execute the generator:

```shell
nx g @hexmode/toolkit-nx:feature --project=<project-name> --name=<feature-name> --no-interactive
```
