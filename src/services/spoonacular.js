import axios from 'axios';
import { SPOONACULAR_API_KEY } from '../config';

const client = axios.create({
  baseURL: 'https://api.spoonacular.com',
  timeout: 15000,
  params: { apiKey: SPOONACULAR_API_KEY },
});

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

    const { data } = await client.get('/recipes/complexSearch', { params });
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
export async function getRecipeDetail(recipeId) {
  try {
    const { data } = await client.get(`/recipes/${recipeId}/information`, {
      params: { includeNutrition: true },
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
