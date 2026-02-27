"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, Plus, Clock } from "lucide-react";
import type { Content, ContentStatus } from "@/components/pages/workspace/types/content";
import type { BoardColumn } from "@/components/hooks/workspace/useWorkspaceBoard";
import InputWorkspaceBoard, { defaultContentFormData, type ContentFormData, type ContentFormErrors } from "../input/InputWorkspaceBoard";
import type { CreateContentPayload } from "@/components/hooks/workspace/useWorkspaceBoard";
import Modal from "@/components/ui/Modal";

/** -------- helpers -------- */
function combineDateTime(date: string, time: string) {
    if (!date) return undefined;
    const t = time?.trim() ? time : "09:00";
    return `${date} ${t}:00`;
}

function findColumnIdByItemId(cols: BoardColumn[], itemId: number): ContentStatus | null {
    for (const c of cols) {
        if (c.items.some((it) => it.id === itemId)) return c.id;
    }
    return null;
}

function getItemById(cols: BoardColumn[], itemId: number): Content | null {
    for (const c of cols) {
        const found = c.items.find((it) => it.id === itemId);
        if (found) return found;
    }
    return null;
}

function indexOfItem(cols: BoardColumn[], columnId: ContentStatus, itemId: number) {
    const col = cols.find((c) => c.id === columnId);
    if (!col) return -1;
    return col.items.findIndex((it) => it.id === itemId);
}

function removeItem(cols: BoardColumn[], itemId: number): BoardColumn[] {
    return cols.map((c) => ({ ...c, items: c.items.filter((it) => it.id !== itemId) }));
}

function insertItemAt(cols: BoardColumn[], columnId: ContentStatus, index: number, item: Content): BoardColumn[] {
    return cols.map((c) => {
        if (c.id !== columnId) return c;
        const next = [...c.items];
        const safeIndex = Math.max(0, Math.min(index, next.length));
        next.splice(safeIndex, 0, item);
        return { ...c, items: next };
    });
}

function moveItemAcross(
    cols: BoardColumn[],
    activeId: number,
    toCol: ContentStatus,
    overItemId?: number | null
) {
    const fromCol = findColumnIdByItemId(cols, activeId);
    if (!fromCol) return cols;

    const moving = getItemById(cols, activeId);
    if (!moving) return cols;

    const cleaned = removeItem(cols, activeId);

    // drop di kolom (bukan di item): taruh di bawah
    if (!overItemId) {
        const toItems = cleaned.find((c) => c.id === toCol)?.items ?? [];
        return insertItemAt(cleaned, toCol, toItems.length, { ...moving, status: toCol });
    }

    // drop di atas item tertentu: taruh di index item tsb
    const idx = indexOfItem(cleaned, toCol, overItemId);
    const targetIndex = idx === -1 ? (cleaned.find((c) => c.id === toCol)?.items.length ?? 0) : idx;

    return insertItemAt(cleaned, toCol, targetIndex, { ...moving, status: toCol });
}

