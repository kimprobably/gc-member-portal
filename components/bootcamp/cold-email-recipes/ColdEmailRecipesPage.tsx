import React, { useState } from 'react';
import { BookOpen, Upload, Send } from 'lucide-react';
import RecipeList from './recipes/RecipeList';
import ContactListManager from './lists/ContactListManager';
import GeneratePanel from './generate/GeneratePanel';

interface Props {
  userId: string;
}

type Tab = 'recipes' | 'lists' | 'generate';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'recipes', label: 'Recipes', icon: <BookOpen size={14} /> },
  { id: 'lists', label: 'Contact Lists', icon: <Upload size={14} /> },
  { id: 'generate', label: 'Generate', icon: <Send size={14} /> },
];

export default function ColdEmailRecipesPage({ userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Cold Email Recipes</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Build enrichment recipes, upload contacts, and generate personalized cold emails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'recipes' && <RecipeList userId={userId} />}
      {activeTab === 'lists' && <ContactListManager userId={userId} />}
      {activeTab === 'generate' && <GeneratePanel userId={userId} />}
    </div>
  );
}
