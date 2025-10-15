import * as Contacts from "expo-contacts";
import { Alert } from "react-native";

export interface SimpleContact {
    id: string;
    name: string;
    phone: string | null;
}

export const getContactsWithPermission = async (): Promise<SimpleContact[]> => {
    try {
        const { status } = await Contacts.getPermissionsAsync();
        let permissionGranted = status === "granted";
        if (!permissionGranted) {
            const { status: newStatus } =
                await Contacts.requestPermissionsAsync();
            permissionGranted = newStatus === "granted";
        }

        if (!permissionGranted) {
            Alert.alert(
                "Permission Required",
                "We need access to your contacts to let you pick a contact."
            );
            return [];
        }

        const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
            pageSize: 2000,
            pageOffset: 0,
        });

        const simplified: SimpleContact[] = (data || [])
            .map((c: any) => {
                const firstPhone =
                    c.phoneNumbers && c.phoneNumbers.length > 0
                        ? (c.phoneNumbers[0]?.number ?? null)
                        : null;
                return {
                    id: c.id ?? Math.random().toString(),
                    name: c.name ?? "",
                    phone: firstPhone,
                } as SimpleContact;
            })
            .filter(
                (c: SimpleContact) =>
                    c.name && (c.phone === null || typeof c.phone === "string")
            );

        // Sort by name for nicer UX
        simplified.sort((a, b) => a.name.localeCompare(b.name));
        return simplified;
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load contacts.");
        return [];
    }
};
