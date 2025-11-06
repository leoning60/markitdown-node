/**
 * NPM Usage Template
 * 
 * This file demonstrates how to use markitdown-node
 * after installing it via npm in your own project.
 * 
 * Installation:
 *   npm install markitdown-node
 * 
 * Note: This file is a template for reference.
 * To run the actual examples, use the other numbered files.
 */

// ===================================================================
// METHOD 1: Using the package after npm install or npm link
// ===================================================================

// This now works both for:
// - npm install (uses published package)
// - npm link markitdown-node (uses local development version)
// See SETUP.md for details on how to set up npm link
const { MarkItDown, MarkdownExporter, JSONExporter } = require('markitdown-node');

const path = require('path');
const fs = require('fs').promises;

// ===================================================================
// EXAMPLE 1: Basic Document Conversion
// ===================================================================

async function example1_basicConversion() {
  console.log('Example 1: Basic Conversion\n');

  const converter = new MarkItDown();
  
  // Convert a document
  const result = await converter.convert('./path/to/document.pdf');

  if (result.status === 'success' && result.document) {
    console.log('✅ Success!');
    console.log('Document has', result.document.content.length, 'items');
  } else {
    console.error('❌ Error:', result.error);
  }
}

// ===================================================================
// EXAMPLE 2: Convert to Markdown
// ===================================================================

async function example2_toMarkdown() {
  console.log('Example 2: Convert to Markdown\n');

  const converter = new MarkItDown();
  const result = await converter.convert('./document.docx');

  if (result.document) {
    const markdown = MarkdownExporter.export(result.document, {
      includeMetadata: true,
      preserveFormatting: true,
    });

    await fs.writeFile('./output.md', markdown);
    console.log('✅ Saved to output.md');
  }
}

// ===================================================================
// EXAMPLE 3: Convert to JSON
// ===================================================================

async function example3_toJSON() {
  console.log('Example 3: Convert to JSON\n');

  const converter = new MarkItDown();
  const result = await converter.convert('./document.pdf');

  if (result.document) {
    const json = JSONExporter.export(result.document, {
      pretty: true,
      indent: 2,
    });

    await fs.writeFile('./output.json', json);
    console.log('✅ Saved to output.json');
  }
}

// ===================================================================
// EXAMPLE 4: Using Convenience Functions
// ===================================================================

async function example4_convenience() {
  console.log('Example 4: Convenience Functions\n');

  // Import convenience functions
  const { convertToJSON, convertToMarkdown } = require('markitdown-node');

  // Quick conversion to JSON
  const json = await convertToJSON('./document.pdf', 'document.pdf', true);
  if (json) {
    await fs.writeFile('./quick.json', json);
  }

  // Quick conversion to Markdown
  const markdown = await convertToMarkdown('./document.docx', 'document.docx');
  if (markdown) {
    await fs.writeFile('./quick.md', markdown);
  }

  console.log('✅ Quick conversions done!');
}

// ===================================================================
// EXAMPLE 5: Batch Processing Multiple Files
// ===================================================================

async function example5_batchProcessing() {
  console.log('Example 5: Batch Processing\n');

  const converter = new MarkItDown();
  const files = [
    './doc1.pdf',
    './doc2.docx',
    './doc3.xlsx',
  ];

  for (const file of files) {
    try {
      const result = await converter.convert(file);
      
      if (result.document) {
        const markdown = MarkdownExporter.export(result.document);
        const outputFile = file.replace(/\.[^.]+$/, '.md');
        await fs.writeFile(outputFile, markdown);
        console.log('✅', file, '→', outputFile);
      }
    } catch (error) {
      console.error('❌', file, 'Error:', error.message);
    }
  }
}

// ===================================================================
// EXAMPLE 6: Advanced Configuration
// ===================================================================

async function example6_advanced() {
  console.log('Example 6: Advanced Configuration\n');

  // Configure converter with specific options
  const converter = new MarkItDown({
    allowedFormats: ['pdf', 'docx', 'xlsx'], // Limit to specific formats
    defaultOptions: {
      extractImages: true,
      extractTables: true,
      extractFormatting: true,
    },
  });

  const result = await converter.convert('./document.xlsx');

  if (result.document) {
    // Filter for specific content types
    const tables = result.document.content.filter(item => item.type === 'table');
    console.log('Found', tables.length, 'tables');

    // Export with custom options
    const markdown = MarkdownExporter.export(result.document, {
      includeMetadata: true,
      headingStyle: 'atx',        // Use # for headings
      bulletChar: '-',            // Use - for bullets
      codeBlockStyle: 'fenced',   // Use ``` for code
      preserveFormatting: true,
    });

    await fs.writeFile('./advanced.md', markdown);
  }
}

