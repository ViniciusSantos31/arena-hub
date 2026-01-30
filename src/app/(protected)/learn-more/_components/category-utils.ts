export function getCategoryColor(category: string): string {
  switch (category) {
    case "basic":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "intermediate":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "advanced":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case "basic":
      return "Básico";
    case "intermediate":
      return "Intermediário";
    case "advanced":
      return "Avançado";
    default:
      return "Outros";
  }
}
