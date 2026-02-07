import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useCreateRecipe, useUpdateRecipe } from '../../../../hooks/useColdEmailRecipes';
import type {
  BootcampRecipe,
  RecipeStep,
  EmailTemplate,
  AiPromptConfig,
  AiExtractConfig,
} from '../../../../types/cold-email-recipe-types';
import StepEditor from './StepEditor';
import EmailTemplateEditor from './EmailTemplateEditor';

interface Props {
  userId: string;
  recipe: BootcampRecipe | null; // null = creating new
  onClose: () => void;
}

function generateId() {
  return window.crypto.randomUUID();
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function RecipeEditor({ userId, recipe, onClose }: Props) {
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  const [name, setName] = useState(recipe?.name || '');
  const [slug, setSlug] = useState(recipe?.slug || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [steps, setSteps] = useState<RecipeStep[]>(recipe?.steps || []);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(
    recipe?.emailTemplate || { subject: '', body: '' }
  );
  const [autoSlug, setAutoSlug] = useState(!recipe);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute available fields from steps + standard fields
  const availableFields = useMemo(() => {
    const fields = new Set<string>([
      'first_name',
      'last_name',
      'email',
      'company',
      'title',
      'linkedin_url',
    ]);
    for (const step of steps) {
      if (step.type === 'ai_prompt') {
        const config = step.config as AiPromptConfig;
        if (config.output_field) fields.add(config.output_field);
      }
      if (step.type === 'ai_extract') {
        const config = step.config as AiExtractConfig;
        for (const f of config.fields) {
          if (f) fields.add(f);
        }
      }
    }
    return [...fields];
  }, [steps]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: generateId(),
        type: 'ai_prompt',
        name: '',
        config: { prompt: '', output_field: '', max_tokens: 300 },
      },
    ]);
  };

  const updateStep = (index: number, updated: RecipeStep) => {
    setSteps(steps.map((s, i) => (i === index ? updated : s)));
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (recipe) {
        await updateRecipe.mutateAsync({
          recipeId: recipe.id,
          studentId: userId,
          updates: {
            name,
            slug,
            description,
            steps,
            emailTemplate: emailTemplate.subject || emailTemplate.body ? emailTemplate : null,
          },
        });
      } else {
        await createRecipe.mutateAsync({
          studentId: userId,
          name,
          slug,
          description,
          steps,
          emailTemplate: emailTemplate.subject || emailTemplate.body ? emailTemplate : null,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to recipes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          <Save size={14} />
          {saving ? 'Saving...' : recipe ? 'Update' : 'Create'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Recipe name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. B2B Agency Outreach"
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            placeholder="b2b-agency-outreach"
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-mono"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What does this recipe do?"
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Enrichment Steps</h3>
          <button
            onClick={addStep}
            className="inline-flex items-center gap-1 text-xs text-violet-500 hover:text-violet-600 font-medium"
          >
            <Plus size={12} />
            Add Step
          </button>
        </div>
        {steps.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              No steps yet. Add AI prompts, transforms, or field maps.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <StepEditor
                key={step.id}
                step={step}
                index={index}
                onChange={(updated) => updateStep(index, updated)}
                onRemove={() => removeStep(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Email Template */}
      <EmailTemplateEditor
        template={emailTemplate}
        onChange={setEmailTemplate}
        availableFields={availableFields}
      />
    </div>
  );
}
