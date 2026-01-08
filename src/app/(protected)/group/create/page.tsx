"use client";

import { createGroup } from "@/actions/group/create";
import { uploadImage } from "@/actions/image/upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UploadInput } from "@/components/upload-input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { GroupFeedCard } from "../../feed/_components/group-feed-card";
import { CreateGroupFormData, createGroupSchema } from "./_schema/create";

const GroupFeedCardPreview = ({
  methods,
  image,
  className,
}: {
  methods: UseFormReturn<CreateGroupFormData>;
  image: File | null;
  className?: string;
}) => {
  const { name, description, isPrivate } = methods.watch();
  return (
    <div
      className={cn(
        "sticky top-0 flex max-h-full w-full flex-1 gap-0 sm:space-x-3 lg:h-full lg:flex-col lg:space-y-3",
        className,
      )}
    >
      <Card className="from-card/50 to-background hidden h-full flex-1 border-0 bg-transparent bg-linear-to-l lg:flex lg:bg-linear-to-t" />
      <GroupFeedCard
        preview
        group={{
          name: name || "Nome do grupo",
          description: description || "Descrição do grupo",
          isPrivate: isPrivate || false,
          logo: image ? URL.createObjectURL(image) : null,
        }}
      />
      <Card className="from-card/50 to-background hidden h-full flex-1 border-0 bg-transparent bg-linear-to-r sm:flex lg:bg-linear-to-b" />
    </div>
  );
};

export default function CreateGroupPage() {
  const methods = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
      maxPlayers: 10,
    },
  });

  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);

  const createGroupAction = useAction(createGroup, {
    onSuccess({ data }) {
      router.push(`/group/${data?.code}`);
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
    return (
      <main className="flex h-full w-full flex-col items-center justify-center">
        <Loader2Icon className="size-11 animate-spin" />
        <span>Criando grupo...</span>
      </main>
    );
  }

  return (
    <main className="flex h-full w-full flex-col items-center justify-start gap-4 lg:flex-row">
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex w-full max-w-2xl flex-1 flex-col space-y-2 rounded-lg p-2 md:p-4 lg:p-8"
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
            <div className="flex w-full items-center space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="maxPlayers">Máximo de jogadores</Label>
                <Controller
                  name="maxPlayers"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="flex w-full flex-1">
                      <Input
                        {...field}
                        type="number"
                        min="2"
                        max="100"
                        placeholder="10"
                        className="w-full rounded-r-none"
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
              <div className="mt-5 flex items-center space-x-2">
                <Controller
                  name="isPrivate"
                  control={methods.control}
                  render={({ field }) => (
                    <Switch
                      id="isPrivate"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="isPrivate">Grupo privado</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Controller
                name="description"
                control={methods.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Descreva seu grupo..."
                    className="min-h-[120px] resize-none"
                  />
                )}
              />
            </div>
          </div>
          <GroupFeedCardPreview
            methods={methods}
            image={image}
            className="mt-4 lg:hidden"
          />

          <footer className="mt-6">
            <Button
              type="submit"
              disabled={!methods.formState.isValid || !image || isCreating}
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
        className="hidden lg:flex"
      />
    </main>
  );
}
