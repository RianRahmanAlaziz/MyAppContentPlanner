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

function Modal({
    isOpen,
    onClose,
    title,
    children,
    onSave,
    hideSave,
}: ModalProps): React.ReactElement | null {
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                    className="fixed inset-0 z-9999 pt-32 flex items-start justify-center bg-black/50"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-white dark:bg-darkmode-600 rounded-lg shadow-lg p-6 w-3xl"
                    >
                        <h3 className="text-lg font-bold">{title}</h3>

                        <div className="my-5 grid grid-cols-12 gap-4 gap-y-3">
                            {children}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="btn-secondary shadow-md w-20 mr-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                                onClick={onClose}
                            >
                                Close
                            </button>

                            {!hideSave && (
                                <button
                                    type="button"
                                    onClick={() => onSave?.()}
                                    className="btn btn-primary shadow-md w-20 rounded-lg"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        modalRoot
    );
}

export default Modal;