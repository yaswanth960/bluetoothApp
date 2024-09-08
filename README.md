
## DummyApp

DummyApp is a React Native application that allows users to scan for Bluetooth devices, connect to them, read their battery levels, and synchronize data with Firestore. It also handles offline storage using EncryptedStorage and syncs with the cloud once an internet connection is restored. This project is configured with a CI/CD pipeline using GitHub Actions.

## Features
Scan for nearby Bluetooth devices.
Connect and disconnect Bluetooth devices.
Read and display battery levels of connected devices.
Synchronize data with Firestore when online.
- Store data locally using SQLite when offline and sync once online.
- Performance optimization with batch rendering to avoid unnecessary re-renders.
- Automated testing with Jest.

## Before running the project, ensure you have the following installed:

Node.js and npm
React Native CLI
Android Studio / Xcode
Firebase account with Firestore enabled
GitHub account with GitHub Actions enabled
Setup
Clone the Repository
bash
Copy code
git clone https://github.com/your-username/DummyApp.git
cd DummyApp
Install Dependencies
bash
Copy code
npm install
Set Up Firebase
Create a Firebase project in the Firebase Console.
Enable Firestore in your Firebase project.
Download the google-services.json file for Android and GoogleService-Info.plist for iOS.
Place google-services.json in android/app/ and GoogleService-Info.plist in ios/.
Permissions
Ensure the necessary permissions for Bluetooth and Location are granted:

Android: Permissions are requested in the app for Bluetooth and Location. Ensure your AndroidManifest.xml is correctly configured.
iOS: Ensure Bluetooth and Location permissions are added to your Info.plist.
Running the Application
For Android:

bash
Copy code
npx react-native run-android
For iOS:

bash
Copy code
npx react-native run-ios
## Usage
Open the app on your device.
Click on "Scan Bluetooth Devices" to search for nearby devices.
Connect to a device by selecting it from the list.
View the battery level of the connected device.
Disconnect the device if needed.
The app will automatically sync with Firestore when an internet connection is available.
CI/CD Pipeline with GitHub Actions
The project is configured with a CI/CD pipeline using GitHub Actions. The pipeline automatically builds the project on each push to the main branch and on pull requests.

## Workflow Configuration
The workflow is defined in .github/workflows/ci.yml:

yaml
Copy code
name: DummyApp

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4.1.7

      - name: Setup Java JDK
        uses: actions/setup-java@v4.2.2
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Build with Gradle
        run: ./gradlew build

      - name: Upload a Build Artifact
        uses: actions/upload-artifact@v3.2.0-node20
        with:
          name: DummyApp.apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
## This workflow does the following:

## Checks out the code from the repository.
Sets up Java JDK 11.
Builds the project using Gradle.
Uploads the APK as a build artifact.
Troubleshooting
If you encounter issues, consider the following:

Ensure all dependencies are installed correctly.
Verify that the correct permissions are granted on your device.
Check the logs in the console for error messages.
