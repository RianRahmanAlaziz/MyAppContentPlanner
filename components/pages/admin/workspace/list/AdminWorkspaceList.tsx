"use client";

import React, { useEffect } from "react";
import {
    CheckSquare,
    ChevronLeft,
    ChevronsLeft,
    ChevronRight,
    ChevronsRight,
    LoaderCircle,
    Trash2,
    Plus,
    Settings2,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import Modaldelete from "@/components/ui/Modaldelete";
import useAdminWorkspaces from "@/components/hooks/admin/workspaces/useAdminWorkspaces";
import AdminInputWorkspace from "./AdminInputWorkspace";

type Modaldelete = {
    isOpenDelete: boolean;
    onClose: () => void;
    onDelete: () => void | Promise<void>;
    title?: string;
    children?: React.ReactNode; // ✅ tambahkan ini
};

export default function AdminWorkspaceList() {
    const {
        isOpen,
        isOpenDelete,
        workSpaces,
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
        openEditModal,
        openModalDelete,
        handleDelete,
        openRoute,
    } = useAdminWorkspaces();

    useEffect(() => {
        document.title = "Dashboard | Workspace Management";
    }, []);
    return (
        <>
            <h2 className="intro-y text-lg font-medium pt-24">Workspace Management</h2>

            <div className="grid grid-cols-12 gap-6 mt-5">
                <div className="intro-y col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
                    <button
                        onClick={openAddModal}
                        className="btn btn-primary shadow-lg mr-2">
                        <Plus className='pr-1.5' /> New Workspace
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
                                <th className=" whitespace-nowrap">OWNER</th>
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
                            ) : workSpaces.length > 0 ? (
                                [...workSpaces]
                                    .filter(
                                        (workspace) =>
                                            workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .sort((a, b) => {
                                        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
                                        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
                                        return da - db;
                                    })
                                    .map((workspace) => (
                                        <motion.tr key={workspace.id} whileHover={{ scale: 1.02 }}>
                                            <td>
                                                <span className="font-medium whitespace-nowrap">
                                                    {workspace.name}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-medium whitespace-nowrap ">
                                                    {workspace.owner?.name}
                                                </span>
                                            </td>
                                            <td className="table-report__action w-80">
                                                <div className="flex justify-center items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRoute(workspace)}
                                                        className="flex items-center mr-3 text-primary"
                                                    >
                                                        <Settings2 className="w-4 h-4 mr-1 text" /> Manage Members
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(workspace)}
                                                        className="flex items-center mr-3 text-warning"
                                                    >
                                                        <CheckSquare className="w-4 h-4 mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openModalDelete(workspace)}
                                                        className="flex items-center mr-3 text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" /> Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">
                                        Tidak ada data
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
                <AdminInputWorkspace
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
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
