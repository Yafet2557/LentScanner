import React, { createContext, useContext, useState, useCallback } from 'react';
import { searchRecipes as apiSearch, getRecipeDetail as apiDetail } from '../services/spoonacular';

const RecipeContext = createContext(null);

export function RecipeProvider({ children }) {
  // Ingredient list
  const [ingredients, setIngredients] = useState([]);

  // Filters
  const [highProtein, setHighProtein] = useState(false);
  const [mealType, setMealType] = useState(null);
  const [maxReadyTime, setMaxReadyTime] = useState(null);

  // Search results
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recipe detail
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const addIngredient = useCallback((ingredient) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
  }, [ingredients]);

  const removeIngredient = useCallback((ingredient) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  }, []);

  const clearIngredients = useCallback(() => {
    setIngredients([]);
  }, []);

  const toggleHighProtein = useCallback(() => {
    setHighProtein((prev) => !prev);
  }, []);

  const searchRecipes = useCallback(async () => {
    if (ingredients.length === 0) {
      setError('Add at least one ingredient');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const results = await apiSearch({
        ingredients,
        highProtein,
        mealType,
        maxReadyTime,
      });

      setRecipes(results);
      if (results.length === 0) {
        setError('No recipes found. Try different ingredients or filters.');
      }
    } catch (e) {
      setError(e.message || 'Something went wrong');
    }

    setIsLoading(false);
  }, [ingredients, highProtein, mealType, maxReadyTime]);

  const loadRecipeDetail = useCallback(async (recipeId) => {
    setIsLoadingDetail(true);
    setRecipeDetail(null);

    try {
      const detail = await apiDetail(recipeId);
      setRecipeDetail(detail);
    } catch (e) {
      setError(e.message || 'Failed to load recipe');
    }

    setIsLoadingDetail(false);
  }, []);

  const clearRecipeDetail = useCallback(() => {
    setRecipeDetail(null);
  }, []);

  return (
    <RecipeContext.Provider
      value={{
        ingredients,
        highProtein,
        mealType,
        maxReadyTime,
        recipes,
        recipeDetail,
        isLoading,
        isLoadingDetail,
        error,
        addIngredient,
        removeIngredient,
        clearIngredients,
        toggleHighProtein,
        setMealType,
        setMaxReadyTime,
        searchRecipes,
        loadRecipeDetail,
        clearRecipeDetail,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used within a RecipeProvider');
  return ctx;
}
