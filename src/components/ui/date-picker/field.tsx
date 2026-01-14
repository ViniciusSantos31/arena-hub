import { useFormContext } from "react-hook-form";
import { DatePicker } from ".";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { FieldBaseProps } from "../types/field";

type DatePickerFieldProps = FieldBaseProps<
  React.ComponentProps<typeof DatePicker>
>;

export const DatePickerField = ({
  name,
  label,
  description,
  extraContentLabel,
  ...props
}: DatePickerFieldProps) => {
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
            <DatePicker
              {...field}
              {...props}
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
