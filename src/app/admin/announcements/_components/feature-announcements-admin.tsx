"use client";

import {
  adminCreateFeatureAnnouncement,
  adminDeleteFeatureAnnouncement,
  adminToggleFeatureAnnouncementActive,
  adminUpdateFeatureAnnouncement,
} from "@/actions/feature-announcements/admin";
import {
  DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL,
  adminUpsertFeatureAnnouncementSchema,
} from "@/actions/feature-announcements/_schema";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { TextareaField } from "@/components/ui/textarea/field";
import type { GroupAction } from "@/lib/group-permissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod/v4";

type Announcement = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  dismissButtonLabel: string;
  requiredAction: string;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
};

const allActions: GroupAction[] = [
  "match:create",
  "match:read",
  "match:join",
  "match:update",
  "match:delete",
  "team:create",
  "team:update",
  "match:join_queue",
  "membership:update",
  "membership:delete",
  "membership:approve",
  "group:settings",
  "group:links",
];

type FormData = z.input<typeof adminUpsertFeatureAnnouncementSchema>;

function toDatetimeLocalValue(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function FeatureAnnouncementsAdmin({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const createAction = useAction(adminCreateFeatureAnnouncement, {
    onSuccess: () => {
      toast.success("Novidade criada");
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Não foi possível criar");
    },
  });

  const updateAction = useAction(adminUpdateFeatureAnnouncement, {
    onSuccess: () => {
      toast.success("Novidade atualizada");
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Não foi possível atualizar");
    },
  });

  const toggleAction = useAction(adminToggleFeatureAnnouncementActive, {
    onSuccess: () => router.refresh(),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível atualizar status"),
  });

  const deleteAction = useAction(adminDeleteFeatureAnnouncement, {
    onSuccess: () => {
      toast.success("Novidade removida");
      router.refresh();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível remover"),
  });

  const methods = useForm<FormData>({
    resolver: zodResolver(adminUpsertFeatureAnnouncementSchema),
    defaultValues: {
      slug: "",
      title: "",
      description: "",
      icon: "Sparkles",
      dismissButtonLabel: DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL,
      requiredAction: "group:links",
      isActive: true,
      startsAt: undefined,
      endsAt: undefined,
      priority: 0,
    },
  });

  const isSaving = useMemo(() => {
    return (
      createAction.isExecuting ||
      createAction.isPending ||
      updateAction.isExecuting ||
      updateAction.isPending
    );
  }, [
    createAction.isExecuting,
    createAction.isPending,
    updateAction.isExecuting,
    updateAction.isPending,
  ]);

  const openCreate = () => {
    setEditing(null);
    methods.reset({
      slug: "",
      title: "",
      description: "",
      icon: "Sparkles",
      dismissButtonLabel: DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL,
      requiredAction: "group:links",
      isActive: true,
      startsAt: undefined,
      endsAt: undefined,
      priority: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    methods.reset({
      slug: a.slug,
      title: a.title,
      description: a.description,
      icon: a.icon,
      dismissButtonLabel: a.dismissButtonLabel,
      requiredAction: a.requiredAction as GroupAction,
      isActive: a.isActive,
      startsAt: a.startsAt ?? undefined,
      endsAt: a.endsAt ?? undefined,
      priority: a.priority,
    });
    setDialogOpen(true);
  };

  const submit = async (data: FormData) => {
    if (editing) {
      await updateAction.executeAsync({ id: editing.id, ...data });
    } else {
      await createAction.executeAsync(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-muted-foreground text-sm">
          {announcements.length} {announcements.length === 1 ? "item" : "itens"}
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          Criar novidade
        </Button>
      </div>

      <ResponsiveDialog
        title={editing ? "Editar novidade" : "Criar novidade"}
        description="Exibido uma vez para usuários elegíveis. Só há o botão de fechar."
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        contentClassName="space-y-4"
        className="w-full md:max-w-2xl"
        content={
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(submit)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InputField name="slug" label="Slug" placeholder="invite-links" />
                <InputField
                  name="icon"
                  label="Ícone"
                  placeholder="Sparkles"
                  description="Nome do ícone (string) para uso no modal"
                />
              </div>

              <InputField name="title" label="Título" placeholder="Novo: Convite por link" />
              <TextareaField
                name="description"
                label="Descrição"
                placeholder="Agora você pode convidar pessoas para o grupo usando um link."
                rows={3}
              />

              <InputField
                name="dismissButtonLabel"
                label="Texto do botão de fechar"
                placeholder={DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL}
              />

              <FormField
                control={methods.control}
                name="requiredAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissão necessária</FormLabel>
                    <FormControl>
                      <select
                        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        {allActions.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <InputField
                  name="priority"
                  label="Prioridade"
                  type="number"
                  description="Maior = aparece antes"
                />
                <FormField
                  control={methods.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Começa em</FormLabel>
                      <FormControl>
                        <input
                          type="datetime-local"
                          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                          value={toDatetimeLocalValue(
                            field.value instanceof Date ? field.value : null,
                          )}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Termina em</FormLabel>
                      <FormControl>
                        <input
                          type="datetime-local"
                          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                          value={toDatetimeLocalValue(
                            field.value instanceof Date ? field.value : null,
                          )}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                      />
                    </FormControl>
                    <div className="flex flex-col">
                      <FormLabel>Ativo</FormLabel>
                      <div className="text-muted-foreground text-xs">
                        Se desativado, não será exibido para ninguém.
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {announcements.map((a) => (
          <Card key={a.id} className="border-border/60">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{a.title}</CardTitle>
                  <div className="text-muted-foreground mt-1 text-xs">
                    <span className="font-mono">{a.slug}</span>
                  </div>
                </div>
                <Badge variant={a.isActive ? "default" : "secondary"}>
                  {a.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="text-muted-foreground text-sm">{a.description}</div>
              <div className="text-muted-foreground space-y-1 text-xs">
                <div>
                  <span className="font-medium">Permissão:</span>{" "}
                  <span className="font-mono">{a.requiredAction}</span>
                </div>
                <div>
                  <span className="font-medium">Botão fechar:</span>{" "}
                  <span>{a.dismissButtonLabel}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(a)}
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant={a.isActive ? "secondary" : "default"}
                  size="sm"
                  onClick={() =>
                    toggleAction.execute({
                      id: a.id,
                      isActive: !a.isActive,
                    })
                  }
                  disabled={toggleAction.isPending || toggleAction.isExecuting}
                >
                  {a.isActive ? "Desativar" : "Ativar"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAction.execute({ id: a.id })}
                  disabled={deleteAction.isPending || deleteAction.isExecuting}
                >
                  <TrashIcon className="h-4 w-4" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

