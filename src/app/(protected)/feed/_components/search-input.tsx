import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SearchInput = () => {
  return (
    <div className="relative w-full max-w-lg rounded-full shadow-xl backdrop-blur-md">
      <Search className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Buscar grupos..."
        className="h-auto w-full rounded-full border p-4 pl-14"
      />
    </div>
  );
};
