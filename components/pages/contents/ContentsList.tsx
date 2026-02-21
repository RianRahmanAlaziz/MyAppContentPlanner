"use client";

import React, { useEffect, useMemo } from "react";
import {
    ChevronLeft,
    ChevronsLeft,
    ChevronRight,
    ChevronsRight,
    LoaderCircle,
    Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import Select, { SingleValue, StylesConfig } from "react-select";

import Modaldelete from "@/components/ui/Modaldelete";
import useContents, {
    ContentStatus,
    Platform,
    Priority,
} from "@/components/hooks/contents/useContents";
import useWorkspaceOptions from "@/components/hooks/workspaces/useWorkspaceOptions";
import useUserOptions from "@/components/hooks/users/useUserOptions";

// ---------- react-select option type ----------
type Option<T extends string | number> = { value: T; label: string };

// ---------- options ----------
const PLATFORM_OPTIONS: Option<Platform | "">[] = [
    { value: "", label: "All Platforms" },
    { value: "ig", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
];

const STATUS_OPTIONS: Option<ContentStatus | "">[] = [
    { value: "", label: "All Status" },
    { value: "idea", label: "Idea" },
    { value: "production", label: "Production" },
    { value: "review", label: "Review" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
];

// quick move status (tanpa "All")
const STATUS_OPTIONS_MOVE: Option<ContentStatus>[] = [
    { value: "idea", label: "Idea" },
    { value: "production", label: "Production" },
    { value: "review", label: "Review" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
];

const PRIORITY_OPTIONS: Option<Priority | "">[] = [
    { value: "", label: "All Priority" },
    { value: "low", label: "Low" },
    { value: "med", label: "Medium" },
    { value: "high", label: "High" },
];

const PER_PAGE_OPTIONS: Option<number>[] = [
    { value: 10, label: "10 / page" },
    { value: 20, label: "20 / page" },
    { value: 50, label: "50 / page" },
    { value: 100, label: "100 / page" },
];

const SORT_OPTIONS: Option<string>[] = [
    { value: "-created_at", label: "Newest" },
    { value: "created_at", label: "Oldest" },
    { value: "scheduled_at", label: "Scheduled ↑" },
    { value: "-scheduled_at", label: "Scheduled ↓" },
];


export default function ContentsList() {
    const {
        loading,
        contents,
        filters,
        setFilters,
        pagination,
        handlePageChange,
        moveStatus,
        isOpenDelete,
        setIsOpenDelete,
        openModalDelete,
        handleDelete,
        deleteTarget,
    } = useContents();

    useEffect(() => {
        document.title = "Dashboard | Contents Management";
    }, []);

    // selected values (react-select expects option object)
    const selectedPlatform = useMemo(() => {
        return PLATFORM_OPTIONS.find((o) => o.value === (filters.platform || "")) || PLATFORM_OPTIONS[0];
    }, [filters.platform]);

    const selectedStatus = useMemo(() => {
        return STATUS_OPTIONS.find((o) => o.value === (filters.status || "")) || STATUS_OPTIONS[0];
    }, [filters.status]);

    const selectedPriority = useMemo(() => {
        return PRIORITY_OPTIONS.find((o) => o.value === (filters.priority || "")) || PRIORITY_OPTIONS[0];
    }, [filters.priority]);

    const selectedPerPage = useMemo(() => {
        return PER_PAGE_OPTIONS.find((o) => o.value === filters.per_page) || PER_PAGE_OPTIONS[1];
    }, [filters.per_page]);

    const selectedSort = useMemo(() => {
        return SORT_OPTIONS.find((o) => o.value === filters.sort) || SORT_OPTIONS[0];
    }, [filters.sort]);

    // react-select style minimal (biar mirip input midone)
    const selectClassNames = "w-full";
    const selectThemeClassPrefix = "react-select";

    const { loading: wsLoading, options: workspaceOptions } = useWorkspaceOptions();
    const { loading: userLoading, options: userOptions } = useUserOptions();

    const selectedWorkspace = useMemo(() => {
        const id = filters.workspace_id || "";
        return workspaceOptions.find((o) => o.value === id) || workspaceOptions[0];
    }, [filters.workspace_id, workspaceOptions]);

    const selectedAssignee = useMemo(() => {
        const id = filters.assignee_id || "";
        return userOptions.find((o) => o.value === id) || userOptions[0];
    }, [filters.assignee_id, userOptions]);

    return (
        <>
            <h2 className="intro-y text-lg font-medium pt-24">Contents Management</h2>

            <div className="grid grid-cols-12 gap-6 mt-5">
                {/* FILTER BAR */}
                <div className="intro-y col-span-12 grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 md:col-span-4">
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            className="form-control box"
                            placeholder="Cari title/hook/caption..."
                            value={filters.q}
                            onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                        />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                        <label className="form-label">Platform</label>
                        <Select<Option<Platform | "">, false>
                            className={selectClassNames}
                            classNamePrefix={selectThemeClassPrefix}
                            isSearchable={false}
                            options={PLATFORM_OPTIONS}
                            value={selectedPlatform}
                            onChange={(opt: SingleValue<Option<Platform | "">>) =>
                                setFilters((p) => ({ ...p, platform: (opt?.value as any) || "" }))
                            }
                        />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                        <label className="form-label">Status</label>
                        <Select<Option<ContentStatus | "">, false>
                            className={selectClassNames}
                            classNamePrefix={selectThemeClassPrefix}
                            isSearchable={false}
                            options={STATUS_OPTIONS}
                            value={selectedStatus}
                            onChange={(opt: SingleValue<Option<ContentStatus | "">>) =>
                                setFilters((p) => ({ ...p, status: (opt?.value as any) || "" }))
                            }
                        />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                        <label className="form-label">Priority</label>
                        <Select<Option<Priority | "">, false>
                            className={selectClassNames}
                            classNamePrefix={selectThemeClassPrefix}
                            isSearchable={false}
                            options={PRIORITY_OPTIONS}
                            value={selectedPriority}
                            onChange={(opt: SingleValue<Option<Priority | "">>) =>
                                setFilters((p) => ({ ...p, priority: (opt?.value as any) || "" }))
                            }
                        />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                        <label className="form-label">Per Page</label>
                        <Select<Option<number>, false>
                            className={selectClassNames}
                            classNamePrefix={selectThemeClassPrefix}
                            isSearchable={false}
                            options={PER_PAGE_OPTIONS}
                            value={selectedPerPage}
                            onChange={(opt: SingleValue<Option<number>>) =>
                                setFilters((p) => ({ ...p, per_page: opt?.value ?? 20 }))
                            }
                        />
                    </div>

                    <div className="col-span-12 md:col-span-2">
                        <label className="form-label">Sort</label>
                        <Select<Option<string>, false>
                            className={selectClassNames}
                            classNamePrefix={selectThemeClassPrefix}
                            isSearchable={false}
                            options={SORT_OPTIONS}
                            value={selectedSort}
                            onChange={(opt: SingleValue<Option<string>>) =>
                                setFilters((p) => ({ ...p, sort: opt?.value ?? "-created_at" }))
                            }
                        />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                        <label className="form-label">Workspace</label>
                        <Select<Option<number | "">, false>
                            className="w-full"
                            classNamePrefix="react-select"
                            isSearchable
                            isLoading={wsLoading}
                            options={workspaceOptions}
                            value={selectedWorkspace}
                            onChange={(opt) =>
                                setFilters((p) => ({
                                    ...p,
                                    workspace_id: (opt?.value as any) || "",
                                }))
                            }
                            placeholder="Pilih workspace..."
                        />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                        <label className="form-label">Assignee</label>
                        <Select
                            className="w-full"
                            classNamePrefix="react-select"
                            isSearchable
                            isLoading={userLoading}
                            options={userOptions}
                            value={selectedAssignee}
                            onChange={(opt) =>
                                setFilters((p) => ({
                                    ...p,
                                    assignee_id: (opt?.value as any) || "",
                                }))
                            }
                            placeholder="Pilih assignee..."
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
                    <table className="table table-report -mt-2">
                        <thead>
                            <tr>
                                <th className="whitespace-nowrap">WORKSPACE</th>
                                <th className="whitespace-nowrap">TITLE</th>
                                <th className="whitespace-nowrap">PLATFORM</th>
                                <th className="whitespace-nowrap">TYPE</th>
                                <th className="text-center whitespace-nowrap">STATUS</th>
                                <th className="whitespace-nowrap">ASSIGNEE</th>
                                <th className="whitespace-nowrap">PRIORITY</th>
                                <th className="text-center whitespace-nowrap">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-6">
                                        <div className="flex justify-center items-center">
                                            <LoaderCircle className="w-6 h-6 animate-spin text-gray-500" />
                                        </div>
                                    </td>
                                </tr>
                            ) : contents.length > 0 ? (
                                contents.map((c) => {
                                    const selectedMoveStatus =
                                        STATUS_OPTIONS_MOVE.find((o) => o.value === c.status) || STATUS_OPTIONS_MOVE[0];

                                    return (
                                        <motion.tr key={c.id} >
                                            <td className="whitespace-nowrap">
                                                <span className="font-medium">
                                                    {c.workspace?.name ?? `#${c.workspace_id}`}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap">
                                                <div className="font-medium">{c.title}</div>
                                                <div className="text-slate-500 text-xs">{c.hook ?? ""}</div>
                                            </td>

                                            <td className="whitespace-nowrap uppercase">{c.platform}</td>
                                            <td className="whitespace-nowrap">{c.content_type}</td>

                                            {/* QUICK MOVE (react-select) */}
                                            <td className="whitespace-nowrap">
                                                <div className="min-w-45">
                                                    <Select<Option<ContentStatus>, false>
                                                        className={selectClassNames}
                                                        classNamePrefix={selectThemeClassPrefix}
                                                        isSearchable={false}
                                                        options={STATUS_OPTIONS_MOVE}
                                                        value={selectedMoveStatus}
                                                        onChange={(opt: SingleValue<Option<ContentStatus>>) => {
                                                            if (!opt) return;
                                                            if (opt.value === c.status) return;
                                                            moveStatus(Number(c.id), opt.value);
                                                        }}
                                                    />
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap">{c.assignee?.name ?? "-"}</td>
                                            <td className="whitespace-nowrap uppercase">{c.priority ?? "med"}</td>

                                            <td className="table-report__action w-56">
                                                <div className="flex justify-center items-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModalDelete(c)}
                                                        className="flex items-center text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="intro-y col-span-12 flex justify-center items-center mt-5">
                    <nav className="w-auto">
                        <ul className="pagination">
                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.current_page === 1}
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                            </li>

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </li>

                            {/* NOTE: kalau page banyak, jangan render semua tombol */}
                            {Array.from({ length: pagination.last_page })
                                .slice(0, 10)
                                .map((_, i) => {
                                    const page = i + 1;
                                    return (
                                        <li
                                            key={page}
                                            className={`page-item ${pagination.current_page === page ? "active" : ""}`}
                                        >
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() => handlePageChange(page)}
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
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </li>

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(pagination.last_page)}
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </li>
                        </ul>

                        <div className="text-center text-slate-500 text-xs mt-2">
                            Page {pagination.current_page} / {pagination.last_page} — Total {pagination.total}
                        </div>
                    </nav>
                </div>
            </div>

            {/* DELETE MODAL */}
            <Modaldelete
                isOpenDelete={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onDelete={handleDelete}
                title={deleteTarget ? `Hapus Content "${deleteTarget.title}"?` : "Hapus Content?"}
            />
        </>
    );
}