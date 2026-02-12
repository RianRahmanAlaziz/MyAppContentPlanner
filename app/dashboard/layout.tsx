"use client";

import React, { useEffect } from "react";
import "@/public/assets/css/app.css";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

import Topbar from "@/components/layouts/Topbar";
import Sidebar from "@/components/layouts/Sidebar";
import Switcher from "@/components/layouts/Switcher";
import Menumobile from "@/components/layouts/Menumobile";
import axiosInstance from "@/lib/axiosInstance";

type DashboardLayoutProps = {
    children: React.ReactNode;
};

type RefreshResponse = {
    access_token: string;
};

export default function DashboardLayout({
    children,
}: DashboardLayoutProps): React.ReactElement {
    const router = useRouter(); // kalau tidak dipakai, boleh dihapus

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
        </>
    );
}
