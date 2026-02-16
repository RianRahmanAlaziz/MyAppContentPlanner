
export type Platform = "ig" | "tiktok" | "youtube";
export type Priority = "low" | "med" | "high";

export type ContentStatus =
    | "idea"
    | "production"
    | "review"
    | "scheduled"
    | "published";

export type UserLite = {
    id: number;
    name: string;
    email: string;
};

export type Content = {
    id: number;
    workspace_id: number;

    platform: Platform;
    content_type: string;

    title: string;
    hook?: string | null;
    script?: string | null;
    caption?: string | null;
    hashtags?: string | null;

    status: ContentStatus;
    priority?: Priority | null;
    tags?: string[] | null;

    assignee_id?: number | null;
    assignee?: UserLite | null;

    created_by?: number;
    creator?: UserLite | null;

    due_at?: string | null;
    scheduled_at?: string | null;
    published_at?: string | null;

    created_at?: string;
    updated_at?: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    meta?: any;
    links?: any;
};