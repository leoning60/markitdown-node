# markitdown-node

A powerful TypeScript document extraction library that converts 20+ file formats into structured JSON and Markdown.

## Features

- 📄 **20+ Format Support**: Documents (PDF, DOCX, PPTX, XLSX), Web (HTML, RSS, Atom), Images (OCR), Media (Audio, YouTube), Code (Jupyter), Archives (ZIP), Search (Bing SERP), and more
- 🔄 **Unified API**: Simple, consistent interface for all formats
- 📊 **Dual Output**: Auto-generates both JSON and Markdown from a single conversion
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- 🚀 **Zero Config**: Works out of the box with sensible defaults
- 🖼️ **OCR Support**: Extract text from images using Tesseract.js (110+ languages)
- 🎙️ **Audio Transcription**: Convert audio files to text (via LLM integration)
- 📦 **pnpm Workspace**: Optimized development experience with automatic linking

## Installation

### For Users

```bash
npm install markitdown-node
# or
pnpm install markitdown-node
```

### For Development

This project uses pnpm workspace for better development experience:

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Clone and setup
git clone https://github.com/leoning60/markitdown-node.git
cd markitdown-node
pnpm install
pnpm run build
```

## Quick Start

```typescript
import { MarkItDown } from 'markitdown-node';

const converter = new MarkItDown();
const result = await converter.convert('./document.docx');

if (result.status === 'success') {
  console.log(result.markdown_content);  // ✨ Auto-generated Markdown
  console.log(result.json_content);      // ✨ Auto-generated JSON
}
```

**One-liner conversions:**
```typescript
import { convertToMarkdown, convertToJSON } from 'markitdown-node';

const markdown = await convertToMarkdown('./document.pdf');
const json = await convertToJSON('./data.xlsx');
```

## Supported Formats

| Category | Formats | Notes |
|----------|---------|-------|
| **Documents** | PDF, DOCX, PPTX, XLSX | Office documents and spreadsheets |
| **Web** | HTML, RSS, Atom | Web pages and feeds |
| **Images** | PNG, JPEG, TIFF | With EXIF metadata and OCR |
| **Media** | Audio (WAV, MP3, etc.), YouTube | Audio transcription via LLM, YouTube transcripts |
| **Code** | Jupyter Notebooks (.ipynb) | Markdown cells, code, and outputs |
| **Text** | TXT, CSV, JSON, XML | Plain text and structured data |
| **Subtitles** | SRT, VTT | Subtitle files |
| **Archives** | ZIP | Recursive extraction |
| **Search** | Bing SERP | Search result pages |

## Usage Examples

### Convert Documents

```typescript
const converter = new MarkItDown();

// PDF to Markdown
const pdf = await converter.convert('./report.pdf');

// Excel to JSON
const excel = await converter.convert('./data.xlsx');
console.log(excel.json_content); // Table structure

// Image with OCR
const image = await converter.convert('./document.png');
console.log(image.markdown_content); // Extracted text
```

### CSV and JSON Files

```typescript
// CSV → Table structure
const csv = await converter.convert('./data.csv');
// Outputs Markdown table and structured JSON

// JSON → Formatted output
const json = await converter.convert('./config.json');
// Pretty-printed code block with extracted fields
```

### XML, RSS, and Atom Feeds

```typescript
// Generic XML
const xml = await converter.convert('./config.xml');

// RSS Feed → Structured articles
const rss = await converter.convert('./feed.rss');
// Channel metadata + all articles

// Atom Feed → Structured entries
const atom = await converter.convert('./feed.atom');
```

### Extract from Archives

```typescript
// Requires: pnpm install unzipper
const result = await converter.convert('./archive.zip');
// All files in ZIP are extracted and converted
```

### YouTube Transcripts

```typescript
// Requires: pnpm install youtube-transcript
const converter = new MarkItDown({
  defaultOptions: {
    enableTranscript: true,
    transcriptLanguage: 'en',
  },
});

const result = await converter.convert(youtubeHTML, {
  url: 'https://www.youtube.com/watch?v=VIDEO_ID',
});
```

### Audio Transcription

```typescript
// Requires LLM configuration (OpenAI, etc.)
const result = await converter.convert('./audio.wav');
console.log(result.markdown_content); // Transcribed text
```

### Jupyter Notebooks

```typescript
const result = await converter.convert('./notebook.ipynb');
// Markdown cells, code cells, and outputs are preserved
```

### Bing SERP

```typescript
// Extract search results from Bing HTML
const result = await converter.convert('./bing-results.html');
// Structured search results with titles, URLs, descriptions
```

### Custom Options

```typescript
const converter = new MarkItDown({
  defaultOptions: {
    ocrLanguages: 'chi_sim+eng', // OCR: Chinese + English
    extractImages: true,
    extractTables: true,
  },
});
```

## Running Examples

This project uses pnpm workspace. Examples automatically use the local package:

```bash
# First time setup
pnpm install
pnpm run build

