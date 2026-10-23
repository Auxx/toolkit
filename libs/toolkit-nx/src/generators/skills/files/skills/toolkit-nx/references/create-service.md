# create-service

Create a new Angular service.

## Key Principles

- **Always use `--no-interactive`** - Prevents prompts that would hang execution
- Angular service generator is invoked using
  `npx nx g @hexmode/toolkit-nx:service` followed by required arguments.
- All services should be part of features inside the project, and a feature must
  exist before running the generator. If the required feature does not exist,
  run the feature generator first.

## Steps

### 1. Generator arguments

- Project name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--project` argument)
- Feature name: must be a non-empty string (convert to a kebab-case and pass to
  generator as `--feature` argument)
- New service name: must be a non-empty string (convert to a kebab-case and pass
  to generator as `--name` argument)

### 2. Dry-Run to Verify File Placement

**Always run with `--dry-run` first** to verify files will be created in the
correct location:

```shell
npx nx g @hexmode/toolkit-nx:service --project=<project-name> --feature=<feature-name> --name=<service-name> --no-interactive --dry-run
```

Check the output as described in [Dry run](../SKILL.md#dry-run). Expect `CREATE`
lines for `<name>.service.ts` and `<name>.service.spec.ts` in
`<feature>/services/<name>/`, and no `UPDATE` lines.

### 3. Run the Generator

Execute the generator:

```shell
npx nx g @hexmode/toolkit-nx:service --project=<project-name> --feature=<feature-name> --name=<service-name> --no-interactive
```
