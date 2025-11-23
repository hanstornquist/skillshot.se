# SkillShot.se Project Instructions

## Architecture & Organization

- **Feature-First Structure**: Code is organized by domain in `src/features/<domain>/`.
  - Each folder contains the React component (`.jsx`) and its specific content configuration (`.json`).
  - Example: `src/features/cv/` contains `CvSection.jsx` and `cv.json`.
- **Routing**: Custom tab-based routing in `src/App.jsx`.
  - Maps JSON `id`s to components.
  - Manages URL history manually (pushState/popstate).
  - **Note**: Does not use `react-router`.
- **Content Management**:
  - Page content is strictly separated into JSON files within feature folders.
  - Shared strings/config live in `src/features/global.json`.
  - **Rule**: Modify JSON for content updates; modify JSX for layout/logic.

## UI & Styling

- **Tailwind CSS**: Used for all styling.
  - Configured for **Dark Mode** via the `selector` strategy (not system preference).
  - Custom theme variables defined in `src/index.css` (e.g., `--color-skillshot`).
- **Dark Mode Implementation**:
  - Controlled per-page via `"isDarkMode": boolean` in the feature's JSON file.
  - `App.jsx` reads this flag and toggles the `.dark` class on `document.documentElement`.
  - **Rule**: Default is light mode (`isDarkMode: false`).

## Data Conventions

- **CV/Resume Dates**: Use `startDate` and `endDate` fields (YYYY-MM format) instead of a single string.
- **Navigation**: Menu items are derived from `pageConfig` in `App.jsx` based on `showInMenu: true` in the JSON.

## Development Workflow

- **Build**: `npm run dev` (Vite).
- **Lint**: `yarn lint` (ESLint).
- **DXF Processing**: Uses `three-dxf` and `dxf-parser` in `src/features/dxf/`.