# Run examples
cd examples
node 01-quick-start.js          # Basic usage
node 02-all-formats.js          # All supported formats
node 03-docx-example.js         # Word documents
node 04-pdf-example.js          # PDF documents
node 05-image-example.js        # OCR from images
node 06-excel-example.js        # Excel spreadsheets
node 07-powerpoint-example.js   # PowerPoint presentations
node 08-html-example.js         # HTML pages
node 09-subtitle-example.js     # Subtitle files
node 10-convenience-functions.js # Convenience functions
node 11-ocr-languages.js       # OCR with multiple languages
node 12-bing-serp-example.js    # Bing SERP results
node 13-ipynb-example.js       # Jupyter Notebooks
node 14-csv-json-example.js    # CSV and JSON files
```

After modifying source code, just rebuild:

```bash
pnpm run build
cd examples
node 01-quick-start.js  # Automatically uses latest build
```

See [examples/README.md](./examples/README.md) for more details.

## OCR Configuration

Images are processed with [Tesseract.js](https://github.com/naptha/tesseract.js) OCR, supporting 110+ languages.

### Configure Languages

```typescript
const converter = new MarkItDown({
  defaultOptions: {
    ocrLanguages: 'chi_sim+eng' // Default: Chinese + English
  }
});

// English only
ocrLanguages: 'eng'

// Japanese + English
ocrLanguages: 'jpn+eng'

// Multiple languages
ocrLanguages: 'chi_sim+eng+fra'
```

### Common Language Codes

| Language | Code | Language | Code |
|----------|------|----------|------|
| English | `eng` | Spanish | `spa` |
| Chinese (Simplified) | `chi_sim` | French | `fra` |
| Chinese (Traditional) | `chi_tra` | German | `deu` |
| Japanese | `jpn` | Italian | `ita` |
| Korean | `kor` | Portuguese | `por` |
| Russian | `rus` | Arabic | `ara` |
| Hindi | `hin` | Thai | `tha` |
| Vietnamese | `vie` | Turkish | `tur` |

📖 [Full language list](https://github.com/naptha/tesseract.js/blob/master/src/constants/languages.js) (110+ languages supported)

## Optional Dependencies

Some formats require additional packages:

```bash
# For ZIP file support
pnpm install unzipper

# For YouTube transcript extraction
pnpm install youtube-transcript

# For audio transcription (LLM-based)
# Configure your LLM provider (OpenAI, etc.) in the options
```

## API Types

### ConversionResult

```typescript
interface ConversionResult {
  status: 'success' | 'error';
  document?: Document;           // Structured document object
  json_content?: DocumentItem[]; // ✨ Auto-generated JSON
  markdown_content?: string;     // ✨ Auto-generated Markdown
  errors?: string[];
  warnings?: string[];
}
```

### Document Structure

```typescript
interface Document {
  metadata: {
    filename: string;
    format: InputFormat;
    title?: string;
    author?: string;
    // ... more metadata
  };
  content: DocumentItem[]; // Array of content items
}

interface DocumentItem {
  type: 'text' | 'heading' | 'paragraph' | 'list' | 'table' | ...;
  text?: string;
  level?: number;
  children?: DocumentItem[];
  // ... more fields
}
```

### InputFormat Enum

```typescript
enum InputFormat {
  // Documents
  PDF = 'pdf',
  DOCX = 'docx',
  PPTX = 'pptx',
  XLSX = 'xlsx',
  
  // Web & Feeds
  HTML = 'html',
  RSS = 'rss',
  ATOM = 'atom',
  
  // Text & Data
  TEXT = 'text',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
  
  // Media
  IMAGE = 'image',
  AUDIO = 'audio',
  YOUTUBE = 'youtube',
  
  // Code & Archives
  IPYNB = 'ipynb',
  ZIP = 'zip',
  
  // Subtitles
  SUBTITLE = 'subtitle',
  
  // Special
  BINGSERP = 'bingserp',
}
```

## Development

This project uses pnpm workspace:

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Watch mode
pnpm run dev

# Type check
pnpm run typecheck

# Clean build artifacts
pnpm run clean

# Rebuild from scratch
pnpm run rebuild
```

## Publishing

```bash
# Dry run to check what will be published
pnpm run publish:dry-run

# Release (bumps version, commits, tags, and publishes)
pnpm run release
```

## Project Structure

```
markitdown-node/
├── pnpm-workspace.yaml    # Workspace configuration
├── package.json            # Main package
├── src/                    # Source code
│   ├── converter.ts        # Main converter class
│   ├── backends/           # Format-specific backends
│   ├── exporters/          # JSON and Markdown exporters
│   └── types/              # TypeScript types
├── dist/                   # Built output (generated)
├── examples/               # Example usage (workspace package)
│   ├── package.json        # Uses "workspace:*" dependency
│   └── *.js                # Example files
└── README.md               # This file
```

## License

MIT

## Acknowledgments

Inspired by [markitdown](https://github.com/microsoft/markitdown) by Microsoft.
