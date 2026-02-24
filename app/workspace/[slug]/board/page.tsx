"use client";

import WorkspaceBoard from "@/components/pages/workspace/board/WorkspaceBoard";
import { useParams } from "next/navigation";

export default function WorkspacePageBoard() {
    const params = useParams<{ slug: string }>();
    const workspaceSlug = params.slug;

    return <WorkspaceBoard workspaceSlug={workspaceSlug} />;
}
