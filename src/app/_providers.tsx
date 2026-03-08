import React, { useEffect } from 'react';
import { PreferencesProvider } from "@/shared/hooks/PreferencesContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { PortalHost } from "@rn-primitives/portal";
import * as Notifications from "expo-notifications";
export default function AppProviders({ children }: { children: React.ReactNode }) {
useEffect(()=>{
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
},[])
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
