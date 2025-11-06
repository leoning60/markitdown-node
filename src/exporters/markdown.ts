/**
 * Markdown Exporter - Export document to Markdown format
 */

import { Document, DocumentItem, DocumentItemType, TableItem } from '../types';

export interface MarkdownExportOptions {
  includeMetadata?: boolean;
  headingStyle?: 'atx' | 'setext'; // # style or underline style
  bulletChar?: string; // -, *, +
  codeBlockStyle?: 'fenced' | 'indented';
  preserveFormatting?: boolean;
}

export class MarkdownExporter {
  private options: Required<MarkdownExportOptions>;

  constructor(options: MarkdownExportOptions = {}) {
    this.options = {
      includeMetadata: options.includeMetadata ?? true,
      headingStyle: options.headingStyle ?? 'atx',
      bulletChar: options.bulletChar ?? '-',
      codeBlockStyle: options.codeBlockStyle ?? 'fenced',
      preserveFormatting: options.preserveFormatting ?? true,
    };
  }

  /**
   * Export document to Markdown string
   */
  export(document: Document): string {
    const parts: string[] = [];

    // Add metadata as frontmatter if requested
    if (this.options.includeMetadata) {
      parts.push(this.exportMetadata(document.metadata));
    }

    // Add content
    parts.push(this.exportContent(document.content));

    return parts.filter(Boolean).join('\n\n');
  }

  private exportMetadata(metadata: any): string {
    const lines = ['---'];

    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined && value !== null) {
        lines.push(`${key}: ${JSON.stringify(value)}`);
      }
    }

    lines.push('---');
    return lines.join('\n');
  }

  private exportContent(items: DocumentItem[], level = 0): string {
    return items.map((item) => this.exportItem(item, level)).join('\n\n');
  }

  private exportItem(item: DocumentItem, level = 0): string {
    switch (item.type) {
      case DocumentItemType.HEADING:
        return this.exportHeading(item);

      case DocumentItemType.TITLE:
        return this.exportTitle(item);

      case DocumentItemType.PARAGRAPH:
      case DocumentItemType.TEXT:
        return this.exportText(item);

      case DocumentItemType.LIST:
        return this.exportList(item, level);

      case DocumentItemType.LIST_ITEM:
        return this.exportListItem(item, level);

      case DocumentItemType.TABLE:
        return this.exportTable(item as TableItem);

      case DocumentItemType.CODE:
        return this.exportCode(item);

      case DocumentItemType.FORMULA:
        return this.exportFormula(item);

      case DocumentItemType.IMAGE:
        return this.exportImage(item);

      case DocumentItemType.SECTION:
        return this.exportSection(item, level);

      default:
        return item.text || '';
    }
  }

  private exportHeading(item: DocumentItem): string {
    const level = item.level || 1;
    const text = item.text || '';

    if (this.options.headingStyle === 'atx') {
      return `${'#'.repeat(level)} ${text}`;
    } else {
      // Setext style (only for h1 and h2)
      if (level === 1) {
        return `${text}\n${'='.repeat(text.length)}`;
      } else if (level === 2) {
        return `${text}\n${'-'.repeat(text.length)}`;
      } else {
        return `${'#'.repeat(level)} ${text}`;
      }
    }
  }

  private exportTitle(item: DocumentItem): string {
    return `# ${item.text || ''}`;
  }

  private exportText(item: DocumentItem): string {
    let text = item.text || '';

    if (this.options.preserveFormatting && item.formatting) {
      const { bold, italic, underline, strikethrough } = item.formatting;

      if (bold) text = `**${text}**`;
      if (italic) text = `*${text}*`;
      if (strikethrough) text = `~~${text}~~`;
      // Note: Markdown doesn't have native underline support
    }

    return text;
  }

  private exportList(item: DocumentItem, level: number): string {
    const isOrdered = item.metadata?.ordered === true;
    const children = item.children || [];

    return children
      .map((child, index) => {
        const prefix = isOrdered ? `${index + 1}.` : this.options.bulletChar;
        const indent = '  '.repeat(level);
        const text = child.text || '';

        let result = `${indent}${prefix} ${text}`;

        // Handle nested lists
        if (child.children && child.children.length > 0) {
          const nested = this.exportContent(child.children, level + 1);
          result += '\n' + nested;
        }

        return result;
      })
      .join('\n');
  }

  private exportListItem(item: DocumentItem, level: number): string {
    const indent = '  '.repeat(level);
    return `${indent}${this.options.bulletChar} ${item.text || ''}`;
  }

  private exportTable(item: TableItem): string {
    const rows = item.rows || [];
    if (rows.length === 0) return '';

    const lines: string[] = [];

    // Header row
    const headerRow = rows[0].map((cell) => cell.text || '').join(' | ');
    lines.push(`| ${headerRow} |`);

    // Separator
    const separator = rows[0].map(() => '---').join(' | ');
    lines.push(`| ${separator} |`);

    // Data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].map((cell) => cell.text || '').join(' | ');
      lines.push(`| ${row} |`);
    }

    return lines.join('\n');
  }

  private exportCode(item: DocumentItem): string {
    const code = item.text || '';

    if (this.options.codeBlockStyle === 'fenced') {
      return `\`\`\`\n${code}\n\`\`\``;
    } else {
      return code.split('\n').map((line) => `    ${line}`).join('\n');
    }
  }

  private exportFormula(item: DocumentItem): string {
    const formula = item.text || '';
    return `$$${formula}$$`;
  }

  private exportImage(item: DocumentItem): string {
    const alt = item.metadata?.alt || item.text || '';
    const src = item.metadata?.src || '';
    return `![${alt}](${src})`;
  }

  private exportSection(item: DocumentItem, level: number): string {
    if (!item.children) return '';
    return this.exportContent(item.children, level);
  }

  /**
   * Static export method for convenience
   */
  static export(document: Document, options?: MarkdownExportOptions): string {
    const exporter = new MarkdownExporter(options);
    return exporter.export(document);
  }
}

