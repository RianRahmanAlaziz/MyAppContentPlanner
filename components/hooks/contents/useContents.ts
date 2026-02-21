"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export type ContentStatus =
    | "idea"
    | "brief"
    | "production"
    | "review"
    | "scheduled"
    | "published";

export type Platform = "ig" | "tiktok" | "youtube";
export type Priority = "low" | "med" | "high";

export type ContentsItem = {
    id: number;
    workspace_id: number;

    platform: Platform;
    content_type: string;
    title: string;
    hook?: string | null;

    status: ContentStatus;
    priority?: Priority | null;

    due_at?: string | null;
    scheduled_at?: string | null;
    published_at?: string | null;

    tags?: string[] | null;

    workspace?: { id: number; name: string; slug: string; owner_id: number };
    assignee?: { id: number; name: string; email: string; role: string } | null;
    creator?: { id: number; name: string; email: string; role: string } | null;

    created_at?: string;
};

export type FieldErrors = Record<string, string[] | undefined>;

export type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type Filters = {
    q: string;
    workspace_id?: number | "";
    assignee_id?: number | "";
    status?: ContentStatus | "";
    platform?: Platform | "";
    priority?: Priority | "";
    per_page: number;
    sort: string; // e.g. "-created_at"
};

type ContentsAdminResponse = {
    data: any[]; // ContentResource array
    meta: Pagination;
    links: {
        first?: string | null;
        last?: string | null;
        prev?: string | null;
        next?: string | null;
    };
};

export default function useContents() {
    const [loading, setLoading] = useState(true);
    const [contents, setContents] = useState<ContentsItem[]>([]);
    const [errors, setErrors] = useState<FieldErrors>({});

    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ContentsItem | null>(null);

    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    const [filters, setFilters] = useState<Filters>({
        q: "",
        workspace_id: "",
        assignee_id: "",
        status: "",
        platform: "",
        priority: "",
        per_page: 20,
        sort: "-created_at",
    });

    const buildQuery = (page: number) => {
        const p = new URLSearchParams();
        p.set("page", String(page));
        p.set("per_page", String(filters.per_page));
        p.set("sort", filters.sort);

        if (filters.q.trim()) p.set("q", filters.q.trim());
        if (filters.workspace_id) p.set("workspace_id", String(filters.workspace_id));
        if (filters.status) p.set("status", String(filters.status));
        if (filters.platform) p.set("platform", String(filters.platform));
        if (filters.priority) p.set("priority", String(filters.priority));
        if (filters.assignee_id) p.set("assignee_id", String(filters.assignee_id));

        return p.toString();
    };

    const fetchContents = async (page: number = 1) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<ContentsAdminResponse>(
                `/admin/contents?${buildQuery(page)}`
            );

            // Backend: { data: [...], meta: {...}, links: {...} }
            setContents(res.data.data as any);
            setPagination(res.data.meta);
        } catch (e: unknown) {
            const err = e as AxiosError<any>;
            console.error("Gagal mengambil data Content:", err.response?.data || err.message);
            toast.error("Gagal mengambil data Content 😞");
        } finally {
            setLoading(false);
        }
    };

    // Debounce search/filter
    useEffect(() => {
        const t = window.setTimeout(() => {
            void fetchContents(1);
        }, 400);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.q, filters.workspace_id, filters.assignee_id, filters.status, filters.platform, filters.priority, filters.per_page, filters.sort]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.last_page) return;
        void fetchContents(page);
    };

    // Quick move status
    const moveStatus = async (contentId: number, status: ContentStatus) => {
        // optimistic update (biar cepat)
        setContents((prev) =>
            prev.map((c) => (c.id === contentId ? { ...c, status } : c))
        );

        try {
            await axiosInstance.patch(`/admin/contents/${contentId}/move`, { status });
            toast.success("Status updated");
        } catch (e: unknown) {
            const err = e as AxiosError<any>;
            toast.error(err.response?.data?.message || "Gagal update status");
            // revert aman: refetch current page
            void fetchContents(pagination.current_page);
        }
    };

    const openModalDelete = (content: ContentsItem) => {
        setDeleteTarget(content);
        setIsOpenDelete(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axiosInstance.delete(`/admin/contents/${deleteTarget.id}`);
            toast.success("Content berhasil dihapus 🗑️");
            setIsOpenDelete(false);
            setDeleteTarget(null);
            void fetchContents(pagination.current_page);
        } catch (e: unknown) {
            const err = e as AxiosError<any>;
            console.error("Gagal menghapus Content:", err.response?.data || err.message);
            toast.error("Gagal menghapus Content ❌");
        }
    };

    return {
        loading,
        contents,
        errors,
        setErrors,

        filters,
        setFilters,

        pagination,
        handlePageChange,

        // actions
        moveStatus,
        isOpenDelete,
        setIsOpenDelete,
        openModalDelete,
        handleDelete,
        deleteTarget,

        // manual refetch
        refetch: fetchContents,
    };
}