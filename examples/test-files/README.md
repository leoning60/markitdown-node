# Test Files Directory

This directory contains sample files for testing the document converter examples.

## Directory Structure

```
test-files/
├── docx/
│   ├── 1.docx          # Sample Word document (DOCX format)
│   └── 2.doc           # Sample Word document (DOC format)
├── pdf/
│   └── 1.pdf           # Sample PDF document
├── pptx/
│   └── 1.pptx          # Sample PowerPoint presentation
├── xlsx/
│   └── 1.xlsx          # Sample Excel spreadsheet
├── html/
│   └── 1.html          # Sample HTML file
├── subtitles/
│   └── 1.srt           # Sample subtitle file (SRT format)
└── images/
    ├── 1.jpeg          # Sample JPEG image
    ├── 2.png           # Sample PNG image
    └── 3.png           # Sample PNG image with text (for OCR testing)
```

## Usage

The example scripts in the parent directory reference these files using numbered names (1.docx, 1.pdf, etc.).

You can:
1. **Replace these files** with your own test documents
2. **Keep the same filenames** (1.docx, 1.pdf, etc.) to use the examples without modification
3. **Add more files** and update the example scripts to reference them

## File Naming Convention

Files are named with simple numbers to make it easy to:
- Replace them with your own test files
- Understand the file format from the extension
- Keep the examples folder clean and organized

## Supported Formats

- **Documents**: DOCX, DOC, PDF
- **Presentations**: PPTX
- **Spreadsheets**: XLSX
- **Web**: HTML
- **Media**: Images (JPEG, PNG) with OCR support
- **Subtitles**: SRT, VTT

## Notes

- Image files (1.jpeg, 2.png, 3.png) are used for OCR testing
- Files with Chinese characters (like 3.png) demonstrate multi-language OCR capabilities
- You can delete these sample files and add your own for testing
