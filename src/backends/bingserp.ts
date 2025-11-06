/**
 * Bing SERP Backend - Converts Bing search result pages to structured format
 */

import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
// @ts-ignore - No type definitions available
import { gfm } from '@joplin/turndown-plugin-gfm';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';

export interface BingSerpBackendOptions extends BackendOptions {
  // URL of the Bing search page
  url?: string;
}

export class BingSerpBackend extends AbstractBackend {
  private turndownService: TurndownService;

  constructor(options: BingSerpBackendOptions = {}) {
    super(options);
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // Use GitHub Flavored Markdown plugin
    this.turndownService.use(gfm);

    // Custom rule for anchor tags to handle special cases
    this.turndownService.addRule('customAnchors', {
      filter: ['a'],
      replacement: (content, node: any) => {
        if (!content || content.trim() === '') {
          return '';
        }

        const prefix = content[0] === ' ' ? ' ' : '';
        const suffix = content[content.length - 1] === ' ' ? ' ' : '';
        const text = content.trim().replace(/\n\n.*/g, '');

        if (!text) {
          return '';
        }

        const href = node.getAttribute('href');
        const title = node.getAttribute('title');

        if (href) {
          try {
            const parsedUrl = new URL(href, 'https://www.bing.com');
            if (!['https:', 'http:', 'file:'].includes(parsedUrl.protocol)) {
              return `${prefix}${text}${suffix}`;
            }
          } catch (e) {
            if (!/^https?:|^file:/.test(href)) {
              return title
                ? `${prefix}[${text}](${href} "${title}")${suffix}`
                : `${prefix}${text}${suffix}`;
            }
          }
        }

        if (!title && href) {
          return `${prefix}[${text}](${href})${suffix}`;
        }

        const titlePart = title ? ` "${title}"` : '';
        return `${prefix}[${text}](${href}${titlePart})${suffix}`;
      },
    });
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.BING_SERP;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source)
        ? source
        : await fs.promises.readFile(source);

      const text = buffer.toString('utf-8');

      // Check if it looks like a Bing search results page
      return text.includes('bing.com') &&
        (text.includes('b_algo') || text.includes('b_searchboxSubmit'));
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source)
      ? source
      : await fs.promises.readFile(source);

    const htmlContent = buffer.toString('utf-8');
    const options = this.options as BingSerpBackendOptions;

    const content: DocumentItem[] = [];

    // Parse HTML
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    // Extract search query from URL or HTML
    let query = 'Unknown';

    // Try to get query from options URL first
    if (options.url) {
      try {
        const urlObj = new URL(options.url);
        query = urlObj.searchParams.get('q') || 'Unknown';
      } catch (error) {
        // Ignore parse error
      }
    }

    // If still unknown, try to extract from HTML content
    if (query === 'Unknown') {
      // Try multiple methods to extract query
      const queryMatch = htmlContent.match(/search\?q=([^"&]+)/);
      if (queryMatch) {
        query = decodeURIComponent(queryMatch[1].replace(/\+/g, ' '));
      } else {
        // Try to get from input field
        const searchInput = doc.querySelector('#sb_form_q');
        if (searchInput) {
          query = searchInput.getAttribute('value') || 'Unknown';
        }
      }
    }

    // Add title with heading
    const titleText = `A Bing search for '${query}' found the following results:`;
    content.push({
      type: DocumentItemType.HEADING,
      text: titleText,
      level: 2,
    });

    // Clean up the DOM before processing
    // Add spacing after certain elements
    doc.querySelectorAll('.tptt').forEach((element) => {
      if (element.textContent) {
        element.textContent += ' ';
      }
    });

    // Remove icon elements
    doc.querySelectorAll('.algoSlug_icon').forEach((element) => {
      element.remove();
    });

    // Extract search results
    const results = doc.querySelectorAll('.b_algo');

    if (results.length === 0) {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: 'No search results found.',
      });
    } else {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        // Decode Base64-encoded URLs in links
        result.querySelectorAll('a[href]').forEach((anchor) => {
          try {
            const href = anchor.getAttribute('href');
            if (href) {
              const hrefUrl = new URL(href, 'https://www.bing.com');
              const u = hrefUrl.searchParams.get('u');
              if (u) {
                const decoded = this.decodeBase64Url(u);
                anchor.setAttribute('href', decoded);
              }
            }
          } catch (error) {
            // Ignore invalid URLs
          }
        });

        // Convert result to markdown using TurndownService
        const markdown = this.turndownService.turndown(result as HTMLElement);

        // Clean up the markdown - remove extra newlines and trim
        const lines = markdown
          .split(/\n+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        const cleanedMarkdown = lines.join('\n');

        if (cleanedMarkdown) {
          content.push({
            type: DocumentItemType.PARAGRAPH,
            text: cleanedMarkdown,
            metadata: {
              resultIndex: i + 1,
            },
          });
        }
      }
    }

    return {
      metadata: {
        filename: filename || 'bing-search-results.html',
        format: InputFormat.BING_SERP,
        title: doc.title || `Bing Search: ${query}`,
      },
      content,
    };
  }

  private decodeBase64Url(encodedUrl: string): string {
    try {
      // Remove first 2 characters and add padding
      const u = encodedUrl.slice(2).trim() + '==';
      const decoded = Buffer.from(u, 'base64').toString('utf-8');
      return decoded;
    } catch (error) {
      console.warn('Error decoding Base64 URL:', error);
      return encodedUrl;
    }
  }
}

