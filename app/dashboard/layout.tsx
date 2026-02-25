"use client";

import React from "react";
import "@/app/app.css"

import Topbar from "@/components/layouts/Topbar";
import Sidebar from "@/components/layouts/Sidebar";
import Switcher from "@/components/layouts/Switcher";
import Menumobile from "@/components/layouts/Menumobile";
import RequireAdmin from "@/components/guards/RequireAdmin";
import axiosInstance from "@/lib/axiosInstance";

type DashboardLayoutProps = {
    children: React.ReactNode;
};



export default function DashboardLayout({
    children,
}: DashboardLayoutProps): React.ReactElement {

    const handleLogout = async (): Promise<void> => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error: unknown) {
            console.warn("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/auth/login";
        }
    };

    return (
        <>
            <RequireAdmin>
                <div className="min-h-screen py-5 md:py-5 md:pr-5">
                    <Menumobile />
                    <Topbar handleLogout={handleLogout} />
                    <div className="flex overflow-hidden">
                        <Sidebar />
                        <div className="content">{children}</div>
                    </div>
                    <Switcher />
                </div>

                <div id="modal-root" />
            </RequireAdmin>

        </>
    );
}
