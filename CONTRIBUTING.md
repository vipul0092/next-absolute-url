# Contributing

Contributions are welcome! Please open an issue before submitting a pull request for non-trivial changes.

## Prerequisites

This project uses [mise](https://mise.jdx.dev) to manage the Node.js and pnpm versions. Install it first:

```bash
# macOS / Linux
curl https://mise.run | sh
```

## Setup

```bash
git clone https://github.com/vipul0092/next-absolute-url.git
cd next-absolute-url

# Install the correct Node.js and pnpm versions
mise install

# Install dependencies
pnpm install
```

## Workflow

```bash
# Run tests
pnpm test

# Type-check
pnpm exec tsc --noEmit

# Lint
pnpm lint

# Build
pnpm build
```

All of the above must pass before opening a pull request. You can run tests and lint together with:

```bash
pnpm verify
```

## Guidelines

- Keep changes focused — one concern per pull request.
- Add or update tests for any changed behaviour.
- **Add a changeset** for every user-facing change — run `pnpm changeset`, pick a semver bump (`patch` / `minor` / `major`), and write a short description. This is required before merging.
- Do not bump the version manually — that is handled by the release process.

## Release process (maintainers)

1. Merge all pull requests with their changeset files.
2. Run `pnpm bump` to consume changesets, bump `package.json`, and generate `CHANGELOG.md`.
3. Verify the build and publish output look correct with a dry run:
   ```bash
   pnpm release:dry
   ```
4. Commit the changes
5. `npm adduser`
4. Publish to npm:
   ```bash
   NPM_TOKEN={token} pnpm release
   ```
5. `git push origin master --tags`
