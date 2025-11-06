/**
 * HTML Backend - Converts HTML documents to structured format
 */

import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
// @ts-ignore - No types available for turndown-plugin-gfm
import { gfm } from 'turndown-plugin-gfm';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  TableItem,
  ImageItem,
  Formatting,
  HTMLBackendOptions,
} from '../types';
import { AbstractBackend } from './base';
import * as fs from 'fs';

export class HTMLBackend extends AbstractBackend {
  private turndownService: TurndownService;

  constructor(options: HTMLBackendOptions = {}) {
    super(options);
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
    this.turndownService.use(gfm);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.HTML;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      let html: string;
      if (Buffer.isBuffer(source)) {
        html = source.toString('utf-8');
      } else {
        const trimmed = source.trim();
        if (trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE')) {
          html = source;
        } else {
          html = await fs.promises.readFile(source, 'utf-8');
        }
      }
      const trimmedHtml = html.trim();
      return trimmedHtml.includes('<html') || trimmedHtml.includes('<body') ||
        trimmedHtml.includes('<div') || trimmedHtml.includes('<h') ||
        trimmedHtml.includes('<p');
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    let html: string;

    if (Buffer.isBuffer(source)) {
      html = source.toString('utf-8');
    } else {
      const trimmed = source.trim();
      if (trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE')) {
        html = source;
      } else {
        html = await fs.promises.readFile(source, 'utf-8');
      }
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract metadata
    const title = document.querySelector('title')?.textContent || filename || 'Untitled';
    const metaTags = document.querySelectorAll('meta');
    const metadata: any = {
      filename: filename || 'document.html',
      format: InputFormat.HTML,
      title,
    };

    metaTags.forEach((meta) => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metadata[name] = content;
      }
    });

    // Extract content
    const body = document.body || document.documentElement;
    const content = this.extractElements(body);

    return {
      metadata,
      content,
    };
  }

  private extractElements(element: Element): DocumentItem[] {
    const items: DocumentItem[] = [];

    for (const child of Array.from(element.children)) {
      const tagName = child.tagName.toLowerCase();

      // Headings
      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName[1]);
        items.push({
          type: DocumentItemType.HEADING,
          text: this.getTextContent(child),
          level,
          formatting: this.extractFormatting(child),
        });
      }
      // Paragraphs
      else if (tagName === 'p') {
        items.push({
          type: DocumentItemType.PARAGRAPH,
          text: this.getTextContent(child),
          formatting: this.extractFormatting(child),
        });
      }
      // Lists
      else if (tagName === 'ul' || tagName === 'ol') {
        items.push(this.extractList(child, tagName === 'ol'));
      }
      // Tables
      else if (tagName === 'table') {
        if (this.options.extractTables) {
          items.push(this.extractTable(child));
        }
      }
      // Images
      else if (tagName === 'img') {
        if (this.options.extractImages) {
          items.push(this.extractImage(child));
        }
      }
      // Code blocks
      else if (tagName === 'pre' || tagName === 'code') {
        items.push({
          type: DocumentItemType.CODE,
          text: child.textContent || '',
        });
      }
      // Recursive extraction for container elements
      else if (['div', 'section', 'article', 'main', 'aside', 'header', 'footer'].includes(tagName)) {
        const childItems = this.extractElements(child);
        if (childItems.length > 0) {
          items.push({
            type: DocumentItemType.SECTION,
            children: childItems,
          });
        }
      }
    }

    return items;
  }

  private extractList(element: Element, ordered: boolean): DocumentItem {
    const items = Array.from(element.querySelectorAll(':scope > li')).map((li) => ({
      type: DocumentItemType.LIST_ITEM,
      text: this.getTextContent(li),
      formatting: this.extractFormatting(li),
    }));

    return {
      type: DocumentItemType.LIST,
      children: items,
      metadata: { ordered },
    };
  }

  private extractTable(element: Element): TableItem {
    const rows: any[][] = [];
    const tableRows = element.querySelectorAll('tr');

    tableRows.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll('td, th')).map((cell) => ({
        text: this.getTextContent(cell),
        isHeader: cell.tagName.toLowerCase() === 'th',
        rowSpan: parseInt(cell.getAttribute('rowspan') || '1'),
        colSpan: parseInt(cell.getAttribute('colspan') || '1'),
      }));
      rows.push(cells);
    });

    return {
      type: DocumentItemType.TABLE,
      rows,
      numRows: rows.length,
      numCols: rows[0]?.length || 0,
    };
  }

  private extractImage(element: Element): ImageItem {
    return {
      type: DocumentItemType.IMAGE,
      src: element.getAttribute('src') || undefined,
      alt: element.getAttribute('alt') || undefined,
      width: parseInt(element.getAttribute('width') || '0') || undefined,
      height: parseInt(element.getAttribute('height') || '0') || undefined,
    };
  }

  private getTextContent(element: Element): string {
    return element.textContent?.trim() || '';
  }

  private extractFormatting(element: Element): Formatting | undefined {
    if (!this.options.extractFormatting) return undefined;

    const computedStyle = element.querySelector('b, strong, i, em, u, s');
    if (!computedStyle) return undefined;

    return {
      bold: !!element.querySelector('b, strong'),
      italic: !!element.querySelector('i, em'),
      underline: !!element.querySelector('u'),
      strikethrough: !!element.querySelector('s, del, strike'),
    };
  }
}

