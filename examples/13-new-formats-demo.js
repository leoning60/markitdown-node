/**
 * Example: Using new formats (CSV, JSON, XML, RSS, ZIP)
 * This example demonstrates the newly added format support
 */

const { MarkItDown } = require('markitdown-node');
const fs = require('fs');
const path = require('path');

async function demonstrateNewFormats() {
  console.log('=== New Formats Demo ===\n');
  
  const converter = new MarkItDown();
  const outputDir = path.join(__dirname, 'output');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. CSV Example
  console.log('1. Converting CSV file...');
  const csvContent = `Name,Age,City
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago`;
  
  fs.writeFileSync(path.join(outputDir, 'test.csv'), csvContent);
  
  const csvResult = await converter.convert(
    path.join(outputDir, 'test.csv')
  );
  
  if (csvResult.status === 'success') {
    console.log('✓ CSV converted successfully');
    console.log('Markdown output:');
    console.log(csvResult.markdown_content);
    console.log('');
  }

  // 2. JSON Example
  console.log('2. Converting JSON file...');
  const jsonContent = {
    title: 'Sample Document',
    description: 'This is a test JSON document',
    items: [
      { name: 'Item 1', value: 100 },
      { name: 'Item 2', value: 200 }
    ]
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'test.json'),
    JSON.stringify(jsonContent, null, 2)
  );
  
  const jsonResult = await converter.convert(
    path.join(outputDir, 'test.json')
  );
  
  if (jsonResult.status === 'success') {
    console.log('✓ JSON converted successfully');
    console.log('Markdown output preview:');
    console.log(jsonResult.markdown_content.substring(0, 200) + '...');
    console.log('');
  }

  // 3. XML/RSS Example
  console.log('3. Converting RSS feed...');
  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sample RSS Feed</title>
    <description>A demonstration RSS feed</description>
    <item>
      <title>First Article</title>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
      <description>This is the first article in our feed.</description>
    </item>
    <item>
      <title>Second Article</title>
      <pubDate>Tue, 02 Jan 2024 12:00:00 GMT</pubDate>
      <description>This is the second article in our feed.</description>
    </item>
  </channel>
</rss>`;
  
  fs.writeFileSync(path.join(outputDir, 'test.rss'), rssContent);
  
  const rssResult = await converter.convert(
    path.join(outputDir, 'test.rss')
  );
  
  if (rssResult.status === 'success') {
    console.log('✓ RSS feed converted successfully');
    console.log('Markdown output:');
    console.log(rssResult.markdown_content);
    console.log('');
  }

  // 4. Plain Text Example
  console.log('4. Converting plain text file...');
  const textContent = `Introduction

This is the first paragraph of our document. It contains some important information about the topic.

Main Content

This is the second paragraph. It provides more details and examples.

Conclusion

This is the final paragraph with closing thoughts.`;
  
  fs.writeFileSync(path.join(outputDir, 'test.txt'), textContent);
  
  const textResult = await converter.convert(
    path.join(outputDir, 'test.txt')
  );
  
  if (textResult.status === 'success') {
    console.log('✓ Plain text converted successfully');
    console.log('Markdown output:');
    console.log(textResult.markdown_content);
    console.log('');
  }

  // 5. ZIP Example (if unzipper is installed)
  console.log('5. ZIP file support...');
  try {
    // Check if unzipper is available
    require.resolve('unzipper');
    console.log('✓ unzipper is installed - ZIP support is available');
    console.log('Note: Create a ZIP file and use converter.convert("file.zip") to extract and convert its contents');
  } catch (e) {
    console.log('⚠ unzipper not installed - run "npm install unzipper" to enable ZIP support');
  }
  console.log('');

  // 6. YouTube Example (if youtube-transcript is installed)
  console.log('6. YouTube transcript support...');
  try {
    require.resolve('youtube-transcript');
    console.log('✓ youtube-transcript is installed - YouTube support is available');
    console.log('Note: Pass YouTube HTML with url option to extract metadata and transcripts');
  } catch (e) {
    console.log('⚠ youtube-transcript not installed - run "npm install youtube-transcript" to enable YouTube support');
  }
  console.log('');

  console.log('=== Demo Complete ===');
  console.log('\nAll output files saved to:', outputDir);
}

// Run the demo
demonstrateNewFormats().catch(console.error);

