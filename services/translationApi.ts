import { translate } from '@vitalets/google-translate-api';

// Translation API service with multiple fallback methods
export async function translateText(text: string, targetLanguage: string = 'bn'): Promise<string> {
  console.log(`Attempting to translate: "${text}" to ${targetLanguage}`);

  if (!text || text.trim() === '') {
    return text;
  }

  try {
    // Method 1: Try using @vitalets/google-translate-api library
    const result = await translate(text, { to: targetLanguage });
    if (result && result.text) {
      console.log(`Translation successful using library: "${result.text}"`);
      return result.text;
    }
  } catch (error) {
    console.warn("Library translation failed, trying fallback method:", error);
  }

  try {
    // Method 2: Fallback to direct Google Translate API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();

    // The translated text is usually in the first array, first element, first string
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      console.log(`Translation successful using fallback: "${data[0][0][0]}"`);
      return data[0][0][0];
    } else {
      console.warn("Unexpected response structure from Google Translate API:", data);
      throw new Error("Could not parse translation response");
    }
  } catch (error) {
    console.warn("Fallback translation also failed, trying alternative method:", error);
  }

  try {
    // Method 3: Alternative translation service using MyMemory API (free)
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`;
    
    const response = await fetch(myMemoryUrl);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      console.log(`Translation successful using MyMemory: "${data.responseData.translatedText}"`);
      return data.responseData.translatedText;
    }
  } catch (error) {
    console.warn("MyMemory translation failed:", error);
  }

  try {
    // Method 4: LibreTranslate API (if available)
    const libreUrl = 'https://libretranslate.de/translate';
    const response = await fetch(libreUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLanguage,
        format: 'text'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.translatedText) {
        console.log(`Translation successful using LibreTranslate: "${data.translatedText}"`);
        return data.translatedText;
      }
    }
  } catch (error) {
    console.warn("LibreTranslate failed:", error);
  }

  // If all methods fail, return original text with a note
  console.error("All translation methods failed, returning original text");
  return `[অনুবাদ ব্যর্থ] ${text}`;
}

// Helper function to translate to English (reverse translation)
export async function translateToEnglish(text: string): Promise<string> {
  return translateText(text, 'en');
}

// Helper function to detect language
export async function detectLanguage(text: string): Promise<string> {
  try {
    // Use the fallback method for language detection
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[2]) {
      return data[2] || 'unknown';
    }
    return 'unknown';
  } catch (error) {
    console.error('Language detection failed:', error);
    return 'unknown';
  }
}

// Batch translation function for multiple texts
export async function translateBatch(texts: string[], targetLanguage: string = 'bn'): Promise<string[]> {
  const translations = await Promise.allSettled(
    texts.map(text => translateText(text, targetLanguage))
  );
  
  return translations.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Translation failed for text ${index}:`, result.reason);
      return `[অনুবাদ ব্যর্থ] ${texts[index]}`;
    }
  });
}

// Function to translate structured content (preserving formatting)
export async function translateStructuredContent(content: string, targetLanguage: string = 'bn'): Promise<string> {
  try {
    // Split content by lines to preserve structure
    const lines = content.split('\n');
    const translatedLines = await Promise.allSettled(
      lines.map(async (line) => {
        // Skip empty lines and lines with only special characters
        if (!line.trim() || /^[#*\-\d\.\s]+$/.test(line.trim())) {
          return line;
        }
        
        // For markdown headers, translate only the text part
        if (line.match(/^#+\s+/)) {
          const headerLevel = (line.match(/^#+/) || [''])[0];
          const headerText = line.replace(/^#+\s*/, '');
          const translatedHeader = await translateText(headerText, targetLanguage);
          return `${headerLevel} ${translatedHeader}`;
        }
        
        // For bullet points, translate only the text part
        if (line.match(/^[\s]*[\*\-\+]\s+/) || line.match(/^[\s]*\d+\.\s+/)) {
          const bulletMatch = line.match(/^([\s]*[\*\-\+\d\.]+\s*)(.*)/);
          if (bulletMatch) {
            const bullet = bulletMatch[1];
            const text = bulletMatch[2];
            if (text.trim()) {
              const translatedText = await translateText(text, targetLanguage);
              return `${bullet}${translatedText}`;
            }
          }
          return line;
        }
        
        // Translate regular text lines
        return await translateText(line, targetLanguage);
      })
    );
    
    return translatedLines.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Translation failed for line ${index}:`, result.reason);
        return lines[index];
      }
    }).join('\n');
    
  } catch (error) {
    console.error('Structured content translation failed:', error);
    return await translateText(content, targetLanguage);
  }
}
