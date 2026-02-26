"use client";

import React, { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Pencil, Trash2, Sparkles } from "lucide-react";

type Props = {
    onEdit: () => void;
    onDelete: () => void;
    onDetail?: () => void;
};

export default function RowActionsDropdown({ onEdit, onDelete, onDetail }: Props) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        }
        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    return (
        <div className="relative inline-flex" ref={wrapRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={[
                    "inline-flex items-center justify-center rounded-lg",
                    "border border-slate-200 bg-white px-2.5 py-2",
                    "text-slate-700 shadow-sm transition",
                    "hover:bg-slate-50 hover:shadow",
                    "active:scale-[0.98]",
                    "focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2",
                ].join(" ")}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {/* Menu (turun sedikit + animasi) */}
            <div
                role="menu"
                className={[
                    "absolute right-0 z-50 mt-10 w-56", // ⬅️ mt-2 -> mt-3, width sedikit lebih lega
                    "origin-top-right",
                    "transition duration-150 ease-out",
                    open
                        ? "pointer-events-auto translate-y-1 scale-100 opacity-100"
                        : "pointer-events-none translate-y-0 scale-95 opacity-0",
                ].join(" ")}
            >
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Sparkles className="h-3.5 w-3.5" />
                        Actions
                    </div>

                    <div className="h-px bg-slate-100" />

                    {onDetail && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                onDetail();
                            }}
                            className={[
                                "group w-full px-3 py-2.5 text-left text-sm",
                                "text-blue-600 transition",
                                "hover:bg-blue-50",
                                "focus:bg-blue-50 focus:outline-none",
                                "flex items-center gap-2",
                                "hover:translate-x-[2px]",
                            ].join(" ")}
                        >
                            <span
                                className={[
                                    "flex h-8 w-8 items-center justify-center rounded-lg",
                                    "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
                                    "transition",
                                    "group-hover:bg-white group-hover:shadow-sm group-hover:ring-blue-200",
                                ].join(" ")}
                            >
                                <Eye className="h-4 w-4" />
                            </span>

                            <span className="flex-1 font-medium group-hover:text-blue-700 transition">
                                Detail
                            </span>

                            <span className="text-xs text-blue-400 group-hover:text-blue-600 transition">
                                View
                            </span>
                        </button>
                    )}

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onEdit();
                        }}
                        className={[
                            "group w-full px-3 py-2.5 text-left text-sm",
                            "text-amber-600 transition",
                            "hover:bg-amber-50",
                            "focus:bg-amber-50 focus:outline-none",
                            "flex items-center gap-2",
                            "hover:translate-x-[2px]",
                        ].join(" ")}
                    >
                        <span
                            className={[
                                "flex h-8 w-8 items-center justify-center rounded-lg",
                                "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
                                "transition",
                                "group-hover:bg-white group-hover:shadow-sm group-hover:ring-amber-200",
                            ].join(" ")}
                        >
                            <Pencil className="h-4 w-4" />
                        </span>

                        <span className="flex-1 font-medium group-hover:text-amber-700 transition">
                            Edit
                        </span>

                        <span className="text-xs text-amber-400 group-hover:text-amber-600 transition">
                            Update
                        </span>
                    </button>

                    <div className="h-px bg-slate-100" />

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        className={[
                            "group w-full px-3 py-2.5 text-left text-sm",
                            "text-red-600 transition",
                            "hover:bg-red-50/70", // ⬅️ lebih soft tapi terasa
                            "focus:bg-red-50 focus:outline-none",
                            "flex items-center gap-2",
                            "hover:translate-x-[2px]",
                        ].join(" ")}
                    >
                        <span
                            className={[
                                "flex h-8 w-8 items-center justify-center rounded-lg",
                                "bg-red-50 text-red-600 ring-1 ring-red-100",
                                "transition",
                                "group-hover:bg-white group-hover:shadow-sm group-hover:ring-red-200",
                            ].join(" ")}
                        >
                            <Trash2 className="h-4 w-4" />
                        </span>

                        <span className="flex-1 font-medium group-hover:text-red-700 transition">
                            Hapus
                        </span>

                        <span className="text-xs text-red-400 group-hover:text-red-600 transition">
                            Remove
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}