# LentScanner — Project Summary
_Last updated: February 2026_

---

## What This App Is

LentScanner is an Orthodox Christian fasting companion app built in **Expo + React Native (JavaScript)**. It has two core features:

1. **Barcode Scanner** — scan any product to instantly check if it's safe to eat during Orthodox Christian fasting periods.
2. **Recipe Finder** — browse and search for Lenten-compliant (vegan) recipes with filters.

The app was originally built in Flutter/Dart. This Expo version is a full rebuild for easier testing and App Store deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK ~54, React Native 0.81.5, React 19.1.0 |
| Navigation | expo-router (file-based, Stack + Tabs) |
| Camera / Scanning | expo-camera CameraView |
| HTTP | axios |
| Local Persistence | @react-native-async-storage/async-storage |
| Icons | @expo/vector-icons (Ionicons) — no emojis anywhere |
| State Management | React Context (ScanContext, RecipeContext) |
| External APIs | Open Food Facts (free), Spoonacular (API key required) |
| Architecture | React Native New Architecture enabled (`newArchEnabled: true`) |

---

## Project Structure

```
LentScanner-expo/
├── app/
│   ├── _layout.js                  # Root layout — providers, onboarding redirect, Stack config
│   ├── onboarding.js               # First-launch 2-page swipeable intro
│   ├── scan-result.js              # Product scan result (verdict, flagged ingredients)
│   ├── (tabs)/
│   │   ├── _layout.js              # Bottom tab bar (Home, Scan, Recipes)
│   │   ├── index.js                # Home screen (dashboard)
│   │   ├── scanner.js              # Camera barcode scanner
│   │   └── recipes.js              # Recipe browser + search
│   └── recipe-detail/
│       └── [id].js                 # Dynamic recipe detail screen
├── src/
│   ├── constants/
│   │   ├── theme.js                # Colors, typography
│   │   └── nonFastingIngredients.js # Full keyword blocklist for fasting check
│   ├── utils/
│   │   ├── lentDates.js            # Orthodox Pascha calculator (Meeus Julian algorithm)
│   │   └── fastingCalendar.js      # Year-round Orthodox fasting calendar engine
│   ├── services/
│   │   ├── openFoodFacts.js        # Open Food Facts API wrapper
│   │   ├── fastingChecker.js       # Ingredient text analysis (word-boundary regex)
│   │   └── spoonacular.js          # Spoonacular recipe API wrapper
│   ├── context/
│   │   ├── ScanContext.js          # Global scan state + history persistence
│   │   └── RecipeContext.js        # Global recipe state + favorites persistence
│   └── components/
│       ├── VerdictBanner.js        # Safe/NotSafe/Caution verdict banner
│       ├── LentCountdown.js        # Gold card showing Lent day or countdown
│       ├── FastingRuleCard.js      # Today's fasting rule card
│       ├── RecipeCard.js           # Recipe card with image, nutrition pills, heart
│       ├── SkeletonCard.js         # Animated loading placeholder
│       ├── IngredientChip.js       # Removable/colored ingredient chips
│       └── ScanHistoryTile.js      # Compact scan history tile (defined, available)
├── src/config.js                   # (gitignored) Spoonacular API key
├── src/config.example.js           # Template for config.js
├── app.json                        # Expo app config
└── package.json
```

---

## Feature Inventory

### Home Screen (`app/(tabs)/index.js`)
- **Greeting** — time-aware ("Good morning/afternoon/evening") + formatted date
- **Today's Fasting Rule** — `FastingRuleCard` showing today's fasting level with color, icon, description, and reason
- **Lent Countdown** — `LentCountdown` gold card: shows current day (e.g., "Day 23 of 55") or countdown to next Lent
- **Scan Stats** — three stat cards (Total Scanned, Safe, Flagged) derived from local history
- **Daily Tip** — rotating fasting education tip (22 tips, cycles by day of year)
- **Recipe of the Day** — one featured recipe (seeded by day, pulled from favorites or popular)
- **Recent Scans** — last 5 scans as a vertical list, tappable to re-run and view result
- **Pull-to-refresh** — reloads scan history

### Scanner (`app/(tabs)/scanner.js`)
- Full-screen `CameraView` with back/rear facing
- Torch (flashlight) toggle with Ionicon
- Scan overlay: semi-transparent dimming + gold frame + corner accents
- `processingRef` prevents double-scanning
- Supported formats: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39
- Permission handling: loading / denied / granted states
- "Looking up product..." overlay during API call

### Scan Result (`app/scan-result.js`)
- `VerdictBanner` — large colored banner (green/red/amber) with Ionicon
- Product image + name + barcode
- Non-fasting ingredients listed as colored `IngredientChip` by category
- Ambiguous ingredients section with explanatory note
- Full ingredient text block
- "Find Lenten Recipes" button (only shown when safe)
- "Scan Another Product" button

### Recipe Finder (`app/(tabs)/recipes.js`)
- **Browse Mode** — default view:
  - Favorites horizontal scroll (if any saved)
  - Category chips: Popular, Quick, High Protein, Soups, Desserts, Breakfast
  - Skeleton loading cards during fetch
  - `RecipeCard` results
