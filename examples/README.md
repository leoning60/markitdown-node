# MarkItDown Node - Examples

This directory contains various usage examples for markitdown-node.

## 🚀 How to Run Examples

### Prerequisites

- Node.js installed
- pnpm installed (if not, run: `npm install -g pnpm`)

### Step-by-Step Instructions

```bash
# 1. Navigate to project root
cd markitdown-node

# 2. Install dependencies
pnpm install

# 3. Build the package
pnpm run build

# 4. Navigate to examples directory
cd examples

# 5. Run any example
node 01-quick-start.js
```

### Quick Run (if already set up)

```bash
# From project root
cd examples
node 01-quick-start.js
```

### Development Workflow

When you modify source code in `src/`, rebuild before running examples:

```bash
# From project root
pnpm run build

# Then run examples
cd examples
node 01-quick-start.js
```

> **Note:** This project uses pnpm workspace, which automatically links the local markitdown-node package to examples. No manual linking required!

---

## 📚 Available Examples

### Quick Start & Overview

| File | Description |
|------|-------------|
| `01-quick-start.js` | Quick start guide - simplest usage example |
| `02-all-formats.js` | Convert all supported formats in one run |

### Format-Specific Examples

| File | Description |
|------|-------------|
| `03-docx-example.js` | Word documents (DOCX) |
| `04-pdf-example.js` | PDF documents |
| `05-image-example.js` | Image OCR (PNG, JPEG, TIFF) |
| `06-excel-example.js` | Excel spreadsheets (XLSX) |
| `07-powerpoint-example.js` | PowerPoint presentations (PPTX) |
| `08-html-example.js` | HTML pages |
| `09-subtitle-example.js` | Subtitle files (SRT, VTT) |
| `12-bing-serp-example.js` | Bing SERP results |
| `13-ipynb-example.js` | Jupyter Notebooks |
| `14-csv-json-example.js` | CSV and JSON files |

### Advanced Features

| File | Description |
|------|-------------|
| `10-convenience-functions.js` | Using convenience functions for quick conversion |
| `11-ocr-languages.js` | OCR with multiple languages |

### Reference Template

| File | Description |
|------|-------------|
| `00-npm-usage-template.js` | **Reference template** - Code examples for npm usage (not meant to be run directly) |

---

## 📁 Directory Structure

```
examples/
├── test-files/          # Test files used by examples
│   ├── docx/           # Word documents
│   ├── pdf/            # PDF documents
│   ├── images/         # Image files
│   ├── xlsx/           # Excel spreadsheets
│   ├── pptx/           # PowerPoint presentations
│   ├── html/           # HTML pages
│   ├── subtitles/      # Subtitle files
│   ├── audio/          # Audio files
│   ├── ipynb/          # Jupyter Notebooks
│   ├── csv/            # CSV files
│   ├── bing-serp/      # Bing search results
│   └── zip/            # ZIP archives
└── output/             # Generated output files
```

---

## 🔧 Troubleshooting

### Module not found

```bash
# Reinstall dependencies and rebuild
cd markitdown-node
pnpm install
pnpm run build
```

### Changes not taking effect

Make sure you've rebuilt the package after modifying source code:

```bash
cd markitdown-node
pnpm run build
```

### pnpm not installed

```bash
npm install -g pnpm
```

---

## 📖 More Resources

- 📦 [npm package](https://www.npmjs.com/package/markitdown-node)
- 📖 [Main README](../README.md)
- 📘 [pnpm workspace docs](https://pnpm.io/workspaces)
- 🐛 [Report Issues](https://github.com/leoning60/markitdown-node/issues)
