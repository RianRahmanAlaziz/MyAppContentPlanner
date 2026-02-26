"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "@/lib/axiosInstance";
import { setToken, setUser } from "@/lib/auth";
import GuestOnly from "@/components/guards/GuestOnly";
import Login from "@/components/auth/Login";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        document.title = "Login | Content Planner";

    }, []);

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);

        try {
            const res = await axiosInstance.post("/auth/login", { email, password });
            const { token, user } = res.data;

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            // simpan token + user
            setToken(token, true);
            setUser(user, true);

            toast.success("Berhasil login!");
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;

            if (status === 422) {
                const message =
                    data?.error?.details?.email?.[0] ||
                    data?.message ||
                    "Email atau password salah.";
                toast.error(message);
                return;
            }

            if (status === 401) {
                toast.error("Email atau password salah.");
                return;
            }

            toast.error(data?.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <GuestOnly>
            <Login handleLogin={handleLogin} loading={loading} />
        </GuestOnly>
    );
}
