import { listJoinRequests } from "@/actions/group/list-join-requests";
import { JoinRequestsList } from "../../_components/join-requests-list";

export default async function RequestsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const response = await listJoinRequests({ organizationCode: code });

  if (!response?.data) {
    return (
      <div className="flex flex-col gap-4 pt-4">
        <JoinRequestsList requests={[]} organizationCode={code} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <JoinRequestsList requests={response.data} organizationCode={code} />
    </div>
  );
}
