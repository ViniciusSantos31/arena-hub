import { upsertGroup } from "@/actions/group/create";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { SwitchField } from "@/components/ui/switch/field";
import { Role } from "@/utils/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ConfigAccessFormData,
  configAccessSchema,
} from "../_schema/config-access-schema";
import {
  PermissionWrapper,
  SettingsField,
  SettingsSection,
} from "./settings-section";

export const ConfigAccessForm = ({
  group,
  userRole,
}: {
  group: {
    id: string;
    name: string;
    code: string;
    logo: string;
    rules: string | null;
    private: boolean;
    maxPlayers: number;
    description?: string | null;
  };
  userRole: Role;
}) => {
  const isOwner = userRole === "owner";
  const canModerate = isOwner || userRole === "admin";

  const methods = useForm({
    resolver: zodResolver(configAccessSchema),
    defaultValues: {
      isPrivate: group.private,
      maxPlayers: group.maxPlayers,
    },
  });

  const upsertGroupAction = useAction(upsertGroup, {
    onSuccess({ input }) {
      methods.reset(
        {
          isPrivate: input.isPrivate,
          maxPlayers: input.maxPlayers,
        },
        { keepDirty: false },
      );
      toast.success("Informações do grupo atualizadas com sucesso!");
    },
    onError() {
      toast.error("Ocorreu um erro ao atualizar as informações do grupo.");
    },
  });

  const isAbleToSaveChanges = useMemo(
    () => canModerate && methods.formState.isDirty && methods.formState.isValid,
    [canModerate, methods.formState.isDirty, methods.formState.isValid],
  );

  const onSubmit = async (data: ConfigAccessFormData) => {
    await upsertGroupAction.executeAsync({
      id: group.id,
      image: group.logo,
      name: group.name,
      description: group.description || "",
      isPrivate: data.isPrivate,
      maxPlayers: data.maxPlayers,
    });
  };

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SettingsSection
          title="Configurações de Acesso"
          description="Configure quem pode acessar e participar do grupo"
        >
          <PermissionWrapper hasPermission={isOwner}>
            <SettingsField
              label="Grupo Privado"
              description="Quando ativado, apenas membros convidados podem participar"
            >
              <div className="flex items-center space-x-2">
                <SwitchField
                  name="isPrivate"
                  label={methods.watch("isPrivate") ? "Privado" : "Público"}
                />
              </div>
            </SettingsField>
          </PermissionWrapper>

          <PermissionWrapper hasPermission={isOwner}>
            <SettingsField
              label="Máximo de Jogadores"
              description="Número máximo de membros que podem participar do grupo"
              required
            >
              <InputField name="maxPlayers" type="number" min={1} max={100} />
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
};
