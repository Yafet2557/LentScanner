# LentScanner
A mobile app that helps Orthodox Christians during the 55-day Lenten fast by scanning product barcodes to check fasting compliance, and suggesting recipes based on available ingredients.
## Tech Stack
* **Framework**: React Native with Expo (cross-platform, built-in barcode scanning via `expo-camera`)
* **Language**: TypeScript
* **Navigation**: Expo Router (file-based routing)
* **Product Data**: Open Food Facts API (free, open-source product database with ingredient lists)
* **Recipe Data**: Spoonacular API (search recipes by ingredients, filter by vegan/dietary restrictions)
* **State Management**: React Context (lightweight, sufficient for this scope)
* **Styling**: React Native StyleSheet (no extra dependencies needed)
## Core Features
### 1. Barcode Scanner
* Use `expo-camera` to scan barcodes (EAN-13, UPC-A, etc.)
* Look up scanned barcode via Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}`)
* Display product name, image, and ingredients
### 2. Fasting Compliance Engine
The core logic that determines whether a product is Lent-safe. Checks the product's ingredient list against a list of non-fasting (animal-derived) keywords:
* **Meat**: beef, chicken, pork, lamb, turkey, veal, etc.
* **Dairy**: milk, cheese, butter, cream, whey, casein, lactose, yogurt
* **Eggs**: egg, albumin, ovum, lysozyme
* **Fish/Seafood**: fish, shrimp, anchovy, sardine (Great Lent restricts these except specific feast days)
* **Other animal-derived**: gelatin, honey, lard, tallow, beeswax, carmine, shellac
Returns a clear result: **Fasting-Safe**, **Not Fasting-Safe** (with flagged ingredients highlighted), or **Unknown** (if ingredients are unavailable).
Note: Some ingredients like "natural flavors" are ambiguous — these should be flagged as warnings rather than hard fails.
### 3. Recipe Finder
* User inputs ingredients they have on hand
* Queries Spoonacular API with those ingredients + vegan diet filter
* Displays matching recipes with title, image, cook time, and a link to full instructions
## Screen Structure
* **Home** — Two main actions: "Scan Product" and "Find Recipes"
* **Scanner** — Camera view with barcode overlay
* **Scan Result** — Shows product info + fasting compliance verdict (green/red/yellow)
* **Recipe Finder** — Ingredient input (add/remove chips) + search button
* **Recipe Results** — List of matching recipes
* **Recipe Detail** — Full recipe view
## Project Structure
```warp-runnable-command
LentScanner/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Home screen
│   ├── scanner.tsx         # Barcode scanner screen
│   ├── scan-result.tsx     # Product result screen
│   ├── recipes.tsx         # Recipe finder screen
│   └── recipe-detail.tsx   # Single recipe view
├── src/
│   ├── components/         # Reusable UI components
│   ├── services/
│   │   ├── openFoodFacts.ts    # Open Food Facts API client
│   │   ├── spoonacular.ts      # Spoonacular API client
│   │   └── fastingChecker.ts   # Compliance logic
│   ├── constants/
│   │   └── nonFastingIngredients.ts  # Keyword lists
│   ├── types/              # TypeScript interfaces
│   └── context/            # React Context providers
├── assets/                 # Images, fonts
├── app.json                # Expo config
├── tsconfig.json
└── package.json
```
## API Keys Needed
* **Open Food Facts**: No key required (free, open API)
* **Spoonacular**: Free tier provides 150 requests/day — requires signup at spoonacular.com/food-api
## Implementation Order
1. Scaffold Expo project + install dependencies
2. Build Home screen with navigation
3. Implement barcode scanner screen
4. Build Open Food Facts API client + fasting compliance checker
5. Build Scan Result screen (wired to real data)
6. Build Recipe Finder screen + Spoonacular integration
7. Build Recipe Detail screen
8. Polish UI, add error/loading states, edge cases