// ===================================================================
// EXAMPLE 7: Error Handling
// ===================================================================

async function example7_errorHandling() {
  console.log('Example 7: Error Handling\n');

  const converter = new MarkItDown();

  try {
    const result = await converter.convert('./document.pdf');

    if (result.status === 'success' && result.document) {
      console.log('✅ Success');
    } else if (result.status === 'error') {
      console.error('❌ Conversion error:', result.error);
    } else if (result.status === 'unsupported') {
      console.error('❌ Unsupported format');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

// ===================================================================
// EXAMPLE 8: Working with Document Structure
// ===================================================================

async function example8_documentStructure() {
  console.log('Example 8: Working with Document Structure\n');

  const converter = new MarkItDown();
  const result = await converter.convert('./document.docx');

  if (result.document) {
    // Access metadata
    console.log('Title:', result.document.metadata.title);
    console.log('Format:', result.document.metadata.format);
    console.log('Filename:', result.document.metadata.filename);

    // Analyze content
    const typeCounts = {};
    result.document.content.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    console.log('Content types:', typeCounts);

    // Find headings
    const headings = result.document.content.filter(item => 
      item.type === 'heading'
    );
    console.log('Found', headings.length, 'headings');

    // Find tables
    const tables = result.document.content.filter(item => 
      item.type === 'table'
    );
    console.log('Found', tables.length, 'tables');
  }
}

// ===================================================================
// EXAMPLE 9: Extract Specific Content
// ===================================================================

async function example9_extractContent() {
  console.log('Example 9: Extract Specific Content\n');

  const converter = new MarkItDown();
  const result = await converter.convert('./document.docx');

  if (result.document) {
    // Extract all text
    const allText = result.document.content
      .filter(item => item.text)
      .map(item => item.text)
      .join('\n');

    console.log('Total characters:', allText.length);

    // Extract tables as data
    const tables = result.document.content
      .filter(item => item.type === 'table')
      .map(table => {
        return table.rows?.map(row => 
          row.cells.map(cell => cell.text || '')
        );
      });

    console.log('Extracted', tables.length, 'tables');

    // Save extracted data
    await fs.writeFile('./extracted-text.txt', allText);
    await fs.writeFile('./extracted-tables.json', JSON.stringify(tables, null, 2));
  }
}

// ===================================================================
// DEMO: Run a practical example with local test files
// ===================================================================

async function demo() {
  console.log('='.repeat(60));
  console.log('Content Extract Local - NPM Usage Demo');
  console.log('='.repeat(60));
  console.log('');

  // Use a real test file
  const testFile = path.join(__dirname, './test-files/docx/test.docx');
  
  if (!await fs.access(testFile).then(() => true).catch(() => false)) {
    console.log('Note: Test file not found. Update paths for your files.');
    console.log('This is a template showing how to use the package.\n');
    return;
  }

  const converter = new MarkItDown();
  const result = await converter.convert(testFile);

  if (result.status === 'success' && result.document) {
    console.log('✅ Successfully converted document!');
    console.log('');
    console.log('📋 Metadata:');
    console.log('   Filename:', result.document.metadata.filename);
    console.log('   Format:', result.document.metadata.format);
    console.log('   Items:', result.document.content.length);
    console.log('');

    // Export examples
    const markdown = MarkdownExporter.export(result.document);
    const json = JSONExporter.export(result.document, { pretty: true });

    // Save outputs
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    await fs.writeFile(path.join(outputDir, 'npm-demo.md'), markdown);
    await fs.writeFile(path.join(outputDir, 'npm-demo.json'), json);

    console.log('💾 Output saved:');
    console.log('   - examples/output/npm-demo.md');
    console.log('   - examples/output/npm-demo.json');
    console.log('');
    console.log('Preview:');
    console.log(markdown.substring(0, 300));
    console.log('...\n');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }

  console.log('='.repeat(60));
  console.log('Check the other example files for more use cases:');
  console.log('  - 01-quick-start.js');
  console.log('  - 02-all-formats.js');
  console.log('  - 03-docx-example.js');
  console.log('  - ... and more');
  console.log('='.repeat(60));
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demo().catch(console.error);
}

// Export examples for reference
module.exports = {
  example1_basicConversion,
  example2_toMarkdown,
  example3_toJSON,
  example4_convenience,
  example5_batchProcessing,
  example6_advanced,
  example7_errorHandling,
  example8_documentStructure,
  example9_extractContent,
};

