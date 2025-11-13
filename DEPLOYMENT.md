# Deployment

## Automated Loopia deploy (GitHub Actions)

1. Add repository secrets with your Loopia FTP details:
   - `FTP_HOST` – the FTP server hostname (for example `ftp.loopia.se`)
   - `FTP_USERNAME` – the FTP username
   - `FTP_PASSWORD` – the FTP password
   - `FTP_PATH` – remote directory where the site should be published (for example `/httpdocs/`)
   - Optional: `VITE_BASE_PATH` if the site should live in a subfolder instead of the root (`/`)
2. Push to `main` (or trigger the **Deploy to Loopia** workflow manually). The workflow will:
   - install dependencies
   - run `npm run build` with `VITE_BASE_PATH` from secrets (defaults to `/`)
   - upload everything from `dist/` to Loopia via FTP

If you need different credentials for staging/production, duplicate the workflow and point each one at the relevant set of secrets and remote directories.
