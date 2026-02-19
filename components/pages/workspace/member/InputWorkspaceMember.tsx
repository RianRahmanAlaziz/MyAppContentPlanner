"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Select, { SingleValue } from "react-select";

type FromDataWorksapceMember = {
    email: string;
    role: string;
};

type FieldErrors = Record<string, string[] | undefined>;

type InputWorkspaceProps = {
    formData: FromDataWorksapceMember;
    setFormData: React.Dispatch<React.SetStateAction<FromDataWorksapceMember>>;
    errors: FieldErrors;
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
};

type Option = { value: "owner" | "editor" | "reviewer" | "viewer"; label: string };

const options: Option[] = [
    { value: "owner", label: "Owner" },
    { value: "editor", label: "Editor" },
    { value: "reviewer", label: "Reviewer" },
    { value: "viewer", label: "Viewer" },
];

export default function InputWorkspaceMember({ formData,
    setFormData,
    errors,
    setErrors,
}: InputWorkspaceProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const canEditEmail = true;

    const selectedRole = useMemo(
        () => options.find((o) => o.value === formData.role) ?? null,
        [formData.role]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRoleChange = (opt: SingleValue<Option>) => {
        if (!opt) return;
        setFormData((prev) => ({ ...prev, role: opt.value }));
    };

    return (
        <>
            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="email" className="form-label">
                    Email User
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="user@gmail.com"
                    required
                    readOnly={!canEditEmail}
                />
                {errors?.email && <small className="text-danger">{errors.email[0]}</small>}
            </div>


            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="role" className="form-label">
                    Role di Workspace
                </label>

                <Select<Option, false>
                    inputId="role"
                    name="role"
                    options={options}
                    value={selectedRole}
                    onChange={handleRoleChange}
                    isSearchable={false}
                    classNamePrefix="react-select"
                />

                {errors?.role && <small className="text-danger">{errors.role[0]}</small>}
            </div>
        </>
    )
}
