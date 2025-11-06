/**
 * Example: Extracting Audio File Metadata
 * This example demonstrates extracting metadata from audio files (MP3, WAV)
 * 
 * Note: Metadata extraction requires exiftool to be installed:
 *   - macOS: brew install exiftool
 *   - Linux: apt-get install libimage-exiftool-perl
 *   - Windows: Download from https://exiftool.org/
 */

const { MarkItDown } = require('markitdown-node');
const fs = require('fs');
const path = require('path');

async function convertAudioExample() {
  console.log('=== Audio Metadata Extraction Example ===\n');

  const converter = new MarkItDown();

  const inputFile = path.join(__dirname, 'test-files', 'audio', 'test.wav');
  const outputDir = path.join(__dirname, 'output');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if file exists
  if (!fs.existsSync(inputFile)) {
    console.log(`⚠ Test file not found: ${inputFile}`);
    console.log('This example requires an audio file in test-files/audio/');
    return;
  }

  console.log(`Converting: ${inputFile}`);

  try {
    const result = await converter.convert(inputFile, 'test.wav');

    if (result.status === 'success') {
      console.log('✓ Conversion successful!');
      console.log(`Status: ${result.status}`);
      console.log(`Document format: ${result.document.metadata.format}`);
      console.log(`Content items: ${result.document.content.length}`);

      // Display metadata
      console.log('\n--- Audio Metadata ---');
      console.log(result.markdown_content);

      // Save outputs
      const outputData = {
        metadata: result.document.metadata,
        json_content: result.json_content,
        markdown_content: result.markdown_content,
      };

      // Save as JSON
      fs.writeFileSync(
        path.join(outputDir, 'audio-example.json'),
        JSON.stringify(outputData, null, 2)
      );

      // Save markdown separately
      fs.writeFileSync(
        path.join(outputDir, 'audio-example.md'),
        result.markdown_content
      );

      console.log('\n✓ Output saved to:');
      console.log('  - output/audio-example.json');
      console.log('  - output/audio-example.md');

      // Notes
      console.log('\n📝 Notes:');
      console.log('  - Metadata extraction requires exiftool (optional)');
      console.log('  - Audio transcription is not yet implemented');
      console.log('  - Future versions may support speech-to-text');
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
convertAudioExample().catch(console.error);

