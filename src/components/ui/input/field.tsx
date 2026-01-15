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
import { FieldBaseProps } from "../types/field";

type InputFieldProps = FieldBaseProps<React.ComponentProps<typeof Input>>;

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
            <Input
              {...field}
              {...props}
              onChange={(e) => {
                if (props.type === "number") {
                  field.onChange(Number(e.target.value));
                  return;
                }
                field.onChange(e);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
