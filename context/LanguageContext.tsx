import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translateText } from "@/services/translationApi";

export type Language = 'en' | 'bn';

type LanguageContextType = {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
  getStaticTranslation: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Static translations for common UI elements to reduce API calls
const staticTranslations: Record<string, Record<Language, string>> = {
  // Navigation
  home: { en: "Home", bn: "হোম" },
  diagnose: { en: "Diagnose", bn: "নির্ণয়" },
  prices: { en: "Prices", bn: "দাম" },
  inputs: { en: "Inputs", bn: "উপকরণ" },
  contacts: { en: "Contacts", bn: "যোগাযোগ" },
  "govt-services": { en: "Govt Services", bn: "সরকারি সেবা" },
  badc: { en: "BADC", bn: "বিএডিসি" },
  
  // Common buttons and actions
  save: { en: "Save", bn: "সংরক্ষণ" },
  cancel: { en: "Cancel", bn: "বাতিল" },
  submit: { en: "Submit", bn: "জমা দিন" },
  search: { en: "Search", bn: "খুঁজুন" },
  filter: { en: "Filter", bn: "ফিল্টার" },
  refresh: { en: "Refresh", bn: "রিফ্রেশ" },
  loading: { en: "Loading", bn: "লোড হচ্ছে" },
  error: { en: "Error", bn: "ত্রুটি" },
  success: { en: "Success", bn: "সফল" },
  edit: { en: "Edit", bn: "সম্পাদনা" },
  delete: { en: "Delete", bn: "মুছুন" },
  confirm: { en: "Confirm", bn: "নিশ্চিত করুন" },
  back: { en: "Back", bn: "পিছনে" },
  next: { en: "Next", bn: "পরবর্তী" },
  previous: { en: "Previous", bn: "পূর্ববর্তী" },
  close: { en: "Close", bn: "বন্ধ" },
  open: { en: "Open", bn: "খুলুন" },
  view: { en: "View", bn: "দেখুন" },
  select: { en: "Select", bn: "নির্বাচন করুন" },
  clear: { en: "Clear", bn: "পরিষ্কার" },
  
  // Greetings
  "good-morning": { en: "Good Morning", bn: "সুপ্রভাত" },
  "good-afternoon": { en: "Good Afternoon", bn: "শুভ অপরাহ্ন" },
  "good-evening": { en: "Good Evening", bn: "শুভ সন্ধ্যা" },
  
  // Dashboard items
  "market-prices": { en: "Market Prices", bn: "বাজার দর" },
  fertilizer: { en: "Fertilizer", bn: "সার" },
  machinery: { en: "Machinery", bn: "যন্ত্রপাতি" },
  repair: { en: "Repair", bn: "মেরামত" },
  weather: { en: "Weather", bn: "আবহাওয়া" },
  profile: { en: "Profile", bn: "প্রোফাইল" },
  "ai-planning": { en: "AI Planning", bn: "এআই পরিকল্পনা" },
  "badc-services": { en: "BADC Services", bn: "বিএডিসি সেবা" },
  merchandise: { en: "Merchandise", bn: "ব্যবসা-বাণিজ্য" },
  
  // Weather related
  temperature: { en: "Temperature", bn: "তাপমাত্রা" },
  humidity: { en: "Humidity", bn: "আর্দ্রতা" },
  "wind-speed": { en: "Wind Speed", bn: "বাতাসের গতি" },
  "loading-weather": { en: "Loading weather...", bn: "আবহাওয়া লোড হচ্ছে..." },
  "weather-error": { en: "Failed to load weather data", bn: "আবহাওয়ার তথ্য লোড করতে ব্যর্থ" },
  "no-weather-data": { en: "No weather data available", bn: "কোন আবহাওয়ার তথ্য উপলব্ধ নেই" },
  "location-not-available": { en: "Location not available.", bn: "অবস্থান উপলব্ধ নেই।" },
  "weather-load-error": { en: "An error occurred while loading weather data", bn: "আবহাওয়ার তথ্য লোড করার সময় একটি ত্রুটি ঘটেছে" },
  
  // Settings
  settings: { en: "Settings", bn: "সেটিংস" },
  language: { en: "Language", bn: "ভাষা" },
  "language-settings": { en: "Language Settings", bn: "ভাষা সেটিংস" },
  english: { en: "English", bn: "ইংরেজি" },
  bangla: { en: "Bangla", bn: "বাংলা" },
  "select-language": { en: "Select Language", bn: "ভাষা নির্বাচন করুন" },
  
  // Auth related
  login: { en: "Login", bn: "লগইন" },
  signup: { en: "Sign Up", bn: "সাইন আপ" },
  email: { en: "Email", bn: "ইমেইল" },
  password: { en: "Password", bn: "পাসওয়ার্ড" },
  "confirm-password": { en: "Confirm Password", bn: "পাসওয়ার্ড নিশ্চিত করুন" },
  "forgot-password": { en: "Forgot Password?", bn: "পাসওয়ার্ড ভুলে গেছেন?" },
  "dont-have-account": { en: "Don't have an account?", bn: "অ্যাকাউন্ট নেই?" },
  "already-have-account": { en: "Already have an account?", bn: "ইতিমধ্যে অ্যাকাউন্ট আছে?" },
  logout: { en: "Logout", bn: "লগআউট" },
  
  // Profile related
  "my-profile": { en: "My Profile", bn: "আমার প্রোফাইল" },
  "personal-info": { en: "Personal Information", bn: "ব্যক্তিগত তথ্য" },
  "farm-details": { en: "Farm Details", bn: "খামারের বিবরণ" },
  
  // Common phrases
  farmer: { en: "Farmer", bn: "কৃষক" },
  "loading-location": { en: "Loading location...", bn: "অবস্থান লোড হচ্ছে..." },
  notifications: { en: "Notifications", bn: "বিজ্ঞপ্তি" },
  "welcome-to-farmconnect": { en: "Welcome to FarmConnect", bn: "ফার্মকানেক্টে স্বাগতম" },
  "quick-access": { en: "Quick Access", bn: "দ্রুত প্রবেশ" },
  "weather-info": { en: "Weather Information", bn: "আবহাওয়ার তথ্য" },
  "todays-weather": { en: "Today's Weather", bn: "আজকের আবহাওয়া" },
  
  // Input types
  seeds: { en: "Seeds", bn: "বীজ" },
  pesticides: { en: "Pesticides", bn: "কীটনাশক" },
  equipment: { en: "Equipment", bn: "সরঞ্জাম" },
  
  // Price related
  "crop-prices": { en: "Crop Prices", bn: "ফসলের দাম" },
  "livestock-prices": { en: "Livestock Prices", bn: "পশুসম্পদের দাম" },
  "fish-prices": { en: "Fish Prices", bn: "মাছের দাম" },
  
  // Planning
  "crop-planning": { en: "Crop Planning", bn: "ফসল পরিকল্পনা" },
  "livestock-planning": { en: "Livestock Planning", bn: "পশুসম্পদ পরিকল্পনা" },
  "fish-planning": { en: "Fish Planning", bn: "মৎস্য পরিকল্পনা" },
  
  // Services
  "expert-consultation": { en: "Expert Consultation", bn: "বিশেষজ্ঞ পরামর্শ" },
  "weather-forecast": { en: "Weather Forecast", bn: "আবহাওয়ার পূর্বাভাস" },
  "govt-schemes": { en: "Government Schemes", bn: "সরকারি প্রকল্প" },
  "emergency-help": { en: "Emergency Help", bn: "জরুরি সাহায্য" },
  "emergency-helpline": { en: "Emergency Helpline", bn: "জরুরি হেল্পলাইন" },
  "call-now": { en: "Call Now", bn: "এখনই কল করুন" },
  
  // Status
  available: { en: "Available", bn: "উপলব্ধ" },
  unavailable: { en: "Unavailable", bn: "অনুপলব্ধ" },
  active: { en: "Active", bn: "সক্রিয়" },
  inactive: { en: "Inactive", bn: "নিষ্ক্রিয়" },
  online: { en: "Online", bn: "অনলাইন" },
  offline: { en: "Offline", bn: "অফলাইন" },
  
  // Login/Auth specific
  username: { en: "Username", bn: "ব্যবহারকারীর নাম" },
  "enter-username": { en: "Enter your username", bn: "আপনার ব্যবহারকারীর নাম লিখুন" },
  "enter-email": { en: "Enter your email", bn: "আপনার ইমেইল লিখুন" },
  "enter-password": { en: "Enter your password", bn: "আপনার পাসওয়ার্ড লিখুন" },
  "smart-farming-companion": { en: "Your smart farming companion", bn: "আপনার স্মার্ট কৃষি সহায়ক" },
  "enter-both-credentials": { en: "Please enter both email and password", bn: "অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড উভয়ই লিখুন" },
  "login-failed": { en: "Login failed. Please try again.", bn: "লগইন ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "error-occurred": { en: "An error occurred. Please try again.", bn: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "sign-up": { en: "Sign up", bn: "সাইন আপ" },
  "or": { en: "OR", bn: "অথবা" },
  "continue-with-google": { en: "Continue with Google", bn: "গুগল দিয়ে চালিয়ে যান" },
  "continue-with-phone": { en: "Continue with Phone", bn: "ফোন দিয়ে চালিয়ে যান" },
  "continue-with-facebook": { en: "Continue with Facebook", bn: "ফেসবুক দিয়ে চালিয়ে যান" },
  
  // Profile specific
  "logout-confirm": { en: "Are you sure you want to logout?", bn: "আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?" },
  "account-settings": { en: "Account Settings", bn: "অ্যাকাউন্ট সেটিংস" },
  "app-preferences": { en: "App Preferences", bn: "অ্যাপ পছন্দসমূহ" },
  "help-support": { en: "Help & Support", bn: "সাহায্য ও সহায়তা" },
  "location-not-set": { en: "Location not set", bn: "অবস্থান সেট করা হয়নি" },
  "edit-profile": { en: "Edit Profile", bn: "প্রোফাইল সম্পাদনা" },
  "push-notifications": { en: "Push Notifications", bn: "পুশ বিজ্ঞপ্তি" },
  "sms-alerts": { en: "SMS Alerts", bn: "এসএমএস সতর্কতা" },
  "offline-mode": { en: "Offline Mode", bn: "অফলাইন মোড" },
  
  // Contacts specific
  "expert-contacts": { en: "Expert Contacts", bn: "বিশেষজ্ঞ যোগাযোগ" },
  "search-contacts": { en: "Search contacts...", bn: "যোগাযোগ খুঁজুন..." },
  "all": { en: "All", bn: "সব" },
  "veterinarians": { en: "Veterinarians", bn: "পশু চিকিৎসক" },
  "agriculture-officers": { en: "Agriculture Officers", bn: "কৃষি কর্মকর্তা" },
  "equipment-suppliers": { en: "Equipment Suppliers", bn: "সরঞ্জাম সরবরাহকারী" },
  "failed-load-contacts": { en: "Failed to load contacts", bn: "যোগাযোগ লোড করতে ব্যর্থ" },
  "error-loading-contacts": { en: "An error occurred while loading contacts", bn: "যোগাযোগ লোড করার সময় একটি ত্রুটি ঘটেছে" },
  "no-contacts-found": { en: "No contacts found", bn: "কোন যোগাযোগ পাওয়া যায়নি" },
  "phone-not-supported": { en: "Phone calls are not supported on this device", bn: "এই ডিভাইসে ফোন কল সমর্থিত নয়" },
  "unable-open-phone": { en: "Unable to open phone app", bn: "ফোন অ্যাপ খুলতে অক্ষম" },
  "emergency-call-confirm": { en: "Do you want to call the emergency helpline?", bn: "আপনি কি জরুরি হেল্পলাইনে কল করতে চান?" },
  
  // Regional Officers
  "regional-officers": { en: "Regional Officers", bn: "আঞ্চলিক কর্মকর্তা" },
  "find-officers-by-location": { en: "Find Officers by Location", bn: "অবস্থান অনুযায়ী কর্মকর্তা খুঁজুন" },
  "enter-district-name": { en: "Enter district name...", bn: "জেলার নাম লিখুন..." },
  "location-search-hint": { en: "Enter your district name to find DAE officers in your area", bn: "আপনার এলাকার কৃষি সম্প্রসারণ কর্মকর্তা খুঁজতে জেলার নাম লিখুন" },
  "finding-officers": { en: "Finding officers...", bn: "কর্মকর্তা খুঁজছি..." },
  "no-officers-found-location": { en: "No officers found for this location", bn: "এই অবস্থানের জন্য কোন কর্মকর্তা পাওয়া যায়নি" },
  "enter-location-find-officers": { en: "Enter your location to find DAE officers", bn: "কৃষি সম্প্রসারণ কর্মকর্তা খুঁজতে আপনার অবস্থান লিখুন" },
  "call": { en: "Call", bn: "কল" },
  "email-not-supported": { en: "Email is not supported on this device", bn: "এই ডিভাইসে ইমেইল সমর্থিত নয়" },
  "unable-open-email": { en: "Unable to open email app", bn: "ইমেইল অ্যাপ খুলতে অক্ষম" },
  
  // AI Planning specific (removing duplicates)
  "crop-farming-plan": { en: "Crop Farming Plan", bn: "ফসল চাষ পরিকল্পনা" },
  "fish-farming-plan": { en: "Fish Farming Plan", bn: "মৎস্য চাষ পরিকল্পনা" },
  "livestock-farming-plan": { en: "Livestock Farming Plan", bn: "পশুসম্পদ পরিকল্পনা" },
  "fill-details-recommendations": { en: "Fill out the details below to get personalized farming recommendations", bn: "ব্যক্তিগতকৃত কৃষি সুপারিশ পেতে নিচের বিবরণ পূরণ করুন" },
  "fill-details-crop": { en: "Fill out the details below to get personalized crop farming recommendations", bn: "ব্যক্তিগতকৃত ফসল চাষের সুপারিশ পেতে নিচের বিবরণ পূরণ করুন" },
  "fill-details-fish": { en: "Fill out the details below to get personalized fish farming recommendations", bn: "ব্যক্তিগতকৃত মৎস্য চাষের সুপারিশ পেতে নিচের বিবরণ পূরণ করুন" },
  "fill-details-livestock": { en: "Fill out the details below to get personalized livestock farming recommendations", bn: "ব্যক্তিগতকৃত পশুসম্পদ চাষের সুপারিশ পেতে নিচের বিবরণ পূরণ করুন" },
  "generating-plan": { en: "Generating Plan...", bn: "পরিকল্পনা তৈরি হচ্ছে..." },
  "generate-ai-plan": { en: "Generate AI Plan", bn: "এআই পরিকল্পনা তৈরি করুন" },
  "ai-recommendations": { en: "AI Recommendations", bn: "এআই সুপারিশ" },
  "personalized-farming-plan": { en: "Personalized farming plan based on your inputs", bn: "আপনার তথ্যের ভিত্তিতে ব্যক্তিগতকৃত কৃষি পরিকল্পনা" },
  "personalized-crop-plan": { en: "Personalized crop farming plan based on your inputs", bn: "আপনার তথ্যের ভিত্তিতে ব্যক্তিগতকৃত ফসল চাষ পরিকল্পনা" },
  "personalized-fish-plan": { en: "Personalized fish farming plan based on your inputs", bn: "আপনার তথ্যের ভিত্তিতে ব্যক্তিগতকৃত মৎস্য চাষ পরিকল্পনা" },
  "personalized-livestock-plan": { en: "Personalized livestock farming plan based on your inputs", bn: "আপনার তথ্যের ভিত্তিতে ব্যক্তিগতকৃত পশুসম্পদ পরিকল্পনা" },
  "show-original": { en: "Show Original", bn: "মূল দেখান" },
  "show-translated-bangla": { en: "Show Translated (Bangla)", bn: "অনুবাদিত দেখান (বাংলা)" },
  "download-pdf": { en: "Download PDF", bn: "পিডিএফ ডাউনলোড" },
  "send-to-govt": { en: "Send to Govt", bn: "সরকারে পাঠান" },
  "missing-information": { en: "Missing Information", bn: "অনুপস্থিত তথ্য" },
  "fill-required-fields": { en: "Please fill in all required fields marked with *", bn: "অনুগ্রহ করে * চিহ্নিত সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন" },
  "failed-generate-plan": { en: "Failed to generate farming plan. Please try again.", bn: "কৃষি পরিকল্পনা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "failed-generate-crop-plan": { en: "Failed to generate farming plan. Please try again.", bn: "ফসল চাষ পরিকল্পনা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "failed-generate-fish-plan": { en: "Failed to generate fish farming plan. Please try again.", bn: "মৎস্য চাষ পরিকল্পনা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "failed-generate-livestock-plan": { en: "Failed to generate livestock plan. Please try again.", bn: "পশুসম্পদ পরিকল্পনা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "send-to-government": { en: "Send to Government", bn: "সরকারে পাঠান" },
  "send-plan-govt-confirm": { en: "This feature will send your farming plan to relevant government officers. Would you like to proceed?", bn: "এই বৈশিষ্ট্যটি আপনার কৃষি পরিকল্পনা সংশ্লিষ্ট সরকারি কর্মকর্তাদের কাছে পাঠাবে। আপনি কি এগিয়ে যেতে চান?" },
  "plan-prepared-success": { en: "Your farming plan has been prepared for sending to government officers. Please contact your local agricultural office to submit this plan.", bn: "আপনার কৃষি পরিকল্পনা সরকারি কর্মকর্তাদের কাছে পাঠানোর জন্য প্রস্তুত করা হয়েছে। এই পরিকল্পনা জমা দিতে অনুগ্রহ করে আপনার স্থানীয় কৃষি অফিসে যোগাযোগ করুন।" },
  "failed-download-plan": { en: "Failed to download plan. Please try again.", bn: "পরিকল্পনা ডাউনলোড করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "select-option": { en: "Select Option", bn: "বিকল্প নির্বাচন করুন" },
  "please-specify": { en: "Please specify...", bn: "অনুগ্রহ করে উল্লেখ করুন..." },
  
  // Quick Tips
  "quick-tip": { en: "Quick Tip", bn: "দ্রুত টিপস" },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
        setCurrentLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error("Failed to load language preference:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setCurrentLanguage(lang);
      await AsyncStorage.setItem("language", lang);
      // Clear translation cache when language changes
      setTranslationCache({});
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  const getStaticTranslation = (key: string): string => {
    const translation = staticTranslations[key];
    if (translation) {
      return translation[currentLanguage];
    }
    return key; // Return key if no translation found
  };

  const translate = async (text: string): Promise<string> => {
    // If current language is English, return original text
    if (currentLanguage === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${currentLanguage}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // Check if it's a static translation
    const staticKey = Object.keys(staticTranslations).find(key => 
      staticTranslations[key].en.toLowerCase() === text.toLowerCase()
    );
    if (staticKey) {
      return getStaticTranslation(staticKey);
    }

    try {
      setIsTranslating(true);
      const translatedText = await translateText(text, currentLanguage);
      
      // Cache the translation
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));
      
      return translatedText;
    } catch (error) {
      console.error("Translation failed:", error);
      return text; // Return original text if translation fails
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      translate, 
      isTranslating,
      getStaticTranslation 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
