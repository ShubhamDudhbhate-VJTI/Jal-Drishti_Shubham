export interface Village {
  id: string;
  name: string;
}

export interface SubDistrict {
  id: string;
  name: string;
  villages: Village[];
}

export interface District {
  id: string;
  name: string;
  subDistricts: SubDistrict[];
}

export interface Region {
  id: string;
  name: string;       // village name
  village: string;
  subDistrict: string;
  district: string;
  state: string;
}

export interface WaterDataPoint {
  year: number;
  depth: number;
  predicted?: boolean;
  upperCI?: number;
  lowerCI?: number;
}

export interface PredictionResult {
  region: Region;
  historicalData: WaterDataPoint[];
  predictedData: WaterDataPoint[];
  rSquared: number;
  annualChangeRate: number;
  currentDepth: number;
  riskLevel: "low" | "moderate" | "high" | "severe";
  advisory: string;
  dataSource?: "backend" | "fallback-mock";
  rfMeta?: {
    modelRunId?: number;
    trainingSamples?: number;
    yearMin?: number;
    yearMax?: number;
    trainedAt?: string;
  };
}

export interface MonthlyPredictionResult {
  exact_depth: number;
  monthly_change_rate: number;
  pointwise_insights: string[];
  dataSource?: "backend" | "fallback-mock";
}

// ─── API Base URL ───────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ─── Season ↔ Month mapping ────────────────────────────────────────────────────
// The backend stores predictions for 4 seasons per year, keyed by season name.
// Each season corresponds to a calendar month anchor.
const SEASON_MONTH_MAP: Record<string, number> = {
  jan: 1,
  may: 5,
  aug: 8,
  nov: 11,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function riskFromAnnualChange(rate: number): PredictionResult["riskLevel"] {
  const absRate = Math.abs(rate);
  if (absRate < 0.3) return "low";
  if (absRate < 0.7) return "moderate";
  if (absRate < 1.2) return "high";
  return "severe";
}

function advisoryFromRisk(riskLevel: PredictionResult["riskLevel"], rate: number): string {
  const absRate = Math.abs(rate);
  switch (riskLevel) {
    case "low":
      return `Stable conditions: Annual change of ${rate.toFixed(2)} m/year within safe limits.`;
    case "moderate":
      return `Moderate Risk: Annual decline of ${absRate.toFixed(2)} m/year. Monitor extraction rates.`;
    case "high":
      return `High Risk: Annual decline of ${absRate.toFixed(1)} m/year. Immediate intervention recommended.`;
    case "severe":
      return `⚠️ Severe Risk: Annual decline of ${absRate.toFixed(1)} m/year detected. Critical depletion imminent.`;
  }
}

/**
 * Linear-interpolate a value between known anchor points.
 * `anchors` is a sorted array of { month, depth } for the 4 seasonal predictions.
 */
function interpolateMonth(month: number, anchors: { month: number; depth: number }[]): number {
  if (!anchors.length) return 0;
  // Before the first anchor → clamp
  if (month <= anchors[0].month) return anchors[0].depth;
  // After the last anchor → clamp
  if (month >= anchors[anchors.length - 1].month) return anchors[anchors.length - 1].depth;

  // Find the two surrounding anchors
  for (let i = 0; i < anchors.length - 1; i++) {
    if (month >= anchors[i].month && month <= anchors[i + 1].month) {
      const ratio = (month - anchors[i].month) / (anchors[i + 1].month - anchors[i].month);
      return anchors[i].depth + ratio * (anchors[i + 1].depth - anchors[i].depth);
    }
  }
  return anchors[anchors.length - 1].depth;
}



// ─── Main API Functions ─────────────────────────────────────────────────────────

import { GraphDataService, type GraphDataResponse } from "@/services/graphDataService";

/**
 * Fetch full region prediction data from the FastAPI backend.
 * Uses the new graph API.
 */
export async function fetchRegionData(region: Region): Promise<PredictionResult> {
  const villageName = region.name;
  console.log("[fetchRegionData] 🔄 Starting fetch for:", villageName, region);

  try {
    console.log("[fetchRegionData] 📡 Calling GraphDataService.getGraphData...");
    const graphData: GraphDataResponse = await GraphDataService.getGraphData(villageName);
    console.log("[fetchRegionData] ✅ GraphData received:", {
      village: graphData.village,
      totalPoints: graphData.graph_data?.length,
      riskAnalysis: graphData.risk_analysis,
      metadata: graphData.metadata,
    });

    // Convert graph data to the expected format
    const historicalData = graphData.graph_data
      .filter(point => point.type === 'historical')
      .map(point => ({
        year: point.year,
        depth: point.depth
      }));

    const predictedData = graphData.graph_data
      .filter(point => point.type === 'prediction')
      .map(point => ({
        year: point.year,
        depth: point.depth,
        predicted: true,
        lowerCI: point.confidence_low,
        upperCI: point.confidence_high
      }));

    console.log("[fetchRegionData] 📊 Parsed data:", {
      historicalPoints: historicalData.length,
      historicalYears: historicalData.map(d => d.year),
      historicalDepths: historicalData.map(d => d.depth),
      predictedPoints: predictedData.length,
      predictedYears: predictedData.map(d => d.year),
      predictedDepths: predictedData.map(d => d.depth),
    });

    // Extract risk data
    const riskLevel = (graphData.risk_analysis.risk_level?.toLowerCase() as PredictionResult["riskLevel"]) || "moderate";
    const currentDepth = graphData.risk_analysis.avg_actual_2024 || 0;
    const annualChangeRate = graphData.risk_analysis.avg_difference || 0;
    const advisory = advisoryFromRisk(riskLevel, annualChangeRate);

    console.log("[fetchRegionData] ⚠️ Risk:", { riskLevel, currentDepth, annualChangeRate });

    // If we got nothing at all, fall back to mock
    if (!historicalData.length && !predictedData.length) {
      console.warn("[fetchRegionData] ❌ No data points! Falling back to mock.");
      throw new Error("No data returned from backend");
    }

    // Compute derived stats
    const lastDepth = historicalData.length > 0 ? historicalData[historicalData.length - 1]?.depth : currentDepth;

    const result: PredictionResult = {
      region,
      historicalData,
      predictedData,
      currentDepth: lastDepth,
      riskLevel,
      advisory,
      rSquared: 0.8,
      annualChangeRate,
      dataSource: "backend",
    };
    console.log("[fetchRegionData] ✅ Final PredictionResult:", result);
    return result;
  } catch (err) {
    console.error("[fetchRegionData] ❌ Backend call failed:", err);
    throw err;
  }
}

/**
 * Fetch monthly drilldown data for a specific village, year, and month.
 *
 * The backend provides 4 seasonal predictions per year (Jan, May, Aug, Nov).
 * We fetch all seasonal predictions for the given year and linearly interpolate
 * to estimate the requested month.
 */
export async function fetchMonthlyData(
  villageName: string,
  year: number,
  month: number
): Promise<MonthlyPredictionResult> {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/predictions/${encodeURIComponent(villageName)}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const payload = await resp.json() as {
      predictions: Record<string, unknown>[];
    };

    const predictions = payload.predictions || [];

    // The depth field is named "predicted_2024" or "predicted_2025"
    const depthKey = `predicted_${year}`;

    // Build anchor points for the 4 seasons
    const anchors: { month: number; depth: number }[] = [];
    for (const pred of predictions) {
      const seasonName = (pred.season as string || "").toLowerCase();
      const anchorMonth = SEASON_MONTH_MAP[seasonName];
      const depth = pred[depthKey];

      if (anchorMonth != null && depth != null) {
        anchors.push({ month: anchorMonth, depth: Number(depth) });
      }
    }

    anchors.sort((a, b) => a.month - b.month);

    if (!anchors.length) {
      throw new Error(`No predictions for year ${year}`);
    }

    const exactDepth = interpolateMonth(month, anchors);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevDepth = interpolateMonth(prevMonth, anchors);
    const monthlyChange = exactDepth - prevDepth;

    const isExactSeason = anchors.some((a) => a.month === month);

    return {
      exact_depth: Math.round(exactDepth * 100) / 100,
      monthly_change_rate: Math.round(monthlyChange * 1000) / 1000,
      pointwise_insights: [
        isExactSeason
          ? `Seasonal prediction for month ${month}/${year}`
          : `Interpolated estimate for month ${month}/${year} from seasonal anchors`,
      ],
      dataSource: "backend",
    };
  } catch (err) {
    console.error(`[fetchMonthlyData] ❌ Failed for ${villageName} ${year}/${month}:`, err);
    throw err;
  }
}

