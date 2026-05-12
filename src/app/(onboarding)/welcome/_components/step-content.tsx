"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2Icon, CrownIcon } from "lucide-react";
import Image from "next/image";
import type { TutorialStep } from "./steps-data";

interface StepContentProps {
  step: TutorialStep;
  isVisible: boolean;
}

export function StepContent({ step, isVisible }: StepContentProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      {step.type === "welcome" && <WelcomeStep step={step} />}
      {step.type === "features" && <FeaturesStep step={step} />}
      {step.type === "roles" && <RolesStep step={step} />}
      {step.type === "finish" && <FinishStep step={step} />}
    </div>
  );
}

function WelcomeStep({ step }: { step: TutorialStep }) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="from-primary/20 to-primary/5 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br">
        <span className="text-4xl">
          <Image
            src="/icons/icon-192x192.png"
            alt="Arena Hub"
            width={80}
            height={80}
          />
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">
          {step.title}
        </h2>
        <p className="text-primary text-lg font-semibold">{step.subtitle}</p>
        <p className="text-muted-foreground mx-auto max-w-md leading-relaxed">
          {step.description}
        </p>
      </div>

      {step.items && (
        <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          {step.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-card border-border/60 flex items-center gap-3 rounded-xl border p-4 text-left"
              >
                <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-primary size-4" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeaturesStep({ step }: { step: TutorialStep }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">
          {step.title}
        </h2>
        <p className="text-primary font-semibold">{step.subtitle}</p>
        <p className="text-muted-foreground mx-auto max-w-lg leading-relaxed">
          {step.description}
        </p>
      </div>

      {step.items && (
        <div className="mx-auto w-full max-w-lg space-y-3">
          {step.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-card border-border/60 flex items-center gap-4 rounded-xl border p-4"
              >
                <div className="bg-primary/10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-primary size-4" />
                </div>
                <span className="text-sm leading-relaxed">{item.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RolesStep({ step }: { step: TutorialStep }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">
          {step.title}
        </h2>
        <p className="text-primary font-semibold">{step.subtitle}</p>
        <p className="text-muted-foreground mx-auto max-w-lg leading-relaxed">
          {step.description}
        </p>
      </div>

      {step.roles && (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {step.roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <div
                key={i}
                className={cn(
                  "border-border/60 bg-card flex flex-col gap-3 rounded-xl border p-5",
                  role.highlight && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      role.highlight ? "bg-primary/20" : "bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        role.highlight
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-bold",
                        role.highlight && "text-primary",
                      )}
                    >
                      {role.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {role.description}
                    </p>
                  </div>
                  {role.highlight && (
                    <CrownIcon className="text-primary ml-auto size-4" />
                  )}
                </div>

                <ul className="space-y-1.5">
                  {role.permissions.map((perm, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2Icon className="text-primary mt-0.5 size-3.5 shrink-0" />
                      <span className="text-muted-foreground text-xs leading-relaxed">
                        {perm}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FinishStep({ step }: { step: TutorialStep }) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="from-primary/20 to-primary/5 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br">
        <span className="text-4xl">🎉</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">
          {step.title}
        </h2>
        <p className="text-primary text-lg font-semibold">{step.subtitle}</p>
        <p className="text-muted-foreground mx-auto max-w-md leading-relaxed">
          {step.description}
        </p>
      </div>

      {step.items && (
        <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          {step.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-card border-border/60 flex items-center gap-3 rounded-xl border p-4 text-left"
              >
                <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-primary size-4" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
