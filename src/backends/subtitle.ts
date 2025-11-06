/**
 * Subtitle Backend - Converts VTT and SRT subtitle files to structured format
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

interface SubtitleEntry {
  index?: number;
  startTime: string;
  endTime: string;
  text: string;
}

export class SubtitleBackend extends AbstractBackend {
  constructor(options: BackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.VTT || format === InputFormat.SRT;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      let content: string;
      if (Buffer.isBuffer(source)) {
        content = source.toString('utf-8');
      } else {
        // Check if it's a file path or direct content
        if (source.includes('\n') || source.startsWith('WEBVTT') || source.match(/^\d+$/m)) {
          content = source;
        } else {
          content = await fs.promises.readFile(source, 'utf-8');
        }
      }

      const trimmed = content.trim();
      return trimmed.startsWith('WEBVTT') || /^\d+\s*\n\d{2}:\d{2}/.test(trimmed);
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    let content: string;
    if (Buffer.isBuffer(source)) {
      content = source.toString('utf-8');
    } else {
      // Check if it's a file path or direct content
      if (source.includes('\n') || source.startsWith('WEBVTT') || source.match(/^\d+$/m)) {
        content = source;
      } else {
        content = await fs.promises.readFile(source, 'utf-8');
      }
    }

    const isVTT = content.startsWith('WEBVTT');
    const format = isVTT ? InputFormat.VTT : InputFormat.SRT;

    const entries = isVTT ? this.parseVTT(content) : this.parseSRT(content);

    const items: DocumentItem[] = entries.map((entry) => ({
      type: DocumentItemType.PARAGRAPH,
      text: entry.text,
      metadata: {
        startTime: entry.startTime,
        endTime: entry.endTime,
        index: entry.index,
      },
    }));

    return {
      metadata: {
        filename: filename || `subtitle.${format}`,
        format,
        title: filename || 'Subtitle File',
      },
      content: items,
    };
  }

  private parseVTT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const lines = content.split('\n');
    let i = 0;

    // Skip WEBVTT header and metadata
    while (i < lines.length && !lines[i].includes('-->')) {
      i++;
    }

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.includes('-->')) {
        const [startTime, endTime] = line.split('-->').map((s) => s.trim());
        i++;

        let text = '';
        while (i < lines.length && lines[i].trim() !== '') {
          text += lines[i].trim() + ' ';
          i++;
        }

        if (text.trim()) {
          entries.push({
            startTime,
            endTime,
            text: text.trim(),
          });
        }
      }
      i++;
    }

    return entries;
  }

  private parseSRT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const blocks = content.split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;

      const index = parseInt(lines[0]);
      const timeLine = lines[1];

      if (!timeLine.includes('-->')) continue;

      const [startTime, endTime] = timeLine.split('-->').map((s) => s.trim());
      const text = lines.slice(2).join(' ').trim();

      if (text) {
        entries.push({
          index,
          startTime,
          endTime,
          text,
        });
      }
    }

    return entries;
  }
}

