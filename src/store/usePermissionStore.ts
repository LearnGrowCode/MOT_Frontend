import {
    PermissionResult,
    requestContacts,
    requestContactsPermission,
} from "@/shared/utils/permissions";
import { create } from "zustand";
import { SimpleContact } from "@/shared/types/common.module";

type PermissionStore = {
    contactsGranted: PermissionResult;
    contacts: SimpleContact[];
    updateContactsGranted: () => Promise<void>;
};

export const usePermissionStore = create<PermissionStore>((set) => ({
    contactsGranted: "undetermined",
    contacts: [],
    updateContactsGranted: async () => {
        const granted = await requestContactsPermission();
        if (granted === "granted") {
            const contacts = await requestContacts();
            set({ contacts, contactsGranted: granted });
        } else {
            set({ contacts: [], contactsGranted: granted });
        }
    },
}));
