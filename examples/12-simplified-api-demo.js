/**
 * Simplified API Demo
 * 
 * Demonstrates the new simplified API where json_content and markdown_content
 * are automatically generated - no need to call exporters!
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function simplifiedAPIDemo() {
  console.log('✨ Simplified API Demo\n');
  console.log('No need to import MarkdownExporter or JSONExporter!');
  console.log('json_content and markdown_content are auto-generated.\n');
  console.log('═'.repeat(60) + '\n');

  const converter = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'chi_sim+eng'
    }
  });

  const imagePath = path.join(__dirname, './test-files/images/1.jpeg');

  console.log('📷 Converting image...\n');
  const result = await converter.convert(imagePath);

  if (result.status === 'success') {
    console.log('✅ Conversion successful!\n');

    // 1. Access the document object as before
    console.log('1️⃣  Document object (for programmatic access):');
    console.log('   - Metadata:', {
      format: result.document.metadata.format,
      width: result.document.metadata.width,
      height: result.document.metadata.height,
    });
    console.log('   - Content items:', result.document.content.length);
    console.log('');

    // 2. NEW: json_content is already available!
    console.log('2️⃣  JSON content (auto-generated):');
    console.log('   ✓ result.json_content is ready to use (content array)');
    console.log('   ✓ No need to call JSONExporter.export()');
    console.log('   Preview:');
    console.log('   ' + JSON.stringify(result.json_content, null, 2).substring(0, 200).replace(/\n/g, '\n   '));
    console.log('   ...\n');

    // 3. NEW: markdown_content is already available!
    console.log('3️⃣  Markdown content (auto-generated):');
    console.log('   ✓ result.markdown_content is ready to use');
    console.log('   ✓ No need to call MarkdownExporter.export()');
    console.log('   Preview:');
    console.log('   ' + result.markdown_content.substring(0, 300).replace(/\n/g, '\n   '));
    console.log('   ...\n');

    // Save as a single JSON file containing everything!
    console.log('4️⃣  Saving output (single JSON file with both formats):');
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Create output with metadata, json_content (array), and markdown_content (string)
    const outputData = {
      metadata: result.document.metadata,
      json_content: result.json_content,      // Content array
      markdown_content: result.markdown_content  // Markdown string
    };
    
    await fs.writeFile(
      path.join(outputDir, 'simplified-demo.json'), 
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('   ✅ Saved to output/simplified-demo.json');
    console.log('   ✓ Contains: metadata, json_content (array), markdown_content (string)\n');

    // Show the difference
    console.log('═'.repeat(60));
    console.log('\n📝 Old way (complex):');
    console.log('   ```javascript');
    console.log('   const { MarkItDown, MarkdownExporter, JSONExporter }');
    console.log('     = require("markitdown-node");');
    console.log('   const result = await converter.convert(path);');
    console.log('   const json = JSONExporter.export(result.document);');
    console.log('   const md = MarkdownExporter.export(result.document);');
    console.log('   ```\n');

    console.log('✨ New way (simple):');
    console.log('   ```javascript');
    console.log('   const { MarkItDown } = require("markitdown-node");');
    console.log('   const result = await converter.convert(path);');
    console.log('   // json_content and markdown_content are ready!');
    console.log('   const output = {');
    console.log('     metadata: result.document.metadata,');
    console.log('     json_content: result.json_content,      // content array');
    console.log('     markdown_content: result.markdown_content  // markdown string');
    console.log('   };');
    console.log('   await fs.writeFile("out.json", JSON.stringify(output, null, 2));');
    console.log('   ```\n');

    console.log('═'.repeat(60));
    console.log('\n🎉 Much simpler! No more exporter imports needed!\n');
  } else {
    console.error('❌ Conversion failed:', result.errors);
  }
}

// Run the demo
simplifiedAPIDemo().catch(console.error);

