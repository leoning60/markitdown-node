/**
 * Ipynb Backend - Converts Jupyter Notebook files to structured format
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

interface NotebookCell {
  cell_type: string;
  source: string[];
  outputs?: any[];
  execution_count?: number | null;
  metadata?: any;
}

interface NotebookContent {
  cells: NotebookCell[];
  metadata?: {
    title?: string;
    kernelspec?: {
      language?: string;
      name?: string;
    };
    [key: string]: any;
  };
  nbformat?: number;
  nbformat_minor?: number;
}

export class IpynbBackend extends AbstractBackend {
  constructor(options: BackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.IPYNB;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source)
        ? source
        : await fs.promises.readFile(source);

      const text = buffer.toString('utf-8');
      const data = JSON.parse(text);

      // Check if it has the structure of a Jupyter notebook
      return (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.cells) &&
        (data.nbformat !== undefined || data.metadata !== undefined)
      );
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source)
      ? source
      : await fs.promises.readFile(source);

    const notebookContent: NotebookContent = JSON.parse(buffer.toString('utf-8'));
    const content: DocumentItem[] = [];
    let title: string | null = null;

    // Extract title from metadata or first markdown heading
    title = notebookContent.metadata?.title || null;

    // Process each cell
    for (const cell of notebookContent.cells || []) {
      const cellType = cell.cell_type || '';
      const sourceLines: string[] = cell.source || [];
      const sourceText = Array.isArray(sourceLines)
        ? sourceLines.join('')
        : String(sourceLines);

      if (cellType === 'markdown') {
        // Parse markdown cells
        this.parseMarkdownCell(sourceText, content);

        // Try to extract title from first heading
        if (!title) {
          const match = sourceText.match(/^#\s+(.+)$/m);
          if (match) {
            title = match[1].trim();
          }
        }
      } else if (cellType === 'code') {
        // Add code cell
        const language = notebookContent.metadata?.kernelspec?.language || 'python';

        content.push({
          type: DocumentItemType.CODE,
          text: sourceText.trim(),
          metadata: {
            language,
            executionCount: cell.execution_count,
          },
        });

        // Add outputs if any
        if (cell.outputs && cell.outputs.length > 0) {
          const outputText = this.extractOutputs(cell.outputs);
          if (outputText) {
            content.push({
              type: DocumentItemType.PARAGRAPH,
              text: `**Output:**\n${outputText}`,
              metadata: {
                isOutput: true,
              },
            });
          }
        }
      } else if (cellType === 'raw') {
        // Add raw cells as code blocks
        content.push({
          type: DocumentItemType.CODE,
          text: sourceText.trim(),
          metadata: {
            language: 'text',
            cellType: 'raw',
          },
        });
      }
    }

    return {
      metadata: {
        filename: filename || 'notebook.ipynb',
        format: InputFormat.IPYNB,
        title: title || 'Jupyter Notebook',
        author: notebookContent.metadata?.authors?.[0]?.name,
      },
      content,
    };
  }

  private parseMarkdownCell(markdown: string, content: DocumentItem[]): void {
    // Split markdown by lines and parse headings and paragraphs
    const lines = markdown.split('\n');
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join('\n').trim();
        if (text) {
          content.push({
            type: DocumentItemType.PARAGRAPH,
            text,
          });
        }
        currentParagraph = [];
      }
    };

    for (const line of lines) {
      // Check for headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();

        content.push({
          type: level === 1 ? DocumentItemType.TITLE : DocumentItemType.HEADING,
          text,
          level,
        });
      } else if (line.trim() === '') {
        // Empty line - end current paragraph
        flushParagraph();
      } else {
        // Regular content
        currentParagraph.push(line);
      }
    }

    flushParagraph();
  }

  private extractOutputs(outputs: any[]): string {
    const outputTexts: string[] = [];

    for (const output of outputs) {
      if (output.output_type === 'stream') {
        // Stream output (stdout, stderr)
        if (output.text) {
          const text = Array.isArray(output.text)
            ? output.text.join('')
            : String(output.text);
          outputTexts.push(text);
        }
      } else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
        // Execution result or display data
        if (output.data) {
          // Prefer text/plain representation
          if (output.data['text/plain']) {
            const text = Array.isArray(output.data['text/plain'])
              ? output.data['text/plain'].join('')
              : String(output.data['text/plain']);
            outputTexts.push(text);
          } else if (output.data['text/html']) {
            outputTexts.push('[HTML output]');
          } else if (output.data['image/png']) {
            outputTexts.push('[Image output: PNG]');
          } else if (output.data['image/jpeg']) {
            outputTexts.push('[Image output: JPEG]');
          }
        }
      } else if (output.output_type === 'error') {
        // Error output
        const errorName = output.ename || 'Error';
        const errorValue = output.evalue || '';
        outputTexts.push(`**Error:** ${errorName}: ${errorValue}`);
      }
    }

    return outputTexts.join('\n\n').trim();
  }
}

