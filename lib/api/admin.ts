import { api } from "./client";

export type UserResponse = {
    id: number;
    email: string;
    username: string;
    is_active: boolean;
    created_at: string;
    role: "admin" | "user";
};

export type AdminCreateUser = {
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
};

export function fetchAdminUsers() {
    return api<UserResponse[]>("/auth/users/get-users", { auth: true });
}

export function adminAddUser(body: AdminCreateUser) {
    return api<UserResponse>("/auth/users/add-users", {
        method: "POST",
        body,
        auth: true,
    });
}

export function adminDeleteUser(userId: number) {
    return api<void>(`/auth/users/delete-user/${userId}`, {
        method: "DELETE",
        auth: true,
    });
}
