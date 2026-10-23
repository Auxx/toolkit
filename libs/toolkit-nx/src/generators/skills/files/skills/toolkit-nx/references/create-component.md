# create-component

Create a new Angular component.

## Key Principles

- **Always use `--no-interactive`** - Prevents prompts that would hang execution
- Angular component generator is invoked using
  `npx nx g @hexmode/toolkit-nx:component` followed by required arguments.
- To create a regular component, use the `--type=component` argument.
- To create a dialog component, use the `--type=dialog` argument.
- If a new component should contain any string messages which need to be
  translated, use the `--translations=true` argument, which adds boilerplate for
  the Transloco translation library. See [translations.md](translations.md) for
  the requirements.
- To add Storybook stories for a new component, use the `--storybook=true`
  argument. See [storybook.md](storybook.md) for when to use it and the
  requirements.
- All components should be part of features inside the project, and a feature
  must exist before running the generator. If the required feature does not
  exist, run the feature generator first.

## Steps

### 1. Generator arguments

- Project name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--project` argument)
- Feature name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--feature` argument)
- New component name: must be a non-empty string (convert to a kebab-case and
  pass to generator as `--name` argument)

### 2. Dry-Run to Verify File Placement

**Always run with `--dry-run` first** to verify files will be created in the
correct location:

```shell
npx nx g @hexmode/toolkit-nx:component --project=<project-name> --feature=<feature-name> --name=<component-name> --no-interactive --dry-run
```

Check the output as described in [Dry run](../SKILL.md#dry-run). Expect `CREATE`
lines for `<name>.component.ts`, `.html`, `.scss` and `.spec.ts` (`.stories.ts`
with `--storybook=true`) in `<feature>/components/<name>/` - or
`<name>.dialog.*` in `<feature>/dialogs/<name>/` with `--type=dialog` - and no
`UPDATE` lines.

Use the page generator for pages, never `component --type=page`: it creates the
page files but does not register a route.

### 3. Run the Generator

Execute the generator:

```shell
npx nx g @hexmode/toolkit-nx:component --project=<project-name> --feature=<feature-name> --name=<component-name> --no-interactive
```
