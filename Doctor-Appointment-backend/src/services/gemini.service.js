const httpStatus = require("http-status");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApiError = require("../utils/ApiError");

// Appointment booking keywords to trigger special response
const APPOINTMENT_KEYWORDS = [
  "book appointment",
  "schedule appointment",
  "make an appointment",
  "book a consultation",
  "schedule consultation",
];

// Specialized appointment booking response
const APPOINTMENT_RESPONSE = {
  text: `I can help you book an appointment with TrustedGP Clinic easily!

🩺 To schedule your appointment, please click the link below:
📅 Book Appointment: https://trustedgpclinic.com/book-appointment

Our online booking system allows you to:
- Choose your preferred doctor
- Select a convenient time slot
- Complete your booking in just a few minutes

If you have any specific medical concerns or need further assistance, our clinic staff will be happy to help you during the booking process.`,

  quickBookLink: "https://trustedgpclinic.com/book-appointment",
};

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error("ERROR: GOOGLE_GENAI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

const chartAI = async (modelName, contents) => {
  try {
    // Check if the input is an appointment-related query
    const isAppointmentQuery = APPOINTMENT_KEYWORDS.some((keyword) =>
      contents.toLowerCase().includes(keyword)
    );

    // If it's an appointment-related query, return the specialized response
    if (isAppointmentQuery) {
      return APPOINTMENT_RESPONSE;
    }

    // Regular AI model generation for other queries
    const model = genAI.getGenerativeModel({
      model: modelName || "gemini-1.5-flash",
    });

    let requestContents;
    if (typeof contents === "string") {
      // Prepend context to the user's message instead of using system role
      const contextualPrompt = `You are an AI assistant for TrustedGP Clinic. Provide helpful, professional medical information while always being patient-friendly. 

Medical Context: This conversation is taking place on the TrustedGP Clinic platform, focusing on providing medical guidance and support.

User Query: ${contents}`;

      requestContents = [{ role: "user", parts: [{ text: contextualPrompt }] }];
    } else if (Array.isArray(contents)) {
      requestContents = contents;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid 'contents' format for chartAI."
      );
    }

    const result = await model.generateContent({
      contents: requestContents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const response = result.response;

    // Append appointment booking CTA to relevant medical responses
    const responseText = response.text();
    const enhancedResponse = `${responseText}\n\n💡 Need to book an appointment? Visit: https://trustedgpclinic.com/book-appointment`;

    return {
      ...response,
      text: () => enhancedResponse,
    };
  } catch (error) {
    console.error("Error in chartAI:", error);

    // More detailed error logging
    if (error.message) {
      console.error("Detailed error message:", error.message);
    }
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }

    if (error.message && error.message.includes("API key not valid")) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Google GenAI API key is not valid. Please check your API key."
      );
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to generate content from AI model: ${
        error.message || "Unknown error"
      }`
    );
  }
};

const getAllModels = async () => {
  try {
    const result = await genAI.listModels();
    const modelsArray = [];
    for await (const model of result) {
      modelsArray.push(model);
    }
    return modelsArray;
  } catch (error) {
    console.error("Error fetching models from Google GenAI:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch models from Google GenAI. Original error: ${error.message}`
    );
  }
};

module.exports = {
  chartAI,
  getAllModels,
};
