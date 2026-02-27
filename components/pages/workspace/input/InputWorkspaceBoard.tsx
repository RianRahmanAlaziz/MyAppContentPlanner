"use client";

import React, { useMemo } from "react";
import Select, { MultiValue, SingleValue } from "react-select";
import type { CreateContentPayload } from "@/components/hooks/workspace/useWorkspaceBoard";
import type { ContentStatus } from "@/components/pages/workspace/types/content";

// ---- Types ----
export type Option<T extends string | number = string> = { value: T; label: string };

export type ContentFormData = {
    title: string;
    platform: Option<string> | null;
    content_type: Option<string> | null;
    priority: Option<string> | null; // high/med/low
    assignee: Option<number> | null;
    due_date: string;        // "YYYY-MM-DD"
    due_time: string;        // "HH:mm"
    scheduled_date: string;  // "YYYY-MM-DD"
    scheduled_time: string;  // "HH:mm"
    tags: Option<string>[];  // multi
};

export const defaultContentFormData: ContentFormData = {
    title: "",
    platform: null,
    content_type: null,
    priority: { value: "med", label: "MED" },
    assignee: null,
    due_date: "",
    due_time: "",
    scheduled_date: "",
    scheduled_time: "",
    tags: [],
};


export type ContentFormErrors = Partial<Record<keyof ContentFormData, string>>;

type Props = {
    mode?: "create" | "edit";
    formData: ContentFormData;
    setFormData: React.Dispatch<React.SetStateAction<ContentFormData>>;
    errors: ContentFormErrors;
    setErrors: React.Dispatch<React.SetStateAction<ContentFormErrors>>;

    // data untuk option (kamu bisa isi dari API / props)
    membersOptions?: Option<number>[];
    tagOptions?: Option<string>[];
};

// ---- Helpers ----
function combineDateTime(date: string, time: string) {
    if (!date) return undefined;
    const t = time?.trim() ? time : "09:00";
    return `${date} ${t}:00`;
}

