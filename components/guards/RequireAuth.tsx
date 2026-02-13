"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/auth/login");
        }
    }, [router]);

    // optional: bisa tampilkan loading kecil sebelum redirect
    if (!isAuthenticated()) return null;

    return <>{children}</>;
}
