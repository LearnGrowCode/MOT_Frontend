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
import PrimaryButton from "../button/PrimaryButton";
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
    { label: string; emoji: string; description: string }
> = {
    gentle: {
        label: "Gentle nudge",
        emoji: "🌤️",
        description: "Soft and friendly",
    },
    appreciative: {
        label: "Warm thanks",
        emoji: "💛",
        description: "Grateful & upbeat",
    },
    direct: {
        label: "Polite prompt",
        emoji: "📅",
        description: "Clear yet kind",
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
    const [message, setMessage] = useState("");
    const [selectedTone, setSelectedTone] =
        useState<ReminderTone>("appreciative");

    useEffect(() => {
        if (record) {
            setMessage(buildMessage(record, currency, selectedTone));
        } else {
            setMessage("");
        }
    }, [record, currency, selectedTone, visible]);

    const handleToneChange = (tone: ReminderTone) => {
        setSelectedTone(tone);
        if (record) {
            setMessage(buildMessage(record, currency, tone));
        }
    };

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
            minHeight={0.4}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className='h-full'
            >
                <View className='flex-1 px-6 pb-6 gap-5'>
                    <View className='bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4'>
                        <Text className='text-xs uppercase tracking-wide text-indigo-500 dark:text-indigo-400 mb-1'>
                            Outstanding with {record.name}
                        </Text>
                        <Text className='text-2xl font-bold text-indigo-900 dark:text-indigo-50'>
                            {amountSummary}
                        </Text>
                        <Text className='text-sm text-indigo-700 dark:text-indigo-300 mt-1'>
                            {record.category}
                        </Text>
                    </View>

                    <View>
                        <Text className='text-sm font-medium text-foreground mb-2'>
                            Message
                        </Text>
                        <TextInput
                            multiline
                            value={message}
                            onChangeText={setMessage}
                            className='border border-border rounded-xl p-4 text-base text-foreground bg-card'
                            placeholder='Type a reminder...'
                            placeholderTextColor='#9CA3AF'
                            textAlignVertical='top'
                            numberOfLines={6}
                        />
                        <Text className='text-xs text-muted-foreground mt-1'>
                            Customize the note before sharing. Recipients will
                            see exactly this text.
                        </Text>
                    </View>

                    <View>
                        <Text className='text-sm font-medium text-foreground mb-2'>
                            Quick tone presets
                        </Text>
                        <View className='flex-row flex-wrap gap-2'>
                            {(Object.keys(toneMeta) as ReminderTone[]).map(
                                (tone) => {
                                    const isActive = selectedTone === tone;
                                    return (
                                        <Pressable
                                            key={tone}
                                            onPress={() =>
                                                handleToneChange(tone)
                                            }
                                            className={`px-4 py-2 rounded-full border ${isActive
                                                ? "bg-indigo-600 border-indigo-600"
                                                : "bg-muted border-border"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm font-semibold ${isActive
                                                    ? "text-white"
                                                    : "text-foreground"
                                                    }`}
                                            >
                                                {toneMeta[tone].emoji}{" "}
                                                {toneMeta[tone].label}
                                            </Text>
                                        </Pressable>
                                    );
                                }
                            )}
                        </View>
                    </View>

                    <View className='mt-auto gap-3'>
                        <PrimaryButton
                            title='Share reminder'
                            onPress={() => onSendReminder(message.trim())}
                            disabled={!message.trim()}
                            className='bg-indigo-600'
                        />
                        <Pressable
                            onPress={() => handleToneChange("appreciative")}
                            className='items-center py-2'
                        >
                            <Text className='text-sm text-muted-foreground'>
                                Reset to warm thanks note
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </BottomModal>
    );
}
