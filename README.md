# LentScanner

An Orthodox Christian fasting companion app built with Expo and React Native.

---

## Why I Built This

I fast during Lent and eat fully vegan for the duration. Every time I picked up something at the store I'd have to flip it over, read through a wall of ingredients, and try to figure out if it was safe — it was tedious and easy to get wrong.

I was inspired by calorie tracking apps like MyFitnessPal where you just scan a barcode and instantly get all the information you need. I wanted that same experience but for fasting: scan something, get a clear green or red.

The other reason is my family. Some of them aren't fluent in English, so reading ingredient labels to determine what's fasting-safe is genuinely difficult for them. A barcode scan that gives a simple verdict removes that barrier entirely.

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
