import { useUserCurrency } from "@/hooks/useUserCurrency";
import { formatCurrency } from "@/utils/utils";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { CollectionRecord } from "../../type/interface";
import BottomModal from "../ui/BottomModal";
import { useColorScheme } from "nativewind";
import { Trash2, User, Banknote, Bookmark } from "lucide-react-native";

interface DeleteCollectionRecordProps {
    visible: boolean;
    onClose: () => void;
    onDeleteRecord: (recordId: string) => void;
    record: CollectionRecord | null;
}

export default function DeleteCollectionRecord({
    visible,
    onClose,
    onDeleteRecord,
    record,
}: DeleteCollectionRecordProps) {
    const { colorScheme } = useColorScheme();
    const { currency } = useUserCurrency();

    const handleDelete = () => {
        if (record) {
            onDeleteRecord(record.id);
        }
        onClose();
    };

    if (!record) return null;

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            title='Delete Record'
        >
            <View className='gap-6 py-6'>
                <Text className='text-lg font-bold text-muted-foreground text-center px-4 leading-6'>
                    Are you sure you want to delete this collection record?
                </Text>

                {/* Record Details Card */}
                <View className='bg-secondary/40 p-6 rounded-[28px] border-2 border-border/40 relative overflow-hidden'>
                    <View className="flex-row items-center gap-4 mb-5">
                        <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
                            <User size={24} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                        </View>
                        <View>
                            <Text className='text-[10px] font-black uppercase tracking-[3px] text-primary/80 mb-1'>
                                Borrower
                            </Text>
                            <Text className='text-xl font-black text-foreground tracking-tight'>
                                {record.name}
                            </Text>
                        </View>
                    </View>
                    
                    <View className='flex-row items-center justify-between bg-secondary/40 p-5 rounded-2xl border border-border/30'>
                        <View>
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <Banknote size={12} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} />
                                <Text className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                                    Amount
                                </Text>
                            </View>
                            <Text className='text-2xl font-black text-foreground tracking-tighter'>
                                {formatCurrency(record.amount, currency, 2)}
                            </Text>
                        </View>
                        <View className='items-end'>
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <Bookmark size={12} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} />
                                <Text className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                                    Category
                                </Text>
                            </View>
                            <Text className='text-sm font-black text-foreground uppercase tracking-tight'>
                                {record.category}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="bg-destructive/10 py-3 px-4 rounded-xl border border-destructive/20">
                    <Text className='text-xs text-destructive text-center font-black uppercase tracking-widest'>
                        This action cannot be undone
                    </Text>
                </View>
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
