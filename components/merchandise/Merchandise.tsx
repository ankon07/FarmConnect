import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';
import AppHeader from '../common/AppHeader';

interface BusinessService {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  url: string;
  category: string;
  icon: string;
  isNew?: boolean;
}

const businessServices: BusinessService[] = [
  // নতুন উদ্যোক্তা (New Entrepreneurs)
  {
    id: '1',
    title: 'নতুন উদ্যোক্তা',
    titleEn: 'New Entrepreneurs',
    description: 'নতুন উদ্যোক্তাদের জন্য প্রয়োজনীয় তথ্য ও সেবা',
    descriptionEn: 'Essential information and services for new entrepreneurs',
    url: 'https://bangladesh.gov.bd/site/page/91099e44-1efa-47db-8a1e-fa4f73f26852',
    category: 'entrepreneur',
    icon: 'rocket-outline',
    isNew: true
  },
  {
    id: '2',
    title: 'কোম্পানি নিবন্ধন',
    titleEn: 'Company Registration',
    description: 'কোম্পানি নিবন্ধনের শর্ত ও প্রক্রিয়া',
    descriptionEn: 'Company registration requirements and process',
    url: 'http://www.roc.gov.bd:7781/',
    category: 'entrepreneur',
    icon: 'business-outline'
  },

  // ট্রেড লাইসেন্স (Trade License)
  {
    id: '3',
    title: 'ট্রেড লাইসেন্স',
    titleEn: 'Trade License',
    description: 'ব্যবসায়িক লাইসেন্স সংক্রান্ত সেবা',
    descriptionEn: 'Business license related services',
    url: 'https://bangladesh.gov.bd/site/page/0d1259d8-29a4-4c1c-a14b-4514f7ef127e',
    category: 'license',
    icon: 'document-text-outline'
  },
  {
    id: '4',
    title: 'ট্রেড লাইসেন্স আবেদন (ঢাকা)',
    titleEn: 'Trade License Application (Dhaka)',
    description: 'ঢাকা উত্তর সিটি কর্পোরেশনের ট্রেড লাইসেন্স',
    descriptionEn: 'Dhaka North City Corporation trade license',
    url: 'http://www.dncc.gov.bd/forms/trade-license.html',
    category: 'license',
    icon: 'card-outline'
  },

  // বৈদেশিক বিনিয়োগ (Foreign Investment)
  {
    id: '5',
    title: 'বৈদেশিক বিনিয়োগ',
    titleEn: 'Foreign Investment',
    description: 'বৈদেশিক বিনিয়োগ সংক্রান্ত তথ্য ও সেবা',
    descriptionEn: 'Foreign investment information and services',
    url: 'https://bangladesh.gov.bd/site/page/13d5cd57-8430-4d83-ac76-ca14de906b32',
    category: 'investment',
    icon: 'globe-outline'
  },
  {
    id: '6',
    title: 'বিনিয়োগ উন্নয়ন কর্তৃপক্ষ (বিডা)',
    titleEn: 'Bangladesh Investment Development Authority (BIDA)',
    description: 'বাংলাদেশ বিনিয়োগ উন্নয়ন কর্তৃপক্ষের সেবা',
    descriptionEn: 'Bangladesh Investment Development Authority services',
    url: 'https://bida.gov.bd/',
    category: 'investment',
    icon: 'trending-up-outline'
  },

  // নতুন ব্যবসা (New Business)
  {
    id: '7',
    title: 'নতুন ব্যবসা',
    titleEn: 'New Business',
    description: 'নতুন ব্যবসা শুরুর জন্য প্রয়োজনীয় তথ্য',
    descriptionEn: 'Essential information for starting new business',
    url: 'https://bangladesh.gov.bd/site/page/34afab30-9c4b-45d3-ac1f-89af9e398a32',
    category: 'business',
    icon: 'storefront-outline'
  },

  // ব্যাংক হিসাব (Bank Account)
  {
    id: '8',
    title: 'ব্যাংক হিসাব খোলা',
    titleEn: 'Bank Account Opening',
    description: 'ব্যাংক হিসাব খোলার প্রক্রিয়া ও প্রয়োজনীয় কাগজপত্র',
    descriptionEn: 'Bank account opening process and required documents',
    url: 'https://bangladesh.gov.bd/site/page/d50fe8d2-4194-4889-8de1-8ab9c8af2545',
    category: 'banking',
    icon: 'card-outline'
  },
  {
    id: '9',
    title: 'অনলাইন ব্যাংকিং (জনতা ব্যাংক)',
    titleEn: 'Online Banking (Janata Bank)',
    description: 'জনতা ব্যাংকের অনলাইন ব্যাংকিং সেবা',
    descriptionEn: 'Janata Bank online banking services',
    url: 'https://www.jb.com.bd/services/onlineBanking',
    category: 'banking',
    icon: 'phone-portrait-outline'
  },

  // শেয়ার মার্কেট (Share Market)
  {
    id: '10',
    title: 'শেয়ার মার্কেট',
    titleEn: 'Share Market',
    description: 'শেয়ার বাজার সংক্রান্ত তথ্য ও সেবা',
    descriptionEn: 'Share market information and services',
    url: 'https://bangladesh.gov.bd/site/page/93a420bc-597a-4c82-a71d-7b5b74eb2524',
    category: 'stock',
    icon: 'trending-up-outline'
  },
  {
    id: '11',
    title: 'ঢাকা স্টক এক্সচেঞ্জ',
    titleEn: 'Dhaka Stock Exchange',
    description: 'ঢাকা স্টক এক্সচেঞ্জের বাজার তথ্য',
    descriptionEn: 'Dhaka Stock Exchange market information',
    url: 'http://www.dsebd.org/',
    category: 'stock',
    icon: 'bar-chart-outline'
  },
  {
    id: '12',
    title: 'চট্টগ্রাম স্টক এক্সচেঞ্জ',
    titleEn: 'Chittagong Stock Exchange',
    description: 'চট্টগ্রাম স্টক এক্সচেঞ্জের বাজার তথ্য',
    descriptionEn: 'Chittagong Stock Exchange market information',
    url: 'http://www.cse.com.bd/',
    category: 'stock',
    icon: 'analytics-outline'
  },

  // ব্যবসায়িক সংগঠন (Business Organizations)
  {
    id: '13',
    title: 'ব্যবসায়িক সংগঠনসমূহ',
    titleEn: 'Business Organizations',
    description: 'বাংলাদেশের প্রধান ব্যবসায়িক সংগঠনসমূহ',
    descriptionEn: 'Major business organizations of Bangladesh',
    url: 'https://bangladesh.gov.bd/site/page/27dad83d-754c-4dbb-b91a-b54ef097f98f',
    category: 'organization',
    icon: 'people-outline'
  },

  // ট্রেডিং কর্পোরেশন (Trading Corporation)
  {
    id: '14',
    title: 'ট্রেডিং কর্পোরেশন অফ বাংলাদেশ',
    titleEn: 'Trading Corporation of Bangladesh',
    description: 'টিসিবির পণ্য বিতরণ ও মূল্য তথ্য',
    descriptionEn: 'TCB product distribution and price information',
    url: 'http://www.tcb.gov.bd/',
    category: 'trading',
    icon: 'cube-outline'
  },

  // কর সেবা (Tax Services)
  {
    id: '15',
    title: 'কর পরিশোধ',
    titleEn: 'Tax Payment',
    description: 'আয়কর ও অন্যান্য কর পরিশোধের তথ্য',
    descriptionEn: 'Income tax and other tax payment information',
    url: 'http://www.nbr-bd.org/incometax.html',
    category: 'tax',
    icon: 'receipt-outline'
  },
  {
    id: '16',
    title: 'ই-রিটার্ন',
    titleEn: 'E-Return',
    description: 'অনলাইন আয়কর রিটার্ন দাখিল',
    descriptionEn: 'Online income tax return submission',
    url: 'https://etaxnbr.gov.bd/',
    category: 'tax',
    icon: 'document-outline'
  },

  // সরকারি ক্রয় (Government Procurement)
  {
    id: '17',
    title: 'ই-জিপি (e-GP)',
    titleEn: 'e-GP (Electronic Government Procurement)',
    description: 'সরকারি ক্রয় কার্যক্রমের অনলাইন প্ল্যাটফর্ম',
    descriptionEn: 'Online platform for government procurement',
    url: 'https://www.eprocure.gov.bd/',
    category: 'procurement',
    icon: 'briefcase-outline'
  },

  // রপ্তানি-আমদানি (Export-Import)
  {
    id: '18',
    title: 'রপ্তানি উন্নয়ন ব্যুরো',
    titleEn: 'Export Promotion Bureau',
    description: 'রপ্তানি সংক্রান্ত তথ্য ও সেবা',
    descriptionEn: 'Export related information and services',
    url: 'http://www.epb.gov.bd/',
    category: 'export',
    icon: 'airplane-outline'
  },

  // শিল্প সেবা (Industrial Services)
  {
    id: '19',
    title: 'শিল্প মন্ত্রণালয়',
    titleEn: 'Ministry of Industries',
    description: 'শিল্প উন্নয়ন সংক্রান্ত নীতি ও সেবা',
    descriptionEn: 'Industrial development policies and services',
    url: 'https://moind.gov.bd/',
    category: 'industry',
    icon: 'construct-outline'
  },
  {
    id: '20',
    title: 'বাংলাদেশ ক্ষুদ্র ও কুটির শিল্প কর্পোরেশন',
    titleEn: 'Bangladesh Small and Cottage Industries Corporation',
    description: 'ক্ষুদ্র ও কুটির শিল্প উন্নয়ন সেবা',
    descriptionEn: 'Small and cottage industries development services',
    url: 'http://www.bscic.gov.bd/',
    category: 'industry',
    icon: 'home-outline'
  }
];

