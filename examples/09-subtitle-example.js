/**
 * Subtitle Example
 * 
 * Demonstrates converting subtitle files (SRT, VTT)
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertSubtitle() {
  console.log('💬 Subtitle Conversion Example\n');

  const converter = new MarkItDown();
  const srtPath = path.join(__dirname, './test-files/subtitles/1.srt');

  console.log('Converting:', srtPath);
  const result = await converter.convert(srtPath);

  if (result.status === 'success' && result.document) {
    console.log('✅ Conversion successful!\n');

    // Display metadata
    console.log('📋 Metadata:');
    console.log('───────────────────────────────');
    console.log('Filename:', result.document.metadata.filename);
    console.log('Format:', result.document.metadata.format);
    if (result.document.metadata.duration) {
      console.log('Duration:', result.document.metadata.duration);
    }
    if (result.document.metadata.subtitleCount) {
      console.log('Subtitle entries:', result.document.metadata.subtitleCount);
    }
    console.log('───────────────────────────────\n');

    // Content analysis
    console.log('📊 Content Analysis:');
    console.log('───────────────────────────────');
    console.log('Total items:', result.document.content.length);

    // Count words
    let totalWords = 0;
    result.document.content.forEach(item => {
      if (item.text) {
        totalWords += item.text.split(/\s+/).length;
      }
    });
    console.log('Total words:', totalWords);
    console.log('Average words per entry:', Math.round(totalWords / result.document.content.length));
    console.log('───────────────────────────────\n');

    // Show first few subtitle entries
    console.log('💬 First 10 subtitle entries:');
    console.log('───────────────────────────────');
    result.document.content.slice(0, 10).forEach((item, idx) => {
      if (item.metadata?.timestamp) {
        console.log(`${idx + 1}. [${item.metadata.timestamp}]`);
      } else {
        console.log(`${idx + 1}.`);
      }
      if (item.text) {
        console.log(`   ${item.text}`);
      }
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
      path.join(outputDir, 'subtitle-example.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 File saved:');
    console.log('   - output/subtitle-example.json\n');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Run the example
convertSubtitle().catch(console.error);

