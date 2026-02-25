"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export type WorkSpacesItem = {
    id: number | string;
    name: string;
    slug: string;
    owner_id: number | string;
    created_at?: string;
    owner?: {
        id: number | string;
        name: string;
        email?: string;
        role?: string;
    };
};

export type FieldErrors = Record<string, string[] | undefined>;

export type FormDataWorkSpaces = {
    name: string;
    slug: string;
    owner_id: number | string;
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

type WorkSpacesPaginatedResponse = {
    data: {
        data: WorkSpacesItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function useWorkspaces() {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);
    const router = useRouter();
    const [workSpaces, setWorkSpaces] = useState<WorkSpacesItem[]>([]);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState<boolean>(true);

    const [searchTerm, setSearchTerm] = useState<string>("");

    const [formData, setFormData] = useState<FormDataWorkSpaces>({
        name: "",
        slug: "",
        owner_id: "",
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

    const fetchWorkSpaces = async (page: number = 1, search: string = ""): Promise<void> => {
        try {
            const res = await axiosInstance.get<WorkSpacesPaginatedResponse>(
                `/admin/workspace?page=${page}&search=${encodeURIComponent(search)}`
            );

            const paginated = res.data.data;
            setWorkSpaces(paginated.data);

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

            void fetchWorkSpaces(1, searchTerm);
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [searchTerm]);

    const handlePageChange = (page: number): void => {
        if (page < 1 || page > pagination.last_page) return;
        setLoading(true);
        void fetchWorkSpaces(page, searchTerm);
    };

    const handleSave = async (): Promise<void> => {
        const { mode, editId } = modalData;

        try {
            const url = mode === "edit" ? `/admin/workspace/${editId}` : "/admin/workspace";
            const method = mode === "edit" ? "put" : "post";

            await axiosInstance({ method, url, data: formData });

            await fetchWorkSpaces();
            setIsOpen(false);
            setFormData({ name: "", slug: "", owner_id: "" });
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
        setFormData({ name: "", slug: "", owner_id: "" });
        setErrors({});
        setModalData({ title: "Add New Workspaces", mode: "add", editId: null });
        setIsOpen(true);
    };

    const openEditModal = (workspaces: WorkSpacesItem): void => {
        setFormData({
            name: workspaces.name ?? "",
            slug: workspaces.slug ?? "",
            owner_id: workspaces.owner_id ?? "",
        });

        setErrors({});
        setModalData({ title: "Edit Workspaces", mode: "edit", editId: workspaces.id });
        setIsOpen(true);
    };

    const openModalDelete = (workspaces: WorkSpacesItem): void => {
        setModalDataDelete({
            title: `Hapus WorkSpaces "${workspaces.name}"?`,
            id: workspaces.id,
        });
        setIsOpenDelete(true);
    };

    const handleDelete = async (): Promise<void> => {
        try {
            if (modalDataDelete.id == null) return;

            await axiosInstance.delete(`/admin/workspace/${modalDataDelete.id}`);

            await fetchWorkSpaces();
            setIsOpenDelete(false);
            toast.success("WorkSpaces berhasil dihapus 🗑️");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            console.error("Gagal menghapus WorkSpaces:", err.response?.data || err.message);
            toast.error("Gagal menghapus WorkSpaces ❌");
        }
    };

    const openRoute = (workspace: WorkSpacesItem) => {
        router.push(`/dashboard/admin/workspace/${workspace.slug}/members`);
    };

    return {
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
        openRoute
    };
}
