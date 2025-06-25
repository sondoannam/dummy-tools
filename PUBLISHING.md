# Guide to Publishing dummie-tools to NPM

This guide provides step-by-step instructions for publishing the dummie-tools package to npm.

## Prerequisites

1. You need to have an npm account. If you don't have one, create it at [https://www.npmjs.com/signup](https://www.npmjs.com/signup).
2. You need to be logged in to npm in your terminal. If you're not logged in, use:
   ```bash
   npm login
   ```
3. Verify your login status with:
   ```bash
   npm whoami
   ```

## Version Management

The project uses a versioning strategy where:
- Even minor versions (1.0.x, 1.2.x) are stable and published to npm
- Odd minor versions (1.1.x, 1.3.x) are development versions

The `version-helper.js` script helps manage this strategy with the following commands:

- `node version-helper.js status` - Shows current version status
- `node version-helper.js dev` - Bumps to next development version (odd minor)
- `node version-helper.js release` - Bumps to next release version (even minor)
- `node version-helper.js patch` - Bumps the patch version

## Publishing Process

### 1. Update Code and Documentation

Before publishing, make sure:
- All code changes are committed to the repository
- The README.md is updated with new features and commands
- All exported functions in `index.ts` are properly updated
- Any necessary type definitions are updated in `types.ts`

### 2. Check the Package Version

```bash
node version-helper.js status
```

This will show your current version and whether it's a development or release version.

### 3. Prepare for Release

If you're currently on a development version, switch to a release version:

```bash
node version-helper.js release
```

For minor patches to an existing release version:

```bash
node version-helper.js patch
```

### 4. Build the Package

Make sure all dependencies are installed:

```bash
npm install
```

Build the package for production:

```bash
npm run build
```

The build process uses a custom build script that:
- Runs tsup to bundle the code
- Ensures the CLI has the proper shebang line
- Sets proper permissions on Unix systems
- Performs validation checks

### 5. Test the Build

Test that the built package works as expected:

```bash
npm test
```

You can also test the CLI locally:

```bash
node ./dist/cli.js strucview
node ./dist/cli.js translate "Hello World" --to fr
node ./dist/cli.js info
node ./dist/cli.js version-check
node ./dist/cli.js --version
```

Verify that all commands work as expected. Pay special attention to the version output and help commands, as these are common sources of issues.

### 6. Pack the Package (Optional)

You can create a tarball to check what will be published:

```bash
npm pack
```

This will create a file like `dummie-tools-1.0.3.tgz` in your directory. You can inspect it to confirm the package contents.

### 7. Publish to NPM

After verifying everything is ready, publish to npm:

```bash
npm publish
```

If this is a scoped package or you want to publish a public scoped package:

```bash
npm publish --access public
```

### 8. Verify the Published Package

After publishing, verify that your package is available on npm:

1. Visit `https://www.npmjs.com/package/dummie-tools`
2. Check that the correct version is showing
3. Try installing it in a new directory:
   ```bash
   mkdir test-install
   cd test-install
   npm install -g dummie-tools
   dummie --help
   ```

### 9. After Publishing

1. Create a git tag for the release:
   ```bash
   git tag v1.0.3
   git push origin v1.0.3
   ```

2. Start working on the next development version:
   ```bash
   node version-helper.js dev
   ```

## Troubleshooting

### "You must be logged in to publish packages"

Run `npm login` and provide your npm credentials.

### "Package name already exists"

If the package name is taken, you need to use a different name or scope it under your username:
```json
{
  "name": "@yourusername/dummie-tools"
}
```

### "Version already exists"

If you try to publish a version that already exists, you need to update the version number in your `package.json` file. Use the version helper script to do this.

### Other issues

For other publishing issues, consult the [npm documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish).
