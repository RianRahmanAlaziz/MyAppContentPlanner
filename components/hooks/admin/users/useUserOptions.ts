"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export type UserOptionItem = {
    id: number;
    name: string;
    email: string;
};

type Option<T extends string | number> = { value: T; label: string };

export default function useUserOptions() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<UserOptionItem[]>([]);

    const options = useMemo<Option<number | "">[]>(() => {
        return [
            { value: "", label: "All Assignees" },
            ...items.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.email})`,
            })),
        ];
    }, [items]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `/admin/users?per_page=1000`
            );

            const raw =
                res?.data?.data?.data ??
                res?.data?.data ??
                [];

            const mapped: UserOptionItem[] = Array.isArray(raw)
                ? raw.map((x: any) => ({
                    id: Number(x.id),
                    name: String(x.name),
                    email: String(x.email),
                }))
                : [];

            setItems(mapped);
        } catch (e: unknown) {
            const err = e as AxiosError<any>;
            console.error("Gagal mengambil data user options:", err.response?.data || err.message);
            toast.error("Gagal load assignee options");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUsers();
    }, []);

    return { loading, options };
}