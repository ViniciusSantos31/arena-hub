"use client";

import { createFeedback } from "@/actions/feedback/create";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextareaField } from "@/components/ui/textarea/field";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ResponsiveDialog } from "../responsive-dialog";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(10).max(1000),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export function FeedbackDialog({
  open,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}) {
  const methods = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, message: "" },
  });

  const createAction = useAction(createFeedback, {
    onSuccess: () => {
      toast.success("Obrigado! Seu feedback foi enviado.");
      methods.reset({ rating: 0, message: "" });
      onSubmitted();
    },
    onError: () => {
      toast.error("Não foi possível enviar seu feedback. Tente novamente.");
    },
  });

  const rating = methods.watch("rating");

  const isSubmitting = useMemo(() => {
    return (
      methods.formState.isSubmitting ||
      createAction.isExecuting ||
      createAction.isPending
    );
  }, [
    methods.formState.isSubmitting,
    createAction.isExecuting,
    createAction.isPending,
  ]);

  const onSubmit = async (data: FeedbackFormData) => {
    await createAction.executeAsync(data);
  };

  return (
    <ResponsiveDialog
      title="Como está sendo sua experiência?"
      description="Ajude-nos a melhorar o nosso aplicativo avaliando a sua experiência."
      open={open}
      onOpenChange={onOpenChange}
      content={
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Avaliação</span>
                <span className="text-muted-foreground text-xs">
                  {rating ? `${rating}/5` : "Selecione"}
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = i + 1;
                  const active = rating >= value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        methods.setValue("rating", value, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px]",
                      )}
                      aria-label={`Avaliar com ${value} de 5`}
                    >
                      <Star
                        className={cn(
                          "size-5",
                          active
                            ? "fill-primary text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              {methods.formState.errors.rating?.message && (
                <p className="text-destructive text-sm">
                  {String(methods.formState.errors.rating.message)}
                </p>
              )}
            </div>

            <TextareaField
              name="message"
              label="Seu feedback"
              placeholder="O que você mais gostou? O que podemos melhorar?"
              rows={4}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Agora não
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                Enviar
              </Button>
            </div>
          </form>
        </Form>
      }
    />
  );
}
