import { useFormContext } from "react-hook-form";
import { Select } from ".";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { FieldBaseProps } from "../types/field";

type SelectFieldProps = FieldBaseProps<React.ComponentProps<typeof Select>>;

export const SelectField = ({
  name,
  label,
  description,
  extraContentLabel,
  ...props
}: SelectFieldProps) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {extraContentLabel}
            </FormLabel>
          )}
          <FormControl>
            <Select
              {...field}
              {...props}
              onValueChange={field.onChange}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
