// ============================================
// Cold Email Recipe Types (Bootcamp)
// ============================================

// Step types available to students
export type RecipeStepType = 'ai_prompt' | 'ai_extract' | 'transform' | 'field_map';

// --- Step Configs ---

export interface AiPromptConfig {
  prompt: string; // Template with {{field}} variables
  output_field: string;
  max_tokens?: number;
}

export interface AiExtractConfig {
  source_field: string;
  fields: string[];
  prompt?: string; // Optional guidance for extraction
}

export interface TransformOperation {
  type: 'concat' | 'strip' | 'lowercase' | 'uppercase' | 'template';
  input_fields?: string[];
  output_field: string;
  separator?: string; // For concat
  template?: string; // For template type: "{{first_name}} at {{company}}"
}

export interface TransformConfig {
  transforms: TransformOperation[];
}

export interface FieldMapping {
  from: string;
  to: string;
}

export interface FieldMapConfig {
  mappings: FieldMapping[];
}

export type StepConfig = AiPromptConfig | AiExtractConfig | TransformConfig | FieldMapConfig;

// --- Recipe Step ---

export interface RecipeStep {
  id: string;
  type: RecipeStepType;
  name: string;
  config: StepConfig;
}

// --- Email Template ---

export interface EmailTemplate {
  subject: string;
  body: string;
}

// --- Recipe ---

export interface BootcampRecipe {
  id: string;
  studentId: string;
  name: string;
  slug: string;
  description: string;
  steps: RecipeStep[];
  emailTemplate: EmailTemplate | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Contact List ---

export interface BootcampContactList {
  id: string;
  studentId: string;
  name: string;
  contactCount: number;
  columnMapping: Record<string, string>; // csv_header -> standard_field
  createdAt: string;
}

// --- Contact ---

export type EnrichmentStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface BootcampContact {
  id: string;
  listId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  linkedinUrl: string;
  customFields: Record<string, string>;
  stepOutputs: Record<string, string>;
  enrichmentStatus: EnrichmentStatus;
  createdAt: string;
}

// --- Form/UI State ---

export interface RecipeFormState {
  name: string;
  slug: string;
  description: string;
  steps: RecipeStep[];
  emailTemplate: EmailTemplate;
}

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

// Standard fields for column mapping
export const STANDARD_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'company',
  'title',
  'linkedin_url',
] as const;

export type StandardField = (typeof STANDARD_FIELDS)[number];

// Step type labels for UI
export const STEP_TYPE_LABELS: Record<RecipeStepType, string> = {
  ai_prompt: 'AI Prompt',
  ai_extract: 'AI Extract',
  transform: 'Transform',
  field_map: 'Field Map',
};

export const STEP_TYPE_DESCRIPTIONS: Record<RecipeStepType, string> = {
  ai_prompt: 'Run a Claude prompt with {{field}} interpolation',
  ai_extract: 'Extract structured fields from text using AI',
  transform: 'Format, concat, or template data',
  field_map: 'Rename or alias columns',
};
