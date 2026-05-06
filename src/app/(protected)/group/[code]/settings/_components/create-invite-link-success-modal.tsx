import {
  ResponsiveDialog,
  ResponsiveDialogBaseProps,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon, LinkIcon } from "lucide-react";

type CreateInviteLinkSuccessModalProps = {
  link: string;
  copy: () => void;
  close: () => void;
} & ResponsiveDialogBaseProps;

export const CreateInviteLinkSuccessModal = ({
  link,
  copy,
  close,
  ...props
}: CreateInviteLinkSuccessModalProps) => {
  return (
    <ResponsiveDialog
      title="Link de convite criado"
      description="O link de convite foi criado com sucesso."
      content={
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <code className="bg-card text-foreground flex w-full items-start justify-start gap-2 overflow-x-hidden rounded-md border p-4 text-sm font-medium whitespace-nowrap select-all">
              <LinkIcon className="text-primary size-4 shrink-0" />
              {link}
            </code>
          </div>
          <Button onClick={copy}>
            <CopyIcon />
            Copiar
          </Button>
          <Button variant="secondary" onClick={close}>
            Fechar
          </Button>
        </div>
      }
      {...props}
    />
  );
};
