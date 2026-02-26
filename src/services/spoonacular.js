import axios from 'axios';
import { Platform } from 'react-native';

const DIRECT_BASE_URL = 'https://api.spoonacular.com';
const PROXY_BASE_URL =
  process.env.EXPO_PUBLIC_SPOONACULAR_PROXY_URL || '/api/spoonacular';
const DIRECT_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || null;

const shouldUseProxy =
  Platform.OS === 'web' || Boolean(process.env.EXPO_PUBLIC_SPOONACULAR_PROXY_URL);

const directClient = axios.create({
  baseURL: DIRECT_BASE_URL,
  timeout: 15000,
});

const proxyClient = axios.create({
  baseURL: PROXY_BASE_URL,
  timeout: 15000,
});

async function spoonacularGet(endpoint, params = {}) {
  if (shouldUseProxy) {
    const { data } = await proxyClient.get('', { params: { endpoint, ...params } });
    return data;
  }

  if (!DIRECT_API_KEY) {
    throw new Error(
      'Missing EXPO_PUBLIC_SPOONACULAR_API_KEY. Set it for native builds or configure EXPO_PUBLIC_SPOONACULAR_PROXY_URL.'
    );
  }

  const { data } = await directClient.get(endpoint, {
    params: { ...params, apiKey: DIRECT_API_KEY },
  });
  return data;
}

/**
 * Helper to find a nutrient's amount by name from the nutrients array.
 */
function findNutrient(nutrients, name) {
  if (!nutrients) return null;
  const match = nutrients.find((n) => n.name === name);
  return match ? match.amount : null;
}

/**
 * Search for Lenten (vegan) recipes by ingredients with optional filters.
 *
 * Returns array of:
 *   { id, title, imageUrl, readyInMinutes, proteinGrams, calories }
 */
export async function searchRecipes({
  ingredients,
  highProtein = false,
  mealType = null,
  maxReadyTime = null,
}) {
  try {
    const params = {
      includeIngredients: ingredients.join(','),
      diet: 'vegan',
      addRecipeNutrition: true,
      number: 10,
    };

    if (highProtein) params.minProtein = 20;
    if (mealType) params.type = mealType;
    if (maxReadyTime) params.maxReadyTime = maxReadyTime;

    const data = await spoonacularGet('/recipes/complexSearch', params);
    const results = data.results || [];

    return results.map((item) => {
      const nutrients = item.nutrition?.nutrients;
      return {
        id: item.id,
        title: item.title,
        imageUrl: item.image || null,
        readyInMinutes: item.readyInMinutes || null,
        proteinGrams: findNutrient(nutrients, 'Protein'),
        calories: findNutrient(nutrients, 'Calories'),
      };
    });
  } catch (error) {
    throw new Error(`Failed to search recipes: ${error.message}`);
  }
}

/**
 * Get full recipe details by ID (includes instructions + full nutrition).
 *
 * Returns:
 *   { id, title, imageUrl, readyInMinutes, servings,
 *     proteinGrams, carbsGrams, fatGrams, calories,
 *     ingredients, instructions }
 */
/**
 * Fetch popular vegan recipes (shown on first load of Recipes tab).
 */
export async function getPopularRecipes() {
  try {
    const data = await spoonacularGet('/recipes/complexSearch', {
      diet: 'vegan',
      sort: 'popularity',
      addRecipeNutrition: true,
      number: 8,
    });
    const results = data.results || [];
    return results.map((item) => {
      const nutrients = item.nutrition?.nutrients;
      return {
        id: item.id,
        title: item.title,
        imageUrl: item.image || null,
        readyInMinutes: item.readyInMinutes || null,
        proteinGrams: findNutrient(nutrients, 'Protein'),
        calories: findNutrient(nutrients, 'Calories'),
      };
    });
  } catch (error) {
    throw new Error(`Failed to fetch popular recipes: ${error.message}`);
  }
}

/**
 * Fetch recipes by category (meal type or tag).
 */
export async function getRecipesByCategory(category) {
  try {
    const params = {
      diet: 'vegan',
      addRecipeNutrition: true,
      number: 8,
    };

    // Map category names to Spoonacular params
    if (category === 'high-protein') {
      params.minProtein = 20;
      params.sort = 'protein';
      params.sortDirection = 'desc';
    } else if (category === 'quick') {
      params.maxReadyTime = 20;
      params.sort = 'time';
    } else {
      params.type = category;
      params.sort = 'popularity';
    }

    const data = await spoonacularGet('/recipes/complexSearch', params);
    const results = data.results || [];
    return results.map((item) => {
      const nutrients = item.nutrition?.nutrients;
      return {
        id: item.id,
        title: item.title,
        imageUrl: item.image || null,
        readyInMinutes: item.readyInMinutes || null,
        proteinGrams: findNutrient(nutrients, 'Protein'),
        calories: findNutrient(nutrients, 'Calories'),
      };
    });
  } catch (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
}

export async function getRecipeDetail(recipeId) {
  try {
    const data = await spoonacularGet(`/recipes/${recipeId}/information`, {
      includeNutrition: true,
    });

    const nutrients = data.nutrition?.nutrients;

    const ingredients = (data.extendedIngredients || []).map(
      (item) => item.original
    );

    const instructions = (data.analyzedInstructions || [])
      .flatMap((group) => group.steps || [])
      .map((step) => step.step);

    return {
      id: data.id,
      title: data.title,
      imageUrl: data.image || null,
      readyInMinutes: data.readyInMinutes || null,
      servings: data.servings || null,
      proteinGrams: findNutrient(nutrients, 'Protein'),
      carbsGrams: findNutrient(nutrients, 'Carbohydrates'),
      fatGrams: findNutrient(nutrients, 'Fat'),
      calories: findNutrient(nutrients, 'Calories'),
      ingredients,
      instructions,
    };
  } catch (error) {
    throw new Error(`Failed to fetch recipe detail: ${error.message}`);
  }
}
