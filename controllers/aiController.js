import Product from "../models/product.js";
import { askGemini } from "../services/geminiService.js";

export const recommendLaptop = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const searchWords = prompt
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);

    const allProducts = await Product.find();

    let relevantProducts = allProducts.filter(product => {
      const searchableText = `
        ${product.name || ""}
        ${product.brand || ""}
        ${product.description || ""}
        ${product.category || ""}
        ${product.processor || ""}
        ${product.ram || ""}
      `.toLowerCase();

      return searchWords.some(word =>
        searchableText.includes(word)
      );
    });

    // Fallback: if no matches found, send a limited set
    if (relevantProducts.length === 0) {
      relevantProducts = allProducts.slice(0, 20);
    }

    // Limit products sent to Gemini
    relevantProducts = relevantProducts.slice(0, 20);

    const aiPrompt = `
You are an expert laptop recommendation assistant.

USER REQUEST:
"${prompt}"

AVAILABLE LAPTOPS:
${JSON.stringify(relevantProducts, null, 2)}

Instructions:
1. Recommend only laptops from AVAILABLE LAPTOPS.
2. Do NOT invent products.
3. Use specifications to infer suitability:
   - Dedicated GPU => gaming
   - High RAM + strong CPU => programming
   - Lightweight => student use
   - Long battery => travel/work
4. Recommend 1-3 best options.
5. Explain why each laptop fits the request.
6. If no perfect match exists, recommend the closest available option.
7. Never reply "No suitable laptop found" unless the list is empty.
`;

    console.log("Prompt:", prompt);
    console.log("Products sent to AI:", relevantProducts.length);

    const answer = await askGemini(aiPrompt);

    res.json({
      success: true,
      answer,
      productsAnalyzed: relevantProducts.length,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};