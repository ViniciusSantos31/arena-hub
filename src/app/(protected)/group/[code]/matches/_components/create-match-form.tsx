"use client";

import { Button } from "@/components/ui/button";

import { createMatch } from "@/actions/match/create";
import { DatePickerField } from "@/components/ui/date-picker/field";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { SelectField } from "@/components/ui/select/field";
import { TextareaField } from "@/components/ui/textarea/field";
import { queryClient } from "@/lib/react-query";
import { categoryOptions } from "@/utils/categories";
import { sportOptions } from "@/utils/sports";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useAction } from "next-safe-action/hooks";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateMatchFormData, createMatchSchema } from "../_schema/create";

type CreateMatchFormProps = {
  setOpen: (open: boolean) => void;
};

export const CreateMatchForm = ({ setOpen }: CreateMatchFormProps) => {
  const methods = useForm<CreateMatchFormData>({
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
    },
  });

  const { code } = useParams<{ code: string }>();

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
    createMatchAction.execute({ ...data, organizationCode: code });
  };

  const disableButton =
    createMatchAction.isExecuting || methods.formState.isSubmitting;

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="flex h-full flex-col space-y-6 border-t pt-4"
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

        <div className="grid h-fit grid-cols-2 gap-4">
          <DatePickerField
            name="date"
            label="Data"
            minDate={dayjs().toDate()}
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

        <div className="mt-auto flex gap-4 pb-4">
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
