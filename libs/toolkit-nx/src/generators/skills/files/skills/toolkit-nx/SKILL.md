---
name: toolkit-nx
description: |
  Required workflow for adding ANY new Angular artefact (feature, page, component,
  dialog, service, pipe, directive) to an Angular application or library in
  this Nx workspace,
  using the @hexmode/toolkit-nx generators. Use whenever you are about to create a
  new .ts/.html/.scss Angular file, whether the user asked for it directly
  ("add a component", "create a service") or it is a step in a larger task
  ("build a settings screen", "add an orders feature"). Use instead of
  `nx g @nx/angular:*`, and `ng generate`, or hand-writing the files.
---

`@hexmode/toolkit-nx` contains a set of code generators, which help scaffold new
components, features, pages, dialogs, pipes, directives, and services. They
ensure consistency across the codebase and reduce boilerplate work. These code
generators SHOULD be used every time a new Angular artefact needs to be created.

Do NOT use `nx g @nx/angular:*`, `ng generate`.

# Using @hexmode/toolkit-nx generators

## Run the correct generator

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

## Translations

Components, dialogs and pages can include Transloco boilerplate with
`--translations=true`. It requires `@jsverse/transloco` to be installed and
configured; read [translations.md](references/translations.md) before using it.

## Storybook

Components, dialogs and pages get a `.stories.ts` file only with
`--storybook=true`. It requires `storybook` and `@storybook/angular` to be
installed; read [storybook.md](references/storybook.md) before using it.

## Applications and libraries

All generators work the same way in Angular applications and Angular libraries:
pass the project name as `--project`, whatever its type. The differences are in
how the result is used, not in how it is generated:

- Libraries have no `app` feature, so a new feature is not wired into any routes
  automatically. Expose it through the library's public API instead - see
  [create-feature.md](references/create-feature.md#features-in-libraries).
- Artefacts that other projects use must be exported from the library's entry
  point (usually `<sourceRoot>/index.ts`).
- Selectors use the project's `prefix` from `project.json` (`app` by default,
  often `lib` in libraries).

Generators place files according to the feature layout described in the "Angular
project structure" section of the `workspace` skill. Use it to check the
`--dry-run` output before running a generator for real.

## After generating

Generated code is only a starting point. Continue with the
`development-workflow` skill to implement the requested functionality, verify,
and format the code.
