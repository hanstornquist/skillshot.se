# skillshot.se

Marketing site for Skillshot built with React 18 and Vite. Page sections are rendered from JSON content files so the site can be tweaked without touching the JSX. The repository is configured for automated Loopia deployments via GitHub Actions.

## Local development

```bash
npm install
npm run dev
```

The dev server runs on Vite (default port 5173). Update `pages/*.json` for copy changes, `src/components/**` for layout/content blocks, and `stylesheets/*.css` for the global layout system.

## Available scripts

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the Vite dev server with hot reload. |
| `npm run build`   | Create a production build in `dist/`.      |
| `npm run preview` | Preview the production build locally.      |
| `npm run lint`    | Run ESLint on all React source files.      |

## Deployment

GitHub Actions handle both environments: [dev.skillshot.se](https://dev.skillshot.se) is updated automatically via `deploy-dev.yml`, while [www.skillshot.se](https://www.skillshot.se) is released manually via `deploy-prod.yml`. Each workflow builds the site and uploads `dist/` to Loopia over FTP. See `DEPLOYMENT.md` for required secrets/variables and detailed instructions.

## Project layout

```
root
├─ public/            # Static assets copied as-is
├─ src/
│  ├─ App.jsx        # Section compositor
│  ├─ components/    # Header/Footer + section blocks
│  └─ assets/        # Component-scoped assets
├─ pages/            # JSON content driving sections
├─ stylesheets/      # Base/layout/skeleton CSS
└─ DEPLOYMENT.md     # Workflow + FTP details
```

## Tech stack

- React 18 + Vite 5
- ESLint 9 with React & Hooks plugins
- GitHub Actions Loopia FTP deploy
