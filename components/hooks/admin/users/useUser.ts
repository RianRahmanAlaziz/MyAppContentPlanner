"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";


export type UserItem = {
    id: number | string;
    name: string;
    email: string;
    role: string;
    created_at?: string;
};

export type FieldErrors = Record<string, string[] | undefined>;

export type FormDataUsers = {
    name: string;
    email: string;
    role: string;
    password: string;
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

type UsersPaginatedResponse = {
    data: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function useUser() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);

    const [users, setUsers] = useState<UserItem[]>([]);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState<boolean>(true);

    const [searchTerm, setSearchTerm] = useState<string>("");

    const [formData, setFormData] = useState<FormDataUsers>({
        name: "",
        email: "",
        role: "",
        password: "",
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

    const fetchUsers = async (page: number = 1, search: string = ""): Promise<void> => {
        try {
            const res = await axiosInstance.get<UsersPaginatedResponse>(
                `/admin/users?page=${page}&search=${encodeURIComponent(search)}`
            );

            const paginated = res.data.data;
            setUsers(paginated.data);

            setPagination({
                current_page: paginated.current_page,
                last_page: paginated.last_page,
                per_page: paginated.per_page,
                total: paginated.total,
            });
        } catch (error: unknown) {
            console.error("Gagal mengambil data user:", error);
            toast.error("Gagal mengambil data user 😞");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() !== "") setLoading(true);

        const timeout = window.setTimeout(() => {
            // ✅ FIX: param fetchUsers(page, search)
            void fetchUsers(1, searchTerm);
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [searchTerm]);

    const handlePageChange = (page: number): void => {
        if (page < 1 || page > pagination.last_page) return;
        setLoading(true);
        void fetchUsers(page, searchTerm);
    };

    const handleSaveUser = async (): Promise<void> => {
        const { mode, editId } = modalData;

        try {
            const url = mode === "edit" ? `/admin/users/${editId}` : "/admin/users";
            const method = mode === "edit" ? "put" : "post";

            await axiosInstance({ method, url, data: formData });

            await fetchUsers();
            setIsOpen(false);
            setFormData({ name: "", email: "", password: "", role: "" });
            setErrors({});

            if (mode === "edit") toast.info("User berhasil diperbarui");
            else toast.success("User berhasil ditambahkan");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            console.error(
                mode === "edit" ? "Gagal mengupdate user:" : "Gagal menambahkan user:",
                err.response?.data || err.message
            );

            // kalau backend kirim error field, simpan ke state errors
            const fieldErrors = (err.response?.data as any)?.errors as FieldErrors | undefined;
            if (fieldErrors) setErrors(fieldErrors);

            toast.error(mode === "edit" ? "Gagal memperbarui user ⚠️" : "Gagal menambahkan user 🚫");
        }
    };

    const openAddUserModal = (): void => {
        setFormData({ name: "", email: "", role: "", password: "" });
        setErrors({});
        setModalData({ title: "Add New User", mode: "add", editId: null });
        setIsOpen(true);
    };

    const openEditUserModal = (user: UserItem): void => {
        setFormData({
            name: user.name ?? "",
            email: user.email ?? "",
            role: user.role ?? "",
            password: "",
        });

        setErrors({});
        setModalData({ title: "Edit User", mode: "edit", editId: user.id });
        setIsOpen(true);
    };

    const openModalDelete = (user: UserItem): void => {
        setModalDataDelete({
            title: `Hapus user "${user.name}"?`,
            id: user.id,
        });
        setIsOpenDelete(true);
    };

    const handleDeleteUser = async (): Promise<void> => {
        try {
            if (modalDataDelete.id == null) return;

            await axiosInstance.delete(`/admin/users/${modalDataDelete.id}`);

            await fetchUsers();
            setIsOpenDelete(false);
            toast.success("User berhasil dihapus 🗑️");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            console.error("Gagal menghapus user:", err.response?.data || err.message);
            toast.error("Gagal menghapus user ❌");
        }
    };

    return {
        isOpen,
        isOpenDelete,
        users,
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
        handleSaveUser,
        openAddUserModal,
        openEditUserModal,
        openModalDelete,
        handleDeleteUser,
    };
}
