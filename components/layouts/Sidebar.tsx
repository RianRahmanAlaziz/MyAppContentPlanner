"use client";

import React from "react";
import Sidelink from "@/components/ui/sidelink";
import {
    Briefcase,
    ChartNoAxesGantt,
    FileSpreadsheet,
    FolderKanban,
    LaptopMinimalCheck,
    LayoutDashboard,
    SquareDashedKanbanIcon,
    SquareKanban,
    SquareUser,

} from "lucide-react";
import { isAdmin } from "@/lib/auth";

function Sidebar(): React.ReactElement {
    const admin = isAdmin();
    return (
        <nav className="side-nav side-nav--simple">
            <ul>
                <Sidelink href="/dashboard" title="Dashboard" match="exact" icon={<LayoutDashboard />} />

                <li className="side-nav__devider my-6" />

                {admin && (
                    <>
                        <Sidelink
                            title="Users Management"
                            href="/dashboard/admin/users-management"
                            icon={<SquareUser />}
                        />

                        <Sidelink
                            title="Workspace Management"
                            href="/dashboard/admin/workspace"
                            match="prefix"
                            icon={<LaptopMinimalCheck />}
                        />

                        <Sidelink
                            title="Content Management"
                            href="/dashboard/admin/contents"
                            icon={<FolderKanban />}
                        />

                        <Sidelink
                            title="Audit Logs"
                            href="/dashboard/admin/audit-logs"
                            icon={<FileSpreadsheet />}
                        />
                    </>
                )}

                {/* side user */}
                <Sidelink
                    title="Workspace Management"
                    href="/dashboard/workspace"
                    icon={<LaptopMinimalCheck />}
                />
            </ul>
        </nav>
    );
}

export default Sidebar;
