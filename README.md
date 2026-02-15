# Connectify - Social Media App

A premium, production-ready React Native social media application with modern features and best practices. Built with TypeScript, Firebase, and a clean architecture.

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.73.0-61DAFB?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-764ABC?style=for-the-badge&logo=redux" alt="Redux Toolkit" />
</p>

## 🚀 Key Features

### 📱 Core Social Features
- **User Authentication**: Secure login/signup with Firebase Authentication
- **Profile Management**: Complete profile setup with avatar upload
- **Post Creation**: Create, edit, and delete posts with images
- **Social Feed**: Real-time post feed with like/comment functionality
- **Follow System**: Follow/unfollow users with relationship tracking
- **Real-time Chat**: One-to-one messaging with Firebase Firestore
- **Search Functionality**: Search users and posts with debounced queries
- **Notifications**: Real-time notifications for likes, comments, and follows

### 🎨 UI/UX Excellence
- **Premium Design**: Modern, minimal interface inspired by Instagram/Threads
- **Dark/Light Mode**: Full theme support with seamless switching
- **Responsive Design**: Adapts to different screen sizes and devices
- **Smooth Animations**: Native animations for 60 FPS performance
- **Gradient UI**: Beautiful blue-to-purple gradient theme
- **Reusable Components**: Consistent, accessible UI component library

### ⚡ Performance & Architecture
- **TypeScript**: Full type safety throughout the application
- **Redux Toolkit**: Predictable state management with RTK Query
- **React Navigation v6**: Type-safe navigation with deep linking
- **Firebase Integration**: Real-time database, authentication, and storage
- **Performance Optimized**: FlatList virtualization, memoization, and lazy loading
- **Code Quality**: ESLint, Prettier, and comprehensive testing setup

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (Button, Input, Card)
│   ├── layout/          # Layout components (Header, BottomNav)
│   ├── specific/        # Feature-specific components (PostItem, ChatMessage)
│   └── modals/          # Modal components (EditPostModal, ImagePicker)
├── screens/
│   ├── auth/           # Authentication flow (Login, Signup, ForgotPassword)
│   ├── home/           # Main feed and dashboard
│   ├── profile/        # User profiles and settings
│   ├── posts/          # Post creation and viewing
│   ├── chat/           # Messaging system
│   ├── search/         # Search functionality
│   ├── notifications/  # Notification center
│   └── settings/       # App settings and preferences
├── navigation/          # Navigation configuration and types
├── services/            # External services (Firebase, API)
├── store/               # Redux state management (slices, thunks)
├── hooks/               # Custom React hooks (useTheme, useDebounce)
├── utils/               # Utility functions and helpers
├── theme/               # Design system (colors, typography, spacing)
├── assets/              # Static assets (images, icons, fonts)
├── docs/                # Documentation and guides
└── config/              # Configuration files (Firebase, environment)
```

## 🛠️ Tech Stack

### Core Technologies
- **React Native 0.73.0** - Mobile app framework
- **TypeScript 5.0** - Type safety and developer experience
- **React Navigation v6** - Type-safe navigation
- **Redux Toolkit** - State management

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - File storage
- **Firebase Cloud Messaging** - Push notifications

### Development Tools
- **ESLint & Prettier** - Code quality and formatting
- **Jest** - Testing framework
- **React Native Testing Library** - Component testing
- **Metro Bundler** - JavaScript bundler

### UI & Design
- **React Native Vector Icons** - Icon library
- **React Native SVG** - SVG support
- **Date-fns** - Date formatting utilities
- **Formik & Yup** - Form handling and validation

## 📱 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn** package manager
- **React Native CLI** globally installed
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - Mac only)
- **Firebase Account** for backend services

### Environment Setup

1. **Clone and Install Dependencies**:
```bash
# Clone the repository
git clone https://github.com/your-username/connectify.git
cd connectify

# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..
```

2. **Firebase Configuration**:
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Authentication, Firestore, and Storage
- Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- Place files in respective directories:
  - Android: `android/app/google-services.json`
  - iOS: `ios/GoogleService-Info.plist`

3. **Environment Variables**:
Create a `.env` file in the root directory:
```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123

# Development Settings
API_BASE_URL=https://your-api.com
ENVIRONMENT=development
```

### Running the Application

#### Development Mode

**Start Metro Bundler**:
```bash
# Terminal 1: Start the development server
npm start

# Or use specific scripts
npm run start:android  # Start with Android support
npm run start:ios      # Start with iOS support
```

**Run on Device/Emulator**:

**Android**:
```bash
# Terminal 2: Run on Android
npm run android

# Or with specific options
npx react-native run-android --variant=debug
```

**iOS** (Mac only):
```bash
# Terminal 2: Run on iOS
npm run ios

# Or with specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

#### Production Build

