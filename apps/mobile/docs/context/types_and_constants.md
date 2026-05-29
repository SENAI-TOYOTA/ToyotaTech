# Context: Types & Constants

## Overview
This directory stores TypeScript interface definitions and global styling constants that maintain consistency across the app.

## Types (`types/`)
Provides TypeScript typings for domain entities and API payloads.
- `auth.ts`: Types relating to user session, login payloads, registration, and tokens.
- `profile.ts`: Types mapping to user profile data (e.g., `fullName`, `birthDate`, preferences).
*(Note: `news.ts` type definition was removed as it was obsolete).*

## Constants (`constants/`)
Global configuration files that don't change at runtime.
- `theme.ts`: The central styling hub. Exports global design tokens such as:
  - `colors`: Primary brand colors, background, text, borders.
  - `fonts`: Font family references mapping to the loaded `@expo-google-fonts/afacad` variants.
  - `spacing`: A standardized spacing scale (xs, sm, md, lg, xl, xxl).
  - `fontSize`: A standardized typography scale.
