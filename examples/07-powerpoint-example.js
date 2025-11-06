/**
 * PowerPoint (PPTX) Example
 * 
 * Demonstrates converting PowerPoint presentations
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertPowerPoint() {
  console.log('📽️  PowerPoint (PPTX) Conversion Example\n');

  const converter = new MarkItDown();
  const pptxPath = path.join(__dirname, './test-files/pptx/1.pptx');

  console.log('Converting:', pptxPath);
  const result = await converter.convert(pptxPath);

  if (result.status === 'success' && result.document) {
    console.log('✅ Conversion successful!\n');

    // Display metadata
    console.log('📋 Metadata:');
    console.log('───────────────────────────────');
    console.log('Filename:', result.document.metadata.filename);
    console.log('Format:', result.document.metadata.format);
    if (result.document.metadata.slideCount) {
      console.log('Slides:', result.document.metadata.slideCount);
    }
    if (result.document.metadata.title) {
      console.log('Title:', result.document.metadata.title);
    }
    console.log('───────────────────────────────\n');

    // Analyze content by slide
    console.log('📊 Content Analysis:');
    console.log('───────────────────────────────');
    console.log('Total items:', result.document.content.length);

    // Group by slide
    const slideGroups = {};
    result.document.content.forEach(item => {
      const slide = item.metadata?.slideNumber || 'unknown';
      if (!slideGroups[slide]) {
        slideGroups[slide] = [];
      }
      slideGroups[slide].push(item);
    });

    console.log('Slides with content:', Object.keys(slideGroups).length);
    
    // Show first few slides
    Object.entries(slideGroups).slice(0, 3).forEach(([slideNum, items]) => {
      console.log(`\nSlide ${slideNum}:`);
      console.log(`  Items: ${items.length}`);
      items.slice(0, 3).forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${item.type}]${item.text ? ` "${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}"` : ''}`);
      });
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
      path.join(outputDir, 'powerpoint-example.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 File saved:');
    console.log('   - output/powerpoint-example.json\n');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Run the example
convertPowerPoint().catch(console.error);

