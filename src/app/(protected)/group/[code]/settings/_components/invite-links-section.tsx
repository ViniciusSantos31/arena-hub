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

const MAX_INVITE_LINKS = 10;

export function InviteLinksSection({
  group,
  id,
}: {
  id: string;
  group: { code: string };
}) {
  const canManageGroupLinks = useGuard({
    action: ["group:links"],
  });
  const [open, setOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({
    link: "",
    open: false,
  });

  const canViewSection = canManageGroupLinks;

  const refetchInviteLinks = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: inviteLinksQueryKeys.list(group.code),
    });
  }, [group.code]);

  const inviteLinksCount =
    queryClient.getQueryData<{ id: string }[]>(
      inviteLinksQueryKeys.list(group.code),
    )?.length ?? 0;

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
        <div className="flex flex-col items-center justify-center gap-2">
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
            <Button
              size="sm"
              disabled={inviteLinksCount >= MAX_INVITE_LINKS}
              className="ml-auto w-full sm:w-auto"
            >
              <PlusIcon />
              Novo link
            </Button>
          </ResponsiveDialog>
          {inviteLinksCount >= MAX_INVITE_LINKS && (
            <p className="text-muted-foreground text-xs">
              Você atingiu o limite de {MAX_INVITE_LINKS} links de convite.
            </p>
          )}
        </div>
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
