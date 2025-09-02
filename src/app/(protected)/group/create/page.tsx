"use client";

import { createGroup } from "@/actions/group/create";
import { uploadImage } from "@/actions/image/upload";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input/field";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CreateGroupFormData, createGroupSchema } from "./_schema/create";

export default function CreateGroupPage() {
  const methods = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);

  const createGroupAction = useAction(createGroup, {
    onSuccess({ data }) {
      router.push(`/group/${data?.id}`);
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
    <main className="flex h-full w-full flex-col items-center justify-center">
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="border-border flex w-full max-w-lg flex-col rounded-lg border p-8"
        >
          <div className="flex flex-col items-start space-x-2 sm:flex-row sm:items-center">
            {image ? (
              <Image
                src={URL.createObjectURL(image)}
                alt="Preview"
                width={100}
                height={100}
                className="bg-accent mb-4 flex aspect-square h-28 max-h-28 w-28 max-w-28 items-center justify-center overflow-clip rounded-lg border object-cover sm:mb-0"
              />
            ) : (
              <div className="bg-accent mb-4 aspect-square h-28 max-h-28 w-28 max-w-28 rounded-lg border sm:mb-0" />
            )}
            <div className="space-y-2">
              <Label>Imagem do grupo</Label>
              <Input
                type="file"
                placeholder="Escolha uma imagem"
                accept="image/*"
                lang="pt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                  }
                }}
              />
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <InputField
              name="name"
              label="Nome do grupo"
              placeholder="Nome do grupo"
            />
            <InputField
              name="description"
              label="Descrição"
              placeholder="Descrição do grupo"
            />
          </div>
          <footer className="mt-4">
            <Button
              type="submit"
              disabled={!methods.formState.isValid || !image || isCreating}
            >
              Criar grupo
            </Button>
          </footer>
        </form>
      </Form>
    </main>
  );
}
