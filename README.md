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

## Features

- Directory-first sorting in tree views
- Automatic collapsing of large directories like node_modules
- Customizable depth for directory traversal

## License

MIT © [Doan Nam Son](https://github.com/sondoannam)
