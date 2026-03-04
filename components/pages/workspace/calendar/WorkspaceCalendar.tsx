"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

type Content = {
    id: number;
    title: string;
    platform: string;
    scheduled_at?: string | null;
    due_at?: string | null;
};

type Props = {
    loading: boolean;
    items: Content[];
    onCreate: () => void;
    onOpenDetail: (id: number) => void;
};

function platformColor(platform: string) {
    if (platform === "ig") return "#7c3aed";
    if (platform === "tiktok") return "#334155";
    return "#2563eb";
}

export default function WorkspaceCalendar({
    loading,
    items,
    onCreate,
    onOpenDetail,
}: Props) {
    const [view, setView] = useState("timeGridWeek");

    const events = items
        .filter((x) => x.scheduled_at)
        .map((item) => ({
            id: String(item.id),
            title: item.title,
            start: item.scheduled_at,
            backgroundColor: platformColor(item.platform),
            borderColor: platformColor(item.platform),
        }));

    return (
        <>
            {/* Header */}
            <div className="intro-y flex items-center mt-8">
                <h2 className="text-lg font-medium mr-auto">Workspace Calendar</h2>

                <button className="btn btn-primary shadow-md" onClick={onCreate}>
                    + New Content
                </button>
            </div>

            <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
                <div className="box p-5">
                    <div className="full-calendar">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: "title",
                                center: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                                right: "prev,next today",
                            }}
                            events={events}
                            height="auto"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}