# create-pipe

Create a new Angular pipe.

## Key Principles

- **Always use `--no-interactive`** - Prevents prompts that would hang execution
- Angular pipe generator is invoked using `npx nx g @hexmode/toolkit-nx:pipe`
  followed by required arguments.
- All pipes should be part of features inside the project, and a feature must
  exist before running the generator. If the required feature does not exist,
  run the feature generator first.

## Steps

### 1. Generator arguments

- Project name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--project` argument)
- Feature name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--feature` argument)
- New pipe name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--name` argument)

### 2. Dry-Run to Verify File Placement

**Always run with `--dry-run` first** to verify files will be created in the
correct location:

```shell
npx nx g @hexmode/toolkit-nx:pipe --project=<project-name> --feature=<feature-name> --name=<pipe-name> --no-interactive --dry-run
```

Check the output as described in [Dry run](../SKILL.md#dry-run). Expect `CREATE`
lines for `<name>.pipe.ts` and `<name>.pipe.spec.ts` in
`<feature>/pipes/<name>/`, and no `UPDATE` lines.

### 3. Run the Generator

Execute the generator:

```shell
npx nx g @hexmode/toolkit-nx:pipe --project=<project-name> --feature=<feature-name> --name=<pipe-name> --no-interactive
```
