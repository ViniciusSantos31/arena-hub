import {
  ResponsiveDialog,
  ResponsiveDialogBaseProps,
} from "@/components/responsive-dialog";
import { UserCircle2Icon } from "lucide-react";
import { Member } from "../@tabs/active/page";
import { MemberDetails } from "./member-details";

type MemberDetailsDialogProps = ResponsiveDialogBaseProps & {
  member: Member;
};

export const MemberDetailsDialog = ({
  member,
  ...props
}: MemberDetailsDialogProps) => {
  return (
    <ResponsiveDialog
      title="Detalhes do Membro"
      description="Informações detalhadas sobre o membro do grupo."
      icon={UserCircle2Icon}
      contentClassName="px-0"
      content={<MemberDetails member={member} />}
      {...props}
    />
  );
};
