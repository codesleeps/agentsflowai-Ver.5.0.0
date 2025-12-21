import axios from "axios";
import { type JSONSchema7 } from "json-schema";
import { showFakeData } from "@/client-lib/shared";

type ReasoningEffort = "low" | "medium" | "high";
type ModelProvider = "openai" | "google";

/**
 * @param reasoningEffort - The reasoning effort to use for the AI API (default: 'low')
 * 'low' - Faster but less accurate
 * 'medium' - Balanced speed and accuracy
 * 'high' - Slowest but most accurate - only use if user explicitly asks for it
 * @param modelProvider - The model provider to use for the AI API (default: 'openai')
 * 'openai' - to set the model to gpt-5 or equivalent
 * 'google' - to set the model to gemini-2.5-pro or equivalent
 */
export async function generateText(
  prompt: string,
  enableWebSearch = false,
  enableDeepResearch = false,
  reasoningEffort: ReasoningEffort = "low",
  modelProvider: ModelProvider = "openai",
) {
  try {
    const response = await axios.post("/api/ai/ollama", {
      action: "generate",
      model: "llama3.1:8b",
      prompt,
    }, {
      timeout: 300000, // 5 minutes client-side timeout
    });

    return response.data.response;
  } catch (error: any) {
    console.error("Error in generateText:", error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error("AI response timed out. The model might be too slow or loading.");
    }
    throw error;
  }
}



/**
 * Generate an object using the AI API
 *
 * @param prompt - The prompt to generate the object
 * @param jsonSchemaInput - The JSON schema input
 * @example See `fakeJsonShcemaInput` in `@/fake-data/integrations/ai.ts`
 * @param reasoningEffort - The reasoning effort to use for the AI API (default: 'low')
 * 'low' - Faster but less accurate
 * 'medium' - Balanced speed and accuracy
 * 'high' - Slowest but most accurate - only use if user explicitly asks for it
 * @param modelProvider - The model provider to use for the AI API (default: 'openai')
 * 'openai' - to set the model to gpt-5 or equivalent
 * 'google' - to set the model to gemini-2.5-pro or equivalent
 *
 * @returns The generated object
 * @example See `fakeJsonShcemaOutput` in `@/fake-data/integrations/ai.ts`
 */
export async function generateObject<T>(
  prompt: string,
  jsonSchemaInput: JSONSchema7,
  reasoningEffort: ReasoningEffort = "low",
  modelProvider: ModelProvider = "openai",
): Promise<T> {
  const response = await axios.post("/api/ai/ollama", {
    action: "generate",
    model: "llama3.1:8b",
    prompt: `${prompt}\n\nPlease respond with a JSON object matching this schema: ${JSON.stringify(jsonSchemaInput)}`,
    options: {
      format: "json",
    },
  });


  try {
    return JSON.parse(response.data.response) as T;
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", response.data.response);
    throw new Error("Invalid AI response format");
  }
}

