---
name: toolkit-nx
description: |
  Required workflow for adding ANY new Angular artefact (feature, page, component,
  dialog, service, pipe, directive) to an application in this Nx workspace,
  using the @hexmode/toolkit-nx generators. Use whenever you are about to create a
  new .ts/.html/.scss Angular file, whether the user asked for it directly
  ("add a component", "create a service") or it is a step in a larger task
  ("build a settings screen", "add an orders feature"). Use instead of
  `nx g @nx/angular:*`, `ng generate`, or hand-writing the files.
---

`@hexmode/toolkit-nx` contains a set of code generators, which help scaffold new
components, features, pages, dialogs, pipes, directives, and services. They
ensure consistency across the codebase and reduce boilerplate work. These code
generators SHOULD be used every time a new Angular artefact needs to be created.

# Using @hexmode/toolkit-nx generators

## 1. Run the correct generator first

- To create a new component or dialog, read
  [create-component.md](references/create-component.md)
- To create a new feature, read
  [create-feature.md](references/create-feature.md)
- To create a new page, read [create-page.md](references/create-page.md)
- To create a new pipe, read [create-pipe.md](references/create-pipe.md)
- To create a new directive, read
  [create-directive.md](references/create-directive.md)
- To create a new service, read
  [create-service.md](references/create-service.md)

## 2. Modify Generated Code (If Needed)

Code generator provides a starting point. Modify the output as needed to:

- Add or modify functionality as requested.
- Adjust imports, exports, or configurations.
- Integrate with existing code patterns.

## 3. Verify Code Changes

Verify that the new code works. Keep in mind that the changes you make with a
generator or subsequent modifications might impact various projects inside the
workspace, so it's usually not enough to only run targets for the artefact you
just created.

### Lint the code

Run the following command to lint (perform static code analysis) the code:

```shell
npm run lint
```

### Run unit tests

Run the following command to test the code:

```shell
npm run test
```

If verification fails with manageable issues (a few lint errors, minor type
issues), fix them. If issues are extensive, attempt obvious fixes first, then
escalate to the user with details about what was generated, what's failing, and
what you've attempted.

## 4. Format The Code

Once the code is ready, verified, and tested, run a code formatter:

```shell
npm run format
```
