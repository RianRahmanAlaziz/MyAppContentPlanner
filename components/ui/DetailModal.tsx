"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSave?: () => void | Promise<void>;
    hideSave?: boolean;
};

export default function DetailModal({
    isOpen,
    onClose,
    title,
    children,
    onSave,
    hideSave,
}: ModalProps): React.ReactElement | null {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    useEffect(() => {
        if (!isOpen) return;

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [isOpen, onClose]);

    if (!mounted) return null;

    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={onClose} // klik backdrop untuk close
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 8 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="bg-white dark:bg-darkmode-600 rounded-xl shadow-lg w-full max-w-4xl"
                        onMouseDown={(e) => e.stopPropagation()} // jangan close kalau klik dalam modal
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                {title}
                            </h3>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>

                        {/* Body (scrollable) */}
                        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
                            {children}
                        </div>

                        {/* Footer */}
                        {!hideSave && (
                            <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onSave?.()}
                                    className="btn btn-primary"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        modalRoot
    );
}