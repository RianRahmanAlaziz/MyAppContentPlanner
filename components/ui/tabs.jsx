"use client";

import { useState } from "react";
import { CheckCircle, Download } from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function Tabs({ modules, completedModules, toggleModule }) {
    const [activeTab, setActiveTab] = useState(modules[0].id);

    return (
        <div className="w-full flex flex-col gap-2">

            {/* HEADER / TAB NAV */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2   rounded-xl">
                {modules.map((module) => {
                    const active = activeTab === module.id;
                    return (
                        <button
                            key={module.id}
                            onClick={() => setActiveTab(module.id)}
                            className={`
                                flex flex-col items-center gap-2 p-3 rounded-xl w-full h-full
                                cursor-pointer transition
                                ${active
                                    ? "bg-linear-to-br from-blue-500 to-teal-500 text-white"
                                    : "bg-white text-gray-700 border border-gray-200"
                                }
                            `}
                        >
                            <span className="text-xs text-center pt-1">{module.name}</span>

                            {/* FIX UKURAN TETAP */}
                            <div className="h-3 flex items-center">
                                {completedModules.includes(module.id) && (
                                    <CheckCircle
                                        className={`w-4 h-4 ${active ? "text-white" : "text-green-500"}`}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* CONTENT */}
            {modules.map((module) =>
                activeTab === module.id && (
                    <div key={module.id} className="p-8 bg-white rounded-xl shadow">
                        <div className="max-w-4xl">
                            <h2 className="text-gray-900 mb-6">{module.title}</h2>

                            <div
                                className="ck-content mt-2"
                                dangerouslySetInnerHTML={{ __html: module.content }}
                            />
                        </div>

                        <div className="mt-8 flex gap-4 mx-auto">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className={`flex-1 h-12 rounded-xl text-white shadow-lg cursor-pointer
                                    ${completedModules.includes(module.id)
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-linear-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                                    }
                                `}
                            >
                                {completedModules.includes(module.id) ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Selesai
                                    </span>
                                ) : (
                                    "Tandai Sebagai Selesai"
                                )}
                            </button>
                            <button
                                disabled={!module.file_url}
                                onClick={() => {
                                    if (module.file_url) {
                                        window.open(module.file_url, "_blank");
                                    }
                                }}
                                className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition ${module.file_url ? "border-blue-500 text-blue-600 hover:bg-blue-50 cursor-pointer" : "border-gray-300 text-gray-400 cursor-not-allowed"}`}
                                title={module.file_url ? "Download Modul" : "File tidak tersedia"}
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
