---
title: Documentation
---

# Contributing to documentation

The documentation is kept in one Docusaurus site under `docs/`.

## Add a package page

Create a Markdown file under the matching package folder:

```text
docs/docs/packages/<package-name>/<page-name>.md
```

Then add the new document id to `docs/sidebars.ts`.

## Recommended package docs

Each package should eventually include:

- Overview and installation
- Angular module or TypeScript import setup
- Common usage examples
- Configuration reference
- API notes
- Local development and testing notes

## Run locally

```bash
npm run docs
```

## Build before publishing

```bash
npm run docs:build
```
