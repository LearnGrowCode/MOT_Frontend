import { X } from "lucide-react-native";
import React from "react";
import { Dimensions, Pressable, View } from "react-native";
import Modal from "react-native-modal";
import { useColorScheme } from "nativewind";
import { Card, CardHeader, CardTitle } from "./card";
import { SafeAreaView } from "react-native-safe-area-context";

interface BottomModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    showCloseButton?: boolean;
    children: React.ReactNode;
    maxHeight?: number; // Optional custom max height (0-1, percentage of screen height)
    minHeight?: number; // Optional custom min height (0-1, percentage of screen height)
}

export default function BottomModal({
    visible,
    onClose,
    title,
    showCloseButton = true,
    children,
    maxHeight = 0.8,
    minHeight = 0.2, // Default to 80% of screen height
}: BottomModalProps) {
    const { colorScheme } = useColorScheme();

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose} // close when tapping outside
            onSwipeComplete={onClose} // close when swiped down
            swipeDirection='down' // enables swipe-down to close
            animationIn='slideInUp'
            animationOut='slideOutDown'
            hideModalContentWhileAnimating={true}
            propagateSwipe={true}
            useNativeDriver={true} // Add this for better performance
            animationInTiming={450}
            animationOutTiming={400}
            backdropOpacity={0.5}
            backdropTransitionInTiming={450}
            backdropTransitionOutTiming={400}
            style={{
                width: "100%",
                margin: 0,
                padding: 0,
                justifyContent: "flex-end",
                backgroundColor: "transparent",
            }}
        >
            <SafeAreaView edges={["bottom"]}  className="flex-1 justify-end">
                {/* Decorative Background Elements for Dark Mode */}
                {colorScheme === "dark" && (
                    <View 
                        className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"
                        pointerEvents="none"
                    />
                )}
                <Card className='w-full rounded-[0px]  rounded-t-[32px] bg-card border-t border-x border-border/40 gap-4 border-b-0 shadow-2xl shadow-black/40'>
                    {(title || showCloseButton) && (
                        <CardHeader className='flex-row items-center justify-between  pb-2 border-b border-border/30'>
                            {title && (
                                <CardTitle className='text-2xl font-black tracking-tight text-foreground'>
                                    {title}
                                </CardTitle>
                            )}
                            {showCloseButton && (
                                <Pressable 
                                    onPress={onClose} 
                                    className='p-3 bg-secondary/50 rounded-2xl active:bg-secondary'
                                >
                                    <X size={20} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} strokeWidth={3} />
                                </Pressable>
                            )}
                        </CardHeader>
                    )}

                    <View
                        style={{
                            maxHeight:
                                Dimensions.get("window").height * maxHeight,
                            minHeight:
                                Dimensions.get("window").height * minHeight,
                        }}
                        className="pb-2 px-2"
                    >
                        {children}
                    </View>
                </Card>
            </SafeAreaView>
        </Modal>
    );
}
