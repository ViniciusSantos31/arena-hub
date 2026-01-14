import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { Switch } from ".";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { FieldBaseProps } from "../types/field";

type SwitchExtraProps = {
  sideLabel?: "left" | "right";
};

type SwitchFieldProps = FieldBaseProps<
  React.ComponentProps<typeof Switch> & SwitchExtraProps
>;

export const SwitchField = ({
  name,
  label,
  description,
  extraContentLabel,
  sideLabel = "right",
  ...props
}: SwitchFieldProps) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex-row",
            sideLabel === "right" &&
              "flex flex-row-reverse items-center justify-end",
          )}
        >
          {label && (
            <FormLabel>
              {label}
              {extraContentLabel}
            </FormLabel>
          )}
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              {...props}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
