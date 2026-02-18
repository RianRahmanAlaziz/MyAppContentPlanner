"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Select, { SingleValue } from "react-select";

type FromDataWorksapce = {
    name: string;
    slug: string;
    owner_id: number | string;
};

type FieldErrors = Record<string, string[] | undefined>;

type InputWorkspaceProps = {
    formData: FromDataWorksapce;
    setFormData: React.Dispatch<React.SetStateAction<FromDataWorksapce>>;
    errors: FieldErrors;
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
};

type UserItem = {
    id: number | string;
    name: string;
};

type Option = {
    value: number | string;
    label: string;
};

export default function InputWorkspace({
    formData,
    setFormData,
    errors,
    setErrors,
}: InputWorkspaceProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<UserItem[]>([]);

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // sesuaikan kalau response kamu beda
                const res = await axiosInstance.get("/users");
                const list: UserItem[] = res.data?.data?.data ?? res.data?.data ?? [];

                setUsers(list);
            } catch (error) {
                console.error("Gagal memuat users:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchUsers();
    }, []);

    const options: Option[] = useMemo(
        () =>
            users.map((u) => ({
                value: u.id,
                label: u.name,
            })),
        [users]
    );

    const selectedOwner = useMemo(
        () => options.find((opt) => String(opt.value) === String(formData.owner_id)) ?? null,
        [options, formData.owner_id]
    );

    const handleOwnerChange = (selected: SingleValue<Option>) => {
        setFormData((prev) => ({
            ...prev,
            owner_id: selected?.value ?? "",
        }));
        clearError("owner_id");
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

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="owner_id" className="form-label">
                    Owner
                </label>

                <Select<Option, false>
                    inputId="owner_id"
                    name="owner_id"
                    options={options}
                    placeholder={loading ? "Memuat data..." : "Pilih Owner"}
                    value={selectedOwner}
                    onChange={handleOwnerChange}
                    isLoading={loading}
                    isDisabled={loading}
                    isSearchable={false}
                    classNamePrefix="react-select"
                />

                {errors?.owner_id && <small className="text-danger">{errors.owner_id[0]}</small>}
            </div>
        </>
    );
}