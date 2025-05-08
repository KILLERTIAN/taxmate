import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Gemini API
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Configure safety settings for the model
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Analyzes a tax document image and extracts relevant information
 * @param {Buffer} fileBuffer - The image file buffer
 * @param {string} documentType - The type of document (invoice, receipt, etc.)
 * @returns {Promise<Object>} - The extracted information
 */
export async function scanDocument(fileBuffer, documentType = "invoice") {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    // Convert buffer to base64 for Gemini API
    const fileBase64 = fileBuffer.toString("base64");
    const mimeType = guessMimeType(fileBuffer);

    // Get the model for image analysis
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
    });

    // Prepare the prompt based on document type
    let prompt = "";
    
    if (documentType.toLowerCase() === "invoice") {
      prompt = "Analyze this invoice and extract the following information in JSON format: vendor name, invoice number, issue date, due date, total amount, tax amount, line items (with descriptions, quantities, and prices). If any information is unclear or missing, indicate that in your response.";
    } else if (documentType.toLowerCase() === "receipt") {
      prompt = "Analyze this receipt and extract the following information in JSON format: merchant name, receipt date, total amount, tax amount, payment method, items (with descriptions and prices). If any information is unclear or missing, indicate that in your response.";
    } else {
      prompt = `Analyze this ${documentType} document and extract all relevant tax-related information in JSON format. If any information is unclear or missing, indicate that in your response.`;
    }

    // Call the Gemini API
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: fileBase64,
              },
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    // Parse JSON from the response text
    try {
      // Extract JSON from text (may be wrapped in a code block)
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                         text.match(/```\n([\s\S]*?)\n```/) ||
                         text.match(/{[\s\S]*?}/);
      
      const jsonString = jsonMatch ? 
        (jsonMatch[1] || jsonMatch[0]) : 
        text;
      
      const extractedData = JSON.parse(jsonString.replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, "$1"));
      
      return {
        success: true,
        data: extractedData,
        rawResponse: text,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to parse JSON response",
        rawResponse: text,
      };
    }
  } catch (error) {
    console.error("Error scanning document:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze document",
    };
  }
}

/**
 * Guess the MIME type of a file from its buffer
 * @param {Buffer} buffer - The file buffer
 * @returns {string} - The MIME type
 */
function guessMimeType(buffer) {
  // Simple mime type detection based on file signature
  if (!buffer || buffer.length < 4) {
    return "application/octet-stream";
  }

  // Check file signatures
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return "image/jpeg";
  } else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  } else if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    return "image/gif";
  } else if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return "application/pdf";
  }

  return "application/octet-stream";
} 