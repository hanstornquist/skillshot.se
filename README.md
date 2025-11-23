# Skillshot.se

A modern, React-based web application for rocketry tools and personal portfolio.

## Features

### 🚀 Ejection Charge Calculator

Calculate black powder charges for model rocket recovery systems.

- **Dual Unit Support**: Seamlessly switch between Metric (mm/bar) and Imperial (in/PSI) units.
- **Shear Pin Calculation**: Estimate burst pressure and required charge for shear pins (M2, M3, #2-56, etc.).
- **Force Calculation**: Visualize the force exerted on the bulkhead.
- **Smart Inputs**: Supports comma decimals (European style) and auto-converts values when switching units.

### 📐 DXF Optimizer

Optimize DXF files for laser cutting.

- **Duplicate Removal**: Identifies and removes stacked duplicate entities.
- **Preview**: Visual preview of the DXF file with duplicates highlighted in red.
- **Stats**: See how many entities were removed and file size reduction.

### 📄 CV & Portfolio

- **Dynamic Content**: All content is driven by JSON configuration files.
- **Responsive Design**: Mobile-first layout using Tailwind CSS.

## Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **DXF Parsing**: [dxf-parser](https://github.com/gdsestimating/dxf-parser)

## Project Structure

```
src/
├── components/         # Shared UI components (Header, Footer, BackButton)
├── features/          # Feature-based modules
│   ├── cv/            # CV page logic and content
│   ├── dxf/           # DXF Optimizer logic and content
│   ├── labs/          # Labs menu and Ejection Calculator
│   ├── start/         # Landing page
│   └── global.json    # Shared configuration (units, common text)
├── App.jsx            # Main application component and routing
└── main.jsx           # Entry point
```

## Configuration

Content is separated from code to allow easy updates without redeploying.

- **`src/features/global.json`**: Common units and UI text.
- **`src/features/labs/ejection.json`**: Configuration for the Ejection Charge Calculator (labels, presets, pin data).
- **`src/features/dxf/dxf.json`**: Configuration for the DXF Optimizer.
- **`src/features/cv/cv.json`**: CV content.

## Development

1.  **Install Dependencies**:

    ```bash
    npm install
    # or
    yarn
    ```

2.  **Start Dev Server**:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    # or
    yarn build
    ```

## Deployment

GitHub Actions handle both environments: [dev.skillshot.se](https://dev.skillshot.se) is updated automatically via `deploy-dev.yml`, while [www.skillshot.se](https://www.skillshot.se) is released manually via `deploy-prod.yml`. Each workflow builds the site and uploads `dist/` to Loopia over FTP. See [`DEPLOYMENT.md`](DEPLOYMENT.md) for required secrets/variables and detailed instructions.

## License

[MIT](LICENSE)
