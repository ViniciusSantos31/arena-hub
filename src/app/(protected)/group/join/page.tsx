"use client";

import { getOrganizationByCode } from "@/actions/group/get-org-by-code";
import { joinGroupByCode } from "@/actions/group/join";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const GroupPreviewLoading = () => {
  return (
    <section className="flex w-full animate-pulse flex-col items-center justify-center space-y-2 rounded-xl border px-2">
      <div className="flex w-full items-center">
        <div className="border-border bg-accent relative flex aspect-square h-11 w-11 flex-1 animate-pulse overflow-clip rounded-lg border" />

        <div className="from-background inset-0 bottom-0 flex h-full w-full flex-col justify-end gap-1 bg-linear-to-t via-transparent to-transparent p-2">
          <span className="bg-accent max-w-1/2 rounded-md text-xs text-nowrap text-transparent select-none md:text-sm">
            Nome do grupo
          </span>
          <span className="bg-accent max-w-2/3 rounded-md text-xs text-nowrap text-transparent select-none md:text-sm">
            0 participantes
          </span>
        </div>
        <Button
          variant={"default"}
          className="bg-accent pointer-events-none w-fit animate-pulse text-transparent"
        >
          Entrar
        </Button>
      </div>
    </section>
  );
};

const GroupPreview = ({
  name,
  participants,
  code,
  isAlreadyMember = false,
}: {
  name: string;
  participants: number;
  code: string;
  isAlreadyMember: boolean;
}) => {
  const router = useRouter();

  const joinGroupAction = useAction(joinGroupByCode, {
    onSuccess: () => {
      toast.success(`Você entrou no grupo ${name} com sucesso!`);
      router.replace(`/group/${code}/members`);
    },
  });

  const handleJoinGroup = async (code: string) => {
    if (code.length < 6) return;

    await joinGroupAction.executeAsync({ code });
  };

  return (
    <section className="flex w-full flex-col items-center justify-center space-y-2 rounded-xl border px-2">
      <div className="flex w-full items-center">
        <div className="border-border bg-accent relative flex aspect-square h-11 w-11 flex-1 overflow-clip rounded-lg border" />

        <div className="from-background inset-0 bottom-0 flex h-full w-full flex-col justify-end bg-linear-to-t via-transparent to-transparent p-2">
          <span className="text-foreground line-clamp-2 text-sm font-bold md:text-base">
            {name}
          </span>
          <span className="text-muted-foreground text-xs md:text-sm">
            {isAlreadyMember
              ? "Você já é membro"
              : `${participants} participantes`}
          </span>
        </div>
        {isAlreadyMember ? (
          <Button variant={"default"} className="w-fit" asChild>
            <Link href={`/group/${code}/members`}>Ver grupo</Link>
          </Button>
        ) : (
          <Button
            onClick={() => handleJoinGroup(code)}
            variant={"default"}
            className="w-fit"
            disabled={joinGroupAction.isExecuting || joinGroupAction.isPending}
          >
            Entrar
          </Button>
        )}
      </div>
    </section>
  );
};

export default function JoinGroupPage() {
  const { mutate, data, isPending } = useMutation({
    mutationKey: ["join", "group"],
    mutationFn: async (code: string) =>
      await getOrganizationByCode({
        code: code.toUpperCase(),
      }),
  });

  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <div className="border-border flex w-full max-w-lg flex-col items-center space-y-3 rounded-lg border p-8">
        <span>Digite o código de convite do grupo</span>
        <div className="flex w-full items-center justify-center">
          <InputOTP
            maxLength={6}
            containerClassName="w-full flex-1"
            autoFocus
            onChange={(value) => {
              if (value.length === 6) {
                mutate(value);
                return;
              }
            }}
          >
            <InputOTPGroup className="flex w-full">
              <InputOTPSlot index={0} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={1} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={2} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={3} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={4} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={5} className="aspect-square w-full flex-1" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <section>
          <Alert>
            <InfoIcon />
            <AlertTitle>Não tem um código?</AlertTitle>
            <AlertDescription className="line-clamp-2">
              Solicite ao administrador do grupo para gerar um código de convite
            </AlertDescription>
          </Alert>
        </section>
        {isPending && <GroupPreviewLoading />}
        {data?.data && !isPending && (
          <GroupPreview
            name={data.data.name}
            participants={12}
            code={data.data.code}
            isAlreadyMember={data.data.isAlreadyMember}
          />
        )}

        <section className="flex w-full flex-col items-center space-y-1">
          <div className="text-muted-foreground inline-flex w-full items-center justify-center gap-2 text-sm">
            <Separator className="flex-1" /> ou <Separator className="flex-1" />
          </div>
          <div className="flex w-full max-w-md flex-col justify-center gap-1">
            <Button variant={"outline"}>Encontre grupos</Button>
            <Button variant={"link"} className="w-fit self-center px-0">
              Crie um novo grupo
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
