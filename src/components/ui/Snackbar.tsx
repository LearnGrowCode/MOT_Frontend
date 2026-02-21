import React, { useEffect, useRef, useCallback } from "react";
import { Animated, Text, View, StyleSheet, Pressable } from "react-native";
import { CheckCircle2, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SnackbarProps {
    visible: boolean;
    message: string;
    onDismiss: () => void;
    duration?: number;
}

export default function Snackbar({
    visible,
    message,
    onDismiss,
    duration = 3000,
}: SnackbarProps) {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    const hideSnackbar = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (visible) onDismiss();
        });
    }, [visible, onDismiss, translateY, opacity]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (visible) {
            // Slide up and fade in
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss
            timer = setTimeout(() => {
                hideSnackbar();
            }, duration);
        } else {
            hideSnackbar();
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [visible, duration, hideSnackbar, translateY, opacity]);

    return (
        <Animated.View
            pointerEvents={visible ? "box-none" : "none"}
            style={[
                styles.container,
                {
                    bottom: Math.max(insets.bottom + 80, 80), // Keep above tab bar
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View className="flex-row items-center justify-between bg-card border border-border/40 shadow-xl shadow-black/20 rounded-2xl px-4 py-3 mx-4">
                <View className="flex-row items-center flex-1 pr-4 gap-3">
                    <CheckCircle2 size={20} className="text-success-500" />
                    <Text className="text-foreground font-medium text-sm flex-1">
                        {message}
                    </Text>
                </View>
                <Pressable onPress={hideSnackbar} className="p-1">
                    <X size={18} className="text-muted-foreground" />
                </Pressable>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 9999,
    },
});
