//imports our custom modules.
import { api } from "./client";
import { saveToken } from "@/lib/storage/token";

//Login Response parameters
type LoginResponse = {
    access_token: string;
    token_type: string; // "bearer"
};

//Function for login (takes username and password).
export async function login(username: string, password: string) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    //Gets response from API, this will contain access token.
    const data = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: form,
        form: true,
        auth: false,
    });

    //Saves token using the token.ts module we created.
    await saveToken(data.access_token);
    return data;
}

//Register response paramaters
type RegisterResponse = {
    id: number;
    email: string;
    username: string;
    is_active: string;
    created_at: string;
    role: "admin" | "user";
};

//Function for register (takes email, username, password)
export async function register(email: string, username: string, password: string) {
    return api<RegisterResponse>("/auth/register", {
        method: "POST",
        body: {email, username, password},
        auth: false
    })
}
