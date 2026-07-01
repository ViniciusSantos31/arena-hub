import { upsertGroup } from "@/actions/group/create";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Role } from "@/utils/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
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
  id,
  maxPlayersLimit,
}: {
  id: string;
  group: {
    id: string;
    name: string;
    code: string;
    logo: string;
    rules: string | null;
    private: boolean;
    maxPlayers: number;
    memberCount: number;
    description?: string | null;
  };
  userRole: Role;
  maxPlayersLimit?: number | null;
}) => {
  const isOwner = userRole === "owner";

  const schema = useMemo(
    () => configAccessSchema(group.memberCount ?? 1, maxPlayersLimit),
    [group.memberCount, maxPlayersLimit],
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      maxPlayers: group.maxPlayers,
    },
  });

  const [progressWidth, sliderWidth] = useMemo(() => {
    const total = maxPlayersLimit ?? 100;
    const current = group.memberCount;
    const progress = Math.min((current / total) * 100, 100);
    const slider = 100 - progress;
    return [progress, slider];
  }, [group.memberCount, maxPlayersLimit]);

  const upsertGroupAction = useAction(upsertGroup, {
    onSuccess({ input }) {
      methods.reset(
        {
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
    () => isOwner && methods.formState.isDirty && methods.formState.isValid,
    [isOwner, methods.formState.isDirty, methods.formState.isValid],
  );

  const onSubmit = useCallback(
    async (data: ConfigAccessFormData) => {
      await upsertGroupAction.executeAsync({
        id: group.id,
        image: group.logo,
        name: group.name,
        description: group.description || "",
        maxPlayers: data.maxPlayers,
      });
    },
    [upsertGroupAction, group.id, group.logo, group.name, group.description],
  );

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SettingsSection
          id={id}
          title="Configurações de Acesso"
          description="Configure quem pode acessar e participar do grupo"
        >
          <PermissionWrapper hasPermission={isOwner}>
            {maxPlayersLimit ? (
              <SettingsField
                label="Máximo de Jogadores"
                description="Número máximo de membros que podem participar do grupo"
                required
              >
                <InputField
                  name="maxPlayers"
                  type="number"
                  readOnly
                  disabled
                  min={1}
                  max={maxPlayersLimit ?? 100}
                  className="w-fit items-center self-end border-none text-right"
                />
                <div className="flex items-center gap-1">
                  <Progress
                    value={100}
                    max={group.memberCount}
                    className="*:data-[slot=progress-indicator]:bg-muted-foreground/20 h-1"
                    style={{ width: `${progressWidth}%` }}
                  />
                  <Controller
                    control={methods.control}
                    name="maxPlayers"
                    render={({ field }) => (
                      <Slider
                        className="w-full"
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        max={maxPlayersLimit ?? 100}
                        min={group.memberCount}
                        step={1}
                        style={{ width: `${sliderWidth}%` }}
                        onValueCommit={(values) =>
                          onSubmit({ maxPlayers: values[0] })
                        }
                      />
                    )}
                  />
                </div>
              </SettingsField>
            ) : (
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  Seu plano permite que o grupo tenha membros ilimitados. Porém,
                  você pode limitar o número de membros do grupo.
                </p>

                <SettingsField
                  label="Máximo de Jogadores"
                  description="Número máximo de membros que podem participar do grupo"
                  className="mt-4"
                  required
                >
                  <InputField
                    name="maxPlayers"
                    type="number"
                    min={1}
                    className="w-fit"
                  />
                </SettingsField>
                <Button
                  className="mt-4 self-end"
                  disabled={!isAbleToSaveChanges}
                >
                  <SaveIcon />
                  Salvar
                </Button>
              </div>
            )}
          </PermissionWrapper>
        </SettingsSection>
      </form>
    </Form>
  );
};
