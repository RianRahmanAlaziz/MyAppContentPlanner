"use client";

import React, { useMemo } from "react";
import Select, { MultiValue, SingleValue } from "react-select";

// ---- Types ----
export type Option<T extends string | number = string> = { value: T; label: string };

export type ContentFormData = {
    title: string;
    hook: string;

    platform: Option<string> | null;      // ig, tiktok, youtube
    content_type: Option<string> | null;  // reel, carousel, story, video, shorts, long
    priority: Option<string> | null;      // low/med/high
    assignee: Option<number> | null;

    due_date: string;        // "YYYY-MM-DD"
    due_time: string;        // "HH:mm"
    scheduled_date: string;  // "YYYY-MM-DD"
    scheduled_time: string;  // "HH:mm"

    tags: Option<string>[];  // json tags
};

export const defaultContentFormData: ContentFormData = {
    title: "",
    hook: "",
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

// errors bisa string atau string[]
export type ContentFormErrors = Partial<Record<keyof ContentFormData, string | string[]>>;

type Props = {
    mode?: "create" | "edit";
    formData: ContentFormData;
    setFormData: React.Dispatch<React.SetStateAction<ContentFormData>>;
    errors: ContentFormErrors;
    setErrors: React.Dispatch<React.SetStateAction<ContentFormErrors>>;

    membersOptions?: Option<number>[];
    tagOptions?: Option<string>[];
};

// ---- Helpers ----
function getErr(err?: string | string[]) {
    if (!err) return "";
    return Array.isArray(err) ? err[0] : err;
}

export default function InputWorkspaceBoard({
    mode = "create",
    formData,
    setFormData,
    errors,
    setErrors,
    tagOptions = [],
}: Props) {
    // ✅ sesuai migrasi
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
            { value: "carousel", label: "Carousel" },
            { value: "story", label: "Story" },
            { value: "video", label: "Video" },
            { value: "shorts", label: "Shorts" },
            { value: "long", label: "Long" },
        ],
        []
    );

    const priorityOptions = useMemo<Option<string>[]>(
        () => [
            { value: "high", label: "High" },
            { value: "med", label: "Medium" },
            { value: "low", label: "Low" },
        ],
        []
    );


    function setField<K extends keyof ContentFormData>(key: K, value: ContentFormData[K]) {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" })); // clear error
    }

    return (
        <>
            {/* Title */}
            <div className="col-span-12">
                <label htmlFor="title" className="form-label">
                    Judul <span className="text-danger">*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setField("title", e.target.value)}
                    className={`form-control ${getErr(errors.title) ? "border-danger" : ""}`}
                    placeholder="Contoh: Ide konten promo"
                    autoFocus
                />
                {getErr(errors.title) && <small className="text-danger">{getErr(errors.title)}</small>}
            </div>

            {/* Hook */}
            <div className="col-span-12">
                <label htmlFor="hook" className="form-label">
                    Hook <span className="text-slate-400">(optional)</span>
                </label>
                <input
                    id="hook"
                    type="text"
                    value={formData.hook}
                    onChange={(e) => setField("hook", e.target.value)}
                    className={`form-control ${getErr(errors.hook) ? "border-danger" : ""}`}
                    placeholder="Contoh: 'Stop scroll, ini penting!'"
                />
                {getErr(errors.hook) && <small className="text-danger">{getErr(errors.hook)}</small>}
            </div>

            {/* Platform */}
            <div className="col-span-12 md:col-span-6">
                <label className="form-label">
                    Platform <span className="text-danger">*</span>
                </label>
                <Select
                    instanceId="platform"
                    isSearchable={false}
                    classNamePrefix="react-select"
                    placeholder="Pilih platform..."
                    options={platformOptions}
                    value={formData.platform}
                    onChange={(v: SingleValue<Option<string>>) => setField("platform", v ?? null)}
                />
                {getErr(errors.platform) && <small className="text-danger">{getErr(errors.platform)}</small>}
            </div>

            {/* Content Type */}
            <div className="col-span-12 md:col-span-6">
                <label className="form-label">
                    Content Type <span className="text-danger">*</span>
                </label>
                <Select
                    instanceId="content_type"
                    isSearchable={false}
                    classNamePrefix="react-select"
                    placeholder="Pilih tipe..."
                    options={contentTypeOptions}
                    value={formData.content_type}
                    onChange={(v: SingleValue<Option<string>>) => setField("content_type", v ?? null)}
                />
                {getErr(errors.content_type) && (
                    <small className="text-danger">{getErr(errors.content_type)}</small>
                )}
            </div>

            {/* Priority */}
            <div className="col-span-12 md:col-span-6">
                <label className="form-label">Priority</label>
                <Select
                    instanceId="priority"
                    isSearchable={false}
                    classNamePrefix="react-select"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(v: SingleValue<Option<string>>) => setField("priority", v ?? null)}
                />
                {getErr(errors.priority) && <small className="text-danger">{getErr(errors.priority)}</small>}
            </div>

            {/* Tags */}
            <div className="col-span-12 md:col-span-6">
                <label className="form-label">Tags</label>
                <Select
                    instanceId="tags"
                    classNamePrefix="react-select"
                    placeholder="Tambah tags..."
                    options={tagOptions}
                    value={formData.tags}
                    onChange={(v: MultiValue<Option<string>>) => setField("tags", v as Option<string>[])}
                    isMulti
                />
                {getErr(errors.tags) && <small className="text-danger">{getErr(errors.tags)}</small>}
            </div>

            {/* Due */}
            <div className="col-span-12 md:col-span-6">
                <label className="form-label">Due Date</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="date"
                        className={`form-control ${getErr(errors.due_date) ? "border-danger" : ""}`}
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
                {getErr(errors.due_date) && <small className="text-danger">{getErr(errors.due_date)}</small>}
            </div>

            {/* Scheduled */}
            <div className="col-span-12 md:col-span-6">
                <label className="form-label">Scheduled Date</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="date"
                        className={`form-control ${getErr(errors.scheduled_date) ? "border-danger" : ""}`}
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
                {getErr(errors.scheduled_date) && (
                    <small className="text-danger">{getErr(errors.scheduled_date)}</small>
                )}
            </div>


            <div className="col-span-12">
                <div className="alert alert-warning-soft show text-xs">
                    Minimal isi: <b>Judul</b>, <b>Platform</b>, <b>Content Type</b>. <br />
                    Untuk tanggal, kamu boleh isi salah satu: <b>Due</b> atau <b>Scheduled</b>.
                </div>
            </div>
        </>
    );
}