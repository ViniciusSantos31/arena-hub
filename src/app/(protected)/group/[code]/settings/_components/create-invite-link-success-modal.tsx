import {
  ResponsiveDialog,
  ResponsiveDialogBaseProps,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
      title="Compartilhe o link"
      icon={LinkIcon}
      description="Você pode copiar e enviar no WhatsApp ou onde preferir."
      className="h-fit"
      contentClassName="relative p-0"
      content={
        <div className="relative overflow-hidden py-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="landing-wash absolute inset-0 opacity-55" />
            <div className="landing-dots absolute inset-0 opacity-35" />
            <div className="from-background via-background/80 to-background absolute inset-0 bg-linear-to-b" />
          </div>

          <div className="relative flex flex-col gap-4">
            <div
              className={cn(
                "bg-muted/20 ring-border/40 shadow-primary/5 mx-4 overflow-hidden rounded-xl p-4 py-3 text-sm shadow-sm ring-1",
              )}
            >
              <code className="text-foreground block truncate text-xs leading-relaxed font-medium whitespace-nowrap select-all">
                {link}
              </code>
            </div>

            <div className="border-border/40 flex flex-col gap-3 border-t px-4 pt-4 sm:flex-row-reverse sm:justify-start">
              <Button className="w-full sm:w-auto" onClick={copy}>
                <CopyIcon />
                Copiar
              </Button>
              <Button
                className="w-full sm:w-auto"
                variant="secondary"
                onClick={close}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      }
      {...props}
    />
  );
};
