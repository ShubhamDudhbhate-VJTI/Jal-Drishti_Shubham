import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, MessageCircle, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { MessageKey } from '@/i18n/translations';

const RISK_KEYS: Record<'low' | 'moderate' | 'high' | 'severe', MessageKey> = {
  low: 'riskShortLow',
  moderate: 'riskShortModerate',
  high: 'riskShortHigh',
  severe: 'riskShortSevere',
};

export function MultilingualSupport() {
  const { t, locale } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakStateName = () => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(t('glossaryMaharashtra'));
    utterance.lang = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-emerald-500';
      case 'moderate': return 'bg-amber-500';
      case 'high': return 'bg-orange-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const riskLevels = ['low', 'moderate', 'high', 'severe'] as const;

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Globe className="h-3.5 w-3.5" />
        {t('analysis')}
      </h3>

      {/* Location with speak */}
      <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-lg">
        <div>
          <p className="text-[10px] text-muted-foreground">{t('location')}</p>
          <p className="text-sm font-semibold">{t('glossaryMaharashtra')}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={speakStateName}
          disabled={isSpeaking}
          className="h-7 w-7 p-0"
          type="button"
        >
          {isSpeaking ? (
            <Volume2 className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Risk Legend */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1.5">{t('riskLevelLabel')}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {riskLevels.map((level) => (
            <Badge
              key={level}
              className={`${getRiskColor(level)} text-white text-[10px] justify-center py-0.5`}
            >
              {t(RISK_KEYS[level])}
            </Badge>
          ))}
        </div>
      </div>

      {/* Support Note */}
      <div className="p-2.5 bg-secondary/20 rounded-lg">
        <p className="text-[10px] text-muted-foreground leading-relaxed">{t('farmerSupportBlurb')}</p>
      </div>
    </div>
  );
}
