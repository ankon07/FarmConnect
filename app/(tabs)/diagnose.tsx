import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { analyzeDiseaseImageWithGemini } from "@/services/geminiApi";
import { translateText } from "@/services/translationApi";
import AppHeader from "@/components/common/AppHeader";
import TabView from "@/components/common/TabView";
import PrimaryButton from "@/components/common/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { Camera, Image as ImageIcon } from "lucide-react-native";

interface DiagnosisResult {
  diseaseName: string;
  description: string;
  treatment: string;
  severity: string;
}

interface TranslatedResult {
  diseaseName: string;
  description: string;
  treatment: string;
  severity: string;
}

export default function DiagnoseScreen() {
  const [activeTab, setActiveTab] = useState("Crop");
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [translatedResult, setTranslatedResult] = useState<TranslatedResult | null>(null);
  const [showTranslated, setShowTranslated] = useState<boolean>(false);
  const [translating, setTranslating] = useState(false);
  const router = useRouter();

  const tabs = ["Crop", "Livestock", "Fish"];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };
  
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };
  
  const analyzeImage = async () => {
    if (!image) return;
    
    setAnalyzing(true);
    try {
      const response = await analyzeDiseaseImageWithGemini(image, activeTab.toLowerCase());
      setResult(response); // The Gemini API function directly returns the parsed JSON
      
      // Automatically translate the result to Bangla
      setTranslating(true);
      try {
        const translatedDiseaseName = await translateText(response.diseaseName || 'Disease Analysis', 'bn');
        const translatedDescription = await translateText(response.description || 'Disease analysis completed. Please consult with an expert for detailed diagnosis.', 'bn');
        const translatedTreatment = await translateText(response.treatment || 'Please consult with a specialist for proper treatment recommendations.', 'bn');
        const translatedSeverity = await translateText(response.severity || 'Medium', 'bn');
        
        setTranslatedResult({
          diseaseName: translatedDiseaseName,
          description: translatedDescription,
          treatment: translatedTreatment,
          severity: translatedSeverity,
        });
        setShowTranslated(true); // Show translated version by default
      } catch (translationError) {
        console.error("Translation error:", translationError);
        // If translation fails, just show the original result
        setShowTranslated(false);
      } finally {
        setTranslating(false);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };
  
  const resetDiagnosis = () => {
    setImage(null);
    setResult(null);
    setTranslatedResult(null);
    setShowTranslated(false);
    setTranslating(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Disease Diagnosis" 
        showBackButton={true}
        showHelpButton={true}
      />
      
      <TabView 
        tabs={tabs} 
        activeTab={activeTab} 
        onChangeTab={setActiveTab}
      />
      
      <View style={styles.content}>
        {!image ? (
          <View style={styles.uploadContainer}>
            <Text style={styles.instructionText}>
              Take a clear photo or upload an image of your {activeTab.toLowerCase()} to diagnose any diseases
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.uploadOption} 
                onPress={takePhoto}
              >
                <View style={styles.iconCircle}>
                  <Camera size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.uploadOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption} 
                onPress={pickImage}
              >
                <View style={styles.iconCircle}>
                  <ImageIcon size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.uploadOptionText}>Upload Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.analysisContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            
            {result ? (
              <ScrollView 
                style={styles.resultContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>
                    {showTranslated && translatedResult ? translatedResult.diseaseName : (result.diseaseName || 'Disease Analysis')}
                  </Text>
                  <View style={[
                    styles.severityBadge, 
                    { 
                      backgroundColor: result.severity === "High" ? COLORS.danger : 
                                     result.severity === "Medium" ? COLORS.warning : 
                                     COLORS.success 
                    }
                  ]}>
                    <Text style={styles.severityBadgeText}>
                      {showTranslated && translatedResult ? translatedResult.severity : (result.severity || 'Medium')} Severity
                    </Text>
                  </View>
                  
                  {translatedResult && (
                    <TouchableOpacity 
                      style={styles.toggleButton} 
                      onPress={() => setShowTranslated(!showTranslated)}
                    >
                      <Text style={styles.toggleButtonText}>
                        {showTranslated ? "Show Original" : "Show Translated (Bangla)"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>📋 Description</Text>
                  <Text style={styles.cardContent}>
                    {showTranslated && translatedResult ? 
                      translatedResult.description : 
                      (result.description || 'Disease analysis completed. Please consult with an expert for detailed diagnosis.')
                    }
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>💊 Recommended Treatment</Text>
                  <Text style={styles.cardContent}>
                    {showTranslated && translatedResult ? 
                      translatedResult.treatment : 
                      (result.treatment || 'Please consult with a specialist for proper treatment recommendations.')
                    }
                  </Text>
                </View>

                {translating && (
                  <View style={styles.translatingContainer}>
                    <Text style={styles.translatingText}>🔄 Translating to Bangla...</Text>
                  </View>
                )}

                <View style={styles.actionButtonContainer}>
                  <PrimaryButton 
                    title="Start New Diagnosis" 
                    onPress={resetDiagnosis} 
                    variant="secondary"
                  />
                </View>
              </ScrollView>
            ) : (
              <View style={styles.actionContainer}>
                <PrimaryButton 
                  title="Analyze Image" 
                  onPress={analyzeImage} 
                  isLoading={analyzing}
                  variant="primary"
                />
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={resetDiagnosis}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
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
  uploadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  uploadOption: {
    alignItems: "center",
    width: 140,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  analysisContainer: {
    flex: 1,
  },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  actionContainer: {
    gap: 12,
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  treatmentContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  severityContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  severityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  severityText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  resultHeader: {
    marginBottom: 20,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  severityBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionButtonContainer: {
    marginTop: 10,
  },
  toggleButton: {
    marginTop: 12,
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  translatingContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  translatingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
