# Okular Web

A web-based document viewer based on the [KDE Okular](https://okular.kde.org) desktop application. This web app allows you to view PDF documents directly in your browser with a mobile-friendly interface.

## Features

- 📄 **PDF Viewing** - Open and view PDF documents with full support for text selection and annotations
- 📱 **Mobile Friendly** - Responsive design that works great on phones and tablets
- 🔒 **Privacy First** - Documents are processed locally and never uploaded to a server
- ⚡ **Fast & Light** - Quick loading with client-side PDF rendering using PDF.js

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

```bash
cd web-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deploying to Netlify

This app is configured for easy deployment to Netlify.

### Option 1: Deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Option 2: Deploy via Git

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Set the following build settings:
   - **Base directory**: `web-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `web-app/dist`
6. Click "Deploy"

### Option 3: Drag and Drop

1. Run `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the browser

## Project Structure

```
web-app/
├── public/
│   └── okular-icon.svg    # App icon
├── src/
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── netlify.toml           # Netlify configuration
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies and scripts
```

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool
- **react-pdf** - PDF rendering with PDF.js
- **CSS** - Custom responsive styling

## License

This project is based on KDE Okular and follows the same open-source licensing principles.
