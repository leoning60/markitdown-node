/**
 * DOCX Backend - Converts Microsoft Word documents to structured format
 */

import * as mammoth from 'mammoth';
import { JSDOM } from 'jsdom';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';
import * as fs from 'fs';

export class DOCXBackend extends AbstractBackend {
  constructor(options: BackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.DOCX;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      // Check for DOCX file signature (PK header for ZIP files)
      const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);
      return buffer[0] === 0x50 && buffer[1] === 0x4b; // PK header
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);

    // Convert DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml(
      { buffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2",
          "p[style-name='Heading 3'] => h3",
          "p[style-name='Heading 4'] => h4",
          "p[style-name='Heading 5'] => h5",
          "p[style-name='Heading 6'] => h6",
        ],
      }
    );

    const html = result.value;
    const messages = result.messages;

    // Parse HTML to structured document
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const content = this.extractElements(document.body);

    return {
      metadata: {
        filename: filename || 'document.docx',
        format: InputFormat.DOCX,
        title: this.extractTitle(content),
      },
      content,
    };
  }

  private extractElements(element: Element): DocumentItem[] {
    const items: DocumentItem[] = [];

    for (const child of Array.from(element.children)) {
      const tagName = child.tagName.toLowerCase();

      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName[1]);
        items.push({
          type: DocumentItemType.HEADING,
          text: child.textContent?.trim() || '',
          level,
        });
      } else if (tagName === 'p') {
        const text = child.textContent?.trim();
        if (text) {
          items.push({
            type: DocumentItemType.PARAGRAPH,
            text,
            formatting: this.extractFormatting(child),
          });
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        items.push(this.extractList(child, tagName === 'ol'));
      } else if (tagName === 'table' && this.options.extractTables) {
        items.push(this.extractTable(child));
      } else if (tagName === 'img' && this.options.extractImages) {
        items.push({
          type: DocumentItemType.IMAGE,
          metadata: {
            src: child.getAttribute('src') || undefined,
            alt: child.getAttribute('alt') || undefined,
          },
        });
      }
    }

    return items;
  }

  private extractList(element: Element, ordered: boolean): DocumentItem {
    const items = Array.from(element.querySelectorAll(':scope > li')).map((li) => ({
      type: DocumentItemType.LIST_ITEM,
      text: li.textContent?.trim() || '',
    }));

    return {
      type: DocumentItemType.LIST,
      children: items,
      metadata: { ordered },
    };
  }

  private extractTable(element: Element): DocumentItem {
    const rows: any[][] = [];
    const tableRows = element.querySelectorAll('tr');

    tableRows.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll('td, th')).map((cell) => ({
        text: cell.textContent?.trim() || '',
        isHeader: cell.tagName.toLowerCase() === 'th',
      }));
      rows.push(cells);
    });

    return {
      type: DocumentItemType.TABLE,
      rows,
      numRows: rows.length,
      numCols: rows[0]?.length || 0,
    } as any;
  }

  private extractFormatting(element: Element): any {
    if (!this.options.extractFormatting) return undefined;

    return {
      bold: !!element.querySelector('strong, b'),
      italic: !!element.querySelector('em, i'),
      underline: !!element.querySelector('u'),
    };
  }

  private extractTitle(content: DocumentItem[]): string {
    // Try to find first heading or use "Untitled"
    for (const item of content) {
      if (item.type === DocumentItemType.HEADING && item.level === 1) {
        return item.text || 'Untitled';
      }
    }
    return 'Untitled';
  }
}

