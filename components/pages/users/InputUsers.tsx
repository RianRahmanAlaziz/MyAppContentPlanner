"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Select, { SingleValue } from "react-select";



type FormDataUsers = {
    name: string;
    email: string;
    password: string;
};

type FieldErrors = Record<string, string[] | undefined>;

type InputUsersProps = {
    formData: FormDataUsers;
    setFormData: React.Dispatch<React.SetStateAction<FormDataUsers>>;
    errors: FieldErrors;
    setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
};



function InputUsers({
    formData,
    setFormData,
    errors,
    setErrors,
}: InputUsersProps): React.ReactElement {
    const [loading, setLoading] = useState<boolean>(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
                <label htmlFor="email" className="form-label">
                    Email
                </label>
                <input
                    id="email"
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="email"
                    required
                />
                {errors?.email && (
                    <small className="text-danger">{errors.email[0]}</small>
                )}
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
                    onChange={handleChange}
                    className="form-control"
                    placeholder="********"
                    required
                    autoComplete="current-password"
                />
                {errors?.password && (
                    <small className="text-danger">{errors.password[0]}</small>
                )}
            </div>
        </>
    );
}

export default InputUsers;
