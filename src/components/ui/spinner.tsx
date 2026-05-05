import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { PiSoccerBall } from "react-icons/pi";

const spinnerVariants = cva("relative inline-flex shrink-0", {
  variants: {
    size: {
      sm: "size-6",
      md: "size-10",
      lg: "size-12",
      xl: "size-20",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const centerDotSize: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
  xl: "size-10",
};

const orbitDotSize: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
  xl: "size-3.5",
};

type SpinnerProps = React.ComponentProps<"div"> &
  VariantProps<typeof spinnerVariants> & {
    label?: string;
  };

const Dot = ({
  className,
  size,
  ...props
}: React.ComponentProps<"span"> & {
  size: NonNullable<SpinnerProps["size"]>;
}) => {
  return (
    <span
      className={cn(
        "bg-primary/50 absolute rounded-full shadow-[0_0_18px_color-mix(in_oklch,var(--primary)_25%,transparent)] blur-xs",
        className,
        orbitDotSize[size],
      )}
      {...props}
    />
  );
};

function Spinner({ className, size = "md", label, ...props }: SpinnerProps) {
  const resolvedSize = size ?? "md";

  return (
    <div
      role="status"
      aria-label={label ?? "Carregando"}
      data-slot="spinner"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <PiSoccerBall
        aria-hidden
        className={cn(
          "text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full",
          centerDotSize[resolvedSize],
        )}
      />
      <span
        aria-hidden
        className={cn(
          "bg-primary/35 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl",
          resolvedSize === "sm"
            ? "size-2"
            : resolvedSize === "md"
              ? "size-5"
              : resolvedSize === "lg"
                ? "size-8"
                : "size-12",
        )}
      />

      <span
        aria-hidden
        className="animation-duration-[1s] absolute inset-0 animate-spin delay-75 [animation-timing-function:linear] motion-reduce:animate-none"
      >
        <Dot size={resolvedSize} className="bg-primary/50" />
      </span>
      <span
        aria-hidden
        className="animation-duration-[0.75s] absolute inset-0 animate-spin delay-150 [animation-timing-function:linear] motion-reduce:animate-none"
      >
        <Dot size={resolvedSize} className="bg-primary/80" />
      </span>
      <span
        aria-hidden
        className="animation-duration-[0.5s] absolute inset-0 animate-spin delay-300 [animation-timing-function:linear] motion-reduce:animate-none"
      >
        <Dot size={resolvedSize} className="bg-primary" />
      </span>
      <span aria-hidden className="sr-only" />
      <span className="sr-only">{label ?? "Carregando"}</span>
    </div>
  );
}

export { Spinner, spinnerVariants };
export type { SpinnerProps };
