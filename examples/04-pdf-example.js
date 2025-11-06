/**
 * PDF Example
 * 
 * Demonstrates converting PDF documents
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertPdf() {
  console.log('📕 PDF Conversion Example\n');

  const converter = new MarkItDown();
  const pdfPath = path.join(__dirname, './test-files/pdf/test.pdf');

  console.log('Converting:', pdfPath);
  const result = await converter.convert(pdfPath);

  if (result.status === 'success' && result.document) {
    console.log('✅ Conversion successful!\n');

    // Display metadata
    console.log('📋 Metadata:');
    console.log('───────────────────────────────');
    console.log('Filename:', result.document.metadata.filename);
    console.log('Format:', result.document.metadata.format);
    if (result.document.metadata.pageCount) {
      console.log('Pages:', result.document.metadata.pageCount);
    }
    if (result.document.metadata.title) {
      console.log('Title:', result.document.metadata.title);
    }
    console.log('───────────────────────────────\n');

    // Content statistics
    console.log('📊 Content Statistics:');
    console.log('───────────────────────────────');
    console.log('Total items:', result.document.content.length);

    const typeCounts = {};
    const textLengths = [];
    result.document.content.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      if (item.text) {
        textLengths.push(item.text.length);
      }
    });

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });

    if (textLengths.length > 0) {
      const totalChars = textLengths.reduce((a, b) => a + b, 0);
      console.log(`\nTotal characters: ${totalChars}`);
      console.log(`Average per item: ${Math.round(totalChars / textLengths.length)}`);
    }
    console.log('───────────────────────────────\n');

    // Output already generated in result.markdown_content and result.json_content!
    console.log('📝 Markdown Output (first 1000 chars):');
    console.log('───────────────────────────────');
    console.log(result.markdown_content.substring(0, 1000));
    console.log('...\n───────────────────────────────\n');

    // Save as single JSON file with both formats
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputData = {
      metadata: result.document.metadata,
      json_content: result.json_content,
      markdown_content: result.markdown_content
    };
    
    await fs.writeFile(
      path.join(outputDir, 'pdf-example.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 File saved:');
    console.log('   - output/pdf-example.json\n');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Run the example
convertPdf().catch(console.error);

