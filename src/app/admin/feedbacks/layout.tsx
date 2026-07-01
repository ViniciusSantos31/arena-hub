import { AdminPageShell } from "@/app/admin/_components/admin-page-shell";

export default function FeedbacksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPageShell title="Feedbacks">{children}</AdminPageShell>;
}