const categories = [
  { key: 'all', title: 'সকল সেবা', titleEn: 'All Services', icon: 'grid-outline', color: COLORS.primary },
  { key: 'entrepreneur', title: 'নতুন উদ্যোক্তা', titleEn: 'New Entrepreneurs', icon: 'rocket-outline', color: '#FF6B35' },
  { key: 'license', title: 'লাইসেন্স', titleEn: 'Licenses', icon: 'document-text-outline', color: '#4ECDC4' },
  { key: 'investment', title: 'বিনিয়োগ', titleEn: 'Investment', icon: 'trending-up-outline', color: '#45B7D1' },
  { key: 'business', title: 'নতুন ব্যবসা', titleEn: 'New Business', icon: 'storefront-outline', color: '#96CEB4' },
  { key: 'banking', title: 'ব্যাংকিং', titleEn: 'Banking', icon: 'card-outline', color: '#FFEAA7' },
  { key: 'stock', title: 'শেয়ার বাজার', titleEn: 'Stock Market', icon: 'bar-chart-outline', color: '#DDA0DD' },
  { key: 'tax', title: 'কর সেবা', titleEn: 'Tax Services', icon: 'receipt-outline', color: '#FFB6C1' },
  { key: 'procurement', title: 'সরকারি ক্রয়', titleEn: 'Procurement', icon: 'briefcase-outline', color: '#98D8C8' },
  { key: 'export', title: 'রপ্তানি-আমদানি', titleEn: 'Export-Import', icon: 'airplane-outline', color: '#F7DC6F' },
  { key: 'industry', title: 'শিল্প', titleEn: 'Industry', icon: 'construct-outline', color: '#BB8FCE' },
  { key: 'trading', title: 'ট্রেডিং', titleEn: 'Trading', icon: 'cube-outline', color: '#85C1E9' },
  { key: 'organization', title: 'সংগঠন', titleEn: 'Organizations', icon: 'people-outline', color: '#F8C471' }
];

