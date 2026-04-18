import { AlertCircle, TrendingUp, Calendar, Info, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/context/DashboardContext";
import { useLanguage } from "@/context/LanguageContext";
import type { MessageKey } from "@/i18n/translations";

export function MonthlyInsightCard() {
  const { monthlyData, isLoadingMonthly, selectedMonth, selectedYear } = useDashboard();
  const { t } = useLanguage();

  if (!selectedMonth || !selectedYear) {
    return (
      <div className="glass rounded-xl p-5 flex items-center justify-center min-h-[140px]">
        <div className="text-center">
          <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">{t("selectMonthYearInsight")}</p>
        </div>
      </div>
    );
  }

  if (isLoadingMonthly) {
    return (
      <div className="glass rounded-xl p-5 space-y-3 min-h-[140px]">
        <Skeleton className="h-4 w-32 bg-secondary" />
        <Skeleton className="h-4 w-full bg-secondary" />
        <Skeleton className="h-4 w-3/4 bg-secondary" />
      </div>
    );
  }

  if (!monthlyData) {
    return (
      <div className="glass rounded-xl p-5 flex items-center justify-center min-h-[140px]">
        <div className="text-center">
          <Droplets className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">{t("noDataForPeriod")}</p>
        </div>
      </div>
    );
  }

  const monthName = t(`month_${selectedMonth}` as MessageKey);

  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-400" />
        {t("monthlyInsights")}: {monthName} {selectedYear}
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] text-muted-foreground">{t("expectedDepth")}</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {monthlyData.exact_depth.toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">ft</span>
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-lg border border-emerald-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground">{t("monthlyChange")}</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {monthlyData.monthly_change_rate > 0 ? '+' : ''}
            {monthlyData.monthly_change_rate.toFixed(3)}
            <span className="text-xs font-normal text-muted-foreground ml-1">ft/mo</span>
          </p>
        </div>
      </div>

      {/* Insights */}
      {monthlyData.pointwise_insights.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-medium text-foreground uppercase tracking-wider">{t("analysisRecommendations")}</span>
          </div>
          {monthlyData.pointwise_insights.slice(0, 3).map((insight, index) => (
            <div 
              key={index} 
              className={`text-xs p-2 rounded-lg border ${
                insight.includes('⚠️') 
                  ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                  : 'bg-secondary/30 border-border/20 text-muted-foreground'
              }`}
            >
              {insight}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
