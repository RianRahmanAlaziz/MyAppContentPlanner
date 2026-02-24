"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

type SidelinkProps = {
    icon: React.ReactNode;
    title: string;
    href?: string;
    children?: React.ReactNode;
    cls?: string;
    match?: "exact" | "prefix";
};

function toTooltipId(title: string) {
    return `sidelink-tooltip-${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "")}`;
}

function sidelink({
    icon,
    title,
    href = "/",
    children,
    cls = "",
    match
}: SidelinkProps): React.ReactElement {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const hasChildren = !!children;
    const tooltipId = useMemo(() => toTooltipId(title), [title]);

    const isChildActive = useMemo(() => {
        if (!hasChildren) return false;

        return React.Children.toArray(children).some((child) => {
            if (!React.isValidElement(child)) return false;

            const childProps = child.props as { href?: unknown };
            return typeof childProps.href === "string" && pathname.startsWith(childProps.href);
        });
    }, [children, hasChildren, pathname]);

    const isDirectActive = useMemo(() => {
        if (!href) return false;

        if (match === "exact") return pathname === href;

        // prefix + boundary aman
        return pathname === href || pathname.startsWith(`${href}/`);
    }, [href, match, pathname]);

    const isActive = isDirectActive || isChildActive;

    useEffect(() => {
        if (isActive && hasChildren) setIsOpen(true);
    }, [isActive, hasChildren]);

    useEffect(() => {
        const checkMobile = (): void => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const checkCollapsed = (): void => {
            const simple =
                document.querySelector(".side-nav")?.classList.contains("side-nav--simple") ?? false;

            setIsCollapsed(window.innerWidth <= 1260 || simple);
        };

        if (!isMobile) {
            checkCollapsed();
            window.addEventListener("resize", checkCollapsed);
            return () => window.removeEventListener("resize", checkCollapsed);
        } else {
            setIsCollapsed(false);
        }
    }, [isMobile]);

    const baseClass = isMobile ? "menu" : "side-menu";
    const fullClass = `${baseClass} ${cls} ${isActive ? "side-menu--active" : ""}`.trim();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        if (hasChildren) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("closeAllSidelinks", { detail: title }));
            setIsOpen((prev) => !prev);
        }
    };

    useEffect(() => {
        const handleCloseAll = (e: Event): void => {
            const ev = e as CustomEvent<string>;
            if (ev.detail !== title) setIsOpen(false);
        };

        window.addEventListener("closeAllSidelinks", handleCloseAll);
        return () => window.removeEventListener("closeAllSidelinks", handleCloseAll);
    }, [title]);

    return (
        <li>
            <Link
                href={hasChildren ? "#" : href}
                onClick={hasChildren ? handleClick : undefined}
                className={fullClass}
                // Tooltip aktif hanya saat collapsed
                data-tooltip-id={isCollapsed ? tooltipId : undefined}
                data-tooltip-content={isCollapsed ? title : undefined}
            >
                <div className={`${baseClass}__icon`}>{icon}</div>

                <motion.div className={`${baseClass}__title`} layout>
                    {title}
                    {hasChildren && (
                        <ChevronDown
                            className={`${baseClass}__sub-icon transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                    )}
                </motion.div>
            </Link>

            {/* Tooltip render hanya saat collapsed (biar nggak nyampah & sesuai Tippy disabled) */}
            {isCollapsed && (
                <Tooltip
                    id={tooltipId}
                    place="right"
                    positionStrategy="fixed"
                    delayShow={0}
                    delayHide={100}
                    className="!bg-black !text-white !text-sm !px-3 !py-2 !rounded-md !shadow-lg !z-[9999]"
                />
            )}

            {/* Submenu */}
            {hasChildren && (
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={`overflow-hidden ${baseClass}__sub-open mb-3`}
                        >
                            {children}
                        </motion.ul>
                    )}
                </AnimatePresence>
            )}
        </li>
    );
}

export default sidelink;
