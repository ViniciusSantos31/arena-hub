"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { queryClient } from "@/lib/react-query";
import { LinkIcon, PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { inviteLinksQueryKeys } from "../_hooks/query-keys";
import { CreateInviteLinkForm } from "./create-invite-link-form";
import { CreateInviteLinkSuccessModal } from "./create-invite-link-success-modal";
import { InviteLinkList } from "./invite-link-list";
import { SettingsSection } from "./settings-section";

export function InviteLinksSection({
  group,
  id,
}: {
  id: string;
  group: { code: string; private: boolean };
}) {
  const canManageGroupLinks = useGuard({
    action: ["group:links"],
  });
  const [open, setOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({
    link: "",
    open: false,
  });
  const isPrivate = group.private;

  const canViewSection = isPrivate && canManageGroupLinks;

  const refetchInviteLinks = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: inviteLinksQueryKeys.list(group.code),
    });
  }, [group.code]);

  const onCreateInviteLinkSuccess = useCallback(
    (link: string) => {
      refetchInviteLinks();
      setOpen(false);
      setSuccessModal({
        link,
        open: true,
      });
    },
    [refetchInviteLinks],
  );

  if (!canViewSection) return null;

  return (
    <SettingsSection
      id={id}
      title="Links de convite"
      description="Crie links que permitem entrar direto no grupo (sem solicitação)."
      action={
        <ResponsiveDialog
          open={open}
          onOpenChange={setOpen}
          title="Criar link de convite"
          description="Configure permissões e limites do link. Você pode revogá-lo a qualquer momento."
          icon={LinkIcon}
          content={
            <CreateInviteLinkForm
              onSuccess={(link) => onCreateInviteLinkSuccess(link)}
            />
          }
        >
          <Button size="sm" className="ml-auto w-full sm:w-auto">
            <PlusIcon />
            Novo link
          </Button>
        </ResponsiveDialog>
      }
    >
      <InviteLinkList />
      <CreateInviteLinkSuccessModal
        link={successModal.link}
        copy={() => {
          navigator.clipboard.writeText(successModal.link);
          toast.success("Link copiado para a área de transferência");
        }}
        close={() => setSuccessModal({ link: "", open: false })}
        open={successModal.open}
        onOpenChange={(open) => setSuccessModal({ ...successModal, open })}
      />
    </SettingsSection>
  );
}
