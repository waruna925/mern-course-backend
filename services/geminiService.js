import axios from "axios";

export const askGemini = async (prompt) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    return response.data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.log(
      "Gemini Error:",
      JSON.stringify(error.response?.data, null, 2)
    );

    throw error;
  }
};