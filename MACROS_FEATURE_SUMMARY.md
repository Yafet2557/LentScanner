# LentScanner + Macro Tracking (Feature A: API nutrition + manual fallback)

## Goal
Combine LentScanner’s existing **barcode scanning + fasting compliance** flow with **gym-style macro tracking**. One scan should produce:
- **Fasting status** (Allowed / Avoid / Unsure) using existing fasting logic.
- **Nutrition macros** (kcal, protein, carbs, fat) pulled from **Open Food Facts**, with a **manual fallback** when missing.
- A **“Log to Today”** action that adds the food to a daily macro log.

---

## User Experience

### Scan Result (existing screen, enhanced)
After a successful scan:
1. Show product name/brand (existing).
2. Show fasting verdict + rationale (existing).
3. **NEW: Nutrition card**
   - Displays **Calories + P/C/F** per *serving* when available.
   - Falls back to **per 100g** if per-serving isn’t available.
4. **NEW: Actions**
   - **Log** → choose quantity and log to “Today”.
   - **Add macros** (only if missing/incomplete) → manual macro entry for this barcode.

### Macros Tab (new)
A new tab for tracking:
- **Today totals**: kcal / protein / carbs / fat vs goals
- Food log list for the day (entries)
- Edit/delete entries

### Settings (new section)
- **Macro goals**: set daily targets for kcal, protein, carbs, fat (simple manual inputs)

---

## Data Model (AsyncStorage-first)

### Stored Keys
- `macro_foods_by_barcode`
  - `{ [barcode]: FoodMacroProfile }`
- `macro_log_by_date`
  - `{ [YYYY-MM-DD]: MacroLogDay }`
- `macro_goals`
  - `{ kcal, protein_g, carbs_g, fat_g }`

### FoodMacroProfile
Saved once per barcode, sourced from API or manual entry.
```ts
{
  barcode: string,
  name: string,
  macros: {
    perServing?: { kcal: number, protein_g: number, carbs_g: number, fat_g: number },
    per100g?:    { kcal: number, protein_g: number, carbs_g: number, fat_g: number },
    servingSize?: { value: number, unit: string } // e.g., { value: 30, unit: "g" }
  },
  source: "openfoodfacts" | "manual",
  updatedAt: string
}
```

### MacroLogDay
All entries for a given day.
```ts
{
  date: "YYYY-MM-DD",
  entries: Array<{
    id: string,
    barcode: string,
    name: string,
    amount: number,              // e.g., 2 servings OR grams amount (see basis)
    basis: "serving" | "100g",    // which macro basis was used for calculation
    grams?: number,              // optional if supporting grams directly later
    snapshot: {                  // computed at log time (important)
      kcal: number,
      protein_g: number,
      carbs_g: number,
      fat_g: number
    },
    loggedAt: string
  }>
}
```

**Why snapshot?**  
If macro data gets corrected later (API updates or manual edits), old logs remain consistent.

---

## Core Logic

### Macro source priority
1. **Open Food Facts** nutriments → normalize into `perServing` or `per100g`
2. If missing/incomplete → **manual macro entry** saved under that barcode

### Macro calculations (logging)
- If logging by **servings**:
  - `total = perServing * amount`
- If logging using **per100g**:
  - `total = per100g * (grams / 100)`
  - If user logs “1 serving” but only per100g exists, allow user to enter serving grams, then compute.

---

## Code / Structure Changes

### 1) Open Food Facts mapping (existing service)
**File:** `src/services/openFoodFacts.js`

**Change:** Extract `nutriments` and normalize into:
```js
macros: {
  servingSize: { value, unit } | null,
  perServing: { kcal, protein_g, carbs_g, fat_g } | null,
  per100g: { kcal, protein_g, carbs_g, fat_g } | null,
  source: "openfoodfacts"
}
```
Notes:
- Prefer per-serving fields if present, otherwise rely on per-100g.
- Handle missing values safely (nulls).

---

### 2) Scan Result UI (existing screen)
**File:** `app/scan-result.js`

**Add:**
- Nutrition/macros card
- **Log** button → opens Macro Log flow
- **Add macros** button → opens manual macro entry flow when needed

---

### 3) New Macro Context
Create a new context alongside existing contexts.

**New file:** `src/contexts/MacroContext.js`
Responsibilities:
- Load/save macro profiles (`macro_foods_by_barcode`)
- Load/save daily logs (`macro_log_by_date`)
- Load/save goals (`macro_goals`)
- Helpers:
  - `getMacrosForBarcode(barcode)`
  - `saveManualMacros(barcode, data)`
  - `logFood(date, entryPayload)`
  - `getDayTotals(date)`

**Wire into providers**
**File:** `src/providers/AppProviders.js`
- Add `<MacroProvider>` wrapping the app (similar to ScanProvider/RecipeProvider).

---

### 4) New Routes / Screens (expo-router)
**New**
- `app/(tabs)/macros.js`  
  Today dashboard: totals + list
- `app/macro-log.js`  
  Quantity + basis selection, then commit log entry
- `app/macro-add.js`  
  Manual macro entry form (per-serving or per-100g)

**Optional later**
- `app/(tabs)/history.js` or `app/macro-history.js`  
  Calendar view of past daily totals

---

## Rollout Plan (Recommended Order)
1. Update Open Food Facts mapping to include normalized macros.
2. Add MacroContext + storage keys.
3. Add Macros “Today” tab with totals + list from storage.
4. Add “Log” flow from scan-result.
5. Add manual macro entry flow (fallback).
6. Add edit/delete for entries + simple goals screen.

---

## Out of Scope (Later Enhancements)
- OCR nutrition label capture
- Recipe macro totals
- External cloud sync / accounts
- Barcode database crowd-sourcing / moderation workflow
- Widgets / notifications

---

## Acceptance Criteria (MVP)
- Scanning a product shows fasting status **and** macros when available.
- If macros are missing, user can add them once and reuse on future scans.
- User can log foods to **Today**, see totals, and remove/edit entries.
- Goals can be set and displayed as progress vs totals.
