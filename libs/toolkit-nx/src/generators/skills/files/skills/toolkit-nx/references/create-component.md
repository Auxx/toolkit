# create-component

Create a new Angular component.

## Key Principles

- **Always use `--no-interactive`** - Prevents prompts that would hang execution
- Angular component generator is invoked using
  `npx nx g @hexmode/toolkit-nx:component` followed by required arguments.
- To create a regular component, use the `--type=component` argument.
- To create a dialog component, use the `--type=dialog` argument.
- If a new component should contain any string messages which need to be
  translated, use the `--translations=true` argument, that will add boilerplate
  for a Transloco translation library.
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

Review the output carefully. If files are created in the wrong location, adjust
your options.

### 3. Run the Generator

Execute the generator:

```shell
npx nx g @hexmode/toolkit-nx:component --project=<project-name> --feature=<feature-name> --name=<component-name> --no-interactive
```
