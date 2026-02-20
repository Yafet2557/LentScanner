import { allNonFasting, ambiguousKeywords } from '../constants/nonFastingIngredients';

/**
 * Word-boundary matching to avoid false positives.
 * e.g. "butter" matches "sugar, butter, flour" but NOT "butternut squash".
 */
function containsIngredient(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
  return pattern.test(text);
}

/**
 * Check an ingredient string for Lent compliance.
 *
 * Returns:
 *   { verdict: 'safe'|'notSafe'|'caution', flaggedIngredients, ambiguousIngredients }
 *
 * - SAFE: no flagged or ambiguous ingredients
 * - NOT SAFE: animal-derived ingredients found
 * - CAUTION: only ambiguous ingredients, or no ingredient text available
 */
export function check(ingredientsText) {
  if (!ingredientsText || ingredientsText.trim() === '') {
    return {
      verdict: 'caution',
      flaggedIngredients: [],
      ambiguousIngredients: [],
    };
  }

  const normalized = ingredientsText.toLowerCase();

  // Check for non-fasting (animal-derived) ingredients
  const flagged = [];
  for (const [keyword, category] of Object.entries(allNonFasting)) {
    if (containsIngredient(normalized, keyword)) {
      flagged.push({ keyword, category });
    }
  }

  // Check for ambiguous ingredients
  const ambiguous = [];
  for (const keyword of ambiguousKeywords) {
    if (containsIngredient(normalized, keyword)) {
      ambiguous.push(keyword);
    }
  }

  if (flagged.length > 0) {
    return { verdict: 'notSafe', flaggedIngredients: flagged, ambiguousIngredients: ambiguous };
  }
  if (ambiguous.length > 0) {
    return { verdict: 'caution', flaggedIngredients: [], ambiguousIngredients: ambiguous };
  }
  return { verdict: 'safe', flaggedIngredients: [], ambiguousIngredients: [] };
}
