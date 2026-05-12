"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StepContent } from "./_components/step-content";
import { TUTORIAL_STEPS } from "./_components/steps-data";

const TOTAL_STEPS = TUTORIAL_STEPS.length;

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_STEPS - 1;
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  function navigate(direction: "next" | "prev") {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) =>
        direction === "next"
          ? Math.min(prev + 1, TOTAL_STEPS - 1)
          : Math.max(prev - 1, 0),
      );
      setIsAnimating(false);
    }, 150);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="border-border/60 flex items-center justify-between border-b px-6 py-4">
        <Link
          href="/"
          className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-lg font-black text-transparent"
        >
          Arena Hub
        </Link>

        <div className="text-muted-foreground text-sm font-medium">
          {currentStep + 1} de {TOTAL_STEPS}
        </div>

        <Link
          href="/home"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
        >
          Pular tutorial
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </header>

      {/* Progress bar */}
      <div className="bg-border/40 h-1 w-full">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-1.5 pt-6">
        {TUTORIAL_STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!isAnimating && i !== currentStep) {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentStep(i);
                  setIsAnimating(false);
                }, 150);
              }
            }}
            aria-label={`Ir para passo ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentStep
                ? "bg-primary w-6"
                : i < currentStep
                  ? "bg-primary/40 w-1.5"
                  : "bg-border w-1.5",
            )}
          />
        ))}
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <StepContent step={step} isVisible={!isAnimating} />
        </div>
      </main>

      {/* Navigation */}
      <footer className="border-border/60 bg-background sticky bottom-0 z-20 border-t px-6 py-5">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("prev")}
            disabled={isFirst || isAnimating}
            className="gap-2"
          >
            <ArrowLeftIcon className="size-4" />
            Anterior
          </Button>

          {isLast ? (
            <Button asChild size="lg" className="gap-2 px-8">
              <Link href="/home">
                <HomeIcon className="size-4" />
                Ir para o início
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() => navigate("next")}
              disabled={isAnimating}
              size="lg"
              className="gap-2 px-8"
            >
              Próximo
              <ArrowRightIcon className="size-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
