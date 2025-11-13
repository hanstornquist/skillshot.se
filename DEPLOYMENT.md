# Deployment

## Automated Loopia deploy (GitHub Actions)

Two workflows now exist:

- `.github/workflows/deploy-dev.yml` – manual deploy to the dev site (e.g., `dev.skillshot.se`).
- `.github/workflows/deploy-prod.yml` – manual deploy to the production site (`skillshot.se`).

### Required repo variables

Set these under **Settings → Variables → Actions**:

- `FTP_HOST` – FTP hostname (shared by both deployments).
- `FTP_PATH_DEV` – remote directory for the dev site.
- `FTP_PATH_PROD` – remote directory for the prod site.
- `VITE_BASE_PATH_DEV` – optional base path for dev build (defaults to `/`).
- `VITE_BASE_PATH_PROD` – optional base path for prod build (defaults to `/`).

### Required repo secrets

Set under **Settings → Secrets → Actions**:

- `FTP_USERNAME`
- `FTP_PASSWORD`

### Running a deploy

1. In GitHub, go to the **Actions** tab.
2. Choose either **Deploy to Loopia (dev.skillshot.se)** or **Deploy to Loopia (skillshot.se)**.
3. Click **Run workflow**.

Each workflow installs dependencies, runs `npm run build` with the corresponding `VITE_BASE_PATH`, and uploads `dist/` to the FTP target defined by the variables.
