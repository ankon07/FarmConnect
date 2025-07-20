import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import PrimaryButton from "@/components/common/PrimaryButton";
import FilterDropdown from "@/components/common/FilterDropdown";
import { COLORS } from "@/constants/colors";
import { generateFarmingPlan } from "@/services/geminiApi";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

interface FishFormData {
  pondSize: string;
  location: string;
  fishSpecies: string;
  waterSource: string;
  pondType: string;
  budget: string;
  experience: string;
  feedType: string;
  marketAccess: string;
  waterQuality: string;
  pondDepth: string;
  stockingDensity: string;
  currentFish: string;
  equipment: string;
  goals: string;
}

export default function FishPlanning() {
  const router = useRouter();
  const [formData, setFormData] = useState<FishFormData>({
    pondSize: "",
    location: "",
    fishSpecies: "",
    waterSource: "",
    pondType: "",
    budget: "",
    experience: "",
    feedType: "",
    marketAccess: "",
    waterQuality: "",
    pondDepth: "",
    stockingDensity: "",
    currentFish: "",
    equipment: "",
    goals: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [parsedResponse, setParsedResponse] = useState<any>(null);

  const handleInputChange = (field: keyof FishFormData, value: string) => {
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
        title: 'Fish Farming Recommendations',
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
    const requiredFields = ['pondSize', 'location', 'fishSpecies', 'waterSource', 'budget'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FishFormData]);
    
    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const response = await generateFarmingPlan("fish", formData);
      setAiResponse(response);
      
      // Parse the markdown response into sections
      const parsed = parseMarkdownResponse(response);
      setParsedResponse(parsed);
    } catch (error) {
      console.error("Error generating plan:", error);
      Alert.alert("Error", "Failed to generate fish farming plan. Please try again.");
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
          <title>Fish Farming Plan</title>
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
              border-bottom: 3px solid #2196F3;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2196F3;
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
              color: #2196F3;
              border-bottom: 2px solid #2196F3;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .farm-details {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2196F3;
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
            <h1>🐟 FISH FARMING PLAN</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>FarmConnect AI Planning System</p>
          </div>

          <div class="section">
            <h2>📋 Farm Details</h2>
            <div class="farm-details">
              <div class="detail-item">
                <span class="detail-label">Pond Size:</span>
                <span class="detail-value">${formData.pondSize}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${formData.location}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fish Species:</span>
                <span class="detail-value">${formData.fishSpecies}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Water Source:</span>
                <span class="detail-value">${formData.waterSource}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pond Type:</span>
                <span class="detail-value">${formData.pondType}</span>
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
                <span class="detail-label">Feed Type:</span>
                <span class="detail-value">${formData.feedType}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Market Access:</span>
                <span class="detail-value">${formData.marketAccess}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Water Quality:</span>
                <span class="detail-value">${formData.waterQuality}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pond Depth:</span>
                <span class="detail-value">${formData.pondDepth}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Stocking Density:</span>
                <span class="detail-value">${formData.stockingDensity}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Current Fish:</span>
                <span class="detail-value">${formData.currentFish}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Equipment:</span>
                <span class="detail-value">${formData.equipment}</span>
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
              <pre>${aiResponse}</pre>
            </div>
          </div>

          <div class="footer">
            <p>This plan was generated by FarmConnect AI Planning System</p>
            <p>For support and guidance, contact your local fisheries development office</p>
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
      "This feature will send your fish farming plan to relevant government officers. Would you like to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: async () => {
          try {
            Alert.alert("Success", "Your fish farming plan has been prepared for sending to government officers. Please contact your local fisheries development office to submit this plan.");
          } catch (error) {
            console.error("Error sending email:", error);
            Alert.alert("Error", "Failed to send plan. Please try again or contact your local fisheries development office directly.");
          }
        }}
      ]
    );
  };

  // Dropdown options for each field
  const dropdownOptions = {
    pondSize: ["0.1 acres", "0.25 acres", "0.5 acres", "1 acre", "2 acres", "3 acres", "5 acres", "10+ acres", "Other"],
    location: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh", "Other"],
    fishSpecies: ["Rohu", "Catla", "Tilapia", "Pangasius", "Carp", "Koi", "Magur", "Shrimp", "Mixed Species", "Other"],
    waterSource: ["Tube Well", "River", "Rainwater", "Municipal Supply", "Pond Water", "Bore Well", "Canal", "Other"],
    budget: ["Under 25,000 BDT", "25,000-50,000 BDT", "50,000-100,000 BDT", "100,000-200,000 BDT", "200,000+ BDT", "Other"],
    pondType: ["Earthen Pond", "Concrete Tank", "Plastic Lined", "Natural Pond", "Cage Culture", "Pen Culture", "Other"],
    experience: ["Beginner (0-2 years)", "Intermediate (3-5 years)", "Experienced (6-10 years)", "Expert (10+ years)", "Other"],
    feedType: ["Commercial Pellets", "Natural Feed", "Mixed Feeding", "Kitchen Waste", "Rice Bran", "Mustard Oil Cake", "Other"],
    marketAccess: ["Local Market", "Wholesale Market", "Direct Selling", "Export Market", "Processing Plant", "Online Sales", "Other"],
    waterQuality: ["Excellent", "Good", "Moderate", "Needs Treatment", "Poor", "Unknown", "Other"],
    pondDepth: ["3-4 feet", "4-6 feet", "6-8 feet", "8-10 feet", "10+ feet", "Variable Depth", "Other"],
    stockingDensity: ["Low (1000-3000/acre)", "Medium (3000-5000/acre)", "High (5000-8000/acre)", "Very High (8000+/acre)", "Other"],
    currentFish: ["Empty Pond", "Fingerlings", "Juvenile Fish", "Adult Fish", "Mixed Sizes", "Breeding Stock", "Other"],
    equipment: ["Basic Tools Only", "Water Pump", "Aerator", "Nets & Traps", "pH Testing Kit", "Complete Setup", "Other"],
    goals: ["Maximum Profit", "Sustainable Farming", "Export Quality", "Local Consumption", "Breeding Program", "Organic Farming", "Other"]
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
    field: keyof FishFormData; 
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
        title="Fish Planning" 
        showBackButton={true}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Fish Farming Plan</Text>
        <Text style={styles.subtitle}>
          Fill out the details below to get personalized fish farming recommendations
        </Text>

        <InputField 
          label="Pond Size" 
          field="pondSize" 
          placeholder="e.g., 1 acre, 0.5 hectares, 100x50 feet" 
          required 
        />
        
        <InputField 
          label="Location" 
          field="location" 
          placeholder="e.g., Dhaka, Bangladesh" 
          required 
        />
        
        <InputField 
          label="Fish Species" 
          field="fishSpecies" 
          placeholder="e.g., Rohu, Catla, Tilapia, Pangasius" 
          required 
        />
        
        <InputField 
          label="Water Source" 
          field="waterSource" 
          placeholder="e.g., Tube well, River, Rainwater, Municipal" 
          required 
        />
        
        <InputField 
          label="Budget" 
          field="budget" 
          placeholder="e.g., 50,000 BDT, Low budget, High investment" 
          required 
        />
        
        <InputField 
          label="Pond Type" 
          field="pondType" 
          placeholder="e.g., Earthen pond, Concrete tank, Plastic lined" 
        />
        
        <InputField 
          label="Experience Level" 
          field="experience" 
          placeholder="e.g., Beginner, Intermediate, Expert" 
        />
        
        <InputField 
          label="Feed Type" 
          field="feedType" 
          placeholder="e.g., Commercial pellets, Natural feed, Mixed feeding" 
        />
        
        <InputField 
          label="Market Access" 
          field="marketAccess" 
          placeholder="e.g., Local market, Wholesale, Direct selling" 
        />
        
        <InputField 
          label="Water Quality" 
          field="waterQuality" 
          placeholder="e.g., Good, Moderate, Needs treatment" 
        />
        
        <InputField 
          label="Pond Depth" 
          field="pondDepth" 
          placeholder="e.g., 6 feet, 2 meters, Variable depth" 
        />
        
        <InputField 
          label="Stocking Density" 
          field="stockingDensity" 
          placeholder="e.g., 5000 fish/acre, High density, Low density" 
        />
        
        <InputField 
          label="Current Fish Stock" 
          field="currentFish" 
          placeholder="e.g., 1000 fingerlings, Empty pond, Mixed species" 
        />
        
        <InputField 
          label="Available Equipment" 
          field="equipment" 
          placeholder="e.g., Aerator, Water pump, Nets, Basic tools" 
        />
        
        <InputField 
          label="Goals & Objectives" 
          field="goals" 
          placeholder="e.g., Maximum profit, Sustainable farming, Export quality" 
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
              <Text style={styles.responseSubtitle}>Personalized fish farming plan based on your inputs</Text>
            </View>
            
            <ScrollView style={styles.responseScrollView} nestedScrollEnabled={true}>
              {parsedResponse && parsedResponse.length > 0 ? (
                <View style={styles.parsedContent}>
                  {parsedResponse.map((section: any, sectionIndex: number) => {
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
                <Text style={styles.responseText}>{aiResponse}</Text>
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
  responseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  responseText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
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
  responseHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  responseSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  responseScrollView: {
    maxHeight: 300,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    padding: 12,
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
