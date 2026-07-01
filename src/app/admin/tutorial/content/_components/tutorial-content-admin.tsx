"use client";

import {
  createTutorialSection,
  createTutorialStep,
  deleteTutorialSection,
  deleteTutorialStep,
  updateTutorialSection,
  updateTutorialStep,
} from "@/actions/tutorial/admin";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { SelectField } from "@/components/ui/select/field";
import { SwitchField } from "@/components/ui/switch/field";
import { TextareaField } from "@/components/ui/textarea/field";
import type {
  TutorialSectionWithSteps,
  TutorialStep,
} from "@/db/schema/tutorial";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const CATEGORY_OPTIONS = [
  { value: "basic", label: "Básico" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORY_OPTIONS)[number]["value"], string> =
  {
    basic: "Básico",
    intermediate: "Intermediário",
    advanced: "Avançado",
  };

const sectionFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  category: z.enum(["basic", "intermediate", "advanced"]),
  estimatedTime: z.string().min(1, "Tempo estimado é obrigatório"),
  isActive: z.boolean(),
});

const stepFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  actionButtonText: z.string(),
  actionButtonHref: z.string(),
  isActive: z.boolean(),
});

type SectionFormData = z.infer<typeof sectionFormSchema>;
type StepFormData = z.infer<typeof stepFormSchema>;

type DeleteTarget =
  | { type: "section"; id: string; title: string }
  | { type: "step"; id: string; title: string };

