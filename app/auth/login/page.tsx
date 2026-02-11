"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "@/lib/axiosInstance";

import Login from "@/components/auth/Login";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        document.title = "Login | Content Planner";

        // kalau sudah login, redirect
        // const token =
        //     typeof window !== "undefined"
        //         ? localStorage.getItem("token") || sessionStorage.getItem("token")
        //         : null;

        // if (token) router.replace("/workspaces");

    }, [router]);

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);

        try {
            const res = await axiosInstance.post("/auth/login", {
                email: email,
                password,
            });

            const token = res.data.token;
            localStorage.setItem("token", token);

            toast.success("Berhasil login!");
            router.push("/workspaces");

        } catch (e: any) {
            /**
             * Struktur error dari axios interceptor:
             * {
             *   status,
             *   message,
             *   payload: {
             *     success,
             *     message,
             *     error: { type, details }
             *   }
             * }
             */

            // ❌ Email / password salah
            if (e.status === 401) {
                toast.error("Email atau kata sandi salah");
                return;
            }

            // ❌ Validation error (422)
            if (e.status === 422) {
                const details = e.payload?.error?.details;

                if (details?.email) {
                    toast.error(details.email[0]);
                    return;
                }

                if (details?.password) {
                    toast.error(details.password[0]);
                    return;
                }

                toast.error("Data login tidak valid");
                return;
            }

            // ❌ fallback
            toast.error(e.message || "Gagal login");

        } finally {
            setLoading(false);
        }
    };




    return (
        <Login
            handleLogin={handleLogin}
            loading={loading}
        />
    );
}
