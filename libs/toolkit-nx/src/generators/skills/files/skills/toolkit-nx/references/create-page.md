# create-page

Create a new Angular page. Angular page is a type of Angular component designed
to display a single view or page in an application. This generator automatically
registers a new route for the page in `<feature-name>.routes.ts` (or in
`app.routes.ts` for the `app` feature) - there is no need to add it manually.
The route is inserted before the wildcard route (`path: '**'`), if there is one.
If the routes file has no array of type `Route[]` or `Routes`, the generator
fails with `No routes array of type Route[] or Routes found in "<path>".` and
creates nothing; add or restore the routes array, then run it again.

## Key Principles

- **Always use `--no-interactive`** - Prevents prompts that would hang execution
- Angular page generator is invoked using `nx g @hexmode/toolkit-nx:page`
  followed by required arguments.
- If a new page should contain any string messages which need to be translated,
  use the `--translations=true` argument, which adds boilerplate for the
  Transloco translation library. See [translations.md](translations.md) for the
  requirements.
- To add Storybook stories for a new page, use the `--storybook=true` argument.
  See [storybook.md](storybook.md) for when to use it and the requirements.
- All pages should be part of features inside the project, and a feature must
  exist before running the generator. If the required feature does not exist,
  run the feature generator first.

## Steps

### 1. Generator arguments

- Project name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--project` argument)
- Feature name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--feature` argument)
- New page name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--name` argument)

### 2. Dry-Run to Verify File Placement

**Always run with `--dry-run` first** to verify files will be created in the
correct location:

```shell
nx g @hexmode/toolkit-nx:page --project=<project-name> --feature=<feature-name> --name=<page-name> --no-interactive --dry-run
```

Review the output carefully. If files are created in the wrong location, adjust
your options.

### 3. Run the Generator

Execute the generator:

```shell
nx g @hexmode/toolkit-nx:page --project=<project-name> --feature=<feature-name> --name=<page-name> --no-interactive
```
