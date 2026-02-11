"use client";

import { cn } from "@/lib/utils";
import { PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { ComponentProps, useRef, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { Label } from "./ui/label";

export type UploadInputProps = {
  label?: string;
  defaultValue?: string;
} & ComponentProps<"input">;

export const UploadInput = ({ defaultValue, ...props }: UploadInputProps) => {
  const [_image, _setImage] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    _setImage(file);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleRemove = () => {
    _setImage(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (props.onChange) {
      const event = {
        target: {
          files: null,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      props.onChange(event);
    }
  };

  return (
    <label className="flex w-fit cursor-pointer items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden w-0"
        {...props}
        onChange={handleChange}
      />
      {_image || defaultValue ? (
        <Image
          src={_image ? URL.createObjectURL(_image) : defaultValue!}
          alt="upload image"
          width={128}
          height={128}
          className="bg-card size-20 rounded-xl border object-cover p-1"
        />
      ) : (
        <div className="bg-card flex size-20 items-center justify-center rounded-xl border text-white transition-colors">
          <PlusIcon />
        </div>
      )}
      <div className="space-y-2">
        {props.label && <Label>{props.label}</Label>}
        <span className={buttonVariants({ variant: "outline" })}>
          <PlusIcon />
          Adicionar imagem
        </span>
      </div>
      {_image && (
        <Button
          variant={"ghost"}
          size={"icon"}
          className={cn("hover:text-destructive", props.label && "mt-6")}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleRemove();
          }}
        >
          <TrashIcon />
          <span className="sr-only">Remover imagem</span>
        </Button>
      )}
    </label>
  );
};
