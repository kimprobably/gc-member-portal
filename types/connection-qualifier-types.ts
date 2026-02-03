export interface LinkedInConnection {
  firstName: string;
  lastName: string;
  url: string;
  emailAddress: string;
  company: string;
  position: string;
  connectedOn: string;
}

export interface QualificationCriteria {
  targetTitles: string[];
  targetIndustries: string[];
  excludeTitles: string[];
  excludeCompanies: string[];
  connectedAfter: string | null;
  freeTextDescription: string;
}

export interface QualificationResult {
  qualification: 'qualified' | 'not_qualified';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface QualifiedConnection extends LinkedInConnection {
  qualification: string;
  confidence: string;
  reasoning: string;
}

export type QualifierStep = 'upload' | 'criteria' | 'preview' | 'processing' | 'results';

export const DEFAULT_EXCLUDE_TITLES = ['Student', 'Intern', 'Retired', 'Unemployed', 'Seeking'];

export const DEFAULT_EXCLUDE_COMPANIES: string[] = [];
