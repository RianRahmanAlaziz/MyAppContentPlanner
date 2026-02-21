"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Select, { SingleValue } from "react-select";


type FromDataWorksapceMember = {
    email: string;
    role: string;
};

type FieldErrors = Record<string, string[] | undefined>;

type UserItem = {
    id: number;
    name: string;
    email: string;
};

type Option = { value: string; label: string };

type InputWorkspaceProps = {
    mode: "add" | "edit";
    formData: FromDataWorksapceMember;
    setFormData: React.Dispatch<React.SetStateAction<FromDataWorksapceMember>>;
    errors: FieldErrors;
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
    existingMembers: string[];
};

const options: Option[] = [
    { value: "owner", label: "Owner" },
    { value: "editor", label: "Editor" },
    { value: "reviewer", label: "Reviewer" },
    { value: "viewer", label: "Viewer" },
];


export default function InputWorkspaceMember({ mode, formData,
    setFormData,
    errors,
    setErrors,
    existingMembers,
}: InputWorkspaceProps) {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get("/admin/users?only_unassigned=1");
                const list: UserItem[] = res.data?.data?.data ?? res.data?.data ?? [];
                setUsers(list);
            } catch (error) {
                console.error("Gagal mengambil users:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchUsers();
    }, []);

    // filter user yang belum jadi member
    const availableUsers = useMemo(() => {
        return users.filter((u) => !existingMembers.includes(u.email));
    }, [users, existingMembers]);

    const userOptions: Option[] = availableUsers.map((u) => ({
        value: u.email,
        label: `${u.name} (${u.email})`,
    }));

    const finalUserOptions = useMemo(() => {
        // kalau email formData tidak ada di options (biasanya saat edit),
        // tambahkan agar select bisa menampilkan nilai yang sedang diedit.
        if (!formData.email) return userOptions;

        const exists = userOptions.some((o) => o.value === formData.email);
        if (exists) return userOptions;

        // inject current email supaya tetap ter-select
        return [
            { value: formData.email, label: formData.email },
            ...userOptions,
        ];
    }, [userOptions, formData.email]);

    const selectedUser = useMemo(
        () => finalUserOptions.find((o) => o.value === formData.email) ?? null,
        [finalUserOptions, formData.email]
    );


    const handleUserChange = (opt: SingleValue<Option>) => {
        if (!opt) return;
        setFormData((prev) => ({ ...prev, email: opt.value }));
    };

    const selectedRole = useMemo(() => options.find((o) => o.value === formData.role) ?? null, [formData.role]);

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

                <Select<Option, false>
                    name="email"
                    options={finalUserOptions}
                    value={selectedUser}
                    onChange={handleUserChange}
                    isLoading={loading}
                    placeholder={loading ? "Memuat user..." : "Pilih user"}
                    isDisabled={mode === "edit"}
                    classNamePrefix="react-select"
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
