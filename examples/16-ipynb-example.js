/**
 * Example: Converting Jupyter Notebooks (.ipynb)
 * This example demonstrates converting Jupyter Notebook files to markdown
 */

const { MarkItDown } = require('markitdown-node');
const fs = require('fs');
const path = require('path');

async function convertIpynbExample() {
  console.log('=== Jupyter Notebook Conversion Example ===\n');

  const converter = new MarkItDown();

  const inputFile = path.join(__dirname, 'test-files', 'ipynb', 'test_notebook.ipynb');
  const outputDir = path.join(__dirname, 'output');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if file exists
  if (!fs.existsSync(inputFile)) {
    console.log(`⚠ Test file not found: ${inputFile}`);
    console.log('This example requires a Jupyter notebook in test-files/ipynb/');
    return;
  }

  console.log(`Converting: ${inputFile}`);

  try {
    const result = await converter.convert(inputFile, 'test_notebook.ipynb');

    if (result.status === 'success') {
      console.log('✓ Conversion successful!');
      console.log(`Status: ${result.status}`);
      console.log(`Document format: ${result.document.metadata.format}`);
      console.log(`Title: ${result.document.metadata.title || 'Untitled'}`);
      console.log(`Content items: ${result.document.content.length}`);

      // Count different cell types
      const cellTypeCounts = {
        markdown: 0,
        code: 0,
        output: 0,
      };

      result.document.content.forEach(item => {
        if (item.type === 'code') cellTypeCounts.code++;
        else if (item.metadata?.isOutput) cellTypeCounts.output++;
        else cellTypeCounts.markdown++;
      });

      console.log('\n--- Cell Type Breakdown ---');
      console.log(`Markdown cells: ${cellTypeCounts.markdown}`);
      console.log(`Code cells: ${cellTypeCounts.code}`);
      console.log(`Output cells: ${cellTypeCounts.output}`);

      // Display preview of markdown output
      console.log('\n--- Markdown Preview (first 500 chars) ---');
      const preview = result.markdown_content.substring(0, 500);
      console.log(preview + (result.markdown_content.length > 500 ? '\n...' : ''));

      // Save outputs
      const outputData = {
        metadata: result.document.metadata,
        json_content: result.json_content,
        markdown_content: result.markdown_content,
      };

      // Save as JSON
      fs.writeFileSync(
        path.join(outputDir, 'ipynb-example.json'),
        JSON.stringify(outputData, null, 2)
      );

      // Save markdown separately
      fs.writeFileSync(
        path.join(outputDir, 'ipynb-example.md'),
        result.markdown_content
      );

      console.log('\n✓ Output saved to:');
      console.log('  - output/ipynb-example.json');
      console.log('  - output/ipynb-example.md');

      // Notes
      console.log('\n📝 Features:');
      console.log('  ✓ Extracts markdown cells');
      console.log('  ✓ Extracts code cells with syntax highlighting');
      console.log('  ✓ Includes cell execution outputs');
      console.log('  ✓ Preserves notebook structure and formatting');
    } else {
      console.log('✗ Conversion failed');
      console.log('Errors:', result.errors);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n=== Example Complete ===');
}

// Run the example
convertIpynbExample().catch(console.error);

