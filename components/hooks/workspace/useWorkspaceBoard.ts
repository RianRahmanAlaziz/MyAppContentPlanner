"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { Content, ContentStatus, PaginatedResponse, Platform, Priority } from "@/components/pages/workspace/types/content";

export type BoardColumn = {
    id: ContentStatus;
    title: string;
    items: Content[];
};

const STATUS_ORDER: ContentStatus[] = [
    "idea",
    "production",
    "review",
    "scheduled",
    "published",
];

const STATUS_TITLE: Record<ContentStatus, string> = {
    idea: "Idea",
    production: "Production",
    review: "Review",
    scheduled: "Scheduled",
    published: "Published",
};

function buildEmptyColumns(): BoardColumn[] {
    return STATUS_ORDER.map((s) => ({
        id: s,
        title: STATUS_TITLE[s],
        items: [],
    }));
}

function groupIntoColumns(contents: Content[]): BoardColumn[] {
    const base = buildEmptyColumns();
    const map = new Map<ContentStatus, Content[]>();
    for (const s of STATUS_ORDER) map.set(s, []);

    for (const c of contents) {
        const s = c.status;
        if (map.has(s)) map.get(s)!.push(c);
    }

    return base.map((col) => ({
        ...col,
        items: map.get(col.id) ?? [],
    }));
}

export type CreateContentPayload = {
    platform: Platform;
    content_type: string;
    title: string;
    priority?: Priority;
    due_at?: string;       // "YYYY-MM-DD HH:mm:ss" atau ISO string
    scheduled_at?: string; // optional
    assignee_id?: number;
    tags?: string[];
};

export function useWorkspaceBoard(workspaceId: string) {
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState<BoardColumn[]>(buildEmptyColumns);
    const [meta, setMeta] = useState<any>(null);

    const fetchContents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<PaginatedResponse<Content>>(
                `/workspace/${workspaceId}/contents`
            );

            const items = res.data?.data ?? [];
            setMeta(res.data?.meta ?? null);
            setColumns(groupIntoColumns(items));
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Gagal memuat board");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        if (!workspaceId) return;
        fetchContents();
    }, [workspaceId, fetchContents]);

    const moveContent = useCallback(
        async (contentId: number, toStatus: ContentStatus) => {
            // optimistic update: pindah di UI dulu
            setColumns((prev) => {
                // find content
                let moving: Content | null = null;
                let fromStatus: ContentStatus | null = null;

                for (const col of prev) {
                    const found = col.items.find((x) => x.id === contentId);
                    if (found) {
                        moving = found;
                        fromStatus = col.id;
                        break;
                    }
                }
                if (!moving || !fromStatus) return prev;
                if (fromStatus === toStatus) return prev;

                const next = prev.map((c) => ({
                    ...c,
                    items: c.items.filter((x) => x.id !== contentId),
                }));

                const target = next.find((c) => c.id === toStatus);
                if (!target) return prev;

                // update status on object (so UI consistent)
                const updated: Content = { ...moving, status: toStatus };

                target.items = [updated, ...target.items]; // masuk atas kolom
                return next;
            });

            try {
                await axiosInstance.patch(`/contents/${contentId}/move`, {
                    status: toStatus,
                });
            } catch (err: any) {
                // revert: fetch ulang (paling aman)
                toast.error(err?.response?.data?.message || "Gagal memindahkan status");
                await fetchContents();
            }
        },
        [fetchContents]
    );

    const createContent = useCallback(
        async (payload: CreateContentPayload) => {
            try {
                const res = await axiosInstance.post(`/workspace/${workspaceId}/contents`, {
                    ...payload,
                    status: "idea", // default masuk idea
                });

                const created: Content = res.data?.data ?? res.data; // jaga-jaga kalau format beda
                toast.success("Content dibuat");

                // insert ke kolom idea (optimistic, tanpa refetch)
                setColumns((prev) => {
                    const next = prev.map((c) => ({ ...c, items: [...c.items] }));
                    const ideaCol = next.find((c) => c.id === "idea");
                    if (ideaCol) ideaCol.items = [created, ...ideaCol.items];
                    return next;
                });

                return created;
            } catch (err: any) {
                const status = err?.response?.status;
                const data = err?.response?.data;

                if (status === 422) {
                    const msg =
                        data?.error?.details?.title?.[0] ||
                        data?.error?.details?.platform?.[0] ||
                        data?.error?.details?.content_type?.[0] ||
                        data?.message ||
                        "Validasi gagal";
                    toast.error(msg);
                    return null;
                }

                toast.error(data?.message || "Gagal membuat content");
                return null;
            }
        },
        [workspaceId]
    );

    const reorderWithinColumn = useCallback(
        (status: ContentStatus, orderedIds: number[]) => {
            // UI-only reorder (backend belum ada sort_order)
            setColumns((prev) => {
                const col = prev.find((c) => c.id === status);
                if (!col) return prev;

                const map = new Map<number, Content>();
                for (const item of col.items) map.set(item.id, item);

                const newItems: Content[] = [];
                for (const id of orderedIds) {
                    const it = map.get(id);
                    if (it) newItems.push(it);
                }

                // kalau ada item yang tidak masuk, append (safety)
                for (const it of col.items) {
                    if (!orderedIds.includes(it.id)) newItems.push(it);
                }

                return prev.map((c) => (c.id === status ? { ...c, items: newItems } : c));
            });
        },
        []
    );

    const flatItems = useMemo(() => columns.flatMap((c) => c.items), [columns]);

    return {
        loading,
        columns,
        meta,
        flatItems,
        refetch: fetchContents,
        moveContent,
        createContent,
        reorderWithinColumn,
    };
}