"use client";

import React, { useState } from "react";

type FromDataWorksapce = {
    name: string;
    slug: string;
};

type FieldErrors = Record<string, string[] | undefined>;

type InputWorkspaceProps = {
    formData: FromDataWorksapce;
    setFormData: React.Dispatch<React.SetStateAction<FromDataWorksapce>>;
    errors: FieldErrors;
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
};

export default function InputWorkspace({
    formData,
    setFormData,
    errors,
    setErrors,
}: InputWorkspaceProps) {
    const [loading, setLoading] = useState<boolean>(true);

    function generateSlug(text: string) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    const clearError = (field: keyof FromDataWorksapce) => {
        if (errors?.[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "name" ? { slug: generateSlug(value) } : {}),
        }));

        clearError(name as keyof FromDataWorksapce);
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="slug"
                    readOnly
                />
                {errors?.slug && <small className="text-danger">{errors.slug[0]}</small>}
            </div>
        </>
    );
}