import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserProfile = {
    id: string;
    name: string;
    email: string;
};

type AuthStore = {
    isAuthenticated: boolean;
    profile: UserProfile | null;
    setAuthenticated: (value: boolean) => void;
    setProfile: (profile: UserProfile | null) => void;
    signOut: () => void;
};

const secureStorage = {
    getItem: async (name: string) => {
        const value = await SecureStore.getItemAsync(name);
        return value ?? null;
    },
    setItem: async (name: string, value: string) => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string) => {
        await SecureStore.deleteItemAsync(name);
    },
};

export const useProfileStore = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            profile: null,
            setAuthenticated: (value) => set({ isAuthenticated: value }),
            setProfile: (profile) => set({ profile }),
            signOut: () => set({ isAuthenticated: false, profile: null }),
        }),
        {
            name: "mot-auth-store",
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                profile: state.profile,
            }),
        }
    )
);
