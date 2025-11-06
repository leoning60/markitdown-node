/**
 * All Formats Example
 * 
 * Demonstrates how to convert all supported document formats
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertAllFormats() {
  console.log('📚 Converting All Document Formats\n');

  const converter = new MarkItDown();
  const outputDir = path.join(__dirname, 'output');
  await fs.mkdir(outputDir, { recursive: true });

  // List of test files
  const testFiles = [
    { file: 'docx/test.docx', name: 'DOCX Document' },
    { file: 'pdf/test.pdf', name: 'PDF Document' },
    { file: 'pptx/1.pptx', name: 'PowerPoint Presentation' },
    { file: 'xlsx/test.xlsx', name: 'Excel Spreadsheet' },
    { file: 'html/test.html', name: 'HTML Page' },
    { file: 'subtitles/1.srt', name: 'SRT Subtitle' },
    { file: 'images/1.jpeg', name: 'JPEG Image' },
    { file: 'images/test.jpg', name: 'JPG Image' },
  ];

  const results = [];

  for (const testFile of testFiles) {
    const filePath = path.join(__dirname, './test-files', testFile.file);
    
    console.log(`\n📄 Converting: ${testFile.name}`);
    console.log(`   File: ${testFile.file}`);

    try {
      const result = await converter.convert(filePath);

      if (result.status === 'success' && result.document) {
        console.log('   ✅ Success!');
        console.log(`   - Format: ${result.document.metadata.format}`);
        console.log(`   - Content items: ${result.document.content.length}`);
        
        // Count different item types
        const typeCounts = {};
        result.document.content.forEach(item => {
          typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });
        console.log('   - Types:', Object.entries(typeCounts)
          .map(([type, count]) => `${type}(${count})`)
          .join(', '));

        // Save as single JSON file with both formats
        const baseName = testFile.file.replace(/[\/\\]/g, '-').replace(/\.[^.]+$/, '');
        const outputData = {
          metadata: result.document.metadata,
          json_content: result.json_content,
          markdown_content: result.markdown_content
        };
        await fs.writeFile(
          path.join(outputDir, `${baseName}.json`),
          JSON.stringify(outputData, null, 2)
        );

        results.push({
          name: testFile.name,
          status: 'success',
          itemCount: result.document.content.length,
        });
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        results.push({
          name: testFile.name,
          status: 'failed',
          error: result.error,
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        name: testFile.name,
        status: 'error',
        error: error.message,
      });
    }
  }

  // Summary
  console.log('\n\n📊 Summary\n');
  console.log('═'.repeat(60));
  results.forEach((r, i) => {
    const icon = r.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${testFiles[i].name}`);
    if (r.status === 'success') {
      console.log(`   Items: ${r.itemCount}`);
    } else {
      console.log(`   Error: ${r.error}`);
    }
  });
  console.log('═'.repeat(60));

  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\n✨ Converted ${successCount}/${results.length} files successfully`);
  console.log(`💾 Output saved to: ${outputDir}\n`);
}

// Run the example
convertAllFormats().catch(console.error);

