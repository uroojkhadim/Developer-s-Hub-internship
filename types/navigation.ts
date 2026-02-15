// Define the parameter list for the root stack navigator
export type RootStackParamList = {
  // Tabs
  Home: undefined;
  Explore: undefined;
  CreatePost: undefined;
  Notifications: undefined;
  Profile: { userId?: string };
  
  // Auth
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  
  // Other screens
  PostDetail: { postId: string };
  UserProfile: { userId: string };
  EditProfile: undefined;
  Settings: undefined;
};

// This allows type checking for navigation props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Navigation props for screens
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: RootStackParamList[keyof RootStackParamList]) => void;
    goBack: () => void;
  };
  route: {
    params: RootStackParamList[T];
  };
};
