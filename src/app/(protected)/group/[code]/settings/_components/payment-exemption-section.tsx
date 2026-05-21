"use client";

import {
  listPaymentExemptions,
  syncPaymentExemptions,
} from "@/actions/group/payment-exemptions";
import { listMembers } from "@/actions/member/list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/react-query";
import { getRoleLabel, type Role } from "@/utils/role";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2Icon, PencilLineIcon, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SettingsSection } from "./settings-section";

interface PaymentExemptionSectionProps {
  id: string;
  group: { id: string; code: string };
}

const ALL_ROLES: Role[] = ["guest", "member", "admin", "owner"];

export function PaymentExemptionSection({
  id,
  group,
}: PaymentExemptionSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [draftMemberIds, setDraftMemberIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [draftRoles, setDraftRoles] = useState<Set<Role>>(() => new Set());

  const exemptionsQuery = useQuery({
    queryKey: ["payment-exemptions", group.code],
    queryFn: async () => {
      const res = await listPaymentExemptions({
        organizationCode: group.code,
      });
      if (res?.serverError != null) {
        throw new Error(String(res.serverError));
      }
      if (res?.data == null) {
        throw new Error("Não foi possível carregar isenções.");
      }
      return res.data;
    },
  });

  const membersQuery = useQuery({
    queryKey: ["members-for-exemption", group.code],
    queryFn: async () => {
      const res = await listMembers({ organizationCode: group.code });
      if (res?.serverError != null) {
        throw new Error(String(res.serverError));
      }
      if (res?.data == null) {
        throw new Error("Não foi possível carregar membros.");
      }
      return res.data;
    },
  });

  const memberExemptCount = useMemo(
    () =>
      (exemptionsQuery.data ?? []).filter(
        (e) => e.kind === "member" && e.memberId,
      ).length,
    [exemptionsQuery.data],
  );

  const roleExemptCount = useMemo(
    () =>
      (exemptionsQuery.data ?? []).filter((e) => e.kind === "role" && e.role)
        .length,
    [exemptionsQuery.data],
  );

  useEffect(() => {
    if (!modalOpen || !exemptionsQuery.data) return;
    const m = new Set<string>();
    const r = new Set<Role>();
    for (const row of exemptionsQuery.data) {
      if (row.kind === "member" && row.memberId) {
        m.add(row.memberId);
      } else if (row.kind === "role" && row.role) {
        r.add(row.role);
      }
    }
    setDraftMemberIds(m);
    setDraftRoles(r);
    setMemberQuery("");
  }, [modalOpen, exemptionsQuery.data]);

  const filteredMembers = useMemo(() => {
    const list = membersQuery.data ?? [];
    const q = memberQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) => {
      const name = (m.name ?? "").toLowerCase();
      const email = (m.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [membersQuery.data, memberQuery]);

  const toggleMember = useCallback((memberId: string, checked: boolean) => {
    setDraftMemberIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(memberId);
      else next.delete(memberId);
      return next;
    });
  }, []);

  const toggleRole = useCallback((role: Role, checked: boolean) => {
    setDraftRoles((prev) => {
      const next = new Set(prev);
      if (checked) next.add(role);
      else next.delete(role);
      return next;
    });
  }, []);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["payment-exemptions", group.code],
    });
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await syncPaymentExemptions({
        organizationCode: group.code,
        memberIds: [...draftMemberIds],
        roles: [...draftRoles],
      });
      if (res?.serverError != null) {
        throw new Error(String(res.serverError));
      }
    },
    onSuccess: () => {
      toast.success("Isenções atualizadas.");
      invalidate();
      setModalOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const loadingMain = exemptionsQuery.isLoading;
  const loadingModalData =
    modalOpen && (membersQuery.isLoading || exemptionsQuery.isLoading);

  return (
    <SettingsSection
      id={id}
      title="Isenção de pagamento"
      description="Quem está isento não paga inscrição em partidas marcadas como pagas."
      action={
        <Badge variant="outline" className="font-normal">
          Partidas pagas
        </Badge>
      }
    >
      <div className="flex flex-col gap-4">
        {loadingMain ? (
          <div className="flex justify-center py-10">
            <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
          </div>
        ) : (
          <div className="border-border/60 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Membros isentos
                </p>
                <p className="text-foreground mt-1 text-2xl font-semibold tabular-nums">
                  {memberExemptCount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Papéis isentos
                </p>
                <p className="text-foreground mt-1 text-2xl font-semibold tabular-nums">
                  {roleExemptCount}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 gap-2"
              onClick={() => setModalOpen(true)}
            >
              <PencilLineIcon className="size-4" />
              Editar isenções
            </Button>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(85vh,640px)] max-w-[calc(100%-2rem)] flex-col gap-0 p-0 sm:max-w-md"
        >
          <DialogHeader className="space-y-1 border-b px-6 py-4 text-left">
            <DialogTitle>Editar isenções</DialogTitle>
            <DialogDescription>
              Marque os membros e os papéis que não pagam inscrição em partidas
              pagas. As alterações substituem a configuração anterior ao salvar.
            </DialogDescription>
          </DialogHeader>

          {loadingModalData ? (
            <div className="flex justify-center py-16">
              <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="members" className="flex flex-1 flex-col gap-0">
              <div className="px-6 pt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="members">Membros</TabsTrigger>
                  <TabsTrigger value="roles">Papéis</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="members"
                className="mt-0 flex flex-1 flex-col gap-0 overflow-hidden px-6 pb-2 data-[state=inactive]:hidden"
              >
                <div className="relative py-3">
                  <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Buscar por nome ou e-mail…"
                    className="bg-muted/30 pl-9"
                    autoComplete="off"
                  />
                </div>
                <div className="max-h-[min(40vh,280px)] space-y-1 overflow-y-auto overscroll-contain pr-1 pb-2">
                  {filteredMembers.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                      Nenhum membro encontrado.
                    </p>
                  ) : (
                    filteredMembers.map((m) => (
                      <label
                        key={m.id}
                        htmlFor={`exempt-m-${m.id}`}
                        className="hover:bg-muted/60 has-data-[state=checked]:border-primary/25 has-data-[state=checked]:bg-primary/10 flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-2.5"
                      >
                        <Checkbox
                          id={`exempt-m-${m.id}`}
                          checked={draftMemberIds.has(m.id)}
                          onCheckedChange={(v) =>
                            toggleMember(m.id, v === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm leading-tight font-medium">
                            {m.name || "Sem nome"}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {m.email || m.id}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="roles"
                className="mt-0 flex flex-1 flex-col gap-0 overflow-hidden px-6 pb-2 data-[state=inactive]:hidden"
              >
                <p className="text-muted-foreground py-3 text-xs">
                  Todos os usuários com o papel selecionado estarão isentos
                  (além dos membros marcados na outra aba).
                </p>
                <div className="max-h-[min(40vh,280px)] space-y-1 overflow-y-auto overscroll-contain pr-1 pb-2">
                  {ALL_ROLES.map((role) => (
                    <label
                      key={role}
                      htmlFor={`exempt-r-${role}`}
                      className="hover:bg-muted/60 has-data-[state=checked]:border-primary/25 has-data-[state=checked]:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2 py-2.5"
                    >
                      <Checkbox
                        id={`exempt-r-${role}`}
                        checked={draftRoles.has(role)}
                        onCheckedChange={(v) => toggleRole(role, v === true)}
                      />
                      <span className="text-sm font-medium">
                        {getRoleLabel(role)}
                      </span>
                    </label>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saveMut.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending || loadingModalData}
            >
              {saveMut.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
