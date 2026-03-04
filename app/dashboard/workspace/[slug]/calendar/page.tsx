"use client";

import React from "react";
import { useParams } from "next/navigation";
import WorkspaceCalendar from "@/components/pages/workspace/calendar/WorkspaceCalendar";
import { useWorkspaceCalendar } from "@/components/hooks/workspace/useWorkspaceCalendar";

export default function CalendarPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;

    const { loading, items, openCreateModal, openDetailModal, moveScheduledAt } =
        useWorkspaceCalendar(slug);

    return (
        <WorkspaceCalendar
            loading={loading}
            items={items}
            onCreate={openCreateModal}
            onOpenDetail={openDetailModal}
            onDropToDate={moveScheduledAt} // optional: kalau mau drag reschedule
        />
    );
}