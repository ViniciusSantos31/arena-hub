import {
  ResponsiveDialog,
  ResponsiveDialogBaseProps,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";

type FeatureKey = "unlimited_groups" | "join_groups";

type Feature = {
  name: string;
  description: string;
  message: string;
};

const features: Record<FeatureKey, Feature> = {
  unlimited_groups: {
    name: "Limite de grupos",
    description: "A plataforma está em fase de testes",
    message:
      "No momento, a plataforma suporta até 2 grupos por usuário. Isso se deve à nossa infraestrutura ainda estar em desenvolvimento e a plataforma estar em fase de testes. Agradecemos sua compreensão e em breve liberaremos mais espaço para grupo.",
  },
  join_groups: {
    name: "Limites de grupos",
    description: "A plataforma está em fase de testes",
    message:
      "No momento, a plataforma suporta até 2 grupos por usuário. Isso se deve à nossa infraestrutura ainda estar em desenvolvimento e a plataforma estar em fase de testes. Agradecemos sua compreensão e em breve liberaremos mais espaço para grupo.",
  },
};

type UpgradePlanDialogProps = {
  feature?: FeatureKey;
} & ResponsiveDialogBaseProps;

export const UpgradePlanDialog = ({
  open,
  onOpenChange,
  feature = "unlimited_groups",
  ...props
}: UpgradePlanDialogProps) => {
  const featureData = features[feature];
  return (
    <ResponsiveDialog
      title={featureData.name}
      open={open}
      onOpenChange={onOpenChange}
      description={featureData.description}
      showCloseButton={false}
      content={
        <div className="space-y-4">
          <p className="text-sm">{featureData.message}</p>
          <div className="space-y-3 rounded-lg border border-amber-200/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="space-y-0">
                <h3 className="font-semibold">Plataforma em Desenvolvimento</h3>
                <p className="text-muted-foreground text-sm">
                  Esta é uma versão beta. Obrigado por testar conosco!
                </p>
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
          >
            Entendi
          </Button>
        </div>
      }
      {...props}
    />
  );
};
