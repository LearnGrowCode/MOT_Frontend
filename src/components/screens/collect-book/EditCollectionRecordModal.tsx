import React, { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/form/Input";
import { CollectionRecord } from "@/modules/book.module";
import { formatAmountInput, formatCurrency, formatDate } from "@/utils/utils";
import { useColorScheme } from "nativewind";
import { X, User, Banknote, FileText, AlertTriangle, Save } from "lucide-react-native";

interface EditCollectionRecordModalProps {
    visible: boolean;
    onClose: () => void;
    onSaveRecord: (
        record: CollectionRecord,
        options?: { deleteSettlementIds?: string[] }
    ) => void;
    record: CollectionRecord | null;
}

export default function EditCollectionRecordModal({
    visible,
    onClose,
    onSaveRecord,
    record,
}: EditCollectionRecordModalProps) {
    const { colorScheme } = useColorScheme();
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        purpose: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pendingSettlementDeletes, setPendingSettlementDeletes] = useState<
        Set<string>
    >(new Set());

    useEffect(() => {
        if (record) {
            setFormData({
                name: record.name,
                amount: record.amount.toString(),
                purpose: record.purpose ?? "",
            });
            setPendingSettlementDeletes(new Set());
        }
    }, [record]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Borrower name is required";
        if (!formData.amount.trim()) newErrors.amount = "Amount is required";
        if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm() || !record) return;

        const updatedRecord: CollectionRecord = {
            ...record,
            name: formData.name.trim(),
            amount: parseFloat(formData.amount) || 0,
            purpose: formData.purpose.trim(),
            remaining: parseFloat(formData.amount) || 0,
        };

        const deleteSettlementIds = Array.from(pendingSettlementDeletes);
        onSaveRecord(
            updatedRecord,
            deleteSettlementIds.length ? { deleteSettlementIds } : undefined
        );
        onClose();
    };

    const formatAmount = (value: string) => {
        return formatAmountInput(value);
    };

    if (!record) return null;

    return (
        <Modal
            visible={visible}
            animationType='slide'
            transparent={true}
            onRequestClose={onClose}
        >
            <View className='flex-1 bg-black/60 justify-center items-center px-4'>
                <View className="w-full max-w-md relative overflow-hidden">
                    {/* Decorative Background for Dark Mode */}
                    {colorScheme === "dark" && (
                        <View 
                            className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"
                            pointerEvents="none"
                        />
                    )}
                    <Card className='w-full rounded-[32px] bg-card border border-border/40 shadow-2xl shadow-black/40'>
                        <CardHeader className='flex-row items-center justify-between py-6 px-8 border-b border-border/30'>
                            <CardTitle className='text-2xl font-black tracking-tight text-foreground'>
                                Edit Record
                            </CardTitle>
                            <Pressable 
                                onPress={onClose} 
                                className='p-3 bg-secondary/50 rounded-2xl active:bg-secondary'
                            >
                                <X size={20} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} strokeWidth={3} />
                            </Pressable>
                        </CardHeader>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
                            <CardContent className='gap-8 py-8'>
                                {/* Borrower Name */}
                                <View>
                                    <View className='flex-row items-center gap-2 mb-3 ml-1'>
                                        <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                                            <User size={16} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                                        </View>
                                        <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-1'>
                                            Borrower Name
                                        </Text>
                                    </View>
                                    <Input
                                        placeholder="Enter borrower's name"
                                        value={formData.name}
                                        onChangeText={(value: string) =>
                                            handleInputChange("name", value)
                                        }
                                        error={errors.name}
                                        className="h-14 px-6 rounded-2xl bg-secondary/30 border-2 border-border/50 text-foreground font-bold"
                                    />
                                </View>

                                {/* Amount to Collect */}
                                <View>
                                    <View className='flex-row items-center gap-2 mb-3 ml-1'>
                                        <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                                            <Banknote size={16} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                                        </View>
                                        <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-1'>
                                            Amount to Collect
                                        </Text>
                                    </View>
                                    <Input
                                        placeholder='0.00'
                                        value={formData.amount}
                                        onChangeText={(value: string) =>
                                            handleInputChange(
                                                "amount",
                                                formatAmount(value)
                                            )
                                        }
                                        keyboardType='numeric'
                                        error={errors.amount}
                                        className="h-14 px-6 rounded-2xl bg-secondary/30 border-2 border-border/50 text-foreground font-bold"
                                    />
                                </View>

                                {/* Purpose */}
                                <View>
                                    <View className='flex-row items-center gap-2 mb-3 ml-1'>
                                        <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                                            <FileText size={16} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                                        </View>
                                        <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-1'>
                                            Purpose
                                        </Text>
                                    </View>
                                    <Input
                                        placeholder='Enter purpose'
                                        value={formData.purpose}
                                        onChangeText={(value: string) =>
                                            handleInputChange("purpose", value)
                                        }
                                        error={errors.purpose}
                                        className="h-14 px-6 rounded-2xl bg-secondary/30 border-2 border-border/50 text-foreground font-bold"
                                    />
                                </View>

                                {/* Settlement Management */}
                                <View className='bg-destructive/5 border border-destructive/20 rounded-3xl p-6 gap-4'>
                                    <View className='flex-row items-center gap-3'>
                                        <View className="w-10 h-10 rounded-2xl bg-destructive/10 items-center justify-center">
                                            <AlertTriangle size={20} color={colorScheme === "dark" ? "#F23F3F" : "#BD1414"} />
                                        </View>
                                        <View className='flex-1'>
                                            <Text className='text-sm font-black text-destructive uppercase tracking-widest'>
                                                Delete settlements
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className='text-xs text-muted-foreground/80 font-medium italic'>
                                        Tap a settlement below to mark it for deletion. Changes persist on Save.
                                    </Text>
                                    <View className="gap-2">
                                        {record.trx_history?.length ? (
                                            record.trx_history.map((item: any) => {
                                                const isMarked =
                                                    pendingSettlementDeletes.has(
                                                        item.id
                                                    );
                                                return (
                                                    <Pressable
                                                        key={item.id}
                                                        onPress={() =>
                                                            setPendingSettlementDeletes(
                                                                (prev) => {
                                                                    const next =
                                                                        new Set(prev);
                                                                    if (
                                                                        next.has(
                                                                            item.id
                                                                        )
                                                                    ) {
                                                                        next.delete(
                                                                            item.id
                                                                        );
                                                                    } else {
                                                                        next.add(
                                                                            item.id
                                                                        );
                                                                    }
                                                                    return next;
                                                                }
                                                            )
                                                        }
                                                        className={`flex-row items-center justify-between px-5 py-4 rounded-xl border-2 ${
                                                            isMarked
                                                                ? "border-destructive/50 bg-destructive/10"
                                                                : "border-border/30 bg-secondary/20"
                                                        }`}
                                                    >
                                                        <View>
                                                            <Text className={`text-md font-black tracking-tight ${isMarked ? "text-destructive" : "text-foreground"}`}>
                                                                {formatCurrency(
                                                                    item.amount,
                                                                    record.category,
                                                                    2
                                                                )}
                                                            </Text>
                                                            <Text className='text-[10px] font-bold text-muted-foreground uppercase mt-0.5'>
                                                                {formatDate(item.date)}
                                                            </Text>
                                                        </View>
                                                        <View className={`px-2 py-1 rounded-md ${isMarked ? "bg-destructive/20" : "bg-muted"}`}>
                                                            <Text
                                                                className={`text-[9px] font-black uppercase tracking-tighter ${
                                                                    isMarked
                                                                        ? "text-destructive"
                                                                        : "text-muted-foreground"
                                                                }`}
                                                            >
                                                                {isMarked
                                                                    ? "Marked"
                                                                    : "Remove"}
                                                            </Text>
                                                        </View>
                                                    </Pressable>
                                                );
                                            })
                                        ) : (
                                            <Text className='text-xs text-muted-foreground/50 text-center py-4'>
                                                No settlements yet.
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </CardContent>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View className='flex-row gap-4 p-8 pt-4'>
                            <Pressable
                                onPress={onClose}
                                className='flex-1 py-5 rounded-[20px] bg-secondary/50 items-center active:bg-secondary'
                            >
                                <Text className='text-foreground font-black tracking-tight text-lg'>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSubmit}
                                className='flex-2 py-5 rounded-[20px] bg-primary items-center active:opacity-90 shadow-lg shadow-primary/20 flex-row justify-center gap-2'
                            >
                                <Save size={20} color={colorScheme === "dark" ? "#0a0a0a" : "#eff3fe"} />
                                <Text className='text-primary-foreground font-black tracking-wide text-lg'>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </Card>
                </View>
            </View>
        </Modal>
    );
}
