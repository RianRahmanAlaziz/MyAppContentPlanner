"use client";

import React, { useMemo } from "react";
import Select, { SingleValue } from "react-select";

type FormDataUsers = {
    name: string;
    email: string;
    role: string;
    password: string;
};

type FieldErrors = Partial<Record<keyof FormDataUsers, string[]>>;

type InputUsersProps = {
    formData: FormDataUsers;
    setFormData: React.Dispatch<React.SetStateAction<FormDataUsers>>;
    errors: FieldErrors;
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
};

type Option = {
    value: string;
    label: string;
};

const roleOptions: Option[] = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
];

function InputUsers({
    formData,
    setFormData,
    errors,
    setErrors,
}: InputUsersProps): React.ReactElement {
    const clearError = (field: keyof FormDataUsers) => {
        if (errors?.[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof FormDataUsers;

        setFormData((prev) => ({ ...prev, [field]: value }));
        clearError(field);
    };

    const handleSelectChange = (selected: SingleValue<Option>) => {
        setFormData((prev) => ({ ...prev, role: selected?.value ?? "" }));
        clearError("role");
    };

    const selectedRole = useMemo(
        () => roleOptions.find((opt) => opt.value === formData.role) ?? null,
        [formData.role]
    );

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
                {errors?.name?.[0] && <small className="text-danger">{errors.name[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="email" className="form-label">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="email"
                    required
                />
                {errors?.email?.[0] && <small className="text-danger">{errors.email[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="role" className="form-label">
                    Role
                </label>

                <Select<Option, false>
                    inputId="role"
                    name="role"
                    placeholder="Pilih"
                    options={roleOptions}
                    value={selectedRole}
                    onChange={handleSelectChange}
                    isSearchable={false}
                    classNamePrefix="react-select"
                />

                {errors?.role?.[0] && <small className="text-danger">{errors.role[0]}</small>}
            </div>

            <div className="col-span-6 sm:col-span-12">
                <label htmlFor="password" className="form-label">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="********"
                    required
                    autoComplete="current-password"
                />
                {errors?.password?.[0] && (
                    <small className="text-danger">{errors.password[0]}</small>
                )}
            </div>
        </>
    );
}

export default InputUsers;
