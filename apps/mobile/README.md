# TeamUp Mobile App

A React Native mobile application built with Expo and Expo Router for the TeamUp platform.

## Features

### Authentication
- **Login Screen** - Sign in with email and password
- **Signup Screen** - Create a new account with email, password, and name

### Main Screens
- **TeamUps List** - Browse and search for available TeamUps
- **TeamUp Details** - View detailed information about a TeamUp and join/leave
- **My TeamUps** - View TeamUps you've created or joined
- **Profile** - View and manage your profile and settings
- **Create TeamUp** - Create a new TeamUp activity

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication routes
│   │   ├── _layout.tsx    # Auth layout
│   │   ├── login.tsx      # Login screen
│   │   └── signup.tsx     # Signup screen
│   ├── (tabs)/            # Main tab navigation
│   │   ├── _layout.tsx    # Tab layout
│   │   ├── index.tsx      # TeamUps list screen
│   │   ├── my-teamups.tsx # My TeamUps screen
│   │   ├── profile.tsx    # Profile screen
│   │   ├── new-teamup.tsx # Create TeamUp screen
│   │   └── teamup/
│   │       └── [id].tsx   # TeamUp details screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── Button.tsx         # Custom button component
│   ├── Card.tsx           # Card container component
│   ├── Input.tsx          # Text input component
│   └── TeamUpCard.tsx     # TeamUp list item component
├── constants/             # App constants
│   └── Colors.ts          # Color palette
└── lib/                   # Utilities and hooks
    ├── api/               # API client (to be implemented)
    └── hooks/             # Custom React hooks (to be implemented)
```

## Components

### Button
A customizable button component with multiple variants and sizes.
- Variants: `primary`, `secondary`, `outline`
- Sizes: `small`, `medium`, `large`
- Loading state support

### Input
A text input component with label and error message support.
- Customizable styles
- Error state handling
- Support for all TextInput props

### Card
A container component with consistent styling for content cards.

### TeamUpCard
A specialized card component for displaying TeamUp information in lists.

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

```bash
# Navigate to mobile app directory
cd apps/mobile

# Install dependencies
pnpm install
```

### Running the App

```bash
# Start the Expo development server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on web
pnpm web
```

## Next Steps

### To Complete the Implementation:

1. **API Integration**
   - Connect to the backend API
   - Implement actual authentication flow
   - Add data fetching hooks using the API client

2. **State Management**
   - Add context providers for auth state
   - Implement user session management
   - Add optimistic updates for better UX

3. **Additional Features**
   - Date/time picker for TeamUp scheduling
   - Venue selection and maps integration
   - Push notifications
   - Image upload for profiles and TeamUps
   - Real-time updates

4. **Styling Enhancements**
   - Add animations and transitions
   - Implement skeleton loaders
   - Add error boundaries

5. **Testing**
   - Unit tests for components
   - Integration tests for screens
   - E2E tests with Detox

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based routing
- **TypeScript** - Type safety
- **@expo/vector-icons** - Icon library

## Color Palette

The app uses a consistent color palette defined in `constants/Colors.ts`:
- Primary: Blue shades (#3b82f6)
- Gray: Neutral tones
- Success: Green shades
- Error: Red shades
- Warning: Orange shades
