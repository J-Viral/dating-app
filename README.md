# DesiDates - Dating App Authentication

A high-fidelity authentication system for a dating mobile app with stunning glassmorphism UI, built with React Native, Expo, and Supabase.

## 🎨 Features

- **Glassmorphism UI**: Frosted glass effects with blur backgrounds, subtle borders, and soft glowing shadows
- **Vibrant Gradient**: Deep Purple to Sunset Orange gradient background
- **Supabase Authentication**: Sign up and login with email/password
- **Username Metadata**: Custom username stored in user metadata
- **Session Management**: Auto-login on app restart with session persistence
- **Haptic Feedback**: Touch feedback for enhanced mobile experience
- **TypeScript**: Full type safety throughout the application

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account and project

### 1. Install Dependencies

```bash
cd DesiDates
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Create a `.env` file (use `.env.example` as template):

```bash
cp .env.example .env
```

5. Edit `.env` and add your credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Alternatively, you can directly edit `src/config/supabase.ts` and replace the placeholder values.

### 3. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📱 Usage

### Sign Up
1. Toggle to "Sign Up" mode
2. Enter username, email, and password (min 6 characters)
3. Press "Create Account"
4. Check your email for verification link

### Login
1. Toggle to "Login" mode
2. Enter email and password
3. Press "Login"
4. Welcome screen appears with your username

### Logout
1. Press "Logout" button on welcome screen
2. Returns to authentication screen

## 🏗️ Project Structure

```
DesiDates/
├── App.tsx                      # Main app with gradient background & auth state
├── src/
│   ├── components/
│   │   ├── AuthContainer.tsx    # Sign up/login toggle container
│   │   ├── GlassInput.tsx       # Glass-styled input component
│   │   └── WelcomeView.tsx      # Welcome screen after login
│   ├── config/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── constants/
│   │   └── theme.ts             # Colors, typography, spacing
│   ├── styles/
│   │   └── glassmorphism.ts     # Reusable glass styles
│   └── types/
│       └── auth.ts              # TypeScript interfaces
├── package.json
├── tsconfig.json
└── app.json
```

## 🎨 Design System

### Color Palette
- **Gradient Start**: `#6B46C1` (Deep Purple)
- **Gradient Middle**: `#9333EA` (Rich Purple)
- **Gradient End**: `#F97316` (Sunset Orange)
- **Glass Background**: `rgba(255, 255, 255, 0.1)`
- **Glass Border**: `rgba(255, 255, 255, 0.2)`

### Glassmorphism Effects
- **Blur Intensity**: 10px
- **Border Width**: 1px
- **Soft Glow Shadow**: Orange with 12px radius

## 🔧 Tech Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform with managed workflow
- **TypeScript**: Type-safe development
- **Supabase**: Backend and authentication
- **expo-blur**: Frosted glass blur effects
- **expo-linear-gradient**: Vibrant gradient backgrounds
- **expo-haptics**: Touch feedback

## 📝 Next Steps

- [ ] Add password reset functionality
- [ ] Implement email verification flow
- [ ] Add social auth providers (Google, Apple)
- [ ] Build main dating app features
- [ ] Add profile photo upload
- [ ] Implement push notifications

## 🤝 Contributing

This is a personal project for DesiDates. For questions or issues, please contact the development team.

## 📄 License

Private - All rights reserved.
