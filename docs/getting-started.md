# Getting Started with Human Counter AI

This guide will walk you through setting up the **Human Counter AI** mobile application for development.

## Prerequisites
- **Node.js**: Version 18 or newer
- **Expo Go App**: Download on your [iOS](https://apps.apple.com/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) device.
- **Physical Device**: Camera-related features are best tested on real hardware.

## Installation
1.  **Clone the Repo**:
    ```bash
    git clone <your-repo-url>
    cd r12
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```

## Running the App
1.  **Start Expo**:
    ```bash
    npx expo start
    ```
2.  **Connect Device**:
    Scan the QR code in the terminal using your phone's camera (iOS) or the Expo Go app (Android).

## Camera Permissions
The app automatically requests camera access upon launch. If you deny it, you must manually enable it in your device's System Settings under:
- **Settings** > **Human Counter AI** > **Camera** (iOS)
- **Settings** > **Apps** > **Human Counter AI** > **Permissions** > **Camera** (Android)

## Exporting Reports
- Tap **"Finalise Scan"** to view the report.
- Tap **"Export PDF"** or **"Share PNG"** to open the native share sheet. 
- You can save to Files, Photos, or send via WhatsApp/Slack.
