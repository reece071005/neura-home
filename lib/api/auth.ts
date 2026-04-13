//imports our custom modules.
import { api } from "./client";
import { saveToken } from "@/lib/storage/token";

type LoginResponse = {
    access_token: string;
    token_type: string; // "bearer"
};

export async function login(username: string, password: string) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const data = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: form,
        form: true,
        auth: false,
    });

    await saveToken(data.access_token);
    return data;
}


type RegisterResponse = {
    id: number;
    email: string;
    username: string;
    is_active: string;
    created_at: string;
    role: "admin" | "user";
};

export async function register(email: string, username: string, password: string) {
    return api<RegisterResponse>("/auth/register", {
        method: "POST",
        body: {email, username, password},
        auth: false
    })
}

export async function changePasswordSelf(
    old_password: string,
    new_password: string,
    confirm_password: string
): Promise<void> {
    await api("/auth/users/change-password-self", {
        method: "PUT",
        auth: true,
        body: { old_password, new_password, confirm_password },
    });
}
