import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./primitive";

export type SelectProps = React.ComponentProps<typeof SelectRoot> & {
  options: { value: string; label: string | number }[];
  placeholder?: string;
  className?: string;
} & ComponentProps<typeof SelectTrigger>;

export const Select = ({
  options,
  className,
  placeholder = "Selecione uma opção",
  ...props
}: SelectProps) => {
  return (
    <SelectRoot {...props}>
      <SelectTrigger
        aria-invalid={props["aria-invalid"]}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
