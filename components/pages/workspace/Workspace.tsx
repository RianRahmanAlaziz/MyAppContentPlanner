"use client";

import React, { useEffect } from "react";
import {
    ChevronLeft,
    ChevronsLeft,
    ChevronRight,
    ChevronsRight,
    LoaderCircle,
    Trash2,
    Plus,
    Settings2,
    Eye,
    MoreVertical,
    Pencil,
    Users,
    Calendar,
    CalendarRange,
    SquareDashedKanban,
} from "lucide-react";
import { isAdmin } from "@/lib/auth";
import Modal from "@/components/ui/Modal";
import Modaldelete from "@/components/ui/Modaldelete";
import DetailModal from "@/components/ui/DetailModal";
import useWorkspace from "@/components/hooks/workspace/useWorkspace";
import InputWorkspace from "./input/InputWorkspace";
import WorkspaceDetailModal from "./WorkspaceDetailModal";
import RowActionsDropdown from "@/components/ui/RowActionsDropdown";

export default function Workspace() {
    const {
        isOpen,
        isOpenDelete,
        workspace,
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
        isOpenDetail,
        setIsOpenDetail,
        detailLoading,
        workspaceDetail,
        openDetailModal,
        openRouteMembers,
        openRouteBoard,
        openRouteCalendar,
    } = useWorkspace();

    useEffect(() => {
        document.title = "Dashboard | Workspace Management";
    }, []);
    const admin = isAdmin();
    return (
        <>
            <h2 className="intro-y text-lg font-medium pt-24">Workspace Management</h2>

            <div className="grid grid-cols-12 gap-6 mt-5">
                {/* Toolbar */}
                <div className="intro-y col-span-12 flex flex-wrap sm:flex-nowrap items-center gap-3">
                    {admin && (
                        <button
                            onClick={openAddModal}
                            className="btn btn-primary shadow-lg mr-2">
                            <Plus className='pr-1.5' /> New Workspace
                        </button>
                    )}
                    <div className="hidden md:block mx-auto text-slate-500" />
                    <div className="w-full sm:w-auto sm:ml-auto">
                        <div className="w-full sm:w-72 relative text-slate-500">
                            <input
                                type="text"
                                className="form-control w-full box pr-10"
                                placeholder="Search workspace..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setSearchTerm(e.target.value)
                                }
                            />
                            <span className="w-4 h-4 absolute my-auto inset-y-0 mr-3 right-0 opacity-70">
                                {/* icon search bawaan midone biasanya via data-lucide, tapi ini aman */}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
                    <table className="table table-report -mt-2">
                        <thead>
                            <tr>
                                <th className="whitespace-nowrap">WORKSPACE</th>
                                <th className="text-center whitespace-nowrap w-100">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={2} className="py-8">
                                        <div className="flex justify-center items-center gap-2 text-slate-500">
                                            <LoaderCircle className="w-5 h-5 animate-spin" />
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : workspace.length > 0 ? (
                                [...workspace]
                                    .filter((w) =>
                                        w.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((w) => {
                                        const isOwner = w.my_role === "owner"; // <- role dari workspace_members

                                        return (
                                            <tr key={w.id} className="intro-x">
                                                {/* NAME */}
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <span className="font-medium text-slate-700">
                                                                {w.name?.slice(0, 1)?.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{w.name}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="text-center">
                                                    <div className="flex justify-center items-center gap-2">
                                                        {isOwner ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRouteBoard(w)}
                                                                    className="btn btn-outline-indigo btn-sm"
                                                                >
                                                                    <SquareDashedKanban className="w-4 h-4 mr-1" />
                                                                    Board
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRouteCalendar(w)}
                                                                    className="btn btn-outline-purple btn-sm"
                                                                >
                                                                    <CalendarRange className="w-4 h-4 mr-1" />
                                                                    Calendar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRouteMembers(w)}
                                                                    className="btn btn-outline-emerald btn-sm"
                                                                    title="Manage Members"
                                                                >
                                                                    <Users className="w-4 h-4 mr-1" />
                                                                    Manage Members
                                                                </button>

                                                                <RowActionsDropdown
                                                                    onDetail={() => openDetailModal(w)}
                                                                    onEdit={() => openEditModal(w)}
                                                                    onDelete={() => openModalDelete(w)}
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRouteBoard(w)}
                                                                    className="btn btn-outline-indigo btn-sm"
                                                                >
                                                                    <SquareDashedKanban className="w-4 h-4 mr-1" />
                                                                    Board
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRouteCalendar(w)}
                                                                    className="btn btn-outline-purple btn-sm"
                                                                >
                                                                    <CalendarRange className="w-4 h-4 mr-1" />
                                                                    Calendar
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDetailModal(w)}
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    title="Detail"
                                                                >
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                    Detail
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan={2} className="py-10">
                                        <div className="text-center text-slate-500">Tidak ada data</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            {/* Modal Add/Edit */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={modalData.title}
                onSave={handleSave}
            >
                <InputWorkspace
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                />
            </Modal>

            {/* Modal Detail */}
            <DetailModal
                isOpen={isOpenDetail}
                onClose={() => setIsOpenDetail(false)}
                title="Workspace details"
                hideSave
            >
                <WorkspaceDetailModal loading={detailLoading} detail={workspaceDetail} />
            </DetailModal>

            {/* Modal Delete */}
            <Modaldelete
                isOpenDelete={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onDelete={handleDelete}
                title={modalDataDelete.title}
            />
        </>
    );
}