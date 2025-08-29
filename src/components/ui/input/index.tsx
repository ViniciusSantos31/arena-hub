"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Button } from "../button";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("relative flex w-auto")}>
      <input
        type={showPassword ? "text" : type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      {type === "password" && (
        <Button
          type="button"
          size="icon"
          onClick={() => setShowPassword((prevState) => !prevState)}
          variant="ghost"
          className="absolute top-0 right-0 hover:!bg-transparent"
        >
          <Eye />
        </Button>
      )}
    </div>
  );
}

export { Input };
