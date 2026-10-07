# create-feature

Create a new feature inside an Angular application project.

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
