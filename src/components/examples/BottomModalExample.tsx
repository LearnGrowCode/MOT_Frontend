import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import BottomModal from "../ui/BottomModal";
import { PrimaryButton } from "../button/PrimaryButton";

export default function BottomModalExample() {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    return (
        <View className='flex-1 justify-center items-center p-4'>
            <PrimaryButton onPress={openModal} title='Open Bottom Modal' />

            <BottomModal
                visible={isModalVisible}
                onClose={closeModal}
                title='Example Modal'
                maxHeight={0.7}
            >
                <ScrollView showsVerticalScrollIndicator>
                    <View className='gap-4'>
                        <Text className='text-lg font-semibold text-gray-800'>
                            This is a nested content example
                        </Text>

                        <View className='gap-2'>
                            <Text className='text-base text-gray-600'>
                                You can put any content here:
                            </Text>

                            {/* Example nested components */}
                            <View className='bg-gray-50 p-4 rounded-lg'>
                                <Text className='text-sm text-gray-700'>
                                    • Nested views
                                </Text>
                                <Text className='text-sm text-gray-700'>
                                    • Scrollable content
                                </Text>
                                <Text className='text-sm text-gray-700'>
                                    • Custom components
                                </Text>
                            </View>

                            {/* Example buttons */}
                            <View className='flex-row gap-3 mt-4'>
                                <Pressable
                                    onPress={closeModal}
                                    className='flex-1 py-3 px-4 border border-gray-300 rounded-md items-center'
                                >
                                    <Text className='text-gray-700 font-medium'>
                                        Cancel
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={closeModal}
                                    className='flex-1 py-3 px-4 bg-blue-600 rounded-md items-center'
                                >
                                    <Text className='text-white font-medium'>
                                        Confirm
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </BottomModal>
        </View>
    );
}

