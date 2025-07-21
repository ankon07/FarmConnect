import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, TextInput } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { ExternalLink, Fish, Smartphone, FileText, Droplets, Wheat, Truck, BookOpen, Building, Wrench, DollarSign, Users, MapPin, Award, Microscope, Home, Calendar, GraduationCap, Shield } from "lucide-react-native";

interface ServiceItem {
  id: number;
  title: string;
  titleBn: string;
  url: string;
  icon: React.ReactNode;
  description: string;
}


export default function GovtServicesScreen() {
  const router = useRouter();

  const services: ServiceItem[] = [
    // Existing Fisheries & Livestock Services
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
    },
    
    // Ministry of Agriculture Services (45 services)
    {
      id: 5,
      title: "Irrigation Water Quality Testing",
      titleBn: "সেচের পানির গুণাগুণ পরীক্ষা",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Droplets size={24} color={COLORS.primary} />,
      description: "Test and analyze irrigation water quality for optimal crop production."
    },
    {
      id: 6,
      title: "Irrigation Scheme Service",
      titleBn: "সেচ স্কীম সেবা",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Droplets size={24} color={COLORS.primary} />,
      description: "Access irrigation scheme services and water management solutions."
    },
    {
      id: 7,
      title: "Pump Operator Selection",
      titleBn: "পাম্প অপারেটর নির্বাচন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Users size={24} color={COLORS.primary} />,
      description: "Selection and training services for irrigation pump operators."
    },
    {
      id: 8,
      title: "Irrigation Card Service",
      titleBn: "সেচ কার্ড প্রদান",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <FileText size={24} color={COLORS.primary} />,
      description: "Apply for and receive irrigation service cards for farmers."
    },
    {
      id: 9,
      title: "Pump Maintenance",
      titleBn: "পাম্প রক্ষণাবেক্ষণ",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Wrench size={24} color={COLORS.primary} />,
      description: "Maintenance and repair services for irrigation pumps and equipment."
    },
    {
      id: 10,
      title: "Grain Storage for Small Farmers",
      titleBn: "ক্ষুদ্র ও প্রান্তিক চাষীদের দানাদার শস্য গুদামজাতকরণ সুবিধা প্রদান",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Building size={24} color={COLORS.primary} />,
      description: "Storage facilities and services for small and marginal farmers' grain crops."
    },
    {
      id: 11,
      title: "Online Fertilizer Recommendation",
      titleBn: "অন-লাইন সার সুপারিশ",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Wheat size={24} color={COLORS.primary} />,
      description: "Get personalized fertilizer recommendations based on soil and crop analysis."
    },
    {
      id: 12,
      title: "Market Information Service",
      titleBn: "বাজার তথ্য সরবরাহ/অনলাইনে প্রকাশ",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <DollarSign size={24} color={COLORS.primary} />,
      description: "Access real-time market prices and agricultural commodity information."
    },
    {
      id: 13,
      title: "Online Market Directory",
      titleBn: "অনলাইন মার্কেট ডাইরেক্টরী",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <MapPin size={24} color={COLORS.primary} />,
      description: "Directory of agricultural markets, buyers, and sellers across Bangladesh."
    },
    {
      id: 14,
      title: "Agricultural Machinery Subsidy",
      titleBn: "কৃষি যন্ত্রপাতি ক্রয়ের ক্ষেত্রে ভর্তুকি প্রদান",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Truck size={24} color={COLORS.primary} />,
      description: "Apply for government subsidies on agricultural machinery purchases."
    },
    {
      id: 15,
      title: "PhD Scholarship & Research Grant",
      titleBn: "পিএইচডি বৃত্তি ও গবেষণা অনুদান প্রদান",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <GraduationCap size={24} color={COLORS.primary} />,
      description: "Apply for PhD scholarships and research grants in agricultural sciences."
    },
    {
      id: 16,
      title: "National Crop Pest Museum Virtual Tour",
      titleBn: "ন্যাশনাল ক্রপ পেস্ট মিউজিয়াম ভার্চুয়ালি পরিদর্শন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Microscope size={24} color={COLORS.primary} />,
      description: "Virtual tour of the National Crop Pest Museum for educational purposes."
    },
    {
      id: 17,
      title: "Training Registration (BADC)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালা নিবন্ধন (বিএডিসি)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for agricultural training programs, seminars, and workshops by BADC."
    },
    {
      id: 18,
      title: "Seed Sample Testing",
      titleBn: "প্রত্যয়ন বহির্ভূত বীজ নমুনা সংগ্রহ ও পরীক্ষা",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Microscope size={24} color={COLORS.primary} />,
      description: "Collection and testing of non-certified seed samples for quality assurance."
    },
    {
      id: 19,
      title: "Field Certification",
      titleBn: "মাঠ প্রত্যয়ন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Award size={24} color={COLORS.primary} />,
      description: "Field certification services for crop production and quality standards."
    },
    {
      id: 20,
      title: "Agricultural Research",
      titleBn: "কৃষি বিষয়ক গবেষণা",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Microscope size={24} color={COLORS.primary} />,
      description: "Access agricultural research services and collaborate with research institutions."
    },
    {
      id: 21,
      title: "Fertilizer Import Registration",
      titleBn: "সার আমদানী নিবন্ধন ও নবায়ন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <FileText size={24} color={COLORS.primary} />,
      description: "Registration and renewal services for fertilizer import licenses."
    },
    {
      id: 22,
      title: "Fertilizer Production Registration",
      titleBn: "সার উৎপাদন নিবন্ধন ও নবায়ন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Building size={24} color={COLORS.primary} />,
      description: "Registration and renewal for fertilizer manufacturing licenses."
    },
    {
      id: 23,
      title: "Fertilizer Dealer Registration",
      titleBn: "সার পরিবেশক নিবন্ধন ও নবায়ন (সংরক্ষণ, বিতরণ, বিপণন, বিক্রয়)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Users size={24} color={COLORS.primary} />,
      description: "Registration for fertilizer dealers, distributors, and retailers."
    },
    {
      id: 24,
      title: "Seed Dealer Registration",
      titleBn: "বীজ ডিলার নিয়োগ ও নবায়ন আবেদন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Users size={24} color={COLORS.primary} />,
      description: "Registration and renewal applications for seed dealers and distributors."
    },
    {
      id: 25,
      title: "Tube Well Installation License",
      titleBn: "নলকূপ স্থাপনের লাইসেন্স (নতুন)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Droplets size={24} color={COLORS.primary} />,
      description: "Apply for new tube well installation licenses for irrigation."
    },
    {
      id: 26,
      title: "Agricultural Marketing License",
      titleBn: "কৃষি বিপণন লাইসেন্স প্রদান/নবায়ন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <DollarSign size={24} color={COLORS.primary} />,
      description: "Obtain or renew agricultural marketing and trading licenses."
    },
    {
      id: 27,
      title: "Crop Variety Registration",
      titleBn: "অনিয়ন্ত্রিত ফসলের জাত নিবন্ধন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Wheat size={24} color={COLORS.primary} />,
      description: "Registration services for uncontrolled crop varieties and new cultivars."
    },
    {
      id: 28,
      title: "Seed Import Approval",
      titleBn: "ফসলের বীজ আমদানি অনুমোদন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <FileText size={24} color={COLORS.primary} />,
      description: "Approval process for importing crop seeds and planting materials."
    },
    {
      id: 29,
      title: "Agricultural Magazine Subscription",
      titleBn: "মাসিক কৃষিকথা লেখা আহবান ও সাবস্ক্রিপশন (ম্যাগাজিন)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Subscribe to monthly agricultural magazine and submit articles."
    },
    {
      id: 30,
      title: "Venue Booking Service",
      titleBn: "ভেন্যু ভাড়া/বুকিং এর অনুরোধ",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Calendar size={24} color={COLORS.primary} />,
      description: "Book venues and facilities for agricultural events and meetings."
    },
    {
      id: 31,
      title: "Seed Export Approval",
      titleBn: "ফসলের বীজ রপ্তানি অনুমোদন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <FileText size={24} color={COLORS.primary} />,
      description: "Approval process for exporting crop seeds and agricultural products."
    },
    {
      id: 32,
      title: "Existing Tube Well License",
      titleBn: "বিদ্যমান নলকূপের লাইসেন্সের জন্য আবেদন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Droplets size={24} color={COLORS.primary} />,
      description: "Apply for licenses for existing tube wells and irrigation systems."
    },
    {
      id: 33,
      title: "Hybrid Rice Seed Import",
      titleBn: "বোরো হাইব্রিড ধানবীজ আমদানির অনুমোদন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Wheat size={24} color={COLORS.primary} />,
      description: "Import approval for Boro hybrid rice seeds and varieties."
    },
    {
      id: 34,
      title: "Certified Seed Testing",
      titleBn: "প্রত্যয়নের আওতাধীন বীজ পরীক্ষা",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Microscope size={24} color={COLORS.primary} />,
      description: "Testing services for certified seeds and quality assurance."
    },
    {
      id: 35,
      title: "Pest Museum Visit Request",
      titleBn: "ন্যাশনাল ক্রপ পেস্ট মিউজিয়াম সরাসরি পরিদর্শনের জন্য অনুরোধ",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Calendar size={24} color={COLORS.primary} />,
      description: "Request for direct visit to the National Crop Pest Museum."
    },
    {
      id: 36,
      title: "Virtual Soil Museum",
      titleBn: "বাংলাদেশের ভার্চুয়াল মৃত্তিকা জাদুঘর",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Microscope size={24} color={COLORS.primary} />,
      description: "Explore Bangladesh's virtual soil museum for educational purposes."
    },
    {
      id: 37,
      title: "Sponsored Training Request",
      titleBn: "স্পন্সরড প্রশিক্ষণ/সেমিনার/কর্মশালা আয়োজনের অনুরোধ",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Request for organizing sponsored training programs and workshops."
    },
    {
      id: 38,
      title: "Duplicate Certificate Request",
      titleBn: "ডুপ্লিকেট সার্টিফিকেট উত্তোলনের আবেদন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <FileText size={24} color={COLORS.primary} />,
      description: "Apply for duplicate certificates and official documents."
    },
    {
      id: 39,
      title: "Accommodation Service",
      titleBn: "আবাসন/ডরমিটরি সেবার অনুরোধ",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Home size={24} color={COLORS.primary} />,
      description: "Request accommodation and dormitory services for training participants."
    },
    {
      id: 40,
      title: "Resource Person Registration",
      titleBn: "রিসোর্স পার্সন পুলে নিবন্ধন",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <Users size={24} color={COLORS.primary} />,
      description: "Register as a resource person for agricultural training programs."
    },
    {
      id: 41,
      title: "Training Registration (BSRI)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালা (বিএসআরআই)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for training programs by Bangladesh Sugarcane Research Institute."
    },
    {
      id: 42,
      title: "Training Registration (BINA)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালা নিবন্ধন (বিনা)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for training programs by Bangladesh Institute of Nuclear Agriculture."
    },
    {
      id: 43,
      title: "Training Registration (BWMRI)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালা নিবন্ধন (বিডাব্লিউএমআরআই)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for training programs by Bangladesh Wheat and Maize Research Institute."
    },
    {
      id: 44,
      title: "Training Registration (BARC)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালা নিবন্ধন (বিএআরসি)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for training programs by Bangladesh Agricultural Research Council."
    },
    {
      id: 45,
      title: "Training Registration (NATA)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালার জন্য নিবন্ধন (নাটা)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for training programs by National Agricultural Training Academy."
    },
    {
      id: 46,
      title: "Training Registration (SRDI)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালা নিবন্ধন (এসআরডিআই)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for training programs by Soil Resource Development Institute."
    },
    {
      id: 47,
      title: "Training Registration (CDB)",
      titleBn: "প্রশিক্ষণ/সেমিনার/কর্মশালা নিবন্ধন (সিডিবি)",
      url: "http://service.moa.gov.bd/portal/all-services",
      icon: <BookOpen size={24} color={COLORS.primary} />,
      description: "Register for training programs by Cotton Development Board."
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
          <Text style={styles.pageTitle}>Government Agricultural Services</Text>
          <Text style={styles.pageSubtitle}>সরকারি কৃষি সেবাসমূহ</Text>
          <Text style={styles.description}>
            Access comprehensive government e-services for agriculture, fisheries, and livestock management. 
            These services include 47+ digital services from Ministry of Agriculture and related departments to support farmers and agricultural businesses across Bangladesh.
          </Text>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Available Services ({services.length})</Text>
          <Text style={styles.servicesNote}>
            Browse through {services.length} government e-services including irrigation, fertilizer management, seed certification, training programs, and more.
          </Text>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About These Services</Text>
          <Text style={styles.infoText}>
            These e-services are part of the Bangladesh National Portal initiative to digitize government services. 
            The collection includes services from Ministry of Agriculture, Department of Fisheries, Department of Livestock Services, and various agricultural research institutes.
          </Text>
          <Text style={styles.infoText}>
            Services cover irrigation management, fertilizer and seed licensing, agricultural research, training programs, 
            market information, and quality certification. For technical support, contact the respective department.
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.helplineText}>Agricultural Helpline: 3331 or 16123</Text>
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
  servicesNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
    fontStyle: "italic",
  },
  helplineText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
});
