import { getPublicProfile } from "@/actions/user/get-public-profile";
import { listMyAdminGroups } from "@/actions/user/list-my-admin-groups";
import { Separator } from "@/components/ui/separator";
import { getAvatarFallback } from "@/utils/avatar";
import { notFound } from "next/navigation";
import { PublicProfileHeader } from "./_components/public-profile-header";
import { PublicProfileStats } from "./_components/public-profile-stats";
import { InviteToGroupSection } from "./_components/invite-to-group-section";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [profileResult, adminGroupsResult] = await Promise.all([
    getPublicProfile({ userId: id }),
    listMyAdminGroups(),
  ]);

  const data = profileResult?.data;
  if (!data) notFound();

  const adminGroups = adminGroupsResult?.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <PublicProfileHeader
        user={{
          name: data.user.name,
          image: data.user.image,
          bio: data.user.bio ?? undefined,
          location: data.user.location ?? undefined,
        }}
        avatarFallback={getAvatarFallback(data.user.name)}
      />

      <PublicProfileStats
        stats={data.stats}
        commonGroups={data.commonGroups}
        recentMatches={data.recentMatches}
      />

      {adminGroups.length > 0 && (
        <>
          <Separator />
          <InviteToGroupSection
            targetUserId={data.user.id}
            adminGroups={adminGroups}
          />
        </>
      )}
    </div>
  );
}
