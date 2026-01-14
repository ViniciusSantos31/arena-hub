"use client";

import { Button } from "@/components/ui/button";

import { DatePickerField } from "@/components/ui/date-picker/field";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { SelectField } from "@/components/ui/select/field";
import { SwitchField } from "@/components/ui/switch/field";
import { TextareaField } from "@/components/ui/textarea/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateMatchFormData, createMatchSchema } from "../_schema/create";

export const CreateMatchForm = () => {
  const methods = useForm<CreateMatchFormData>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      time: "",
      sport: "",
      category: "",
      location: "",
      maxPlayers: 50,
      isFree: false,
      pricePerPerson: 0,
    },
  });

  const isFree = methods.watch("isFree");

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            name="title"
            label="Nome da Partida"
            placeholder="Ex: Arena Hub FC"
          />

          <SelectField
            name="sport"
            label="Esporte"
            placeholder="Selecione o esporte"
            options={[
              { value: "futebol", label: "Futebol" },
              { value: "futsal", label: "Futsal" },
              { value: "basketball", label: "Basquete" },
              { value: "volleyball", label: "Vôlei" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            name="category"
            label="Categoria"
            placeholder="Selecione a categoria"
            options={[
              { value: "male", label: "Masculino" },
              { value: "female", label: "Feminino" },
              { value: "mixed", label: "Misto" },
            ]}
          />

          <InputField
            name="maxPlayers"
            label="Máximo de Jogadores"
            type="number"
            placeholder="Ex: 20"
          />
        </div>

        <div className="grid h-fit grid-cols-3 gap-4 md:grid-cols-3">
          <DatePickerField name="date" label="Data" minDate={new Date()} />

          <InputField
            name="time"
            label="Horário"
            type="time"
            pattern="[0-9]{2}:[0-9]{2}"
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />

          <div className="col-span-1 space-y-2 md:col-span-1">
            <InputField
              name="pricePerPerson"
              label="Preço por Pessoa (R$)"
              type="number"
              step="0.01"
              placeholder="R$ 20.00"
              disabled={isFree}
            />

            <SwitchField name="isFree" label="Gratuito" />
          </div>
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

        <div className="mt-auto flex gap-4 py-4">
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
