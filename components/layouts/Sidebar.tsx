"use client";

import React from "react";
import Sidelink from "@/components/ui/sidelink";
import {
    LayoutDashboard,
    SquareUser,

} from "lucide-react";

function Sidebar(): React.ReactElement {
    return (
        <nav className="side-nav side-nav--simple">
            <ul>
                <Sidelink href="/dashboard" title="Dashboard" icon={<LayoutDashboard />} />

                <li className="side-nav__devider my-6" />

                <Sidelink
                    title="Users Management"
                    href="/dashboard/users-management"
                    icon={<SquareUser />}
                />
            </ul>
        </nav>
    );
}

export default Sidebar;
