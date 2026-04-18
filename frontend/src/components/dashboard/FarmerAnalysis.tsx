import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Droplets, TrendingUp, Calendar, MapPin, Volume2, ChevronDown, ChevronUp, Sprout } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { useLanguage } from '@/context/LanguageContext';
import type { MessageKey } from '@/i18n/translations';

interface FarmerAnalysisModel {
  waterLevel: 'good' | 'moderate' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
  actionItems: string[];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildAnalysis(regionId: string, t: (k: MessageKey) => string): FarmerAnalysisModel {
  const h = hashStr(regionId);
  const waterLevel = (['good', 'moderate', 'critical'] as const)[h % 3];
  const trend = (['improving', 'stable', 'declining'] as const)[(h >> 3) % 3];

  let recommendation = '';
  let actionItems: string[] = [];

  if (waterLevel === 'good') {
    recommendation = t('fa_rec_good');
    actionItems = [t('fa_act_good_1'), t('fa_act_good_2'), t('fa_act_good_3')];
  } else if (waterLevel === 'moderate') {
    recommendation = t('fa_rec_moderate');
    actionItems = [t('fa_act_mod_1'), t('fa_act_mod_2'), t('fa_act_mod_3')];
  } else {
    recommendation = t('fa_rec_critical');
    actionItems = [t('fa_act_crit_1'), t('fa_act_crit_2'), t('fa_act_crit_3'), t('fa_act_crit_4')];
  }

  return { waterLevel, trend, recommendation, actionItems };
}

const waterLevelStyles = {
  good: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500', emoji: '💧' },
  moderate: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500', emoji: '⚠️' },
  critical: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500', emoji: '🚨' },
};

const trendStyles = {
  improving: { badge: 'bg-emerald-500', emoji: '📈' },
  stable: { badge: 'bg-blue-500', emoji: '➡️' },
  declining: { badge: 'bg-red-500', emoji: '📉' },
};

export function FarmerAnalysis() {
  const { selectedRegion, selectedMonth, selectedYear } = useDashboard();
  const { t, locale } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const analysis = useMemo(
    () => (selectedRegion ? buildAnalysis(selectedRegion.id, t) : null),
    [selectedRegion, t]
  );

  const speakAnalysis = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const monthLabel =
    selectedMonth != null ? t(`month_${selectedMonth}` as MessageKey) : '';

  if (!selectedRegion || !analysis) {
    return (
      <div className="glass rounded-xl p-6 h-full flex items-center justify-center min-h-[280px]">
        <div className="text-center">
          <Sprout className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {t('pleaseSelectRegion')}
          </p>
        </div>
      </div>
    );
  }

  const wlStyle = waterLevelStyles[analysis.waterLevel];
  const trStyle = trendStyles[analysis.trend];

  return (
    <div className="glass rounded-xl p-5 h-full flex flex-col gap-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Sprout className="h-4 w-4 text-emerald-400" />
          {t('farmerAnalysis')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3 rounded-lg border ${wlStyle.border} ${wlStyle.bg} text-center`}>
          <span className="text-lg">{wlStyle.emoji}</span>
          <p className="text-[10px] text-muted-foreground mt-1">{t('waterLevelStatus')}</p>
          <Badge className={`${wlStyle.badge} text-white text-xs mt-1`}>
            {analysis.waterLevel === 'good'
              ? t('wlGood')
              : analysis.waterLevel === 'moderate'
                ? t('wlModerate')
                : t('wlCritical')}
          </Badge>
        </div>

        <div className="p-3 rounded-lg border border-border/30 bg-secondary/20 text-center">
          <span className="text-lg">{trStyle.emoji}</span>
          <p className="text-[10px] text-muted-foreground mt-1">{t('trendStatus')}</p>
          <Badge className={`${trStyle.badge} text-white text-xs mt-1`}>
            {analysis.trend === 'improving'
              ? t('trImproving')
              : analysis.trend === 'stable'
                ? t('trStable')
                : t('trDeclining')}
          </Badge>
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 rounded-lg border-l-3 border-l-cyan-500">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground leading-snug">
              {analysis.recommendation}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              📍 {selectedRegion.name} • {selectedRegion.district}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Action Items */}
      {isExpanded && (
        <div className="p-3 bg-secondary/20 rounded-lg animate-slide-up">
          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            {t('actionItemsHeading')}
          </h4>
          <div className="space-y-1.5">
            {analysis.actionItems.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-background/50 rounded border border-border/20 text-xs"
              >
                <span className="text-cyan-400 font-bold shrink-0">{index + 1}.</span>
                <span className="text-foreground/90">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listen Button */}
      <Button
        onClick={() => speakAnalysis(analysis.recommendation)}
        disabled={isSpeaking}
        className="w-full mt-auto"
        variant="outline"
        size="sm"
      >
        <Volume2 className={`h-3.5 w-3.5 mr-1.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
        <span className="text-xs">{isSpeaking ? t('speaking') : `🔊 ${t('listenAnalysis')}`}</span>
      </Button>
    </div>
  );
}
