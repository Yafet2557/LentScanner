# LentScanner

An Orthodox Christian fasting companion app built with Expo and React Native.

Scan any product barcode to instantly check if it's safe to eat during Orthodox fasting periods. Browse and search Lenten-compliant recipes with filters.

---

## Features

- **Barcode Scanner** — scans EAN/UPC barcodes and looks up ingredients via Open Food Facts. Flags meat, dairy, eggs, fish, and ambiguous ingredients using word-boundary regex to avoid false positives.
- **Fasting Calendar** — full year-round Orthodox fasting engine covering Great Lent, Apostles' Fast, Dormition Fast, and Nativity Fast. Handles fast-free weeks, feast day relaxations, and Wednesday/Friday fasts.
- **Recipe Finder** — search Lenten-compliant recipes by ingredient, meal type, cook time, and protein content via Spoonacular.
- **Scan History** — last 20 scans stored locally with safe/flagged stats on the home screen.
- **Favorites** — save recipes for quick access.
- **Onboarding** — two-page swipeable intro shown on first launch.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK ~54, React Native 0.81.5 |
| Navigation | expo-router (file-based Stack + Tabs) |
| Auth & Sync | Supabase (email/password auth, cloud sync) |
| Camera | expo-camera CameraView |
| Icons | Ionicons via @expo/vector-icons |
| Local Storage | AsyncStorage |
| Secure Storage | expo-secure-store (auth session) |
| APIs | Open Food Facts (free), Spoonacular (API key required) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone, or an iOS/Android simulator

### Install

```bash
git clone https://github.com/Yafet2557/LentScanner.git
cd LentScanner
npm install
```

### Config

Create `src/config.js` (gitignored):

```js
export const SPOONACULAR_API_KEY = 'your_key_here';
```

Get a free Spoonacular key at [spoonacular.com/food-api](https://spoonacular.com/food-api).

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the following SQL in the Supabase SQL Editor:

```sql
create table scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  barcode text not null,
  product_name text,
  verdict text not null,
  scanned_at timestamptz not null
);

create table favorite_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  recipe_id integer not null,
  recipe_data jsonb not null,
  created_at timestamptz default now()
);

alter table scan_history enable row level security;
alter table favorite_recipes enable row level security;

create policy "Users see own scans" on scan_history
  for all using (auth.uid() = user_id);

create policy "Users see own favorites" on favorite_recipes
  for all using (auth.uid() = user_id);
```

3. Update `src/lib/supabase.js` with your project URL and anon key.

### Run

```bash
npx expo start
```

---

## Project Structure

```
app/
├── _layout.js              # Root layout, providers, auth gate
├── onboarding.js           # First-launch intro
├── auth.js                 # Login / sign up screen
├── scan-result.js          # Product scan result screen
├── (tabs)/
│   ├── index.js            # Home dashboard
│   ├── scanner.js          # Barcode scanner
│   └── recipes.js          # Recipe browser
└── recipe-detail/[id].js   # Recipe detail screen

src/
├── lib/supabase.js         # Supabase client
├── context/
│   ├── AuthContext.js      # Auth state (user, signIn, signOut)
│   ├── ScanContext.js      # Scan state + history (local + cloud)
│   └── RecipeContext.js    # Recipe state + favorites (local + cloud)
├── services/
│   ├── fastingChecker.js   # Ingredient analysis
│   ├── openFoodFacts.js    # Open Food Facts API
│   └── spoonacular.js      # Spoonacular API
├── utils/
│   ├── lentDates.js        # Orthodox Pascha calculator (Meeus algorithm)
│   └── fastingCalendar.js  # Year-round fasting calendar engine
└── constants/
    ├── theme.js
    └── nonFastingIngredients.js
```

---

## Fasting Logic

Ingredient analysis uses word-boundary regex (`\b...\b`) to prevent false positives — "butternut squash" will not flag "butter", "eggplant" will not flag "egg".

The Orthodox Pascha date is calculated using the **Meeus Julian algorithm** with a 13-day Julian-to-Gregorian calendar offset, valid for 1900–2099.

---

## Known Limitations

- Spoonacular free tier has 150 requests/day
- Open Food Facts coverage varies by region; some barcodes may return no data
- Fasting rules follow Greek Orthodox tradition; some rules differ by jurisdiction
