import { Stack } from "expo-router";
import "../global.css";
import { ThemeProvider } from "@react-navigation/native";
import { NAV_THEME } from "../lib/theme";
import { useColorScheme } from "react-native";
import { PortalHost } from "@rn-primitives/portal";
export default function RootLayout() {
    const colorScheme = useColorScheme();
    return (
        <ThemeProvider value={NAV_THEME[colorScheme as "light" | "dark"]}>
            <Stack />
            
            <PortalHost name='root' />
        </ThemeProvider>
    );
}
