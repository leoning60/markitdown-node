/**
 * Excel (XLSX) Example
 * 
 * Demonstrates converting Excel spreadsheets
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertExcel() {
  console.log('📊 Excel (XLSX) Conversion Example\n');

  const converter = new MarkItDown({
    defaultOptions: {
      extractTables: true,
    },
  });

  const xlsxPath = path.join(__dirname, './test-files/xlsx/test.xlsx');

  console.log('Converting:', xlsxPath);
  const result = await converter.convert(xlsxPath);

  if (result.status === 'success' && result.document) {
    console.log('✅ Conversion successful!\n');

    // Display metadata
    console.log('📋 Metadata:');
    console.log('───────────────────────────────');
    console.log('Filename:', result.document.metadata.filename);
    console.log('Format:', result.document.metadata.format);
    if (result.document.metadata.sheetCount) {
      console.log('Sheets:', result.document.metadata.sheetCount);
    }
    if (result.document.metadata.sheetNames) {
      console.log('Sheet names:', result.document.metadata.sheetNames.join(', '));
    }
    console.log('───────────────────────────────\n');

    // Find tables
    const tables = result.document.content.filter(item => item.type === 'table');
    console.log('📊 Tables Found:', tables.length);
    
    tables.forEach((table, idx) => {
      console.log(`\nTable ${idx + 1}:`);
      console.log('───────────────────────────────');
      if (table.metadata?.sheetName) {
        console.log('Sheet:', table.metadata.sheetName);
      }
      if (table.rows) {
        console.log('Rows:', table.rows.length);
        console.log('Columns:', table.rows[0]?.cells?.length || 0);
        
        // Show first few rows
        console.log('\nFirst 3 rows:');
        table.rows.slice(0, 3).forEach((row, rowIdx) => {
          if (row.cells) {
            const cellTexts = row.cells.map(cell => {
              const text = cell.text || '';
              return text.length > 20 ? text.substring(0, 20) + '...' : text;
            });
            console.log(`Row ${rowIdx + 1}:`, cellTexts.join(' | '));
          }
        });
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
      path.join(outputDir, 'excel-example.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 File saved:');
    console.log('   - output/excel-example.json\n');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Run the example
convertExcel().catch(console.error);

