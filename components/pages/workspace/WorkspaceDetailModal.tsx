"use client";

import React from "react";
import { LoaderCircle, Crown, User } from "lucide-react";

export type WorkspaceDetail = {
    id: number | string;
    name: string;
    slug: string;
    owner_id: number | string;
    created_at: string;
    updated_at: string;
    owner: {
        id: number | string;
        name: string;
        email: string;
    };
    members: Array<{
        id: number | string;
        workspace_id: number | string;
        user_id: number | string;
        role: string;
        created_at: string;
        updated_at: string;
        user: {
            id: number | string;
            name: string;
            email: string;
        };
    }>;
};

type Props = {
    loading: boolean;
    detail: WorkspaceDetail | null;
};

function formatDateHuman(dateString?: string) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";

    // contoh: "14 Feb 2026 • 13:31"
    const s = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);

    return s.replace(".", ":").replace(", ", " - ");
}

function RolePill({ role }: { role?: string }) {
    const r = (role ?? "").toLowerCase();
    if (r === "owner") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border bg-amber-50 text-amber-700 border-amber-100">
                <Crown className="w-3 h-3" /> Owner
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border bg-emerald-50 text-emerald-700 border-emerald-100">
            <User className="w-3 h-3" /> {role ?? "member"}
        </span>
    );
}

export default function WorkspaceDetailContent({ loading, detail }: Props) {
    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="flex items-center gap-3 text-slate-600">
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading workspace details…</span>
                </div>
            </div>
        );
    }

    if (!detail) {
        return <div className="text-center text-slate-500 py-10">Tidak ada data detail.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <div className="text-2xl font-semibold text-slate-900">{detail.name}</div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {detail.members?.length ?? 0} members
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-6">
                    <div className="p-4 rounded-xl border bg-slate-50">
                        <div className="text-xs text-slate-500">Owner</div>
                        <div className="mt-1 font-medium text-slate-900">{detail.owner?.name ?? "-"}</div>
                        <div className="text-sm text-slate-600">{detail.owner?.email ?? "-"}</div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-6">
                    <div className="p-4 rounded-xl border bg-slate-50">
                        <div className="text-xs text-slate-500">Timeline</div>

                        <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-500">Created</div>
                                <div className="font-medium text-slate-900">{formatDateHuman(detail.created_at)}</div>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-slate-500">Updated</div>
                                <div className="font-medium text-slate-900">{formatDateHuman(detail.updated_at)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members table */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-slate-900">
                        Members{" "}
                        <span className="text-slate-500 font-normal">({detail.members?.length ?? 0})</span>
                    </div>
                </div>

                <div className="border rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-700">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-3">User</th>
                                    <th className="text-left font-semibold px-4 py-3">Email</th>
                                    <th className="text-left font-semibold px-4 py-3">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detail.members?.map((m) => (
                                    <tr key={m.id} className="border-t hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{m.user?.name ?? "-"}</td>
                                        <td className="px-4 py-3 text-slate-600">{m.user?.email ?? "-"}</td>
                                        <td className="px-4 py-3">
                                            <RolePill role={m.role} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}