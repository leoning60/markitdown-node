/**
 * PDF Backend - Converts PDF documents to structured format using pdf-ts
 * Uses Mozilla PDF.js for text extraction
 */

import * as fs from 'fs';
import { pdfToPages, pdfToText } from 'pdf-ts';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  PDFBackendOptions,
} from '../types';
import { AbstractBackend } from './base';

export class PDFBackend extends AbstractBackend {
  constructor(options: PDFBackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.PDF;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);
      // Check for PDF signature
      return buffer.toString('utf-8', 0, 5) === '%PDF-';
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);

    // Extract text by pages using pdf-ts
    const pages = await pdfToPages(buffer);
    const pageCount = pages.length;

    const content: DocumentItem[] = [];

    // Add each page as a separate paragraph
    for (const page of pages) {
      if (page.text.trim()) {
        content.push({
          type: DocumentItemType.PARAGRAPH,
          text: page.text.trim(),
          metadata: {
            page: page.page,
          },
        });
      }
    }

    return {
      metadata: {
        filename: filename || 'document.pdf',
        format: InputFormat.PDF,
        title: filename || 'Untitled PDF',
        pageCount,
      },
      content,
    };
  }
}

/**
 * Enhanced PDF Backend that extracts full text in one block
 */
export class EnhancedPDFBackend extends AbstractBackend {
  constructor(options: PDFBackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.PDF;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);
      return buffer.toString('utf-8', 0, 5) === '%PDF-';
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);

    // Extract all text as one block
    const text = await pdfToText(buffer, {
      pageSep: '\n\n---\n\n', // Separate pages with a visual divider
      nodeSep: ' ', // Separate text nodes with space
    });

    const content: DocumentItem[] = [];

    // Split into paragraphs based on double newlines
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

    for (const paragraph of paragraphs) {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: paragraph.trim(),
      });
    }

    return {
      metadata: {
        filename: filename || 'document.pdf',
        format: InputFormat.PDF,
        title: filename || 'Untitled PDF',
      },
      content,
    };
  }
}

