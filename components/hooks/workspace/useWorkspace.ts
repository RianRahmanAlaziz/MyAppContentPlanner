"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export type WorkSpaceItem = {
    id: number | string;
    name: string;
    slug: string;
    created_at?: string;
};

export type WorkspaceDetail = {
    id: number | string;
    name: string;
    slug: string;
    owner_id: number | string;
    created_at: string;
    updated_at: string;
    owner: {
        id: number | string;
        name: string;
        email: string;
    };
    members: Array<{
        id: number | string;
        workspace_id: number | string;
        user_id: number | string;
        role: string;
        created_at: string;
        updated_at: string;
        user: {
            id: number | string;
            name: string;
            email: string;
        };
    }>;
};

type WorkspaceDetailResponse = {
    data: WorkspaceDetail;
};

export type FieldErrors = Record<string, string[] | undefined>;

export type FormDataWorkSpace = {
    name: string;
    slug: string;
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
        data: WorkSpaceItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

export default function useWorkspace() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);
    const [workspace, setWorkspace] = useState<WorkSpaceItem[]>([]);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
    const [detailLoading, setDetailLoading] = useState<boolean>(false);
    const [workspaceDetail, setWorkspaceDetail] = useState<WorkspaceDetail | null>(null);
    const [detailModalData, setDetailModalData] = useState<{ title: string }>({ title: "" });

    const [searchTerm, setSearchTerm] = useState<string>("");

    const [formData, setFormData] = useState<FormDataWorkSpace>({
        name: "",
        slug: "",
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

    const fetchWorkspace = async (page: number = 1, search: string = ""): Promise<void> => {
        try {
            const res = await axiosInstance.get<WorkSpacesPaginatedResponse>(
                `/workspace?page=${page}&search=${encodeURIComponent(search)}`
            );

            const paginated = res.data.data;
            setWorkspace(paginated.data);

            setPagination({
                current_page: paginated.current_page,
                last_page: paginated.last_page,
                per_page: paginated.per_page,
                total: paginated.total,
            });
        } catch (error: unknown) {
            console.error("Gagal mengambil data Workspace:", error);
            toast.error("Gagal mengambil data Workspace 😞");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() !== "") setLoading(true);

        const timeout = window.setTimeout(() => {

            void fetchWorkspace(1, searchTerm);
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [searchTerm]);

    const openDetailModal = async (ws: WorkSpaceItem): Promise<void> => {
        try {
            setIsOpenDetail(true);
            setDetailLoading(true);
            setWorkspaceDetail(null);
            setDetailModalData({ title: `Detail Workspace: ${ws.name}` });

            // ambil detail dari backend
            // sesuaikan endpoint kamu: bisa /workspace/{id} atau /workspace/{slug}
            const res = await axiosInstance.get<WorkspaceDetailResponse>(`/workspace/${ws.slug}`);
            setWorkspaceDetail(res.data.data);
        } catch (error) {
            console.error("Gagal mengambil detail workspace:", error);
            toast.error("Gagal mengambil detail workspace 😞");
            setIsOpenDetail(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handlePageChange = (page: number): void => {
        if (page < 1 || page > pagination.last_page) return;
        setLoading(true);
        void fetchWorkspace(page, searchTerm);
    };

    const handleSave = async (): Promise<void> => {
        const { mode, editId } = modalData;

        try {
            const url = mode === "edit" ? `/workspace/${editId}` : "/workspace";
            const method = mode === "edit" ? "put" : "post";

            await axiosInstance({ method, url, data: formData });

            await fetchWorkspace();
            setIsOpen(false);
            setFormData({ name: "", slug: "" });
            setErrors({});

            if (mode === "edit") toast.info("Workspace berhasil diperbarui");
            else toast.success("Workspace berhasil ditambahkan");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            console.error(
                mode === "edit" ? "Gagal mengupdate Workspace:" : "Gagal menambahkan Workspace:",
                err.response?.data || err.message
            );

            // kalau backend kirim error field, simpan ke state errors
            const fieldErrors = (err.response?.data as any)?.errors as FieldErrors | undefined;
            if (fieldErrors) setErrors(fieldErrors);

            toast.error(mode === "edit" ? "Gagal memperbarui Workspace ⚠️" : "Gagal menambahkan Workspace 🚫");
        }
    };

    const openAddModal = (): void => {
        setFormData({ name: "", slug: "" });
        setErrors({});
        setModalData({ title: "Add New Workspace", mode: "add", editId: null });
        setIsOpen(true);
    };

    const openEditModal = (workspace: WorkSpaceItem): void => {
        setFormData({
            name: workspace.name ?? "",
            slug: workspace.slug ?? ""
        });

        setErrors({});
        setModalData({ title: "Edit Workspace", mode: "edit", editId: workspace.id });
        setIsOpen(true);
    };

    const openModalDelete = (workspace: WorkSpaceItem): void => {
        setModalDataDelete({
            title: `Hapus Workspace "${workspace.name}"?`,
            id: workspace.id,
        });
        setIsOpenDelete(true);
    };

    const handleDelete = async (): Promise<void> => {
        try {
            if (modalDataDelete.id == null) return;

            await axiosInstance.delete(`/workspace/${modalDataDelete.id}`);

            await fetchWorkspace();
            setIsOpenDelete(false);
            toast.success("Workspace berhasil dihapus 🗑️");
        } catch (error: unknown) {
            const err = error as AxiosError<any>;
            console.error("Gagal menghapus Workspace:", err.response?.data || err.message);
            toast.error("Gagal menghapus Workspace ❌");
        }
    };

    const openRoute = (workspace: WorkSpaceItem) => {
        router.push(`/dashboard/workspace/${workspace.slug}/members`);
    };
    return {
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
        openRoute,
        isOpenDetail,
        setIsOpenDetail,
        detailLoading,
        workspaceDetail,
        detailModalData,
        openDetailModal,
    };
}
