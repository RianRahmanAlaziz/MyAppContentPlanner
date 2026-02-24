"use client";

import React from "react";
import { LoaderCircle, Eye } from "lucide-react";
import type { AuditLogItem } from "@/components/hooks/admin/auditlogs/useAuditLogs";

function fmtDate(iso: string) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

function badgeClass(event: string) {
    if (event.includes("deleted")) return "badge badge-danger";
    if (event.includes("created")) return "badge badge-success";
    if (event.includes("updated") || event.includes("role_changed")) return "badge badge-warning";
    if (event.includes("status_moved")) return "badge badge-primary";
    return "badge badge-secondary";
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
        <>
            <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
                <table className="table table-report -mt-2">
                    <thead>
                        <tr>
                            <th className="whitespace-nowrap">TIME</th>
                            <th className="whitespace-nowrap">EVENT</th>
                            <th className="whitespace-nowrap">ENTITY</th>
                            <th className="whitespace-nowrap">ACTOR</th>
                            <th className="whitespace-nowrap">WORKSPACE</th>
                            <th className="whitespace-nowrap">MESSAGE</th>
                            <th className="text-center whitespace-nowrap">ACTIONS</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-6">
                                    <div className="flex justify-center items-center">
                                        <LoaderCircle className="w-6 h-6 animate-spin text-gray-500" />
                                    </div>
                                </td>
                            </tr>
                        ) : items.length ? (
                            items.map((it) => (
                                <tr key={it.id} className="intro-x">
                                    <td className="whitespace-nowrap">{fmtDate(it.created_at)}</td>
                                    <td className="whitespace-nowrap">
                                        <span className={badgeClass(it.event)}>{it.event}</span>
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {it.entity_type}
                                        {it.entity_id ? ` #${it.entity_id}` : ""}
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {it.actor ? (
                                            <div>
                                                <div className="font-medium">{it.actor.name}</div>
                                                <div className="text-slate-500 text-xs">{it.actor.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">System</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {it.workspace ? (
                                            <div>
                                                <div className="font-medium">{it.workspace.name}</div>
                                                <div className="text-slate-500 text-xs">{it.workspace.slug}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">—</span>
                                        )}
                                    </td>
                                    <td className="max-w-90">
                                        <div className="truncate">{it.message || "—"}</div>
                                    </td>
                                    <td className="table-report__action w-40">
                                        <div className="flex justify-center items-center">
                                            <button
                                                type="button"
                                                className="flex items-center text-primary"
                                                onClick={() => onOpenDetail(it)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> Detail
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-slate-500">
                                    Tidak ada audit log
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>

    );
}