"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#tutorial", label: "Tutorial" },
  { href: "/#recursos", label: "Recursos" },
  { href: "/sobre", label: "Sobre nós" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-xl font-bold text-transparent"
          onClick={() => setOpen(false)}
        >
          Arena Hub
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/sign-in">Entrar</Link>
          </Button>
          <ModeToggle />
          <button
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="text-foreground hover:bg-accent flex h-9 w-9 items-center justify-center rounded-md transition-colors md:hidden"
          >
            {open ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "bg-background fixed inset-0 top-[57px] z-40 flex h-fit flex-col gap-1 overflow-y-auto border-b px-4 pt-4 pb-8 backdrop-blur-md transition-all duration-300 md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-accent flex items-center rounded-lg px-4 py-3.5 text-base font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}

        <div className="border-border/60 mt-4 border-t pt-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
              Entrar
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
