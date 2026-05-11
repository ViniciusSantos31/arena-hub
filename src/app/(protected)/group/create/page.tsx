"use client";

import { upsertGroup } from "@/actions/group/create";
import { uploadImage } from "@/actions/image/upload";
import { LoadingPage } from "@/components/loading-page";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input/field";
import { Label } from "@/components/ui/label";
import { TextareaField } from "@/components/ui/textarea/field";
import { UploadInput } from "@/components/upload-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, LockIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GroupFeedCardPreview } from "./_components/group-card-preview";
import { CreateGroupFormData, createGroupSchema } from "./_schema/create";

export default function CreateGroupPage() {
  const methods = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      maxPlayers: 10,
      rules: "",
    },
  });

  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);

  const createGroupAction = useAction(upsertGroup, {
    onSuccess({ data }) {
      router.push(`/group/${data?.code}/overview`);
    },
  });

  const onSubmit = async (data: CreateGroupFormData) => {
    if (image) {
      const imageUrl = await uploadImage({ image });
      if (imageUrl.data) {
        await createGroupAction.executeAsync({ ...data, image: imageUrl.data });
      }
    }
  };

  const isCreating = useMemo(() => {
    return (
      methods.formState.isSubmitting ||
      createGroupAction.isExecuting ||
      createGroupAction.isPending
    );
  }, [
    methods.formState.isSubmitting,
    createGroupAction.isExecuting,
    createGroupAction.isPending,
  ]);

  if (isCreating && createGroupAction.hasSucceeded) {
    return <LoadingPage label="Criando grupo..." />;
  }

  return (
    <main className="relative flex w-full flex-col items-start justify-start gap-4 lg:flex-row">
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="scrollbar-none flex w-full max-w-2xl flex-1 flex-col space-y-2 rounded-lg"
        >
          <UploadInput
            label="Imagem do grupo"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImage(file);
            }}
          />

          <div className="space-y-4">
            <InputField
              name="name"
              label="Nome do grupo"
              placeholder="Nome do grupo"
            />
            <div className="flex w-full items-end space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="maxPlayers">Máximo de jogadores</Label>
                <Controller
                  name="maxPlayers"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="flex w-full flex-1">
                      <Input
                        {...field}
                        id="maxPlayers"
                        type="number"
                        min="2"
                        max="100"
                        placeholder="10"
                        className="w-full rounded-r-none"
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value < 2) {
                            e.target.value = "2";
                            return;
                          }
                          if (value > 100) {
                            e.target.value = "100";
                            return;
                          }
                          field.onChange(value);
                        }}
                      />
                      <div className="flex max-h-full flex-col">
                        <Button
                          type="button"
                          size={"icon"}
                          variant="outline"
                          className="h-1/2 w-5 rounded-sm rounded-l-none rounded-br-none border-b-0 border-l-0 px-0.5 py-0"
                          onClick={() => {
                            const newValue = Math.min(
                              Number(field.value) + 1,
                              100,
                            );
                            field.onChange(newValue);
                          }}
                        >
                          <ChevronUp />
                        </Button>
                        <Button
                          type="button"
                          size={"icon"}
                          variant="outline"
                          className="h-1/2 w-5 rounded-sm rounded-l-none rounded-tr-none border-l-0 px-0.5 py-0"
                          onClick={() => {
                            const newValue = Math.max(
                              Number(field.value) - 1,
                              2,
                            );
                            field.onChange(newValue);
                          }}
                        >
                          <ChevronDown />
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </div>
              <div className="flex min-h-9 flex-1 items-center gap-2 rounded-lg border border-dashed px-3 py-2">
                <LockIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                <p className="text-muted-foreground text-xs">
                  Seu grupo será <span className="font-semibold">privado</span>.
                  Convide membros pelo link de acesso.
                </p>
              </div>
            </div>

            <TextareaField
              name="description"
              label="Descrição"
              maxLength={500}
              placeholder="Descreva seu grupo..."
              className="min-h-[120px] resize-none"
            />
            <TextareaField
              name="rules"
              label="Regras (opcional)"
              maxLength={500}
              placeholder="Descreva as regras do seu grupo..."
              className="min-h-[120px] resize-none"
            />
          </div>
          <GroupFeedCardPreview
            methods={methods}
            image={image}
            className="mt-4 lg:hidden"
          />

          <footer className="mt-6">
            <Button
              type="submit"
              // disabled={!methods.formState.isValid || !image || isCreating}
              className="w-full"
            >
              Criar grupo
            </Button>
          </footer>
        </form>
      </Form>
      <GroupFeedCardPreview
        methods={methods}
        image={image}
        className="sticky top-0 hidden lg:flex"
      />
    </main>
  );
}
