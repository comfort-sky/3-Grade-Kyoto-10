import React from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { SpotMapBadges } from './SpotMapBadges';

interface UnifiedExplanationProps {
  question: Question;
  selectedIdx?: number;
  onOpenFullMap?: () => void;
}

export const UnifiedExplanation: React.FC<UnifiedExplanationProps> = ({
  question,
  onOpenFullMap,
}) => {
  const correctChoice = question.choiceExplanations?.find((c) => c.isCorrect);
  const incorrectChoices = question.choiceExplanations?.filter((c) => !c.isCorrect) || [];

  // テキスト重複判定ヘルパー（余分な記号や空白を除去して重複を検出）
  const isDuplicateOrSubset = (baseText: string, candidate?: string | null): boolean => {
    if (!candidate || !baseText) return false;
    const cleanBase = baseText.replace(/[\s\r\n\t、。・！？（）「」『』]/g, '');
    const cleanCand = candidate.replace(/[\s\r\n\t、。・！？（）「」『』]/g, '');
    if (cleanCand.length === 0) return true;
    if (cleanBase.includes(cleanCand) || cleanCand.includes(cleanBase)) return true;
    if (cleanCand.length >= 15 && cleanBase.includes(cleanCand.slice(0, 15))) return true;
    return false;
  };

  // 正解のメイン解説文（重複を排除して最も詳しくわかりやすい解説を採用）
  const correctExplanationText = correctChoice?.explanation || question.explanation?.reason || '';
  
  // 補足の歴史背景（正解解説と内容が重複していない場合のみ抽出）
  const additionalHistory = question.explanation?.history && 
    !isDuplicateOrSubset(correctExplanationText, question.explanation.history) 
      ? question.explanation.history 
      : null;

  // 補足の豆知識（正解解説や歴史背景と重複していない場合のみ抽出）
  const combinedContext = correctExplanationText + (additionalHistory || '');
  const additionalTrivia = question.explanation?.trivia && 
    !isDuplicateOrSubset(combinedContext, question.explanation.trivia) 
      ? question.explanation.trivia 
      : null;

  // 急所・頻出ポイント（すでに解説や豆知識に書かれている内容の重複を排除）
  const fullExplanationContext = combinedContext + (additionalTrivia || '');
  const hasDistinctTip = question.explanation?.tip && 
    !isDuplicateOrSubset(fullExplanationContext, question.explanation.tip);

  return (
    <div className="space-y-3.5 text-xs sm:text-sm animate-fadeIn">
      {/* 1. 正解の解説と背景 */}
      <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-700/50 shadow-sm space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-stone-950 font-extrabold text-xs flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> 正解
          </span>
          <span className="font-bold text-stone-100 text-sm sm:text-base font-serif">
            {question.options[question.answer]}
          </span>
        </div>

        <p className="text-stone-200 leading-relaxed pl-0.5">
          {correctExplanationText}
        </p>

        {additionalHistory && (
          <p className="text-stone-300/90 leading-relaxed border-t border-emerald-800/40 pt-2 text-xs">
            {additionalHistory}
          </p>
        )}

        {additionalTrivia && (
          <p className="text-stone-300/90 leading-relaxed border-t border-emerald-800/40 pt-1.5 text-xs">
            {additionalTrivia}
          </p>
        )}
      </div>

      {/* 2. 他の選択肢の解説（3つの誤答の要点解説） */}
      {incorrectChoices.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-stone-400 block px-1">
            【他の選択肢の解説】
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {incorrectChoices.map((choice, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-stone-900/70 border border-stone-800 text-xs leading-relaxed"
              >
                <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-rose-300 border border-stone-700 font-semibold inline-flex items-center gap-0.5">
                    <XCircle className="w-2.5 h-2.5" /> 誤答
                  </span>
                  <span className="font-bold text-stone-300">{choice.option}</span>
                </div>
                <p className="text-stone-400 pl-1 text-[11px] sm:text-xs leading-relaxed">
                  {choice.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 合格対策の急所・頻出ポイント（重複せず独自の要点がある場合のみ掲載） */}
      {hasDistinctTip && (
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs leading-relaxed space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>京都検定3級 出題の急所・頻出ポイント</span>
          </div>
          <p className="text-stone-200 whitespace-pre-line text-xs pl-1">
            {question.explanation.tip}
          </p>
        </div>
      )}

      {/* 4. 関連寺社・史跡のGoogleマップ直リンク（交通手段なし） */}
      <SpotMapBadges question={question} onOpenFullMap={onOpenFullMap} />
    </div>
  );
};
