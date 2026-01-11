import { vi } from 'vitest';

export const mockGenerateContent = vi.fn().mockResolvedValue({
  text: 'Mocked AI response',
});

// GoogleGenAI must be a constructor (class) for `new GoogleGenAI()` to work
export class GoogleGenAI {
  models = {
    generateContent: mockGenerateContent,
  };

  constructor(_options?: { apiKey?: string }) {
    // Constructor accepts options but doesn't need to do anything with them
  }
}
