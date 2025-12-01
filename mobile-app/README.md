# Okular Mobile

A React Native/Expo mobile application based on the [KDE Okular](https://okular.kde.org) desktop application. This mobile app provides a native document viewing experience for iOS and Android devices.

## Features

- 📄 **PDF Viewing** - Open and view PDF documents with native performance
- 📱 **Native Experience** - Smooth scrolling, pinch-to-zoom, and native gestures
- 🔒 **Privacy First** - Documents are processed locally on your device
- ⚡ **Fast & Light** - Quick loading with efficient memory usage
- 🌙 **Dark Theme** - Easy on the eyes dark mode interface

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS development: macOS with Xcode
- For Android development: Android Studio with SDK

### Installation

```bash
cd mobile-app
npm install
```

### Running the App

#### Development Mode (Expo Go)

```bash
npm start
```

This will start the Expo development server. You can then:
- Scan the QR code with the Expo Go app on your phone
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator (macOS only)

#### iOS

```bash
npm run ios
```

#### Android

```bash
npm run android
```

#### Web (Preview)

```bash
npm run web
```

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
eas build:configure
```

3. Build for Android:
```bash
eas build --platform android
```

4. Build for iOS:
```bash
eas build --platform ios
```

### Local Build

For local builds, you need to eject from Expo managed workflow:

```bash
npx expo prebuild
```

Then follow the standard React Native build process for iOS and Android.

## Project Structure

```
mobile-app/
├── assets/
│   ├── icon.png           # App icon
│   ├── splash-icon.png    # Splash screen icon
│   └── adaptive-icon.png  # Android adaptive icon
├── App.js                 # Main application component
├── app.json               # Expo configuration
├── index.js               # Entry point
└── package.json           # Dependencies and scripts
```

## Technology Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tools
- **react-native-pdf** - Native PDF rendering
- **expo-document-picker** - Native file selection
- **expo-file-system** - File system access

## Supported Document Types

Currently supported:
- PDF documents (.pdf)

Planned for future releases:
- Images (JPEG, PNG, WebP, etc.)
- ePub documents
- Office documents (via conversion)

## License

This project is based on KDE Okular and follows the same open-source licensing principles.
