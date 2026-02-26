# LentScanner

An Orthodox Christian fasting companion app built with Expo and React Native.

## Features

- Barcode scanner with ingredient analysis using Open Food Facts
- Orthodox fasting calendar and fasting-day logic
- Recipe finder powered by Spoonacular
- Auth and sync with Supabase

## Tech Stack

- Expo SDK 54
- React Native 0.81
- expo-router
- Supabase

## Local Development

1. Install deps:
```bash
npm install
```

2. Create `.env` from `.env.example` and set any values you need.

3. Run:
```bash
npm run start
```

## Web Deploy (No App Store Needed)

This repo is configured for one-click web deploy on both Vercel and Netlify:

- `vercel.json` builds and publishes `dist`
- `netlify.toml` builds and publishes `dist`
- Both use a server-side Spoonacular proxy endpoint at `/api/spoonacular`

### Required Hosting Environment Variable

Set this in Vercel or Netlify:

- `SPOONACULAR_API_KEY` (required)

This key stays server-side and is not exposed to the browser bundle.

## Environment Variables

See `.env.example`:

- `SPOONACULAR_API_KEY`
  - Required for web deployments (server-side function)
- `EXPO_PUBLIC_SPOONACULAR_PROXY_URL`
  - Optional override, defaults to `/api/spoonacular`
- `EXPO_PUBLIC_SPOONACULAR_API_KEY`
  - Optional native fallback if you do not use the proxy for native builds

## Build Web Locally

```bash
npm run build:web
```

Output is generated in `dist/`.
