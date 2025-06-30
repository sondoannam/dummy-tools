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
- `-s, --skip <name>`: Directory name to skip (can be used multiple times)
- `-n, --no-interactive`: Disable interactive prompts for directories

Use `la` as the level to display all levels:

```bash
dummie strucview --level la
```

Example with skip option:

```bash
# Skip both 'node_modules' and 'dist' directories
dummie strucview --skip node_modules --skip dist

# Shorthand version
dummie strucview -s node_modules -s dist
```

By default, you'll be prompted interactively for each common directory (node_modules, .git, etc.) and any directories you choose to skip will be completely excluded from the output:

```
Skip directory "node_modules"? (y/n): y
Skip directory ".git"? (y/n): y
```

If you want to disable the interactive prompts:

```bash
# Disable interactive prompts
dummie strucview --no-interactive

# Shorthand version
dummie strucview -n
```

Example output:

```
face-recognition-server
├── __pycache__
│   ├── api.cpython-312.pyc
│   ├── db.cpython-312.pyc
│   ├── main.cpython-312.pyc
    └── ws.cpython-312.pyc
├── .git
│   └── [...]
├── static
│   ├── index.html
│   ├── script.js
    └── style.css
├── test-app
│   ├── .github
│   │   └── [...]
│   ├── node_modules
│   │   └── [...]
│   ├── public
│   │   └── [...]
    └── src
├── tests
│   ├── __pycache__
│   ├── images
    └── test_main.py
├── venv
│   ├── Include
│   ├── Lib
│   ├── Scripts
    └── pyvenv.cfg
├── .env
├── .gitignore
├── api.py
├── db.py
├── main.py
├── README.md
├── requirements.txt
└── ws.py
```

The tool automatically collapses large directories and shows a directory-first structure, making it easy to understand project layouts.

### translate

Translate text between languages using Google Translate API with a Puppeteer fallback mechanism.

```bash
dummie translate <text> [options]
```

Options:
- `-f, --from <lang>`: Source language code (default: "en")
- `-t, --to <lang>`: Target language code (default: "vi")

Examples:

```bash
# From French to English
dummie translate "Bonjour le monde" --from fr --to en
# Output: Hello world

# From English to French
dummie translate "Hello, how are you today?" --from en --to fr
# Output: Bonjour, comment vas-tu aujourd'hui?

# From Vietnamese to English
dummie translate "Vô lý" --from vi --to en
# Output: Unreasonable
```

The translation feature uses a reliable HTTP API first and falls back to a browser-based method if the API fails, ensuring robust translations even during API limitations.

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

Example output:

```
Detecting browsers for translation feature...
✅ Found Chrome at: C:/Program Files/Google/Chrome/Application/chrome.exe

To use this browser for translations, set the CHROME_PATH environment variable:

setx CHROME_PATH "C:/Program Files/Google/Chrome/Application/chrome.exe"
```

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

## Issues

Feel free to open issues for this pkg.

## License

MIT © [Doan Nam Son](https://github.com/sondoannam)