**Android APK**:
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Android App Bundle** (for Play Store):
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app.aab
```

**iOS** (Mac only):
```bash
# Open in Xcode
cd ios
xed .
# Then Archive from Xcode menu
```

### Running the App

#### Android

```bash
npm run android
```

#### iOS

```bash
npm run ios
```

#### Start Metro Bundler

```bash
npm start
```

## 🔧 Development Workflow

### Code Quality & Standards

```bash
# Linting
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors automatically

# Formatting
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without changes

# Type Checking
npm run type-check    # TypeScript type checking
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test files
npm test -- src/components/Button.test.tsx

# Coverage report
npm test -- --coverage

# Snapshot testing
npm test -- -u  # Update snapshots
```

### Development Tools

```bash
# Start development server
npm start

# Clear Metro cache
npm start -- --reset-cache

# Run on specific platform
npm run android
npm run ios

# Debugging
npm run devtools     # Open React DevTools
```

### Build & Deployment

```bash
# Development builds
npm run build:android:dev
npm run build:ios:dev

# Production builds
npm run build:android:prod
npm run build:ios:prod

# Generate app icons
npm run generate-icons

# Bundle analysis
npm run analyze-bundle
```

## 🎨 Design System

### Theme Structure

The app uses a comprehensive design system with light/dark mode support:

```typescript
// Theme usage
import { useTheme } from './src/hooks/useTheme';

const MyComponent = () => {
  const { colors, typography, spacing, isDarkMode } = useTheme();
  
  return (
    <View style={{
      backgroundColor: colors.background,
      padding: spacing.lg,
    }}>
      <Text style={{
        color: colors.text.primary,
        fontSize: typography.h2.fontSize,
        fontWeight: typography.h2.fontWeight,
      }}>
        Hello World
      </Text>
    </View>
  );
};
```

### Color Palette

**Light Theme**:
- Primary: `#4A90E2` (Blue)
- Secondary: `#9B59B6` (Purple)
- Background: `#FFFFFF`
- Text: `#1A1A1A`

**Dark Theme**:
- Primary: `#6BB5FF`
- Secondary: `#B886CD`
- Background: `#000000`
- Text: `#FFFFFF`

### Component Library

**Common Components**:
- `Button` - Primary, secondary, outline, and ghost variants
- `Input` - Form inputs with validation and icons
- `Card` - Elevated containers with rounded corners
- `Avatar` - User profile images with fallbacks
- `Badge` - Notification indicators

**Layout Components**:
- `Header` - Navigation headers with back buttons
- `BottomNav` - Tab navigation
- `Container` - Responsive layout containers

**Custom Components**:
- `PostItem` - Social media post display
- `ChatMessage` - Messaging interface
- `UserCard` - Profile preview cards
- `SearchBar` - Debounced search input

## 📱 Core Features Implementation

### Authentication System

```typescript
// Firebase Authentication with Formik/Yup
import { useAuth } from './src/hooks/useAuth';

const LoginScreen = () => {
  const { login, loading } = useAuth();
  
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      // Navigate to home screen
    } catch (error) {
      // Handle authentication errors
    }
  };
};
```

### Real-time Feed

```typescript
// Firestore real-time updates
import { useRealtimePosts } from './src/hooks/useRealtimePosts';

const FeedScreen = () => {
  const { posts, loading, error } = useRealtimePosts(20);
  
  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostItem post={item} />}
      keyExtractor={item => item.id}
      onRefresh={refreshFeed}
      refreshing={loading}
    />
  );
};
```

### Chat System

```typescript
// Real-time messaging
import { useRealtimeChat } from './src/hooks/useRealtimeChat';

const ChatScreen = ({ route }) => {
  const { messages, sendMessage } = useRealtimeChat(route.params.chatId);
  
  const handleSend = (text: string) => {
    sendMessage(text);
  };
};
```

### Search Functionality

```typescript
// Debounced search with Firestore
import { useSearch } from './src/hooks/useSearch';

const SearchScreen = () => {
  const { results, loading, search } = useSearch();
  
  const handleSearch = useDebounce((query: string) => {
    search(query);
  }, 500);
};
```

## 🗃️ Architecture & State Management

### Redux Toolkit Implementation

```typescript
// Modern Redux with RTK
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

// Async thunk with proper typing
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const posts = await postService.getUserPosts(userId);
      return posts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Typed hooks
const dispatch = useDispatch<AppDispatch>();
const { posts, loading } = useSelector(selectUserPosts);
```

### State Structure

```
store/
├── slices/
│   ├── authSlice.ts      # Authentication state
│   ├── postsSlice.ts     # Posts and feed data
│   ├── chatSlice.ts      # Chat messages and conversations
│   └── userSlice.ts      # User profile and settings
├── helpers/
│   ├── selectors.ts      # Memoized state selectors
│   └── thunks.ts         # Reusable async operations
└── index.ts             # Store configuration
```

### Context API Integration

```typescript
// Authentication context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Posts context
import { PostsProvider, usePosts } from './src/contexts/PostsContext';

// Combined providers
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <PostsProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </PostsProvider>
  </AuthProvider>
);
```

## 🔌 Services & API Integration

### Firebase Services

