import { useFormContext } from "react-hook-form";
import { Textarea } from ".";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { FieldBaseProps } from "../types/field";

type TextareaFieldProps = FieldBaseProps<React.ComponentProps<typeof Textarea>>;

export const TextareaField = ({
  name,
  label,
  description,
  extraContentLabel,
  ...props
}: TextareaFieldProps) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {extraContentLabel}
            </FormLabel>
          )}
          <FormControl>
            <Textarea {...field} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
