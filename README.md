# Aviator Predictor

A mobile application that predicts when the next Aviator game flight will occur and how long it will fly. This app connects to real Aviator game data API to provide accurate predictions.

## Features

- Real-time API integration with Aviator game data
- Predict the next flight time based on historical patterns
- Estimate flight duration using actual game data
- View countdown to next flight
- Track prediction history
- Fallback prediction when API is unavailable
- Modern, user-friendly interface

## Installation

1. Make sure you have Node.js and npm installed
2. Clone this repository
3. Install dependencies:

```bash
npm install
```

## Running the App in Development Mode

```bash
npm start
```

This will start the Expo development server. You can then:

- Run on an Android device/emulator: Press `a` in the terminal or scan the QR code with the Expo Go app
- Run on an iOS device/simulator: Press `i` in the terminal or scan the QR code with the Camera app
- Run on the web: Press `w` in the terminal

## Building an APK for Android

To build an APK that you can install directly on your Android device, follow these steps:

1. Make sure you have installed the EAS CLI:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account (create one if you don't have it):

```bash
eas login
```

3. Configure the build:

```bash
eas build:configure
```

4. Build the APK:

```bash
eas build -p android --profile preview
```

5. Follow the prompts in the terminal. When the build is complete, you'll receive a URL to download the APK.

## Installing the APK on Your Android Device

1. Download the APK from the URL provided after the build completes
2. Transfer the APK to your Android device (via email, cloud storage, USB, etc.)
3. On your Android device, navigate to the APK file and tap on it
4. If prompted, enable installation from unknown sources in your device settings
5. Follow the on-screen instructions to install the app

## How to Use

1. Open the app
2. The app will automatically connect to the Aviator game API and display predictions
3. Press the "Predict Next Flight" button to manually refresh predictions
4. The app will display:
   - The predicted time of the next flight
   - A countdown to the next flight
   - The estimated duration of the flight
5. Previous predictions are stored in the history section with their source (API or Fallback)
6. If the API connection fails, the app will automatically use a fallback prediction method

## Technical Details

This app is built with:

- React Native
- Expo
- JavaScript/ES6+
- Axios for API requests
- EAS Build for APK generation

## Disclaimer

This app provides predictions for entertainment purposes only. While the app attempts to use real Aviator game data, predictions may not be accurate and should not be used for gambling decisions. The app includes a fallback prediction mechanism that uses random values when the API is unavailable.