function formatShortDate(value?: string | null): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function Badge({ label, tone }: { label: string; tone: "blue" | "amber" | "purple" | "slate" }) {
    const cls =
        tone === "blue"
            ? "bg-blue-50 text-blue-700 ring-blue-200"
            : tone === "amber"
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : tone === "purple"
                    ? "bg-purple-50 text-purple-700 ring-purple-200"
                    : "bg-slate-50 text-slate-700 ring-slate-200";

    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${cls}`}>{label}</span>;
}

function platformTone(p: string) {
    if (p === "ig") return "purple";
    if (p === "tiktok") return "slate";
    return "blue";
}

function priorityTone(p?: string | null) {
    if (p === "high") return "amber";
    if (p === "low") return "slate";
    return "blue";
}

function columnTheme(status: ContentStatus) {
    switch (status) {
        case "idea":
            return {
                header: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
                ring: "ring-purple-200",
                body: "bg-purple-50/40",
                over: "bg-purple-50/70",
                text: "text-white",
                count: "bg-white/20 text-white ring-white/30",
                iconHover: "hover:bg-white/15",
            };
        case "production":
            return {
                header: "bg-gradient-to-r from-blue-500 to-sky-500",
                ring: "ring-blue-200",
                body: "bg-blue-50/40",
                over: "bg-blue-50/70",
                text: "text-white",
                count: "bg-white/20 text-white ring-white/30",
                iconHover: "hover:bg-white/15",
            };
        case "review":
            return {
                header: "bg-gradient-to-r from-amber-500 to-orange-500",
                ring: "ring-amber-200",
                body: "bg-amber-50/40",
                over: "bg-amber-50/70",
                text: "text-white",
                count: "bg-white/20 text-white ring-white/30",
                iconHover: "hover:bg-white/15",
            };
        case "scheduled":
            return {
                header: "bg-gradient-to-r from-emerald-500 to-teal-500",
                ring: "ring-emerald-200",
                body: "bg-emerald-50/40",
                over: "bg-emerald-50/70",
                text: "text-white",
                count: "bg-white/20 text-white ring-white/30",
                iconHover: "hover:bg-white/15",
            };
        case "published":
            return {
                header: "bg-gradient-to-r from-slate-600 to-slate-500",
                ring: "ring-slate-200",
                body: "bg-slate-50/50",
                over: "bg-slate-50/80",
                text: "text-white",
                count: "bg-white/20 text-white ring-white/30",
                iconHover: "hover:bg-white/15",
            };
        default:
            return {
                header: "bg-white",
                ring: "ring-slate-200",
                body: "bg-white",
                over: "bg-slate-50",
                text: "text-slate-800",
                count: "bg-slate-100 text-slate-700 ring-slate-200",
                iconHover: "hover:bg-slate-50",
            };
    }
}

/** -------- UI components -------- */
function ColumnHeader({ title, count, columnId, onAdd }: { title: string; count: number; columnId: ContentStatus; onAdd: () => void }) {
    const t = columnTheme(columnId);
    return (
        <div className={`flex items-center justify-between px-4 py-3 border-b  rounded-t-xl ${t.header}`} >
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-semibold text-slate-700">
                    {count}
                </span>
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600"
                aria-label={`Add to ${title}`}
            >
                <Plus className="h-4 w-4" />
            </button>
        </div >
    );
}

function TaskCardView({ item }: { item: Content }) {
    const assigneeName = item.assignee?.name ?? "Unassigned";

    const dateLabel =
        item.status === "scheduled" ? formatShortDate(item.scheduled_at) : formatShortDate(item.due_at);

    const dateText = item.status === "scheduled" ? "Schedule" : "Due";

    return (
        <div className="rounded-xl bg-white border-2 shadow-sm p-3">
            <div className="flex items-start justify-between gap-2 border-b pb-2">
                <div className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</div>
                <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600"
                    aria-label="More options"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <span className="truncate max-w-[140px]">{assigneeName}</span>

                <div className="ml-auto flex flex-wrap gap-1 justify-end">
                    <Badge label={item.platform.toUpperCase()} tone={platformTone(item.platform)} />
                    <Badge label={item.content_type} tone="slate" />
                    <Badge label={(item.priority ?? "med").toUpperCase()} tone={priorityTone(item.priority)} />
                </div>
            </div>

            {dateLabel && (
                <div className="mt-3 flex items-center justify-end gap-1 text-xs text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>
                        {dateText}: {dateLabel}
                    </span>
                </div>
            )}
        </div>
    );
}

function SortableTaskCard({ item }: { item: Content }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={isDragging ? "opacity-40" : ""}>
            <div {...attributes} {...listeners}>
                <TaskCardView item={item} />
            </div>
        </div>
    );
}

function DroppableColumnBody({
    id,
    children,
}: {
    id: ContentStatus;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const t = columnTheme(id);
    return (
        <div
            ref={setNodeRef}
            className={[
                "p-3 space-y-3 flex-1 min-h-[120px] rounded-b-xl transition",
                t.body,
                isOver ? t.over : "",
            ].join(" ")}
        >
            {children}
        </div>
    );
}

function Column({
    column,
    onAdd,
}: {
    column: BoardColumn;
    onAdd: (columnId: ContentStatus) => void;
}) {
    const t = columnTheme(column.id);
    return (
        <div
            className={`rounded-xl border-2 shadow-sm flex flex-col min-w-[255px] ${t.ring}`}
        >
            <ColumnHeader title={column.title} count={column.items.length} columnId={column.id} onAdd={() => onAdd(column.id)} />

            <SortableContext items={column.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <DroppableColumnBody id={column.id}>
                    {column.items.map((item) => (
                        <SortableTaskCard key={item.id} item={item} />
                    ))}
                </DroppableColumnBody>
            </SortableContext>
        </div>
    );
}

/** -------- main -------- */
type Props = {
    loading: boolean;
    columns: BoardColumn[];
    onCreate: (payload: CreateContentPayload) => Promise<any>;
    onMove: (contentId: number, toStatus: ContentStatus) => Promise<void>;
    onReorderUIOnly: (status: ContentStatus, orderedIds: number[]) => void;
};

export default function WorkspaceBoard({ loading, columns, onCreate, onMove, onReorderUIOnly }: Props) {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<ContentFormData>(defaultContentFormData);
    const [errors, setErrors] = useState<ContentFormErrors>({});
    const [saving, setSaving] = useState(false);

    // contoh options members/tags
    const membersOptions = useMemo(() => {
        // kalau kamu punya data member dari props/hook, map ke option
        // return members.map(m => ({ value: m.id, label: m.name }));
        return [];
    }, []);

    const tagOptions = useMemo(() => {
        return [
            { value: "promo", label: "promo" },
            { value: "ramadan", label: "ramadan" },
            { value: "launch", label: "launch" },
        ];
    }, []);

    // ✅ local UI state (biar drag antar kolom halus)
    const [localColumns, setLocalColumns] = useState<BoardColumn[]>(columns);

    // sync bila parent update columns (mis. dari API)
    useEffect(() => {
        setLocalColumns(columns);
    }, [columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    );

    const activeItem = useMemo(() => {
        return activeId ? getItemById(localColumns, activeId) : null;
    }, [activeId, localColumns]);

    const openCreate = () => setCreateOpen(true);
    const closeCreate = () => setCreateOpen(false);

    const onAdd = (_columnId: ContentStatus) => {
        setFormData(defaultContentFormData);
        setErrors({});
        setIsOpen(true);
    };

    async function handleSave() {
        // validasi minimal
        const nextErr: ContentFormErrors = {};
        if (!formData.title.trim()) nextErr.title = "Judul wajib diisi";
        if (!formData.platform) nextErr.platform = "Pilih platform";
        if (!formData.content_type) nextErr.content_type = "Pilih tipe konten";

        const due_at = combineDateTime(formData.due_date, formData.due_time);
        const scheduled_at = combineDateTime(formData.scheduled_date, formData.scheduled_time);
        if (!due_at && !scheduled_at) {
            nextErr.due_date = "Isi Due atau Scheduled";
            nextErr.scheduled_date = "Isi Due atau Scheduled";
        }

        if (Object.keys(nextErr).length) {
            setErrors(nextErr);
            return;
        }

        const payload: CreateContentPayload = {
            title: formData.title.trim(),
            platform: formData.platform!.value as any,
            content_type: formData.content_type!.value,
            priority: (formData.priority?.value as any) ?? "med",
            assignee_id: formData.assignee?.value,
            due_at,
            scheduled_at,
            tags: formData.tags.map((t) => t.value),
        };

        setSaving(true);
        try {
            const created = await onCreate(payload);
            if (created) setIsOpen(false);
        } finally {
            setSaving(false);
        }
    }

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(Number(event.active.id));
    };

    // ✅ LIVE MOVE saat hover antar kolom
    const onDragOver = (event: DragOverEvent) => {
        const active = Number(event.active.id);
        const overId = event.over?.id ? String(event.over.id) : null;
        if (!overId) return;

        const fromColId = findColumnIdByItemId(localColumns, active);
        if (!fromColId) return;

        // over bisa: itemId (number) atau columnId (string status)
        const overAsNumber = Number(overId);

        const toColId: ContentStatus | null =
            Number.isFinite(overAsNumber) && !Number.isNaN(overAsNumber)
                ? findColumnIdByItemId(localColumns, overAsNumber)
                : (localColumns.some((c) => c.id === (overId as any)) ? (overId as ContentStatus) : null);

        if (!toColId) return;
        if (fromColId === toColId) return;

        setLocalColumns((prev) => moveItemAcross(prev, active, toColId, Number.isFinite(overAsNumber) ? overAsNumber : null));
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const active = Number(event.active.id);
        const overId = event.over?.id ? String(event.over.id) : null;

        setActiveId(null);
        if (!overId) return;

        const fromColId = findColumnIdByItemId(localColumns, active);
        if (!fromColId) return;

        const overAsNumber = Number(overId);

        const toColId: ContentStatus | null =
            Number.isFinite(overAsNumber) && !Number.isNaN(overAsNumber)
                ? findColumnIdByItemId(localColumns, overAsNumber)
                : (localColumns.some((c) => c.id === (overId as any)) ? (overId as ContentStatus) : null);

        if (!toColId) return;

        // 1) reorder di kolom yang sama
        if (fromColId === toColId) {
            const oldIndex = indexOfItem(localColumns, fromColId, active);
            const newIndex =
                Number.isFinite(overAsNumber) && !Number.isNaN(overAsNumber)
                    ? indexOfItem(localColumns, toColId, overAsNumber)
                    : oldIndex;

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

            setLocalColumns((prev) => {
                const col = prev.find((c) => c.id === fromColId);
                if (!col) return prev;

                const nextItems = arrayMove(col.items, oldIndex, newIndex);
                const nextCols = prev.map((c) => (c.id === fromColId ? { ...c, items: nextItems } : c));

                // persist urutan (UI-only atau backend)
                onReorderUIOnly(fromColId, nextItems.map((x) => x.id));

                return nextCols;
            });

            return;
        }

        // 2) pindah kolom → persist ke backend
        try {
            await onMove(active, toColId);
            // optional: setelah success, biarkan parent refresh columns;
            // localColumns sudah oke.
        } catch (e) {
            // kalau gagal, rollback ke prop columns (state terakhir dari server)
            setLocalColumns(columns);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between pt-24">
                <h2 className="intro-y text-lg font-medium">Workspace Board</h2>
            </div>

            <div className="mt-5 rounded-2xl p-4 ring-1 ring-slate-200">
                {loading ? (
                    <div className="p-6 text-slate-600">Loading board...</div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                    >
                        <div className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
                            {localColumns.map((col) => (
                                <Column key={col.id} column={col} onAdd={onAdd} />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeItem ? (
                                <div className="w-[280px]">
                                    <TaskCardView item={activeItem} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Create Content"
                onSave={handleSave}
            >
                <InputWorkspaceBoard
                    mode="create"
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    membersOptions={membersOptions}
                    tagOptions={tagOptions}
                />
                {saving ? <div className="mt-3 text-xs text-slate-500">Saving...</div> : null}
            </Modal>

        </>
    );
}