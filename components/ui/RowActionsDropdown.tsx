"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Eye, Pencil, Trash2, Sparkles } from "lucide-react";

type Props = {
    onEdit: () => void;
    onDelete: () => void;
    onDetail?: () => void;
};

type Pos = { top: number; left: number; width: number };

export default function RowActionsDropdown({ onEdit, onDelete, onDetail }: Props) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [pos, setPos] = useState<Pos>({ top: 0, left: 0, width: 0 });

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => setMounted(true), []);

    const computePos = () => {
        const btn = triggerRef.current;
        if (!btn) return;

        const r = btn.getBoundingClientRect();
        // menu muncul di bawah tombol, align kanan tombol
        setPos({
            top: r.bottom + 10, // jarak turun
            left: r.right - 224, // 224 = w-56 (menu width)
            width: 224,
        });
    };

    useLayoutEffect(() => {
        if (!open) return;
        computePos();

        const onScrollOrResize = () => computePos();
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);

        return () => {
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        function onClickOutside(e: MouseEvent) {
            const t = e.target as Node;
            if (triggerRef.current?.contains(t)) return;
            if (menuRef.current?.contains(t)) return;
            setOpen(false);
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
    }, [open]);

    // biar posisi tidak keluar layar kiri
    const safeLeft = Math.max(8, pos.left);

    return (
        <div className="rad">
            <button
                ref={triggerRef}
                type="button"
                className={`rad__trigger ${open ? "is-open" : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <MoreVertical size={16} />
            </button>

            {mounted &&
                open &&
                createPortal(
                    <div
                        className="rad__portal"
                        style={{
                            position: "fixed",
                            top: pos.top,
                            left: safeLeft,
                            width: pos.width,
                            zIndex: 99999,
                        }}
                    >
                        <div className="rad__panel" ref={menuRef} role="menu">
                            <div className="rad__header">
                                <Sparkles size={14} />
                                <span>Actions</span>
                            </div>

                            <div className="rad__divider" />

                            {onDetail && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="rad__item rad__item--detail"
                                    onClick={() => {
                                        setOpen(false);
                                        onDetail();
                                    }}
                                >
                                    <span className="rad__icon">
                                        <Eye size={16} />
                                    </span>
                                    <span className="rad__label">Detail</span>
                                    <span className="rad__hint">View</span>
                                </button>
                            )}

                            <button
                                type="button"
                                role="menuitem"
                                className="rad__item rad__item--edit"
                                onClick={() => {
                                    setOpen(false);
                                    onEdit();
                                }}
                            >
                                <span className="rad__icon">
                                    <Pencil size={16} />
                                </span>
                                <span className="rad__label">Edit</span>
                                <span className="rad__hint">Update</span>
                            </button>

                            <div className="rad__divider" />

                            <button
                                type="button"
                                role="menuitem"
                                className="rad__item rad__item--delete"
                                onClick={() => {
                                    setOpen(false);
                                    onDelete();
                                }}
                            >
                                <span className="rad__icon">
                                    <Trash2 size={16} />
                                </span>
                                <span className="rad__label">Hapus</span>
                                <span className="rad__hint">Remove</span>
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}