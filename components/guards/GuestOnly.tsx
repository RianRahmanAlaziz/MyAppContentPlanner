"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function GuestOnly({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        const ok = isAuthenticated();
        setAuthed(ok);
        setChecked(true);

        if (ok) router.replace("/dashboard"); // ✅ admin/user sama-sama ke dashboard
    }, [router]);

    if (!checked) return null;
    if (authed) return null;

    return <>{children}</>;
}