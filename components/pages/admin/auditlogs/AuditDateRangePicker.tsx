"use client";

import React, { useMemo, useState } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// helper: YYYY-MM-DD
function toYMD(d: Date) {
    return format(d, "yyyy-MM-dd");
}

function parseYMD(s?: string) {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function AuditDateRangePicker({
    loading,
    from,
    to,
    onChange,
}: {
    loading: boolean;
    from: string;
    to: string;
    onChange: (nextFrom: string, nextTo: string) => void;
}) {
    const [open, setOpen] = useState(false);

    const selectionRange = useMemo(() => {
        const start = parseYMD(from) ?? new Date();
        const end = parseYMD(to) ?? start;

        return {
            startDate: start,
            endDate: end,
            key: "selection",
        };
    }, [from, to]);

    const label = useMemo(() => {
        if (!from && !to) return "Pilih range tanggal";
        if (from && !to) return `${from} → ...`;
        if (!from && to) return `... → ${to}`;
        return `${from} → ${to}`;
    }, [from, to]);

    const handleSelect = (ranges: RangeKeyDict) => {
        const sel = ranges.selection;
        if (!sel?.startDate || !sel?.endDate) return;
        onChange(toYMD(sel.startDate), toYMD(sel.endDate));
    };

    const clear = () => onChange("", "");

    return (
        <div className="relative">
            <label className="form-label">Date Range</label>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={loading}
                    aria-disabled={loading}
                    className="audit-daterange__control"
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className={from || to ? "audit-daterange__value" : "audit-daterange__placeholder"}>
                        {label}
                    </span>
                    <span className="text-slate-400">▾</span>
                </button>
            </div>

            {open && (
                <>
                    {/* klik luar untuk close */}
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute z-[9999] mt-2 p-2 audit-daterange__popover">
                        <DateRange
                            ranges={[selectionRange]}
                            onChange={handleSelect}
                            moveRangeOnFirstSelection={false}
                            editableDateInputs
                            rangeColors={["#2563eb"]}
                            locale={id}
                            showDateDisplay={false}
                        />

                        <div className="flex justify-end px-2 pb-2">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setOpen(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}