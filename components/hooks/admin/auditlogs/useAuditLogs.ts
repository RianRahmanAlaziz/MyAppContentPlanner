"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export type AuditActor = { id: number; name: string; email: string; role?: string };
export type AuditWorkspace = { id: number; name: string; slug?: string };

export type AuditLogItem = {
    id: number;
    actor_id: number | null;
    workspace_id: number | null;
    event: string;
    entity_type: string;
    entity_id: number | null;
    message: string | null;
    before: any | null;
    after: any | null;
    meta: any | null;
    created_at: string;
    updated_at: string;

    actor?: AuditActor | null;
    workspace?: AuditWorkspace | null;
};

export type Meta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type Filters = {
    q: string;
    event: string;
    entity_type: string;
    entity_id: string;
    actor_id: string;
    workspace_id: string;
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
    per_page: number;
};

type ApiResponse = {
    data: AuditLogItem[];
    meta: Meta;
    links: { prev: string | null; next: string | null; first?: string; last?: string };
};

function buildQuery(filters: Filters, page: number) {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("per_page", String(filters.per_page));

    if (filters.q) p.set("q", filters.q);
    if (filters.event) p.set("event", filters.event);
    if (filters.entity_type) p.set("entity_type", filters.entity_type);
    if (filters.entity_id) p.set("entity_id", filters.entity_id);
    if (filters.actor_id) p.set("actor_id", filters.actor_id);
    if (filters.workspace_id) p.set("workspace_id", filters.workspace_id);
    if (filters.from) p.set("from", filters.from);
    if (filters.to) p.set("to", filters.to);

    return p.toString();
}

export default function useAuditLogs() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<AuditLogItem[]>([]);
    const [meta, setMeta] = useState<Meta>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    const [filters, setFilters] = useState<Filters>({
        q: "",
        event: "",
        entity_type: "",
        entity_id: "",
        actor_id: "",
        workspace_id: "",
        from: "",
        to: "",
        per_page: 20,
    });

    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<AuditLogItem | null>(null);

    const fetchLogs = async (pageToLoad: number) => {
        setLoading(true);
        try {
            const qs = buildQuery(filters, pageToLoad);
            const res = await axiosInstance.get<ApiResponse>(`/admin/audit-logs?${qs}`);

            setItems(res.data.data || []);
            setMeta(res.data.meta);
            setPage(res.data.meta.current_page);
        } catch (e: unknown) {
            const err = e as AxiosError<any>;
            console.error("Audit logs fetch failed:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Gagal mengambil audit logs");
        } finally {
            setLoading(false);
        }
    };

    // Debounce filters
    useEffect(() => {
        const t = window.setTimeout(() => void fetchLogs(1), 400);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.q,
        filters.event,
        filters.entity_type,
        filters.entity_id,
        filters.actor_id,
        filters.workspace_id,
        filters.from,
        filters.to,
        filters.per_page,
    ]);

    // First load
    useEffect(() => {
        void fetchLogs(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = (p: number) => {
        if (p < 1 || p > meta.last_page) return;
        void fetchLogs(p);
    };

    const openDetail = (item: AuditLogItem) => setSelected(item);
    const closeDetail = () => setSelected(null);

    return {
        loading,
        items,
        meta,
        filters,
        setFilters,
        selected,
        openDetail,
        closeDetail,
        handlePageChange,
    };
}