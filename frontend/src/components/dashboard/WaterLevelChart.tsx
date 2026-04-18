import { useEffect, useMemo, useState } from "react";
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, ReferenceLine, ReferenceDot,
} from "recharts";
import { Droplets } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { fetchAllMonthlyForYear, type MonthlyPredictionResult } from "@/data/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { monthShortLabels } from "@/i18n/helpers";
import { Skeleton } from "@/components/ui/skeleton";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Record<string, unknown> }[];
}) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as {
    isMonthly?: boolean;
    label?: string;
    year?: number;
    depth?: number;
    predicted?: boolean;
    upperCI?: number;
    lowerCI?: number;
  };
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl border border-border/30">
      <p className="font-semibold text-foreground mb-1">
        {point.isMonthly
          ? `${point.label} ${point.year}`
          : `${t("yearLabel")}: ${point.year}`}
      </p>
      <p className="text-cyan-glow">
        {t("depthFt")}: <span className="font-mono font-bold">{point?.depth?.toFixed(2)} ft</span>
      </p>
      {point?.predicted && point?.upperCI != null && (
        <p className="text-muted-foreground mt-0.5">
          {t("confidenceInterval")}: {point.lowerCI?.toFixed(2)} – {point.upperCI?.toFixed(2)} ft
        </p>
      )}
      {point?.predicted && (
        <span className="inline-block mt-1 text-neon-green text-[10px] font-medium uppercase tracking-wider">
          {t("predicted")}
        </span>
      )}
      {point?.isMonthly && !point?.predicted && (
        <span className="inline-block mt-1 text-cyan-glow text-[10px] font-medium uppercase tracking-wider">
          {t("currentYear")}
        </span>
      )}
    </div>
  );
}

