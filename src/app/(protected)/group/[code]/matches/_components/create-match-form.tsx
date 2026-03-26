"use client";

import { Button } from "@/components/ui/button";

import { createMatch } from "@/actions/match/create";
import { getRecipient } from "@/actions/payment/get-recipient";
import { DatePickerField } from "@/components/ui/date-picker/field";
import { Form, FormDescription, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input/field";
import { SelectField } from "@/components/ui/select/field";
import { SwitchField } from "@/components/ui/switch/field";
import { TextareaField } from "@/components/ui/textarea/field";
import { PAYMENT_CONFIG } from "@/lib/payments";
import { queryClient } from "@/lib/react-query";
import { categoryOptions } from "@/utils/categories";
import { sportOptions } from "@/utils/sports";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { AlertTriangleIcon, CreditCardIcon, ExternalLinkIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NumericFormat } from "react-number-format";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CreateMatchFormData, createMatchSchema } from "../_schema/create";

dayjs.locale(ptBR);

type CreateMatchFormProps = {
  setOpen: (open: boolean) => void;
};

export const CreateMatchForm = ({ setOpen }: CreateMatchFormProps) => {
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
      paymentDeadlineMinutes: 30,
    },
  });

  const isPaid = useWatch({ control: methods.control, name: "isPaid" });

  const { code } = useParams<{ code: string }>();

  const { data: recipient, isLoading: isLoadingRecipient } = useQuery({
    queryKey: ["recipient", code],
    enabled: isPaid,
    queryFn: async () => {
      const result = await getRecipient({ organizationCode: code });
      return result?.data ?? null;
    },
    staleTime: 30_000,
  });

  const hasActiveRecipient = recipient?.status === "active";
  const isRecipientBlocking = isPaid && !isLoadingRecipient && !hasActiveRecipient;

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
    const totalPriceCents =
      data.isPaid && data.totalPrice
        ? Math.round(data.totalPrice * 100)
        : undefined;

    createMatchAction.execute({
      ...data,
      organizationCode: code,
      totalPriceCents,
    });
  };

  const disableButton =
    createMatchAction.isExecuting ||
    methods.formState.isSubmitting ||
    isRecipientBlocking;

  return (
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

        <div className="space-y-4 rounded-lg border p-4">
          <SwitchField
            name="isPaid"
            label="Partida paga"
            description="Jogadores precisarão pagar para confirmar presença"
            className="ml-auto"
          />

          {isPaid && (
            <>
              {/* Carregando status da conta */}
              {isLoadingRecipient && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg p-3">
                  <div className="border-muted-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  <span className="text-muted-foreground text-sm">
                    Verificando configuração de pagamentos...
                  </span>
                </div>
              )}

              {/* Alerta bloqueante: sem conta ativa */}
              {isRecipientBlocking && (
                <div className="bg-destructive/5 border-destructive/20 rounded-lg border p-4">
                  <div className="flex gap-3">
                    <AlertTriangleIcon className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Conta de recebimentos não configurada
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {recipient?.status === "pending"
                          ? "Você iniciou o cadastro no Stripe, mas ainda não concluiu. Complete o onboarding para criar partidas pagas."
                          : "Para criar partidas pagas, você precisa configurar sua conta bancária no Stripe Connect. Leva apenas alguns minutos."}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 mt-1 gap-1.5"
                        asChild
                      >
                        <Link
                          href={`/group/${code}/settings/billing`}
                          target="_blank"
                        >
                          <CreditCardIcon className="h-3.5 w-3.5" />
                          {recipient?.status === "pending"
                            ? "Concluir cadastro"
                            : "Configurar recebimentos"}
                          <ExternalLinkIcon className="h-3 w-3 opacity-60" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos de valor — só exibe quando conta está ativa */}
              {hasActiveRecipient && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <FormLabel>Valor por jogador</FormLabel>
                    <NumericFormat
                      prefix="R$"
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      min={PAYMENT_CONFIG.MIN_PRICE_PER_PLAYER_CENTS / 100}
                      max={PAYMENT_CONFIG.MAX_PRICE_PER_PLAYER_CENTS / 100}
                      fixedDecimalScale
                      onValueChange={(values) => {
                        methods.setValue(
                          "totalPrice",
                          (values.floatValue ?? 0) *
                            (methods.watch("maxPlayers", 1) ?? 1),
                        );
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <FormLabel>Valor total da partida (aprox.)</FormLabel>
                    <NumericFormat
                      prefix="R$"
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      customInput={Input}
                      onFocus={(e) => e.target.select()}
                      disabled
                      readOnly
                      value={methods.watch("totalPrice", 0)}
                    />
                    <FormDescription>
                      Calculado automaticamente com base no número de jogadores
                      e o valor por jogador.
                    </FormDescription>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-background bottom-0 mt-auto flex gap-4 py-4 max-md:sticky md:py-0">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={disableButton}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={disableButton}>
            Criar Partida
          </Button>
        </div>
      </form>
    </Form>
  );
};
