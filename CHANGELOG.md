# Changelog

All notable changes to this project will be documented in this file.

## [1.5.2] - 2025-01-16

### 🧹 Dependencies Cleanup

#### Removed
- ❌ Removed unused dependencies to reduce package size and improve installation speed:
  - `@ffmpeg-installer/ffmpeg` - Not used in codebase
  - `@huggingface/transformers` - Not used in codebase
  - `execa` - Not used in codebase
  - `fast-xml-parser` - XML parsing already handled by `@xmldom/xmldom`
  - `word` - Not used in codebase

#### Impact
- 📦 Reduced package size by removing 5 unused dependencies
- ⚡ Faster installation times
- 🔧 Cleaner dependency tree

## [1.3.0] - 2024-01-XX

### 🎉 Additional Format Support - Notebooks, Audio, and Search Results

#### Added
- ✨ **Jupyter Notebook Support (.ipynb)**: Extract markdown cells, code cells, and execution outputs
- ✨ **Bing SERP Support**: Parse and convert Bing search result pages with proper link decoding
- ✨ **Audio Support (MP3, WAV)**: Extract metadata from audio files using exiftool
- 📝 Added example files for all new formats (examples 14-17)

#### New Backends
- `IpynbBackend` - Processes Jupyter Notebook files with cell type detection
- `BingSerpBackend` - Extracts Bing search results with custom Turndown rules
- `AudioBackend` - Extracts audio file metadata (transcription planned for future)

#### Examples
- Added `14-bing-serp-example.js` - Bing search result conversion
- Added `15-audio-example.js` - Audio metadata extraction
- Added `16-ipynb-example.js` - Jupyter Notebook conversion
- Added `17-csv-json-example.js` - CSV, JSON, and text file examples

#### Enhanced
- Improved format detection for Jupyter Notebooks (checks for cells array)
- Enhanced Bing SERP detection in HTML files
- Better query extraction from Bing search pages

## [1.2.0] - 2024-01-XX

### 🎉 New Format Support - Major Feature Expansion

#### Added
- ✨ **CSV Support**: Parse CSV files with automatic table structure preservation
- ✨ **JSON Support**: Convert JSON files with formatted code blocks and readable extraction
- ✨ **Plain Text Support**: Handle .txt files with automatic paragraph detection
- ✨ **XML Support**: Parse generic XML documents with proper structure
- ✨ **RSS Support**: Extract full RSS feed articles with titles, dates, and content
- ✨ **Atom Support**: Parse Atom feeds with complete entry information
- ✨ **ZIP Support**: Recursively extract and convert files from ZIP archives (requires `unzipper` package)
- ✨ **YouTube Support**: Extract metadata and transcripts from YouTube videos (requires `youtube-transcript` package)

#### Changed
- 📦 Updated `@xmldom/xmldom` from `xmldom` for better XML parsing
- 🔧 Enhanced format detection with support for CSV, JSON, XML, and ZIP files
- 📝 Expanded README with comprehensive documentation for all new formats
- 🎯 Added type declarations for optional peer dependencies

#### New Backends
- `PlainTextBackend` - Handles CSV, JSON, and plain text files
- `XMLBackend` - Processes XML, RSS, and Atom feeds
- `ZIPBackend` - Extracts and converts ZIP archive contents
- `YouTubeBackend` - Extracts YouTube video metadata and transcripts

#### Examples
- Added `13-new-formats-demo.js` demonstrating all new format conversions

#### Dependencies
- Added `@xmldom/xmldom` ^0.9.6 for XML parsing
- Removed deprecated `xmldom` package
- Optional peer dependencies: `unzipper` and `youtube-transcript`

## [1.1.0]

### 🎉 Simplified API - Major Developer Experience Improvement

