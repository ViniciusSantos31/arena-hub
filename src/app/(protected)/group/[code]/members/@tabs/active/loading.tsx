import { MemberCardLoading } from "../../_components/member-card";

export default function GroupMembersLoading() {
  return (
    <div className="mt-4 flex w-full flex-col gap-4">
      <MemberCardLoading />
      <MemberCardLoading />
      <MemberCardLoading />
      <MemberCardLoading />
      <MemberCardLoading />
    </div>
  );
}
