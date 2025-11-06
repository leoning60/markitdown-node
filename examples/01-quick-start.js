/**
 * Quick Start Example
 * 
 * Demonstrates the simplest way to use markitdown-node
 * 
 * Setup:
 * 1. For npm package: cd examples && npm install
 * 2. For local development: cd examples && npm link markitdown-node
 *    (See SETUP.md for details)
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function quickStart() {
  console.log('🚀 Quick Start Example\n');

  // Create converter
  const converter = new MarkItDown();

  // Convert a DOCX document
  const docxPath = path.join(__dirname, './test-files/docx/test.docx');
  console.log('Converting:', docxPath);

  const result = await converter.convert(docxPath);

  if (result.status === 'success' && result.document) {
    console.log('✅ Conversion successful!');
    console.log('Metadata:', {
      filename: result.document.metadata.filename,
      format: result.document.metadata.format,
      itemCount: result.document.content.length,
    });

    // Output is already generated in json_content and markdown_content!
    console.log('\n📝 Markdown preview (first 500 chars):');
    console.log(result.markdown_content.substring(0, 500) + '...\n');

    console.log('📊 JSON Content preview:');
    console.log(JSON.stringify(result.json_content, null, 2).substring(0, 500) + '...\n');

    // Save to single JSON file with both formats
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputData = {
      metadata: result.document.metadata,
      json_content: result.json_content,
      markdown_content: result.markdown_content
    };
    
    await fs.writeFile(
      path.join(outputDir, 'quick-start.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 Saved to examples/output/quick-start.json');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Run the example
quickStart().catch(console.error);

