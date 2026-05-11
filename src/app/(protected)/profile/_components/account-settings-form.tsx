"use client";

import { uploadImage } from "@/actions/image/upload";
import { updateProfile } from "@/actions/user/update-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, LoaderIcon, MapPinIcon, SearchIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const accountSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve conter pelo menos 2 caracteres")
    .max(100, "O nome deve conter no máximo 100 caracteres"),
  bio: z
    .string()
    .trim()
    .max(300, "A bio deve conter no máximo 300 caracteres")
    .optional(),
  location: z
    .string()
    .trim()
    .max(100, "A localização deve conter no máximo 100 caracteres")
    .optional(),
  lookingForGroup: z.boolean().optional(),
});

type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;

interface AccountSettingsFormProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    bio?: string | null;
    location?: string | null;
    lookingForGroup?: boolean | null;
  } | null;
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.image ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      location: user?.location ?? "",
      lookingForGroup: user?.lookingForGroup ?? false,
    },
  });

  const lookingForGroup = watch("lookingForGroup");

  const { execute, isExecuting } = useAction(updateProfile, {
    onSuccess() {
      toast.success("Perfil atualizado com sucesso!");
      setImageFile(null);
    },
    onError() {
      toast.error("Ocorreu um erro ao atualizar o perfil.");
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: AccountSettingsFormData) => {
    let imageUrl: string | undefined;

    if (imageFile) {
      try {
        const result = await uploadImage({ image: imageFile });
        if (result?.data) {
          imageUrl = result.data;
        } else {
          toast.error("Falha ao fazer upload da imagem.");
          return;
        }
      } catch {
        toast.error("Falha ao fazer upload da imagem.");
        return;
      }
    }

    execute({
      name: data.name,
      bio: data.bio,
      location: data.location,
      lookingForGroup: data.lookingForGroup,
      ...(imageUrl && { image: imageUrl }),
    });
  };

  const hasChanges = isDirty || !!imageFile;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label>Foto de perfil</Label>
        <div className="flex items-center gap-4">
          <div
            className="group relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="h-16 w-16">
              {previewUrl && (
                <AvatarImage src={previewUrl} alt={user?.name ?? ""} />
              )}
              <AvatarFallback className="text-lg font-semibold">
                {getAvatarFallback(user?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <CameraIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon />
              Alterar foto
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou WebP. Máx. 2 MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Seu nome completo"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          E-mail{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (não editável)
          </span>
        </Label>
        <Input
          id="email"
          value={user?.email ?? ""}
          readOnly
          className="cursor-not-allowed opacity-60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          rows={3}
          placeholder="Uma breve descrição sobre você..."
          className={cn(
            "border-input flex w-full min-w-0 resize-none rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none",
            "placeholder:text-muted-foreground dark:bg-input/30",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          )}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-1.5">
          <MapPinIcon className="h-3.5 w-3.5" />
          Localização
        </Label>
        <Input
          id="location"
          placeholder="Ex: São Paulo, SP"
          {...register("location")}
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location.message}</p>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <SearchIcon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Procurando grupo</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Apareça na vitrine para que admins possam te encontrar e enviar
                um link de convite.
              </p>
            </div>
          </div>
          <Switch
            checked={lookingForGroup ?? false}
            onCheckedChange={(val) =>
              setValue("lookingForGroup", val, { shouldDirty: true })
            }
          />
        </div>
      </div>

      <Button
        className="ml-auto"
        type="submit"
        disabled={!hasChanges || isExecuting}
      >
        {isExecuting && <LoaderIcon className="h-4 w-4 animate-spin" />}
        Salvar alterações
      </Button>
    </form>
  );
}
