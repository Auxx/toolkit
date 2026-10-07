---
name: toolkit-nx
description: |
  Required workflow for adding ANY new Angular artifact (feature, page, component,
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
generators SHOULD be used every time a new component, feature, page, or service
needs to be created.

# Using @hexmode/toolkit-nx generators

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
