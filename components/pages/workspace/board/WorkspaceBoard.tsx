"use client";

import React, { useMemo, useState } from "react";
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
import type { BoardColumn } from "@/components/hooks/workspaces/useWorkspaceBoard";
import InputWorkspaceBoard from "./InputWorkspaceBoard";
import type { CreateContentPayload } from "@/components/hooks/workspaces/useWorkspaceBoard";

function findColumnIdByItemId(columns: BoardColumn[], itemId: number): ContentStatus | null {
    for (const col of columns) {
        if (col.items.some((it) => it.id === itemId)) return col.id;
    }
    return null;
}

function getItemById(columns: BoardColumn[], itemId: number): Content | null {
    for (const col of columns) {
        const found = col.items.find((it) => it.id === itemId);
        if (found) return found;
    }
    return null;
}

function removeItem(columns: BoardColumn[], itemId: number): BoardColumn[] {
    return columns.map((c) => ({ ...c, items: c.items.filter((it) => it.id !== itemId) }));
}

function insertItemAt(columns: BoardColumn[], columnId: ContentStatus, index: number, item: Content): BoardColumn[] {
    return columns.map((c) => {
        if (c.id !== columnId) return c;
        const next = [...c.items];
        next.splice(index, 0, item);
        return { ...c, items: next };
    });
}

function indexOfItem(columns: BoardColumn[], columnId: ContentStatus, itemId: number): number {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return -1;
    return col.items.findIndex((it) => it.id === itemId);
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
    return "blue"; // youtube
}

function priorityTone(p?: string | null) {
    if (p === "high") return "amber";
    if (p === "low") return "slate";
    return "blue";
}

function ColumnHeader({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-xl">
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
        </div>
    );
}

function TaskCardView({ item }: { item: Content }) {
    const assigneeName = item.assignee?.name ?? "Unassigned";

    // tanggal: kalau scheduled tampil scheduled_at, kalau tidak tampil due_at
    const dateLabel =
        item.status === "scheduled"
            ? formatShortDate(item.scheduled_at) ?? null
            : formatShortDate(item.due_at) ?? null;

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
        id: item.id, // number ok
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

function DroppableColumnBody({ id, children }: { id: ContentStatus; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`p-3 space-y-3 flex-1 min-h-[80px] ${isOver ? "bg-slate-50" : ""}`}>
            {children}
        </div>
    );
}

function Column({ column, onAdd }: { column: BoardColumn; onAdd: (columnId: ContentStatus) => void }) {
    return (
        <div className="rounded-xl bg-white/50 border-2 shadow-sm flex flex-col min-w-[250px]">
            <ColumnHeader title={column.title} count={column.items.length} onAdd={() => onAdd(column.id)} />

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    );

    const activeItem = activeId ? getItemById(columns, activeId) : null;

    const openCreate = () => setCreateOpen(true);
    const closeCreate = () => setCreateOpen(false);

    const onAdd = (_columnId: ContentStatus) => {
        // MVP: create selalu masuk kolom idea (sesuai backend)
        openCreate();
    };

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(Number(event.active.id));
    };

    const onDragOver = (event: DragOverEvent) => {
        const active = Number(event.active.id);
        const overId = event.over?.id ? event.over.id : null;
        if (!overId) return;

        const overStr = String(overId);
        const activeStr = String(active);

        // from column
        const fromColId = findColumnIdByItemId(columns, active);
        if (!fromColId) return;

        // over can be itemId or columnId
        const overAsNumber = Number(overStr);
        const overColId =
            Number.isFinite(overAsNumber) && !Number.isNaN(overAsNumber)
                ? findColumnIdByItemId(columns, overAsNumber)
                : (columns.some((c) => c.id === (overStr as any)) ? (overStr as ContentStatus) : null);

        if (!overColId) return;
        if (fromColId === overColId) return; // reorder handled in dragEnd

        const moving = getItemById(columns, active);
        if (!moving) return;

        // UI “live move” saat hover antar kolom (tanpa API dulu)
        // biar terasa halus. Final persist kita lakukan di dragEnd.
        // (Tidak wajib, tapi UI kamu sudah punya ini—kita pertahankan)
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const active = Number(event.active.id);
        const overId = event.over?.id ? event.over.id : null;

        setActiveId(null);
        if (!overId) return;

        const fromColId = findColumnIdByItemId(columns, active);
        if (!fromColId) return;

        const overStr = String(overId);
        const overAsNumber = Number(overStr);

        const toColId =
            Number.isFinite(overAsNumber) && !Number.isNaN(overAsNumber)
                ? findColumnIdByItemId(columns, overAsNumber) // drop on item
                : (columns.some((c) => c.id === (overStr as any)) ? (overStr as ContentStatus) : null);

        if (!toColId) return;

        // 1) same column reorder (UI-only)
        if (fromColId === toColId) {
            const oldIndex = indexOfItem(columns, fromColId, active);

            // if drop on item -> newIndex is that item index
            const newIndex =
                Number.isFinite(overAsNumber) && !Number.isNaN(overAsNumber)
                    ? indexOfItem(columns, toColId, overAsNumber)
                    : oldIndex;

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

            const col = columns.find((c) => c.id === fromColId);
            if (!col) return;

            const next = arrayMove(col.items, oldIndex, newIndex);
            onReorderUIOnly(fromColId, next.map((x) => x.id));
            return;
        }

        // 2) moved to another column -> persist to backend
        await onMove(active, toColId);
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
                            {columns.map((col) => (
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

            <InputWorkspaceBoard
                open={createOpen}
                onClose={closeCreate}
                onSubmit={onCreate}
            />
        </>
    );
}