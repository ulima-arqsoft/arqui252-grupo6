import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NexusDashboardScreen } from "./src/screens/NexusDashBoardScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { useNexusController } from "./src/hooks/useNexusController";

export default function App() {
  const { state, actions } = useNexusController();

  return (
    <SafeAreaProvider>
      {state.currentUser ? (
        <NexusDashboardScreen state={state} actions={actions} />
      ) : (
        <AuthScreen 
          onLogin={actions.login} 
          onRegister={actions.register} 
        />
      )}
    </SafeAreaProvider>
  );
}
