---
name: workspace
description: |
  Workspace structure and exploration skill.
  Use to understand the structure of a workspace, and explore its projects.
---

This is a monorepo workspace managed by NX. It is composed of multiple
application and library projects, each with its own set of files and
dependencies. Use this skill to navigate and explore the workspace and
understand how the projects are organised and interconnected.

## List all projects

Use `npx nx show projects` command to list all projects in the workspace. It
returns all projects, both application and library, as a list.

Example output:

```
toolkit-nx
test
```

This example output indicates that there are two projects in the workspace:
`toolkit-nx` and `test`.

## Get project details

To get details about a specific project, use the
`npx nx show project <project-name> --web=false` command. Replace
`<project-name>` with the name of the project you want to explore. This command
will display information about the project, including its location inside the
workspace, dependencies, targets, and more.

Example output:

```
Name: toolkit-nx
Root: libs/toolkit-nx
Source Root: libs/toolkit-nx/src
Tags: npm:public
Implicit Dependencies: 
Targets: 
- lint:                eslint .                 
- test:                vitest                   
- nx-release-publish:  @nx/js:release-publish   
- build:               @nx/js:tsc
```

`Root` element indicates the root directory of the project within the workspace.

`Source Root` element indicates the root directory of the source files of the
project within the workspace.

`Targets` element indicates the list of targets that can be executed for the
project. Each target is associated with a specific task or action that can be
performed on the project, such as linting, testing, building, or publishing.
There are four targets in the example output: `lint`, `test`,
`nx-release-publish`, and `build`.

### Performing target tasks

NX target task runner is using the following syntax:

```shell
npx nx run <project-name>:<target-name>
```

For example, to run the `lint` target for the `toolkit-nx` project, you would
use the following command:

```shell
npx nx run toolkit-nx:lint
```

## Angular project structure

Some projects in this workspace are Angular projects. They can be either an
Angular application or an Angular library. To detect if a project is an Angular
project, you can look at the `project.json` file inside project `Root`
directory.

Angular projects have `targets.build.executor` property set and it contains word
`angular`. For example, `@angular/build:application` or
`@angular-devkit/build-angular:browser`.

Angular projects are split into features, which contain artefacts like
components and services. Features might also contain routing configuration. Here
is the functional directory layout and Markdown diagram for a feature:

```text
<Source Root>/
├── <feature-name>/
│   ├── components/
│   │   ├── <component-name>/ 
│   │   │   ├── <component-name>.component.ts
│   │   │   ├── <component-name>.component.html
│   │   │   ├── <component-name>.component.scss
│   │   │   └── <component-name>.component.stories.ts
│   │   │   └── <component-name>.component.spec.ts
│   ├── dialogs/
│   │   ├── <dialog-name>/ 
│   │   │   ├── <dialog-name>.dialog.ts
│   │   │   ├── <dialog-name>.dialog.html
│   │   │   ├── <dialog-name>.dialog.scss
│   │   │   └── <dialog-name>.dialog.stories.ts
│   │   │   └── <dialog-name>.dialog.spec.ts
│   ├── directives/
│   │   ├── <directive-name>/ 
│   │   │   ├── <directive-name>.directive.ts
│   │   │   └── <directive-name>.directive.spec.ts
│   ├── pages/
│   │   ├── <page-name>/ 
│   │   │   ├── <page-name>.page.ts
│   │   │   ├── <page-name>.page.html
│   │   │   ├── <page-name>.page.scss
│   │   │   └── <page-name>.page.stories.ts
│   │   │   └── <page-name>.page.spec.ts
│   ├── pipes/
│   │   ├── <pipe-name>/ 
│   │   │   ├── <pipe-name>.pipe.ts
│   │   │   └── <pipe-name>.pipe.spec.ts
│   ├── services/
│   │   ├── <service-name>/ 
│   │   │   ├── <service-name>.service.ts
│   │   │   └── <service-name>.service.spec.ts
│   └── <feature-name>.routes.ts
└── ...
```

In addition to components, dialogs, directives, pages, pipes, and services,
there can also be other types of artefacts like guards and interceptors. Any
type of artefact can be absent in a specific feature.
