"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export type MemberItem = {
    user_id: number;
    name: string;
    email: string;
    workspace_role: "owner" | "editor" | "reviewer" | "viewer";
    is_owner: boolean;
};

export type FieldErrors = Record<string, string[] | undefined>;

export type FormDataMember = {
    email: string;
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
    editUserId: number | null;
};

export type ModalDeleteData = {
    title: string;
    userId?: number;
};

type IndexResponse = {
    message: string;
    meta: {
        workspace: {
            id: number;
            name: string;
            slug?: string | null;
        };
    };
    data: {
        data: MemberItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function useWorkspacesMember(workspaceId: string) {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [members, setMembers] = useState<MemberItem[]>([]);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState<FormDataMember>({
        email: "",
        role: "viewer",
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
        editUserId: null,
    });

    const [modalDataDelete, setModalDataDelete] = useState<ModalDeleteData>({
        title: "",
        userId: undefined,
    });

    const fetchMembers = async (page: number = 1, search: string = "") => {
        if (!workspaceId) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get<IndexResponse>(
                `/workspace/${workspaceId}/members?page=${page}&search=${encodeURIComponent(search)}`
            );
            setWorkspaceName(res.data?.meta?.workspace?.name ?? "");

            const paginated = res.data.data;
            setMembers(paginated.data);
            setPagination({
                current_page: paginated.current_page,
                last_page: paginated.last_page,
                per_page: paginated.per_page,
                total: paginated.total,
            });
        } catch (error: unknown) {
            console.error("Gagal mengambil member:", error);
            toast.error("Gagal mengambil member 😞");
        } finally {
            setLoading(false);
        }
    };

    // debounce search
    useEffect(() => {
        const t = window.setTimeout(() => {
            void fetchMembers(1, searchTerm);
        }, 400);

        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, workspaceId]);

    // first load
    useEffect(() => {
        void fetchMembers(1, "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.last_page) return;
        void fetchMembers(page, searchTerm);
    };

    const openAddModal = () => {
        setFormData({ email: "", role: "" });
        setErrors({});
        setModalData({ title: "Add New Member", mode: "add", editUserId: null });
        setIsOpen(true);
    };

    const openEditModal = (m: MemberItem) => {
        setFormData({ email: m.email, role: m.workspace_role });
        setErrors({});
        setModalData({ title: `Edit Role — ${m.name}`, mode: "edit", editUserId: m.user_id });
        setIsOpen(true);
    };

    const openModalDelete = (m: MemberItem) => {
        setModalDataDelete({ title: `Hapus member "${m.name}"?`, userId: m.user_id });
        setIsOpenDelete(true);
    };

    const handleSave = async () => {
        try {
            setErrors({});

            if (modalData.mode === "add") {
                await axiosInstance.post(`/admin/workspace/${workspaceId}/members`, formData);
                toast.success("Member berhasil ditambahkan");
            } else {
                if (!modalData.editUserId) return;

                // sesuai route kamu: PUT .../members/{user}
                await axiosInstance.put(
                    `/admin/workspace/${workspaceId}/members/${modalData.editUserId}`,
                    { role: formData.role }
                );
                toast.info("Role berhasil diperbarui");
            }

            setIsOpen(false);
            await fetchMembers(pagination.current_page, searchTerm);
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            const status = err.response?.status;
            const data = err.response?.data;

            // format error kamu: { success:false, message:"Validation failed", error:{details:{...}} }
            const details = data?.error?.details;
            if (status === 422 && details) {
                setErrors(details);
                toast.error(data?.message || "Validasi gagal");
                return;
            }

            toast.error(data?.message || "Gagal menyimpan");
        }
    };

    const handleDelete = async () => {
        try {
            if (!modalDataDelete.userId) return;

            await axiosInstance.delete(`/admin/workspace/${workspaceId}/members/${modalDataDelete.userId}`);
            toast.success("Member berhasil dihapus 🗑️");

            setIsOpenDelete(false);
            await fetchMembers(pagination.current_page, searchTerm);
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            toast.error(err.response?.data?.message || "Gagal menghapus member ❌");
        }
    };

    const updateRole = async (userId: number, role: MemberItem["workspace_role"]) => {
        if (!workspaceId) return;

        // optimistic update
        const prev = members;
        setMembers((curr) =>
            curr.map((m) => (m.user_id === userId ? { ...m, workspace_role: role } : m))
        );

        try {
            await axiosInstance.put(`/admin/workspace/${workspaceId}/members/${userId}`, { role });
            toast.success("Role updated");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            toast.error(err.response?.data?.message || "Gagal update role");
            // revert
            setMembers(prev);
        }
    };

    return {
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
        openEditModal,
        openModalDelete,
        handleDelete,
        workspaceName,
        updateRole
    };
}
