import React from 'react';
import { PreferencesProvider } from "@/context/PreferencesContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { PortalHost } from "@rn-primitives/portal";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <SafeAreaProvider>
        <KeyboardProvider>
          {children}
          <PortalHost name="root" />
        </KeyboardProvider>
      </SafeAreaProvider>
    </PreferencesProvider>
  );
}
