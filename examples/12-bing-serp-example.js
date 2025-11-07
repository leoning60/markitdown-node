/**
 * Example: Converting Bing Search Result Pages (SERP)
 * This example demonstrates extracting and converting Bing search results
 */

const { MarkItDown } = require('markitdown-node');
const fs = require('fs');
const path = require('path');

async function convertBingSerpExample() {
  console.log('=== Bing SERP Conversion Example ===\n');

  const converter = new MarkItDown();

  const inputFile = path.join(__dirname, 'test-files', 'bing-serp', 'test_serp.html');
  const outputDir = path.join(__dirname, 'output');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if file exists
  if (!fs.existsSync(inputFile)) {
    console.log(`⚠ Test file not found: ${inputFile}`);
    console.log('This example requires a Bing SERP HTML file in test-files/bing-serp/');
    return;
  }

  console.log(`Converting: ${inputFile}`);

  try {
    // Read the HTML to detect if it's a Bing SERP page
    const htmlContent = fs.readFileSync(inputFile, 'utf-8');
    
    // Check if it's a Bing search page
    const isBingSerp = htmlContent.includes('bing.com') && 
                       (htmlContent.includes('b_algo') || htmlContent.includes('b_searchboxSubmit'));
    
    if (isBingSerp) {
      console.log('✓ Detected Bing SERP page');
      // Extract query from HTML if possible
      const queryMatch = htmlContent.match(/search\?q=([^"&]+)/);
      const query = queryMatch ? decodeURIComponent(queryMatch[1].replace(/\+/g, ' ')) : 'Unknown';
      console.log(`  Query: ${query}`);
    }
    
    const result = await converter.convert(inputFile, 'test_serp.html');

    if (result.status === 'success') {
      console.log('✓ Conversion successful!');
      console.log(`Status: ${result.status}`);
      console.log(`Document format: ${result.document.metadata.format}`);
      console.log(`Title: ${result.document.metadata.title}`);
      console.log(`Content items: ${result.document.content.length}`);

      // Display first few results
      console.log('\n--- Preview of Search Results ---');
      const resultItems = result.document.content
        .filter(item => item.type === 'paragraph' && item.metadata && item.metadata.resultIndex)
        .slice(0, 3);
      
      if (resultItems.length > 0) {
        resultItems.forEach((item, index) => {
          console.log(`\nResult ${index + 1}:`);
          const text = item.text || '';
          const preview = text.substring(0, 200);
          console.log(preview + (text.length > 200 ? '...' : ''));
        });
      } else {
        console.log('No results extracted. Document content:');
        result.document.content.slice(0, 3).forEach((item, index) => {
          console.log(`\nItem ${index + 1} (${item.type}):`);
          const text = item.text || '[No text]';
          console.log(text.substring(0, 200));
        });
      }

      // Save outputs
      const outputData = {
        metadata: result.document.metadata,
        json_content: result.json_content,
        markdown_content: result.markdown_content,
      };

      // Save as JSON
      fs.writeFileSync(
        path.join(outputDir, 'bing-serp-example.json'),
        JSON.stringify(outputData, null, 2)
      );

      // Save markdown separately
      fs.writeFileSync(
        path.join(outputDir, 'bing-serp-example.md'),
        result.markdown_content
      );

      console.log('\n✓ Output saved to:');
      console.log('  - output/bing-serp-example.json');
      console.log('  - output/bing-serp-example.md');
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
convertBingSerpExample().catch(console.error);

