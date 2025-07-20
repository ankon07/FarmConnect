import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai";
import * as FileSystem from "expo-file-system";

// Ensure you have your Gemini API key configured as an environment variable
// For Expo, you can use EXPO_PUBLIC_GEMINI_API_KEY in your .env file
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key is not set. Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function fileToBase64(uri: string): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error(`File does not exist at URI: ${uri}`);
  }
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return base64;
}

export async function generateFarmingPlan(planType: string, formData: any): Promise<string> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured.");
  }

  try {
    let prompt = "";
    
    if (planType === "crop") {
      prompt = `As an expert agricultural advisor, create a comprehensive crop farming plan based on the following details:

Farm Details:
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
- Available Fertilizers: ${formData.fertilizers}
- Available Pesticides: ${formData.pesticides}
- Labor Availability: ${formData.laborAvailability}
- Market Access: ${formData.marketAccess}
- Goals: ${formData.goals}

Please provide a detailed farming plan that includes:
1. Crop variety recommendations
2. Land preparation guidelines
3. Planting schedule and techniques
4. Fertilizer application plan
5. Irrigation schedule
6. Pest and disease management
7. Harvesting timeline
8. Expected yield and profit analysis
9. Risk management strategies
10. Sustainable farming practices

Format the response in a clear, actionable manner that a farmer can easily follow.`;
    } else if (planType === "livestock") {
      prompt = `As an expert livestock advisor, create a comprehensive livestock farming plan based on the following details:

Farm Details:
- Farm Size: ${formData.farmSize}
- Location: ${formData.location}
- Livestock Type: ${formData.livestockType}
- Number of Animals: ${formData.animalCount}
- Housing Type: ${formData.housingType}
- Feed Source: ${formData.feedSource}
- Budget: ${formData.budget}
- Experience Level: ${formData.experience}
- Water Source: ${formData.waterSource}
- Veterinary Access: ${formData.veterinaryAccess}
- Market Access: ${formData.marketAccess}
- Goals: ${formData.goals}

Please provide a detailed livestock farming plan that includes:
1. Animal breed recommendations
2. Housing and shelter requirements
3. Feeding schedule and nutrition plan
4. Health management and vaccination schedule
5. Breeding program
6. Record keeping system
7. Marketing strategy
8. Expected production and profit analysis
9. Risk management strategies
10. Sustainable livestock practices

Format the response in a clear, actionable manner that a farmer can easily follow.`;
    } else if (planType === "fish") {
      prompt = `As an expert aquaculture advisor, create a comprehensive fish farming plan based on the following details:

Farm Details:
- Pond Size: ${formData.pondSize}
- Location: ${formData.location}
- Fish Species: ${formData.fishSpecies}
- Water Source: ${formData.waterSource}
- Pond Type: ${formData.pondType}
- Budget: ${formData.budget}
- Experience Level: ${formData.experience}
- Feed Type: ${formData.feedType}
- Market Access: ${formData.marketAccess}
- Water Quality: ${formData.waterQuality}
- Goals: ${formData.goals}

Please provide a detailed fish farming plan that includes:
1. Fish species and stocking recommendations
2. Pond preparation and management
3. Water quality management
4. Feeding schedule and nutrition plan
5. Disease prevention and treatment
6. Harvesting timeline and techniques
7. Expected yield and profit analysis
8. Risk management strategies
9. Sustainable aquaculture practices
10. Marketing and sales strategy

Format the response in a clear, actionable manner that a farmer can easily follow.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error calling Gemini API for farming plan:", error);
    throw error;
  }
}

export async function analyzeDiseaseImageWithGemini(imageUri: string, category: string): Promise<any> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured.");
  }

  try {
    const base64Image = await fileToBase64(imageUri);
    const imagePart: Part = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg", // Assuming JPEG. Adjust if other formats are expected.
      },
    };

    const prompt = `Analyze this image of a ${category.toLowerCase()} and identify any diseases present. 

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any markdown formatting, code blocks, or additional text.

Provide the response in this exact format:
{
  "diseaseName": "Name of the disease",
  "description": "Brief description of the disease and its symptoms",
  "treatment": "Recommended treatment and prevention methods",
  "severity": "Low, Medium, or High"
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().trim();

    console.log("Raw Gemini response:", text);

    // Remove markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Extract JSON object using multiple strategies
    let jsonText = text;
    
    // Strategy 1: Look for JSON object between curly braces
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
      jsonText = jsonMatch[0];
    }

    // Strategy 2: Clean up common formatting issues
    jsonText = jsonText
      .replace(/^\s*[\[\]`\s]*/, '') // Remove leading brackets, backticks, whitespace
      .replace(/[\[\]`\s]*\s*$/, '') // Remove trailing brackets, backticks, whitespace
      .trim();

    console.log("Cleaned JSON text:", jsonText);

    // Attempt to parse the cleaned text as JSON
    try {
      const parsedResult = JSON.parse(jsonText);
      
      // Validate that required fields are present
      const requiredFields = ['diseaseName', 'description', 'treatment', 'severity'];
      const missingFields = requiredFields.filter(field => !parsedResult[field]);
      
      if (missingFields.length > 0) {
        console.warn("Missing required fields:", missingFields);
        // Fill in missing fields with defaults
        missingFields.forEach(field => {
          switch (field) {
            case 'diseaseName':
              parsedResult[field] = 'Disease Detected';
              break;
            case 'description':
              parsedResult[field] = 'Disease analysis completed. Please consult with an expert for detailed diagnosis.';
              break;
            case 'treatment':
              parsedResult[field] = 'Consult with a specialist for proper treatment recommendations.';
              break;
            case 'severity':
              parsedResult[field] = 'Medium';
              break;
          }
        });
      }

      // Ensure severity is one of the expected values
      if (!['Low', 'Medium', 'High'].includes(parsedResult.severity)) {
        parsedResult.severity = 'Medium';
      }

      return parsedResult;
    } catch (jsonError) {
      console.error("Failed to parse Gemini response as JSON:", jsonError);
      console.log("Failed JSON text:", jsonText);
      
      // Enhanced fallback: try to extract information from raw text
      const fallbackResult = {
        diseaseName: "Disease Analysis",
        description: "",
        treatment: "",
        severity: "Medium"
      };

      // Try to extract disease name
      const diseaseMatch = text.match(/disease[:\s]*([^,\n.]+)/i);
      if (diseaseMatch) {
        fallbackResult.diseaseName = diseaseMatch[1].trim();
      }

      // Try to extract description
      const descMatch = text.match(/description[:\s]*([^,\n.]+)/i);
      if (descMatch) {
        fallbackResult.description = descMatch[1].trim();
      } else {
        fallbackResult.description = `Analysis completed. Raw response: ${text.substring(0, 200)}...`;
      }

      // Try to extract treatment
      const treatMatch = text.match(/treatment[:\s]*([^,\n.]+)/i);
      if (treatMatch) {
        fallbackResult.treatment = treatMatch[1].trim();
      } else {
        fallbackResult.treatment = "Please consult with a specialist for proper treatment.";
      }

      // Try to extract severity
      const severityMatch = text.match(/severity[:\s]*(low|medium|high)/i);
      if (severityMatch) {
        fallbackResult.severity = severityMatch[1].charAt(0).toUpperCase() + severityMatch[1].slice(1).toLowerCase();
      }

      return fallbackResult;
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
