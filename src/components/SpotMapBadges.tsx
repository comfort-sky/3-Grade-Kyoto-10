import React, { useMemo } from 'react';
import { MapPin, ExternalLink, Award } from 'lucide-react';
import { Question } from '../types';
import { detectQuestionSpotsDetail } from '../data/kyotoSpotsData';

interface SpotMapBadgesProps {
  question: Question;
  compact?: boolean;
  onOpenFullMap?: () => void;
  isAnswerSection?: boolean;
}

export const SpotMapBadges: React.FC<SpotMapBadgesProps> = ({ 
  question, 
  compact = false,
}) => {
  // 正解または出題の主スポットのみを抽出（不正解の選択肢は出さない）
  const { correctSpot, allSpots } = useMemo(() => {
    return detectQuestionSpotsDetail(question);
  }, [question]);

  const targetSpot = correctSpot || (allSpots.length > 0 ? allSpots[0] : null);

  // 寺社・史跡が特定できない場合は余計な表示をせず非表示
  if (!targetSpot) {
    return null;
  }

  return (
    <div className={`space-y-2.5 ${compact ? 'pt-2' : 'pt-3'} animate-fadeIn`}>
      <div className="bg-stone-900/90 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5 shadow-sm">
        {/* スポット名 ＆ 所在地 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              関連史跡
            </span>
            <h5 className="text-sm sm:text-base font-serif font-bold text-stone-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{targetSpot.name}</span>
            </h5>
            {targetSpot.worldHeritage && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Award className="w-3 h-3 text-amber-400" />
                <span>世界遺産</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-stone-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
            <span>所在地: {targetSpot.address || targetSpot.ward}</span>
          </div>
        </div>

        {/* 概要・見どころ（交通手段は削除） */}
        {targetSpot.description && (
          <p className="text-xs text-stone-300 leading-relaxed">
            {targetSpot.description}
          </p>
        )}

        {/* Googleマップ直リンクボタン */}
        <div className="pt-0.5">
          <a
            href={targetSpot.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            title={`${targetSpot.name}の正確な位置をGoogleマップで確認する`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Googleマップで「{targetSpot.shortName || targetSpot.name}」を開く ↗</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
