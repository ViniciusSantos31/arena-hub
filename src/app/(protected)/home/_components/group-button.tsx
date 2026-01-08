import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps } from "react";

type GroupButtonProps = ComponentProps<"button"> & {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const GroupButton = ({ label, icon: Icon, href }: GroupButtonProps) => {
  return (
    <Link
      href={href}
      className="group hover:border-primary hover:bg-primary/10 flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border transition-all hover:scale-105"
    >
      <Icon className="size-8" />
      <span className="font-mono text-sm font-bold">{label}</span>
    </Link>
  );
};
