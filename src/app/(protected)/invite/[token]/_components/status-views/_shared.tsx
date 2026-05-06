import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

export function InviteCenteredShell({
  icon: Icon,
  groupLogo,
  iconClassName,
  title,
  description,
  children,
  footer,
}: {
  icon: LucideIcon;
  groupLogo: string | null;
  iconClassName?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-lg flex-col justify-center px-4 py-10">
      <Card className="border-border/60 gap-0 overflow-hidden">
        <CardHeader className="border-b pb-6 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center -space-x-3">
            <div className="bg-muted z-10 flex size-14 items-center justify-center rounded-2xl border">
              <Icon className={cn("h-7 w-7", iconClassName)} />
            </div>
            {groupLogo ? (
              <Image
                src={groupLogo}
                alt={`Logo do grupo`}
                width={100}
                height={100}
                className="bg-background size-14 rounded-2xl border-2 object-cover p-1"
              />
            ) : null}
          </div>
          <CardTitle className="justify-center text-xl">{title}</CardTitle>
          {description ? (
            <CardDescription className="mx-auto mt-1 max-w-prose">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
        {children ? (
          <CardContent className="border-b py-6">{children}</CardContent>
        ) : null}
        {footer ? (
          <CardFooter className={cn("pt-4", !children && "pt-6")}>
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </main>
  );
}
