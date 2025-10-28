import * as Contacts from "expo-contacts";

export type PermissionResult = "granted" | "denied" | "undetermined";

export async function requestContacts() {
    const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    });

    // Transform the data to match SimpleContact interface with pre-computed search fields
    const simpleContacts = data.map((contact: any) => {
        const name =
            contact.name ||
            `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
            "Unnamed";
        const phone = contact.phoneNumbers?.[0]?.number || null;

        return {
            id: contact.id,
            name,
            phone,
            // Pre-compute lowercase versions for faster searching
            searchName: name.toLowerCase(),
            searchPhone: (phone || "").toLowerCase(),
        };
    });

    return simpleContacts;
}
export async function requestContactsPermission(): Promise<PermissionResult> {
    const res = await Contacts.requestPermissionsAsync();
    return res.status;
}
