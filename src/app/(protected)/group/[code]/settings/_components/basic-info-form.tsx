import { upsertGroup } from "@/actions/group/create";
import { uploadImage } from "@/actions/image/upload";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { TextareaField } from "@/components/ui/textarea/field";
import { UploadInput } from "@/components/upload-input";
import { Role } from "@/utils/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  BasicInfoFormData,
  basicInfoSchema,
} from "../_schema/basic-info-schema";
import {
  PermissionWrapper,
  SettingsField,
  SettingsSection,
} from "./settings-section";

export const BasicInfoForm = ({
  group,
  userRole,
}: {
  group: {
    id: string;
    name: string;
    logo: string;
    rules?: string | null;
    description?: string | null;
  };
  userRole: Role;
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageHasChange, setImageHasChange] = useState(false);

  const isOwner = userRole === "owner";
  const canModerate = isOwner || userRole === "admin";

  const methods = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      id: group.id,
      name: group.name,
      rules: group.rules || "",
      description: group.description || "",
    },
  });

  const upsertGroupAction = useAction(upsertGroup, {
    onSuccess({ input }) {
      methods.reset(
        {
          id: input.id,
          name: input.name,
          rules: input.rules || "",
          description: input.description || "",
        },
        { keepDirty: false },
      );
      setImageHasChange(false);
      toast.success("Informações do grupo atualizadas com sucesso!");
    },
    onError() {
      toast.error("Ocorreu um erro ao atualizar as informações do grupo.");
    },
  });

  const isAbleToSaveChanges = useMemo(
    () =>
      (canModerate && methods.formState.isDirty && methods.formState.isValid) ||
      imageHasChange,
    [
      canModerate,
      methods.formState.isDirty,
      methods.formState.isValid,
      imageHasChange,
    ],
  );

  const handleUploadImage = (file: File | null) => {
    setImage(file);
    if (file) {
      console.log("Imagem selecionada:", file);
      setImageHasChange(true);
    } else {
      console.log("Imagem removida");
      setImageHasChange(false);
    }
  };

  const onSubmit = async (data: BasicInfoFormData) => {
    if (!image) {
      await upsertGroupAction.executeAsync({
        id: group.id,
        image: group.logo,
        name: data.name,
        rules: data.rules,
        description: data.description ?? "",
      });
      return;
    }
    try {
      const imageUrl = await uploadImage({ image });
      if (imageUrl.data) {
        await upsertGroupAction.executeAsync({
          ...(image && { image: imageUrl.data }),
          id: group.id,
          name: data.name,
          rules: data.rules,
          description: data.description ?? "",
        });
      }
    } catch {
      toast.error("Ocorreu um erro ao atualizar as informações do grupo.");
    }
  };

  return (
    <SettingsSection
      title="Informações Básicas"
      description="Configure as informações principais do grupo"
    >
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <PermissionWrapper hasPermission={isOwner}>
            <SettingsField
              label="Nome do Grupo"
              description="O nome que será exibido para todos os membros"
              required
            >
              <InputField name="name" placeholder="Digite o nome do grupo" />
            </SettingsField>
          </PermissionWrapper>

          <PermissionWrapper hasPermission={isOwner}>
            <SettingsField
              label="Descrição do Grupo"
              description="A descrição que será exibida para todos os membros"
            >
              <TextareaField
                name="description"
                placeholder="Digite a descrição do grupo"
              />
            </SettingsField>
          </PermissionWrapper>

          <PermissionWrapper hasPermission={isOwner}>
            <SettingsField
              label="Imagem do Grupo"
              description="URL da imagem que representará o grupo"
            >
              <UploadInput
                defaultValue={group.logo ?? ""}
                onChange={(event) =>
                  handleUploadImage(event.target.files?.[0] || null)
                }
              />
            </SettingsField>
          </PermissionWrapper>

          <PermissionWrapper hasPermission={canModerate}>
            <SettingsField
              label="Regras do Grupo"
              description="Defina as regras que os membros devem seguir"
            >
              <TextareaField
                name="rules"
                placeholder="Digite as regras do grupo..."
                rows={4}
                className="whitespace-pre-wrap"
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
        </form>
      </Form>
    </SettingsSection>
  );
};
