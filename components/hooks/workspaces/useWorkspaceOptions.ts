"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export type WorkspaceOptionItem = {
    id: number;
    name: string;
    slug?: string;
};

type AdminWorkspacesResponse =
    | {
        // kemungkinan format kamu: { data: [...], meta, links }
        data: any[];
        meta?: any;
        links?: any;
    }
    | {
        // kemungkinan format lain: { data: { data: [...] } }
        data: { data: any[] };
    };

type Option<T extends string | number> = { value: T; label: string };

export default function useWorkspaceOptions() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<WorkspaceOptionItem[]>([]);

    const options = useMemo<Option<number | "">[]>(() => {
        return [
            { value: "", label: "All Workspaces" },
            ...items.map((w) => ({ value: w.id, label: w.name })),
        ];
    }, [items]);

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            // ambil banyak supaya bisa jadi option
            const res = await axiosInstance.get<AdminWorkspacesResponse>(
                `/admin/workspace?per_page=1000`
            );

            // support beberapa bentuk response (biar plug & play)
            const raw =
                (res as any)?.data?.data?.data ??
                (res as any)?.data?.data ??
                [];

            const mapped: WorkspaceOptionItem[] = Array.isArray(raw)
                ? raw.map((x: any) => ({
                    id: Number(x.id),
                    name: String(x.name),
                    slug: x.slug ? String(x.slug) : undefined,
                }))
                : [];

            setItems(mapped);
        } catch (e: unknown) {
            const err = e as AxiosError<any>;
            console.error("Gagal mengambil data workspace options:", err.response?.data || err.message);
            toast.error("Gagal load workspace options");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchWorkspaces();
    }, []);

    return { loading, items, options, refetch: fetchWorkspaces };
}