export const Merchandise: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t, currentLanguage } = useTranslation();

  const filteredServices = selectedCategory === 'all' 
    ? businessServices 
    : businessServices.filter(service => service.category === selectedCategory);

  const selectedCategoryInfo = categories.find(cat => cat.key === selectedCategory);

  const handleServicePress = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('ত্রুটি', 'এই লিংকটি খোলা যাচ্ছে না।');
      }
    } catch (error) {
      Alert.alert('ত্রুটি', 'সেবাটি অ্যাক্সেস করতে সমস্যা হচ্ছে।');
    }
  };

  const renderCategoryButton = (category: any) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryButton,
        selectedCategory === category.key && [styles.selectedCategoryButton, { backgroundColor: category.color }]
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <View style={[
        styles.categoryIconContainer,
        selectedCategory === category.key && { backgroundColor: 'rgba(255,255,255,0.2)' }
      ]}>
        <Ionicons 
          name={category.icon as any} 
          size={18} 
          color={selectedCategory === category.key ? COLORS.white : category.color} 
        />
      </View>
      <Text 
        style={[
          styles.categoryButtonText,
          selectedCategory === category.key && styles.selectedCategoryButtonText
        ]}
      >
        {currentLanguage === 'en' ? category.titleEn : category.title}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceCard = (service: BusinessService) => {
    const categoryInfo = categories.find(cat => cat.key === service.category);
    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.serviceCard, { borderLeftColor: categoryInfo?.color || COLORS.primary }]}
        onPress={() => handleServicePress(service.url, service.title)}
      >
        <View style={styles.serviceHeader}>
          <View style={[styles.serviceIconContainer, { backgroundColor: categoryInfo?.color + '20' || COLORS.primary + '20' }]}>
            <Ionicons 
              name={service.icon as any} 
              size={24} 
              color={categoryInfo?.color || COLORS.primary} 
            />
          </View>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceTitleRow}>
              <Text style={styles.serviceTitle}>
                {currentLanguage === 'en' ? service.titleEn : service.title}
              </Text>
              {service.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{currentLanguage === 'en' ? 'New' : 'নতুন'}</Text>
                </View>
              )}
            </View>
            <Text style={styles.serviceDescription}>
              {currentLanguage === 'en' ? service.descriptionEn : service.description}
            </Text>
            <Text style={styles.serviceCategoryText}>
              {currentLanguage === 'en' ? categoryInfo?.titleEn : categoryInfo?.title || 'সাধারণ'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Business Services" 
        showHelpButton={false}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Business & Commerce Services</Text>
          <Text style={styles.pageSubtitle}>ব্যবসা-বাণিজ্য সেবাসমূহ</Text>
          <Text style={styles.description}>
            Access government e-services related to business and commerce. 
            These services are provided by the Government of Bangladesh to support entrepreneurs and businesses.
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryInfo?.title} ({filteredServices.length}টি সেবা)
          </Text>
          {filteredServices.map(renderServiceCard)}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About These Services</Text>
          <Text style={styles.infoText}>
            These e-services are part of the Bangladesh National Portal initiative to digitize government services. 
            They provide entrepreneurs and businesses with easy access to important information and licensing services.
          </Text>
          <Text style={styles.infoText}>
            For technical support or additional information, please contact the respective department or visit the Bangladesh National Portal.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategoryButton: {
    borderColor: 'transparent',
    shadowOpacity: 0.2,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  servicesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  newBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  serviceCategoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  infoSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
});
