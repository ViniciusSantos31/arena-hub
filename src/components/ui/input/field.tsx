import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from ".";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";

type FieldBaseProps = {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  extraContentLabel?: ReactNode;
};

type InputFieldProps = FieldBaseProps & React.ComponentProps<typeof Input>;

export const InputField = ({
  name,
  label,
  description,
  extraContentLabel,
  ...props
}: InputFieldProps) => {
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
            <Input {...field} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
