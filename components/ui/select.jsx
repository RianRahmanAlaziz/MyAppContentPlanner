"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "./utils";

export function Select(props) {
    return <SelectPrimitive.Root {...props} />;
}

export function SelectGroup(props) {
    return <SelectPrimitive.Group {...props} />;
}

export function SelectValue(props) {
    return <SelectPrimitive.Value {...props} />;
}

export function SelectTrigger({ className, children, size = "default", ...props }) {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                "border-input data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
                size === "default" && "h-10",
                size === "sm" && "h-8",
                className
            )}
            data-size={size}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

export function SelectContent({ className, children, position = "popper", ...props }) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                className={cn(
                    "bg-popover text-popover-foreground z-50 max-h-64 min-w-32 overflow-hidden rounded-md border shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out",
                    className
                )}
                position={position}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport className="p-1">
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

export function SelectLabel({ className, ...props }) {
    return (
        <SelectPrimitive.Label
            className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
            {...props}
        />
    );
}

export function SelectItem({ className, children, ...props }) {
    return (
        <SelectPrimitive.Item
            className={cn(
                "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
                className
            )}
            {...props}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            <SelectPrimitive.ItemIndicator className="absolute right-2">
                <Check className="w-4 h-4" />
            </SelectPrimitive.ItemIndicator>
        </SelectPrimitive.Item>
    );
}

export function SelectSeparator({ className, ...props }) {
    return (
        <SelectPrimitive.Separator
            className={cn("bg-border -mx-1 my-1 h-px", className)}
            {...props}
        />
    );
}

export function SelectScrollUpButton({ className, ...props }) {
    return (
        <SelectPrimitive.ScrollUpButton
            className={cn("flex items-center justify-center py-1", className)}
            {...props}
        >
            <ChevronUp className="w-4 h-4" />
        </SelectPrimitive.ScrollUpButton>
    );
}

export function SelectScrollDownButton({ className, ...props }) {
    return (
        <SelectPrimitive.ScrollDownButton
            className={cn("flex items-center justify-center py-1", className)}
            {...props}
        >
            <ChevronDown className="w-4 h-4" />
        </SelectPrimitive.ScrollDownButton>
    );
}