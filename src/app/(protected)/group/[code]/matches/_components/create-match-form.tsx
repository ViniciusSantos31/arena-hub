"use client";

import { getPaidMatchEligibility } from "@/actions/group/paid-match-eligibility";
import { createMatch } from "@/actions/match/create";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { SelectField } from "@/components/ui/select/field";
import { Switch } from "@/components/ui/switch";
import { TextareaField } from "@/components/ui/textarea/field";
import { queryClient } from "@/lib/react-query";
import { categoryOptions } from "@/utils/categories";
import { sportOptions } from "@/utils/sports";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CreateMatchFormData, createMatchSchema } from "../_schema/create";

dayjs.locale(ptBR);

type CreateMatchFormProps = {
  setOpen: (open: boolean) => void;
};

export const CreateMatchForm = ({ setOpen }: CreateMatchFormProps) => {
  const [stripeBlockOpen, setStripeBlockOpen] = useState(false);
  const [stripeBlockReason, setStripeBlockReason] = useState<
    "no_account" | "onboarding_incomplete"
  >("no_account");

  const methods = useForm({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      title: "",
      date: dayjs().toDate(),
      time: "",
      sport: "volei",
      category: "mixed",
      location: "",
      minPlayers: 10,
      maxPlayers: 50,
      isPaid: false,
      priceReais: undefined as number | undefined,
    },
  });

  const { code } = useParams<{ code: string }>();

  const { data: eligibility, isPending: eligibilityPending } = useQuery({
    queryKey: ["paid-match-eligibility", code],
    queryFn: async () => {
      const res = await getPaidMatchEligibility({ organizationCode: code });
      return res?.data ?? null;
    },
    enabled: !!code,
  });

  const isPaid = useWatch({ control: methods.control, name: "isPaid" });

  const createMatchAction = useAction(createMatch, {
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["matches", code] });
      toast.success("Partida criada com sucesso!");
    },
    onError: () => {
      toast.error("Ocorreu um erro ao criar a partida. Tente novamente.");
    },
  });

  const handleSubmit = (data: CreateMatchFormData) => {
    createMatchAction.execute({
      ...data,
      organizationCode: code,
    });
  };

  const disableButton =
    createMatchAction.isExecuting || methods.formState.isSubmitting;

  const blockMessages = {
    no_account: {
      title: "Conecte sua conta Stripe",
      description:
        "Para criar partidas pagas, cadastre a conta de recebimentos nas configurações do grupo.",
    },
    onboarding_incomplete: {
      title: "Complete o cadastro no Stripe",
      description:
        "Sua conta Stripe ainda não está pronta para receber pagamentos. Continue o cadastro nas configurações do grupo.",
    },
  } as const;

  return (
    <>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className="flex h-full flex-col space-y-4"
        >
          <div className="grid grid-cols-1">
            <InputField
              name="title"
              label="Nome da Partida"
              placeholder="Ex: Arena Hub FC"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <SelectField
              name="sport"
              label="Esporte"
              placeholder="Selecione o esporte"
              options={sportOptions.map((sport) => ({
                value: sport.id,
                label: sport.name,
              }))}
            />
            <SelectField
              name="category"
              label="Categoria"
              placeholder="Selecione a categoria"
              options={categoryOptions.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <InputField
              name="minPlayers"
              label="Mínimo de Jogadores"
              type="number"
              placeholder="Ex: 10"
            />
            <InputField
              name="maxPlayers"
              label="Máximo de Jogadores"
              type="number"
              placeholder="Ex: 20"
              max={100}
            />
          </div>

          <div className="border-border/60 space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Partida paga</p>
                <p className="text-muted-foreground text-xs">
                  Jogadores pagam via Pix para confirmar presença. Exige conta
                  Stripe conectada ao grupo.
                </p>
              </div>
              <Controller
                name="isPaid"
                control={methods.control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (eligibilityPending) {
                          toast.info("Verificando conta de pagamentos…");
                          return;
                        }
                        if (!eligibility?.canCreatePaidMatch) {
                          setStripeBlockReason(
                            eligibility?.reason === "onboarding_incomplete"
                              ? "onboarding_incomplete"
                              : "no_account",
                          );
                          setStripeBlockOpen(true);
                          return;
                        }
                      }
                      field.onChange(checked);
                      if (!checked) {
                        methods.setValue("priceReais", undefined);
                        methods.clearErrors("priceReais");
                      }
                    }}
                  />
                )}
              />
            </div>
            {isPaid && (
              <InputField
                name="priceReais"
                label="Valor por jogador (R$)"
                type="number"
                min={5}
                step={0.01}
                placeholder="Ex: 20,00"
                description="Valor mínimo de R$ 5,00 por jogador."
              />
            )}
          </div>

          <div className="grid h-fit grid-cols-1 gap-4 md:grid-cols-2">
            <DatePickerField
              name="date"
              label="Data"
              minDate={dayjs().toDate()}
              className="w-auto"
            />

            <InputField
              name="time"
              label="Horário"
              type="time"
              pattern="[0-9]{2}:[0-9]{2}"
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>

          <InputField
            name="location"
            label="Local"
            placeholder="Ex: Arena Hub - Rua Exemplo, 123"
          />

          <TextareaField
            name="description"
            label="Descrição (Opcional)"
            placeholder="Adicione informações extras sobre a partida..."
            className="resize-none"
          />

          <div className="bg-background bottom-0 mt-auto flex gap-4 py-4 max-md:sticky md:py-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={disableButton}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={disableButton}>
              Criar Partida
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={stripeBlockOpen} onOpenChange={setStripeBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blockMessages[stripeBlockReason].title}
            </DialogTitle>
            <DialogDescription>
              {blockMessages[stripeBlockReason].description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" asChild>
              <Link href={`/group/${code}/settings#payments`}>
                Ir para configurações
              </Link>
            </Button>
            <Button onClick={() => setStripeBlockOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
