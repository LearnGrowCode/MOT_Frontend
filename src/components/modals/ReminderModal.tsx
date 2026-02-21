import { useUserCurrency } from "@/hooks/useUserCurrency";
import { CollectionRecord } from "@/type/interface";
import { formatCurrency } from "@/utils/utils";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useColorScheme } from "nativewind";
import { MessageSquare, Sparkles, Send, Banknote } from "lucide-react-native";
import { Icon } from "../ui/icon";
import BottomModal from "../ui/BottomModal";

type ReminderTone = "gentle" | "appreciative" | "direct";

interface ReminderModalProps {
    visible: boolean;
    onClose: () => void;
    record: CollectionRecord | null;
    onSendReminder: (message: string) => void | Promise<void>;
}

const toneMeta: Record<
    ReminderTone,
    { label: string; emoji: string; description: string; color: string; bg: string }
> = {
    gentle: {
        label: "Gentle nudge",
        emoji: "🌤️",
        description: "Soft and friendly",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    appreciative: {
        label: "Warm thanks",
        emoji: "💛",
        description: "Grateful & upbeat",
        color: "text-rose-500",
        bg: "bg-rose-500/10",
    },
    direct: {
        label: "Polite prompt",
        emoji: "📅",
        description: "Clear yet kind",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
    },
};

const buildMessage = (
    record: CollectionRecord,
    currency: string,
    tone: ReminderTone
) => {
    const amount = formatCurrency(
        record.remaining || record.amount,
        currency,
        0
    );
    const firstName = record.name.trim().split(/\s+/)[0] || "there";
    const item = record.purpose || record.category || "the pending amount";

    switch (tone) {
        case "appreciative":
            return `Hi ${firstName}! 😊 Thank you again for trusting me. A tiny reminder that ${amount} is still pending for ${item} — could you please send it when you're free? Appreciate you!`;
        case "direct":
            return `Hey ${firstName}, hope you're doing well. Just a quick check-in about the ${amount} that's due for ${item}. Can you let me know when I can expect it? Thanks!`;
        case "gentle":
            return `Hi ${firstName}! 👋 Just a soft nudge about the ${amount} for ${item}. No rush at all, just wanted to keep it on your radar. Whenever you're ready! ✨`;
        default:
            return `Hey ${firstName}! Just a friendly reminder that ${amount} is still open for ${item}. Pay it whenever you're ready — thank you!`;
    }
};

export default function ReminderModal({
    visible,
    onClose,
    record,
    onSendReminder,
}: ReminderModalProps) {
    const { currency } = useUserCurrency();
    const [customMessage, setCustomMessage] = useState<string | null>(null);
    const [selectedTone, setSelectedTone] = useState<ReminderTone>("appreciative");
    const { colorScheme } = useColorScheme();

    useEffect(() => {
        if (!visible) {
            setCustomMessage(null);
            setSelectedTone("appreciative");
        }
    }, [visible]);

    const handleToneChange = (tone: ReminderTone) => {
        setSelectedTone(tone);
        setCustomMessage(null);
    };

    if (!record) return null;

    const baseMessage = buildMessage(record, currency, selectedTone);
    const displayMessage = customMessage !== null ? customMessage : baseMessage;

    if (!record) return null;

    const amountSummary = formatCurrency(
        record.remaining || record.amount,
        currency,
        0
    );

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title='Send Reminder'
            maxHeight={0.8}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className='h-full'
            >
                <View className='flex-1 gap-8'>
                    <View className='bg-secondary/50 dark:bg-secondary border border-primary/20 rounded-[28px] p-6 relative overflow-hidden'>
                        {colorScheme === "dark" && (
                            <View 
                                className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[40px]"
                                pointerEvents="none"
                            />
                        )}
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="w-6 h-6 rounded-lg bg-primary/20 items-center justify-center">
                                <Icon as={Banknote} size={12} className="text-primary" />
                            </View>
                            <Text className='text-[10px] font-black uppercase tracking-[3px] text-primary/80'>
                                Outstanding with {record.name}
                            </Text>
                        </View>
                        <Text className='text-4xl font-black text-foreground tracking-tighter'>
                            {amountSummary}
                        </Text>
                        
                    </View>

                    <View>
                        <View className="flex-row items-center gap-2 mb-3 ml-2">
                            <Icon as={MessageSquare} size={16} className="text-muted-foreground" />
                            <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px]'>
                                Message
                            </Text>
                        </View>
                        <TextInput
                            multiline
                            value={displayMessage}
                            onChangeText={setCustomMessage}
                            className='border-2 border-border/50 rounded-3xl p-6 text-lg text-foreground bg-secondary/30 font-medium'
                            placeholder='Type a reminder...'
                            placeholderTextColor='#666'
                            textAlignVertical='top'
                            numberOfLines={4}
                        />
                        <Text className='text-xs font-bold text-muted-foreground/60 mt-3 ml-2 italic'>
                            Customize the note before sharing.
                        </Text>
                    </View>

                    <View>
                        <View className="flex-row items-center gap-2 mb-4 ml-2">
                            <Icon as={Sparkles} size={16} className="text-muted-foreground" />
                            <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px]'>
                                Tone Presets
                            </Text>
                        </View>
                        <View className='flex-row gap-3'>
                            {(Object.keys(toneMeta) as ReminderTone[]).map(
                                (tone) => {
                                    const isActive = selectedTone === tone;
                                    return (
                                        <Pressable
                                            key={tone}
                                            onPress={() =>
                                                handleToneChange(tone)
                                                // console.log(tone)
                                            }
                                            className={`flex-1 p-4 rounded-2xl border-2 ${isActive
                                                ? "bg-primary border-primary shadow-lg shadow-primary/20"
                                                : "bg-secondary/50 border-border/50"
                                                }`}
                                        >
                                            <View className="items-center gap-2">
                                                <Text className='text-xl'>{toneMeta[tone].emoji}</Text>
                                                <Text
                                                    className={`text-[10px] font-black uppercase tracking-tighter ${isActive
                                                        ? "text-primary-foreground"
                                                        : "text-muted-foreground"
                                                        }`}
                                                >
                                                    {toneMeta[tone].label.split(' ')[0]}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                }
                            )}
                        </View>
                    </View>

                    <View className='mt-auto gap-4'>
                        <Pressable
                            onPress={() => onSendReminder(displayMessage.trim())}
                            disabled={!displayMessage.trim()}
                            className={`w-full h-16 rounded-2xl flex-row items-center justify-center gap-3 ${!displayMessage.trim() ? "bg-muted/50" : "bg-primary shadow-xl shadow-primary/30"}`}
                        >
                            <Icon as={Send} size={20} color="#ffffff" />
                            <Text className={`text-lg font-black tracking-tight text-white`}>
                                Share Reminder
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleToneChange("appreciative")}
                            className='items-center py-2 active:opacity-60'
                        >
                            <Text className='text-xs font-black text-primary uppercase tracking-[2px]'>
                                Reset to default
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </BottomModal>
    );
}
