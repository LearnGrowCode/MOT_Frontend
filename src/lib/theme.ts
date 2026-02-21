import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

export const THEME = {
    light: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(240 5.9% 10%)",
        card: "hsl(0 0% 100%)",
        cardForeground: "hsl(240 5.9% 10%)",
        popover: "hsl(0 0% 100%)",
        popoverForeground: "hsl(240 5.9% 10%)",
        primary: "hsl(240 5.9% 10%)",
        primaryForeground: "hsl(0 0% 98%)",
        secondary: "hsl(240 4.8% 95.9%)",
        secondaryForeground: "hsl(240 5.9% 10%)",
        muted: "hsl(240 4.8% 95.9%)",
        mutedForeground: "hsl(240 3.8% 46.1%)",
        accent: "hsl(240 4.8% 95.9%)",
        accentForeground: "hsl(240 5.9% 10%)",
        destructive: "hsl(0 84.2% 60.2%)",
        border: "hsl(240 5.9% 90%)",
        input: "hsl(240 5.9% 90%)",
        ring: "hsl(240 5.9% 10%)",
    },
    dark: {
        background: "hsl(0 0% 2%)",
        foreground: "hsl(0 0% 98%)",
        card: "hsl(0 0% 6%)",
        cardForeground: "hsl(0 0% 98%)",
        popover: "hsl(0 0% 2%)",
        popoverForeground: "hsl(0 0% 98%)",
        primary: "hsl(226 71% 66%)", // var(--primary-400)
        primaryForeground: "hsl(0 0% 0%)",
        secondary: "hsl(0 0% 10%)",
        secondaryForeground: "hsl(0 0% 98%)",
        muted: "hsl(0 0% 10%)",
        mutedForeground: "hsl(0 0% 60%)",
        accent: "hsl(45 93% 11%)", // var(--tertiary-950)
        accentForeground: "hsl(45 93% 93%)", // var(--tertiary-100)
        destructive: "hsl(0 62.8% 30.6%)",
        border: "hsl(0 0% 12%)",
        input: "hsl(0 0% 12%)",
        ring: "hsl(226 71% 66%)",
    },
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
    light: {
        ...DefaultTheme,
        colors: {
            background: THEME.light.background,
            border: THEME.light.border,
            card: THEME.light.card,
            notification: THEME.light.destructive,
            primary: THEME.light.primary,
            text: THEME.light.foreground,
        },
    },
    dark: {
        ...DarkTheme,
        colors: {
            background: THEME.dark.background,
            border: THEME.dark.border,
            card: THEME.dark.card,
            notification: THEME.dark.destructive,
            primary: THEME.dark.primary,
            text: THEME.dark.foreground,
        },
    },
};
