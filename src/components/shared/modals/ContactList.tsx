import { Pressable, FlatList, View } from "react-native";
import { CardContent } from "@/components/ui/card";
import Input from "@/components/form/Input";
import { SimpleContact } from "@/modules/common.module";
import { Text } from "@/components/ui/text";
import BottomModal from "@/components/ui/BottomModal";
import React, { memo } from "react";
import { Search, User } from "lucide-react-native";

interface ContactListProps {
    contacts: SimpleContact[];
    contactSearch: string;
    setContactSearch: (value: string) => void;
    filteredContacts: SimpleContact[];
    onContactSelect: (name: string, phone: string) => void;
    setContactsVisible: (value: boolean) => void;
    contactsVisible: boolean;
}

// Memoized contact item component for better performance
const ContactItem = memo(
    ({ item, onPress }: { item: SimpleContact; onPress: () => void }) => {
        // Get initials from name
        const getInitials = (name: string) => {
            if (!name) return "?";
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0][0].toUpperCase();
        };

        return (
            <Pressable 
                onPress={onPress} 
                className='py-4 flex-row items-center gap-4 border-b border-border/20 active:bg-secondary/20'
            >
                {/* Avatar */}
                <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
                    <Text className="text-primary font-black text-lg">
                        {getInitials(item.name || "")}
                    </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className='text-lg font-black text-foreground tracking-tight'>
                        {item.name || "Unnamed"}
                    </Text>
                    {item.phone ? (
                        <Text className='text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5'>
                            {item.phone}
                        </Text>
                    ) : (
                        <Text className='text-xs font-medium text-muted-foreground/60 italic mt-0.5'>
                            No phone number
                        </Text>
                    )}
                </View>

                <View className="bg-secondary/50 p-2 rounded-xl">
                    <Text className="text-muted-foreground font-black text-lg">›</Text>
                </View>
            </Pressable>
        );
    }
);

ContactItem.displayName = "ContactItem";

export default function ContactList({
    contacts,
    contactSearch,
    setContactSearch,
    filteredContacts,
    onContactSelect,
    setContactsVisible,
    contactsVisible,
}: ContactListProps) {
    const renderContactItem = ({ item }: { item: SimpleContact }) => (
        <ContactItem
            item={item}
            onPress={() => {
                onContactSelect(item.name || "", item.phone || "");
            }}
        />
    );

    const renderEmptyComponent = () => (
        <View className='py-12 items-center justify-center gap-4'>
            <View className="w-20 h-20 bg-secondary rounded-[32px] items-center justify-center border-2 border-dashed border-border/50">
                <User size={32} color="#94a3b8" />
            </View>
            <View className="items-center">
                <Text className='text-lg font-black text-foreground tracking-tight'>No contacts found</Text>
                <Text className='text-sm text-muted-foreground font-medium'>Try a different search term</Text>
            </View>
        </View>
    );

    return (
        <BottomModal
            visible={contactsVisible}
            onClose={() => setContactsVisible(false)}
            title='Select Contact'
            maxHeight={0.85}
            minHeight={0.7}
        >
            {contactsVisible && (
                <View className='flex-1 gap-0'>
                    <CardContent>
                        <Input
                            placeholder='Search by name or number'
                            value={contactSearch}
                            onChangeText={setContactSearch}
                            className="bg-secondary/30 border-2 border-border/50 rounded-2xl h-16 px-6 text-lg"
                        />
                    </CardContent>
                    <FlatList
                        data={filteredContacts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderContactItem}
                        keyboardShouldPersistTaps='handled'
                        keyboardDismissMode='on-drag'
                        className='px-4'
                        style={{ flex: 1 }}
                        ListEmptyComponent={renderEmptyComponent}
                        getItemLayout={(data, index) => ({
                            length: 60, // Approximate item height
                            offset: 60 * index,
                            index,
                        })}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        initialNumToRender={20}
                    />
                </View>
            )}
        </BottomModal>
    );
}
