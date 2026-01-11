declare module '@google/genai' {
  export interface GoogleGenAIOptions {
    apiKey: string;
  }

  export interface GenerateContentRequest {
    model: string;
    contents: string;
  }

  export interface GenerateContentResponse {
    text?: string;
  }

  export class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    models: {
      generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse>;
    };
  }
}
