import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockGenerateContent } from '../../../__mocks__/@google/genai';

// Set API key so the functions don't use fallback behavior
vi.stubEnv('API_KEY', 'test-api-key');

// Import after stubbing env
import {
  getYouTubeTranscript,
  summarizeLesson,
  generateICPSuggestions,
} from '../../../services/ai';

// Helper to create mock response
const createMockResponse = (text: string) => ({ text });

describe('AI Service', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
    // Default mock implementation
    mockGenerateContent.mockResolvedValue(createMockResponse('Default mock response'));
  });

  describe('getYouTubeTranscript', () => {
    it('returns transcript for a video', async () => {
      mockGenerateContent.mockResolvedValue(
        createMockResponse('This is a sample transcript about LinkedIn outreach...')
      );

      const result = await getYouTubeTranscript('test-video-id', 'Test Video');

      expect(typeof result).toBe('string');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('returns hardcoded transcript for demo video', async () => {
      // The specific demo video ID returns a hardcoded transcript
      const result = await getYouTubeTranscript('aqz-KE-bpKQ', 'Demo Video');

      expect(result).toContain('LinkedIn Bootcamp');
      expect(result).toContain('Clay');
      // mockGenerateContent should NOT be called for the hardcoded video
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      // The function catches errors and returns a fallback transcript
      const result = await getYouTubeTranscript('error-video', 'Error Test');

      expect(typeof result).toBe('string');
      expect(result).toContain('video lesson');
    });
  });

  describe('summarizeLesson', () => {
    it('returns a summary of the lesson', async () => {
      const mockSummary = `
## Summary
This lesson covers the fundamentals of LinkedIn outreach.

## Key Takeaways
- Connect with decision makers
- Personalize your messages
- Follow up consistently
      `;

      mockGenerateContent.mockResolvedValue(createMockResponse(mockSummary));

      const result = await summarizeLesson('LinkedIn Basics', 'Full transcript here...');

      expect(typeof result).toBe('string');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Summarization failed'));

      const result = await summarizeLesson('Test', 'transcript');

      expect(result).toContain('Unable to generate summary');
    });
  });

  describe('generateICPSuggestions', () => {
    it('returns ICP suggestions for a company', async () => {
      const mockResponse = JSON.stringify({
        targetDescription: 'B2B SaaS companies seeking growth',
        verticals: 'SaaS, Technology, FinTech',
        companySize: '50-500 employees',
        jobTitles: 'VP of Marketing, CMO, Head of Growth',
        geography: 'North America, Europe',
        painPoints: 'Scaling outreach, Lead quality',
        offer: 'AI-powered outreach automation',
        differentiator: 'Best-in-class personalization',
        socialProof: 'Fortune 500 case studies',
        commonObjections: 'Price, Implementation time',
      });

      mockGenerateContent.mockResolvedValue(createMockResponse(mockResponse));

      const result = await generateICPSuggestions('Acme Corp', 'https://acme.com');

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.targetDescription).toBe('B2B SaaS companies seeking growth');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('throws error on failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Unable to generate ICP suggestions'));

      await expect(generateICPSuggestions('Acme Corp')).rejects.toThrow(
        'Unable to generate ICP suggestions'
      );
    });

    it('handles existing data parameter', async () => {
      const existingData = {
        targetDescription: 'Already defined',
        verticals: 'Healthcare',
      };

      const mockResponse = JSON.stringify({
        ...existingData,
        companySize: '100-1000 employees',
        jobTitles: 'CTO, VP Engineering',
        geography: 'US',
        painPoints: 'Compliance',
        offer: 'Healthcare solutions',
        differentiator: 'HIPAA certified',
        socialProof: 'Trusted by hospitals',
        commonObjections: 'Integration complexity',
      });

      mockGenerateContent.mockResolvedValue(createMockResponse(mockResponse));

      const result = await generateICPSuggestions('Health Tech Inc', undefined, existingData);

      expect(result).toBeDefined();
      expect(mockGenerateContent).toHaveBeenCalled();
    });
  });
});
