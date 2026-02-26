"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        const ok = isAuthenticated();
        setAuthed(ok);
        setChecked(true);

        if (!ok) window.location.href = "/auth/login";
    }, [router]);

    if (!checked) return null;
    if (!authed) return null;

    return <>{children}</>;
}