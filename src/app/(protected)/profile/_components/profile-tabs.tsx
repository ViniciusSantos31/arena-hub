"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubscriptionPayment } from "@/lib/stripe-billing/list-subscription-invoices";
import type { AccountDeletionImpact } from "@/lib/user-account/delete-user-account";
import type { SubscriptionSummary } from "@/lib/user-plan/subscription-summary";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2Icon,
  CircleDotIcon,
  CreditCardIcon,
  SendIcon,
  SettingsIcon,
  SwordsIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { AccountSettingsForm } from "./account-settings-form";
import { PendingInvitesList } from "./pending-invites-list";
import { PrivateProfileHeader } from "./private-profile-header";
import { SecuritySection } from "./security-section";
import { SubscriptionSection } from "./subscription-section";

const tabTriggerClass =
  "group relative w-fit cursor-pointer max-w-fit rounded-none border-0 border-b-2 border-transparent px-4 text-center data-[state=active]:bg-background data-[state=active]:text-primary dark:data-[state=active]:bg-background";

type ProfileTab = "profile" | "subscription" | "invites" | "settings";

const TAB_ORDER: ProfileTab[] = [
  "profile",
  "subscription",
  "invites",
  "settings",
];

type ProfileData = {
  profile: {
    bio: string | null;
    location: string | null;
    lookingForGroup: boolean;
  };
  stats: {
    matches: number;
    groups: number;
  };
  recentMatches: {
    id: string;
    group: string;
    date: string;
    confirmed: boolean;
  }[];
  linkedAccounts: {
    id: string;
    providerId: string;
    createdAt: string;
  }[];
};

type ProfileTabsProps = {
  defaultTab: ProfileTab;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  profileData?: ProfileData;
  pendingInvites: React.ComponentProps<typeof PendingInvitesList>["invites"];
  subscriptionSummary: SubscriptionSummary | null;
  subscriptionPayments: SubscriptionPayment[];
  deletionImpact: AccountDeletionImpact;
};

function AnimatedTabTrigger({
  value,
  activeTab,
  className,
  children,
}: {
  value: ProfileTab;
  activeTab: ProfileTab;
  className?: string;
  children: React.ReactNode;
}) {
  const isActive = activeTab === value;

  return (
    <TabsTrigger value={value} id={`tab-${value}`} className={className}>
      {isActive && (
        <motion.span
          layoutId="profile-tab-indicator"
          className="bg-primary absolute right-0 bottom-0 left-0 h-0.5"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      {children}
    </TabsTrigger>
  );
}

export function ProfileTabs({
  defaultTab,
  user,
  profileData,
  pendingInvites,
  subscriptionSummary,
  subscriptionPayments,
  deletionImpact,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(defaultTab);
  const [direction, setDirection] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const contentTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeInOut" as const };

  const slideOffset = 32;

  const contentVariants = shouldReduceMotion
    ? {
        enter: { opacity: 1, x: 0 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 1, x: 0 },
      }
    : {
        enter: (slideDirection: number) => ({
          opacity: 0,
          x: slideDirection > 0 ? slideOffset : -slideOffset,
        }),
        center: { opacity: 1, x: 0 },
        exit: (slideDirection: number) => ({
          opacity: 0,
          x: slideDirection > 0 ? -slideOffset : slideOffset,
        }),
      };

  function handleTabChange(value: string) {
    const newTab = value as ProfileTab;
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);

    if (newIndex !== currentIndex) {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }

    setActiveTab(newTab);
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-col gap-0 overflow-x-hidden"
    >
      <TabsList className="bg-background sticky top-0 z-10 min-h-12 w-full justify-start rounded-none border-b p-0">
        <AnimatedTabTrigger
          value="profile"
          activeTab={activeTab}
          className={tabTriggerClass}
        >
          <UserIcon className="h-3.5 w-3.5" />
          <span
            className={cn(
              "hidden items-center gap-1.5 sm:flex",
              "group-data-[state=active]:flex",
            )}
          >
            Perfil
          </span>
        </AnimatedTabTrigger>
        <AnimatedTabTrigger
          value="subscription"
          activeTab={activeTab}
          className={tabTriggerClass}
        >
          <CreditCardIcon className="h-3.5 w-3.5" />
          <span
            className={cn(
              "hidden items-center gap-1.5 sm:flex",
              "group-data-[state=active]:flex",
            )}
          >
            Assinatura
          </span>
        </AnimatedTabTrigger>
        <AnimatedTabTrigger
          value="invites"
          activeTab={activeTab}
          className={tabTriggerClass}
        >
          <SendIcon className="h-3.5 w-3.5" />
          <span
            className={cn(
              "hidden items-center gap-1.5 sm:flex",
              "group-data-[state=active]:flex",
            )}
          >
            Convites
          </span>
          {pendingInvites.length > 0 && (
            <Badge className="h-4 min-w-4 rounded-full px-1 text-[10px]">
              {pendingInvites.length}
            </Badge>
          )}
        </AnimatedTabTrigger>
        <AnimatedTabTrigger
          value="settings"
          activeTab={activeTab}
          className={tabTriggerClass}
        >
          <SettingsIcon className="h-3.5 w-3.5" />
          <span
            className={cn(
              "hidden items-center gap-1.5 sm:flex",
              "group-data-[state=active]:flex",
            )}
          >
            Configurações
          </span>
        </AnimatedTabTrigger>
      </TabsList>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          custom={direction}
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={contentTransition}
        >
          {activeTab === "profile" && (
            <div className="space-y-5 px-4 py-5">
              <PrivateProfileHeader
                user={user}
                bio={profileData?.profile.bio}
                location={profileData?.profile.location}
                lookingForGroup={profileData?.profile.lookingForGroup}
                stats={profileData?.stats}
              />

              <Separator />

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <SwordsIcon className="text-muted-foreground h-4 w-4" />
                  Atividade recente
                </h3>

                {profileData?.recentMatches &&
                profileData.recentMatches.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.recentMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center gap-3 rounded-xl border p-3"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            match.confirmed ? "bg-green-500/10" : "bg-muted"
                          }`}
                        >
                          {match.confirmed ? (
                            <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <CircleDotIcon className="text-muted-foreground h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {match.group}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {match.date}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            match.confirmed
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {match.confirmed ? "Confirmado" : "Na fila"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground rounded-xl border border-dashed py-8 text-center text-sm">
                    Nenhuma partida registrada ainda.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "invites" && (
            <div className="space-y-4 px-4 py-5">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">Convites pendentes</h2>
                <p className="text-muted-foreground text-sm">
                  Grupos que te convidaram para participar
                </p>
              </div>
              <PendingInvitesList invites={pendingInvites} />
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-6 px-4 py-5">
              {subscriptionSummary ? (
                <SubscriptionSection
                  summary={subscriptionSummary}
                  payments={subscriptionPayments}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Não foi possível carregar os dados da assinatura.
                </p>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 px-4 py-5">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">
                  Informações pessoais
                </h2>
                <p className="text-muted-foreground text-sm">
                  Atualize suas informações de perfil
                </p>
              </div>

              <AccountSettingsForm
                user={{
                  ...user,
                  bio: profileData?.profile.bio,
                  location: profileData?.profile.location,
                  lookingForGroup: profileData?.profile.lookingForGroup,
                }}
              />

              <Separator />

              <SecuritySection
                user={user}
                linkedAccounts={profileData?.linkedAccounts ?? []}
                deletionImpact={deletionImpact}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
}
