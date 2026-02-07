import React, { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useRecipes, useDeleteRecipe } from '../../../../hooks/useColdEmailRecipes';
import type { BootcampRecipe } from '../../../../types/cold-email-recipe-types';
import RecipeEditor from './RecipeEditor';

interface Props {
  userId: string;
}

export default function RecipeList({ userId }: Props) {
  const { data: recipes, isLoading } = useRecipes(userId);
  const deleteRecipe = useDeleteRecipe();
  const [editingRecipe, setEditingRecipe] = useState<BootcampRecipe | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (editingRecipe || isCreating) {
    return (
      <RecipeEditor
        userId={userId}
        recipe={editingRecipe}
        onClose={() => {
          setEditingRecipe(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {recipes?.length || 0} recipe{recipes?.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Plus size={14} />
          New Recipe
        </button>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="text-center py-16 px-4">
          <BookOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            No recipes yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
            Create your first enrichment recipe to personalize cold emails.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            <Plus size={14} />
            Create Recipe
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{recipe.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingRecipe(recipe)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this recipe?')) {
                        deleteRecipe.mutate({ recipeId: recipe.id, studentId: userId });
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {recipe.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
                  {recipe.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                <span>
                  {recipe.steps.length} step{recipe.steps.length !== 1 ? 's' : ''}
                </span>
                <span>{recipe.emailTemplate ? 'Template set' : 'No template'}</span>
                {!recipe.isActive && <span className="text-amber-500">Inactive</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
