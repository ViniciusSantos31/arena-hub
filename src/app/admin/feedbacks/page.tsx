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
    <FeedbackReviewTabs
      pending={pending.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))}
      approved={approved.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
