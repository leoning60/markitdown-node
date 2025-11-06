/**
 * HTML Example
 * 
 * Demonstrates converting HTML documents
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertHtml() {
  console.log('🌐 HTML Conversion Example\n');

  const converter = new MarkItDown({
    defaultOptions: {
      extractImages: true,
      extractFormatting: true,
    },
  });

  const htmlPath = path.join(__dirname, './test-files/html/test.html');

  console.log('Converting:', htmlPath);
  const result = await converter.convert(htmlPath);

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
    if (result.document.metadata.url) {
      console.log('URL:', result.document.metadata.url);
    }
    console.log('───────────────────────────────\n');

    // Content statistics
    console.log('📊 Content Statistics:');
    console.log('───────────────────────────────');
    console.log('Total items:', result.document.content.length);

    const typeCounts = {};
    result.document.content.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
    console.log('───────────────────────────────\n');

    // Show content structure
    console.log('📄 Content Structure (first 10 items):');
    console.log('───────────────────────────────');
    result.document.content.slice(0, 10).forEach((item, idx) => {
      const typeInfo = `[${item.type}]${item.level ? ` L${item.level}` : ''}`;
      const textPreview = item.text 
        ? ` "${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}"` 
        : '';
      console.log(`${idx + 1}. ${typeInfo}${textPreview}`);
    });
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
      path.join(outputDir, 'html-example.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 File saved:');
    console.log('   - output/html-example.json\n');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Run the example
convertHtml().catch(console.error);

