# MarkItDown Node - Examples

This directory contains various usage examples for markitdown-node.

## Quick Start

This project uses **pnpm workspace**, which automatically links the local markitdown-node package to examples. No manual linking required!

### Setup

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install all dependencies (in project root)
cd markitdown-node
pnpm install

# Build the package
pnpm run build

# Run examples
cd examples
node 01-quick-start.js
```

### Development Workflow

```bash
# 1. Make changes to source code (src/*.ts)

# 2. Rebuild (in project root)
cd /path/to/markitdown-node
pnpm run build

# 3. Run examples (automatically uses latest build)
cd examples
node 01-quick-start.js
```

That's it! The workspace automatically links everything. 🎉

---

## All Examples

| File | Description |
|------|-------------|
| `00-npm-usage-template.js` | NPM usage template |
| `01-quick-start.js` | Quick start guide |
| `02-all-formats.js` | All formats demo |
| `03-docx-example.js` | Word documents |
| `04-pdf-example.js` | PDF documents |
| `05-image-example.js` | Image OCR |
| `06-excel-example.js` | Excel spreadsheets |
| `07-powerpoint-example.js` | PowerPoint presentations |
| `08-html-example.js` | HTML pages |
| `09-subtitle-example.js` | Subtitle files |
| `10-convenience-functions.js` | Convenience functions |
| `11-ocr-languages.js` | OCR multiple languages |
| `12-simplified-api-demo.js` | Simplified API |
| `13-new-formats-demo.js` | New formats demo |
| `14-bing-serp-example.js` | Bing SERP |
| `15-audio-example.js` | Audio transcription |
| `16-ipynb-example.js` | Jupyter Notebook |
| `17-csv-json-example.js` | CSV/JSON files |

---

## Test Files

All test files used by examples are in the `test-files/` directory:

```
test-files/
├── docx/          # Word documents
├── pdf/           # PDF documents
├── images/        # Image files
├── xlsx/          # Excel spreadsheets
├── pptx/          # PowerPoint presentations
├── html/          # HTML pages
├── subtitles/     # Subtitle files
├── audio/         # Audio files
├── ipynb/         # Jupyter Notebooks
├── csv/           # CSV files
├── bing-serp/     # Bing search results
└── zip/           # ZIP archives
```

Output is saved in the `output/` directory.

---

## How Workspace Works

### What is pnpm workspace?

pnpm workspace is a monorepo tool that manages multiple packages in a single repository. It automatically creates symbolic links between packages, so you don't need to manually run `npm link`.

### Advantages

- ✅ **Auto-linking** - No need for manual `npm link` commands
- ✅ **Type safety** - TypeScript works across packages
- ✅ **Faster** - Shared dependencies, less disk space
- ✅ **Simpler** - One `pnpm install` for everything
- ✅ **Reliable** - No linking issues or stale links

### Project Structure

```
markitdown-node/
├── pnpm-workspace.yaml    # Workspace configuration
├── package.json            # Main package
├── src/                    # Source code
├── dist/                   # Built output
└── examples/
    ├── package.json        # Uses "workspace:*" dependency
    └── *.js                # Example files
```

### Dependency Declaration

```json
{
  "dependencies": {
    "markitdown-node": "workspace:*"
  }
}
```

The `workspace:*` tells pnpm to link to the local package in the workspace.

---

## Troubleshooting

### Issue: Module not found

**Solution:**

```bash
# Reinstall dependencies
cd /path/to/markitdown-node
pnpm install

# Make sure you've built the package
pnpm run build
```

### Issue: Changes not taking effect

**Reason:** Package not rebuilt

**Solution:**

```bash
cd /path/to/markitdown-node
pnpm run build
```

### Issue: pnpm not installed

**Solution:**

```bash
npm install -g pnpm
```

### Issue: Want to use npm instead of pnpm?

**Note:** This project now uses pnpm workspace. While you can still use npm for individual packages, the workspace features require pnpm. We recommend using pnpm for the best development experience.

---

## Notes

1. **Always use pnpm** in this workspace, not npm or yarn
2. Run `pnpm install` in the project root, not in subdirectories
3. The workspace automatically links packages after `pnpm install`
4. After modifying source code, rebuild with `pnpm run build`
5. No need to manually link or unlink packages

---

## Technical Details

### Package.json Configuration

Supports both CommonJS and ES Modules:

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts"
}
```

### Usage

```javascript
// CommonJS
const { MarkItDown } = require('markitdown-node');

// ES Modules
import { MarkItDown } from 'markitdown-node';
```

---

## More Resources

- 📦 [npm package](https://www.npmjs.com/package/markitdown-node)
- 📖 [Main README](../README.md)
- 📘 [pnpm workspace docs](https://pnpm.io/workspaces)
- 🐛 [Report Issues](https://github.com/leoning60/markitdown-node/issues)
