/**
 * Content Extract Local - Document extraction library
 * 
 * A TypeScript document extraction library inspired by docling,
 * supporting multiple document formats with JSON and Markdown output.
 */

// Main converter
export { MarkItDown } from './converter';

// Enums (export as values)
export { InputFormat, DocumentItemType, ConversionStatus } from './types';

// Type-only exports
export type {
  Document,
  DocumentItem,
  DocumentMetadata,
  ConversionResult,
  Formatting,
  TableItem,
  TableCell,
  ImageItem,
  BackendOptions,
  PDFBackendOptions,
  HTMLBackendOptions,
  MarkItDownOptions,
} from './types';

// Backends
export {
  AbstractBackend,
  HTMLBackend,
  DOCXBackend,
  XLSXBackend,
  PPTXBackend,
  SubtitleBackend,
  PDFBackend,
  EnhancedPDFBackend,
} from './backends';

// Exporters
export { JSONExporter, MarkdownExporter } from './exporters';
export type { JSONExportOptions, MarkdownExportOptions } from './exporters';

// Convenience function for quick conversion
import { MarkItDown } from './converter';
import { ConversionResult } from './types';

/**
 * Quick convert function - convert a document in one call
 */
export async function convertDocument(
  source: string | Buffer,
  filename?: string
): Promise<ConversionResult> {
  const converter = new MarkItDown();
  return converter.convert(source, filename);
}

/**
 * Convert and export to JSON string
 */
export async function convertToJSON(
  source: string | Buffer,
  filename?: string,
  pretty = true
): Promise<string | null> {
  const result = await convertDocument(source, filename);
  if (result.json_content) {
    return JSON.stringify(result.json_content, null, pretty ? 2 : 0);
  }
  return null;
}

/**
 * Convert and export to Markdown
 */
export async function convertToMarkdown(
  source: string | Buffer,
  filename?: string
): Promise<string | null> {
  const result = await convertDocument(source, filename);
  return result.markdown_content || null;
}

