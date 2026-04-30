import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { BookOpenTextIcon, HeartHandshakeIcon } from "lucide-react";
import { useState } from "react";

export const RulesButton = ({ rules }: { rules?: string | null }) => {
  const [open, setOpen] = useState(false);

  if (!rules) return null;

  return (
    <ResponsiveDialog
      title="Regras do grupo"
      description="Confira as regras estabelecidas para este grupo."
      contentClassName="p-0"
      open={open}
      onOpenChange={setOpen}
      content={
        <section className="border-t">
          <p className="max-h-[60vh] overflow-y-auto px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap">
            {rules}
          </p>
          <footer className="bg-card sticky bottom-0 border-t px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground text-sm">
                Lembre-se de respeitar as regras para garantir uma boa convivência
                no grupo.
              </span>
              <Button onClick={() => setOpen(false)} className="sm:shrink-0">
                <HeartHandshakeIcon />
                Entendi
              </Button>
            </div>
          </footer>
        </section>
      }
    >
      <Button variant="outline" size="sm" className="h-9">
        <BookOpenTextIcon />
        Regras
      </Button>
    </ResponsiveDialog>
  );
};
