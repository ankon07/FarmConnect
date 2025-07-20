import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { getCurrentWeatherBulletin } from "@/services/bamisApi";
import { Calendar, MapPin, Leaf, Heart, Fish, RefreshCw } from "lucide-react-native";

interface RegionAdvice {
  region: string;
  districts: string[];
  crops: {
    [cropName: string]: {
      stage: string;
      advice: string[];
      warnings?: string[];
    };
  };
  livestock: string[];
  poultry: string[];
  fisheries: string[];
}

interface WeatherBulletin {
  date: string;
  period: string;
  regions: RegionAdvice[];
  satelliteData: {
    ndvi: string;
    vci: string;
    tci: string;
    vhi: string;
  };
}

export default function BAMISBulletinScreen() {
  const router = useRouter();
  const [bulletin, setBulletin] = useState<WeatherBulletin | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    loadBulletin();
  }, []);

  const loadBulletin = async () => {
    try {
      setLoading(true);
      const data = await getCurrentWeatherBulletin();
      setBulletin(data);
      if (data.regions.length > 0) {
        setSelectedRegion(data.regions[0].region);
      }
    } catch (error) {
      console.error('Error loading bulletin:', error);
    } finally {
      setLoading(false);
    }
  };

  const RegionSelector = () => (
    <View style={styles.regionSelector}>
      <Text style={styles.selectorTitle}>Select Region:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {bulletin?.regions.map((region) => (
          <TouchableOpacity
            key={region.region}
            style={[
              styles.regionButton,
              selectedRegion === region.region && styles.selectedRegionButton
            ]}
            onPress={() => setSelectedRegion(region.region)}
          >
            <Text style={[
              styles.regionButtonText,
              selectedRegion === region.region && styles.selectedRegionButtonText
            ]}>
              {region.region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const CropAdviceCard = ({ cropName, cropData }: { cropName: string; cropData: any }) => (
    <View style={styles.adviceCard}>
      <View style={styles.cardHeader}>
        <Leaf size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>{cropName}</Text>
        <View style={styles.stageBadge}>
          <Text style={styles.stageText}>{cropData.stage}</Text>
        </View>
      </View>
      
      {cropData.warnings && cropData.warnings.length > 0 && (
        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ সতর্কতা:</Text>
          {cropData.warnings.map((warning: string, index: number) => (
            <Text key={index} style={styles.warningText}>• {warning}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.adviceSection}>
        <Text style={styles.adviceTitle}>পরামর্শ:</Text>
        {cropData.advice.map((advice: string, index: number) => (
          <Text key={index} style={styles.adviceText}>• {advice}</Text>
        ))}
      </View>
    </View>
  );

  const LivestockCard = ({ title, advice, icon }: { title: string; advice: string[]; icon: React.ReactNode }) => (
    <View style={styles.adviceCard}>
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.adviceSection}>
        {advice.map((item, index) => (
          <Text key={index} style={styles.adviceText}>• {item}</Text>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader 
          title="BAMIS Weather Bulletin" 
          showHelpButton={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading weather bulletin...</Text>
        </View>
      </View>
    );
  }

  if (!bulletin) {
    return (
      <View style={styles.container}>
        <AppHeader 
          title="BAMIS Weather Bulletin" 
          showHelpButton={false}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load bulletin</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBulletin}>
            <RefreshCw size={20} color={COLORS.white} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const selectedRegionData = bulletin.regions.find(r => r.region === selectedRegion);

  return (
    <View style={styles.container}>
      <AppHeader 
        title="BAMIS Weather Bulletin" 
        showHelpButton={false}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.bulletinHeader}>
          <Text style={styles.bulletinTitle}>জাতীয়/আঞ্চলিক কৃষি আবহাওয়া পরামর্শ সেবা বুলেটিন</Text>
          
          <View style={styles.dateInfo}>
            <Calendar size={16} color={COLORS.primary} />
            <Text style={styles.dateText}>{bulletin.date}</Text>
          </View>
          
          <View style={styles.periodInfo}>
            <Text style={styles.periodLabel}>সময়কাল:</Text>
            <Text style={styles.periodText}>{bulletin.period}</Text>
          </View>
        </View>

        <RegionSelector />

        {selectedRegionData && (
          <View style={styles.regionContent}>
            <View style={styles.regionHeader}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.regionTitle}>{selectedRegionData.region}</Text>
            </View>
            
            <View style={styles.districtsContainer}>
              <Text style={styles.districtsLabel}>জেলাসমূহ:</Text>
              <Text style={styles.districtsText}>
                {selectedRegionData.districts.join(", ")}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>ফসলের পরামর্শ</Text>
            {Object.entries(selectedRegionData.crops).map(([cropName, cropData]) => (
              <CropAdviceCard key={cropName} cropName={cropName} cropData={cropData} />
            ))}

            <Text style={styles.sectionTitle}>পশুপাখির পরিচর্যা</Text>
            
            <LivestockCard 
              title="গবাদি পশু"
              advice={selectedRegionData.livestock}
              icon={<Heart size={20} color={COLORS.primary} />}
            />
            
            <LivestockCard 
              title="হাঁসমুরগী"
              advice={selectedRegionData.poultry}
              icon={<Heart size={20} color={COLORS.warning} />}
            />
            
            <LivestockCard 
              title="মৎস্য"
              advice={selectedRegionData.fisheries}
              icon={<Fish size={20} color={COLORS.info} />}
            />
          </View>
        )}

        <View style={styles.satelliteSection}>
          <Text style={styles.sectionTitle}>ভূ-উপগ্রহ পর্যবেক্ষণ</Text>
          <View style={styles.satelliteGrid}>
            <View style={styles.satelliteItem}>
              <Text style={styles.satelliteLabel}>NDVI</Text>
              <Text style={styles.satelliteValue}>{bulletin.satelliteData.ndvi}</Text>
            </View>
            <View style={styles.satelliteItem}>
              <Text style={styles.satelliteLabel}>VCI</Text>
              <Text style={styles.satelliteValue}>{bulletin.satelliteData.vci}</Text>
            </View>
            <View style={styles.satelliteItem}>
              <Text style={styles.satelliteLabel}>TCI</Text>
              <Text style={styles.satelliteValue}>{bulletin.satelliteData.tci}</Text>
            </View>
            <View style={styles.satelliteItem}>
              <Text style={styles.satelliteLabel}>VHI</Text>
              <Text style={styles.satelliteValue}>{bulletin.satelliteData.vhi}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={loadBulletin}>
          <RefreshCw size={20} color={COLORS.white} />
          <Text style={styles.refreshButtonText}>Refresh Bulletin</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bulletinHeader: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bulletinTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  periodInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  regionSelector: {
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  regionButton: {
    backgroundColor: COLORS.lightBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedRegionButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  regionButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedRegionButtonText: {
    color: COLORS.white,
  },
  regionContent: {
    marginBottom: 24,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  regionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  districtsContainer: {
    backgroundColor: COLORS.lightBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  districtsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  districtsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 16,
  },
  adviceCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  stageBadge: {
    backgroundColor: `${COLORS.info}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageText: {
    fontSize: 12,
    color: COLORS.info,
    fontWeight: '500',
  },
  warningSection: {
    backgroundColor: `${COLORS.warning}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  adviceSection: {
    marginTop: 8,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  satelliteSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  satelliteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  satelliteItem: {
    width: '48%',
    backgroundColor: COLORS.lightBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  satelliteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  satelliteValue: {
    fontSize: 10,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
