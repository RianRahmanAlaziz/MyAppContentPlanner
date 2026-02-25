"use client";

import React, { useMemo } from "react";
import Select, { SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import type { Filters } from "@/components/hooks/admin/auditlogs/useAuditLogs";
import axiosInstance from "@/lib/axiosInstance";
import { AuditDateRangePicker } from "./AuditDateRangePicker";

type Option = { value: string; label: string };

const EVENT_OPTIONS: Option[] = [
    { value: "", label: "All Events" },
    { value: "user.created", label: "user.created" },
    { value: "user.updated", label: "user.updated" },
    { value: "user.deleted", label: "user.deleted" },
    { value: "workspace.created", label: "workspace.created" },
    { value: "workspace.updated", label: "workspace.updated" },
    { value: "workspace.deleted", label: "workspace.deleted" },
    { value: "membership.added", label: "membership.added" },
    { value: "membership.role_changed", label: "membership.role_changed" },
    { value: "membership.removed", label: "membership.removed" },
    { value: "content.created", label: "content.created" },
    { value: "content.updated", label: "content.updated" },
    { value: "content.deleted", label: "content.deleted" },
    { value: "content.status_moved", label: "content.status_moved" },
];

const ENTITY_OPTIONS: Option[] = [
    { value: "", label: "All Entities" },
    { value: "user", label: "user" },
    { value: "workspace", label: "workspace" },
    { value: "membership", label: "membership" },
    { value: "content", label: "content" },
];

const PER_PAGE_OPTIONS = [
    { value: "10", label: "10 / page" },
    { value: "20", label: "20 / page" },
    { value: "50", label: "50 / page" },
    { value: "100", label: "100 / page" },
];

/** Ambil array rows dari response yang beda-beda bentuk */
function extractRows(res: any): any[] {
    // 1) AdminUser/AdminWorkspace: { message, data: paginator } => paginator.data
    const p1 = res?.data?.data?.data;
    if (Array.isArray(p1)) return p1;

    // 2) AdminContents: { data: ResourceCollection, meta, links }
    // bisa jadi res.data.data.data atau res.data.data
    const p2 = res?.data?.data?.data;
    if (Array.isArray(p2)) return p2;

    const p3 = res?.data?.data;
    if (Array.isArray(p3)) return p3;

    return [];
}

/** ACTOR: /admin/users?search= */
const loadActors = async (inputValue: string): Promise<Option[]> => {
    const res = await axiosInstance.get("/admin/users", {
        params: { search: inputValue, page: 1 },
    });

    const rows = extractRows(res);
    return rows.map((u: any) => ({
        value: String(u.id),
        label: `${u.name} (${u.email})`,
    }));
};

/** WORKSPACE: /admin/workspace?search= */
const loadWorkspaces = async (inputValue: string): Promise<Option[]> => {
    const res = await axiosInstance.get("/admin/workspace", {
        params: { search: inputValue, page: 1 },
    });

    const rows = extractRows(res);
    return rows.map((w: any) => ({
        value: String(w.id),
        label: `${w.name}${w.slug ? ` (${w.slug})` : ""}`,
    }));
};

export default function AuditLogFilters({
    filters,
    setFilters,
    loading,
}: {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    loading: boolean;
}) {
    const selectedEvent = useMemo(
        () => EVENT_OPTIONS.find((o) => o.value === filters.event) || EVENT_OPTIONS[0],
        [filters.event]
    );

    const selectedEntityType = useMemo(
        () => ENTITY_OPTIONS.find((o) => o.value === filters.entity_type) || ENTITY_OPTIONS[0],
        [filters.entity_type]
    );

    const selectedPerPage = useMemo(
        () => PER_PAGE_OPTIONS.find((o) => Number(o.value) === filters.per_page) || PER_PAGE_OPTIONS[1],
        [filters.per_page]
    );

    const [selectedActor, setSelectedActor] = React.useState<Option | null>(null);
    const [selectedWorkspace, setSelectedWorkspace] = React.useState<Option | null>(null);

    return (
        <>
            <div className="intro-y col-span-12 grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-4">
                    <label className="form-label">Search</label>
                    <input
                        type="text"
                        className="form-control "
                        placeholder="Search..."
                        value={filters.q}
                        disabled={loading}
                        onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                    />
                </div>

                <div className="col-span-12 md:col-span-2">
                    <label className="form-label">Event</label>
                    <Select<Option, false>
                        classNamePrefix="react-select"
                        isSearchable
                        isDisabled={loading}
                        options={EVENT_OPTIONS}
                        value={selectedEvent}
                        onChange={(opt: SingleValue<Option>) =>
                            setFilters((p) => ({ ...p, event: opt?.value || "" }))
                        }
                    />
                </div>

                {/* Entity Type */}
                <div className="col-span-12 md:col-span-2">
                    <label className="form-label">Entity Type</label>
                    <Select<Option, false>
                        classNamePrefix="react-select"
                        isSearchable={false}
                        isDisabled={loading}
                        options={ENTITY_OPTIONS}
                        value={selectedEntityType}
                        onChange={(opt: SingleValue<Option>) =>
                            setFilters((p) => ({
                                ...p,
                                entity_type: opt?.value || "",
                                entity_id: "", // reset supaya tidak nyangkut
                            }))
                        }
                    />
                </div>

                {/* Actor */}
                <div className="col-span-12 md:col-span-2">
                    <label className="form-label">User</label>
                    <AsyncSelect<Option, false>
                        classNamePrefix="react-select"
                        cacheOptions
                        defaultOptions
                        isClearable
                        isDisabled={loading}
                        loadOptions={loadActors}
                        value={selectedActor}
                        onChange={(opt) => {
                            setSelectedActor(opt ?? null); // ⬅️ simpan label aslinya
                            setFilters((p) => ({ ...p, actor_id: opt?.value || "" }));
                        }}
                        placeholder="Cari user..."
                    />
                </div>

                {/* Workspace */}
                <div className="col-span-12 md:col-span-2">
                    <label className="form-label">Workspace</label>
                    <AsyncSelect<Option, false>
                        classNamePrefix="react-select"
                        cacheOptions
                        defaultOptions
                        isClearable
                        isDisabled={loading}
                        loadOptions={loadWorkspaces}
                        value={selectedWorkspace}
                        onChange={(opt) => {
                            setSelectedWorkspace(opt ?? null); // ⬅️ simpan label
                            setFilters((p) => ({ ...p, workspace_id: opt?.value || "" }));
                        }}
                        placeholder="Cari workspace..."
                    />
                </div>

                <div className="col-span-6 md:col-span-4">
                    <label className="form-label">Per Page</label>
                    <Select<Option, false>
                        classNamePrefix="react-select"
                        isSearchable={false}
                        isDisabled={loading}
                        options={PER_PAGE_OPTIONS}
                        value={selectedPerPage}
                        onChange={(opt: SingleValue<Option>) =>
                            setFilters((p) => ({ ...p, per_page: Number(opt?.value || 20) }))
                        }
                    />
                </div>

                <div className="col-span-12 md:col-span-4">
                    <AuditDateRangePicker
                        loading={loading}
                        from={filters.from}
                        to={filters.to}
                        onChange={(nextFrom, nextTo) =>
                            setFilters((p) => ({ ...p, from: nextFrom, to: nextTo }))
                        }
                    />
                </div>

                <div className="col-span-12 md:col-span-3 flex items-end">
                    <button
                        type="button"
                        className="btn btn-outline-primary w-full"
                        disabled={loading}
                        onClick={() =>
                            setFilters({
                                q: "",
                                event: "",
                                entity_type: "",
                                entity_id: "",
                                actor_id: "",
                                workspace_id: "",
                                from: "",
                                to: "",
                                per_page: 20,
                            })
                        }
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </>
    );
}