import { useDashboard } from "@/context/DashboardContext";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp, Gauge, Calendar, Waves, ShieldCheck, ShieldAlert, AlertTriangle, XCircle } from "lucide-react";

const riskConfig = {
  low: { 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/30", 
    labelKey: "riskLow" as const,
    icon: ShieldCheck,
    gradient: "from-emerald-500/20 to-emerald-600/5",
    emoji: "✅",
    desc: "Safe water levels"
  },
  moderate: { 
    color: "text-amber-400", 
    bg: "bg-amber-500/10", 
    border: "border-amber-500/30", 
    labelKey: "riskModerate" as const,
    icon: AlertTriangle,
    gradient: "from-amber-500/20 to-amber-600/5",
    emoji: "⚠️",
    desc: "Monitor carefully"
  },
  high: { 
    color: "text-orange-400", 
    bg: "bg-orange-500/10", 
    border: "border-orange-500/30", 
    labelKey: "riskHigh" as const,
    icon: ShieldAlert,
    gradient: "from-orange-500/20 to-orange-600/5",
    emoji: "🔶",
    desc: "Take precaution"
  },
  severe: { 
    color: "text-red-400", 
    bg: "bg-red-500/10", 
    border: "border-red-500/30", 
    labelKey: "riskSevere" as const,
    icon: XCircle,
    gradient: "from-red-500/20 to-red-600/5",
    emoji: "🚨",
    desc: "Urgent action needed"
  },
};

export function RiskEngine() {
  const { predictionData, isLoading, selectedRegion } = useDashboard();
  const { t } = useLanguage();

  if (!selectedRegion) {
    return (
      <div className="glass rounded-xl p-6 flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <Gauge className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-muted-foreground text-xs">{t("selectRegionRiskAnalysis")}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !predictionData) {
    return (
      <div className="glass rounded-xl p-6 space-y-3">
        <Skeleton className="h-5 w-24 bg-secondary" />
        <Skeleton className="h-16 bg-secondary/50 rounded-lg" />
        <Skeleton className="h-12 bg-secondary/50 rounded-lg" />
        <Skeleton className="h-12 bg-secondary/50 rounded-lg" />
      </div>
    );
  }

  const risk = riskConfig[predictionData.riskLevel];
  const riskLabel = t(risk.labelKey);
  const rate = predictionData.annualChangeRate;
  const isDecline = rate > 0;
  const RiskIcon = risk.icon;

  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("riskEngine")}</h3>

      {/* Risk Badge — Big and clear */}
      <div className={`rounded-xl p-4 border ${risk.border} bg-gradient-to-br ${risk.gradient} flex items-center gap-4`}>
        <RiskIcon className={`h-10 w-10 ${risk.color} shrink-0`} />
        <div>
          <p className={`text-lg font-bold ${risk.color}`}>{risk.emoji} {riskLabel}</p>
          <p className="text-xs text-muted-foreground">{risk.desc}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Stat
          icon={<Waves className="h-3.5 w-3.5 text-cyan-400" />}
          label={t("currentDepth")}
          value={`${predictionData.currentDepth.toFixed(1)} ft`}
        />
        <Stat
          icon={isDecline ? <TrendingDown className="h-3.5 w-3.5 text-red-400" /> : <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
          label={t("annualChange")}
          value={`${isDecline ? "↓" : "↑"} ${Math.abs(rate).toFixed(2)} ft/yr`}
        />
        <Stat
          icon={<Gauge className="h-3.5 w-3.5 text-blue-400" />}
          label={t("modelAccuracy")}
          value={`${(predictionData.rSquared * 100).toFixed(1)}%`}
        />
        <Stat
          icon={<Calendar className="h-3.5 w-3.5 text-purple-400" />}
          label={t("predictionHorizon")}
          value={t("eightYears")}
        />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/10">
      <div className="flex items-center gap-1.5 mb-0.5">{icon}<span className="text-[10px] text-muted-foreground">{label}</span></div>
      <p className="text-sm font-semibold font-mono text-foreground">{value}</p>
    </div>
  );
}