export function WaterLevelChart() {
  const { 
    predictionData, 
    isLoading, 
    selectedRegion, 
    selectedMonth, 
    selectedYear, 
    monthlyData 
  } = useDashboard();
  const { t, locale } = useLanguage();

  const sourceMeta = useMemo(() => {
    const annualSource = predictionData?.dataSource;
    const monthlySource = monthlyData?.dataSource;

    const labelFor = (src?: string) => {
      if (src === "backend") return "Live API";
      if (src === "stored-rf") return "Stored RF";
      if (src === "on-demand-rf") return "On-demand RF";
      if (src === "fallback-api") return "Fallback API";
      if (src === "fallback-mock") return "Simulated";
      return "—";
    };

    const toneFor = (src?: string) => {
      if (src === "backend" || src === "stored-rf" || src === "on-demand-rf") {
        return "border-emerald-500/40 text-emerald-300 bg-emerald-500/10";
      }
      return "border-amber-500/40 text-amber-300 bg-amber-500/10";
    };

    return {
      annualLabel: labelFor(annualSource),
      annualTone: toneFor(annualSource),
      monthlyLabel: labelFor(monthlySource),
      monthlyTone: toneFor(monthlySource),
      showMonthly: !!(selectedMonth && selectedYear && monthlyData),
    };
  }, [predictionData, monthlyData, selectedMonth, selectedYear]);

  // Next-year (12 months) forecast from the backend ML model.
  const [nextYearMonthly, setNextYearMonthly] = useState<MonthlyPredictionResult[] | null>(null);

  const chartData = useMemo(() => {
    if (!predictionData) {
      console.log("[WaterLevelChart] ⏳ No predictionData yet");
      return [];
    }
    console.log("[WaterLevelChart] 📊 Building chart from predictionData:", {
      historicalCount: predictionData.historicalData?.length,
      predictedCount: predictionData.predictedData?.length,
      dataSource: predictionData.dataSource,
    });

    const monthlyLabels = monthShortLabels(t);

    // ── Historical yearly data (2014-2023 from groundwater_cleaned_final) ──
    const historicalYearly = predictionData.historicalData
      .slice()
      .sort((a, b) => a.year - b.year)
      .map((d) => ({
        year: d.year,
        label: d.year.toString(),
        depth: d.depth,
        historicalDepth: d.depth,
        predictedDepth: undefined as number | undefined,
        upperCI: undefined as number | undefined,
        lowerCI: undefined as number | undefined,
        isMonthly: false,
        predicted: false,
      }));

    // ── 2024 as "current year" point ──
    // Average the 4 seasonal predictions for 2024 to create a single yearly point
    const preds2024 = predictionData.predictedData.filter((d) => d.year === 2024);
    if (preds2024.length > 0) {
      const avgDepth2024 = preds2024.reduce((sum, d) => sum + d.depth, 0) / preds2024.length;
      historicalYearly.push({
        year: 2024,
        label: "2024",
        depth: Math.round(avgDepth2024 * 100) / 100,
        historicalDepth: Math.round(avgDepth2024 * 100) / 100,
        predictedDepth: undefined,
        upperCI: undefined,
        lowerCI: undefined,
        isMonthly: false,
        predicted: false,
      });
    }

    // ── 2025 monthly predictions (12 months, interpolated from 4 seasonal anchors) ──
    const PREDICTION_YEAR = 2025;
    const predictedMonthly = nextYearMonthly
      ? monthlyLabels.map((monthLabel, idx) => {
          const m = nextYearMonthly[idx];
          const depth = m?.exact_depth;
          return {
            year: PREDICTION_YEAR,
            label: monthLabel,
            depth,
            historicalDepth: undefined as number | undefined,
            predictedDepth: depth,
            upperCI: undefined as number | undefined,
            lowerCI: undefined as number | undefined,
            isMonthly: true,
            predicted: true,
          };
        })
      : [];

    const allData = [...historicalYearly, ...predictedMonthly];

    console.log("[WaterLevelChart] ✅ chartData built:", {
      totalPoints: allData.length,
      historicalYearly: historicalYearly.length,
      predictedMonthly: predictedMonthly.length,
      yearRange: `${historicalYearly[0]?.year}–${historicalYearly[historicalYearly.length - 1]?.year} → ${PREDICTION_YEAR} monthly`,
    });

    return allData;
  }, [predictionData, locale, t, nextYearMonthly]);

  // Calculate monthly highlight position
  const monthlyHighlight = useMemo(() => {
    if (!selectedMonth || !selectedYear || !monthlyData) return null;
    
    const inferredMonthLabels = monthShortLabels(t);
    const monthLabel = inferredMonthLabels[selectedMonth - 1];
    const match = chartData.find((d) => d.year === selectedYear && d.label === monthLabel);
    if (!match) return null;
    
    return {
      x: monthLabel,
      y: monthlyData.exact_depth,
      depth: monthlyData.exact_depth,
    };
  }, [selectedMonth, selectedYear, monthlyData, chartData, t]);

  // Load 2025 monthly forecast when region changes / after annual prediction loads.
  // Single API call → interpolate all 12 months locally.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!selectedRegion || !predictionData) return;

      const PREDICTION_YEAR = 2025;

      try {
        setNextYearMonthly(null);
        const results = await fetchAllMonthlyForYear(selectedRegion.name, PREDICTION_YEAR);
        if (cancelled) return;
        console.log("[WaterLevelChart] 📈 2025 monthly forecast loaded:", results.length, "months");
        setNextYearMonthly(results);
      } catch {
        if (cancelled) return;
        setNextYearMonthly([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedRegion, predictionData]);

  // Show loading state while fetching data
  if (isLoading && !predictionData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-glow mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading groundwater data...</p>
        </div>
      </div>
    );
  }

  if (!selectedRegion) {
    return (
      <div className="flex items-center justify-center h-full glass rounded-xl">
        <div className="text-center py-8">
          <Droplets className="h-10 w-10 text-cyan-glow mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-base">{t("selectRegionToBegin")}</p>
          <p className="text-muted-foreground/60 text-sm mt-1">{t("chooseFromSidebar")}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 h-full flex flex-col gap-4">
        <Skeleton className="h-6 w-48 bg-secondary" />
        <Skeleton className="flex-1 bg-secondary/50 rounded-lg" />
      </div>
    );
  }
  // The reference line marks the boundary between historical (up to 2024) and predicted (2025)
  const referenceLineX = "2024";

  return (
    <div className="glass rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("groundwaterDepthAnalysis")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">📍 {selectedRegion.name} • {selectedRegion.district}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
            {t("legendHistoricalYearly")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" style={{ border: '2px dashed hsl(145,100%,50%)' }} />
            {t("legendPredictedMonthly")}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145,100%,50%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(145,100%,50%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(222,30%,25%,0.3)" />
            <XAxis
              dataKey="label"
              stroke="hsla(215,20%,55%,0.6)"
              tick={{ fontSize: 11, fill: "hsla(215,20%,55%,0.8)" }}
              axisLine={{ stroke: "hsla(222,30%,25%,0.4)" }}
            />
            <YAxis
              stroke="hsla(215,20%,55%,0.6)"
              tick={{ fontSize: 11, fill: "hsla(215,20%,55%,0.8)" }}
              axisLine={{ stroke: "hsla(222,30%,25%,0.4)" }}
              label={{ value: `${t("depthFt")} (ft)`, angle: -90, position: "insideLeft", style: { fill: "hsla(215,20%,55%,0.6)", fontSize: 11 } }}
              reversed
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              x={referenceLineX}
              stroke="hsla(170,100%,33%,0.5)"
              strokeDasharray="4 4"
              label={{ value: t("currentYearAxis"), position: "top", fill: "hsla(170,100%,33%,0.7)", fontSize: 11 }}
            />
            {/* Confidence interval area */}
            <Area
              dataKey="upperCI"
              stroke="none"
              fill="url(#ciGradient)"
              fillOpacity={1}
              connectNulls={false}
            />
            <Area
              dataKey="lowerCI"
              stroke="none"
              fill="hsl(var(--background))"
              fillOpacity={1}
              connectNulls={false}
            />
            {/* Historical line */}
            <Line
              dataKey="historicalDepth"
              stroke="hsl(185,100%,50%)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "hsl(185,100%,50%)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "hsl(185,100%,50%)", stroke: "hsl(185,100%,70%)", strokeWidth: 2 }}
              connectNulls={false}
            />
            {/* Predicted line */}
            <Line
              dataKey="predictedDepth"
              stroke="hsl(145,100%,50%)"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: "hsl(145,100%,50%)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "hsl(145,100%,50%)", stroke: "hsl(145,100%,70%)", strokeWidth: 2 }}
              connectNulls={false}
            />
            
            {/* Monthly highlight dot */}
            {monthlyHighlight && (
              <ReferenceDot
                x={monthlyHighlight.x}
                y={monthlyHighlight.y}
                r={8}
                fill="hsl(340,100%,50%)"
                stroke="hsl(340,100%,70%)"
                strokeWidth={3}
                className="animate-pulse"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
