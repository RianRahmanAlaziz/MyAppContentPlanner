"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Select, { SingleValue } from "react-select";

export default function InputContent() {
    return (
        <>
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
        </>
    )
}
