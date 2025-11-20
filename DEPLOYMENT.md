# Deployment

## Automated Loopia deploy (GitHub Actions)

Two workflows now exist:

- `.github/workflows/deploy-dev.yml` – runs automatically to keep the test environment at [dev.skillshot.se](https://dev.skillshot.se) in sync with `main`.
- `.github/workflows/deploy-prod.yml` – manual workflow for pushing a vetted build to the public site ([www.skillshot.se](https://www.skillshot.se)).

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

### Running a prod deploy

1. In GitHub, go to the **Actions** tab.
2. Run **Deploy to Loopia (skillshot.se)** and provide commit/tag info if prompted.
3. Click **Run workflow**.

The production workflow installs dependencies, runs `npm run build` with `VITE_BASE_PATH_PROD`, and uploads `dist/` to the FTP target defined by the variables. The dev workflow performs the same steps automatically for [dev.skillshot.se](https://dev.skillshot.se) whenever its trigger conditions are met, so no manual action is required for test deployments.