function isEmpty(v: unknown) {
    return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

export default function InputWorkspaceBoard({
    mode = "create",
    formData,
    setFormData,
    errors,
    setErrors,
    membersOptions = [],
    tagOptions = [],
}: Props) {
    // Options (static)
    const platformOptions = useMemo<Option<string>[]>(
        () => [
            { value: "ig", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
            { value: "youtube", label: "YouTube" },
        ],
        []
    );

    const contentTypeOptions = useMemo<Option<string>[]>(
        () => [
            { value: "reel", label: "Reel" },
            { value: "post", label: "Post" },
            { value: "story", label: "Story" },
            { value: "short", label: "Short" },
            { value: "long", label: "Long Video" },
        ],
        []
    );

    const priorityOptions = useMemo<Option<string>[]>(
        () => [
            { value: "high", label: "HIGH" },
            { value: "med", label: "MED" },
            { value: "low", label: "LOW" },
        ],
        []
    );

    // react-select style biar nyatu sama midone/tailwind
    const selectClassNames = {
        control: () =>
            "min-h-[38px] !rounded-lg !border !border-slate-200 !shadow-none hover:!border-slate-300",
        menu: () => "!rounded-lg !shadow-xl !border !border-slate-200 !overflow-hidden",
        option: (state: any) =>
            [
                "!text-sm",
                state.isSelected ? "!bg-blue-600 !text-white" : "",
                !state.isSelected && state.isFocused ? "!bg-slate-100" : "",
            ].join(" "),
        singleValue: () => "!text-sm !text-slate-700",
        placeholder: () => "!text-sm !text-slate-400",
        multiValue: () => "!rounded-md !bg-slate-100",
        multiValueLabel: () => "!text-xs !text-slate-700",
        multiValueRemove: () => "hover:!bg-slate-200 !rounded-md",
        input: () => "!text-sm",
    };

    function setField<K extends keyof ContentFormData>(key: K, value: ContentFormData[K]) {
        setFormData((prev) => ({ ...prev, [key]: value }));
        // auto clear error ketika user edit
        setErrors((prev) => ({ ...prev, [key]: "" }));
    }

    // (Optional) Validasi ringan di input component (biar UX enak).
    // Validasi final tetap kamu lakukan di handleSave hook.
    function validateLocal() {
        const nextErr: ContentFormErrors = {};

        if (isEmpty(formData.title)) nextErr.title = "Judul wajib diisi";
        if (!formData.platform) nextErr.platform = "Pilih platform";
        if (!formData.content_type) nextErr.content_type = "Pilih tipe konten";

        // due atau scheduled minimal salah satu
        const hasDue = !!combineDateTime(formData.due_date, formData.due_time);
        const hasScheduled = !!combineDateTime(formData.scheduled_date, formData.scheduled_time);

        if (!hasDue && !hasScheduled) {
            nextErr.due_date = "Isi Due atau Scheduled";
            nextErr.scheduled_date = "Isi Due atau Scheduled";
        }

        setErrors(nextErr);
        return Object.keys(nextErr).length === 0;
    }

    return (
        <>
            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="name" className="form-label">
                    Judul
                </label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setField("title", e.target.value)}
                    className="form-control"
                    placeholder="Name"
                    required
                    autoFocus
                />
                {errors?.title && <small className="text-danger">{errors.title[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="email" className="form-label">
                    Platform
                </label>

                <Select
                    instanceId="platform"
                    classNamePrefix="react-select"
                    placeholder="Pilih platform..."
                    options={platformOptions}
                    value={formData.platform}
                    onChange={(v: SingleValue<Option<string>>) => setField("platform", v ?? null)}
                />

                {errors?.platform && <small className="text-danger">{errors.platform[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="email" className="form-label">
                    Content Type
                </label>

                <Select
                    instanceId="content_type"
                    classNamePrefix="react-select"
                    placeholder="Pilih tipe..."
                    options={contentTypeOptions}
                    value={formData.content_type}
                    onChange={(v: SingleValue<Option<string>>) => setField("content_type", v ?? null)}

                />

                {errors?.content_type && <small className="text-danger">{errors.content_type[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="email" className="form-label">
                    priority
                </label>
                <Select
                    instanceId="priority"
                    classNamePrefix="react-select"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(v: SingleValue<Option<string>>) => setField("priority", v ?? null)}

                />

                {errors?.priority && <small className="text-danger">{errors.priority[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="email" className="form-label">
                    Assignee
                </label>
                <Select
                    instanceId="assignee"
                    classNamePrefix="react-select"
                    placeholder="Pilih member (optional)"
                    options={membersOptions}
                    value={formData.assignee}
                    onChange={(v: SingleValue<Option<number>>) => setField("assignee", v ?? null)}
                    isClearable

                />
                {errors?.assignee && <small className="text-danger">{errors.assignee[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="tags" className="form-label">
                    Tags
                </label>
                <Select
                    instanceId="tags"
                    classNamePrefix="react-select"
                    placeholder="Tambah tags..."
                    options={tagOptions}
                    value={formData.tags}
                    onChange={(v: MultiValue<Option<string>>) => setField("tags", v as Option<string>[])}
                    isMulti

                />
                {errors?.tags && <small className="text-danger">{errors.tags[0]}</small>}
            </div>

            {/* <div className="space-y-4">

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="form-label">Due Date</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                className={`form-control ${errors.due_date ? "border-danger" : ""}`}
                                value={formData.due_date}
                                onChange={(e) => setField("due_date", e.target.value)}
                            />
                            <input
                                type="time"
                                className="form-control"
                                value={formData.due_time}
                                onChange={(e) => setField("due_time", e.target.value)}
                            />
                        </div>
                        {errors.due_date ? <div className="mt-1 text-xs text-red-600">{errors.due_date}</div> : null}
                    </div>

                    <div>
                        <label className="form-label">Scheduled Date</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                className={`form-control ${errors.scheduled_date ? "border-danger" : ""}`}
                                value={formData.scheduled_date}
                                onChange={(e) => setField("scheduled_date", e.target.value)}
                            />
                            <input
                                type="time"
                                className="form-control"
                                value={formData.scheduled_time}
                                onChange={(e) => setField("scheduled_time", e.target.value)}
                            />
                        </div>
                        {errors.scheduled_date ? <div className="mt-1 text-xs text-red-600">{errors.scheduled_date}</div> : null}
                    </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    Tips: Isi minimal <b>Judul</b>, <b>Platform</b>, <b>Content Type</b> dan salah satu <b>Due</b> / <b>Scheduled</b>.
                </div>
            </div> */}
        </>
    );
}