```typescript
// Authentication Service
import authService from './src/services/authService';

const handleLogin = async () => {
  const user = await authService.signInWithEmail(email, password);
  // Handle successful login
};

// Firestore Service
import postService from './src/services/postService';

const createPost = async (content: string, imageUrl?: string) => {
  const post = await postService.createPost({ content, imageUrl });
  return post;
};

// Real-time Listeners
const unsubscribe = postService.subscribeToPosts(
  (posts: Post[]) => setPosts(posts),
  (error: Error) => console.error(error)
);
```

### Service Structure

```
services/
├── firebase/
│   ├── auth.ts          # Authentication service
│   ├── firestore.ts     # Database operations
│   └── storage.ts       # File storage
├── api/
│   ├── client.ts        # HTTP client with interceptors
│   ├── authApi.ts       # Authentication endpoints
│   └── postsApi.ts      # Posts endpoints
└── index.ts            # Service exports
```

### Custom Hooks

```typescript
// Real-time data hooks
import { useRealtimePosts, useRealtimeLikes } from './src/hooks/useRealtimeData';

// Authentication hooks
import { useAuth, useUser } from './src/hooks/useAuth';

// Theme and UI hooks
import { useTheme, useDebounce } from './src/hooks/useUI';
```

## 🏗️ Architecture & Best Practices

### Project Structure Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
2. **Feature-based Organization**: Related files grouped by feature rather than type
3. **Single Responsibility**: Each component/file has one clear purpose
4. **Reusability**: Components designed for reuse across the application
5. **Scalability**: Architecture supports growth without major refactoring

### Performance Optimizations

```typescript
// Memoization patterns
const MemoizedComponent = React.memo(({ data }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.data.id === nextProps.data.id;
});

// FlatList optimizations
<FlatList
  data={posts}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={11}
  removeClippedSubviews={true}
  getItemLayout={getItemLayout}
/>
```

### Security Best Practices

- **Input Validation**: Formik with Yup schema validation
- **Secure Storage**: React Native Keychain for sensitive data
- **Authentication**: Firebase Authentication with proper session management
- **Data Protection**: Firestore security rules implementation
- **Error Handling**: Comprehensive error boundaries and logging

### Testing Strategy

```typescript
// Component testing
import { render, fireEvent } from '@testing-library/react-native';

// Redux testing
import { store } from './src/store';

// Service testing
import { mockFirebase } from './src/__mocks__/firebase';
```

### Documentation

- **Inline Comments**: Clear, purposeful code comments
- **TypeScript Definitions**: Comprehensive type safety
- **API Documentation**: Clear service interfaces
- **Architecture Guides**: System design documentation

## 📱 Screenshots & Demo

<p align="center">
  <img src="./screenshots/login.png" width="200" alt="Login Screen" />
  <img src="./screenshots/feed.png" width="200" alt="Feed Screen" />
  <img src="./screenshots/profile.png" width="200" alt="Profile Screen" />
  <img src="./screenshots/chat.png" width="200" alt="Chat Screen" />
</p>

## 🤝 Contributing

### Development Process

1. **Fork and Clone**:
```bash
git clone https://github.com/your-username/connectify.git
cd connectify
```

2. **Create Feature Branch**:
```bash
git checkout -b feature/amazing-feature
```

3. **Development Workflow**:
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on device/emulator
npm run android  # or npm run ios

# Run tests
npm test

# Check code quality
npm run lint
npm run format
```

4. **Code Standards**:
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

5. **Pull Request Process**:
- Ensure all tests pass
- Update README if needed
- Add screenshots for UI changes
- Request code review

### Code Style Guidelines

- **Naming**: Use descriptive, consistent naming
- **Components**: Follow React best practices
- **State**: Prefer hooks over class components
- **Types**: Use TypeScript interfaces and types
- **Comments**: Explain why, not what

## 🚀 Deployment

### Production Build Process

1. **Environment Setup**:
```bash
# Set production environment variables
NODE_ENV=production
API_BASE_URL=https://api.production.com
```

2. **Build Commands**:
```bash
# Android production build
npm run build:android:prod

# iOS production build
npm run build:ios:prod
```

3. **App Store Submission**:
- **Google Play**: Upload AAB file to Play Console
- **App Store**: Archive and upload via Xcode

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Lint code
        run: npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Technologies & Libraries
- [React Native](https://reactnative.dev/) - Mobile framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React Navigation](https://reactnavigation.org/) - Navigation solution
- [TypeScript](https://www.typescriptlang.org/) - Type safety

### Design Inspiration
- Instagram - Social media UI patterns
- Threads - Minimal, modern design
- Material Design - Component design principles

### Contributors
- **John Doe** - Lead Developer
- **Jane Smith** - UI/UX Designer
- **Mike Johnson** - Backend Engineer

### Support

For support, email support@connectify.app or join our [Discord community](https://discord.gg/connectify).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Native team for the amazing framework
- Redux Toolkit for state management
- React Navigation for navigation solutions
