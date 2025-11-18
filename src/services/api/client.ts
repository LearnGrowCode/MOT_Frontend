export async function request(
    path: string,
    init?: RequestInit
): Promise<Response> {
    const headers = new Headers(init?.headers);

    if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
   
    const response = await fetch(
        `https://django-mot-backend-1027288280838.asia-south1.run.app/api/v1${path}`,
        {
            ...init,
            headers,
        }
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
    } catch {
        return null;
    }
}
