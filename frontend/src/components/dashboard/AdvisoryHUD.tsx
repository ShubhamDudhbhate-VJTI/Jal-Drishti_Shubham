import { useDashboard } from "@/context/DashboardContext";
import { useLanguage } from "@/context/LanguageContext";
import { AlertTriangle, CheckCircle, Info, ShieldAlert, Megaphone } from "lucide-react";

const hudConfig = {
  low: { icon: CheckCircle, borderColor: "border-emerald-500/40", bgColor: "bg-gradient-to-r from-emerald-500/10 to-emerald-600/5", textColor: "text-emerald-300", emoji: "✅" },
  moderate: { icon: Info, borderColor: "border-amber-500/40", bgColor: "bg-gradient-to-r from-amber-500/10 to-amber-600/5", textColor: "text-amber-300", emoji: "⚠️" },
  high: { icon: AlertTriangle, borderColor: "border-orange-500/40", bgColor: "bg-gradient-to-r from-orange-500/10 to-orange-600/5", textColor: "text-orange-300", emoji: "🔶" },
  severe: { icon: ShieldAlert, borderColor: "border-red-500/40", bgColor: "bg-gradient-to-r from-red-500/10 to-red-600/5", textColor: "text-red-300", emoji: "🚨" },
};

export function AdvisoryHUD() {
  const { predictionData, selectedRegion } = useDashboard();
  const { t } = useLanguage();

  if (!selectedRegion || !predictionData) {
    return (
      <div className="glass rounded-xl px-5 py-3.5 flex items-center gap-3 border border-border/20">
        <div className="p-1.5 rounded-lg bg-blue-500/10">
          <Megaphone className="h-4 w-4 text-blue-400" />
        </div>
        <p className="text-sm text-muted-foreground">
          👋 {t("advisoryUpdatesAfterSelect")}
        </p>
      </div>
    );
  }

  const config = hudConfig[predictionData.riskLevel];
  const Icon = config.icon;
  const isSevere = predictionData.riskLevel === "severe" || predictionData.riskLevel === "high";

  return (
    <div className={`rounded-xl px-5 py-3.5 flex items-center gap-3 border ${config.borderColor} ${config.bgColor} ${isSevere ? "animate-pulse-slow" : ""}`}>
      <div className="p-1.5 rounded-lg bg-white/5">
        <Icon className={`h-5 w-5 shrink-0 ${config.textColor}`} />
      </div>
      <p className={`text-sm font-medium ${config.textColor} flex-1`}>
        {config.emoji} {predictionData.advisory}
      </p>
      <span className="text-xs text-muted-foreground whitespace-nowrap px-2 py-1 rounded-full bg-secondary/30">
        📍 {selectedRegion.name}
      </span>
    </div>
  );
}
