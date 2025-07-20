import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Linking } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { 
  getSeedPrices, 
  getFertilizerPrices, 
  getBADCForms, 
  searchSeedPrices, 
  searchForms, 
  getFormsByCategory 
} from "@/services/badcApi";
import { 
  Wheat, 
  Sprout, 
  FileText, 
  Search, 
  Download, 
  Calendar, 
  ExternalLink, 
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign
} from "lucide-react-native";

interface SeedPriceItem {
  id: number;
  title: string;
  publishDate: string;
  downloadUrl: string;
}

interface FertilizerPrice {
  name: string;
  dealerPrice: number;
  farmerPrice: number;
}

interface FormItem {
  id: number;
  title: string;
  url: string;
  category: string;
}

export default function BADCScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'seed' | 'fertilizer' | 'forms'>('seed');
  const [seedPrices, setSeedPrices] = useState<SeedPriceItem[]>([]);
  const [fertilizerPrices, setFertilizerPrices] = useState<FertilizerPrice[]>([]);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("সকল");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const categories = ["সকল", "কর্মকর্তা/কর্মচারী", "আর্থিক", "ঠিকাদার", "মনিটরিং", "ডিলার", "চাকরি", "কর্মচারী কল্যাণ"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [seedData, fertilizerData, formsData] = await Promise.all([
        getSeedPrices(),
        getFertilizerPrices(),
        getBADCForms()
      ]);
      
      setSeedPrices(seedData);
      setFertilizerPrices(fertilizerData);
      setForms(formsData);
    } catch (error) {
      console.error('Error loading BADC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      if (activeTab === 'seed') {
        const results = await searchSeedPrices(searchQuery);
        setSeedPrices(results);
      } else if (activeTab === 'forms') {
        const results = await searchForms(searchQuery);
        setForms(results);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    setShowCategoryFilter(false);
    
    if (activeTab === 'forms') {
      try {
        setLoading(true);
        if (category === "সকল") {
          const allForms = await getBADCForms();
          setForms(allForms);
        } else {
          const filteredForms = await getFormsByCategory(category);
          setForms(filteredForms);
        }
      } catch (error) {
        console.error('Error filtering forms:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const TabButton = ({ tab, title, icon, isActive }: { 
    tab: 'seed' | 'fertilizer' | 'forms'; 
    title: string; 
    icon: React.ReactNode; 
    isActive: boolean 
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const SeedPriceCard = ({ item }: { item: SeedPriceItem }) => (
    <View style={styles.priceCard}>
      <View style={styles.cardHeader}>
        <Wheat size={20} color={COLORS.primary} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>{item.publishDate}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => handleDownload(item.downloadUrl)}
      >
        <Download size={16} color={COLORS.white} />
        <Text style={styles.downloadButtonText}>ডাউনলোড করুন</Text>
      </TouchableOpacity>
    </View>
  );

  const FertilizerPriceCard = ({ item }: { item: FertilizerPrice }) => (
    <View style={styles.fertilizerCard}>
      <View style={styles.fertilizerHeader}>
        <Sprout size={20} color={COLORS.primary} />
        <Text style={styles.fertilizerName}>{item.name}</Text>
      </View>
      
      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>ডিলার পর্যায়ে</Text>
          <Text style={styles.priceValue}>৳{item.dealerPrice}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>কৃষক পর্যায়ে</Text>
          <Text style={styles.priceValue}>৳{item.farmerPrice}</Text>
        </View>
      </View>
    </View>
  );

  const FormCard = ({ item }: { item: FormItem }) => (
    <View style={styles.formCard}>
      <View style={styles.formHeader}>
        <FileText size={20} color={COLORS.primary} />
        <View style={styles.formInfo}>
          <Text style={styles.formTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.formButton}
        onPress={() => handleDownload(item.url)}
      >
        <ExternalLink size={16} color={COLORS.primary} />
        <Text style={styles.formButtonText}>ফরম দেখুন</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="BADC Services" 
        showHelpButton={false}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Building2 size={32} color={COLORS.primary} />
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>Bangladesh Agricultural Development Corporation</Text>
              <Text style={styles.pageSubtitle}>বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন (বিএডিসি)</Text>
            </View>
          </View>
          
          <Text style={styles.description}>
            Access BADC services including seed prices, fertilizer rates, and application forms. 
            All information is sourced directly from the official BADC website.
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <TabButton 
            tab="seed" 
            title="বীজের মূল্য" 
            icon={<Wheat size={20} color={activeTab === 'seed' ? COLORS.white : COLORS.primary} />}
            isActive={activeTab === 'seed'}
          />
          <TabButton 
            tab="fertilizer" 
            title="সারের মূল্য" 
            icon={<Sprout size={20} color={activeTab === 'fertilizer' ? COLORS.white : COLORS.primary} />}
            isActive={activeTab === 'fertilizer'}
          />
          <TabButton 
            tab="forms" 
            title="ফরম সমূহ" 
            icon={<FileText size={20} color={activeTab === 'forms' ? COLORS.white : COLORS.primary} />}
            isActive={activeTab === 'forms'}
          />
        </View>

        {(activeTab === 'seed' || activeTab === 'forms') && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder={activeTab === 'seed' ? "বীজের নাম খুঁজুন..." : "ফরম খুঁজুন..."}
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>খুঁজুন</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'forms' && (
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowCategoryFilter(!showCategoryFilter)}
              >
                <Filter size={16} color={COLORS.primary} />
                <Text style={styles.filterButtonText}>{selectedCategory}</Text>
                {showCategoryFilter ? (
                  <ChevronUp size={16} color={COLORS.primary} />
                ) : (
                  <ChevronDown size={16} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}

            {showCategoryFilter && (
              <View style={styles.categoryDropdown}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category && styles.selectedCategoryOption
                    ]}
                    onPress={() => handleCategoryFilter(category)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategory === category && styles.selectedCategoryOptionText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>তথ্য লোড হচ্ছে...</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {activeTab === 'seed' && (
              <View>
                <Text style={styles.sectionTitle}>
                  বীজের মূল্য তালিকা ({seedPrices.length} টি)
                </Text>
                {seedPrices.map((item) => (
                  <SeedPriceCard key={item.id} item={item} />
                ))}
              </View>
            )}

            {activeTab === 'fertilizer' && (
              <View>
                <Text style={styles.sectionTitle}>সারের বিক্রয়মূল্য</Text>
                <Text style={styles.sectionSubtitle}>
                  টিএসপি, এমওপি ও ডিএপি সারের ডিলার ও কৃষক পর্যায়ে বিক্রয়মূল্য
                </Text>
                {fertilizerPrices.map((item, index) => (
                  <FertilizerPriceCard key={index} item={item} />
                ))}
                
                <View style={styles.infoBox}>
                  <DollarSign size={20} color={COLORS.info} />
                  <Text style={styles.infoText}>
                    সকল মূল্য প্রতি কেজি হিসেবে নির্ধারিত। সর্বশেষ হালনাগাদ: ২৮ আগস্ট ২০২৪
                  </Text>
                </View>
              </View>
            )}

            {activeTab === 'forms' && (
              <View>
                <Text style={styles.sectionTitle}>
                  আবেদন ফরম সমূহ ({forms.length} টি)
                </Text>
                {forms.map((item) => (
                  <FormCard key={item.id} item={item} />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>সম্পর্কে</Text>
          <Text style={styles.footerText}>
            বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন (বিএডিসি) বাংলাদেশের কৃষি উন্নয়নে নিবেদিত একটি সরকারি প্রতিষ্ঠান। 
            এই অ্যাপে প্রদর্শিত সকল তথ্য সরাসরি বিএডিসির অফিসিয়াল ওয়েবসাইট থেকে সংগ্রহ করা হয়েছে।
          </Text>
          
          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={() => handleDownload('https://badc.gov.bd/')}
          >
            <ExternalLink size={16} color={COLORS.white} />
            <Text style={styles.websiteButtonText}>অফিসিয়াল ওয়েবসাইট দেখুন</Text>
          </TouchableOpacity>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: COLORS.white,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  categoryDropdown: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedCategoryOption: {
    backgroundColor: `${COLORS.primary}15`,
  },
  categoryOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  selectedCategoryOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  contentContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  priceCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  fertilizerCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fertilizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fertilizerName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  formInfo: {
    marginLeft: 12,
    flex: 1,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: `${COLORS.info}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.info,
    fontWeight: '500',
  },
  formButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  formButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.info}10`,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  footerSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  websiteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
