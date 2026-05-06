import { createInviteLink } from "@/actions/invite-links/create";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker/field";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { SelectField } from "@/components/ui/select/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createInviteLinkSchema,
  CreateInviteLinkSchema,
} from "../_schema/create-invite-link-schema";

type CreateInviteLinkFormProps = {
  onSuccess: (link: string) => void;
  onError?: () => void;
};

const InfoTooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <InfoIcon className="text-muted-foreground size-4" />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
};

export const CreateInviteLinkForm = ({
  onSuccess,
  onError,
}: CreateInviteLinkFormProps) => {
  const { code } = useParams<{ code: string }>();
  const methods = useForm<CreateInviteLinkSchema>({
    resolver: zodResolver(createInviteLinkSchema),
    defaultValues: {
      label: "",
      defaultRole: "guest",
      expiresAt: undefined,
      maxUses: undefined,
    },
  });

  const createAction = useAction(createInviteLink, {
    onSuccess({ data }) {
      if (!data) return;
      toast.success("Link de convite criado com sucesso!");
      onSuccess(data.inviteUrl ?? "");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "Não foi possível criar o link.");
      onError?.();
    },
  });

  const handleSubmit = async (data: CreateInviteLinkSchema) => {
    await createAction.executeAsync({
      ...data,
      organizationCode: code,
    });
  };

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="flex flex-col space-y-4"
      >
        <InputField
          name="label"
          label="Identificador"
          placeholder="Digite um identificador para o link"
          autoFocus
          extraContentLabel={
            <InfoTooltip>
              <p className="text-sm">
                O identificador é usado para identificar o link de convite no
                sistema.
              </p>
              <p className="text-sm">
                Se não for informado, o link será identificado por um ID
                aleatório.
              </p>
            </InfoTooltip>
          }
        />
        <SelectField
          name="defaultRole"
          label="Permissão"
          placeholder="Selecione a permissão"
          options={[
            { value: "guest", label: "Convidado" },
            { value: "member", label: "Membro" },
          ]}
          extraContentLabel={
            <InfoTooltip>
              <p className="text-sm">
                A permissão é usada para definir o nível de acesso do link de
                convite.
              </p>
            </InfoTooltip>
          }
        />
        <DatePickerField
          name="expiresAt"
          label="Data de Expiração (Opcional)"
          placeholder="Selecione a data de expiração"
          extraContentLabel={
            <InfoTooltip>
              <p className="text-sm">
                A data de expiração é usada para definir a data de expiração do
                link de convite.
              </p>
              <p className="text-sm">
                O horário de expiração será as 00:00 do dia selecionado.
              </p>
            </InfoTooltip>
          }
        />
        <InputField
          name="maxUses"
          type="number"
          label="Máximo de Uso (Opcional)"
          placeholder="Digite o máximo de uso do link"
        />
        <Button type="submit" className="ml-auto">
          Criar Link
        </Button>
      </form>
    </Form>
  );
};
