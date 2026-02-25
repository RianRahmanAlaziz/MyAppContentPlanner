"use client";

import React, { useMemo, useState } from "react";
import type { AuditLogItem } from "@/components/hooks/admin/auditlogs/useAuditLogs";
import DetailModal from "@/components/ui/DetailModal";
import {
    ArrowRight,
    Clock,
    User as UserIcon,
    Building2,
    Tag,
    FileText,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

function fmtDate(iso?: string | null) {
    if (!iso) return "—";
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

function Chip({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mt-0.5 text-slate-500">{icon}</div>
            <div className="min-w-0">
                <div className="text-[11px] text-slate-500">{label}</div>
                <div className="text-sm font-medium text-slate-900 break-words">
                    {value}
                </div>
            </div>
        </div>
    );
}

/** Flatten object jadi key -> value utk compare sederhana */
function flatten(obj: any, prefix = ""): Record<string, any> {
    const out: Record<string, any> = {};
    if (!obj || typeof obj !== "object") return out;

    for (const key of Object.keys(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        const val = obj[key];

        // skip noisy keys
        if (["updated_at", "created_at", "deleted_at"].includes(key)) continue;

        if (val && typeof val === "object" && !Array.isArray(val)) {
            Object.assign(out, flatten(val, path));
        } else {
            out[path] = val;
        }
    }
    return out;
}

function computeDiff(before: any, after: any) {
    const b = flatten(before);
    const a = flatten(after);

    const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)])).sort();
    const changes: { key: string; from: any; to: any }[] = [];

    for (const k of keys) {
        const from = b[k];
        const to = a[k];
        // compare stringified to handle null/number
        if (JSON.stringify(from) !== JSON.stringify(to)) {
            changes.push({ key: k, from, to });
        }
    }
    return changes;
}

function DiffRow({ k, from, to }: { k: string; from: any; to: any }) {
    const show = (v: any) => {
        if (v === null || v === undefined || v === "") return "—";
        if (typeof v === "boolean") return v ? "Yes" : "No";
        if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
        return String(v);
    };

    return (
        <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100 last:border-b-0">
            <div className="col-span-12 md:col-span-4">
                <div className="text-xs text-slate-500">Field</div>
                <div className="font-medium text-slate-900 break-words">{k}</div>
            </div>
            <div className="col-span-6 md:col-span-4">
                <div className="text-xs text-slate-500">Before</div>
                <div className="text-sm text-slate-700 break-words">{show(from)}</div>
            </div>
            <div className="col-span-6 md:col-span-4">
                <div className="text-xs text-slate-500">After</div>
                <div className="text-sm text-slate-700 break-words flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
                    <span>{show(to)}</span>
                </div>
            </div>
        </div>
    );
}

function PrettyJson({ value }: { value: any }) {
    const text = useMemo(() => {
        try {
            return JSON.stringify(value ?? null, null, 2);
        } catch {
            return String(value);
        }
    }, [value]);

    return (
        <pre className="bg-slate-900 text-slate-50 rounded-xl p-4 text-xs overflow-auto max-h-[360px]">
            {text}
        </pre>
    );
}

export default function AuditLogDetailModal({
    isOpen,
    onClose,
    item,
}: {
    isOpen: boolean;
    onClose: () => void;
    item: AuditLogItem | null;
}) {
    const [showTech, setShowTech] = useState(false);
    if (!item) return null;

    const actorText = item.actor
        ? `${item.actor.name} (${item.actor.email})`
        : "System";

    const workspaceText = item.workspace
        ? `${item.workspace.name}${item.workspace.slug ? ` (${item.workspace.slug})` : ""}`
        : "—";

    const entityText = `${item.entity_type}${item.entity_id ? ` #${item.entity_id}` : ""}`;

    const changes = useMemo(() => computeDiff(item.before, item.after), [item.before, item.after]);

    // fallback kalau before/after null semua
    const hasDiff = changes.length > 0;

    return (
        <DetailModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Audit Detail #${item.id}`}
            hideSave
        >
            <div className="space-y-5">
                {/* Header summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                            {humanEvent(item.event)}
                        </span>
                        <span className="text-xs text-slate-500">({item.event})</span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Chip icon={<Clock className="w-4 h-4" />} label="Waktu" value={fmtDate(item.created_at)} />
                        <Chip icon={<UserIcon className="w-4 h-4" />} label="User" value={actorText} />
                        <Chip icon={<Building2 className="w-4 h-4" />} label="Workspace" value={workspaceText} />
                        <Chip icon={<Tag className="w-4 h-4" />} label="Entity" value={entityText} />
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <div className="flex items-center gap-2 text-slate-600">
                            <FileText className="w-4 h-4" />
                            <div className="text-xs text-slate-500">Message</div>
                        </div>
                        <div className="mt-1 ml-6 text-sm font-medium text-slate-900 whitespace-pre-wrap break-words">
                            {item.message || "—"}
                        </div>
                    </div>
                </div>

                {/* Human friendly changes */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">Perubahan</div>
                        <div className="text-xs text-slate-500">
                            {hasDiff ? `${changes.length} perubahan` : "Tidak ada perubahan terdeteksi"}
                        </div>
                    </div>

                    <div className="mt-3">
                        {hasDiff ? (
                            <div className="divide-y divide-slate-100">
                                {changes.slice(0, 20).map((c) => (
                                    <DiffRow key={c.key} k={c.key} from={c.from} to={c.to} />
                                ))}

                                {changes.length > 20 && (
                                    <div className="pt-3 text-xs text-slate-500">
                                        Menampilkan 20 perubahan pertama. Lihat detail teknis untuk lengkapnya.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-600">
                                Tidak ada diff yang bisa dihitung (mungkin karena before/after null atau event hanya log message).
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapsible technical detail */}
                <div className="rounded-2xl border border-slate-200 bg-white">
                    <button
                        type="button"
                        onClick={() => setShowTech((v) => !v)}
                        className="w-full flex items-center justify-between px-4 py-3"
                    >
                        <div className="text-sm font-semibold text-slate-900">Detail teknis (JSON)</div>
                        {showTech ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                    </button>

                    {showTech && (
                        <div className="px-4 pb-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-semibold mb-2">Before</div>
                                    <PrettyJson value={item.before} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold mb-2">After</div>
                                    <PrettyJson value={item.after} />
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-semibold mb-2">Meta</div>
                                <PrettyJson value={item.meta} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DetailModal>
    );
}