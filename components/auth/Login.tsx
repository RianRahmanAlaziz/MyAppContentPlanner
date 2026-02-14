"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Mail, PencilLine } from "lucide-react";

type LoginProps = {
    handleLogin: (identifier: string, password: string) => void | Promise<void>;
    loading: boolean;
};

export default function Login({
    handleLogin,
    loading,
}: LoginProps) {
    const [identifier, setIdentifier] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-teal-400 to-blue-500 mb-4 shadow-lg">
                        <PencilLine className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-teal-700 mb-2">Content Planner</h1>
                </div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-xl p-8"
                >
                    <h2 className="text-gray-900 mb-6 text-center"></h2>

                    <form
                        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                            e.preventDefault();
                            handleLogin(identifier, password);
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-gray-700">
                                Nomor Telepon
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="identifier"
                                    name="identifier"
                                    disabled={loading}
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={identifier}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setIdentifier(e.target.value)
                                    }
                                    className="pl-12 h-12 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">
                                Kata Sandi
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    disabled={loading}
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    autoComplete="current-password"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setPassword(e.target.value)
                                    }
                                    className="pl-12 h-12 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            className="text-teal-600 hover:text-teal-700 transition-colors text-sm cursor-pointer"
                        >
                            Lupa kata sandi?
                        </button>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-xl shadow-lg cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </Button>
                    </form>

                </motion.div>

            </motion.div>
        </div>
    );
}