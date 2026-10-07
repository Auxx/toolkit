# create-pipe

Create a new Angular pipe.

## Key Principles

- **Always use `--no-interactive`** - Prevents prompts that would hang
   execution
- Angular pipe generator is invoked using `nx g @hexmode/toolkit-nx:pipe`
   followed by required arguments

## Steps

### 1. Verify user input

A user must specify the following:

- Project name: must be a non-empty string (convert to camel case and pass to
  generator as `--project` argument)
- Feature name: must be a non-empty string (convert to camel case and pass to
  generator as `--feature` argument)
- New pipe name: must be a non-empty string (convert to camel case and pass to
  generator as `--name` argument)

### 2. Dry-Run to Verify File Placement

**Always run with `--dry-run` first** to verify files will be created in the
correct location:

```shell
nx g @hexmode/toolkit-nx:pipe --project=<project-name> --feature=<feature-name> --name=<pipe-name> --no-interactive --dry-run
```

Review the output carefully. If files would be created in the wrong location,
adjust your options.

### 3. Run the Generator

Execute the generator:

```shell
nx g @hexmode/toolkit-nx:pipe --project=<project-name> --feature=<feature-name> --name=<pipe-name> --no-interactive
```

### 4. Modify Generated Code (If Needed)

Pipe generator provides a starting point. Modify the output as needed to:

- Add or modify functionality as requested
- Adjust imports, exports, or configurations
- Integrate with existing code patterns

**Important:** If you replace or delete generated test files (e.g.,
`*.spec.ts`), either write meaningful replacement tests or remove the `test`
target from the project configuration. Empty test suites will cause `nx test` to
fail.

### 5. Format and Verify

Format all generated/modified files:

```shell
npm run format
```

Then verify the generated code works. Keep in mind that the changes you make
with a generator or subsequent modifications might impact various projects so
it's usually not enough to only run targets for the artifact you just created.

```shell
npm run lint
npm run test
```

If verification fails with manageable issues (a few lint errors, minor type
issues), fix them. If issues are extensive, attempt obvious fixes first, then
escalate to the user with details about what was generated, what's failing, and
what you've attempted.