#### Changed
- ✨ **Auto-generated outputs**: `ConversionResult` now includes `json_content` (array) and `markdown_content` (string) automatically
- 🚀 **Simpler imports**: No need to import `MarkdownExporter` or `JSONExporter` for basic usage
- ⚡ **Better structure**: `json_content` is the content array directly, not a JSON string
- 📄 **Clean markdown**: `markdown_content` no longer includes metadata frontmatter (metadata is in the `metadata` field)
- 💾 **Single file output**: Examples save everything to one JSON file with `metadata`, `json_content`, and `markdown_content`
- 📝 **Updated all examples**: All example files demonstrate the simplified API

#### Output Structure
```json
{
  "metadata": {...},              // Document metadata
  "json_content": [...],          // Content array (not a string)
  "markdown_content": "..."       // Markdown text (no frontmatter)
}
```

#### Before (v1.0.0)
```typescript
import { MarkItDown, MarkdownExporter, JSONExporter } from 'markitdown-node';
const result = await converter.convert(path);
const json = JSONExporter.export(result.document);
const md = MarkdownExporter.export(result.document);
```

#### After (v1.1.0)
```typescript
import { MarkItDown } from 'markitdown-node';
const result = await converter.convert(path);
// Save everything in one JSON file
const output = {
  metadata: result.document.metadata,
  json_content: result.json_content,      // content array
  markdown_content: result.markdown_content  // markdown string
};
await fs.writeFile('out.json', JSON.stringify(output, null, 2));
```

#### Added
- New example file: `12-simplified-api-demo.js` demonstrating the improved API
- Enhanced documentation with before/after comparisons

#### Backward Compatibility
- ✅ Fully backward compatible - `MarkdownExporter` and `JSONExporter` still available for custom export options
- ✅ All existing code continues to work without changes
- ✅ Document structure and types remain unchanged

## [1.0.0]

### 🎉 Initial Release

#### Added
- ✨ Core document conversion framework
- 📝 TypeScript type definitions
- 🔧 Abstract backend system for extensibility

#### Supported Input Formats
- 📄 HTML documents with full structure preservation
- 📘 DOCX (Microsoft Word) documents
- 📊 XLSX (Microsoft Excel) spreadsheets
- 📽️ PPTX (Microsoft PowerPoint) presentations
- 🎬 VTT (WebVTT) subtitle files
- 🎬 SRT (SubRip) subtitle files
- 📕 PDF documents (basic text extraction)

#### Export Formats
- 📋 JSON export with customizable formatting
- 📝 Markdown export with multiple style options

#### Features
- 🚀 Simple, unified API for all formats
- 🎯 Automatic format detection
- ⚙️ Configurable backend options
- 🔍 Content type extraction (headings, paragraphs, tables, lists, images)
- 💅 Formatting preservation (bold, italic, underline, strikethrough)
- 📦 Convenience functions for quick conversion

#### Developer Experience
- 📘 Full TypeScript support with type definitions
- 📚 Comprehensive README with examples
- 🧪 Test suite with 100% pass rate
- 📖 Example code for common use cases
- 🎓 Quick start guide

### Technical Details

#### Dependencies
- jsdom: HTML parsing
- turndown: HTML to Markdown conversion
- mammoth: DOCX processing
- exceljs: Excel file handling
- node-pptx-parser: PowerPoint parsing
- pdf-ts: PDF metadata extraction

#### Architecture
- Backend layer: Format-specific parsers
- Converter layer: Unified conversion interface
- Exporter layer: Output format generators
- Type system: Complete TypeScript definitions

### Known Limitations
- PDF text extraction is basic (requires pdfjs-dist for advanced features)
- OCR for scanned PDFs not implemented
- Audio transcription (ASR) not included
- Image processing is minimal

### Future Plans
- Enhanced PDF support with pdfjs-dist
- OCR integration for scanned documents
- Audio transcription support
- Additional export formats (DOCX, HTML)
- Performance optimizations
- Advanced table detection

---

## Version History

- **v1.0.0**: Initial release with core functionality