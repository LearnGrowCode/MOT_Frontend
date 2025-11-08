import { request } from "./client";

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
    return { success: response.ok, data };
}

export async function signup(
    email: string,
    password: string,
    username: string
): Promise<AuthResponse> {
    const response = await request("/user/signup/", {
        method: "POST",
        body: JSON.stringify({ email, password, username }),
    });

    const data = await parseJson(response);
    return { success: response.ok, data };
}

export async function requestPasswordReset(
    email: string
): Promise<AuthResponse> {
    const response = await request("/user/forgot-password/", {
        method: "POST",
        body: JSON.stringify({ email }),
    });

    const data = await parseJson(response);
    return { success: response.ok, data };
}

async function parseJson(response: Response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}
