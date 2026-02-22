# Green Hope Project - Planting Trees with AI

## Overview
A React + TypeScript frontend application built with Vite. The app leverages Google's Gemini AI to optimize reforestation projects, find grants, generate content, and raise environmental awareness.

## Recent Changes
- 2026-02-21: Initial Replit setup - configured Vite for port 5000 with allowedHosts, fixed html-docx-js ESM compatibility, lazy-loaded Gemini API client, created missing index.css
- 2026-02-22: Integrated deep API testing for Portkey, Poyo, and OpenRouter with PostgreSQL storage. Updated keys and added workable model sorting.

## Project Architecture
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS (via CDN)
- **AI:** Google Gemini API (`@google/genai`)
- **Entry:** `index.html` -> `index.tsx` -> `App.tsx`
- **Components:** `components/` directory with page and UI components
- **Services:** `services/geminiService.ts` (AI), `services/dbService.ts` (data)

## Environment Variables
- `GEMINI_API_KEY`: Required for AI features (Gemini API key)

## Key Configuration
- Vite dev server runs on port 5000, host 0.0.0.0, allowedHosts: true
- Static deployment builds to `dist/`
