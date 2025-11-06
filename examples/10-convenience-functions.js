/**
 * Convenience Functions Example
 * 
 * Demonstrates using the convenience functions for quick conversion
 */

const { 
  convertDocument, 
  convertToJSON, 
  convertToMarkdown 
} = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function useConvenienceFunctions() {
  console.log('⚡ Convenience Functions Example\n');
  
  const outputDir = path.join(__dirname, 'output');
  await fs.mkdir(outputDir, { recursive: true });

  // Example 1: Basic conversion
  console.log('1️⃣  Basic Conversion (convertDocument)');
  console.log('───────────────────────────────');
  const docxPath = path.join(__dirname, './test-files/docx/test.docx');
  const result = await convertDocument(docxPath);
  
  if (result.document) {
    console.log('✅ Success!');
    console.log('   Items:', result.document.content.length);
  }
  console.log('');

  // Example 2: Direct to JSON
  console.log('2️⃣  Direct to JSON (convertToJSON)');
  console.log('───────────────────────────────');
  const pdfPath = path.join(__dirname, './test-files/pdf/test.pdf');
  const jsonOutput = await convertToJSON(pdfPath, 'report.pdf', true);
  
  if (jsonOutput) {
    console.log('✅ Converted to JSON!');
    console.log('   Length:', jsonOutput.length, 'chars');
    
    // Save it
    await fs.writeFile(path.join(outputDir, 'convenience-json.json'), jsonOutput);
    console.log('   Saved to: output/convenience-json.json');
  }
  console.log('');

  // Example 3: Direct to Markdown
  console.log('3️⃣  Direct to Markdown (convertToMarkdown)');
  console.log('───────────────────────────────');
  const htmlPath = path.join(__dirname, './test-files/html/test.html');
  const markdownOutput = await convertToMarkdown(htmlPath, 'article.html');
  
  if (markdownOutput) {
    console.log('✅ Converted to Markdown!');
    console.log('   Length:', markdownOutput.length, 'chars');
    console.log('   Preview:');
    console.log('   ' + markdownOutput.substring(0, 200).replace(/\n/g, '\n   '));
    console.log('   ...');
    
    // Save it
    await fs.writeFile(path.join(outputDir, 'convenience-markdown.md'), markdownOutput);
    console.log('   Saved to: output/convenience-markdown.md');
  }
  console.log('');

  // Example 4: Batch conversion with convenience functions
  console.log('4️⃣  Batch Conversion');
  console.log('───────────────────────────────');
  const files = [
    './test-files/docx/test.docx',
    './test-files/xlsx/test.xlsx',
    './test-files/pptx/1.pptx',
  ];

  for (const file of files) {
    const filePath = path.join(__dirname, file);
    const basename = path.basename(file, path.extname(file));
    
    console.log(`\nProcessing: ${basename}`);
    
    // Convert to both formats
    const json = await convertToJSON(filePath, path.basename(file), true);
    const markdown = await convertToMarkdown(filePath, path.basename(file));
    
    if (json && markdown) {
      await fs.writeFile(path.join(outputDir, `${basename}-conv.json`), json);
      await fs.writeFile(path.join(outputDir, `${basename}-conv.md`), markdown);
      console.log(`✅ Saved both JSON and Markdown`);
    }
  }
  
  console.log('\n' + '═'.repeat(40));
  console.log('✨ All convenience function examples completed!\n');
}

// Run the example
useConvenienceFunctions().catch(console.error);

