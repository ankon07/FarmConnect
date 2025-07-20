import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { Search, MessageCircle, Phone } from "lucide-react-native";

interface QAItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export default function SMSServiceScreen() {
  const router = useRouter();
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
      question: "আমাদের কোম্পানির DLS লাইসেন্স নং ১১২, মেয়াদ ৩০-৬-২৫ ইং পর্যন্ত। ২৫-২৬ ইং সালের জন্য এই লাইসেন্স নবায়নের পদ্ধতি কি?",
      answer: "উপপরিচালক (লেজিসলেশন, প্রশাসন/নিবন্ধন/সার্টিফিকেশন) এর সাথে যোগযোগ করন ০১৭১১১৭৯৫৫৯",
      category: "লাইসেন্স"
    },
    {
      id: 3,
      question: "ফ্রিজিয়ান গরুর বাচ্চা, বয়স ৩৫ দিন, ল্যাম্পিং স্কিন রোগে আক্রমণ হয়েছে, এখন করণীয় কি?",
      answer: "স্পেসিফিক ট্রিটমেন্ট নেই। ক্ষত হলে জীবানুনাশক ড্রেসিং করা এবং আলাদা রাখা, সেকেন্ডারী ইনফেকশন থেকে রক্ষার জন্য পেনিসিলিন ইনজেকশন দিবেন। মশা মাছি থাকা যাবেনা",
      category: "গরু"
    },
    {
      id: 4,
      question: "15 দিন বয়সী পাতি হাঁসের বাচ্চার পা পরা রোগ হয়েছে। কি করনীয়?",
      answer: "পানিতে ভিটামিন বি১ ও বি২ পাউডার খাওয়াবেন। খাবারে জাইমোভেট পাউডার ২-৫ দিন খাওয়াবেন",
      category: "হাঁস"
    },
    {
      id: 5,
      question: "আমার ছাগল ঠান্ডা কাশি ছাগল ওজন ৫..৬ কেজি। এখন কি ওষুধ খাওয়াব",
      answer: "Sagoler sardi kashi hole injection steronvet 2 ml kore i/m dine 1 bar 3 din ebong combipen 8 lac injection i/m dine 1 bar kore 3 din dite hobe",
      category: "ছাগল"
    },
    {
      id: 6,
      question: "গরুর বাছুরের লাম্পি ভাইরাস আক্রমণ করেছে, এর আগেও একই গরুর ২ টা বাছুর পর পর লাম্পি ভাইরাসে মারা গেছে অনেক চিকিৎসা করার পরো ভালো হয়নি,এর করনীয় কি?",
      answer: "স্পেসিফিক ট্রিটমেন্ট নেই। ক্ষত হলে জীবানুনাশক ড্রেসিং করা এবং আলাদা রাখা, সেকেন্ডারী ইনফেকশন থেকে রক্ষার জন্য পেনিসিলিন ইনজেকশন দিবেন। মশা মাছি থাকা যাবেনা",
      category: "গরু"
    },
    {
      id: 7,
      question: "ছাগলগুলো সর্দি ও কাশি হয়েছে, গলায় শব্দ করে। কি করা যায়?",
      answer: "Sagoler sardi kashi hole injection steronvet 2 ml kore i/m dine 1 bar 3 din ebong combipen 8 lac injection i/m dine 1 bar kore 3 din dite hobe",
      category: "ছাগল"
    },
    {
      id: 8,
      question: "আমাদের শাহীওয়াল জাতের গরুকে কয়েকবার বীজ দেওয়ার পরেও গর্ভবতী হচ্ছে না",
      answer: "ডাকে আসলে জ্বরায়ু লুগলস সুপার সলুশন দিয়ে ওয়াশ করে ভিতরে এসপি ভেট দিতে হবে এরপর একই ইনজেকশন মাংসে ৩-৫ দিন। ২১ দিন পর ডাকে আসলে ১২ ঘন্টা পর পর সিমেন ২ বার দিবেন।",
      category: "গরু"
    },
    {
      id: 9,
      question: "হাসের চুনা পায়খনা,নালি নালি,হলুদ পায়খানা",
      answer: "চুনা পায়খানা করলে, Ciprocin/Cipro A vet syrap ১ মিলি ১-২ লিটার পানিতে ৩-৫ দিন দিবেন। প্রকৃতপক্ষে এর কোন চিকিৎসা নেই।",
      category: "হাঁস"
    },
    {
      id: 10,
      question: "হাসের বাচ্চা ছোট অবস্হা কি কি ঔষধ ও কেমনে লালন পালন করব।",
      answer: "২১ দিন বয়সে ডাক প্লেগ ও ২ মাস বয়সে ডাক কলেরা টিকা ও ১৫ দিন পর বুস্টার ডোজ এবং এরপর প্রতি ৬ মাসে একবার করে টিকা দিতে হবে।",
      category: "হাঁস"
    },
    {
      id: 11,
      question: "কম খরচে ষাঁড় গরু দ্রুত মোটাতাজা করার উপায় কী?",
      answer: "প্রথমে কৃমির ওষুধ Endex/Renadex ১ টা ট্যাবলেট/৭৫ কেজি, পরে কাচা ঘাস ও স্বাভাবিক সুষম খাবারের সাথে ভিটামিন ডিবি খাওয়াবেন।",
      category: "গরু"
    },
    {
      id: 12,
      question: "আসসালামুয়ালিকুম। কোয়েল পাখির ঠান্ডার জন্য কি কি ঔষধ লাগবে দয়া করে জানাবেন।",
      answer: "Enrocin সিরাপ ২ মিলি/লিটার পানিতে মিশিয়ে ৩-৫ দিবেন।",
      category: "কোয়েল"
    },
    {
      id: 13,
      question: "ব্রয়লার মুরগীর বয়স ২০দিন সরদি,কাশি কিছুতেই থামছে না। cipro, levo, fastvet খাওয়াছছি। এখন কি করতে পারি।",
      answer: "Enrocin সিরাপ ২ মিলি/লিটার পানিতে মিশিয়ে ৩-৫ দিবেন।",
      category: "মুরগি"
    },
    {
      id: 14,
      question: "মুরগী গুটি হয়েছে।মশার কমডে। কি করবো",
      answer: "Pox rog hole potash pani die gha dhue diben. pow. anidox 20gm 1gm/ 1liter water fed once daily for 7days",
      category: "মুরগি"
    },
    {
      id: 15,
      question: "ছাগল মোটাতাজা করা প্রয়োজন কি কি খাওয়ালে মোটাতাজা হবে",
      answer: "প্রথমে কৃমির ওষুধ Endex/Renadex ১ টা ট্যাবলেট/৭৫ কেজি, পরে কাচা ঘাস ও স্বাভাবিক সুষম খাবারের সাথে ভিটামিন ডিবি খাওয়াবেন।",
      category: "ছাগল"
    }
  ];

  const filteredQA = qaData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.includes(searchQuery))
  );

  const QACard = ({ item }: { item: QAItem }) => (
    <View style={styles.qaCard}>
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
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="SMS Service Q&A" 
        showHelpButton={false}
        onBackPress={() => router.back()}
      />
      
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Livestock SMS Service</Text>
        <Text style={styles.pageSubtitle}>প্রাণিসম্পদের এসএমএস সেবা</Text>
        
        <View style={styles.contactInfo}>
          <Phone size={16} color={COLORS.primary} />
          <Text style={styles.contactText}>Hotline: 16358 (Office hours only)</Text>
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
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.resultsText}>
          {filteredQA.length} টি প্রশ্ন ও উত্তর পাওয়া গেছে
        </Text>
        
        {filteredQA.map((item) => (
          <QACard key={item.id} item={item} />
        ))}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>সেবা সম্পর্কে</Text>
          <Text style={styles.infoText}>
            এই SMS সেবাটি প্রাণিসম্পদ অধিদপ্তর কর্তৃক পরিচালিত। এখানে গবাদি পশু, হাঁস-মুরগি, ছাগল এবং অন্যান্য প্রাণীর রোগ-বালাই, চিকিৎসা এবং পালন পদ্ধতি সম্পর্কে বিশেষজ্ঞ পরামর্শ পাওয়া যায়।
          </Text>
          <Text style={styles.infoText}>
            জরুরি সহায়তার জন্য হটলাইন ১৬৩৫৮ নম্বরে কল করুন (শুধুমাত্র অফিস সময়ে)।
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
  headerSection: {
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  qaCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    paddingTop: 12,
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
  infoSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
