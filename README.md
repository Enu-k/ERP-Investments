# Kodo Treasury Accounting Prototype

Frontend prototype for Kodo North treasury accounting sync journeys.

## Local Development

```bash
npm install
npm run dev
```

## GitHub Pages Deployment

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

To deploy:

1. Push this project to a GitHub repository.
2. In GitHub, open **Settings > Pages**.
3. Set **Build and deployment** source to **GitHub Actions**.
4. Push to the `main` branch or run the workflow manually.

The Vite base path is configured automatically for both project Pages repositories and `username.github.io` repositories.
