import OpenAI from 'openai';

// Define the expected response structure
interface LlamaResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Create a custom OpenRouter client using the OpenAI SDK
export const openRouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',  
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Decision Game',
  },
});

// Helper function to use Llama-4-Maverick model
export async function generateWithLlama4Maverick(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: Partial<OpenAI.Chat.ChatCompletionCreateParams> = {}
): Promise<LlamaResponse> {
  try {
    // Set reasonable defaults
    const defaultOptions = {
      model: 'meta-llama/llama-4-maverick:free',
      temperature: 0.7,
      max_tokens: 1500,
    };

    // Determine response format
    let responseFormat = {};
    if (options.response_format) {
      responseFormat = { response_format: options.response_format };
    } else {
      // Default to JSON response
      responseFormat = { 
        response_format: { type: "json_object" as const } 
      };
    }

    // Remove response_format from options to avoid conflict
    const { response_format, ...restOptions } = options;

    // Combine all options with defaults and include messages
    const requestOptions = {
      ...defaultOptions,
      ...restOptions,
      ...responseFormat,
      messages,
    };

    console.log('Making API request to OpenRouter with options:', JSON.stringify(requestOptions, null, 2));

    const response = await openRouter.chat.completions.create(requestOptions);
    
    console.log('OpenRouter response:', JSON.stringify(response, null, 2));
    
    return response as unknown as LlamaResponse;
  } catch (error) {
    console.error('Error generating with Llama 4 Maverick:', error);
    throw error;
  }
} 