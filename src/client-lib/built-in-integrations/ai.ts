import axios from "axios";
import { type JSONSchema7 } from "json-schema";
import { showFakeData } from "@/client-lib/shared";
import { AI_AGENTS } from "@/shared/models/ai-agents";

type ReasoningEffort = "low" | "medium" | "high";
type ModelProvider = "openai" | "google" | "ollama";

interface GenerateOptions {
  agentId?: string;
  model?: string;
  provider?: ModelProvider;
  system?: string;
  messages?: { role: string; content: string }[];
}

/**
 * Generate text using the unified AI API
 */
export async function generateText(
  promptOrOptions: string | GenerateOptions,
  legacyOptions?: any
) {
  try {
    let payload: any = {};

    if (typeof promptOrOptions === 'string') {
      // Legacy call support or simple usage
      payload = {
        prompt: promptOrOptions,
        model: 'ministral-3:3b', // Default to fast local model
        provider: 'ollama'
      };
    } else {
      const { agentId, model, provider, system, messages } = promptOrOptions;

      if (agentId) {
        const agent = AI_AGENTS.find(a => a.id === agentId);
        if (agent) {
          payload = {
            model: agent.model,
            provider: agent.provider,
            system: agent.systemPrompt,
            messages: messages, // If passed
            prompt: messages ? undefined : (messages as any) // If no messages, assume prompt is in options? No, wait.
          };
          // If using agentId, we usually need the user input too.
          // This function signature is getting tricky with the refactor.
          // Let's keep it simple and assume the caller constructs the prompt or messages.
        }
      }

      // Override or set explicit
      if (model) payload.model = model;
      if (provider) payload.provider = provider;
      if (system) payload.system = system;
      if (messages) payload.messages = messages;
      // If prompt is passed in options
      if ((promptOrOptions as any).prompt) payload.prompt = (promptOrOptions as any).prompt;
    }

    const response = await axios.post("/api/ai/generate", payload, {
      timeout: 300000,
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
 */
export async function generateObject<T>(
  prompt: string,
  jsonSchemaInput: JSONSchema7,
  reasoningEffort: ReasoningEffort = "low",
  modelProvider: ModelProvider = "openai",
): Promise<T> {
  // For now, let's just use the fake data or implement proper object generation later if needed.
  // The current task is chat.
  // But to be safe, let's wire it to the new endpoint if we can, or keep it legacy.
  // The prompt asked to finish integration.

  const response = await axios.post("/api/ai/generate", {
    model: "llama3.2:3b", // specific capability model
    provider: "ollama",
    prompt: `${prompt}\n\nPlease respond with a JSON object matching this schema: ${JSON.stringify(jsonSchemaInput)}`,
  });

  try {
    return JSON.parse(response.data.response) as T;
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", response.data.response);
    throw new Error("Invalid AI response format");
  }
}

