/**
 * Social Media App
 * Production-ready React Native application
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import context provider
import { AppProvider } from './src/contexts';

// Import navigator
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </AppProvider>
  );
}

export default App;
