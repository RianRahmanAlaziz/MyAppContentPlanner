"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    SquareUser,
    Heart,
    Menu,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import SideLink from "@/components/ui/sidelink";

function Menumobile(): React.ReactElement {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div
            className={`mobile-menu md:hidden ${isOpen ? "mobile-menu--active" : ""
                }`}
        >
            {/* Header bar */}
            <div className="mobile-menu-bar">
                <Link href="/" className="flex mr-auto">
                    <Heart className="w-6 h-auto text-white" />
                </Link>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="mobile-menu-toggler"
                >
                    <Menu className="w-8 h-8 text-white" />
                </button>
            </div>

            {/* Menu content */}
            <div className="scrollable">
                <div className="flex justify-end px-4 py-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="mobile-menu-toggler"
                    >
                        <XCircle className="w-8 h-8 text-white transform -rotate-90" />
                    </button>
                </div>

                <ul className="scrollable__content py-2">
                    <SideLink
                        cls="side-menu--active"
                        title="Dashboard"
                        icon={<LayoutDashboard />}
                    />

                    <li className="menu__devider my-6" />

                    <SideLink
                        title="Users Management"
                        href="/dashboard/users"
                        icon={<SquareUser />}
                    />
                </ul>
            </div>
        </div>
    );
}

export default Menumobile;
