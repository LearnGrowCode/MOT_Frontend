import { useUserCurrency } from "@/hooks/useUserCurrency";
import { BaseBookRecord } from "@/type/interface";
import { formatAmountInput, getAmountInWords } from "@/utils/utils";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Banknote } from "lucide-react-native";
import RecordInfoCard from "../common/RecordInfoCard";
import Input from "../form/Input";
import BottomModal from "@/components/ui/BottomModal";

type TransactionType = "collection" | "payment";

interface TransactionConfirmationProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (amount: number, personName: string) => void;
    record: BaseBookRecord | null;
    type: TransactionType;
}

export default function TransactionConfirmation({
    visible,
    onClose,
    onConfirm,
    record,
    type,
}: TransactionConfirmationProps) {
    const [amount, setAmount] = useState("");
    const personName = record?.name || "";
    const { currency } = useUserCurrency();
    const { colorScheme } = useColorScheme();

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
    };

    const handleConfirm = () => {
        const parsedAmount = parseFloat(amount) || 0;
        onConfirm(parsedAmount, personName);
        setAmount("");
        onClose();
    };

    const isCollection = type === "collection";
    const variant = isCollection ? "green" : "blue";
    const title = isCollection
        ? "Collection Confirmation"
        : "Payment Confirmation";

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title={title}
        >
            <View className='gap-8 py-6 px-4'>
                {/* Record Brief Info */}
                <RecordInfoCard record={record} variant={variant} />

                {/* Enter Amount */}
                <View>
                    <View className="flex-row items-center gap-2 mb-3 ml-1">
                        <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                            <Banknote size={16} color={colorScheme === "dark" ? "white" : "black"} strokeWidth={3}/>
                        </View>
                        <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-1'>
                            Confirm Amount
                        </Text>
                    </View>
                    <Input
                        placeholder='0'
                        value={amount}
                        onChangeText={(value) =>
                            setAmount(formatAmount(value))
                        }
                        maxLength={12}
                        autoFocus
                        keyboardType='numeric'
                        className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-xl text-center font-black'
                    />
                    <Text className='mt-2 text-[10px] font-black text-primary/60 text-center uppercase tracking-widest'>
                        {getAmountInWords(amount, currency)}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View className='flex gap-4 pt-2 pb-4'>
                    <Pressable
                        onPress={handleConfirm}
                        className={`flex-2 py-5 rounded-[20px] items-center active:opacity-90 shadow-lg shadow-primary/20 ${isCollection ? 'bg-paid shadow-paid/20' : 'bg-primary'}`}
                    >
                        <Text className={`${isCollection ? 'text-white' : 'text-primary-foreground'} font-black tracking-wide text-lg`}>
                            Confirm
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={onClose}
                        className='py-5 rounded-[20px] bg-secondary/50 items-center active:bg-secondary'
                    >
                        <Text className='text-foreground font-black tracking-tight text-lg'>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </View>
        </BottomModal>
    );
}

