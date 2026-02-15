# Social App Architecture - Folder Structure

## Overview
This document outlines the scalable folder structure for the social media application.

## Directory Structure
```
src/
├── components/                 # Reusable UI components
│   ├── common/                 # Shared components (buttons, inputs, etc.)
│   ├── posts/                  # Post-specific components
│   ├── profile/                # Profile-specific components
│   ├── chat/                   # Chat-specific components
│   └── notifications/          # Notification-specific components
├── screens/                    # View components (screens)
│   ├── auth/                   # Authentication screens
│   ├── posts/                  # Post-related screens
│   ├── profile/                # Profile screens
│   ├── chat/                   # Chat screens
│   ├── notifications/          # Notification screens
│   └── search/                 # Search screens
├── services/                   # API and external service integrations
│   ├── firebase/               # Firebase service wrapper
│   ├── api/                    # REST API service
│   └── storage/                # File storage service
├── store/                      # State management (Redux/Context)
│   ├── slices/                 # Redux slices
│   ├── context/                # Context providers
│   └── hooks/                  # Custom store hooks
├── utils/                      # Utility functions
│   ├── helpers/                # Helper functions
│   ├── validators/             # Validation utilities
│   └── constants/              # Constants and enums
├── types/                      # TypeScript type definitions
│   ├── models/                 # Data model types
│   └── dtos/                   # API DTO types
├── hooks/                      # Custom React hooks
├── navigation/                 # Navigation configuration
├── assets/                     # Static assets (images, icons, etc.)
├── config/                     # Configuration files
└── architecture/               # Architecture documentation
```

## Component Organization
Components are organized by feature domain and reusability:
- Common components: Buttons, inputs, cards used throughout the app
- Feature-specific components: Components tailored for specific features
- Screen components: Full-screen views with business logic

## Service Layer
Centralized service layer handles all external communications:
- Firebase service: Firestore, authentication, storage, messaging
- API service: Third-party integrations
- Storage service: Local storage, cache management

## State Management
Flexible state management supporting both Redux and Context patterns:
- Slices for Redux Toolkit organization
- Context providers for feature-specific state
- Custom hooks for state access