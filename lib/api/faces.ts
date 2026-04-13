import { api } from "./client";

export type AddFaceResponse = {
    username: string;
    name: string;
    status: string;
};

export type AddFaceParams = {
    photoUri: string;
    username?: string;
};

export type UserFaceResponse = {
    user_id: number;
    username: string;
    name: string;
    image_base64: string;
};

export function getMyUserFace() {
    return api<UserFaceResponse>("/userfaces/me", { auth: true });
}

export function addUserFace({ photoUri, username }: AddFaceParams) {
    const formData = new FormData();

    const isJpeg = photoUri.endsWith(".jpg") || photoUri.endsWith(".jpeg");
    formData.append("image", {
        uri: photoUri,
        name: isJpeg ? "face.jpg" : "face.png",
        type: isJpeg ? "image/jpeg" : "image/png",
    } as any);

    if (username) {
        formData.append("username", username);
    }

    return api<AddFaceResponse>("/userfaces/add-userface", {
        method: "POST",
        body: formData,
        auth: true,
        multipart: true,
    });
}

export function deleteMyUserFace() {
    return api<AddFaceResponse>("/userfaces/delete-userface", {
        method: "DELETE",
        auth: true,
    });
}