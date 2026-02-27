"use client";

import { useParams } from "next/navigation";
import { useWorkspaceBoard } from "@/components/hooks/workspace/useWorkspaceBoard";
import WorkspaceBoard from "@/components/pages/workspace/board/WorkspaceBoard";
import type { ContentStatus } from "@/components/pages/workspace/types/content";

export default function WorkspacePageBoard() {
    const params = useParams<{ slug: string }>();
    const workspaceId = params?.slug;

    // kalau slug belum ready (kadang awal render)
    if (!workspaceId) return null;

    // hook ini harusnya fetch board berdasarkan slug
    const {
        loading,
        columns,
        createContent,
        moveContent,
        reorderWithinColumn,
    } = useWorkspaceBoard(workspaceId);

    return (
        <WorkspaceBoard
            loading={loading}
            columns={columns}
            onCreate={createContent}
            onMove={(contentId: number, toStatus: ContentStatus) => moveContent(contentId, toStatus)}
            onReorderUIOnly={(status, orderedIds) => reorderWithinColumn(status, orderedIds)}
        />
    )
}
