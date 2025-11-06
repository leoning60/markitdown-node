/**
 * Core type definitions for the document extraction library
 */

export enum InputFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  PPTX = 'pptx',
  XLSX = 'xlsx',
  HTML = 'html',
  VTT = 'vtt',
  SRT = 'srt',
  IMAGE = 'image',
  CSV = 'csv',
  JSON = 'json',
  TEXT = 'text',
  XML = 'xml',
  RSS = 'rss',
  ATOM = 'atom',
  ZIP = 'zip',
  YOUTUBE = 'youtube',
  BING_SERP = 'bing_serp',
  IPYNB = 'ipynb',
}

export enum DocumentItemType {
  TEXT = 'text',
  TITLE = 'title',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST = 'list',
  LIST_ITEM = 'list_item',
  TABLE = 'table',
  TABLE_CELL = 'table_cell',
  IMAGE = 'image',
  CODE = 'code',
  FORMULA = 'formula',
  CAPTION = 'caption',
  SECTION = 'section',
  SUBTITLE = 'subtitle',
}

export enum ConversionStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL_SUCCESS = 'partial_success',
}

export interface DocumentMetadata {
  filename: string;
  format: InputFormat;
  pageCount?: number;
  title?: string;
  author?: string;
  creationDate?: Date;
  modificationDate?: Date;
  [key: string]: any;
}

export interface Formatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

export interface DocumentItem {
  type: DocumentItemType;
  text?: string;
  level?: number;
  formatting?: Formatting;
  children?: DocumentItem[];
  metadata?: Record<string, any>;
}

export interface TableCell {
  text: string;
  rowSpan?: number;
  colSpan?: number;
  isHeader?: boolean;
}

export interface TableItem extends DocumentItem {
  type: DocumentItemType.TABLE;
  rows: TableCell[][];
  numRows: number;
  numCols: number;
}

export interface ImageItem extends DocumentItem {
  type: DocumentItemType.IMAGE;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  data?: Buffer;
}

export interface Document {
  metadata: DocumentMetadata;
  content: DocumentItem[];
}

export interface ConversionResult {
  status: ConversionStatus;
  document?: Document;
  json_content?: DocumentItem[];  // Content array (JSON structure)
  markdown_content?: string;       // Markdown format output
  errors?: string[];
  warnings?: string[];
}

export interface BackendOptions {
  // Generic options for all backends
  extractImages?: boolean;
  extractTables?: boolean;
  extractFormatting?: boolean;

  // OCR options for image processing
  ocrLanguages?: string; // OCR language codes, e.g., 'eng', 'chi_sim', 'chi_sim+eng'
}

export interface PDFBackendOptions extends BackendOptions {
  // PDF-specific options
  pageRange?: { start: number; end: number };
}

export interface HTMLBackendOptions extends BackendOptions {
  // HTML-specific options
  baseUrl?: string;
  preserveWhitespace?: boolean;
}

export interface MarkItDownOptions {
  allowedFormats?: InputFormat[];
  defaultOptions?: BackendOptions;
}

