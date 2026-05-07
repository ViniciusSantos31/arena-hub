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
      title="Link de convite criado"
      description="O link de convite foi criado com sucesso."
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
            <div className="flex items-center gap-3 px-4">
              <div
                className={cn(
                  "bg-muted/80 text-primary ring-border/50 flex size-10 items-center justify-center rounded-2xl shadow-lg ring-1 backdrop-blur-sm",
                  "dark:shadow-primary/15 dark:shadow-xl",
                )}
              >
                <LinkIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight">
                  Compartilhe o link abaixo
                </div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  Você pode copiar e enviar no WhatsApp ou onde preferir.
                </div>
              </div>
            </div>

            <div
              className={cn(
                "bg-muted/20 ring-border/40 shadow-primary/5 mx-4 overflow-hidden rounded-xl p-4 py-3 text-sm shadow-sm ring-1",
                "select-all",
              )}
            >
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <LinkIcon className="text-primary size-3 shrink-0" />
                Link gerado
              </div>
              <code className="text-foreground mt-1.5 block text-xs font-medium break-all">
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
