export const login = async (
    email: string,
    password: string
): Promise<{ success: boolean; data: any }> => {
    try {
        console.log(process.env.EXPO_PUBLIC_API_URL);
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/user/login/`,
            {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const signup = async (
    email: string,
    password: string,
    username: string
): Promise<{ success: boolean; data: any }> => {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/user/signup/`,
            {
                method: "POST",
                body: JSON.stringify({ email, password, username }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const requestPasswordReset = async (
    email: string
): Promise<{ success: boolean; data: any }> => {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/user/forgot-password/`,
            {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error(error);
        throw error;
    }
};
