# Next Development Phase

## Current Status ✓
- ✅ App successfully builds and runs
- ✅ Navigation structure complete
- ✅ All services created (Profile, Match, Chat, Trust, Subscription, Safety)
- ✅ 4 main screens built (Discovery, Matches, Conversations, Profile)
- ⚠️ Database needs to be created in Supabase (see SETUP_DATABASE.md)

---

## Phase 1: Complete Core User Flow (NEXT)

### Priority 1: User Onboarding ⭐
**Why:** Users can't create profiles yet after signup

**Screens to build:**
1. **Welcome splash** - Brief intro to the app
2. **Profile setup** - Name, DOB, Gender
3. **Photo upload** - At least 2 photos required
4. **Bio & interests** - About me and interests tags
5. **Location permissions** - Request location access
6. **Preferences** - Looking for, age range, distance

**Files to create:**
- `src/screens/onboarding/WelcomeScreen.tsx`
- `src/screens/onboarding/ProfileSetupScreen.tsx`
- `src/screens/onboarding/PhotoUploadScreen.tsx`
- `src/screens/onboarding/BioInterestsScreen.tsx`
- `src/screens/onboarding/LocationScreen.tsx`
- `src/screens/onboarding/PreferencesScreen.tsx`

**Estimated time:** 3-4 hours

---

### Priority 2: Chat Room Screen ⭐
**Why:** Users can see matches but can't actually chat

**Screen to build:**
- `src/screens/ChatRoomScreen.tsx`

**Features:**
- Message input with send button
- Message bubbles (left for received, right for sent)
- Real-time message updates
- Timestamp display
- "Typing..." indicator
- Auto-scroll to latest message

**Estimated time:** 2 hours

---

### Priority 3: Edit Profile Screen
**Why:** Users need to update their profile after creation

**Screen to build:**
- `src/screens/EditProfileScreen.tsx`

**Features:**
- Edit all profile fields
- Add/remove photos
- Update bio and interests
- Save button with validation

**Estimated time:** 2 hours

---

### Priority 4: Settings Screen
**Why:** User preferences and account management

**Screen to build:**
- `src/screens/SettingsScreen.tsx`

**Features:**
- Discovery preferences (age, distance, gender)
- Privacy settings (incognito mode)
- Notification preferences
- Account actions (logout, delete account)

**Estimated time:** 1-2 hours

---

## Phase 2: Trust & Verification (After Phase 1)

### Verification Screens
1. **Phone verification** - OTP input
2. **Photo verification** - Selfie for liveness check
3. **Email verification** - Send verification email
4. **Social linking** - Connect Facebook/Instagram

**Files to create:**
- `src/screens/verification/PhoneVerificationScreen.tsx`
- `src/screens/verification/PhotoVerificationScreen.tsx`
- `src/screens/verification/EmailVerificationScreen.tsx`
- `src/screens/verification/SocialLinkingScreen.tsx`

---

## Phase 3: Enhanced Features (Optional for MVP)

### Nice-to-have features:
- Advanced filters (Pro feature)
- Profile boost functionality
- Video calling
- Media sharing in chat (photos/videos)
- Push notifications
- Voice messages

---

## Potential Errors to Fix Now

### 1. Missing Export in Screens ✓
All screens need `export default` - already done!

### 2. Storage Bucket Not Created
**Fix:** Create `profile-photos` bucket in Supabase Storage (see SETUP_DATABASE.md)

### 3. Location Permissions
**Will need:** Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We use your location to find matches nearby"
      }
    }
  }
}
```

### 4. Image Picker Permissions
**Will need:** Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "We need access to your photos to set up your dating profile",
        "NSCameraUsageDescription": "We need access to your camera to take profile photos"
      }
    }
  }
}
```

---

## Development Workflow

### Daily workflow:
1. Start Metro: `npx expo start --clear`
2. Run on iOS: `npx expo run:ios` (or press `i` in Metro)
3. Make changes → Auto-reloads
4. Test features
5. Commit code

### Quick commands:
- **Reload app:** Press `r` in Metro terminal
- **Clear cache:** `npx expo start --clear`
- **Rebuild native:** `npx expo run:ios`

---

## Let's Start Phase 1!

Ready to begin? Let's build the **Onboarding Flow** first since it's blocking users from creating profiles.

Say "start onboarding" and I'll begin building all 6 onboarding screens!
