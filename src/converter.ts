/**
 * MarkItDown - Main entry point for document conversion
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  InputFormat,
  ConversionResult,
  ConversionStatus,
  BackendOptions,
  MarkItDownOptions,
} from './types';
import {
  AbstractBackend,
  HTMLBackend,
  DOCXBackend,
  XLSXBackend,
  PPTXBackend,
  SubtitleBackend,
  PDFBackend,
  ImageBackend,
  PlainTextBackend,
  XMLBackend,
  ZIPBackend,
  YouTubeBackend,
  BingSerpBackend,
  IpynbBackend,
} from './backends';
import { MarkdownExporter } from './exporters/markdown';

export class MarkItDown {
  private backends: Map<InputFormat, AbstractBackend>;
  private allowedFormats: Set<InputFormat>;

  constructor(options: MarkItDownOptions = {}) {
    this.allowedFormats = new Set(
      options.allowedFormats || Object.values(InputFormat)
    );

    const defaultOptions = options.defaultOptions || {};

    // Initialize backends
    this.backends = new Map([
      [InputFormat.HTML, new HTMLBackend(defaultOptions)],
      [InputFormat.DOCX, new DOCXBackend(defaultOptions)],
      [InputFormat.XLSX, new XLSXBackend(defaultOptions)],
      [InputFormat.PPTX, new PPTXBackend(defaultOptions)],
      [InputFormat.VTT, new SubtitleBackend(defaultOptions)],
      [InputFormat.SRT, new SubtitleBackend(defaultOptions)],
      [InputFormat.PDF, new PDFBackend(defaultOptions)],
      [InputFormat.IMAGE, new ImageBackend(defaultOptions)],
      [InputFormat.CSV, new PlainTextBackend(defaultOptions)],
      [InputFormat.JSON, new PlainTextBackend(defaultOptions)],
      [InputFormat.TEXT, new PlainTextBackend(defaultOptions)],
      [InputFormat.XML, new XMLBackend(defaultOptions)],
      [InputFormat.RSS, new XMLBackend(defaultOptions)],
      [InputFormat.ATOM, new XMLBackend(defaultOptions)],
      [InputFormat.ZIP, new ZIPBackend({ ...defaultOptions, parentConverter: this })],
      [InputFormat.YOUTUBE, new YouTubeBackend(defaultOptions)],
      [InputFormat.BING_SERP, new BingSerpBackend(defaultOptions)],
      [InputFormat.IPYNB, new IpynbBackend(defaultOptions)],
    ]);
  }

  /**
   * Convert a document from file path or buffer
   */
  async convert(source: string | Buffer, filename?: string): Promise<ConversionResult> {
    try {
      const format = await this.detectFormat(source, filename);

      if (!format) {
        return {
          status: ConversionStatus.FAILURE,
          errors: ['Unable to detect document format'],
        };
      }

      if (!this.allowedFormats.has(format)) {
        return {
          status: ConversionStatus.FAILURE,
          errors: [`Format ${format} is not allowed`],
        };
      }

      const backend = this.backends.get(format);
      if (!backend) {
        return {
          status: ConversionStatus.FAILURE,
          errors: [`No backend available for format ${format}`],
        };
      }

      const isValid = await backend.isValid(source);
      if (!isValid) {
        return {
          status: ConversionStatus.FAILURE,
          errors: [`Invalid ${format} document`],
        };
      }

      const document = await backend.convert(source, filename);

      // Auto-generate content outputs
      const json_content = document.content;  // Direct content array
      const markdown_content = MarkdownExporter.export(document, {
        includeMetadata: false  // Don't include metadata in markdown
      });

      return {
        status: ConversionStatus.SUCCESS,
        document,
        json_content,
        markdown_content,
      };
    } catch (error) {
      return {
        status: ConversionStatus.FAILURE,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Detect document format from file extension or content
   */
  private async detectFormat(
    source: string | Buffer,
    filename?: string
  ): Promise<InputFormat | null> {
    // Try to detect from filename first
    if (filename) {
      const ext = path.extname(filename).toLowerCase().slice(1);
      const formatFromExt = this.extensionToFormat(ext);
      if (formatFromExt) return formatFromExt;
    }

    if (typeof source === 'string') {
      const ext = path.extname(source).toLowerCase().slice(1);
      const formatFromExt = this.extensionToFormat(ext);
      if (formatFromExt) return formatFromExt;
    }

    // Try to detect from content
    return await this.detectFormatFromContent(source);
  }

  private extensionToFormat(ext: string): InputFormat | null {
    const mapping: Record<string, InputFormat> = {
      pdf: InputFormat.PDF,
      docx: InputFormat.DOCX,
      pptx: InputFormat.PPTX,
      xlsx: InputFormat.XLSX,
      html: InputFormat.HTML,
      htm: InputFormat.HTML,
      vtt: InputFormat.VTT,
      srt: InputFormat.SRT,
      png: InputFormat.IMAGE,
      jpg: InputFormat.IMAGE,
      jpeg: InputFormat.IMAGE,
      tiff: InputFormat.IMAGE,
      tif: InputFormat.IMAGE,
      csv: InputFormat.CSV,
      json: InputFormat.JSON,
      txt: InputFormat.TEXT,
      xml: InputFormat.XML,
      rss: InputFormat.RSS,
      atom: InputFormat.ATOM,
      zip: InputFormat.ZIP,
      ipynb: InputFormat.IPYNB,
    };
    return mapping[ext] || null;
  }

  private async detectFormatFromContent(
    source: string | Buffer
  ): Promise<InputFormat | null> {
    const buffer = Buffer.isBuffer(source)
      ? source
      : await fs.promises.readFile(source);

    // Check file signatures
    const header = buffer.toString('utf-8', 0, 100);
    const fullContent = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));

    if (header.startsWith('%PDF-')) return InputFormat.PDF;

    // ZIP signature (PK\x03\x04)
    if (buffer[0] === 0x50 && buffer[1] === 0x4b &&
      buffer[2] === 0x03 && buffer[3] === 0x04) {
      // PK header - could be DOCX, PPTX, XLSX, or ZIP
      const content = buffer.toString('utf-8');
      if (content.includes('word/')) return InputFormat.DOCX;
      if (content.includes('ppt/')) return InputFormat.PPTX;
      if (content.includes('xl/')) return InputFormat.XLSX;
      return InputFormat.ZIP; // Generic ZIP file
    }

    // Check for HTML-based formats
    if (header.includes('<html') || header.includes('<!DOCTYPE')) {
      // Check if it's a Bing SERP page
      if (fullContent.includes('bing.com') &&
        (fullContent.includes('b_algo') || fullContent.includes('b_searchboxSubmit'))) {
        return InputFormat.BING_SERP;
      }
      return InputFormat.HTML;
    }

    if (header.startsWith('WEBVTT')) return InputFormat.VTT;
    if (/^\d+\s*\n\d{2}:\d{2}/.test(header)) return InputFormat.SRT;

    // XML-based formats
    if (header.trim().startsWith('<?xml') || header.trim().startsWith('<')) {
      if (header.includes('<rss')) return InputFormat.RSS;
      if (header.includes('<feed')) return InputFormat.ATOM;
      if (header.includes('<')) return InputFormat.XML;
    }

    // JSON detection
    const trimmed = header.trim();
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) &&
      this.isValidJSON(buffer.toString('utf-8'))) {
      // Check if it's a Jupyter notebook
      try {
        const jsonData = JSON.parse(buffer.toString('utf-8'));
        if (jsonData && jsonData.cells && Array.isArray(jsonData.cells)) {
          return InputFormat.IPYNB;
        }
      } catch {
        // Not a valid JSON
      }
      return InputFormat.JSON;
    }

    // CSV detection (simple heuristic)
    if (this.looksLikeCSV(header)) {
      return InputFormat.CSV;
    }

    return null;
  }

  private isValidJSON(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  private looksLikeCSV(text: string): boolean {
    // Simple heuristic: check if first few lines have consistent comma counts
    const lines = text.split('\n').slice(0, 5).filter(l => l.trim());
    if (lines.length < 2) return false;

    const commaCounts = lines.map(line => (line.match(/,/g) || []).length);
    const firstCount = commaCounts[0];

    // All lines should have similar comma counts and at least one comma
    return firstCount > 0 && commaCounts.every(c => Math.abs(c - firstCount) <= 1);
  }

  /**
   * Get available backends
   */
  getAvailableFormats(): InputFormat[] {
    return Array.from(this.allowedFormats);
  }

  /**
   * Set custom backend for a format
   */
  setBackend(format: InputFormat, backend: AbstractBackend): void {
    this.backends.set(format, backend);
  }
}