export function TutorialContentAdmin({
  sections,
}: {
  sections: TutorialSectionWithSteps[];
}) {
  const router = useRouter();
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<TutorialSectionWithSteps | null>(null);
  const [editingStep, setEditingStep] = useState<TutorialStep | null>(null);
  const [stepSectionId, setStepSectionId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const createSectionAction = useAction(createTutorialSection, {
    onSuccess: () => {
      toast.success("Seção criada");
      setSectionDialogOpen(false);
      setEditingSection(null);
      router.refresh();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível criar a seção"),
  });

  const updateSectionAction = useAction(updateTutorialSection, {
    onSuccess: () => {
      toast.success("Seção atualizada");
      setSectionDialogOpen(false);
      setEditingSection(null);
      router.refresh();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível atualizar a seção"),
  });

  const deleteSectionAction = useAction(deleteTutorialSection, {
    onSuccess: () => {
      toast.success("Seção desativada");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      router.refresh();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível remover a seção"),
  });

  const createStepAction = useAction(createTutorialStep, {
    onSuccess: () => {
      toast.success("Passo criado");
      setStepDialogOpen(false);
      setEditingStep(null);
      setStepSectionId(null);
      router.refresh();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível criar o passo"),
  });

  const updateStepAction = useAction(updateTutorialStep, {
    onSuccess: () => {
      toast.success("Passo atualizado");
      setStepDialogOpen(false);
      setEditingStep(null);
      setStepSectionId(null);
      router.refresh();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível atualizar o passo"),
  });

  const deleteStepAction = useAction(deleteTutorialStep, {
    onSuccess: () => {
      toast.success("Passo desativado");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      router.refresh();
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Não foi possível remover o passo"),
  });

  const sectionMethods = useForm<SectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "BookOpen",
      category: "basic",
      estimatedTime: "5 min",
      isActive: true,
    },
  });

  const stepMethods = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      title: "",
      content: "",
      actionButtonText: "",
      actionButtonHref: "",
      isActive: true,
    },
  });

  const isSavingSection = useMemo(
    () =>
      createSectionAction.isExecuting ||
      createSectionAction.isPending ||
      updateSectionAction.isExecuting ||
      updateSectionAction.isPending,
    [
      createSectionAction.isExecuting,
      createSectionAction.isPending,
      updateSectionAction.isExecuting,
      updateSectionAction.isPending,
    ],
  );

  const isSavingStep = useMemo(
    () =>
      createStepAction.isExecuting ||
      createStepAction.isPending ||
      updateStepAction.isExecuting ||
      updateStepAction.isPending,
    [
      createStepAction.isExecuting,
      createStepAction.isPending,
      updateStepAction.isExecuting,
      updateStepAction.isPending,
    ],
  );

  const isDeleting = useMemo(
    () =>
      deleteSectionAction.isExecuting ||
      deleteSectionAction.isPending ||
      deleteStepAction.isExecuting ||
      deleteStepAction.isPending,
    [
      deleteSectionAction.isExecuting,
      deleteSectionAction.isPending,
      deleteStepAction.isExecuting,
      deleteStepAction.isPending,
    ],
  );

  const openCreateSection = () => {
    setEditingSection(null);
    sectionMethods.reset({
      title: "",
      description: "",
      icon: "BookOpen",
      category: "basic",
      estimatedTime: "5 min",
      isActive: true,
    });
    setSectionDialogOpen(true);
  };

  const openEditSection = (section: TutorialSectionWithSteps) => {
    setEditingSection(section);
    sectionMethods.reset({
      title: section.title,
      description: section.description,
      icon: section.icon,
      category: section.category,
      estimatedTime: section.estimatedTime,
      isActive: section.isActive,
    });
    setSectionDialogOpen(true);
  };

  const openCreateStep = (sectionId: string) => {
    setEditingStep(null);
    setStepSectionId(sectionId);
    stepMethods.reset({
      title: "",
      content: "",
      actionButtonText: "",
      actionButtonHref: "",
      isActive: true,
    });
    setStepDialogOpen(true);
  };

  const openEditStep = (step: TutorialStep) => {
    setEditingStep(step);
    setStepSectionId(step.sectionId);
    stepMethods.reset({
      title: step.title,
      content: step.content,
      actionButtonText: step.actionButtonText ?? "",
      actionButtonHref: step.actionButtonHref ?? "",
      isActive: step.isActive,
    });
    setStepDialogOpen(true);
  };

  const openDelete = (target: DeleteTarget) => {
    setDeleteTarget(target);
    setDeleteDialogOpen(true);
  };

  const submitSection = async (data: SectionFormData) => {
    if (editingSection) {
      await updateSectionAction.executeAsync({
        id: editingSection.id,
        ...data,
      });
      return;
    }

    await createSectionAction.executeAsync(data);
  };

  const submitStep = async (data: StepFormData) => {
    if (!stepSectionId) return;

    const payload = {
      sectionId: stepSectionId,
      title: data.title,
      content: data.content,
      actionButtonText: data.actionButtonText.trim() || null,
      actionButtonHref: data.actionButtonHref.trim() || null,
      isActive: data.isActive,
    };

    if (editingStep) {
      await updateStepAction.executeAsync({
        id: editingStep.id,
        ...payload,
      });
      return;
    }

    await createStepAction.executeAsync(payload);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "section") {
      await deleteSectionAction.executeAsync({ id: deleteTarget.id });
      return;
    }

    await deleteStepAction.executeAsync({ id: deleteTarget.id });
  };

  const activeSections = sections.filter((section) => section.isActive);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/tutorial">Voltar ao dashboard</Link>
        </Button>
        <Button size="sm" onClick={openCreateSection}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nova seção
        </Button>
      </div>

      {activeSections.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
          Nenhuma seção ativa. Crie a primeira seção do tutorial.
        </div>
      ) : (
        <Accordion type="multiple" className="rounded-lg border px-4">
          {activeSections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 flex-wrap items-center gap-2 pr-4 text-left">
                  <span className="font-medium">{section.title}</span>
                  <Badge variant="secondary">
                    {CATEGORY_LABELS[section.category]}
                  </Badge>
                  <Badge variant="outline">{section.estimatedTime}</Badge>
                  <span className="text-muted-foreground text-xs">
                    {section.steps.filter((step) => step.isActive).length} passos
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  {section.description}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditSection(section)}
                  >
                    <PencilIcon className="mr-2 h-3.5 w-3.5" />
                    Editar seção
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCreateStep(section.id)}
                  >
                    <PlusIcon className="mr-2 h-3.5 w-3.5" />
                    Novo passo
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      openDelete({
                        type: "section",
                        id: section.id,
                        title: section.title,
                      })
                    }
                  >
                    <TrashIcon className="mr-2 h-3.5 w-3.5" />
                    Excluir seção
                  </Button>
                </div>

                <div className="space-y-3">
                  {section.steps
                    .filter((step) => step.isActive)
                    .map((step) => (
                      <div
                        key={step.id}
                        className="bg-muted/40 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="font-medium">
                            <span className="text-muted-foreground mr-2">
                              {step.order}.
                            </span>
                            {step.title}
                          </p>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {step.content}
                          </p>
                          {(step.actionButtonText || step.actionButtonHref) && (
                            <p className="text-muted-foreground text-xs">
                              Botão: {step.actionButtonText ?? "—"} →{" "}
                              {step.actionButtonHref ?? "—"}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditStep(step)}
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              openDelete({
                                type: "step",
                                id: step.id,
                                title: step.title,
                              })
                            }
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <ResponsiveDialog
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        title={editingSection ? "Editar seção" : "Nova seção"}
        description="Configure título, categoria e metadados da seção"
        content={
          <Form {...sectionMethods}>
            <form
              onSubmit={sectionMethods.handleSubmit(submitSection)}
              className="space-y-4"
            >
              <InputField name="title" label="Título" />
              <TextareaField name="description" label="Descrição" />
              <InputField
                name="icon"
                label="Ícone"
                placeholder="Ex: BookOpen, Users"
              />
              <SelectField
                name="category"
                label="Categoria"
                options={[...CATEGORY_OPTIONS]}
              />
              <InputField
                name="estimatedTime"
                label="Tempo estimado"
                placeholder="Ex: 5 min"
              />
              <SwitchField name="isActive" label="Seção ativa" />
              <Button type="submit" className="w-full" disabled={isSavingSection}>
                {editingSection ? "Salvar seção" : "Criar seção"}
              </Button>
            </form>
          </Form>
        }
      />

      <ResponsiveDialog
        open={stepDialogOpen}
        onOpenChange={setStepDialogOpen}
        title={editingStep ? "Editar passo" : "Novo passo"}
        description="Conteúdo exibido para o usuário neste passo do tutorial"
        content={
          <Form {...stepMethods}>
            <form
              onSubmit={stepMethods.handleSubmit(submitStep)}
              className="space-y-4"
            >
              <InputField name="title" label="Título" />
              <TextareaField name="content" label="Conteúdo" rows={5} />
              <InputField
                name="actionButtonText"
                label="Texto do botão (opcional)"
              />
              <InputField
                name="actionButtonHref"
                label="Link do botão (opcional)"
              />
              <SwitchField name="isActive" label="Passo ativo" />
              <Button type="submit" className="w-full" disabled={isSavingStep}>
                {editingStep ? "Salvar passo" : "Criar passo"}
              </Button>
            </form>
          </Form>
        }
      />

      <ResponsiveDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        variant="destructive"
        icon={TriangleAlertIcon}
        title="Confirmar exclusão"
        description={
          deleteTarget
            ? `Deseja desativar ${deleteTarget.type === "section" ? "a seção" : "o passo"} "${deleteTarget.title}"?`
            : undefined
        }
        content={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              Confirmar
            </Button>
          </div>
        }
      />
    </div>
  );
}
