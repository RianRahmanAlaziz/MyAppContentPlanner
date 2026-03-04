"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { Content } from "@/components/pages/workspace/types/content";

export function useWorkspaceCalendar(workspaceSlug: string) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<Content[]>([]);

    // modal states
    const [createOpen, setCreateOpen] = useState(false);
    const [detailId, setDetailId] = useState<number | null>(null);

    const fetchContents = useCallback(async () => {
        setLoading(true);

        try {
            const res = await axiosInstance.get(`/workspace/${workspaceSlug}/contents`);

            const data = res.data?.data ?? [];
            setItems(data);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Gagal memuat calendar");
        } finally {
            setLoading(false);
        }
    }, [workspaceSlug]);

    useEffect(() => {
        if (!workspaceSlug) return;
        fetchContents();
    }, [workspaceSlug, fetchContents]);

    /**
     * OPEN CREATE MODAL
     */
    const openCreateModal = () => {
        setCreateOpen(true);
    };

    /**
     * OPEN DETAIL MODAL
     */
    const openDetailModal = (contentId: number) => {
        setDetailId(contentId);
    };

    /**
     * UPDATE SCHEDULED DATE (drag event)
     */
    const moveScheduledAt = async (contentId: number, isoDate: string) => {
        try {
            await axiosInstance.patch(`/contents/${contentId}/schedule`, {
                scheduled_at: isoDate,
            });

            setItems((prev) =>
                prev.map((item) =>
                    item.id === contentId ? { ...item, scheduled_at: isoDate } : item
                )
            );

            toast.success("Schedule updated");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Gagal update schedule");
            throw err;
        }
    };

    return {
        loading,
        items,

        createOpen,
        setCreateOpen,

        detailId,
        setDetailId,

        openCreateModal,
        openDetailModal,

        moveScheduledAt,

        refetch: fetchContents,
    };
}