# Context: Routes & Auth Flow

## Overview
The application uses Expo Router for file-based routing. The navigation is divided into three main states governed by `app/_layout.tsx` which acts as the root guard:
1. **Unauthenticated:** Redirected to `(auth)` group.
2. **Authenticated, Profile Incomplete:** Redirected to `/profile-setup`.
3. **Authenticated, Profile Complete:** Redirected to `(tabs)/home`.

## Root Layout (`app/_layout.tsx`)
- Loads fonts (`@expo-google-fonts/afacad`).
- Wraps the application in `AuthProvider`.
- Listens to the auth state and actively redirects the user based on authentication status and profile completeness (checking for `fullName` and `birthDate`).

## Authentication Group (`app/(auth)/`)
Handles user onboarding and login.
- `index.tsx`: Initial splash/welcome screen with options to login or sign up.
- `login.tsx`: Login screen.
- `register.tsx`: Registration screen.
- `verify-email.tsx`: OTP/Email verification screen post-registration.

## Main App Group (`app/(tabs)/`)
The core authenticated experience using Bottom Tabs.
- `home.tsx`: Dashboard / main view.
- `financing.tsx`: View related to Toyota financial services or vehicle financing.
- `vehicle-management.tsx`: Managing user's garage/vehicles.
- `profile.tsx`: User profile management.
- `notifications-tab.tsx`: Placeholder/tab for notifications.

## Other Top-Level Screens
- `profile-setup.tsx`: Mandatory step after login/registration to collect necessary user details before granting access to the main tabs.
- `notifications.tsx`: Full-screen notifications view.
