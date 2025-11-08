const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

function buildRequestInit(init?: RequestInit): RequestInit {
    const headers = {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
    } as Record<string, string>;

    return {
        ...init,
        headers,
    };
}

export async function request(
    path: string,
    init?: RequestInit
): Promise<Response> {
    const response = await fetch(
        `${API_BASE_URL}${path}`,
        buildRequestInit(init)
    );
    return response;
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await request(path, init);

    if (!response.ok) {
        const errorBody = await safeParseJson(response);
        const error = new Error(response.statusText || "Request failed");
        (error as any).status = response.status;
        (error as any).data = errorBody;
        throw error;
    }

    return (await response.json()) as T;
}

async function safeParseJson(response: Response) {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}
