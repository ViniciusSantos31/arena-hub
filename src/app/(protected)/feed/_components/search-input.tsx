import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export const SearchInput = () => {
  return (
    <div className="relative w-full max-w-lg">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Buscar grupos..."
        className="h-10 w-full pl-10"
      />
    </div>
  );
};
