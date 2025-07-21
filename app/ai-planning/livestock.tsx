import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import PrimaryButton from "@/components/common/PrimaryButton";
import FilterDropdown from "@/components/common/FilterDropdown";
import { useTranslation } from "@/hooks/useTranslation";
import { COLORS } from "@/constants/colors";
import { generateFarmingPlan } from "@/services/geminiApi";
import { translateText, translateStructuredContent } from "@/services/translationApi"; // Import the translation service
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

interface LivestockFormData {
  farmSize: string;
  location: string;
  livestockType: string;
  animalCount: string;
  housingType: string;
  feedSource: string;
  budget: string;
  experience: string;
  waterSource: string;
  veterinaryAccess: string;
  marketAccess: string;
  breedingPlan: string;
  currentAnimals: string;
  landAvailable: string;
  goals: string;
}

export default function LivestockPlanning() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LivestockFormData>({
    farmSize: "",
    location: "",
    livestockType: "",
    animalCount: "",
    housingType: "",
    feedSource: "",
    budget: "",
    experience: "",
    waterSource: "",
    veterinaryAccess: "",
    marketAccess: "",
    breedingPlan: "",
    currentAnimals: "",
    landAvailable: "",
    goals: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [translatedResponse, setTranslatedResponse] = useState<string>(""); // State for translated response
  const [showTranslated, setShowTranslated] = useState<boolean>(false); // State to toggle translation view
  const [parsedResponse, setParsedResponse] = useState<any>(null);
  const [parsedTranslatedResponse, setParsedTranslatedResponse] = useState<any>(null); // State for parsed translated response

  const handleInputChange = (field: keyof LivestockFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseMarkdownResponse = (response: string) => {
    const sections: any = [];
    const lines = response.split('\n');
    let currentSection: any = null;
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for headers (##, ###, or #)
      if (line.match(/^#{1,3}\s+/)) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }
        
        // Start new section
        const headerLevel = (line.match(/^#+/) || [''])[0].length;
        const title = line.replace(/^#+\s*/, '').trim();
        currentSection = {
          title: title,
          level: headerLevel,
          content: ''
        };
        currentContent = [];
      } else if (line.length > 0) {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection && currentContent.length > 0) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }

    // If no sections found, create a single section with all content
    if (sections.length === 0) {
      sections.push({
        title: 'Livestock Farming Recommendations',
        level: 1,
        content: response.trim()
      });
    }

    return sections;
  };

  const formatSectionContent = (content: string) => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const formattedLines: any[] = [];

    for (let line of lines) {
      // Remove all markdown formatting first
      let cleanLine = line
        .replace(/^\*\*(.+)\*\*:?$/g, '$1') // Remove bold formatting
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove inline bold
        .replace(/\*(.+?)\*/g, '$1') // Remove italic
        .replace(/`(.+?)`/g, '$1') // Remove code formatting
        .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough
        .trim();

      // Check if it's a heading (after removing markdown)
      if (line.match(/^\*\*(.+)\*\*:?$/)) {
        formattedLines.push({
          type: 'heading',
          text: cleanLine
        });
      }
      // Check if it's a bullet point
      else if (line.match(/^[\*\-\+]\s+/) || line.match(/^\d+\.\s+/)) {
        formattedLines.push({
          type: 'bullet',
          text: cleanLine.replace(/^[\*\-\+\d\.]\s*/, '').trim()
        });
      }
      // Check if it's a sub-bullet (indented)
      else if (line.match(/^\s+[\*\-\+]\s+/) || line.match(/^\s+\d+\.\s+/)) {
        formattedLines.push({
          type: 'subbullet',
          text: cleanLine.replace(/^\s*[\*\-\+\d\.]\s*/, '').trim()
        });
      }
      // Regular text
      else {
        formattedLines.push({
          type: 'text',
          text: cleanLine
        });
      }
    }

    return formattedLines;
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['farmSize', 'location', 'livestockType', 'animalCount', 'budget'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof LivestockFormData]);
    
    if (missingFields.length > 0) {
      Alert.alert(t("missing-information"), t("fill-required-fields"));
      return;
    }

    setLoading(true);
    try {
      const response = await generateFarmingPlan("livestock", formData);
      setAiResponse(response);
      
      // Parse the markdown response into sections
      const parsed = parseMarkdownResponse(response);
      setParsedResponse(parsed);

      // Translate the response to Bangla using structured content translation
      const translated = await translateStructuredContent(response, "bn");
      setTranslatedResponse(translated);
      const parsedTranslated = parseMarkdownResponse(translated);
      setParsedTranslatedResponse(parsedTranslated);
      setShowTranslated(true); // Show translated response by default
    } catch (error) {
      console.error("Error generating plan:", error);
      Alert.alert("Error", "Failed to generate livestock plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = async () => {
    if (!aiResponse) return;

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Livestock Farming Plan</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #FF6B35;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #FF6B35;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #FF6B35;
              border-bottom: 2px solid #FF6B35;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .farm-details {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #FF6B35;
            }
            .detail-item {
              margin-bottom: 8px;
              display: flex;
            }
            .detail-label {
              font-weight: bold;
              min-width: 150px;
              color: #555;
            }
            .detail-value {
              color: #333;
            }
            .recommendations {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #ddd;
            }
            .recommendations pre {
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🐄 LIVESTOCK FARMING PLAN</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>FarmConnect AI Planning System</p>
          </div>

          <div class="section">
            <h2>📋 Farm Details</h2>
            <div class="farm-details">
              <div class="detail-item">
                <span class="detail-label">Farm Size:</span>
                <span class="detail-value">${formData.farmSize}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${formData.location}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Livestock Type:</span>
                <span class="detail-value">${formData.livestockType}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Number of Animals:</span>
                <span class="detail-value">${formData.animalCount}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Housing Type:</span>
                <span class="detail-value">${formData.housingType}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Feed Source:</span>
                <span class="detail-value">${formData.feedSource}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Budget:</span>
                <span class="detail-value">${formData.budget}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Experience Level:</span>
                <span class="detail-value">${formData.experience}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Water Source:</span>
                <span class="detail-value">${formData.waterSource}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Veterinary Access:</span>
                <span class="detail-value">${formData.veterinaryAccess}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Market Access:</span>
                <span class="detail-value">${formData.marketAccess}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Breeding Plan:</span>
                <span class="detail-value">${formData.breedingPlan}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Current Animals:</span>
                <span class="detail-value">${formData.currentAnimals}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Land Available:</span>
                <span class="detail-value">${formData.landAvailable}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Goals:</span>
                <span class="detail-value">${formData.goals}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🤖 AI Recommendations</h2>
            <div class="recommendations">
              <pre>${showTranslated ? translatedResponse : aiResponse}</pre>
            </div>
          </div>

          <div class="footer">
            <p>This plan was generated by FarmConnect AI Planning System</p>
            <p>For support and guidance, contact your local livestock development office</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } catch (error) {
      console.error("Error downloading plan:", error);
      Alert.alert("Error", "Failed to download plan. Please try again.");
    }
  };

  const sendToGovernment = async () => {
    if (!aiResponse) return;
    
    Alert.alert(
      "Send to Government",
      "This feature will send your livestock plan to relevant government officers. Would you like to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: async () => {
          try {
            Alert.alert("Success", "Your livestock farming plan has been prepared for sending to government officers. Please contact your local livestock development office to submit this plan.");
          } catch (error) {
            console.error("Error sending email:", error);
            Alert.alert("Error", "Failed to send plan. Please try again or contact your local livestock development office directly.");
          }
        }}
      ]
    );
  };

  // Dropdown options for each field
  const dropdownOptions = {
    farmSize: ["0.5 acres", "1 acre", "2 acres", "3 acres", "5 acres", "10 acres", "20 acres", "50 acres", "100+ acres", "Other"],
    location: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh", "Other"],
    livestockType: ["Cattle", "Goats", "Poultry", "Buffalo", "Sheep", "Ducks", "Rabbits", "Mixed Livestock", "Other"],
    animalCount: ["1-5", "6-10", "11-20", "21-50", "51-100", "101-200", "200+", "Other"],
    budget: ["Under 50,000 BDT", "50,000-100,000 BDT", "100,000-200,000 BDT", "200,000-500,000 BDT", "500,000+ BDT", "Other"],
    housingType: ["Open Shed", "Closed Barn", "Free Range", "Semi-Intensive", "Intensive", "Traditional", "Other"],
    feedSource: ["Grass/Grazing", "Commercial Feed", "Mixed Feeding", "Crop Residues", "Kitchen Waste", "Silage", "Other"],
    experience: ["Beginner (0-2 years)", "Intermediate (3-5 years)", "Experienced (6-10 years)", "Expert (10+ years)", "Other"],
    waterSource: ["Tube Well", "Pond", "Municipal Supply", "River", "Rainwater", "Bore Well", "Other"],
    veterinaryAccess: ["Local Vet Available", "Government Clinic", "Private Clinic", "Mobile Vet Service", "Limited Access", "Other"],
    marketAccess: ["Local Market", "Dairy Collection Center", "Direct Selling", "Wholesale Market", "Export Market", "Contract Farming", "Other"],
    breedingPlan: ["Natural Breeding", "Artificial Insemination", "Crossbreeding", "Pure Breeding", "No Breeding Plan", "Other"],
    currentAnimals: ["None (Starting Fresh)", "1-5 Animals", "6-10 Animals", "11-20 Animals", "20+ Animals", "Mixed Species", "Other"],
    landAvailable: ["Grazing Land Available", "Shed Only", "Mixed Use", "Limited Space", "Abundant Land", "Rented Land", "Other"],
    goals: ["Milk Production", "Meat Production", "Breeding", "Mixed Farming", "Egg Production", "Organic Farming", "Other"]
  };

  const [customInputs, setCustomInputs] = useState<{[key: string]: string}>({});

  const InputField = ({ 
    label, 
    field, 
    placeholder, 
    required = false, 
    multiline = false 
  }: { 
    label: string; 
    field: keyof LivestockFormData; 
    placeholder: string; 
    required?: boolean; 
    multiline?: boolean; 
  }) => {
    const options = dropdownOptions[field as keyof typeof dropdownOptions];
    const isOtherSelected = formData[field] === "Other";
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        
        {options && !multiline ? (
          <View style={styles.dropdownContainer}>
            <FilterDropdown
              label={label}
              options={["Select Option", ...options]}
              selectedOption={formData[field] || "Select Option"}
              onSelect={(value) => {
                if (value !== "Select Option") {
                  handleInputChange(field, value);
                  if (value !== "Other") {
                    setCustomInputs(prev => ({ ...prev, [field]: "" }));
                  }
                }
              }}
            />
            {isOtherSelected && (
              <TextInput
                style={styles.customInput}
                placeholder="Please specify..."
                value={customInputs[field] || ""}
                onChangeText={(value) => {
                  setCustomInputs(prev => ({ ...prev, [field]: value }));
                  handleInputChange(field, value);
                }}
                autoCorrect={false}
                autoCapitalize="sentences"
                returnKeyType="next"
                blurOnSubmit={false}
                textContentType="none"
                keyboardType="default"
              />
            )}
          </View>
        ) : (
          <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            placeholder={placeholder}
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            autoCorrect={false}
            autoCapitalize="sentences"
            returnKeyType={multiline ? "default" : "next"}
            blurOnSubmit={false}
            textContentType="none"
            keyboardType="default"
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title={t("livestock-planning")} 
        showBackButton={true}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("livestock-farming-plan")}</Text>
        <Text style={styles.subtitle}>
          {t("fill-details-livestock")}
        </Text>

        <InputField 
          label="Farm Size" 
          field="farmSize" 
          placeholder="e.g., 5 acres, 2 hectares" 
          required 
        />
        
        <InputField 
          label="Location" 
          field="location" 
          placeholder="e.g., Dhaka, Bangladesh" 
          required 
        />
        
        <InputField 
          label="Livestock Type" 
          field="livestockType" 
          placeholder="e.g., Cattle, Goats, Poultry, Buffalo" 
          required 
        />
        
        <InputField 
          label="Number of Animals" 
          field="animalCount" 
          placeholder="e.g., 10 cows, 50 chickens, 20 goats" 
          required 
        />
        
        <InputField 
          label="Budget" 
          field="budget" 
          placeholder="e.g., 100,000 BDT, Low budget, High investment" 
          required 
        />
        
        <InputField 
          label="Housing Type" 
          field="housingType" 
          placeholder="e.g., Open shed, Closed barn, Free range" 
        />
        
        <InputField 
          label="Feed Source" 
          field="feedSource" 
          placeholder="e.g., Grass, Commercial feed, Mixed feeding" 
        />
        
        <InputField 
          label="Experience Level" 
          field="experience" 
          placeholder="e.g., Beginner, Intermediate, Expert" 
        />
        
        <InputField 
          label="Water Source" 
          field="waterSource" 
          placeholder="e.g., Tube well, Pond, Municipal supply" 
        />
        
        <InputField 
          label="Veterinary Access" 
          field="veterinaryAccess" 
          placeholder="e.g., Local vet available, Government clinic, Private clinic" 
        />
        
        <InputField 
          label="Market Access" 
          field="marketAccess" 
          placeholder="e.g., Local market, Dairy collection center, Direct selling" 
        />
        
        <InputField 
          label="Breeding Plan" 
          field="breedingPlan" 
          placeholder="e.g., Natural breeding, Artificial insemination, Crossbreeding" 
        />
        
        <InputField 
          label="Current Animals" 
          field="currentAnimals" 
          placeholder="e.g., 5 cows, Starting fresh, Mixed livestock" 
        />
        
        <InputField 
          label="Land Available" 
          field="landAvailable" 
          placeholder="e.g., Grazing land, Shed only, Mixed use" 
        />
        
        <InputField 
          label="Goals & Objectives" 
          field="goals" 
          placeholder="e.g., Milk production, Meat production, Breeding, Mixed farming" 
          multiline 
        />

        <PrimaryButton
          title={loading ? "Generating Plan..." : "Generate AI Plan"}
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitButton}
        />

        {aiResponse && (
          <View style={styles.responseContainer}>
            <View style={styles.responseHeader}>
              <Text style={styles.responseTitle}>🤖 AI Recommendations</Text>
              <Text style={styles.responseSubtitle}>Personalized livestock farming plan based on your inputs</Text>
              {translatedResponse && (
                <PrimaryButton
                  title={showTranslated ? "Show Original" : "Show Translated (Bangla)"}
                  onPress={() => setShowTranslated(!showTranslated)}
                  style={styles.toggleButton}
                  textStyle={styles.toggleButtonText}
                />
              )}
            </View>
            
            <ScrollView style={styles.responseScrollView} nestedScrollEnabled={true}>
              {(showTranslated ? parsedTranslatedResponse : parsedResponse) && (showTranslated ? parsedTranslatedResponse : parsedResponse).length > 0 ? (
                <View style={styles.parsedContent}>
                  {(showTranslated ? parsedTranslatedResponse : parsedResponse).map((section: any, sectionIndex: number) => {
                    const formattedContent = formatSectionContent(section.content);
                    
                    return (
                      <View key={sectionIndex} style={styles.section}>
                        <Text style={[
                          styles.sectionTitle,
                          section.level === 1 && styles.mainSectionTitle,
                          section.level === 2 && styles.subSectionTitle,
                          section.level === 3 && styles.subSubSectionTitle
                        ]}>
                          {section.title}
                        </Text>
                        <View style={styles.sectionContent}>
                          {formattedContent.map((item: any, index: number) => {
                            switch (item.type) {
                              case 'heading':
                                return (
                                  <Text key={index} style={styles.contentHeading}>
                                    {item.text}
                                  </Text>
                                );
                              case 'bullet':
                                return (
                                  <View key={index} style={styles.bulletContainer}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletText}>{item.text}</Text>
                                  </View>
                                );
                              case 'subbullet':
                                return (
                                  <View key={index} style={styles.subBulletContainer}>
                                    <Text style={styles.subBulletPoint}>◦</Text>
                                    <Text style={styles.subBulletText}>{item.text}</Text>
                                  </View>
                                );
                              default:
                                return (
                                  <Text key={index} style={styles.regularText}>
                                    {item.text}
                                  </Text>
                                );
                            }
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.responseText}>{showTranslated ? translatedResponse : aiResponse}</Text>
              )}
            </ScrollView>
            
            <View style={styles.actionButtons}>
              <PrimaryButton
                title="📄 Download PDF"
                onPress={downloadPlan}
                style={styles.actionButton}
              />
              <PrimaryButton
                title="📧 Send to Govt"
                onPress={sendToGovernment}
                style={styles.secondaryButton}
              />
            </View>
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  responseContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  responseHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  responseSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  responseContent: {
    marginBottom: 16,
  },
  responseScrollView: {
    maxHeight: 300,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    padding: 12,
  },
  responseText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  toggleButton: {
    marginTop: 10,
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
  dropdownContainer: {
    gap: 8,
  },
  customInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  parsedContent: {
    gap: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionContent: {
    gap: 4,
  },
  mainSectionTitle: {
    fontSize: 18,
    color: COLORS.primary,
  },
  subSectionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  subSubSectionTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  contentHeading: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  subBulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingLeft: 24,
  },
  subBulletPoint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
    marginTop: 1,
  },
  subBulletText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  regularText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
});
