import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="border-border border-b">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold">Arena Hub</div>
          <div className="flex items-center gap-4">
            <Link
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary transition-colors"
            >
              Preços
            </Link>
            <Button asChild>
              <Link href="/auth/sign-in">Começar</Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="from-primary to-background mb-6 bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
          Arena Hub
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl md:text-2xl">
          A plataforma definitiva para gerenciamento de torneios e jogos
          competitivos
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/sign-up"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-4 text-lg font-semibold transition-colors"
          >
            Crie sua conta
          </Link>
          <Link
            href="#demo"
            className="border-border hover:bg-muted rounded-lg border px-8 py-4 text-lg font-semibold transition-colors"
          >
            Ver demonstração
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">
            Tudo que você precisa para jogos competitivos
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-card border-border rounded-xl border p-8">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  className="text-primary h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                Gerenciamento de partidas
              </h3>
              <p className="text-muted-foreground">
                Crie e gerencie partidas com facilidade. Controle inscrições,
                times e resultados em uma única plataforma.
              </p>
            </div>
            <div className="bg-card border-border rounded-xl border p-8">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  className="text-primary h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                Colaboração em equipe
              </h3>
              <p className="text-muted-foreground">
                Organize equipes, acompanhe estatísticas dos jogadores e
                coordene partidas com ferramentas avançadas de gerenciamento.
              </p>
            </div>
            <div className="bg-card border-border rounded-xl border p-8">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  className="text-primary h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                Análises e insights
              </h3>
              <p className="text-muted-foreground">
                Obtenha análises detalhadas sobre performance dos jogadores,
                métricas de torneios e relatórios abrangentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold">
            Pronto para elevar sua experiência de jogo?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
            Junte-se a milhares de jogadores e organizadores que confiam no
            Arena Hub para suas necessidades de jogos competitivos.
          </p>
          <Link
            href="/auth/sign-up"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-lg px-8 py-4 text-lg font-semibold transition-colors"
          >
            Começar gratuitamente
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-border border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 text-2xl font-bold">Arena Hub</div>
              <p className="text-muted-foreground">
                A plataforma definitiva para jogos competitivos e gerenciamento
                de torneios.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Produto</h4>
              <div className="text-muted-foreground space-y-2">
                <div>Recursos</div>
                <div>Preços</div>
                <div>Documentação</div>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Empresa</h4>
              <div className="text-muted-foreground space-y-2">
                <div>Sobre</div>
                <div>Contato</div>
                <div>Suporte</div>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <div className="text-muted-foreground space-y-2">
                <div>Privacidade</div>
                <div>Termos</div>
                <div>Cookies</div>
              </div>
            </div>
          </div>
          <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center">
            © 2024 Arena Hub. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
