import { TabsLoading } from "@/components/ui/tabs";
import { MemberCardLoading } from "./_components/member-card";

export default function GroupMembersLoading() {
  return (
    <div className="w-full">
      <TabsLoading className="mb-2 w-full" />
      <div className="flex w-full flex-col gap-4">
        <MemberCardLoading />
        <MemberCardLoading />
        <MemberCardLoading />
        <MemberCardLoading />
        <MemberCardLoading />
      </div>
    </div>
  );
}
