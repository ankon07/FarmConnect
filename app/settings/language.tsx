import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { Check } from "lucide-react-native";

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: t('english'), nativeName: 'English' },
    { code: 'bn', name: t('bangla'), nativeName: 'বাংলা' },
  ];

  const handleLanguageSelect = async (languageCode: Language) => {
    await setLanguage(languageCode);
    // Navigate back after a short delay to show the selection
    setTimeout(() => {
      router.back();
    }, 500);
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title={t('language-settings')}
        showBackButton={true}
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          {t('select-language')}
        </Text>
        
        <View style={styles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                currentLanguage === language.code && styles.selectedLanguageItem
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName,
                  currentLanguage === language.code && styles.selectedLanguageName
                ]}>
                  {language.name}
                </Text>
                <Text style={[
                  styles.nativeLanguageName,
                  currentLanguage === language.code && styles.selectedNativeLanguageName
                ]}>
                  {language.nativeName}
                </Text>
              </View>
              
              {currentLanguage === language.code && (
                <Check size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.note}>
          <Text style={styles.noteText}>
            {currentLanguage === 'en' 
              ? "Language changes will be applied immediately. Some content may require internet connection for translation."
              : "ভাষা পরিবর্তন অবিলম্বে প্রয়োগ হবে। কিছু বিষয়বস্তুর অনুবাদের জন্য ইন্টারনেট সংযোগের প্রয়োজন হতে পারে।"
            }
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  languageList: {
    marginBottom: 32,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  selectedLanguageName: {
    color: COLORS.primary,
  },
  nativeLanguageName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectedNativeLanguageName: {
    color: COLORS.primary,
  },
  note: {
    backgroundColor: COLORS.lightBackground,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