- **Search Mode** — toggled via header button:
  - Ingredient input + chip list with "Clear all"
  - High Protein toggle (>20g)
  - Meal type dropdown (Any / Breakfast / Lunch / Dinner / Snack)
  - Cook time dropdown (Any / <15min / <30min / <1hr)
  - "Search Recipes" button, disabled during loading
  - Results with count header ("X Lenten Recipes Found")

### Recipe Detail (`app/recipe-detail/[id].js`)
- Hero image (260px tall, full width)
- Back button overlay on hero image
- Cook time + servings meta badges
- Nutrition grid: Calories, Protein, Carbs, Fat
- Ingredients list with gold bullet icons
- Numbered instruction steps with gold circle counters

### Onboarding (`app/onboarding.js`)
- 2-page horizontal swipe (FlatList, pagingEnabled)
- Page 1: Scan Products, Page 2: Find Lenten Recipes
- Dot indicators (active dot is wider, gold)
- Skip / Next / Get Started buttons
- Sets `has_seen_onboarding` in AsyncStorage on completion — never shown again

---

## Key Logic

### Fasting Check (ingredient analysis)
File: `src/services/fastingChecker.js`
- Input: raw ingredient text string from Open Food Facts
- Uses word-boundary regex (`\b...\b`) to avoid false positives (e.g. "butter" won't match "butternut squash")
- Categories checked: `meat`, `dairy`, `eggs`, `fish`, `otherAnimal`
- Ambiguous list: `natural flavors`, `lecithin`, `glycerin`, `l-cysteine`, etc.
- Output: `{ verdict: 'safe' | 'notSafe' | 'caution', flaggedIngredients, ambiguousIngredients }`

### Orthodox Pascha Calculator
File: `src/utils/lentDates.js`
- Implements the Meeus Julian algorithm
- Applies the 13-day Julian-to-Gregorian offset (valid for 1900-2099)
- Exports: `getPascha(year)`, `getLentStart`, `getLentEnd`, `getCurrentLentDay`, `daysUntilNextLent`, `getNextPascha`

### Year-Round Fasting Calendar
File: `src/utils/fastingCalendar.js`
- Covers all four major fasting periods: Great Lent, Apostles' Fast, Dormition Fast, Nativity Fast
- Handles fast-free weeks (Bright Week, Trinity Week, Christmastide, Publican & Pharisee week)
- Special feast days: Annunciation, Palm Sunday, Lazarus Saturday (relaxed), Theophany Eve, Beheading of St. John, Elevation of the Cross (strict)
- Regular Wednesday/Friday fasts
- 4 fasting levels: Strict → Oil & Wine → Fish Allowed → No Fast
- Returns rule with label, description, icon, color, and reason text

---

## Data Persistence (AsyncStorage)

| Key | Contents | Max |
|---|---|---|
| `scan_history` | Array of `{ barcode, productName, verdict, scannedAt }` | 20 entries |
| `favorite_recipes` | Array of full recipe objects | Unlimited |
| `has_seen_onboarding` | `'true'` string | N/A |

---

## Design System

**Dark theme throughout:**
- Background: `#121212`, Surface: `#1E1E1E`, Surface Light: `#2A2A2A`
- Primary accent: Gold `#D4A843`
- Safe: `#4CAF50` (green), Not Safe: `#EF5350` (red), Caution: `#FFC107` (amber)
- Category colors: Meat (red), Dairy (blue), Eggs (orange), Fish (cyan), Other (purple), Ambiguous (amber)

**No emojis anywhere** — all icons are Ionicons from `@expo/vector-icons`.

---

## Git History

```
7145e45  style: replace all emojis with Ionicons
878ccc6  feat: add recipe browsing, favorites, onboarding, pull-to-refresh, skeletons
046ad55  style: use Ionicons for tab bar, adjust tab height
e8b0ff0  feat: add bottom tab navigation
1260c10  feat: add recipe finder and recipe detail screens
428191b  feat: add barcode scanner and fasting checker
c96ec13  Initial commit
```

---

## What Still Needs Doing (Before App Store)

### Improvements / Polish
- [ ] App icon (1024x1024 PNG) and splash screen asset
- [ ] More onboarding pages (fasting calendar feature, etc.)
- [ ] Settings screen (denomination, notification prefs)
- [ ] Push notifications for fasting day reminders
- [ ] Haptic feedback on scan success
- [ ] Share button on scan result and recipe detail
- [ ] Offline handling / better error states
- [ ] Empty state illustrations on Recipes/Home

### App Store Requirements
- [ ] `eas.json` — EAS Build configuration
- [ ] App icon set (auto-generated from 1024px master via EAS)
- [ ] Screenshots for App Store (6.7" iPhone minimum)
- [ ] Privacy policy URL (required — app stores scan history locally)
- [ ] App Store description, keywords, category
- [ ] Apple Developer account ($99/yr) or Google Play ($25 one-time)
- [ ] Final version bump in `app.json` (version + buildNumber/versionCode)

### Known Limitations
- Spoonacular free tier has 150 requests/day — will need a paid plan for production
- Open Food Facts coverage varies by region; some barcodes may return no product
- Fasting calendar is based on Greek Orthodox tradition; some rules differ by jurisdiction
