import { adminListFeedbacks } from "@/actions/admin/feedback";
import { FeedbackReviewTabs } from "@/app/admin/feedbacks/_components/feedback-review-tabs";

export default async function AdminFeedbacksPage() {
  const pending = await adminListFeedbacks({
    status: "pending",
    limit: 200,
  }).then((r) => r.data ?? []);
  const approved = await adminListFeedbacks({
    status: "approved",
    limit: 200,
  }).then((r) => r.data ?? []);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedbacks</h1>
        <p className="text-muted-foreground">
          Aprove ou reprove feedbacks antes de exibir na landing page.
        </p>
      </div>

      <FeedbackReviewTabs
        pending={pending.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        approved={approved.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />
    </div>
  );
}

