import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps } from "react";

type GroupButtonProps = ComponentProps<"button"> & {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const GroupButton = ({
  label,
  icon: Icon,
  href,
  className,
}: GroupButtonProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "group bg-card hover:bg-accent/50 flex w-full cursor-pointer items-center gap-2 rounded-md border p-2 transition-all",
        className,
      )}
    >
      <Icon />
      <span className="font-mono text-sm">{label}</span>
    </Link>
  );
};
