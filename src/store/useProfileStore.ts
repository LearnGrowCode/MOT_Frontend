import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
interface ProfileStore {
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    updateToken: (refreshToken: string, accessToken: string) => Promise<void>;
    getToken: () => Promise<{
        refreshToken: string | null;
        accessToken: string | null;
    }>;
    checkAuthentication: () => Promise<boolean>;
}
export const useProfileStore = create<ProfileStore>((set, get) => ({
    isAuthenticated: false,
    setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
    checkAuthentication: async () => {
        const token = await SecureStore.getItemAsync("access_token");
        const authenticated =
            token !== null && token !== undefined && token !== "";
        // Hydrate store so layouts relying on isAuthenticated don't bounce
        set({ isAuthenticated: authenticated });
        return authenticated;
    },
    updateToken: async (refreshToken: string, accessToken: string) => {
        await SecureStore.setItemAsync("refresh_token", refreshToken);
        await SecureStore.setItemAsync("access_token", accessToken);
        set({ isAuthenticated: true });
    },
    getToken: async () => {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        const accessToken = await SecureStore.getItemAsync("access_token");
        return { refreshToken, accessToken };
    },
    signOut: async () => {
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("access_token");
        set({ isAuthenticated: false });
    },
}));
