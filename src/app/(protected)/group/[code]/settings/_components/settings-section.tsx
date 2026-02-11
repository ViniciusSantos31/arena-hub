"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "destructive";
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  variant = "default",
}: SettingsSectionProps) {
  return (
    <Card
      className={cn(
        "w-full",
        variant === "destructive" &&
          "border-destructive dark:bg-background bg-background **:data-[slot=card-title]:text-destructive **:data-[slot=card-description]:text-foreground",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

interface SettingsFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SettingsField({
  label,
  description,
  children,
  required = false,
  disabled = false,
  className,
}: SettingsFieldProps) {
  return (
    <div className={cn("space-y-2", disabled && "opacity-50", className)}>
      <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface SettingsActionProps {
  title: string;
  description: string;
  actionLabel: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
  loading?: boolean;
  onAction: () => void;
  className?: string;
}

export function SettingsAction({
  title,
  description,
  actionLabel,
  variant = "default",
  disabled = false,
  loading = false,
  onAction,
  className,
}: SettingsActionProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-4",
        className,
      )}
    >
      <div className="flex flex-col space-y-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Button
        variant={variant}
        disabled={disabled || loading}
        onClick={onAction}
      >
        {loading ? "Carregando..." : actionLabel}
      </Button>
    </div>
  );
}

interface PermissionWrapperProps {
  children: ReactNode;
  hasPermission: boolean;
  fallbackMessage?: string;
}

export function PermissionWrapper({
  children,
  hasPermission,
  fallbackMessage = "Você não tem permissão para alterar esta configuração.",
}: PermissionWrapperProps) {
  if (!hasPermission) {
    return (
      <div className="pointer-events-none opacity-50">
        {children}
        <p className="text-muted-foreground mt-1 text-xs">{fallbackMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
