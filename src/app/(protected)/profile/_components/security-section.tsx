"use client";

import { deleteAccount } from "@/actions/user/delete-account";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
}

export function SecuritySection({ user, linkedAccounts }: SecuritySectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isGoogleLinked = linkedAccounts.some(
    (acc) => acc.providerId === "google",
  );

  const { execute, isExecuting } = useAction(deleteAccount, {
    onSuccess() {
      toast.success("Conta excluída com sucesso.");
      setOpen(false);
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
          <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Segurança</h3>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Conta vinculada</p>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
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
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {isGoogleLinked ? (
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                Conectado
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Não conectado
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trash2Icon className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-medium text-destructive">
            Zona de perigo
          </h3>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Ao excluir sua conta, todos os dados, grupos e partidas serão
            permanentemente removidos. Esta ação não pode ser desfeita.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2Icon />
                Excluir conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir conta</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir sua conta? Todos os seus dados,
                  grupos e partidas serão permanentemente removidos. Esta ação
                  não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
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
                  Excluir permanentemente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
