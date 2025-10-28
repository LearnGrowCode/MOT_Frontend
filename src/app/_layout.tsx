import { Stack } from "expo-router";
import "../global.css";
import { ThemeProvider } from "@react-navigation/native";
import { NAV_THEME } from "../lib/theme";
import { useColorScheme } from "react-native";
import { PortalHost } from "@rn-primitives/portal";
import { KeyboardProvider } from "react-native-keyboard-controller";
export default function RootLayout() {
    const colorScheme = useColorScheme();
    return (
        <ThemeProvider value={NAV_THEME[colorScheme as "light" | "dark"]}>
            <KeyboardProvider>
                <Stack />

                <PortalHost name='root' />
            </KeyboardProvider>
        </ThemeProvider>
    );
}
