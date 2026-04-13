import { api } from "@/lib/api/client";

type CoverPayload = {
    entity_id: string;
    position: number;
};

type CoverResponse = {
    success: boolean;
    message: string;
};

export function setCover(payload: CoverPayload) {
    return api<CoverResponse>("/homecontrollers/cover", {
        method: "POST",
        body: payload,
        auth: true,
    });
}
