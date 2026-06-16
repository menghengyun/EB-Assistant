# Typhon Deal Checker — Chrome Extension

A modern, offline-first Chrome Extension for machinery sales price comparison. Built with React, TypeScript, Tailwind CSS, and Vite.

## Features

* **Two-Column Analysis**: Build your price on the left, compare customer offers on the right.
* **Smart Autocomplete**: Fast SKU searching with real-time price lookups.
* **Deal Analysis**: Automatic calculation of margins, differences, and "Accept/Reject" recommendations.
* **Color Coded**: Instant visual feedback (Green/Yellow/Red) based on offer acceptability.
* **Summary Copy**: One-click professional summary for internal sales communication.
* **Fully Offline**: Works without internet using local SKU data.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```

## Building for Chrome

1. Build the project:
   ```bash
   npm run build
   ```
2. The production-ready extension will be in the `dist/` folder.

## Install in Chrome

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `dist/` folder.

## Folder Structure

* `src/data/skus.json`: Local SKU database.
* `src/components/`: Reusable React components.
* `src/App.tsx`: Main application logic.
* `public/`: Static assets (icons, manifest.json).
# EB-Assistant
