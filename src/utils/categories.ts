type Category = "female" | "male" | "mixed";

export const getCategoryColor = (category: Category) => {
  const colors: { [key in Category]: string } = {
    female: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
    male: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    mixed:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

export const categoryOptions: { id: Category; name: string }[] = [
  { id: "female", name: "Feminino" },
  { id: "male", name: "Masculino" },
  { id: "mixed", name: "Misto" },
];

export const categoryLabels: { [key in Category]: string } = {
  female: "Feminino",
  male: "Masculino",
  mixed: "Misto",
};

export const getCategoryLabelById = (id: string) => {
  return categoryLabels[id as Category] || "Desconhecido";
};

export const categoriesIds = categoryOptions.map((option) => option.id);
