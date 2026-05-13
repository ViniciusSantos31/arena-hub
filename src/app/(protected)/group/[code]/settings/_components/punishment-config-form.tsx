"use client";

import { upsertGroup } from "@/actions/group/create";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { Role } from "@/utils/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  PunishmentConfigFormData,
  punishmentConfigSchema,
} from "../_schema/punishment-config-schema";
import {
  PermissionWrapper,
  SettingsField,
  SettingsSection,
} from "./settings-section";

interface PunishmentConfigFormProps {
  id: string;
  group: {
    id: string;
    name: string;
    code: string;
    logo: string;
    rules: string | null;
    private: boolean;
    maxPlayers: number;
    description?: string | null;
    punishmentsToSuspend: number;
    suspensionMatchCount: number;
  };
  userRole: Role;
}

export function PunishmentConfigForm({
  group,
  userRole,
  id,
}: PunishmentConfigFormProps) {
  const isOwner = userRole === "owner";

  const methods = useForm<PunishmentConfigFormData>({
    resolver: zodResolver(punishmentConfigSchema),
    defaultValues: {
      punishmentsToSuspend: group.punishmentsToSuspend,
      suspensionMatchCount: group.suspensionMatchCount,
    },
  });

  const upsertGroupAction = useAction(upsertGroup, {
    onSuccess({ input }) {
      methods.reset(
        {
          punishmentsToSuspend: input.punishmentsToSuspend,
          suspensionMatchCount: input.suspensionMatchCount,
        },
        { keepDirty: false },
      );
      toast.success("Regras de punição atualizadas com sucesso!");
    },
    onError() {
      toast.error("Ocorreu um erro ao atualizar as regras de punição.");
    },
  });

  const isAbleToSaveChanges = useMemo(
    () => isOwner && methods.formState.isDirty && methods.formState.isValid,
    [isOwner, methods.formState.isDirty, methods.formState.isValid],
  );

  const onSubmit = async (data: PunishmentConfigFormData) => {
    await upsertGroupAction.executeAsync({
      id: group.id,
      image: group.logo,
      name: group.name,
      description: group.description ?? "",
      maxPlayers: group.maxPlayers,
      punishmentsToSuspend: data.punishmentsToSuspend,
      suspensionMatchCount: data.suspensionMatchCount,
    });
  };

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SettingsSection
          id={id}
          title="Regras de Disciplina"
          description="Configure as regras de punição e suspensão de jogadores do grupo"
        >
          <PermissionWrapper hasPermission={isOwner}>
            <SettingsField
              label="Punições para suspensão"
              description="Número de punições acumuladas que resultam em suspensão automática do jogador"
              required
            >
              <InputField
                name="punishmentsToSuspend"
                type="number"
                min={1}
                max={50}
              />
            </SettingsField>
            <SettingsField
              label="Partidas de suspensão"
              description="Número de partidas concluídas que o jogador ficará suspenso após atingir o limite de punições"
              required
            >
              <InputField
                name="suspensionMatchCount"
                type="number"
                min={1}
                max={100}
              />
            </SettingsField>
          </PermissionWrapper>
          <div className="flex w-full">
            <Button
              type="submit"
              className="ml-auto"
              disabled={!isAbleToSaveChanges || upsertGroupAction.isExecuting}
            >
              <SaveIcon />
              Salvar
            </Button>
          </div>
        </SettingsSection>
      </form>
    </Form>
  );
}
