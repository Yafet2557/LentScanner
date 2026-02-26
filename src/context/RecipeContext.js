import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  searchRecipes as apiSearch,
  getRecipeDetail as apiDetail,
  getPopularRecipes as apiPopular,
  getRecipesByCategory as apiCategory,
} from '../services/spoonacular';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const RecipeContext = createContext(null);

const FAVORITES_KEY = 'favorite_recipes';

export function RecipeProvider({ children }) {
  const { user } = useAuth();

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

  // Popular / category recipes (browse mode)
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Recipe detail
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = useCallback(async () => {
    try {
      if (user) {
        // Logged in — fetch from Supabase
        const { data } = await supabase
          .from('favorite_recipes')
          .select('recipe_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setFavorites(data.map((row) => row.recipe_data));
        }
      } else {
        // Guest — use local storage
        const json = await AsyncStorage.getItem(FAVORITES_KEY);
        if (json) setFavorites(JSON.parse(json));
      }
    } catch (_) {}
  }, [user]);

  // Reload favorites whenever auth state changes (login or logout)
  useEffect(() => {
    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (recipe) => {
    const exists = favorites.some((f) => f.id === recipe.id);
    const updated = exists
      ? favorites.filter((f) => f.id !== recipe.id)
      : [recipe, ...favorites];

    setFavorites(updated);

    if (user) {
      // Logged in — insert or delete a single row in Supabase
      if (exists) {
        await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id);
      } else {
        await supabase.from('favorite_recipes').insert({
          user_id: user.id,
          recipe_id: recipe.id,
          recipe_data: recipe,
        });
      }
    } else {
      // Guest — save full array to AsyncStorage
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch (_) {}
    }
  }, [user, favorites]);

  const isFavorite = useCallback((recipeId) => {
    return favorites.some((f) => f.id === recipeId);
  }, [favorites]);

  // Fetch popular recipes (called on first load of Recipes tab)
  const fetchPopular = useCallback(async (category = null) => {
    setIsLoadingPopular(true);
    setSelectedCategory(category);
    setError(null);

    try {
      const results = category
        ? await apiCategory(category)
        : await apiPopular();
      setPopularRecipes(results);
    } catch (e) {
      setError(e.message || 'Failed to load recipes');
    }

    setIsLoadingPopular(false);
  }, []);

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

  const clearSearch = useCallback(() => {
    setRecipes([]);
    setError(null);
  }, []);

  return (
    <RecipeContext.Provider
      value={{
        ingredients,
        highProtein,
        mealType,
        maxReadyTime,
        recipes,
        popularRecipes,
        isLoadingPopular,
        selectedCategory,
        recipeDetail,
        isLoading,
        isLoadingDetail,
        error,
        favorites,
        addIngredient,
        removeIngredient,
        clearIngredients,
        toggleHighProtein,
        setMealType,
        setMaxReadyTime,
        searchRecipes,
        fetchPopular,
        loadRecipeDetail,
        clearRecipeDetail,
        clearSearch,
        toggleFavorite,
        isFavorite,
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
