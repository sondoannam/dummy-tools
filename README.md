# Dummie Tools

A collection of useful command-line utilities built with TypeScript.

## Installation

```bash
npm install -g dummie-tools
```

Or you can use it directly with npx:

```bash
npx dummie-tools [command] [options]
```

## Commands

### strucview

Display a directory tree structure with customizable depth.

```bash
dummie strucview [options]
```

Options:

- `-l, --level <n>`: Maximum depth level to display (default: "3")
- `-d, --dir <path>`: Directory to scan (default: ".")

Use `la` as the level to display all levels:

```bash
dummie strucview --level la
```

### translate

Translate text between languages using Google Translate API with a Puppeteer fallback mechanism.

```bash
dummie translate <text> [options]
```

Options:
- `-f, --from <lang>`: Source language code (default: "auto")
- `-t, --to <lang>`: Target language code (default: "en")

Example:
```bash
dummie translate "Bonjour le monde" --from fr --to en
```

### info

Display information about your system and environment.

```bash
dummie info
```

This command shows:
- Current dummie-tools version
- Node.js version
- Operating system details
- NPM version
- Installation location

### version-check

Check if you're running the latest version of dummie-tools.

```bash
dummie version-check
```

### browser-detect

Detect browser installations for the translation feature.

```bash
dummie browser-detect
```

This command helps you configure the Chrome browser path for the translation feature's fallback mechanism. It will scan common installation locations and provide instructions for setting the `CHROME_PATH` environment variable.

## Global Options

These options are available with all commands:

- `-d, --debug`: Enable debug mode
- `-q, --quiet`: Suppress output
- `-V, --version`: Output the version number
- `-h, --help`: Display help information

## Features

- Directory-first sorting in tree views
- Automatic collapsing of large directories like node_modules
- Customizable depth for directory traversal
- Text translation with fallback mechanism
- System diagnostics and version checking

## License

MIT © [Doan Nam Son](https://github.com/sondoannam)
