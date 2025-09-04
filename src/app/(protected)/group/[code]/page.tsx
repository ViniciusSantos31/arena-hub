import { permanentRedirect } from "next/navigation";

type GroupPageProps = {
  params: Promise<{ code: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { code } = await params;

  return permanentRedirect(`/group/${code}/dashboard`);
}
