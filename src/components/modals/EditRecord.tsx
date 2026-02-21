import React, { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { X, User, Banknote, FileText, AlertTriangle, History } from "lucide-react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Input from "../form/Input";
import { PaymentRecord } from "../../type/interface";
import { formatAmountInput, formatCurrency, formatDate } from "@/utils/utils";

interface EditRecordProps {
    visible: boolean;
    onClose: () => void;
    onSaveRecord: (
        record: PaymentRecord,
        options?: { deleteSettlementIds?: string[] }
    ) => void;
    record: PaymentRecord | null;
}

export default function EditRecord({
    visible,
    onClose,
    onSaveRecord,
    record,
}: EditRecordProps) {
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        purpose: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pendingSettlementDeletes, setPendingSettlementDeletes] = useState<
        Set<string>
    >(new Set());
    const { colorScheme } = useColorScheme();

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

        if (!formData.name.trim()) newErrors.name = "Payer name is required";
        if (!formData.amount.trim()) newErrors.amount = "Amount is required";
        if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm() || !record) return;

        const newAmount = parseFloat(formData.amount) || 0;
        // Keep total paid constant: newRemaining = oldRemaining + (newAmount - oldAmount)
        const newRemaining = Math.max(
            0,
            record.remaining + (newAmount - record.amount)
        );

        const updatedRecord: PaymentRecord = {
            ...record,
            name: formData.name.trim(),
            amount: newAmount,
            purpose: formData.purpose.trim(),
            remaining: newRemaining,
        };

        const deleteSettlementIds = Array.from(pendingSettlementDeletes);
        onSaveRecord(
            updatedRecord,
            deleteSettlementIds.length
                ? { deleteSettlementIds }
                : undefined
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

                    <ScrollView showsVerticalScrollIndicator={true}>
                        <CardContent className='gap-8 py-8'>
                            {/* Payer Name */}
                            <View>
                                <View className="flex-row items-center gap-2 mb-3 ml-1">
                                    <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                                        <User size={16} color={colorScheme === "dark" ? "#6B93F2" : "#2251D1"} />
                                    </View>
                                    <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-1'>
                                        Payer Name
                                    </Text>
                                </View>
                                <Input
                                    placeholder="Enter payer's name"
                                    value={formData.name}
                                    onChangeText={(value) =>
                                        handleInputChange("name", value)
                                    }
                                    className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                    error={errors.name}
                                    maxLength={30}
                                />
                            </View>

                            {/* Amount to Collect */}
                            <View>
                                <View className="flex-row items-center gap-2 mb-3 ml-1">
                                    <View className="w-8 h-8 rounded-xl bg-tertiary-500/10 items-center justify-center border border-tertiary-500/20">
                                        <Banknote size={16} color={colorScheme === "dark" ? "#EBC12A" : "#B58E0D"} />
                                    </View>
                                    <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-1'>
                                        Amount to Collect
                                    </Text>
                                </View>
                                <Input
                                    placeholder='0.00'
                                    value={formData.amount}
                                    onChangeText={(value) =>
                                        handleInputChange(
                                            "amount",
                                            formatAmount(value)
                                        )
                                    }
                                    className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                    maxLength={12}
                                    keyboardType='numeric'
                                    error={errors.amount}
                                />
                            </View>

                            {/* Purpose */}
                            <View>
                                <View className="flex-row items-center gap-2 mb-3 ml-1">
                                    <View className="w-8 h-8 rounded-xl bg-secondary items-center justify-center border border-border/50">
                                        <FileText size={16} color={colorScheme === "dark" ? "#94a3b8" : "#64748b"} />
                                    </View>
                                    <Text className='text-xs font-black text-muted-foreground uppercase tracking-[3px] ml-1'>
                                        Purpose
                                    </Text>
                                </View>
                                <Input
                                    placeholder='Enter purpose'
                                    value={formData.purpose}
                                    onChangeText={(value) =>
                                        handleInputChange("purpose", value)
                                    }
                                    className='w-full bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg'
                                    maxLength={30}
                                    error={errors.purpose}
                                />
                            </View>

                            {/* Payment Management */}
                            <View className='bg-destructive/5 border border-destructive/20 rounded-[28px] p-6 gap-6'>
                                <View className='flex-row items-center gap-4'>
                                    <View className="w-12 h-12 rounded-2xl bg-destructive/10 items-center justify-center border border-destructive/20">
                                        <AlertTriangle size={24} color={colorScheme === "dark" ? "#F23F3F" : "#BD1414"} />
                                    </View>
                                    <View className='flex-1'>
                                        <Text className='text-lg font-black text-destructive tracking-tight'>
                                            Manage History
                                        </Text>
                                        <Text className='text-xs text-muted-foreground font-medium'>
                                            Tap items to mark for deletion.
                                        </Text>
                                    </View>
                                </View>
                                {record.trx_history?.length ? (
                                    record.trx_history.map((item) => {
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
                                                className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                                                    isMarked
                                                        ? "border-destructive/40 bg-destructive/10 shadow-sm"
                                                        : "border-border/30 bg-secondary/30"
                                                }`}
                                            >
                                                <View className="flex-row items-center gap-4">
                                                    <View className={`w-10 h-10 rounded-xl items-center justify-center ${isMarked ? "bg-destructive/20" : "bg-primary/10"}`}>
                                                        <History 
                                                            size={18} 
                                                            color={isMarked 
                                                                ? (colorScheme === "dark" ? "#F23F3F" : "#BD1414")
                                                                : (colorScheme === "dark" ? "#6B93F2" : "#2251D1")
                                                            } 
                                                        />
                                                    </View>
                                                    <View>
                                                        <Text className='text-base font-black text-foreground tracking-tight'>
                                                            {formatCurrency(
                                                                item.amount,
                                                                record.category,
                                                                2
                                                            )}
                                                        </Text>
                                                        <Text className='text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                                                            {formatDate(item.date)}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className={`px-3 py-1 rounded-full ${isMarked ? "bg-destructive/10" : "bg-muted"}`}>
                                                    <Text
                                                        className={`text-[10px] font-black uppercase tracking-tighter ${
                                                            isMarked
                                                                ? "text-destructive"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        {isMarked
                                                            ? "Will delete"
                                                            : "Tap to remove"}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        );
                                    })
                                ) : (
                                    <Text className='text-xs text-muted-foreground'>
                                        No payments to manage yet.
                                    </Text>
                                )}
                                {pendingSettlementDeletes.size > 0 && (
                                    <View className="bg-destructive/10 p-3 rounded-xl border border-destructive/20 flex-row items-center gap-2">
                                        <View className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                                        <Text className='text-xs font-black text-destructive uppercase tracking-tight'>
                                            {pendingSettlementDeletes.size} payment
                                            {pendingSettlementDeletes.size > 1
                                                ? "s"
                                                : ""}{" "}
                                            pending deletion
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </CardContent>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View className='flex-row gap-4 p-8 pt-0'>
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
                            className='flex-2 py-5 bg-primary rounded-[20px] items-center active:opacity-90 shadow-lg shadow-primary/20'
                        >
                            <Text className='text-primary-foreground font-black tracking-wide text-lg'>
                                Save Changes
                            </Text>
                        </Pressable>
                    </View>
                </Card>
            </View>
        </View>
    </Modal>
    );
}
