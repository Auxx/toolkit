---
name: workspace
description: |
  How this Nx monorepo is organised and how to explore it. Use BEFORE writing
  or changing code in this workspace: to find which project/feature owns
  something, where a new file should go, how projects depend on each other,
  or which lint/test/build targets to run. Use instead of guessing paths or
  browsing directories blindly.
---

This is a monorepo workspace managed by NX. It is composed of multiple
application and library projects, each with its own set of files and
dependencies. Use this skill to navigate and explore the workspace and
understand how the projects are organised and interconnected.

## List all projects

Use `npx nx show projects` command to list all projects in the workspace. It
returns all projects, both application and library, as a list in JSON format.

Example output:

```json
["toolkit-nx","test","@toolkit/source"]
```

This example output indicates that there are three projects in the workspace:
`toolkit-nx`, `test`, and `@toolkit/source`. Note that a project with a name
format `@<workspace>/source` matches the package name in `package.json` - this
is a root project, ignore it.

The list of projects will change over time depending on the requirements and
implementation details.

The list can be additionally filtered by project type using the `--type` option
which accepts `app` for applications and `lib` for libraries. For example, to
list only application projects, use the following command:

```shell
npx nx show projects --type app
```

It is also possible to list only projects that were affected by the code changes
using the `--affected` option. For example:

```shell
npx nx show projects --affected
```

## Workspace dependency graph

To visualise the dependency graph of the workspace, use the
`npx nx graph --print` command.

## Get project details

To get details about a specific project, use the
`npx nx show project <project-name> --web=false` command. Replace
`<project-name>` with the name of the project you want to explore. This command
will display information about the project, including its location inside the
workspace, dependencies, targets, and more.

Example output:

```json
{
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "name": "toolkit-nx",
  "root": "libs/toolkit-nx",
  "sourceRoot": "libs/toolkit-nx/src",
  "projectType": "library",
  "targets": {
    "lint": { ... },
    "test": { ... },
    "nx-release-publish": { ... },
    "build": { ... }
  },
  "tags": ["npm:public"],
  "implicitDependencies": []
}
```

`root` element indicates the root directory of the project within the workspace.

`sourceRoot` element indicates the root directory of the source files of the
project within the workspace.

`targets` element indicates the list of targets that can be executed for the
project. Each target is associated with a specific task or action that can be
performed on the project, such as linting, testing, building, or publishing.
There are four targets in the example output: `lint`, `test`,
`nx-release-publish`, and `build`.

`implicitDependencies` element indicates the list of projects that the specific
project depends on. This is NOT a list of third-party dependencies. Third-party
dependencies are specified in `package.json`.

Different projects will have different properties listed based on their type,
configuration, and technology used.

## Performing target tasks

### Running targets for a single project

NX target task runner is using the following syntax:

```shell
npx nx run <project-name>:<target-name>
```

For example, to run the `lint` target for the `toolkit-nx` project, you would
use the following command:

```shell
npx nx run toolkit-nx:lint
```

### Running targets for all projects

Use `run-many` to run targets for all projects using the following syntax:

```shell
npx nx run-many -t <target-name>
```

For example, to run the `lint` target for all projects, you would use the
following command:

```shell
npx nx run-many -t lint
```

It is also possible to run multiple targets, pass them as a comma-separated
list:

```shell
npx nx run-many -t lint,test
```

### Running targets only for affected projects

To run specific targets only for projects which have code changes, use the
following syntax:

```shell
npx nx affected -t <target-name>
```

For example, to run the `lint` target for all projects affected by changes, you
would use the following command:

```shell
npx nx affected -t lint
```

## Angular project structure

Some projects in this workspace are Angular projects. They can be either an
Angular application or an Angular library. To detect if a project is an Angular
project, get project details from NX.

Angular projects have `targets.build.executor` property set and it contains word
`angular`. For example, `@angular/build:application` or
`@angular-devkit/build-angular:browser`.

Angular projects are split into features, which contain artefacts like
components and services. Features might also contain routing configuration. That
applies both to Angular applications and Angular libraries. Here is the
directory layout of a feature:

```text
<sourceRoot>/
├── <feature-name>/
│   ├── components/
│   │   ├── <component-name>/
│   │   │   ├── <component-name>.component.ts
│   │   │   ├── <component-name>.component.html
│   │   │   ├── <component-name>.component.scss
│   │   │   ├── <component-name>.component.stories.ts
│   │   │   └── <component-name>.component.spec.ts
│   ├── dialogs/
│   │   ├── <dialog-name>/
│   │   │   ├── <dialog-name>.dialog.ts
│   │   │   ├── <dialog-name>.dialog.html
│   │   │   ├── <dialog-name>.dialog.scss
│   │   │   ├── <dialog-name>.dialog.stories.ts
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
│   │   │   ├── <page-name>.page.stories.ts
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

Folder `<sourceRoot>/app` is a feature called `app`. This is a non-standard
approach to Angular projects.

In addition to components, dialogs, directives, pages, pipes, and services,
there can also be other types of artefacts like guards and interceptors, they
should follow a similar folder structure. Any type of artefact can be absent in
a specific feature.

## Exploration workflow

1. `npx nx show projects --type app` / `--type lib` to find candidate projects.
   Ignore the root project which matches the package name specified in
   `package.json`.
2. `npx nx show project <project>` to get `root`, `sourceRoot` and the target
   executors (this also tells you whether the project is Angular).
3. List `<sourceRoot>` to see which features exist. Reuse an existing feature
   before creating a new one.
4. Read one or two existing artefacts of the same type in that feature (and
   `<feature>.routes.ts`, and `app.routes.ts` for how features are wired in).
   Match their conventions.
5. Check dependencies with `npx nx graph --print` (and `tsconfig.base.json`
   paths for library import aliases) before importing across projects.
6. To create artefacts, hand over to the `toolkit-nx` skill.
