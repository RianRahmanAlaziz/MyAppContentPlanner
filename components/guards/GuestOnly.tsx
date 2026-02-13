"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/auth";

export default function GuestOnly({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            const user = getUser();
            if (user?.role === "admin") router.replace("/dashboard");
            else router.replace("/workspaces");
        }
    }, [router]);

    if (isAuthenticated()) return null;

    return <>{children}</>;
}
