"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Select, { SingleValue } from "react-select";

type FromDataWorksapce = {
    name: string;
    slug: string;
    owner_id: number | string;
}

type FieldErrors = Record<string, string[] | undefined>;

type InputWorkspaceProps = {
    formData: FromDataWorksapce;
    setFormData: React.Dispatch<React.SetStateAction<FromDataWorksapce>>;
    errors: FieldErrors;
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
}

export default function InputWorkspace({ formData, setFormData, errors, setErrors, }: InputWorkspaceProps) {
    const [loading, setLoading] = useState<boolean>(true);

    function generateSlug(text: string) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "name" ? { slug: generateSlug(value) } : {}),
        }));


        if (errors?.[name] && setErrors) {
            setErrors((prev) => ({
                ...(prev ?? {}),
                [name]: undefined,
            }));
        }
    };
    return (
        <>
            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="name" className="form-label">
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Name"
                    required
                    autoFocus
                />
                {errors?.name && <small className="text-danger">{errors.name[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="slug" className="form-label">
                    Slug
                </label>
                <input
                    id="slug"
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="slug"
                    readOnly
                />
                {errors?.slug && (
                    <small className="text-danger">{errors.slug[0]}</small>
                )}
            </div>
        </>
    )
}
