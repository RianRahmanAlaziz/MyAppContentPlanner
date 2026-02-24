"use client";

import React, { useMemo } from "react";
import Modal from "@/components/ui/Modal";
import type { AuditLogItem } from "@/components/hooks/admin/auditlogs/useAuditLogs";

function PrettyJson({ value }: { value: any }) {
    const text = useMemo(() => {
        try {
            return JSON.stringify(value ?? null, null, 2);
        } catch {
            return String(value);
        }
    }, [value]);

    return (
        <pre className="bg-slate-900 text-slate-50 rounded-lg p-3 text-xs overflow-auto max-h-[360px]">
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
    if (!item) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Audit Detail #${item.id}`} hideSave>
            <div className="space-y-4">
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-6">
                        <div className="text-slate-500 text-xs">Event</div>
                        <div className="font-medium">{item.event}</div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="text-slate-500 text-xs">Entity</div>
                        <div className="font-medium">
                            {item.entity_type}
                            {item.entity_id ? ` #${item.entity_id}` : ""}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="text-slate-500 text-xs">Actor</div>
                        <div className="font-medium">
                            {item.actor ? `${item.actor.name} (${item.actor.email})` : "System"}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="text-slate-500 text-xs">Workspace</div>
                        <div className="font-medium">
                            {item.workspace ? `${item.workspace.name} (${item.workspace.slug || "-"})` : "—"}
                        </div>
                    </div>
                    <div className="col-span-12">
                        <div className="text-slate-500 text-xs">Message</div>
                        <div className="font-medium">{item.message || "—"}</div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-6">
                        <div className="font-semibold mb-2">Before</div>
                        <PrettyJson value={item.before} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="font-semibold mb-2">After</div>
                        <PrettyJson value={item.after} />
                    </div>
                </div>

                <div>
                    <div className="font-semibold mb-2">Meta</div>
                    <PrettyJson value={item.meta} />
                </div>
            </div>
        </Modal>
    );
}