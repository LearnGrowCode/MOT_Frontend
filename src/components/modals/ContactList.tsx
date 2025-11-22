import { Pressable, FlatList, View } from "react-native";
import { CardContent } from "../ui/card";
import Input from "../form/Input";
import { SimpleContact } from "@/type/interface";
import { Text } from "../ui/text";
import BottomModal from "../ui/BottomModal";
import React, { memo } from "react";

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
    ({ item, onPress }: { item: SimpleContact; onPress: () => void }) => (
        <Pressable onPress={onPress} className='py-4 border-b border-gray-200'>
            <Text className='text-base text-gray-900 mb-1'>
                {item.name || "Unnamed"}
            </Text>
            <Text className='text-sm text-gray-500'>
                {item.phone || "No phone"}
            </Text>
        </Pressable>
    )
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
        <View className='py-6 items-center'>
            <Text className='text-gray-500'>No contacts found</Text>
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
                <View className='flex-1 gap-0 py-0'>
                    <CardContent className='mb-0 pt-4'>
                        <Input
                            placeholder='Search contacts'
                            value={contactSearch}
                            onChangeText={setContactSearch}
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
