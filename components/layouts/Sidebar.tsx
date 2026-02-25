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

function Sidebar(): React.ReactElement {
    return (
        <nav className="side-nav side-nav--simple">
            <ul>
                <Sidelink href="/dashboard" title="Dashboard" match="exact" icon={<LayoutDashboard />} />

                <li className="side-nav__devider my-6" />

                <Sidelink
                    title="Users Management"
                    href="/dashboard/admin/users-management"
                    icon={<SquareUser />}
                />
                {/* side admin */}
                <Sidelink
                    title="Workspace Management"
                    href="/dashboard/admin/workspace"
                    match="prefix"
                    icon={<Briefcase />}
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
                <Sidelink
                    title="Workspace Management"
                    href="/dashboard/workspace"
                    icon={<LaptopMinimalCheck />}
                />
                {/* side user */}
                {/* <Sidelink
                    title="Workspace Management"
                    icon={<Briefcase />}
                >
                    <Sidelink
                        title="Workspace List"
                        href="/dashboard/workspace"
                        icon={<ChartNoAxesGantt />}
                    />
                    <Sidelink
                        title="Workspace Board"
                        href="/dashboard/workspace/board"
                        icon={<SquareDashedKanbanIcon />}
                    />
                </Sidelink> */}
            </ul>
        </nav>
    );
}

export default Sidebar;
