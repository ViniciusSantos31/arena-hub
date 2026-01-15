"use client";

import { Button } from "@/components/ui/button";

import { DatePickerField } from "@/components/ui/date-picker/field";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { SelectField } from "@/components/ui/select/field";
import { TextareaField } from "@/components/ui/textarea/field";
import { categoryOptions } from "@/utils/categories";
import { sportOptions } from "@/utils/sports";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { CreateMatchFormData, createMatchSchema } from "../_schema/create";

export const CreateMatchForm = () => {
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

  const handleSubmit = (data: CreateMatchFormData) => {
    // Handle form submission logic here
    console.log(data);
  };

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="flex h-full flex-col space-y-6 border-t px-4 pt-4"
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
            min={8}
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
          <Button type="button" variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            Criar Partida
          </Button>
        </div>
      </form>
    </Form>
  );
};