/**
 * Fetch all 12 monthly predictions for a given year in a SINGLE API call.
 * Previously each month triggered its own fetch — this is 12× faster.
 *
 * API response format:
 *   predictions[]: { season: "Jan"|"May"|"Aug"|"Nov", predicted_2024: number, predicted_2025: number, ... }
 */
export async function fetchAllMonthlyForYear(
  villageName: string,
  year: number
): Promise<MonthlyPredictionResult[]> {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/predictions/${encodeURIComponent(villageName)}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const payload = await resp.json() as {
      predictions: Record<string, unknown>[];
    };

    const predictions = payload.predictions || [];

    // The depth field is named "predicted_2024" or "predicted_2025" depending on year
    const depthKey = `predicted_${year}`;

    // Build anchor points from the 4 seasonal predictions
    const anchors: { month: number; depth: number }[] = [];
    for (const pred of predictions) {
      const seasonName = (pred.season as string || "").toLowerCase();
      const anchorMonth = SEASON_MONTH_MAP[seasonName];
      const depth = pred[depthKey];

      if (anchorMonth != null && depth != null) {
        anchors.push({ month: anchorMonth, depth: Number(depth) });
      }
    }

    anchors.sort((a, b) => a.month - b.month);

    if (!anchors.length) throw new Error(`No predictions for year ${year}`);

    console.log(`[fetchAllMonthlyForYear] ✅ ${villageName} ${year}: ${anchors.length} anchors`, anchors);

    // Interpolate all 12 months at once
    const results: MonthlyPredictionResult[] = [];
    for (let m = 1; m <= 12; m++) {
      const exactDepth = interpolateMonth(m, anchors);
      const prevDepth = interpolateMonth(m === 1 ? 12 : m - 1, anchors);
      const monthlyChange = exactDepth - prevDepth;
      const isExactSeason = anchors.some((a) => a.month === m);

      results.push({
        exact_depth: Math.round(exactDepth * 100) / 100,
        monthly_change_rate: Math.round(monthlyChange * 1000) / 1000,
        pointwise_insights: [
          isExactSeason
            ? `Seasonal prediction for month ${m}/${year}`
            : `Interpolated estimate for month ${m}/${year} from seasonal anchors`,
        ],
        dataSource: "backend",
      });
    }
    return results;
  } catch (err) {
    console.error(`[fetchAllMonthlyForYear] ❌ Failed for ${villageName} ${year}:`, err);
    throw err;
  }
}

export function searchRegions(query: string): Region[] {
  // This is now a no-op since the sidebar uses RegionalDataService.searchVillages()
  return [];
}
