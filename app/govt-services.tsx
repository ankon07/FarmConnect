import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, TextInput } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { ExternalLink, Fish, Smartphone, FileText, Search, MessageCircle, Phone, ChevronDown, ChevronUp } from "lucide-react-native";

interface ServiceItem {
  id: number;
  title: string;
  titleBn: string;
  url: string;
  icon: React.ReactNode;
  description: string;
}

interface QAItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export default function GovtServicesScreen() {
  const router = useRouter();
  const [showSMSData, setShowSMSData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const qaData: QAItem[] = [
    {
      id: 1,
      question: "ছাগল ঝিমিয়ে রোদ পোহালে করনীয়।",
      answer: "আপনার উপজেলার VS এর সাথে ০১৬৪৪১৬৭৭২৭ যোগাযোগ করুন।",
      category: "ছাগল"
    },
    {
      id: 2,
      question: "ফ্রিজিয়ান গরুর বাচ্চা, বয়স ৩৫ দিন, ল্যাম্পিং স্কিন রোগে আক্রমণ হয়েছে, এখন করণীয় কি?",
      answer: "স্পেসিফিক ট্রিটমেন্ট নেই। ক্ষত হলে জীবানুনাশক ড্রেসিং করা এবং আলাদা রাখা, সেকেন্ডারী ইনফেকশন থেকে রক্ষার জন্য পেনিসিলিন ইনজেকশন দিবেন। মশা মাছি থাকা যাবেনা",
      category: "গরু"
    },
    {
      id: 3,
      question: "15 দিন বয়সী পাতি হাঁসের বাচ্চার পা পরা রোগ হয়েছে। কি করনীয়?",
      answer: "পানিতে ভিটামিন বি১ ও বি২ পাউডার খাওয়াবেন। খাবারে জাইমোভেট পাউডার ২-৫ দিন খাওয়াবেন",
      category: "হাঁস"
    },
    {
      id: 4,
      question: "আমার ছাগল ঠান্ডা কাশি ছাগল ওজন ৫..৬ কেজি। এখন কি ওষুধ খাওয়াব",
      answer: "Sagoler sardi kashi hole injection steronvet 2 ml kore i/m dine 1 bar 3 din ebong combipen 8 lac injection i/m dine 1 bar kore 3 din dite hobe",
      category: "ছাগল"
    },
    {
      id: 5,
      question: "ছাগলগুলো সর্দি ও কাশি হয়েছে, গলায় শব্দ করে। কি করা যায়?",
      answer: "Sagoler sardi kashi hole injection steronvet 2 ml kore i/m dine 1 bar 3 din ebong combipen 8 lac injection i/m dine 1 bar kore 3 din dite hobe",
      category: "ছাগল"
    },
    {
      id: 6,
      question: "হাসের চুনা পায়খনা,নালি নালি,হলুদ পায়খানা",
      answer: "চুনা পায়খানা করলে, Ciprocin/Cipro A vet syrap ১ মিলি ১-২ লিটার পানিতে ৩-৫ দিন দিবেন। প্রকৃতপক্ষে এর কোন চিকিৎসা নেই।",
      category: "হাঁস"
    },
    {
      id: 7,
      question: "হাসের বাচ্চা ছোট অবস্হা কি কি ঔষধ ও কেমনে লালন পালন করব।",
      answer: "২১ দিন বয়সে ডাক প্লেগ ও ২ মাস বয়সে ডাক কলেরা টিকা ও ১৫ দিন পর বুস্টার ডোজ এবং এরপর প্রতি ৬ মাসে একবার করে টিকা দিতে হবে।",
      category: "হাঁস"
    },
    {
      id: 8,
      question: "কম খরচে ষাঁড় গরু দ্রুত মোটাতাজা করার উপায় কী?",
      answer: "প্রথমে কৃমির ওষুধ Endex/Renadex ১ টা ট্যাবলেট/৭৫ কেজি, পরে কাচা ঘাস ও স্বাভাবিক সুষম খাবারের সাথে ভিটামিন ডিবি খাওয়াবেন।",
      category: "গরু"
    },
    {
      id: 9,
      question: "ব্রয়লার মুরগীর বয়স ২০দিন সরদি,কাশি কিছুতেই থামছে না। cipro, levo, fastvet খাওয়াছছি। এখন কি করতে পারি।",
      answer: "Enrocin সিরাপ ২ মিলি/লিটার পানিতে মিশিয়ে ৩-৫ দিবেন।",
      category: "মুরগি"
    },
    {
      id: 10,
      question: "মুরগী গুটি হয়েছে।মশার কমডে। কি করবো",
      answer: "Pox rog hole potash pani die gha dhue diben. pow. anidox 20gm 1gm/ 1liter water fed once daily for 7days",
      category: "মুরগি"
    }
  ];

  const filteredQA = qaData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.includes(searchQuery))
  );

  const services: ServiceItem[] = [
    {
      id: 1,
      title: "Fish Advice System",
      titleBn: "ফিস এ্যাডভাইস সিস্টেম",
      url: "http://erp.fisheries.gov.bd/fishadvice_final/index.html",
      icon: <Fish size={24} color={COLORS.primary} />,
      description: "Get expert advice on fish farming, disease management, and aquaculture best practices."
    },
    {
      id: 2,
      title: "Fish Feed Licensing",
      titleBn: "মৎস্যখাদ্যের লাইসেন্সিং",
      url: "http://erp.fisheries.gov.bd/?page_id=6",
      icon: <FileText size={24} color={COLORS.primary} />,
      description: "Apply for fish feed manufacturing and distribution licenses online."
    },
    {
      id: 3,
      title: "Livestock SMS Service",
      titleBn: "প্রাণিসম্পদের এসএমএস সেবা",
      url: "http://sms.dls.gov.bd/",
      icon: <Smartphone size={24} color={COLORS.primary} />,
      description: "Get livestock-related information and advice through SMS service. Access to 100+ Q&A on animal health, diseases, and farming practices."
    },
    {
      id: 4,
      title: "BAMIS Weather Advisory",
      titleBn: "বামিস আবহাওয়া পরামর্শ",
      url: "https://www.bamis.gov.bd/bulletin/nation/current/",
      icon: <FileText size={24} color={COLORS.primary} />,
      description: "Real-time agricultural weather advisory bulletins with region-specific farming guidance, crop management, and livestock care recommendations."
    }
  ];

  const handleServicePress = async (service: ServiceItem) => {
    try {
      // Handle BAMIS service specially to open internal page
      if (service.id === 4) {
        router.push("/bamis-bulletin" as any);
        return;
      }
      
      const supported = await Linking.canOpenURL(service.url);
      if (supported) {
        await Linking.openURL(service.url);
      } else {
        console.error("Cannot open URL:", service.url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const ServiceCard = ({ service }: { service: ServiceItem }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.iconContainer}>
          {service.icon}
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceTitleBn}>{service.titleBn}</Text>
        </View>
        <ExternalLink size={20} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.serviceDescription}>{service.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Government Services" 
        showHelpButton={false}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Fisheries & Livestock Services</Text>
          <Text style={styles.pageSubtitle}>মৎস্য ও প্রাণী সেবাসমূহ</Text>
          <Text style={styles.description}>
            Access government e-services related to fisheries and livestock management. 
            These services are provided by the Government of Bangladesh to support farmers and agricultural businesses.
          </Text>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </View>

        {/* SMS Service Q&A Section */}
        <View style={styles.smsSection}>
          <TouchableOpacity 
            style={styles.smsHeader}
            onPress={() => setShowSMSData(!showSMSData)}
            activeOpacity={0.7}
          >
            <View style={styles.smsHeaderLeft}>
              <Smartphone size={20} color={COLORS.primary} />
              <Text style={styles.smsTitle}>SMS Service Q&A Database</Text>
            </View>
            {showSMSData ? (
              <ChevronUp size={20} color={COLORS.textSecondary} />
            ) : (
              <ChevronDown size={20} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
          
          {showSMSData && (
            <View style={styles.smsContent}>
              <View style={styles.smsInfo}>
                <View style={styles.contactInfo}>
                  <Phone size={16} color={COLORS.primary} />
                  <Text style={styles.contactText}>Hotline: 16358 (Office hours only)</Text>
                </View>
                <Text style={styles.smsDescription}>
                  Browse through common questions and expert answers about livestock health, diseases, and farming practices.
                </Text>
              </View>

              <View style={styles.searchContainer}>
                <Search size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search questions and answers..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <Text style={styles.resultsText}>
                {filteredQA.length} টি প্রশ্ন ও উত্তর পাওয়া গেছে
              </Text>

              {filteredQA.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.qaCard}>
                  <View style={styles.questionSection}>
                    <MessageCircle size={16} color={COLORS.primary} />
                    <Text style={styles.questionLabel}>প্রশ্ন:</Text>
                    {item.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.questionText}>{item.question}</Text>
                  
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>উত্তর:</Text>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                </View>
              ))}

              {filteredQA.length > 5 && (
                <Text style={styles.moreResultsText}>
                  আরও {filteredQA.length - 5} টি ফলাফল রয়েছে। আরও দেখতে সার্চ ব্যবহার করুন।
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About These Services</Text>
          <Text style={styles.infoText}>
            These e-services are part of the Bangladesh National Portal initiative to digitize government services. 
            They provide farmers and agricultural businesses with easy access to important information and licensing services.
          </Text>
          <Text style={styles.infoText}>
            For technical support or additional information, please contact the respective department or visit the Bangladesh National Portal.
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  serviceTitleBn: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
  smsSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  smsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.lightBackground,
  },
  smsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  smsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  smsContent: {
    padding: 16,
  },
  smsInfo: {
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  smsDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  qaCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 8,
  },
  categoryBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: "auto",
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  questionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  answerSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.success,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  moreResultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});
