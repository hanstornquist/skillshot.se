---
applyTo: "**"
---

# Project Rules

- **Do not commit code unless explicitly instructed to do so.**

## Folder Structure

- **Feature-based Architecture**: Organize code by domain in `src/features/`.
  - Each feature folder (e.g., `src/features/cv/`) must contain its own React components and JSON configuration.
  - Example: `src/features/start/` contains `StartSection.jsx` and `start.json`.
- **Shared Components**: Place reusable UI components (Header, Footer, Buttons) in `src/components/`.
- **Global Config**: Store app-wide settings and strings in `src/features/global.json`.

## Dark Mode

- Dark mode must be disabled by default.
- Controlled via `"isDarkMode": boolean` flag in page-specific JSON files.
- Use Tailwind's `darkMode: "selector"` strategy.
- Do not rely on system preference; override it in CSS to strictly follow the class selector.

## Data Structure

- **CV/Resume**: Use `startDate` and `endDate` fields instead of a single `date` string for time ranges.
- **Menus**: Do not include dates in sidebar/navigation menu items.

## Content Management

- Centralize common text (buttons, labels, units) in `src/features/global.json`.
