"use client";

import { deleteAccount } from "@/actions/user/delete-account";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import type { AccountDeletionImpact } from "@/lib/user-account/delete-user-account";
import { LoaderIcon, ShieldIcon, Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface LinkedAccount {
  id: string;
  providerId: string;
  createdAt: string;
}

interface SecuritySectionProps {
  user?: {
    email?: string | null;
  } | null;
  linkedAccounts: LinkedAccount[];
  deletionImpact: AccountDeletionImpact;
}

function DeletionImpactList({
  deletionImpact,
}: {
  deletionImpact: AccountDeletionImpact;
}) {
  const items = [
    "Seu perfil, sessões e dados pessoais serão removidos.",
    deletionImpact.ownedGroupsCount > 0
      ? deletionImpact.ownedGroupsCount === 1
        ? "O grupo que você administra será excluído, incluindo partidas e membros."
        : `Os ${deletionImpact.ownedGroupsCount} grupos que você administra serão excluídos, incluindo partidas e membros.`
      : null,
    "Sua participação em outros grupos será removida.",
    deletionImpact.hasActiveSubscription
      ? "Sua assinatura será cancelada imediatamente, sem novas cobranças."
      : null,
  ].filter((item): item is string => item !== null);

  return (
    <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function SecuritySection({
  user,
  linkedAccounts,
  deletionImpact,
}: SecuritySectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isGoogleLinked = linkedAccounts.some(
    (acc) => acc.providerId === "google",
  );

  const { execute, isExecuting } = useAction(deleteAccount, {
    async onSuccess() {
      toast.success("Conta excluída com sucesso.");
      setOpen(false);

      try {
        await authClient.signOut();
      } catch {
        // A conta já foi removida; a sessão local pode estar inválida.
      }

      router.push("/auth/sign-in");
    },
    onError() {
      toast.error("Ocorreu um erro ao excluir a conta. Tente novamente.");
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldIcon className="text-muted-foreground h-4 w-4" />
          <h3 className="text-sm font-medium">Segurança</h3>
        </div>

        <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs">Conta vinculada</p>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-muted-foreground text-xs">{user?.email}</p>
              </div>
            </div>
            {isGoogleLinked ? (
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                Conectado
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                Não conectado
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trash2Icon className="text-destructive h-4 w-4" />
          <h3 className="text-destructive text-sm font-medium">
            Zona de perigo
          </h3>
        </div>

        <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-4">
          <p className="text-muted-foreground mb-4 text-sm text-balance">
            Ao excluir sua conta, seus dados pessoais serão removidos
            permanentemente. Grupos que você administra também serão excluídos.
            Esta ação não pode ser desfeita.
          </p>
          <ResponsiveDialog
            title="Excluir conta"
            description="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
            icon={Trash2Icon}
            variant="destructive"
            open={open}
            onOpenChange={setOpen}
            contentClassName="p-0"
            content={
              <div>
                <div className="p-4">
                  <DeletionImpactList deletionImpact={deletionImpact} />
                </div>
                <DialogFooter className="gap-2 border-t p-4">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isExecuting}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    disabled={isExecuting}
                    onClick={() => execute()}
                  >
                    {isExecuting ? (
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2Icon />
                    )}
                    Excluir conta
                  </Button>
                </DialogFooter>
              </div>
            }
          >
            <Button variant="destructive" type="button">
              <Trash2Icon />
              Excluir conta
            </Button>
          </ResponsiveDialog>
        </div>
      </div>
    </div>
  );
}
