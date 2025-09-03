import { permanentRedirect } from "next/navigation";

type GroupPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = await params;

  return permanentRedirect(`/group/${id}/dashboard`);
}
