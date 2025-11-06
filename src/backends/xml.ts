/**
 * XML Backend - Converts XML, RSS, and Atom feeds to structured format
 */

import * as fs from 'fs';
import { DOMParser } from '@xmldom/xmldom';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';

export class XMLBackend extends AbstractBackend {
  private turndownService: TurndownService;

  constructor(options: BackendOptions = {}) {
    super(options);
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
  }

  supportsFormat(format: InputFormat): boolean {
    return [InputFormat.XML, InputFormat.RSS, InputFormat.ATOM].includes(format);
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source)
        ? source
        : await fs.promises.readFile(source);

      const text = buffer.toString('utf-8').trim();
      
      // Check if it starts with XML declaration or root element
      return text.startsWith('<?xml') || text.startsWith('<');
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source)
      ? source
      : await fs.promises.readFile(source);

    const xmlString = buffer.toString('utf-8');
    const doc = new DOMParser().parseFromString(xmlString, 'text/xml');

    const content: DocumentItem[] = [];
    let format = InputFormat.XML;
    let title = filename || 'Untitled XML';

    // Check if it's RSS or Atom
    if (doc.getElementsByTagName('rss').length > 0) {
      format = InputFormat.RSS;
      this.parseRSS(doc, content);
      title = this.getElementText(doc, 'title') || title;
    } else if (doc.getElementsByTagName('feed').length > 0) {
      format = InputFormat.ATOM;
      this.parseAtom(doc, content);
      title = this.getElementText(doc, 'title') || title;
    } else {
      // Generic XML
      this.parseGenericXML(xmlString, content);
    }

    return {
      metadata: {
        filename: filename || 'document.xml',
        format,
        title,
      },
      content,
    };
  }

  private parseRSS(doc: any, content: DocumentItem[]): void {
    const channel = doc.getElementsByTagName('channel')[0];
    if (!channel) return;

    const channelTitle = this.getElementText(channel, 'title');
    const channelDescription = this.getElementText(channel, 'description');

    if (channelTitle) {
      content.push({
        type: DocumentItemType.TITLE,
        text: channelTitle,
        level: 1,
      });
    }

    if (channelDescription) {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: channelDescription,
      });
    }

    const items = channel.getElementsByTagName('item');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = this.getElementText(item, 'title');
      const description = this.getElementText(item, 'description');
      const pubDate = this.getElementText(item, 'pubDate');
      const contentEncoded = this.getElementText(item, 'content:encoded');

      if (title) {
        content.push({
          type: DocumentItemType.HEADING,
          text: title,
          level: 2,
        });
      }

      if (pubDate) {
        content.push({
          type: DocumentItemType.PARAGRAPH,
          text: `Published on: ${pubDate}`,
          formatting: { italic: true },
        });
      }

      if (description) {
        const parsed = this.parseHTMLContent(description);
        content.push(...parsed);
      }

      if (contentEncoded) {
        const parsed = this.parseHTMLContent(contentEncoded);
        content.push(...parsed);
      }
    }
  }

  private parseAtom(doc: any, content: DocumentItem[]): void {
    const feed = doc.getElementsByTagName('feed')[0];
    if (!feed) return;

    const feedTitle = this.getElementText(feed, 'title');
    const feedSubtitle = this.getElementText(feed, 'subtitle');

    if (feedTitle) {
      content.push({
        type: DocumentItemType.TITLE,
        text: feedTitle,
        level: 1,
      });
    }

    if (feedSubtitle) {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: feedSubtitle,
      });
    }

    const entries = feed.getElementsByTagName('entry');
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = this.getElementText(entry, 'title');
      const summary = this.getElementText(entry, 'summary');
      const updated = this.getElementText(entry, 'updated');
      const entryContent = this.getElementText(entry, 'content');

      if (title) {
        content.push({
          type: DocumentItemType.HEADING,
          text: title,
          level: 2,
        });
      }

      if (updated) {
        content.push({
          type: DocumentItemType.PARAGRAPH,
          text: `Updated on: ${updated}`,
          formatting: { italic: true },
        });
      }

      if (summary) {
        const parsed = this.parseHTMLContent(summary);
        content.push(...parsed);
      }

      if (entryContent) {
        const parsed = this.parseHTMLContent(entryContent);
        content.push(...parsed);
      }
    }
  }

  private parseGenericXML(xmlString: string, content: DocumentItem[]): void {
    // For generic XML, just pretty-print it as code
    content.push({
      type: DocumentItemType.CODE,
      text: xmlString,
      metadata: {
        language: 'xml',
      },
    });
  }

  private getElementText(element: any, tagName: string): string | null {
    const nodes = element.getElementsByTagName(tagName);
    if (!nodes || nodes.length === 0) return null;

    const firstChild = nodes[0].firstChild;
    if (firstChild && firstChild.nodeValue) {
      return firstChild.nodeValue;
    }

    // Try to get text content
    const textContent = nodes[0].textContent;
    return textContent || null;
  }

  private parseHTMLContent(htmlContent: string): DocumentItem[] {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Convert HTML to markdown using turndown
      const markdown = this.turndownService.turndown(htmlContent);
      
      // Split into paragraphs
      const paragraphs = markdown.split(/\n\n+/).filter((p) => p.trim());
      
      return paragraphs.map((text) => ({
        type: DocumentItemType.PARAGRAPH,
        text: text.trim(),
      }));
    } catch (error) {
      // If parsing fails, return as plain text
      return [{
        type: DocumentItemType.PARAGRAPH,
        text: htmlContent,
      }];
    }
  }
}

