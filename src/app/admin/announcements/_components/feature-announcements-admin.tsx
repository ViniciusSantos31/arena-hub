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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { TextareaField } from "@/components/ui/textarea/field";
import type { GroupAction } from "@/lib/group-permissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import {
  BarChart3Icon,
  BookOpenIcon,
  CalendarIcon,
  EyeIcon,
  MegaphoneIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod/v4";
import { AnnouncementPreviewDialog } from "./announcement-preview-dialog";
import { AnnouncementStatsDialog } from "./announcement-stats-dialog";

const ICONS: Record<string, LucideIcon> = {
  Sparkles: SparklesIcon,
  Users: UsersIcon,
  BookOpen: BookOpenIcon,
};

function resolveIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || SparklesIcon;
}

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

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function FeatureAnnouncementsAdmin({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  const [statsAnnouncement, setStatsAnnouncement] = useState<Announcement | null>(null);

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
        icon={MegaphoneIcon}
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

      {previewAnnouncement && (
        <AnnouncementPreviewDialog
          open={Boolean(previewAnnouncement)}
          onOpenChange={(open) => { if (!open) setPreviewAnnouncement(null); }}
          title={previewAnnouncement.title}
          description={previewAnnouncement.description}
          icon={previewAnnouncement.icon}
          dismissButtonLabel={previewAnnouncement.dismissButtonLabel}
        />
      )}

      {statsAnnouncement && (
        <AnnouncementStatsDialog
          open={Boolean(statsAnnouncement)}
          onOpenChange={(open) => { if (!open) setStatsAnnouncement(null); }}
          announcementId={statsAnnouncement.id}
          announcementTitle={statsAnnouncement.title}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {announcements.map((a) => {
          const Icon = resolveIcon(a.icon);
          const startStr = formatDate(a.startsAt);
          const endStr = formatDate(a.endsAt);

          return (
            <Card key={a.id} className="group overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="text-primary size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-semibold leading-tight">{a.title}</h3>
                      <Badge
                        variant={a.isActive ? "default" : "secondary"}
                        className="shrink-0 text-xs"
                      >
                        <span
                          className={`mr-1.5 inline-block size-1.5 rounded-full ${a.isActive ? "bg-green-300" : "bg-muted-foreground/40"}`}
                        />
                        {a.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-0.5 font-mono text-xs">{a.slug}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <p className="text-muted-foreground line-clamp-2 text-sm">{a.description}</p>

                <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>
                    <span className="font-medium">Permissão:</span>{" "}
                    <code className="bg-muted rounded px-1 py-0.5">{a.requiredAction}</code>
                  </span>
                  <span>
                    <span className="font-medium">Prioridade:</span> {a.priority}
                  </span>
                </div>

                {(startStr || endStr) && (
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <CalendarIcon className="size-3.5 shrink-0" />
                    {startStr && endStr ? (
                      <span>{startStr} → {endStr}</span>
                    ) : startStr ? (
                      <span>A partir de {startStr}</span>
                    ) : (
                      <span>Até {endStr}</span>
                    )}
                  </div>
                )}

                <div className="border-border/50 border-t pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(a)}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Editar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewAnnouncement(a)}
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      Preview
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatsAnnouncement(a)}
                    >
                      <BarChart3Icon className="h-3.5 w-3.5" />
                      Estatísticas
                    </Button>

                    <div className="ml-auto flex items-center gap-2">
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
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
