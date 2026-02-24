"use client";

import React, { useMemo } from "react";
import Select, { SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import type { Filters } from "@/components/hooks/admin/auditlogs/useAuditLogs";

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

const loadActors = async (inputValue: string) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?search=${inputValue}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                Accept: "application/json",
            },
        }
    );

    const data = await res.json();

    return data.data.map((u: any) => ({
        value: u.id,
        label: `${u.name} (${u.email})`,
    }));
};

const loadEntityOptions = (entityType: string) => async (inputValue: string) => {
    if (!entityType) return [];

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/search-entity?type=${entityType}&search=${inputValue}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                Accept: "application/json",
            },
        }
    );

    const data = await res.json();

    return data.data.map((e: any) => ({
        value: e.id,
        label: `${entityType} #${e.id} - ${e.title ?? e.name ?? ""}`,
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

    const selectedEntity = useMemo(
        () => ENTITY_OPTIONS.find((o) => o.value === filters.entity_type) || ENTITY_OPTIONS[0],
        [filters.entity_type]
    );

    const selectedPerPage = useMemo(
        () => PER_PAGE_OPTIONS.find((o) => Number(o.value) === filters.per_page) || PER_PAGE_OPTIONS[1],
        [filters.per_page]
    );

    return (
        <>
            <div className="intro-y col-span-12 grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-4">
                    <label className="form-label">Search</label>
                    <input
                        type="text"
                        className="form-control box"
                        placeholder="Search..."
                        value={filters.q}
                        disabled={loading}
                        onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                    />
                </div>

                <div className="col-span-12 md:col-span-4">
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

                <div className="col-span-12 md:col-span-4">
                    <label className="form-label">Entity</label>
                    <Select<Option, false>
                        classNamePrefix="react-select"
                        isSearchable={false}
                        isDisabled={loading}
                        options={ENTITY_OPTIONS}
                        value={selectedEntity}
                        onChange={(opt: SingleValue<Option>) =>
                            setFilters((p) => ({ ...p, entity_type: opt?.value || "" }))
                        }
                    />
                </div>

                <div className="col-span-12 md:col-span-3">
                    <label className="form-label">Entity</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        isDisabled={loading || !filters.entity_type}
                        loadOptions={loadEntityOptions(filters.entity_type)}
                        onChange={(option: any) =>
                            setFilters((p) => ({
                                ...p,
                                entity_id: option?.value?.toString() || "",
                            }))
                        }
                        placeholder={
                            filters.entity_type
                                ? "Search entity..."
                                : "Pilih entity type dulu"
                        }
                    />
                </div>

                <div className="col-span-12 md:col-span-3">
                    <label className="form-label">Actor</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        isDisabled={loading}
                        loadOptions={loadActors}
                        onChange={(option: any) =>
                            setFilters((p) => ({
                                ...p,
                                actor_id: option?.value?.toString() || "",
                            }))
                        }
                        placeholder="Search user..."
                    />
                </div>

                <div className="col-span-12 md:col-span-3">
                    <label className="form-label">Workspace ID</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 2"
                        value={filters.workspace_id}
                        disabled={loading}
                        onChange={(e) => setFilters((p) => ({ ...p, workspace_id: e.target.value }))}
                    />
                </div>

                <div className="col-span-6 md:col-span-3">
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

                <div className="col-span-6 md:col-span-2">
                    <label className="form-label">From</label>
                    <input
                        type="date"
                        className="form-control"
                        value={filters.from}
                        disabled={loading}
                        onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
                    />
                </div>

                <div className="col-span-6 md:col-span-2">
                    <label className="form-label">To</label>
                    <input
                        type="date"
                        className="form-control"
                        value={filters.to}
                        disabled={loading}
                        onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
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