"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { XCircle } from "lucide-react";

type ModalDeleteProps = {
    isOpenDelete: boolean;
    onClose: () => void;
    onDelete: () => void | Promise<void>;
    title?: string;
};

function Modaldelete({
    isOpenDelete,
    onClose,
    onDelete,
    title,
}: ModalDeleteProps): React.ReactElement | null {
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return null;

    return createPortal(
        <AnimatePresence>
            {isOpenDelete && (
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
                        className="bg-white dark:bg-darkmode-600 rounded-lg shadow-lg p-6 w-full max-w-md"
                    >
                        <div className="text-center">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mt-3" />
                            <div className="text-2xl font-semibold mt-5">
                                {title ?? "Are you sure?"}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                                Do you really want to delete these records? <br />
                                This process cannot be undone.
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                className="btn btn-outline-secondary mr-3 w-24 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded"
                                onClick={onClose}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={() => void onDelete()}
                                className="btn btn-danger w-24 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        modalRoot
    );
}

export default Modaldelete;