import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export const useTranslation = () => {
  const { translate, currentLanguage, getStaticTranslation, isTranslating } = useLanguage();

  const t = (key: string, fallback?: string): string => {
    const translation = getStaticTranslation(key);
    if (translation && translation !== key && typeof translation === 'string') {
      return translation;
    }
    return fallback || key || '';
  };

  const tAsync = async (text: string): Promise<string> => {
    return await translate(text);
  };

  return {
    t,
    tAsync,
    currentLanguage,
    isTranslating,
  };
};

// Hook for translating text with state management
export const useTranslatedText = (text: string) => {
  const { translate, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'en') {
        setTranslatedText(text || '');
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translate(text);
        setTranslatedText(translated || text || '');
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text || '');
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translate]);

  return { translatedText: translatedText || '', isLoading };
};
