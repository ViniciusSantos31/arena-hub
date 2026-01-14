import { ReactNode } from "react";

export type FieldBaseProps<T = object> = {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  extraContentLabel?: ReactNode;
} & T;
