# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

When you make a change that should be released, add a changeset:

```bash
pnpm changeset
```

Pick the affected packages and a bump type (patch/minor/major) and write a short
summary. On merge to `main`, the release workflow opens a "Version Packages" PR;
merging that publishes the updated packages to npm with provenance.
