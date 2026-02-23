"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { ResponsivePopover } from "../../reponsive-popover";
import { Label } from "../label";

interface DatePickerBaseProps {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  value?: Date;
  onChange?(value?: Date): void;
  minDate?: Date;
  maxDate?: Date;
  classNames?: {
    calendar?: string;
    trigger?: string;
  };
}

type DatePickerProps = DatePickerBaseProps &
  Pick<React.ComponentProps<typeof Button>, "aria-invalid">;

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  minDate,
  maxDate,
  className,
  classNames,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formatDisplayValue = () => {
    if (!value) return placeholder;

    return dayjs(value).locale("pt-BR").format("DD/MM/YYYY");
  };

  const handleSelect = (selectedValue: Date | undefined) => {
    onChange?.(selectedValue);
    setOpen(false);
  };

  return (
    <ResponsivePopover
      open={open}
      title={placeholder}
      onOpenChange={setOpen}
      disabled={disabled}
      content={
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value as Date}
          onSelect={handleSelect}
          disabled={{
            before: minDate ?? dayjs(0).toDate(),
            after: maxDate ?? undefined,
          }}
          className={cn("w-full", classNames?.calendar)}
          startMonth={minDate}
          endMonth={maxDate}
          fixedWeeks
          {...props}
        />
      }
    >
      <div className={cn("flex flex-col gap-2", className)}>
        {label && <Label>{label}</Label>}
        <Button
          variant="outline"
          type="button"
          aria-invalid={props["aria-invalid"]}
          className={cn(
            "aria-[invalid=true]:ring-destructive/20 dark:aria-[invalid=true]:ring-destructive/40 aria-[invalid=true]:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full flex-1 justify-between font-normal",
            !value && "text-muted-foreground",
            classNames?.trigger,
          )}
          disabled={disabled}
        >
          {formatDisplayValue()}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </div>
    </ResponsivePopover>
  );
}
