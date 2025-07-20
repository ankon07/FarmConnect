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

interface CropFormData {
  farmSize: string;
  soilType: string;
  cropType: string;
  season: string;
  weatherCondition: string;
  waterSource: string;
  budget: string;
  experience: string;
  location: string;
  previousCrop: string;
  fertilizers: string;
  pesticides: string;
  laborAvailability: string;
  marketAccess: string;
  goals: string;
}

export default function CropPlanning() {
  const router = useRouter();
  const [formData, setFormData] = useState<CropFormData>({
    farmSize: "",
    soilType: "",
    cropType: "",
    season: "",
    weatherCondition: "",
    waterSource: "",
    budget: "",
    experience: "",
    location: "",
    previousCrop: "",
    fertilizers: "",
    pesticides: "",
    laborAvailability: "",
    marketAccess: "",
    goals: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [parsedResponse, setParsedResponse] = useState<any>(null);

  const handleInputChange = (field: keyof CropFormData, value: string) => {
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
        title: 'Farming Recommendations',
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
      // Check if it's a bold heading
      if (line.match(/^\*\*(.+)\*\*:?$/)) {
        formattedLines.push({
          type: 'heading',
          text: line.replace(/^\*\*(.+)\*\*:?$/, '$1')
        });
      }
      // Check if it's a bullet point
      else if (line.match(/^[\*\-\+]\s+/) || line.match(/^\d+\.\s+/)) {
        formattedLines.push({
          type: 'bullet',
          text: line.replace(/^[\*\-\+\d\.]\s*/, '').trim()
        });
      }
      // Check if it's a sub-bullet (indented)
      else if (line.match(/^\s+[\*\-\+]\s+/) || line.match(/^\s+\d+\.\s+/)) {
        formattedLines.push({
          type: 'subbullet',
          text: line.replace(/^\s*[\*\-\+\d\.]\s*/, '').trim()
        });
      }
      // Regular text
      else {
        formattedLines.push({
          type: 'text',
          text: line
        });
      }
    }

    return formattedLines;
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['farmSize', 'soilType', 'cropType', 'season', 'location'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CropFormData]);
    
    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const response = await generateFarmingPlan("crop", formData);
      setAiResponse(response);
      
      // Parse the markdown response into sections
      const parsed = parseMarkdownResponse(response);
      setParsedResponse(parsed);
    } catch (error) {
      console.error("Error generating plan:", error);
      Alert.alert("Error", "Failed to generate farming plan. Please try again.");
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
          <title>Crop Farming Plan</title>
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
              border-bottom: 3px solid #4CAF50;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4CAF50;
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
              color: #4CAF50;
              border-bottom: 2px solid #4CAF50;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .farm-details {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #4CAF50;
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
            <h1>🌾 CROP FARMING PLAN</h1>
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
                <span class="detail-label">Soil Type:</span>
                <span class="detail-value">${formData.soilType}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Crop Type:</span>
                <span class="detail-value">${formData.cropType}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Season:</span>
                <span class="detail-value">${formData.season}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Weather Condition:</span>
                <span class="detail-value">${formData.weatherCondition}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Water Source:</span>
                <span class="detail-value">${formData.waterSource}</span>
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
                <span class="detail-label">Previous Crop:</span>
                <span class="detail-value">${formData.previousCrop}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fertilizers Available:</span>
                <span class="detail-value">${formData.fertilizers}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pesticides Available:</span>
                <span class="detail-value">${formData.pesticides}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Labor Availability:</span>
                <span class="detail-value">${formData.laborAvailability}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Market Access:</span>
                <span class="detail-value">${formData.marketAccess}</span>
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
            <p>For support and guidance, contact your local agricultural office</p>
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
      "This feature will send your farming plan to relevant government officers. Would you like to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: async () => {
          try {
            // Email content
            const emailSubject = `Crop Farming Plan - ${formData.location} - ${new Date().toLocaleDateString()}`;
            const emailContent = `Dear Government Agricultural Officer,

I am submitting my crop farming plan for your review and guidance. Please find the details below:

FARM DETAILS:
- Farm Size: ${formData.farmSize}
- Location: ${formData.location}
- Soil Type: ${formData.soilType}
- Crop Type: ${formData.cropType}
- Season: ${formData.season}
- Weather Condition: ${formData.weatherCondition}
- Water Source: ${formData.waterSource}
- Budget: ${formData.budget}
- Experience Level: ${formData.experience}
- Previous Crop: ${formData.previousCrop}
- Fertilizers Available: ${formData.fertilizers}
- Pesticides Available: ${formData.pesticides}
- Labor Availability: ${formData.laborAvailability}
- Market Access: ${formData.marketAccess}
- Goals: ${formData.goals}

AI RECOMMENDATIONS:
${aiResponse}

I would appreciate your expert advice and any additional recommendations you might have.

Thank you for your time and support.

Best regards,
Farmer (via FarmConnect AI Planning System)
Generated on: ${new Date().toLocaleDateString()}`;

            // For now, we'll show a success message
            // In a real implementation, you would integrate with an email service
            Alert.alert("Success", "Your crop farming plan has been prepared for sending to government officers. Please contact your local agricultural office to submit this plan.");
          } catch (error) {
            console.error("Error sending email:", error);
            Alert.alert("Error", "Failed to send plan. Please try again or contact your local agricultural office directly.");
          }
        }}
      ]
    );
  };

  // Dropdown options for each field
  const dropdownOptions = {
    farmSize: ["0.5 acres", "1 acre", "2 acres", "3 acres", "5 acres", "10 acres", "20 acres", "50 acres", "100+ acres", "Other"],
    soilType: ["Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky", "Mixed", "Other"],
    cropType: ["Rice", "Wheat", "Corn", "Vegetables", "Fruits", "Pulses", "Oilseeds", "Sugarcane", "Cotton", "Jute", "Other"],
    season: ["Kharif (Summer)", "Rabi (Winter)", "Zaid (Spring)", "Year Round", "Other"],
    weatherCondition: ["Monsoon", "Dry", "Moderate Rainfall", "Heavy Rainfall", "Drought Prone", "Humid", "Other"],
    waterSource: ["Irrigation Canal", "Tube Well", "Rainwater", "River", "Pond", "Municipal Supply", "Bore Well", "Other"],
    budget: ["Under 25,000 BDT", "25,000-50,000 BDT", "50,000-100,000 BDT", "100,000-200,000 BDT", "200,000+ BDT", "Other"],
    experience: ["Beginner (0-2 years)", "Intermediate (3-5 years)", "Experienced (6-10 years)", "Expert (10+ years)", "Other"],
    location: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh", "Other"],
    previousCrop: ["Rice", "Wheat", "Vegetables", "Fallow Land", "Fruits", "Pulses", "First Time Farming", "Other"],
    fertilizers: ["Urea", "DAP", "TSP", "Organic Compost", "NPK", "Potash", "Mixed Fertilizers", "None", "Other"],
    pesticides: ["Organic Only", "Chemical", "Integrated Pest Management", "Biological Control", "None", "Other"],
    laborAvailability: ["Family Labor Only", "Hired Workers Available", "Mixed (Family + Hired)", "Limited Labor", "Abundant Labor", "Other"],
    marketAccess: ["Local Market", "Wholesale Market", "Export Market", "Direct Selling", "Contract Farming", "Online Sales", "Other"],
    goals: ["Maximum Yield", "Organic Farming", "Profit Maximization", "Sustainable Farming", "Food Security", "Export Quality", "Other"]
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
    field: keyof CropFormData; 
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
        title="Crop Planning" 
        showBackButton={true}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Crop Farming Plan</Text>
        <Text style={styles.subtitle}>
          Fill out the details below to get personalized crop farming recommendations
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
          label="Soil Type" 
          field="soilType" 
          placeholder="e.g., Clay, Sandy, Loamy" 
          required 
        />
        
        <InputField 
          label="Crop Type" 
          field="cropType" 
          placeholder="e.g., Rice, Wheat, Vegetables" 
          required 
        />
        
        <InputField 
          label="Season" 
          field="season" 
          placeholder="e.g., Kharif, Rabi, Summer" 
          required 
        />
        
        <InputField 
          label="Weather Condition" 
          field="weatherCondition" 
          placeholder="e.g., Monsoon, Dry, Moderate rainfall" 
        />
        
        <InputField 
          label="Water Source" 
          field="waterSource" 
          placeholder="e.g., Irrigation, Rainwater, Tube well" 
        />
        
        <InputField 
          label="Budget" 
          field="budget" 
          placeholder="e.g., 50,000 BDT, Low budget, High investment" 
        />
        
        <InputField 
          label="Experience Level" 
          field="experience" 
          placeholder="e.g., Beginner, Intermediate, Expert" 
        />
        
        <InputField 
          label="Previous Crop" 
          field="previousCrop" 
          placeholder="e.g., Rice, Fallow land, Vegetables" 
        />
        
        <InputField 
          label="Available Fertilizers" 
          field="fertilizers" 
          placeholder="e.g., Urea, DAP, Organic compost" 
        />
        
        <InputField 
          label="Available Pesticides" 
          field="pesticides" 
          placeholder="e.g., Organic, Chemical, None" 
        />
        
        <InputField 
          label="Labor Availability" 
          field="laborAvailability" 
          placeholder="e.g., Family labor, Hired workers, Limited" 
        />
        
        <InputField 
          label="Market Access" 
          field="marketAccess" 
          placeholder="e.g., Local market, Export, Direct selling" 
        />
        
        <InputField 
          label="Goals & Objectives" 
          field="goals" 
          placeholder="e.g., Maximum yield, Organic farming, Profit maximization" 
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
              <Text style={styles.responseSubtitle}>Personalized farming plan based on your inputs</Text>
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
  sectionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 2,
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
