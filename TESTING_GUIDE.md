# Testing Guide: iOS Simulator vs Physical Device

## ⚠️ Important: Expo Go Limitations

**TL;DR:** You CANNOT use Expo Go to test this app on a physical device because we're using custom native modules.

---

## Why Expo Go Doesn't Work

Our app uses these native features:
- 📸 **Camera access** (`expo-image-picker` with camera)
- 🖼️ **Photo library** (`expo-image-picker`)
- 📍 **Location services** (`expo-location`)
- 🎨 **Custom native UI** (gesture handlers, reanimated)

**Expo Go is limited** to a pre-built set of native modules and cannot run apps with custom native code or configurations.

---

## ✅ Option 1: iOS Simulator (Recommended for Development)

**Pros:**
- ✅ Full feature support
- ✅ Fast iteration
- ✅ Easy debugging
- ✅ No device needed

**How to run:**
```bash
npx expo run:ios
```

This will:
1. Build the native iOS app with all custom modules
2. Install it on the simulator
3. Open the app automatically

**When to use:** During development, testing features, debugging

---

## ✅ Option 2: Development Build on Physical Device

If you need to test on your iPhone 13, you must create a **development build**.

**Steps:**

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure EAS
```bash
eas build:configure
```

### 3. Create Development Build
```bash
eas build --profile development --platform ios
```

### 4. Install on Your iPhone
- Download the `.ipa` file from Expo dashboard
- Install using TestFlight or direct installation

**When to use:** 
- Testing device-specific features (haptics, notifications)
- Final QA before production
- Testing on actual hardware

---

## ✅ Option 3: Production Build (Future)

For App Store submission:
```bash
eas build --profile production --platform ios
```

---

## Current Recommendation

**For now, use the iOS Simulator!**

Run:
```bash
npx expo run:ios
```

The simulator has all features working:
- ✅ Camera (simulated)
- ✅ Photo library (you can drag images)
- ✅ Location (you can set custom locations)
- ✅ All UI features

Once you're ready for production testing on actual device, we can create a development build.
