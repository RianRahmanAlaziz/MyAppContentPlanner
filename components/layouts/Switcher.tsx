"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function Switcher() {
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect((): void => {
        const theme: string = localStorage.getItem("theme") || "light";
        const darkMode: boolean = theme === "dark";

        setIsDark(darkMode);

        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleDarkMode = (): void => {
        const newTheme: "light" | "dark" = isDark ? "light" : "dark";

        setIsDark(!isDark);
        localStorage.setItem("theme", newTheme);

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <div
            onClick={toggleDarkMode}
            className="cursor-pointer shadow-md fixed bottom-0 right-0 box dark:bg-dark-2 border rounded-full w-14 h-14 flex items-center justify-center z-50 mb-10 mr-10 transition"
        >
            {isDark ? (
                <Sun className="w-6 h-6 text-white-400" />
            ) : (
                <Moon className="w-6 h-6 text-slate-800" />
            )}
        </div>
    );
}

export default Switcher;
