import { Check } from 'lucide-react';
import { InfraTier, ServiceProvider } from '../../../../types/infrastructure-types';
import { useInfraTiers } from '../../../../hooks/useInfrastructure';

interface Props {
  selectedTier: InfraTier | null;
  onSelect: (tier: InfraTier) => void;
  serviceProvider: ServiceProvider;
  onServiceProviderChange: (provider: ServiceProvider) => void;
}

export default function TierSelection({
  selectedTier,
  onSelect,
  serviceProvider,
  onServiceProviderChange,
}: Props) {
  const { data: tiers, isLoading } = useInfraTiers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Choose Your Package</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Select your email provider and infrastructure tier.
        </p>
      </div>

      {/* Service Provider Toggle */}
      <div>
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Email Provider
        </div>
        <div className="flex gap-2">
          {(['GOOGLE', 'MICROSOFT'] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => onServiceProviderChange(provider)}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border-2 transition-all ${
                serviceProvider === provider
                  ? 'border-violet-500 bg-violet-500/5 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {provider === 'GOOGLE' ? 'Google Workspace' : 'Microsoft 365'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(tiers || []).map((tier) => {
          const isSelected = selectedTier?.id === tier.id;
          const totalMailboxes = tier.domainCount * tier.mailboxesPerDomain;

          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-500/5 dark:bg-violet-500/10'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}

              <div className="text-base font-semibold text-zinc-900 dark:text-white">
                {tier.name}
              </div>
              <div className="mt-3 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <div>{tier.domainCount} domains</div>
                <div>{totalMailboxes} mailboxes</div>
                <div>~{totalMailboxes * 30} emails/day capacity</div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-400 dark:text-zinc-500">One-time setup</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white">
                  ${(tier.setupFeeCents / 100).toFixed(0)}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  + ${(tier.monthlyFeeCents / 100).toFixed(0)}/mo
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
