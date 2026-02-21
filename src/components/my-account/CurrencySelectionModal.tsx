import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import BottomModal from "@/components/ui/BottomModal";

interface CurrencySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    draftCurrency: string;
    onSelectCurrency: (currency: string) => void;
}

const currencyOptions = [
    { label: "INR - Indian Rupee", value: "INR" },
    { label: "USD - US Dollar", value: "USD" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "GBP - British Pound", value: "GBP" },
    { label: "JPY - Japanese Yen", value: "JPY" },
    { label: "AUD - Australian Dollar", value: "AUD" },
    { label: "CAD - Canadian Dollar", value: "CAD" },
    { label: "CHF - Swiss Franc", value: "CHF" },
    { label: "CNY - Chinese Yuan", value: "CNY" },
    { label: "SGD - Singapore Dollar", value: "SGD" },
];

export default function CurrencySelectionModal({
    visible,
    onClose,
    draftCurrency,
    onSelectCurrency,
}: CurrencySelectionModalProps) {
    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title='Select Currency'
            maxHeight={0.7}
            minHeight={0.3}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                className='flex-1'
            >
                {currencyOptions.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => onSelectCurrency(option.value)}
                        className={`px-6 py-4 border-b border-muted active:bg-muted ${draftCurrency === option.value
                                ? "bg-primary/10"
                                : "bg-card"
                            }`}
                        accessibilityRole='button'
                        accessibilityLabel={`Select ${option.label}`}
                        accessibilityState={{
                            selected: draftCurrency === option.value,
                        }}
                    >
                        <View className='flex-row items-center justify-between'>
                            <View className='flex-1'>
                                <Text
                                    className={`text-base font-medium ${draftCurrency === option.value
                                            ? "text-primary"
                                            : "text-foreground"
                                        }`}
                                >
                                    {option.label}
                                </Text>
                                <Text className='text-sm text-muted-foreground mt-0.5'>
                                    {option.value}
                                </Text>
                            </View>
                            {draftCurrency === option.value && (
                                <CheckCircle2 size={20} color='#6366f1' />
                            )}
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </BottomModal>
    );
}
