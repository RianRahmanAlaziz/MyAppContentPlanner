"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Select, { SingleValue } from "react-select";
import {
    CheckSquare,
    ChevronLeft,
    ChevronsLeft,
    ChevronRight,
    ChevronsRight,
    LoaderCircle,
    Trash2,
    Plus,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Modaldelete from "@/components/ui/Modaldelete";
import useAdminWorkspacesMember from "@/components/hooks/admin/workspaces/useAdminWorkspacesMember";
import AdminInputWorkspaceMember from "./AdminInputWorkspaceMember";

type Modaldelete = {
    isOpenDelete: boolean;
    onClose: () => void;
    onDelete: () => void | Promise<void>;
    title?: string;
    children?: React.ReactNode; // ✅ tambahkan ini
};

type RoleOption = { value: "owner" | "editor" | "reviewer" | "viewer"; label: string };

const ROLE_OPTIONS: RoleOption[] = [
    { value: "owner", label: "Owner" },
    { value: "editor", label: "Editor" },
    { value: "reviewer", label: "Reviewer" },
    { value: "viewer", label: "Viewer" },
];

export default function AdminWorkspaceMember() {
    const params = useParams<{ slug: string }>();
    const workspaceId = params.slug;

    const {
        isOpen,
        isOpenDelete,
        members,
        loading,
        searchTerm,
        setSearchTerm,
        pagination,
        modalData,
        modalDataDelete,
        formData,
        setFormData,
        errors,
        setErrors,
        setIsOpen,
        setIsOpenDelete,
        handlePageChange,
        handleSave,
        openAddModal,
        openModalDelete,
        handleDelete,
        workspaceName,
        updateRole
    } = useAdminWorkspacesMember(workspaceId);

    const existingEmails = members.map((m) => m.email);

    useEffect(() => {
        document.title = "Dashboard | Workspace Management";
    }, []);

    return (
        <>
            <h2 className="intro-y text-lg font-medium pt-24"> Workspace  {workspaceName ? `${workspaceName}` : ""}</h2>
            <div className="grid grid-cols-12 gap-6 mt-5">
                <div className="intro-y col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
                    <button
                        onClick={openAddModal}
                        className="btn btn-primary shadow-lg mr-2">
                        <Plus className='pr-1.5' /> New Member
                    </button>
                    <div className="hidden md:block mx-auto text-slate-500" />

                    <div className="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto md:ml-0">
                        <div className="w-56 relative text-slate-500">
                            <input
                                type="text"
                                className="form-control w-56 box pr-10"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setSearchTerm(e.target.value)
                                }
                            />
                            <i
                                className="w-4 h-4 absolute my-auto inset-y-0 mr-3 right-0"
                                data-lucide="search"
                            />
                        </div>
                    </div>
                </div>

                <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
                    <table className="table table-report -mt-2">
                        <thead>
                            <tr>
                                <th className="whitespace-nowrap">NAME</th>
                                <th className="whitespace-nowrap">ROLE</th>
                                <th className="text-center whitespace-nowrap">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-6">
                                        <div className="flex justify-center items-center">
                                            <LoaderCircle className="w-6 h-6 animate-spin text-gray-500" />
                                        </div>
                                    </td>
                                </tr>
                            ) : members.length > 0 ? (
                                [...members]
                                    .filter((m) => {
                                        const term = searchTerm.toLowerCase();
                                        return (
                                            m.name.toLowerCase().includes(term) ||
                                            m.email.toLowerCase().includes(term) ||
                                            m.workspace_role.toLowerCase().includes(term)
                                        );
                                    })
                                    .map((m) => (
                                        <motion.tr key={m.user_id} whileHover={{ scale: 1.02 }}>
                                            <td>
                                                <span className="font-medium whitespace-nowrap">{m.name}</span>
                                                <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">{m.email}</div>
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <div className="min-w-45">
                                                    <Select<RoleOption, false>
                                                        classNamePrefix="react-select"
                                                        isSearchable={false}
                                                        options={ROLE_OPTIONS}
                                                        value={ROLE_OPTIONS.find((o) => o.value === m.workspace_role) || ROLE_OPTIONS[0]}
                                                        onChange={(opt: SingleValue<RoleOption>) => {
                                                            if (!opt) return;
                                                            if (opt.value === m.workspace_role) return;
                                                            // proteksi: jangan ubah owner via select (opsional)
                                                            if (m.workspace_role === "owner") return;

                                                            updateRole(m.user_id, opt.value);
                                                        }}
                                                        isDisabled={m.workspace_role === "owner"} // owner tidak bisa diubah
                                                    />
                                                </div>
                                            </td>
                                            <td className="table-report__action w-56">
                                                <div className="flex justify-center items-center">
                                                    {m.workspace_role !== "owner" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openModalDelete(m)}
                                                            className="flex items-center mr-3 text-red-500"
                                                            title="Remove member"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" /> Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">
                                        Tidak ada data user
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="intro-y col-span-12 flex justify-center items-center mt-5">
                    <nav className="w-auto">
                        <ul className="pagination">
                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.current_page === 1}
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                            </li>

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </li>

                            {Array.from({ length: pagination.last_page }).map((_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${pagination.current_page === i + 1 ? "active" : ""
                                        }`}
                                >
                                    <button
                                        type="button"
                                        className="page-link"
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </li>

                            <li className="page-item">
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(pagination.last_page)}
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* 🔹 Modal Add/Edit */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={modalData.title}
                onSave={handleSave}
            >
                <AdminInputWorkspaceMember
                    mode={modalData.mode}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    existingMembers={existingEmails}
                />
            </Modal>

            <Modaldelete
                isOpenDelete={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onDelete={handleDelete}
                title={modalDataDelete.title}
            >
            </Modaldelete>
        </>
    )
}
