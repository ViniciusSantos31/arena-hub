"use client";

import {
  adminDeleteFeedback,
  adminSetFeedbackApproval,
} from "@/actions/admin/feedback";
import { FeedbackCardsGrid } from "@/app/admin/feedbacks/_components/feedback-cards-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type FeedbackRow = {
  id: string;
  userId: string;
  userNameSnapshot: string;
  userImageSnapshot: string | null;
  rating: number;
  message: string;
  isApproved: boolean;
  createdAt: string;
};

export function FeedbackReviewTabs({
  pending,
  approved,
}: {
  pending: FeedbackRow[];
  approved: FeedbackRow[];
}) {
  const [pendingRows, setPendingRows] = useState<FeedbackRow[]>(pending);
  const [approvedRows, setApprovedRows] = useState<FeedbackRow[]>(approved);

  const setApprovalAction = useAction(adminSetFeedbackApproval, {
    onError: () => toast.error("Não foi possível atualizar o feedback."),
  });

  const deleteAction = useAction(adminDeleteFeedback, {
    onError: () => toast.error("Não foi possível excluir o feedback."),
  });

  const isBusy = useMemo(
    () =>
      setApprovalAction.isExecuting ||
      setApprovalAction.isPending ||
      deleteAction.isExecuting ||
      deleteAction.isPending,
    [
      setApprovalAction.isExecuting,
      setApprovalAction.isPending,
      deleteAction.isExecuting,
      deleteAction.isPending,
    ],
  );

  const approve = async (id: string) => {
    const res = await setApprovalAction.executeAsync({ id, isApproved: true });
    if (!res?.data) return;

    const updated = {
      ...res.data,
      createdAt: new Date(
        (res.data as { createdAt: Date }).createdAt,
      ).toISOString(),
    };

    setPendingRows((prev) => prev.filter((r) => r.id !== id));
    setApprovedRows((prev) => [updated, ...prev]);
    toast.success("Feedback aprovado.");
  };

  const reject = async (id: string) => {
    const res = await setApprovalAction.executeAsync({ id, isApproved: false });
    if (!res?.data) return;

    const updated = {
      ...(res.data as unknown as FeedbackRow),
      createdAt: new Date(
        (res.data as { createdAt: Date }).createdAt,
      ).toISOString(),
    };

    setApprovedRows((prev) => prev.filter((r) => r.id !== id));
    setPendingRows((prev) => [updated, ...prev]);
    toast.success("Feedback movido para pendente.");
  };

  const remove = async (id: string) => {
    const res = await deleteAction.executeAsync({ id });
    if (!res?.data) return;
    setPendingRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Feedback reprovado (excluído).");
  };

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">
          Pendentes ({pendingRows.length})
        </TabsTrigger>
        <TabsTrigger value="approved">
          Aprovados ({approvedRows.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="pt-4">
        <FeedbackCardsGrid
          rows={pendingRows}
          primaryActionLabel="Aprovar"
          secondaryActionLabel="Reprovar"
          onPrimaryAction={approve}
          onSecondaryAction={remove}
          disableActions={isBusy}
        />
      </TabsContent>

      <TabsContent value="approved" className="pt-4">
        <FeedbackCardsGrid
          rows={approvedRows}
          primaryActionLabel="Desaprovar"
          secondaryActionLabel={null}
          onPrimaryAction={reject}
          onSecondaryAction={undefined}
          disableActions={isBusy}
        />
      </TabsContent>
    </Tabs>
  );
}
