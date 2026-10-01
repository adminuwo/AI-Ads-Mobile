# 📱 AI Ads™ Android Custom Developer Build

Custom **Expo Development Build** (`expo-dev-client`) for the **AI Ads Platform**, built with **React Native**, **Expo SDK 54**, and **TypeScript**.

This is a standalone native build with its own package name (`com.uwo.aiads`), custom splash screen, native modules, and branding—**independent of the standard Expo Go app**.

---

## 🛠️ Developer Build Options

### 🚀 Option 1: EAS Cloud Build (Recommended — No Android Studio / SDK Required)

To build a standalone development `.apk` in the cloud that you can install directly on your phone:

1. **Log in to EAS** (or create a free account if you haven't yet):
   ```powershell
   cd c:\Users\RITIK\Desktop\App_AI_ADS\mobile
   npx eas login
   ```

2. **Trigger the Development APK Build**:
   ```powershell
   npm run build:apk
   ```
   *(This executes `npx eas build -p android --profile development` based on [eas.json](file:///c:/Users/RITIK/Desktop/App_AI_ADS/mobile/eas.json))*.

3. Once complete, EAS gives you a download link and QR code. Download and install the `.apk` on your Android phone.

4. Start your local development server:
   ```powershell
   npm start
   ```
   *(Executes `expo start --dev-client`)*.

5. Open your installed **AI Ads** app on your phone—it connects directly to your local Metro server!

---

### 💻 Option 2: Local Android Build (Using Android Studio / SDK)

If you have Android Studio & Android SDK installed:

1. Start your Android Emulator or connect your physical Android phone via USB debugging.
2. Run:
   ```powershell
   cd c:\Users\RITIK\Desktop\App_AI_ADS\mobile
   npm run android
   ```
   This compiles the native project in [android/](file:///c:/Users/RITIK/Desktop/App_AI_ADS/mobile/android) using Gradle and installs the custom Developer Build app directly on your emulator/device.

3. The Metro bundler will start in `--dev-client` mode automatically.

---

### 📦 Option 3: Compile Debug APK Locally via Gradle

If you have `JAVA_HOME` and Android SDK configured:

```powershell
cd c:\Users\RITIK\Desktop\App_AI_ADS\mobile\android
.\gradlew assembleDebug
```

The APK will be generated at:
`mobile\android\app\build\outputs\apk\debug\app-debug.apk`

Transfer this `.apk` to your phone and install it.

---

## 🌐 Connecting to the Existing AI Ads Backend

The app is pre-configured to communicate with the running backend on port `5000`:

* **Android Emulator**: Uses `http://10.0.2.2:5000/api`
* **Physical Device (Same Wi-Fi)**: Uses `http://192.168.29.16:5000/api`
* **In-App Switcher**: In the app, navigate to **More → Settings & Billing → API Server Configuration** to change or test the target API URL at runtime.
