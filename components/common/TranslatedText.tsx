import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslation';

interface TranslatedTextProps extends TextProps {
  text: string;
  fallback?: string;
  children?: never; // Prevent children to avoid confusion
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  fallback, 
  style, 
  ...textProps 
}) => {
  const { translatedText, isLoading } = useTranslatedText(text);

  return (
    <Text style={style} {...textProps}>
      {isLoading ? (fallback || text) : translatedText}
    </Text>
  );
};

export default TranslatedText;
