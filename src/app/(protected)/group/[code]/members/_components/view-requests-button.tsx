import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const ViewRequestsButton = () => {
  return (
    <Button variant="outline" asChild className="ml-auto w-fit">
      <Link href={`members/request`}>
        Solicitações de entrada
        <Badge className="bg-primary/10 text-primary aspect-square">3</Badge>
      </Link>
    </Button>
  );
};
