import { request } from "./client";
import * as SecureStore from "expo-secure-store";

type AuthResponse<T = any> = {
    success: boolean;
    data: T;
};

export async function login(
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await request("/user/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    const data = await parseJson(response);
    await SecureStore.setItemAsync("token", data.access_token ?? "");
    console.log("data", data);
    return { success: response.ok, data };
}

export async function signup(
    email: string,
    password: string,
    username: string,
    mobile?: string,
    currency?: string
): Promise<AuthResponse> {
    const body: {
        email: string;
        password: string;
        username: string;
        mobile?: string;
        currency?: string;
    } = {
        email,
        password,
        username,
    };

    if (mobile) {
        body.mobile = mobile;
    }

    if (currency) {
        body.currency = currency;
    }

    const response = await request("/user/signup/", {
        method: "POST",
        body: JSON.stringify(body),
    });

    const data = await parseJson(response);

    // Store token if available in response
    if (data?.access_token) {
        await SecureStore.setItemAsync("token", data.access_token);
    } else if (response.headers.get("access_token")) {
        await SecureStore.setItemAsync(
            "token",
            response.headers.get("access_token") ?? ""
        );
    }

    return { success: response.ok, data };
}

async function parseJson(response: Response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}
