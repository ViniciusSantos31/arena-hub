"use client";

import { updateMemberRole } from "@/actions/member/update-role";
import { updateMemberScore } from "@/actions/member/update-score";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/primitive";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useOptimisticAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { schema } from "./members-table";

type Role = z.infer<typeof schema>["role"];

const roles: Record<keyof Role, string> = {
  admin: "Administrador",
  member: "Membro",
  guest: "Convidado",
  owner: "Proprietário",
};

function UpdateRoleCell({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { code } = useParams<{ code: string }>();

  const session = authClient.useSession();
  const { data: member } = authClient.useActiveMember();
  const { data: organization } = authClient.useActiveOrganization();

  const updateMemberRoleAction = useOptimisticAction(updateMemberRole, {
    currentState: row.original.role,
    updateFn: (newRole) => newRole,
    onError: () => {
      toast.error("Erro ao atualizar cargo", {
        id: `update-member-role-${row.original.id}`,
      });
    },
    onSuccess: () => {
      toast.success(`Cargo de ${row.original.name} atualizado com sucesso`, {
        id: `update-member-role-${row.original.id}`,
      });
    },
  });

  const { data } = session;

  const isMe = data?.user.id === row.original.id;
  const isAdmin = member?.role === "admin";
  const isOwner = member?.role === "owner";

  const isAbleToChangeRole = isAdmin || isOwner;

  if (!isAbleToChangeRole) {
    return (
      <span>{roles[row.original.role as keyof Role] || "Desconhecido"}</span>
    );
  }

  return (
    <form>
      <Label htmlFor={`${row.original.id}-role`} className="sr-only">
        role
      </Label>
      <Select
        disabled={!isAbleToChangeRole}
        defaultValue={row.original.role as string}
        onValueChange={(value) => {
          return toast.promise(
            updateMemberRoleAction.executeAsync({
              memberId: row.original.memberId,
              role: value as "admin" | "member" | "guest",
              code,
            }),
            {
              loading: `Atualizando cargo de ${row.original.name}...`,
              success: `Cargo de ${row.original.name} atualizado`,
              error: `Erro ao atualizar cargo de ${row.original.name}`,
              id: `update-member-role-${row.original.id}`,
            },
          );
        }}
      >
        <SelectTrigger
          className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
          size="sm"
          id={`${row.original.id}-role`}
        >
          <SelectValue placeholder="Assign role" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="guest">Convidado</SelectItem>
          <SelectItem value="member">Membro</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}

function UpdateScoreCell({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { code } = useParams<{ code: string }>();

  const updateScoreAction = useOptimisticAction(updateMemberScore, {
    currentState: row.original.score,
    updateFn: (newScore) => newScore,
    onError: () => {
      toast.error("Erro ao atualizar score", {
        id: `update-member-score-${row.original.id}`,
      });
    },
    onSuccess: () => {
      toast.success(`Score de ${row.original.name} atualizado com sucesso`, {
        id: `update-member-score-${row.original.id}`,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const score = formData.get(`${row.original.id}-score`);
        const scoreNumber = Number(score);

        toast.promise(
          updateScoreAction.executeAsync({
            memberId: row.original.memberId,
            score: scoreNumber,
            code,
          }),
          {
            loading: `Salvando score de ${row.original.name}`,
            success: `Score de ${row.original.name} atualizado com sucesso`,
            error: "Erro ao atualizar score",
            id: `update-member-score-${row.original.id}`,
          },
        );
      }}
    >
      <Label htmlFor={`${row.original.id}-score`} className="sr-only">
        Score
      </Label>
      <Input
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
        defaultValue={row.original.score}
        id={`${row.original.id}-score`}
        name={`${row.original.id}-score`}
      />
    </form>
  );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            Estatisticas e informações do membro.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="flex w-full *:data-[slot=card]:flex-1 md:flex-col">
            <Card className="h-full rounded-r-none border-r-0 md:rounded-r-xl md:rounded-b-none md:border-r md:border-b-0">
              {/* <CardHeader>
                <CardTitle>Partidas</CardTitle>
              </CardHeader> */}
              <CardContent>
                <div className="text-3xl font-bold">34</div>
                <div className="text-muted-foreground text-sm">
                  Total de partidas jogadas no último mês
                </div>
              </CardContent>
            </Card>
            <Card className="h-auto rounded-l-none md:rounded-t-none md:rounded-bl-xl">
              {/* <CardHeader>
                <CardTitle>Partidas</CardTitle>
              </CardHeader> */}
              <CardContent>
                <div className="text-3xl font-bold">63</div>
                <div className="text-muted-foreground text-sm">
                  Total de partidas jogadas
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="flex w-full flex-col items-center justify-center space-y-2 rounded-xl border p-2">
            <div className="flex w-full items-center">
              <div className="border-border bg-accent relative flex aspect-square h-11 w-11 flex-1 overflow-clip rounded-lg border" />

              <div className="from-background inset-0 bottom-0 flex h-full w-full flex-col justify-end bg-linear-to-t via-transparent to-transparent p-2">
                <span className="text-foreground line-clamp-2 text-sm font-bold md:text-base">
                  {item.name}
                </span>
              </div>
              <Button variant={"default"} className="w-fit" asChild>
                <Link href={`/users/${item.id}`}>Ver perfil</Link>
              </Button>
            </div>
          </section>

          <form className="flex flex-col gap-4 pb-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="score">Avaliação</Label>
                <Input id="score" defaultValue={item.score} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="role">Cargo</Label>
                <Select defaultValue={item.role as string}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Convidado</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "score",
    header: () => <div className="w-full">Score</div>,
    cell: ({ row }) => <UpdateScoreCell row={row} />,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <UpdateRoleCell row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isOwner = row.original.role === "owner";

      const session = authClient.useSession();
      if (!session.data) return null;

      const { data } = session;
      const isMe = data?.user.id === row.original.id;

      if (isOwner && !isMe) return null;

      if (isMe) return null;

      return (
        <div className="w-full self-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground ml-auto flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                Expulsar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
