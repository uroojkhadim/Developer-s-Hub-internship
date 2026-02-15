import { NavigationProp } from '@react-navigation/native';
// import type { User } from 'firebase/auth'; // Reserved for future use

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  ProfileSetup: undefined;
  UserProfile: { userId: string };
  ChatList: undefined;
  ChatRoom: {
    chatId: string;
    receiverId: string;
    receiverName: string;
    receiverAvatar: string | null;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Create: undefined;
  Chat: undefined;
  Profile: undefined;
  Settings: undefined;
  Search: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileSetup: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  ProfileSetup: undefined;
};

export type AppNavigationProp = NavigationProp<RootStackParamList>;

export type ProfileNavigationProp = NavigationProp<ProfileStackParamList>;
