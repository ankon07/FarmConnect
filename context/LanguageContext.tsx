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
  
  // Machinery Rental specific translations
  "machinery-rental": { en: "Machinery Rental", bn: "যন্ত্রপাতি ভাড়া" },
  "browse-machinery": { en: "Browse Machinery", bn: "যন্ত্রপাতি ব্রাউজ করুন" },
  "my-machinery": { en: "My Machinery", bn: "আমার যন্ত্রপাতি" },
  "rental-history": { en: "Rental History", bn: "ভাড়ার ইতিহাস" },
  "list-view": { en: "List View", bn: "তালিকা দৃশ্য" },
  "map-view": { en: "Map View", bn: "মানচিত্র দৃশ্য" },
  "reserve": { en: "Reserve", bn: "সংরক্ষণ" },
  "rent-now": { en: "Rent Now", bn: "এখনই ভাড়া নিন" },
  "not-available": { en: "Not Available", bn: "উপলব্ধ নেই" },
  "add-new": { en: "Add New", bn: "নতুন যোগ করুন" },
  "your-machinery": { en: "Your Machinery", bn: "আপনার যন্ত্রপাতি" },
  "no-machinery-listed": { en: "No machinery listed yet", bn: "এখনও কোন যন্ত্রপাতি তালিকাভুক্ত নেই" },
  "start-earning": { en: "Start earning by listing your agricultural machinery for rent", bn: "ভাড়ার জন্য আপনার কৃষি যন্ত্রপাতি তালিকাভুক্ত করে আয় শুরু করুন" },
  "add-first-machinery": { en: "Add Your First Machinery", bn: "আপনার প্রথম যন্ত্রপাতি যোগ করুন" },
  "rental-requests": { en: "Rental Requests", bn: "ভাড়ার অনুরোধ" },
  "my-rentals": { en: "My Rentals", bn: "আমার ভাড়া" },
  "no-rentals-found": { en: "No rentals found", bn: "কোন ভাড়া পাওয়া যায়নি" },
  "havent-rented": { en: "You haven't rented any machinery yet", bn: "আপনি এখনও কোন যন্ত্রপাতি ভাড়া নেননি" },
  "no-one-rented": { en: "No one has rented your machinery yet", bn: "এখনও কেউ আপনার যন্ত্রপাতি ভাড়া নেয়নি" },
  
  // Machinery types
  "tractor": { en: "Tractor", bn: "ট্রাক্টর" },
  "harvester": { en: "Harvester", bn: "হার্ভেস্টার" },
  "planter": { en: "Planter", bn: "রোপণকারী" },
  "cultivator": { en: "Cultivator", bn: "চাষকারী" },
  "sprayer": { en: "Sprayer", bn: "স্প্রেয়ার" },
  "other": { en: "Other", bn: "অন্যান্য" },
  
  // Rental form
  "rent": { en: "Rent", bn: "ভাড়া" },
  "owner": { en: "Owner", bn: "মালিক" },
  "contact": { en: "Contact", bn: "যোগাযোগ" },
  "location": { en: "Location", bn: "অবস্থান" },
  "rental-period": { en: "Rental Period", bn: "ভাড়ার সময়কাল" },
  "start-date": { en: "Start Date", bn: "শুরুর তারিখ" },
  "start-time": { en: "Start Time", bn: "শুরুর সময়" },
  "end-date": { en: "End Date", bn: "শেষের তারিখ" },
  "end-time": { en: "End Time", bn: "শেষের সময়" },
  "delivery-options": { en: "Delivery Options", bn: "ডেলিভারি বিকল্প" },
  "require-delivery": { en: "Require Delivery", bn: "ডেলিভারি প্রয়োজন" },
  "delivery-address": { en: "Delivery Address", bn: "ডেলিভারি ঠিকানা" },
  "enter-delivery-address": { en: "Enter your delivery address", bn: "আপনার ডেলিভারি ঠিকানা লিখুন" },
  "delivery-fee": { en: "Delivery fee: ৳500", bn: "ডেলিভারি ফি: ৳৫০০" },
  "payment-method": { en: "Payment Method", bn: "পেমেন্ট পদ্ধতি" },
  "bkash": { en: "bKash", bn: "বিকাশ" },
  "nagad": { en: "Nagad", bn: "নগদ" },
  "rocket": { en: "Rocket", bn: "রকেট" },
  "bank-transfer": { en: "Bank Transfer", bn: "ব্যাংক ট্রান্সফার" },
  "cash-on-delivery": { en: "Cash on Delivery", bn: "ক্যাশ অন ডেলিভারি" },
  "mobile-number": { en: "Mobile Number", bn: "মোবাইল নম্বর" },
  "account-number": { en: "Account Number", bn: "অ্যাকাউন্ট নম্বর" },
  "enter-bank-account": { en: "Enter bank account number", bn: "ব্যাংক অ্যাকাউন্ট নম্বর লিখুন" },
  "cash-payment-note": { en: "Payment will be made in cash upon delivery/pickup of the machinery.", bn: "যন্ত্রপাতি ডেলিভারি/পিকআপের সময় নগদে পেমেন্ট করা হবে।" },
  "additional-notes": { en: "Additional Notes", bn: "অতিরিক্ত নোট" },
  "special-requirements": { en: "Any special requirements or notes for the owner", bn: "মালিকের জন্য কোন বিশেষ প্রয়োজনীয়তা বা নোট" },
  "cost-summary": { en: "Cost Summary", bn: "খরচের সারসংক্ষেপ" },
  "duration": { en: "Duration", bn: "সময়কাল" },
  "hours": { en: "hours", bn: "ঘন্টা" },
  "days": { en: "days", bn: "দিন" },
  "rental-cost": { en: "Rental Cost", bn: "ভাড়ার খরচ" },
  "total-amount": { en: "Total Amount", bn: "মোট পরিমাণ" },
  "submit-request": { en: "Submit Request", bn: "অনুরোধ জমা দিন" },
  
  // Add machinery form
  "add-your-machinery": { en: "Add Your Machinery", bn: "আপনার যন্ত্রপাতি যোগ করুন" },
  "basic-information": { en: "Basic Information", bn: "মৌলিক তথ্য" },
  "machinery-name": { en: "Machinery Name", bn: "যন্ত্রপাতির নাম" },
  "type": { en: "Type", bn: "ধরন" },
  "description": { en: "Description", bn: "বিবরণ" },
  "describe-machinery": { en: "Describe your machinery, its features, and condition", bn: "আপনার যন্ত্রপাতি, এর বৈশিষ্ট্য এবং অবস্থা বর্ণনা করুন" },
  "image-url": { en: "Image URL", bn: "ছবির URL" },
  "pricing": { en: "Pricing", bn: "মূল্য নির্ধারণ" },
  "price-per-hour": { en: "Price per Hour (৳)", bn: "প্রতি ঘন্টার দাম (৳)" },
  "price-per-day": { en: "Price per Day (৳)", bn: "প্রতি দিনের দাম (৳)" },
  "contact-location": { en: "Contact & Location", bn: "যোগাযোগ ও অবস্থান" },
  "contact-number": { en: "Contact Number", bn: "যোগাযোগ নম্বর" },
  "address": { en: "Address", bn: "ঠিকানা" },
  "your-location-address": { en: "Your location address", bn: "আপনার অবস্থানের ঠিকানা" },
  "specifications": { en: "Specifications", bn: "বৈশিষ্ট্য" },
  "brand": { en: "Brand", bn: "ব্র্যান্ড" },
  "model": { en: "Model", bn: "মডেল" },
  "year": { en: "Year", bn: "বছর" },
  "horsepower": { en: "Horsepower", bn: "হর্সপাওয়ার" },
  "fuel-type": { en: "Fuel Type", bn: "জ্বালানির ধরন" },
  "diesel": { en: "Diesel", bn: "ডিজেল" },
  "petrol": { en: "Petrol", bn: "পেট্রোল" },
  "electric": { en: "Electric", bn: "বৈদ্যুতিক" },
  "condition": { en: "Condition", bn: "অবস্থা" },
  "excellent": { en: "Excellent", bn: "চমৎকার" },
  "good": { en: "Good", bn: "ভাল" },
  "fair": { en: "Fair", bn: "মোটামুটি" },
  "poor": { en: "Poor", bn: "খারাপ" },
  "availability": { en: "Availability", bn: "উপলব্ধতা" },
  "available-from": { en: "Available From", bn: "থেকে উপলব্ধ" },
  "available-until": { en: "Available Until", bn: "পর্যন্ত উপলব্ধ" },
  "add-machinery": { en: "Add Machinery", bn: "যন্ত্রপাতি যোগ করুন" },
  
  // Rental history
  "rented": { en: "Rented", bn: "ভাড়া নেওয়া" },
  "rented-out": { en: "Rented Out", bn: "ভাড়া দেওয়া" },
  "payment-status": { en: "Payment Status", bn: "পেমেন্ট অবস্থা" },
  "mark-as-paid": { en: "Mark as Paid", bn: "পেইড হিসেবে চিহ্নিত করুন" },
  "mark-as-failed": { en: "Mark as Failed", bn: "ব্যর্থ হিসেবে চিহ্নিত করুন" },
  "notes": { en: "Notes", bn: "নোট" },
  "loading-rental-history": { en: "Loading rental history...", bn: "ভাড়ার ইতিহাস লোড হচ্ছে..." },
  
  // Status
  "pending": { en: "Pending", bn: "অপেক্ষমাণ" },
  "confirmed": { en: "Confirmed", bn: "নিশ্চিত" },
  "completed": { en: "Completed", bn: "সম্পন্ন" },
  "cancelled": { en: "Cancelled", bn: "বাতিল" },
  "paid": { en: "Paid", bn: "পেইড" },
  "failed": { en: "Failed", bn: "ব্যর্থ" },
  "refunded": { en: "Refunded", bn: "ফেরত" },
  
  // Validation messages
  "login-required": { en: "Login Required", bn: "লগইন প্রয়োজন" },
  "please-login-rent": { en: "Please log in to rent machinery", bn: "যন্ত্রপাতি ভাড়া নিতে অনুগ্রহ করে লগইন করুন" },
  "please-login-add": { en: "Please log in to add machinery", bn: "যন্ত্রপাতি যোগ করতে অনুগ্রহ করে লগইন করুন" },
  "start-date-past": { en: "Start date and time cannot be in the past", bn: "শুরুর তারিখ এবং সময় অতীতে হতে পারে না" },
  "end-date-after": { en: "End date and time must be after start date and time", bn: "শেষের তারিখ এবং সময় শুরুর তারিখ এবং সময়ের পরে হতে হবে" },
  "provide-delivery-address": { en: "Please provide delivery address", bn: "অনুগ্রহ করে ডেলিভারি ঠিকানা প্রদান করুন" },
  "provide-mobile-payment": { en: "Please provide mobile number for payment", bn: "পেমেন্টের জন্য অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন" },
  "provide-bank-account": { en: "Please provide bank account number", bn: "অনুগ্রহ করে ব্যাংক অ্যাকাউন্ট নম্বর প্রদান করুন" },
  "location-required": { en: "Location is required to add machinery", bn: "যন্ত্রপাতি যোগ করতে অবস্থান প্রয়োজন" },
  "cannot-rent-own": { en: "You cannot rent your own machinery", bn: "আপনি নিজের যন্ত্রপাতি ভাড়া নিতে পারবেন না" },
  "machinery-not-found": { en: "Machinery not found. Please try again.", bn: "যন্ত্রপাতি পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  
  // Success messages
  "rental-request-success": { en: "Rental request submitted successfully! The owner will be notified.", bn: "ভাড়ার অনুরোধ সফলভাবে জমা দেওয়া হয়েছে! মালিককে জানানো হবে।" },
  "machinery-added-success": { en: "Machinery added successfully!", bn: "যন্ত্রপাতি সফলভাবে যোগ করা হয়েছে!" },
  "payment-status-updated": { en: "Payment status updated", bn: "পেমেন্ট অবস্থা আপডেট করা হয়েছে" },
  
  // Error messages
  "failed-submit-rental": { en: "Failed to submit rental request. Please try again.", bn: "ভাড়ার অনুরোধ জমা দিতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "failed-add-machinery": { en: "Failed to add machinery. Please try again.", bn: "যন্ত্রপাতি যোগ করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  "failed-load-rental-history": { en: "Failed to load rental history", bn: "ভাড়ার ইতিহাস লোড করতে ব্যর্থ" },
  "failed-update-payment": { en: "Failed to update payment status", bn: "পেমেন্ট অবস্থা আপডেট করতে ব্যর্থ" },
  "no-equipment-found": { en: "No equipment found in your area", bn: "আপনার এলাকায় কোন সরঞ্জাম পাওয়া যায়নি" },
  
  // Machinery actions
  "hide": { en: "Hide", bn: "লুকান" },
  "show": { en: "Show", bn: "দেখান" },
  "made-available": { en: "made available", bn: "উপলব্ধ করা হয়েছে" },
  "made-unavailable": { en: "made unavailable", bn: "অনুপলব্ধ করা হয়েছে" },
  "machinery-availability-updated": { en: "Machinery availability updated", bn: "যন্ত্রপাতির উপলব্ধতা আপডেট করা হয়েছে" },
  "failed-update-availability": { en: "Failed to update machinery availability", bn: "যন্ত্রপাতির উপলব্ধতা আপডেট করতে ব্যর্থ" },
  "delete-machinery": { en: "Delete Machinery", bn: "যন্ত্রপাতি মুছুন" },
  "delete-machinery-confirm": { en: "Are you sure you want to delete this machinery? This action cannot be undone.", bn: "আপনি কি নিশ্চিত যে আপনি এই যন্ত্রপাতি মুছতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।" },
  "machinery-deleted-success": { en: "Machinery deleted successfully", bn: "যন্ত্রপাতি সফলভাবে মুছে ফেলা হয়েছে" },
  "failed-delete-machinery": { en: "Failed to delete machinery", bn: "যন্ত্রপাতি মুছতে ব্যর্থ" },
  "edit-functionality-coming": { en: "Edit functionality will be available soon", bn: "সম্পাদনা কার্যকারিতা শীঘ্রই উপলব্ধ হবে" },
  "coming-soon": { en: "Coming Soon", bn: "শীঘ্রই আসছে" },
  
  // Location and distance
  "km-away": { en: "km away", bn: "কিমি দূরে" },
  "location-permission-required": { en: "Location Permission Required", bn: "অবস্থানের অনুমতি প্রয়োজন" },
  "enable-location-access": { en: "Please enable location access to use this feature.", bn: "এই বৈশিষ্ট্য ব্যবহার করতে অনুগ্রহ করে অবস্থানের অ্যাক্সেস সক্ষম করুন।" },
  "location-unavailable": { en: "Location Unavailable", bn: "অবস্থান অনুপলব্ধ" },
  "unable-get-location": { en: "Unable to get your current location. Please check your location settings.", bn: "আপনার বর্তমান অবস্থান পেতে অক্ষম। অনুগ্রহ করে আপনার অবস্থানের সেটিংস পরীক্ষা করুন।" },
  "enable-location": { en: "Enable Location", bn: "অবস্থান সক্ষম করুন" },
  "location-access-required": { en: "Location access is required for accurate distance calculations and map features.", bn: "সঠিক দূরত্ব গণনা এবং মানচিত্র বৈশিষ্ট্যের জন্য অবস্থানের অ্যাক্সেস প্রয়োজন।" },
  
  // Retry and loading
  "retry": { en: "Retry", bn: "পুনরায় চেষ্টা" },
  "loading-machinery": { en: "Loading your machinery...", bn: "আপনার যন্ত্রপাতি লোড হচ্ছে..." },
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
    if (translation && translation[currentLanguage]) {
      return translation[currentLanguage];
    }
    return key || ''; // Return key if no translation found, ensure it's a string
  };

  const translate = async (text: string): Promise<string> => {
    // If current language is English, return original text
    if (currentLanguage === 'en') {
      return text || '';
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
        [cacheKey]: translatedText || text || ''
      }));
      
      return translatedText || text || '';
    } catch (error) {
      console.error("Translation failed:", error);
      return text || ''; // Return original text if translation fails
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
