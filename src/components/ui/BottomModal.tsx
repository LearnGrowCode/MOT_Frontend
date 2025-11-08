import React from "react";
import { View, Dimensions, Pressable } from "react-native";
import Modal from "react-native-modal";
import { Card, CardHeader, CardTitle } from "./card";
import { X } from "lucide-react-native";

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
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose} // close when tapping outside
            onSwipeComplete={onClose} // close when swiped down
            swipeDirection='down' // 👇 enables swipe-down to close
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
            <View className='items-stretch'>
                <Card className='w-full rounded-t-2xl bg-white gap-4'>
                    {(title || showCloseButton) && (
                        <CardHeader className='flex-row items-center justify-between'>
                            {title && (
                                <CardTitle className='text-lg font-bold'>
                                    {title}
                                </CardTitle>
                            )}
                            {showCloseButton && (
                                <Pressable onPress={onClose} className='p-1'>
                                    <X size={24} color='#000' strokeWidth={2} />
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
                    >
                        {children}
                    </View>
                </Card>
            </View>
        </Modal>
    );
}
