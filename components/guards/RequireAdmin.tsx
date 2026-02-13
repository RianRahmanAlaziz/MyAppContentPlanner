"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/lib/auth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/auth/login");
            return;
        }

        if (!isAdmin()) {
            router.replace("/workspaces");
        }
    }, [router]);

    if (!isAuthenticated()) return null;
    if (!isAdmin()) return null;

    return <>{children}</>;
}
