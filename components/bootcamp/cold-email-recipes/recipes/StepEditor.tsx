import React from 'react';
import { Trash2 } from 'lucide-react';
import type {
  RecipeStep,
  RecipeStepType,
  AiPromptConfig,
  AiExtractConfig,
  TransformConfig,
  FieldMapConfig,
} from '../../../../types/cold-email-recipe-types';

interface Props {
  step: RecipeStep;
  index: number;
  onChange: (step: RecipeStep) => void;
  onRemove: () => void;
}

const TYPE_OPTIONS: { value: RecipeStepType; label: string; desc: string }[] = [
  {
    value: 'ai_prompt',
    label: 'AI Prompt',
    desc: 'Run a Claude prompt with {{field}} interpolation',
  },
  { value: 'ai_extract', label: 'AI Extract', desc: 'Extract structured fields from text' },
  { value: 'transform', label: 'Transform', desc: 'Format, concat, or template data' },
  { value: 'field_map', label: 'Field Map', desc: 'Rename or alias columns' },
];

function defaultConfig(type: RecipeStepType): RecipeStep['config'] {
  switch (type) {
    case 'ai_prompt':
      return { prompt: '', output_field: '', max_tokens: 300 };
    case 'ai_extract':
      return { source_field: '', fields: [], prompt: '' };
    case 'transform':
      return { transforms: [] };
    case 'field_map':
      return { mappings: [] };
  }
}

export default function StepEditor({ step, index, onChange, onRemove }: Props) {
  const updateConfig = (partial: Record<string, unknown>) => {
    onChange({ ...step, config: { ...step.config, ...partial } });
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Step {index + 1}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Name
          </label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onChange({ ...step, name: e.target.value })}
            placeholder="e.g. Research company"
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Type
          </label>
          <select
            value={step.type}
            onChange={(e) => {
              const newType = e.target.value as RecipeStepType;
              onChange({ ...step, type: newType, config: defaultConfig(newType) });
            }}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Config fields based on type */}
      {step.type === 'ai_prompt' && (
        <AiPromptFields config={step.config as AiPromptConfig} onChange={updateConfig} />
      )}
      {step.type === 'ai_extract' && (
        <AiExtractFields config={step.config as AiExtractConfig} onChange={updateConfig} />
      )}
      {step.type === 'transform' && (
        <TransformFields config={step.config as TransformConfig} onChange={updateConfig} />
      )}
      {step.type === 'field_map' && (
        <FieldMapFields config={step.config as FieldMapConfig} onChange={updateConfig} />
      )}
    </div>
  );
}

function AiPromptFields({
  config,
  onChange,
}: {
  config: AiPromptConfig;
  onChange: (partial: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Prompt <span className="text-zinc-400">(use {'{{field}}'} for variables)</span>
        </label>
        <textarea
          value={config.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          rows={4}
          placeholder="Research {{company}} and write a personalized opener for {{first_name}}..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Output field name
          </label>
          <input
            type="text"
            value={config.output_field}
            onChange={(e) => onChange({ output_field: e.target.value })}
            placeholder="e.g. custom_opener"
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Max tokens
          </label>
          <input
            type="number"
            value={config.max_tokens || 300}
            onChange={(e) => onChange({ max_tokens: parseInt(e.target.value) || 300 })}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
      </div>
    </div>
  );
}

function AiExtractFields({
  config,
  onChange,
}: {
  config: AiExtractConfig;
  onChange: (partial: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Source field
        </label>
        <input
          type="text"
          value={config.source_field}
          onChange={(e) => onChange({ source_field: e.target.value })}
          placeholder="e.g. custom_opener"
          className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Fields to extract <span className="text-zinc-400">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={config.fields.join(', ')}
          onChange={(e) =>
            onChange({
              fields: e.target.value
                .split(',')
                .map((f) => f.trim())
                .filter(Boolean),
            })
          }
          placeholder="e.g. pain_point, value_prop, hook"
          className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          Extraction prompt <span className="text-zinc-400">(optional guidance)</span>
        </label>
        <textarea
          value={config.prompt || ''}
          onChange={(e) => onChange({ prompt: e.target.value })}
          rows={2}
          placeholder="Extract the main pain point and a personalized value prop..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>
    </div>
  );
}

function TransformFields({
  config,
  onChange,
}: {
  config: TransformConfig;
  onChange: (partial: Record<string, unknown>) => void;
}) {
  const addTransform = () => {
    onChange({
      transforms: [
        ...config.transforms,
        { type: 'template', input_fields: [], output_field: '', template: '' },
      ],
    });
  };

  const updateTransform = (idx: number, partial: Record<string, unknown>) => {
    const updated = config.transforms.map((t, i) => (i === idx ? { ...t, ...partial } : t));
    onChange({ transforms: updated });
  };

  const removeTransform = (idx: number) => {
    onChange({ transforms: config.transforms.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-2">
      {config.transforms.map((t, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <select
              value={t.type}
              onChange={(e) => updateTransform(idx, { type: e.target.value })}
              className="px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
            >
              <option value="template">Template</option>
              <option value="concat">Concat</option>
              <option value="lowercase">Lowercase</option>
              <option value="uppercase">Uppercase</option>
              <option value="strip">Strip</option>
            </select>
            <input
              type="text"
              value={t.output_field}
              onChange={(e) => updateTransform(idx, { output_field: e.target.value })}
              placeholder="Output field"
              className="px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
            />
            <input
              type="text"
              value={t.template || t.input_fields?.join(', ') || ''}
              onChange={(e) => {
                if (t.type === 'template') {
                  updateTransform(idx, { template: e.target.value });
                } else {
                  updateTransform(idx, {
                    input_fields: e.target.value
                      .split(',')
                      .map((f) => f.trim())
                      .filter(Boolean),
                  });
                }
              }}
              placeholder={t.type === 'template' ? '{{first_name}} at {{company}}' : 'Input fields'}
              className="px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => removeTransform(idx)}
            className="p-1 text-zinc-400 hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={addTransform}
        className="text-xs text-violet-500 hover:text-violet-600 font-medium"
      >
        + Add transform
      </button>
    </div>
  );
}

function FieldMapFields({
  config,
  onChange,
}: {
  config: FieldMapConfig;
  onChange: (partial: Record<string, unknown>) => void;
}) {
  const addMapping = () => {
    onChange({ mappings: [...config.mappings, { from: '', to: '' }] });
  };

  const updateMapping = (idx: number, partial: { from?: string; to?: string }) => {
    const updated = config.mappings.map((m, i) => (i === idx ? { ...m, ...partial } : m));
    onChange({ mappings: updated });
  };

  const removeMapping = (idx: number) => {
    onChange({ mappings: config.mappings.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-2">
      {config.mappings.map((m, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            value={m.from}
            onChange={(e) => updateMapping(idx, { from: e.target.value })}
            placeholder="From field"
            className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
          />
          <span className="text-xs text-zinc-400">&rarr;</span>
          <input
            type="text"
            value={m.to}
            onChange={(e) => updateMapping(idx, { to: e.target.value })}
            placeholder="To field"
            className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
          />
          <button
            onClick={() => removeMapping(idx)}
            className="p-1 text-zinc-400 hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={addMapping}
        className="text-xs text-violet-500 hover:text-violet-600 font-medium"
      >
        + Add mapping
      </button>
    </div>
  );
}
