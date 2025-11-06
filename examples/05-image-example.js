/**
 * Image Example
 * 
 * Demonstrates converting images (PNG, JPEG) with OCR support
 * Uses Tesseract.js for optical character recognition
 * Supports 100+ languages including Chinese, Japanese, Korean, etc.
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');
const fs = require('fs').promises;

async function convertImages() {
  console.log('🖼️  Image Conversion Example with OCR\n');

  // Configure OCR languages (default: 'chi_sim+eng' for Chinese + English)
  // Common options: 'eng', 'chi_sim+eng', 'jpn+eng', 'kor+eng'
  const converter = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'chi_sim+eng' // Simplified Chinese + English
    }
  });

  const images = [
    { path: './test-files/images/1.jpeg', name: 'JPEG Image' },
    { path: './test-files/images/test.jpg', name: 'JPG Image' },
  ];

  for (const image of images) {
    const imagePath = path.join(__dirname, image.path);
    
    console.log(`\n📷 Converting: ${image.name}`);
    console.log(`   File: ${path.basename(imagePath)}`);
    console.log('───────────────────────────────');

    try {
      const result = await converter.convert(imagePath);

      if (result.status === 'success' && result.document) {
        console.log('✅ Conversion successful!');
        
        // Display metadata
        console.log('\n📋 Metadata:');
        if (result.document.metadata.width) {
          console.log(`   Dimensions: ${result.document.metadata.width}x${result.document.metadata.height}`);
        }
        if (result.document.metadata.imageFormat) {
          console.log(`   Image Format: ${result.document.metadata.imageFormat}`);
        }
        if (result.document.metadata.ocrLanguages) {
          console.log(`   OCR Languages: ${result.document.metadata.ocrLanguages}`);
        }

        // Display content
        console.log('\n📊 Content:');
        console.log(`   Items: ${result.document.content.length}`);
        
        // Show OCR confidence if available
        const paragraphs = result.document.content.filter(item => item.type === 'paragraph');
        if (paragraphs.length > 0 && paragraphs[0].metadata?.confidence) {
          console.log(`   OCR Confidence: ${paragraphs[0].metadata.confidence.toFixed(2)}%`);
        }
        
        // Preview extracted text
        if (paragraphs.length > 0 && paragraphs[0].text) {
          const preview = paragraphs[0].text.substring(0, 100);
          console.log(`\n📝 Text Preview:`);
          console.log(`   ${preview}${paragraphs[0].text.length > 100 ? '...' : ''}`);
        }

        // Save as single JSON file with both formats
        const outputDir = path.join(__dirname, 'output');
        await fs.mkdir(outputDir, { recursive: true });
        
        const baseName = path.basename(imagePath, path.extname(imagePath));
        const outputData = {
          metadata: result.document.metadata,
          json_content: result.json_content,
          markdown_content: result.markdown_content
        };
        
        await fs.writeFile(
          path.join(outputDir, `${baseName}.json`),
          JSON.stringify(outputData, null, 2)
        );
        
        console.log('\n💾 Saved:');
        console.log(`   - output/${baseName}.json (metadata + json_content + markdown_content)`);
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log('═'.repeat(40));
  }

  console.log('\n✨ Image conversion examples completed!\n');
}

// Run the example
convertImages().catch(console.error);

