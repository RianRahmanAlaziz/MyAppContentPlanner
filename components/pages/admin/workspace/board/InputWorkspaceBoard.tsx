"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Platform, Priority } from "@/components/pages/workspace/types/content";
import type { CreateContentPayload } from "@/components/hooks/admin/workspaces/useWorkspaceBoard";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateContentPayload) => Promise<any> | any;
};

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
    { value: "ig", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "med", label: "Medium" },
    { value: "high", label: "High" },
];


export default function InputWorkspaceBoard({ open, onClose, onSubmit }: Props) {
    const [title, setTitle] = useState("");
    const [platform, setPlatform] = useState<Platform>("ig");
    const [contentType, setContentType] = useState("reel");
    const [priority, setPriority] = useState<Priority>("med");
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = useMemo(() => title.trim().length >= 3 && !!contentType.trim(), [title, contentType]);

    if (!open) return null;

    const reset = () => {
        setTitle("");
        setPlatform("ig");
        setContentType("reel");
        setPriority("med");
    };


    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);

        const payload: CreateContentPayload = {
            title: title.trim(),
            platform,
            content_type: contentType.trim(),
            priority,
        };

        const res = await onSubmit(payload);
        setSubmitting(false);

        if (res) {
            reset();
            onClose();
        }
    };

    return (
        <>

        </>
    )
}
