import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GroupPage() {
  return (
    <main>
      <section className="mt-3 flex h-36 space-x-4 md:h-44">
        <div className="bg-card border-border aspect-square h-36 rounded-lg border md:h-44" />
        <div className="flex h-full flex-col justify-between text-start">
          <div>
            <h1 className="line-clamp-1 text-2xl font-bold">
              Inimigos do volei
            </h1>
            <span className="text-muted-foreground line-clamp-2 text-sm">
              Grupo para quem gosta de jogar vôlei sem compromisso, diversão
              garantida!
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1 text-xs">
              <p className="text-nowrap">Criado por</p>
              <Avatar className="hidden size-6 items-center justify-center text-xs sm:block">
                <AvatarImage />
                <AvatarFallback>VS</AvatarFallback>
              </Avatar>
              <span className="line-clamp-1">Vinicius Santos</span>
            </div>
            <span className="text-muted-foreground text-xs">
              Criado em {new Date().toLocaleDateString()}
            </span>
            <span className="text-muted-foreground text-xs">
              29 partias organizadas
            </span>
          </div>
        </div>
      </section>
      <section></section>
    </main>
  );
}
