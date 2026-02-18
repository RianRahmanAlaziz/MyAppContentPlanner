"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export type WorkSpacesMemberItem = {
    id: number | string;
    workspace_id: number | string;
    user_id: number | string;
    role: string;
    created_at?: string;
};

export type FieldErrors = Record<string, string[] | undefined>;

export type FormDataWorkSpacessMember = {
    workspace_id: number | string;
    user_id: number | string;
    role: string;
};

export type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type ModalMode = "add" | "edit";

export type ModalData = {
    title: string;
    mode: ModalMode;
    editId: number | string | null;
};

export type ModalDeleteData = {
    title: string;
    id?: number | string;
};

type WorkSpacessMemberPaginatedResponse = {
    data: {
        data: WorkSpacesMemberItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function useWorkspacesMember() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);
    const [workSpacesMember, setWorkSpacesMember] = useState<WorkSpacesMemberItem[]>([]);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [formData, setFormData] = useState<FormDataWorkSpacessMember>({
        workspace_id: "",
        user_id: "",
        role: "",
    });

    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    const [modalData, setModalData] = useState<ModalData>({
        title: "",
        mode: "add",
        editId: null,
    });

    const [modalDataDelete, setModalDataDelete] = useState<ModalDeleteData>({
        title: "",
    });

    const fetchWorkSpacesMember = async (page: number = 1, search: string = ""): Promise<void> => {
        try {
            const res = await axiosInstance.get<WorkSpacessMemberPaginatedResponse>(
                `/workspace?page=${page}&search=${encodeURIComponent(search)}`
            );

            const paginated = res.data.data;
            setWorkSpacesMember(paginated.data);

            setPagination({
                current_page: paginated.current_page,
                last_page: paginated.last_page,
                per_page: paginated.per_page,
                total: paginated.total,
            });
        } catch (error: unknown) {
            console.error("Gagal mengambil data WorkSpace:", error);
            toast.error("Gagal mengambil data WorkSpace 😞");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() !== "") setLoading(true);

        const timeout = window.setTimeout(() => {

            void fetchWorkSpacesMember(1, searchTerm);
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [searchTerm]);

    const handlePageChange = (page: number): void => {
        if (page < 1 || page > pagination.last_page) return;
        setLoading(true);
        void fetchWorkSpacesMember(page, searchTerm);
    };

    const handleSave = async (): Promise<void> => {
        const { mode, editId } = modalData;

        try {
            const url = mode === "edit" ? `/workspace/${editId}` : "/workspace";
            const method = mode === "edit" ? "put" : "post";

            await axiosInstance({ method, url, data: formData });

            await fetchWorkSpacesMember();
            setIsOpen(false);
            setFormData({ workspace_id: "", user_id: "", role: "" });
            setErrors({});

            if (mode === "edit") toast.info("WorkSpaces berhasil diperbarui");
            else toast.success("WorkSpaces berhasil ditambahkan");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            console.error(
                mode === "edit" ? "Gagal mengupdate WorkSpaces:" : "Gagal menambahkan WorkSpaces:",
                err.response?.data || err.message
            );

            // kalau backend kirim error field, simpan ke state errors
            const fieldErrors = (err.response?.data as any)?.errors as FieldErrors | undefined;
            if (fieldErrors) setErrors(fieldErrors);

            toast.error(mode === "edit" ? "Gagal memperbarui WorkSpaces ⚠️" : "Gagal menambahkan WorkSpaces 🚫");
        }
    };

    const openAddModal = (): void => {
        setFormData({ workspace_id: "", user_id: "", role: "" });
        setErrors({});
        setModalData({ title: "Add New Workspaces", mode: "add", editId: null });
        setIsOpen(true);
    };

    const openEditModal = (workspaces: WorkSpacesMemberItem): void => {
        setFormData({
            workspace_id: workspaces.workspace_id ?? "",
            user_id: workspaces.user_id ?? "",
            role: workspaces.role ?? "",
        });

        setErrors({});
        setModalData({ title: "Edit Workspaces", mode: "edit", editId: workspaces.id });
        setIsOpen(true);
    };

    const openModalDelete = (workspaces: WorkSpacesMemberItem): void => {
        setModalDataDelete({
            title: `Hapus WorkSpaces "${workspaces.role}"?`,
            id: workspaces.id,
        });
        setIsOpenDelete(true);
    };

    const handleDelete = async (): Promise<void> => {
        try {
            if (modalDataDelete.id == null) return;

            await axiosInstance.delete(`/workspaces/${modalDataDelete.id}`);

            await fetchWorkSpacesMember();
            setIsOpenDelete(false);
            toast.success("WorkSpaces berhasil dihapus 🗑️");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            console.error("Gagal menghapus WorkSpaces:", err.response?.data || err.message);
            toast.error("Gagal menghapus WorkSpaces ❌");
        }
    };

    return {
        isOpen,
        isOpenDelete,
        workSpacesMember,
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
    };
}
