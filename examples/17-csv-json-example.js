/**
 * Example: Converting CSV and JSON Files
 * This example demonstrates converting structured data formats
 */

const { MarkItDown } = require('markitdown-node');
const fs = require('fs');
const path = require('path');

async function convertCsvJsonExample() {
  console.log('=== CSV and JSON Conversion Example ===\n');

  const converter = new MarkItDown();
  const outputDir = path.join(__dirname, 'output');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Example 1: Convert CSV file
  console.log('1. Converting CSV file...');
  const csvFile = path.join(__dirname, 'test-files', 'csv', 'gender_submission.csv');
  
  if (fs.existsSync(csvFile)) {
    try {
      const csvResult = await converter.convert(csvFile, 'gender_submission.csv');

      if (csvResult.status === 'success') {
        console.log('✓ CSV conversion successful!');
        console.log(`  Content items: ${csvResult.document.content.length}`);
        
        // Find table item
        const table = csvResult.document.content.find(item => item.type === 'table');
        if (table) {
          console.log(`  Table size: ${table.numRows} rows × ${table.numCols} columns`);
        }

        // Show preview
        console.log('\n--- CSV Markdown Preview ---');
        const csvPreview = csvResult.markdown_content.split('\n').slice(0, 10).join('\n');
        console.log(csvPreview);
        console.log('...\n');

        // Save output
        fs.writeFileSync(
          path.join(outputDir, 'csv-example.json'),
          JSON.stringify({
            metadata: csvResult.document.metadata,
            json_content: csvResult.json_content,
            markdown_content: csvResult.markdown_content,
          }, null, 2)
        );

        fs.writeFileSync(
          path.join(outputDir, 'csv-example.md'),
          csvResult.markdown_content
        );

        console.log('✓ CSV output saved');
      }
    } catch (error) {
      console.error('CSV conversion error:', error.message);
    }
  } else {
    console.log(`⚠ CSV file not found: ${csvFile}`);
  }

  // Example 2: Convert JSON file
  console.log('\n2. Converting JSON file...');
  
  // Create a sample JSON file
  const sampleJson = {
    title: 'Sample Data',
    description: 'This is a test JSON document with structured data',
    metadata: {
      version: '1.0',
      author: 'Test User',
      created: '2024-01-01',
    },
    items: [
      {
        id: 1,
        name: 'Item One',
        description: 'First item description',
        value: 100,
        active: true,
      },
      {
        id: 2,
        name: 'Item Two',
        description: 'Second item description',
        value: 200,
        active: false,
      },
      {
        id: 3,
        name: 'Item Three',
        description: 'Third item description',
        value: 300,
        active: true,
      },
    ],
    statistics: {
      totalItems: 3,
      totalValue: 600,
      activeCount: 2,
    },
  };

  const jsonFilePath = path.join(outputDir, 'test-data.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(sampleJson, null, 2));

  try {
    const jsonResult = await converter.convert(jsonFilePath, 'test-data.json');

    if (jsonResult.status === 'success') {
      console.log('✓ JSON conversion successful!');
      console.log(`  Content items: ${jsonResult.document.content.length}`);

      // Show preview
      console.log('\n--- JSON Markdown Preview ---');
      const jsonPreview = jsonResult.markdown_content.substring(0, 400);
      console.log(jsonPreview);
      console.log('...\n');

      // Save output
      fs.writeFileSync(
        path.join(outputDir, 'json-example.json'),
        JSON.stringify({
          metadata: jsonResult.document.metadata,
          json_content: jsonResult.json_content,
          markdown_content: jsonResult.markdown_content,
        }, null, 2)
      );

      fs.writeFileSync(
        path.join(outputDir, 'json-example.md'),
        jsonResult.markdown_content
      );

      console.log('✓ JSON output saved');
    }
  } catch (error) {
    console.error('JSON conversion error:', error.message);
  }

  // Example 3: Plain text file
  console.log('\n3. Converting plain text file...');
  const txtFile = path.join(__dirname, 'test-files', 'plain-text', 'test.txt');
  
  if (fs.existsSync(txtFile)) {
    try {
      const txtResult = await converter.convert(txtFile, 'test.txt');

      if (txtResult.status === 'success') {
        console.log('✓ Text conversion successful!');
        console.log(`  Paragraphs detected: ${txtResult.document.content.length}`);

        // Save output
        fs.writeFileSync(
          path.join(outputDir, 'text-example.json'),
          JSON.stringify({
            metadata: txtResult.document.metadata,
            json_content: txtResult.json_content,
            markdown_content: txtResult.markdown_content,
          }, null, 2)
        );

        fs.writeFileSync(
          path.join(outputDir, 'text-example.md'),
          txtResult.markdown_content
        );

        console.log('✓ Text output saved');
      }
    } catch (error) {
      console.error('Text conversion error:', error.message);
    }
  } else {
    console.log(`⚠ Text file not found: ${txtFile}`);
  }

  console.log('\n✓ All outputs saved to output/ directory');
  console.log('\n📝 Supported text-based formats:');
  console.log('  - CSV: Tables with automatic structure detection');
  console.log('  - JSON: Formatted code blocks + readable extraction');
  console.log('  - TXT: Plain text with paragraph detection');

  console.log('\n=== Example Complete ===');
}

// Run the example
convertCsvJsonExample().catch(console.error);

