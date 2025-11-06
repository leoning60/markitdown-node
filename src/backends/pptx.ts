/**
 * PPTX Backend - Converts Microsoft PowerPoint presentations to structured format
 */

import * as fs from 'fs';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';

// Note: node-pptx-parser types might not be perfect
const pptxParserModule = require('node-pptx-parser');
const PPTXParser = pptxParserModule.default || pptxParserModule;

export class PPTXBackend extends AbstractBackend {
  constructor(options: BackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.PPTX;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);
      // Check for PPTX file signature (PK header)
      return buffer[0] === 0x50 && buffer[1] === 0x4b;
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    let filePath: string;
    let needsCleanup = false;

    // node-pptx-parser requires a file path, not a buffer
    if (Buffer.isBuffer(source)) {
      filePath = `/tmp/temp-${Date.now()}.pptx`;
      await fs.promises.writeFile(filePath, source);
      needsCleanup = true;
    } else {
      filePath = source;
    }

    try {
      // Correct API usage: pass file path to constructor
      const parser = new PPTXParser(filePath);
      const slideTextContent = await parser.extractText();

      const content: DocumentItem[] = [];
      let title = filename || 'Untitled Presentation';

      // Extract title from first slide
      if (slideTextContent.length > 0 && slideTextContent[0].text.length > 0) {
        title = slideTextContent[0].text[0];
      }

      // Process each slide
      slideTextContent.forEach((slide: any, index: number) => {
        // Add slide heading
        const slideTitle = slide.text.length > 0 ? slide.text[0] : `Slide ${index + 1}`;
        content.push({
          type: DocumentItemType.HEADING,
          text: slideTitle,
          level: 1,
        });

        // Add slide content (skip first line if it's the title)
        const textLines = slide.text.length > 1 ? slide.text.slice(1) : slide.text;
        textLines.forEach((line: string) => {
          if (line.trim()) {
            content.push({
              type: DocumentItemType.PARAGRAPH,
              text: line.trim(),
            });
          }
        });
      });

      return {
        metadata: {
          filename: filename || 'presentation.pptx',
          format: InputFormat.PPTX,
          title,
          pageCount: slideTextContent.length,
        },
        content,
      };
    } finally {
      // Clean up temporary file if created
      if (needsCleanup) {
        try {
          await fs.promises.unlink(filePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }
}

