"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABEL_MAP: Record<string, string> = {
    dashboard: "Dashboard",
    workspaces: "Workspaces",
    workspace: "Workspace",
    members: "Members",
    board: "Board",
    auth: "Auth",
    login: "Login",
    users: "Users",
};

function isNumericSegment(seg: string) {
    return /^\d+$/.test(seg);
}

function labelOf(seg: string) {
    return LABEL_MAP[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AppBreadcrumb() {
    const pathname = usePathname();

    // contoh: /dashboard/workspaces/12/members
    const raw = pathname.split("/").filter(Boolean);

    // buang angka ID (12)
    const segments = raw.filter((seg) => !isNumericSegment(seg));

    // bangun crumb href tanpa angka (biar link aman)
    // NOTE: karena kita buang ID, link "Members" akan jadi /dashboard/workspaces/members
    // jadi untuk breadcrumb, biasanya cukup klik sampai level yang memang ada routenya (mis. dashboard, workspaces).
    const crumbs = segments.map((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        return { seg, href, label: labelOf(seg), isLast: idx === segments.length - 1 };
    });

    return (
        <nav aria-label="breadcrumb" className="-intro-x h-[45px] mr-auto">
            <ol className="breadcrumb breadcrumb-light flex items-center gap-2">
                {crumbs.map((c) => (
                    <li key={c.href} className="breadcrumb-item flex items-center gap-2">

                        {c.isLast ? (
                            <span className="text-white font-medium">{c.label}</span>
                        ) : (
                            <Link href={c.href} className="text-white/90 hover:text-white underline-offset-2 hover:underline">
                                {c.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}