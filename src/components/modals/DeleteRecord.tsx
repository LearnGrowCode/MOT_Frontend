import React from "react";
import { Pressable, Text, View } from "react-native";
import { PaymentRecord } from "../../type/interface";
import BottomModal from "../ui/BottomModal";
import { useColorScheme } from "nativewind";
import { X, Trash2 } from "lucide-react-native";


interface DeleteRecordProps {
    visible: boolean;
    onClose: () => void;
    onDeleteRecord: (recordId: string) => void;
    record: PaymentRecord | null;
}

export default function DeleteRecord({
    visible,
    onClose,
    onDeleteRecord,
    record,
}: DeleteRecordProps) {
    const { colorScheme } = useColorScheme();
    const handleDelete = () => {
        if (record) {
            onDeleteRecord(record.id);
            onClose();
        }
    };

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title='Delete Record'
        >
            <View className='items-center py-6 px-4'>
                <View className='w-24 h-24 bg-destructive/15 rounded-full items-center justify-center mb-8 border-2 border-destructive/20 relative'>
                    <Trash2 size={40} color={colorScheme === "dark" ? "#F23F3F" : "#BD1414"} strokeWidth={2.5} />
                    <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-destructive rounded-full items-center justify-center border-4 border-card">
                        <X size={14} color="white" strokeWidth={4} />
                    </View>
                </View>

                <Text className='text-2xl font-black text-center mb-4 text-foreground tracking-tight'>
                    Are you sure?
                </Text>

                <Text className='text-lg text-muted-foreground text-center leading-6 font-medium'>
                    This action cannot be undone. The record will be permanently removed.
                </Text>
            </View>

            {/* Action Buttons */}
            <View className='flex-row gap-4 pt-4'>
                <Pressable
                    onPress={onClose}
                    className='flex-1 py-4 rounded-xl bg-secondary/50 items-center active:bg-secondary'
                >
                    <Text className='text-foreground font-bold tracking-tight text-base'>
                        Cancel
                    </Text>
                </Pressable>
                <Pressable
                    onPress={handleDelete}
                    className='flex-1 py-4 rounded-xl bg-destructive items-center active:opacity-90 shadow-lg shadow-destructive/20 flex-row justify-center gap-2'
                >
                    <Trash2 size={18} color="white" strokeWidth={2.5} />
                    <Text className='text-white font-bold tracking-wide text-base'>
                        Delete
                    </Text>
                </Pressable>
            </View>
        </BottomModal>
    );
}
