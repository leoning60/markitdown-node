/**
 * OCR Languages Example
 * 
 * Demonstrates how to configure OCR languages for image recognition
 * Tesseract.js supports 100+ languages
 */

const { MarkItDown } = require('markitdown-node');
const path = require('path');

async function demonstrateOCRLanguages() {
  console.log('🌍 OCR Language Configuration Examples\n');

  // Example 1: English only (fastest for English-only documents)
  console.log('1️⃣  English Only');
  console.log('───────────────────────────────');
  const converterEng = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'eng'
    }
  });
  console.log('   Configuration: ocrLanguages = "eng"');
  console.log('   Use case: English-only documents');
  console.log('   Performance: Fast\n');

  // Example 2: Simplified Chinese + English (default, recommended)
  console.log('2️⃣  Simplified Chinese + English (Default)');
  console.log('───────────────────────────────');
  const converterChiSim = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'chi_sim+eng'
    }
  });
  console.log('   Configuration: ocrLanguages = "chi_sim+eng"');
  console.log('   Use case: Documents with Chinese and English text');
  console.log('   Performance: Good\n');

  // Example 3: Traditional Chinese + English
  console.log('3️⃣  Traditional Chinese + English');
  console.log('───────────────────────────────');
  const converterChiTra = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'chi_tra+eng'
    }
  });
  console.log('   Configuration: ocrLanguages = "chi_tra+eng"');
  console.log('   Use case: Traditional Chinese documents (Taiwan, Hong Kong)');
  console.log('   Performance: Good\n');

  // Example 4: Japanese + English
  console.log('4️⃣  Japanese + English');
  console.log('───────────────────────────────');
  const converterJpn = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'jpn+eng'
    }
  });
  console.log('   Configuration: ocrLanguages = "jpn+eng"');
  console.log('   Use case: Japanese documents with English text');
  console.log('   Performance: Good\n');

  // Example 5: Korean + English
  console.log('5️⃣  Korean + English');
  console.log('───────────────────────────────');
  const converterKor = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'kor+eng'
    }
  });
  console.log('   Configuration: ocrLanguages = "kor+eng"');
  console.log('   Use case: Korean documents with English text');
  console.log('   Performance: Good\n');

  // Example 6: Multiple European languages
  console.log('6️⃣  Multiple European Languages');
  console.log('───────────────────────────────');
  const converterEuro = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'eng+fra+deu+spa'
    }
  });
  console.log('   Configuration: ocrLanguages = "eng+fra+deu+spa"');
  console.log('   Use case: Multi-language European documents');
  console.log('   Languages: English, French, German, Spanish');
  console.log('   Performance: Slower (multiple languages)\n');

  // Example 7: Arabic + English
  console.log('7️⃣  Arabic + English');
  console.log('───────────────────────────────');
  const converterAra = new MarkItDown({
    defaultOptions: {
      ocrLanguages: 'ara+eng'
    }
  });
  console.log('   Configuration: ocrLanguages = "ara+eng"');
  console.log('   Use case: Arabic documents with English text');
  console.log('   Performance: Good\n');

  // Demonstrate actual conversion with image
  console.log('8️⃣  Real Conversion Example');
  console.log('═'.repeat(40));
  const imagePath = path.join(__dirname, './test-files/images/1.jpeg');
  
  try {
    console.log('Converting image with chi_sim+eng...\n');
    const result = await converterChiSim.convert(imagePath);
    
    if (result.status === 'success' && result.document) {
      console.log('✅ Conversion successful!');
      console.log(`   OCR Languages: ${result.document.metadata.ocrLanguages}`);
      
      const paragraphs = result.document.content.filter(item => item.type === 'paragraph');
      if (paragraphs.length > 0) {
        if (paragraphs[0].metadata?.confidence) {
          console.log(`   Confidence: ${paragraphs[0].metadata.confidence.toFixed(2)}%`);
        }
        if (paragraphs[0].text && paragraphs[0].text !== '[No text detected in image]') {
          const preview = paragraphs[0].text.substring(0, 80);
          console.log(`\n   Extracted text preview:`);
          console.log(`   "${preview}${paragraphs[0].text.length > 80 ? '...' : ''}"`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '═'.repeat(40));
  console.log('\n💡 Language Code Reference (110+ languages supported):');
  console.log('\n   📍 East Asian:');
  console.log('      chi_sim, chi_tra, jpn, kor');
  console.log('\n   📍 Southeast Asian:');
  console.log('      tha, vie, ind, msa, khm, lao, mya, tgl, jav, ceb');
  console.log('\n   📍 South Asian:');
  console.log('      hin, ben, asm, guj, kan, mal, mar, nep, ori, pan, tam, tel, urd, sin, san');
  console.log('\n   📍 Middle Eastern & Central Asian:');
  console.log('      ara, fas, heb, tur, kur, pus, syr, uig, aze, kaz, kir, tgk, uzb');
  console.log('\n   📍 European (Western):');
  console.log('      eng, fra, deu, spa, ita, por, nld, cat, glg, eus');
  console.log('\n   📍 European (Northern):');
  console.log('      dan, nor, swe, isl, fin, est, lav, lit');
  console.log('\n   📍 European (Southern):');
  console.log('      ell, grc, ron, sqi, mlt');
  console.log('\n   📍 European (Central & Eastern):');
  console.log('      ces, slk, pol, hun, slv, hrv, bos, srp, mkd, bul, rus, ukr, bel');
  console.log('\n   📍 African:');
  console.log('      afr, amh, swa, tir');
  console.log('\n   📍 Other:');
  console.log('      bod, kat, chr, dzo, hat, iku, yid, gle, cym, lat, epo');
  console.log('\n💡 Tips:');
  console.log('   • Combine languages with + (e.g., "chi_sim+eng")');
  console.log('   • More languages = slower processing');
  console.log('   • Default is "chi_sim+eng" for international support');
  console.log('   • Language data is downloaded automatically on first use');
  console.log('   • See README.md for full language names and descriptions');
  console.log('\n✨ OCR language examples completed!\n');
}

// Run the example
demonstrateOCRLanguages().catch(console.error);

