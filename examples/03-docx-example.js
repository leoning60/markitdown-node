/**
 * DOCX Example
 * 
 * Demonstrates converting Microsoft Word documents
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertDocx() {
  console.log('📝 DOCX Conversion Example\n');

  const converter = new MarkItDown();
  const docxPath = path.join(__dirname, './test-files/docx/test.docx');

  console.log('Converting:', docxPath);
  const result = await converter.convert(docxPath);

  if (result.status === 'success' && result.document) {
    console.log('✅ Conversion successful!\n');

    // Display metadata
    console.log('📋 Metadata:');
    console.log('───────────────────────────────');
    console.log('Filename:', result.document.metadata.filename);
    console.log('Format:', result.document.metadata.format);
    if (result.document.metadata.title) {
      console.log('Title:', result.document.metadata.title);
    }
    if (result.document.metadata.author) {
      console.log('Author:', result.document.metadata.author);
    }
    console.log('───────────────────────────────\n');

    // Analyze content
    console.log('📊 Content Analysis:');
    console.log('───────────────────────────────');
    console.log('Total items:', result.document.content.length);

    // Count by type
    const typeCounts = {};
    result.document.content.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
    console.log('───────────────────────────────\n');

    // Show first few items
    console.log('📄 First 5 content items:');
    console.log('───────────────────────────────');
    result.document.content.slice(0, 5).forEach((item, idx) => {
      console.log(`${idx + 1}. [${item.type}]${item.level ? ` (level ${item.level})` : ''}`);
      if (item.text) {
        const preview = item.text.length > 60 
          ? item.text.substring(0, 60) + '...' 
          : item.text;
        console.log(`   "${preview}"`);
      }
    });
    console.log('───────────────────────────────\n');

    // Output already generated in result.markdown_content and result.json_content!
    console.log('📝 Markdown Output (preview):');
    console.log('───────────────────────────────');
    console.log(result.markdown_content.substring(0, 800));
    console.log('...\n───────────────────────────────\n');

    // Save as single JSON file with both formats
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true});
    
    const outputData = {
      metadata: result.document.metadata,
      json_content: result.json_content,
      markdown_content: result.markdown_content
    };
    
    await fs.writeFile(
      path.join(outputDir, 'docx-example.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 File saved:');
    console.log('   - output/docx-example.json\n');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Run the example
convertDocx().catch(console.error);

