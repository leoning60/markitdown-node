/**
 * YouTube Backend - Extracts metadata and transcripts from YouTube videos
 */

import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';

export interface YouTubeBackendOptions extends BackendOptions {
  // Whether to extract video transcript
  enableTranscript?: boolean;
  // Language code for transcript (default: 'en')
  transcriptLanguage?: string;
  // Original URL for context
  url?: string;
}

export class YouTubeBackend extends AbstractBackend {
  constructor(options: YouTubeBackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.YOUTUBE;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    // YouTube backend requires HTML content from YouTube
    try {
      const buffer = Buffer.isBuffer(source)
        ? source
        : await fs.promises.readFile(source);

      const text = buffer.toString('utf-8');
      return text.includes('youtube.com') || text.includes('ytInitialData');
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source)
      ? source
      : await fs.promises.readFile(source);

    const htmlContent = buffer.toString('utf-8');
    const options = this.options as YouTubeBackendOptions;
    const url = options.url || '';

    const content: DocumentItem[] = [];
    const metadata: Record<string, string> = {};

    // Parse HTML to extract metadata
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    // Extract metadata from meta tags
    doc.querySelectorAll('meta').forEach((meta) => {
      for (const attr of Array.from(meta.attributes)) {
        const attributeContent = meta.getAttribute('content');
        if (['itemprop', 'property', 'name'].includes(attr.name) && attributeContent) {
          metadata[attr.value] = attributeContent;
        }
      }
    });

    // Try to extract full description from ytInitialData
    try {
      for (const script of Array.from(doc.querySelectorAll('script'))) {
        const scriptContent = script.textContent || '';
        if (scriptContent.includes('ytInitialData')) {
          const lines = scriptContent.split(/\r?\n/);
          const objStart = lines[0].indexOf('{');
          const objEnd = lines[0].lastIndexOf('}');

          if (objStart >= 0 && objEnd >= 0) {
            const data = JSON.parse(lines[0].substring(objStart, objEnd + 1));
            const attrdesc = this.findKey(data, 'attributedDescriptionBodyText');
            if (attrdesc && attrdesc.content) {
              metadata['description'] = attrdesc.content;
            }
          }
          break;
        }
      }
    } catch (error) {
      console.warn('Error parsing YouTube description:', error);
    }

    // Build document content
    content.push({
      type: DocumentItemType.TITLE,
      text: 'YouTube Video',
      level: 1,
    });

    const title = this.getMetadata(metadata, ['title', 'og:title', 'name']);
    if (title) {
      content.push({
        type: DocumentItemType.HEADING,
        text: title,
        level: 2,
      });
    }

    // Add video metadata section
    const metadataItems: string[] = [];

    const views = this.getMetadata(metadata, ['interactionCount']);
    if (views) {
      metadataItems.push(`- **Views:** ${views}`);
    }

    const keywords = this.getMetadata(metadata, ['keywords']);
    if (keywords) {
      metadataItems.push(`- **Keywords:** ${keywords}`);
    }

    const runtime = this.getMetadata(metadata, ['duration']);
    if (runtime) {
      metadataItems.push(`- **Runtime:** ${runtime}`);
    }

    if (metadataItems.length > 0) {
      content.push({
        type: DocumentItemType.HEADING,
        text: 'Video Metadata',
        level: 3,
      });

      for (const item of metadataItems) {
        content.push({
          type: DocumentItemType.LIST_ITEM,
          text: item,
        });
      }
    }

    // Add description
    const description = this.getMetadata(metadata, ['description', 'og:description']);
    if (description) {
      content.push({
        type: DocumentItemType.HEADING,
        text: 'Description',
        level: 3,
      });
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: description,
      });
    }

    // Extract transcript if enabled
    if (options.enableTranscript && url) {
      await this.extractTranscript(url, content, options.transcriptLanguage || 'en');
    }

    return {
      metadata: {
        filename: filename || 'youtube-video.html',
        format: InputFormat.YOUTUBE,
        title: title || 'YouTube Video',
      },
      content,
    };
  }

  private async extractTranscript(
    url: string,
    content: DocumentItem[],
    language: string
  ): Promise<void> {
    let YoutubeTranscript: any;

    try {
      const module = await import('youtube-transcript');
      YoutubeTranscript = module.YoutubeTranscript;
    } catch (error) {
      console.warn(
        'Optional dependency "youtube-transcript" is not installed. Run "npm install youtube-transcript" to enable transcript extraction.'
      );
      return;
    }

    try {
      // Extract video ID from URL
      const videoId = this.extractVideoId(url);
      if (!videoId) return;

      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: language,
      });

      if (transcript && transcript.length > 0) {
        content.push({
          type: DocumentItemType.HEADING,
          text: 'Transcript',
          level: 3,
        });

        const transcriptText = transcript.map((part: any) => part.text).join(' ');

        // Split into paragraphs for readability
        const sentences = transcriptText.match(/[^.!?]+[.!?]+/g) || [transcriptText];
        const paragraphs: string[] = [];
        let currentParagraph = '';

        for (const sentence of sentences) {
          currentParagraph += sentence + ' ';
          if (currentParagraph.length > 500) {
            paragraphs.push(currentParagraph.trim());
            currentParagraph = '';
          }
        }

        if (currentParagraph) {
          paragraphs.push(currentParagraph.trim());
        }

        for (const paragraph of paragraphs) {
          content.push({
            type: DocumentItemType.PARAGRAPH,
            text: paragraph,
          });
        }
      }
    } catch (error) {
      console.warn('Error extracting YouTube transcript:', error);
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: `Transcript not available: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  private extractVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Standard watch URL
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }

      // Short URL
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }

      return null;
    } catch {
      return null;
    }
  }

  private getMetadata(
    metadata: Record<string, string>,
    keys: string[]
  ): string | null {
    for (const key of keys) {
      if (metadata[key]) {
        return metadata[key];
      }
    }
    return null;
  }

  private findKey(obj: any, key: string): any {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = this.findKey(item, key);
        if (result) return result;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const k in obj) {
        if (k === key) {
          return obj[k];
        }
        const result = this.findKey(obj[k], key);
        if (result) return result;
      }
    }
    return null;
  }
}

