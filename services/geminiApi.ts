import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai";
import * as FileSystem from "expo-file-system";

// Ensure you have your Gemini API key configured as an environment variable
// For Expo, you can use EXPO_PUBLIC_GEMINI_API_KEY in your .env file
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key is not set. Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

async function fileToBase64(uri: string): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error(`File does not exist at URI: ${uri}`);
  }
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return base64;
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

    const prompt = `Analyze this image of a ${category.toLowerCase()} and identify any diseases present. Provide the disease name, a brief description, recommended treatment, and severity (Low, Medium, High). Format the output as a JSON object with the keys: diseaseName, description, treatment, severity.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the text as JSON
    try {
      const parsedResult = JSON.parse(text);
      return parsedResult;
    } catch (jsonError) {
      console.error("Failed to parse Gemini response as JSON:", jsonError);
      console.log("Raw Gemini response:", text);
      // Fallback if JSON parsing fails, try to extract information
      return {
        diseaseName: "Unknown Disease",
        description: `Could not parse detailed diagnosis. Raw response: ${text}`,
        treatment: "Consult a specialist.",
        severity: "Unknown",
      };
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
