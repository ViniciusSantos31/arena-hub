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
          <p className="text-muted-foreground max-h-[60vh] overflow-y-auto px-4 py-4 whitespace-pre-wrap">
            {rules}
          </p>
          <footer className="bg-card text-muted-foreground sticky bottom-0 flex border-t p-4 text-sm">
            <span>
              Lembre-se de respeitar as regras para garantir uma boa convivência
              no grupo!
            </span>
            <Button onClick={() => setOpen(false)}>
              <HeartHandshakeIcon />
              Entendi
            </Button>
          </footer>
        </section>
      }
    >
      <Button variant={"outline"}>
        <BookOpenTextIcon />
        Regras
      </Button>
    </ResponsiveDialog>
  );
};
