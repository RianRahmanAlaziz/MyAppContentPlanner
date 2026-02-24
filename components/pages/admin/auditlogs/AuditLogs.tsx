"use client";

import React, { useEffect } from "react";
import AuditLogsTable from "./AuditLogsTable";
import useAuditLogs from "@/components/hooks/admin/auditlogs/useAuditLogs";
import AuditLogFilters from "./AuditLogFilters";
import AuditLogDetailModal from "./AuditLogDetailModal";
import {
    ChevronLeft,
    ChevronsLeft,
    ChevronRight,
    ChevronsRight,
    LoaderCircle,
    Trash2,
} from "lucide-react";

export default function AuditLogs() {
    const {
        loading,
        items,
        meta,
        filters,
        setFilters,
        openDetail,
        closeDetail,
        selected,
        handlePageChange,
    } = useAuditLogs();

    useEffect(() => {
        document.title = "Dashboard | Audit Logs";
    }, []);

    return (
        <>
            <h2 className="intro-y text-lg font-medium pt-24">Audit Logs</h2>

            <div className="grid grid-cols-12 gap-6 mt-5">
                <AuditLogFilters filters={filters} setFilters={setFilters} loading={loading} />
                <AuditLogsTable loading={loading} items={items} onOpenDetail={openDetail} />


                <div className="intro-y col-span-12 flex justify-center items-center mt-2">
                    <nav className="w-auto">
                        <ul className="pagination">
                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(1)}
                                    disabled={meta.current_page === 1 || loading}
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                            </li>

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                    disabled={meta.current_page === 1 || loading}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </li>

                            {Array.from({ length: meta.last_page }).slice(0, 10).map((_, i) => {
                                const page = i + 1;
                                return (
                                    <li key={page} className={`page-item ${meta.current_page === page ? "active" : ""}`}>
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() => handlePageChange(page)}
                                            disabled={loading}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                );
                            })}

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(meta.current_page + 1)}
                                    disabled={meta.current_page === meta.last_page || loading}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </li>

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(meta.last_page)}
                                    disabled={meta.current_page === meta.last_page || loading}
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <AuditLogDetailModal isOpen={!!selected} onClose={closeDetail} item={selected} />
        </>
    );
}