"use client";

import React from "react";
import { LoaderCircle, Eye, Clock } from "lucide-react";
import type { AuditLogItem } from "@/components/hooks/admin/auditlogs/useAuditLogs";

function fmtDateLong(iso: string) {
    try {
        return new Date(iso).toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

function timeAgo(iso: string) {
    const d = new Date(iso);
    const t = d.getTime();
    if (Number.isNaN(t)) return iso;

    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s lalu`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m lalu`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}j lalu`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} hari lalu`;
    return fmtDateLong(iso);
}

function humanEvent(event: string) {
    const map: Record<string, string> = {
        "user.created": "User dibuat",
        "user.updated": "User diperbarui",
        "user.deleted": "User dihapus",
        "workspace.created": "Workspace dibuat",
        "workspace.updated": "Workspace diperbarui",
        "workspace.deleted": "Workspace dihapus",
        "membership.added": "Member ditambahkan",
        "membership.role_changed": "Role member diubah",
        "membership.removed": "Member dihapus",
        "content.created": "Konten dibuat",
        "content.updated": "Konten diperbarui",
        "content.deleted": "Konten dihapus",
        "content.status_moved": "Status konten dipindah",
    };
    return map[event] ?? event;
}

function badgeTone(event: string) {
    if (event.includes("deleted") || event.includes("removed")) {
        return "bg-red-50 text-red-700 ring-red-200";
    }
    if (event.includes("created") || event.includes("added")) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }
    if (event.includes("updated") || event.includes("role_changed")) {
        return "bg-amber-50 text-amber-700 ring-amber-200";
    }
    if (event.includes("status_moved")) {
        return "bg-blue-50 text-blue-700 ring-blue-200";
    }
    return "bg-slate-50 text-slate-700 ring-slate-200";
}

function EmptyCell({ children }: { children: React.ReactNode }) {
    return <span className="text-slate-400">{children}</span>;
}

export default function AuditLogsTable({
    loading,
    items,
    onOpenDetail,
}: {
    loading: boolean;
    items: AuditLogItem[];
    onOpenDetail: (item: AuditLogItem) => void;
}) {
    return (
        <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
            <table className="table table-report -mt-2">
                <thead>
                    <tr>
                        <th className="whitespace-nowrap">Waktu</th>
                        <th className="whitespace-nowrap">Aktivitas</th>
                        <th className="whitespace-nowrap">Actor</th>
                        <th className="whitespace-nowrap">Workspace</th>
                        <th className="whitespace-nowrap">Ringkasan</th>
                        <th className="text-center whitespace-nowrap">Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            {/* kamu punya 6 kolom, jadi colspan 6 */}
                            <td colSpan={6} className="py-6">
                                <div className="flex justify-center items-center">
                                    <LoaderCircle className="w-6 h-6 animate-spin text-gray-500" />
                                </div>
                            </td>
                        </tr>
                    ) : items.length ? (
                        items.map((it) => (
                            <tr key={it.id} className="intro-x">
                                {/* TIME */}
                                <td className="whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <div className="font-medium text-slate-900" title={fmtDateLong(it.created_at)}>
                                                {timeAgo(it.created_at)}
                                            </div>
                                            <div className="text-xs text-slate-500">{fmtDateLong(it.created_at)}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* EVENT */}
                                <td className="whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <span
                                            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs ring-1 ${badgeTone(
                                                it.event
                                            )}`}
                                            title={it.event}
                                        >
                                            {humanEvent(it.event)}
                                        </span>
                                        <span className="text-[11px] text-slate-500">{it.event}</span>
                                    </div>
                                </td>

                                {/* ACTOR */}
                                <td className="whitespace-nowrap">
                                    {it.actor ? (
                                        <div>
                                            <div className="font-medium text-slate-900">{it.actor.name}</div>
                                            <div className="text-slate-500 text-xs">{it.actor.email}</div>
                                        </div>
                                    ) : (
                                        <EmptyCell>System</EmptyCell>
                                    )}
                                </td>

                                {/* WORKSPACE */}
                                <td className="whitespace-nowrap">
                                    {it.workspace ? (
                                        <div>
                                            <div className="font-medium text-slate-900">{it.workspace.name}</div>
                                            <div className="text-slate-500 text-xs">{it.workspace.slug || "—"}</div>
                                        </div>
                                    ) : (
                                        <EmptyCell>—</EmptyCell>
                                    )}
                                </td>

                                {/* MESSAGE */}
                                <td className="min-w-70 max-w-130">
                                    {it.message ? (
                                        <div
                                            className="text-sm text-slate-900 leading-snug wrap-break-word"
                                            style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                            title={it.message}
                                        >
                                            {it.message}
                                        </div>
                                    ) : (
                                        <EmptyCell>—</EmptyCell>
                                    )}
                                </td>

                                {/* ACTION */}
                                <td className="table-report__action w-44">
                                    <div className="flex justify-center items-center">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary inline-flex items-center gap-2"
                                            onClick={() => onOpenDetail(it)}
                                        >
                                            <Eye className="w-4 h-4" />
                                            Lihat detail
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-500">
                                Tidak ada audit log
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}