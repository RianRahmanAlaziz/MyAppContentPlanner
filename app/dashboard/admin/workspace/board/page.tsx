"use client";
import WorkspaceBoard from '@/components/pages/workspace/board/WorkspaceBoard'
import { useWorkspaceBoard } from "@/components/hooks/admin/workspaces/useWorkspaceBoard";
import type { ContentStatus } from "@/components/pages/workspace/types/content";

export default function WorkspacePageBoard() {
    const workspaceId = '1';

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
