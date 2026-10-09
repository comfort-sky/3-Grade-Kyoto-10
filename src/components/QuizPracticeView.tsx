import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  ArrowLeft, 
  ArrowRight, 
  Lightbulb, 
  BookOpen, 
  HelpCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  MapPin
} from 'lucide-react';
import { Question } from '../types';
import { SpotMapBadges } from './SpotMapBadges';
import { UnifiedExplanation } from './UnifiedExplanation';
import { findSpotByNameOrAlias } from '../data/kyotoSpotsData';

interface QuizPracticeViewProps {
  questions: Question[];
  title: string;
  onBackToDashboard: () => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  onRecordAnswer: (questionId: number, isCorrect: boolean) => void;
}

export const QuizPracticeView: React.FC<QuizPracticeViewProps> = ({
  questions,
  title,
  onBackToDashboard,
  bookmarkedIds,
  onToggleBookmark,
  onRecordAnswer,
}) => {
  // セッション開始時の問題リストを固定保持
  // （回答中に正解して要復習リストから除外されても、現在解いている問題が勝手にスキップしたり消えたりしないようにする）
  const [sessionQuestions] = useState<Question[]>(() => questions);

  // 出題数フィルター（全問、10問、20問）
  const [questionLimit, setQuestionLimit] = useState<number | 'all'>('all');

  // 出題数に応じた問題リスト
  const filteredQuestions = React.useMemo(() => {
    if (questionLimit === 'all') return sessionQuestions;
    return sessionQuestions.slice(0, questionLimit);
  }, [sessionQuestions, questionLimit]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 各問題ごとの回答状態（問題ID -> 選択した選択肢の番号）を保持
  // これにより「前の問題」に戻っても解説を見直すことができ、回答直後に解説が維持される
  const [answersMap, setAnswersMap] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<'choices' | 'summary'>('choices');

  // 出題数変更時のリセット処理
  const handleLimitChange = (limit: number | 'all') => {
    setQuestionLimit(limit);
    setCurrentIndex(0);
  };

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-stone-850 border border-stone-700 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-stone-200">復習対象の問題がありません</h3>
        <p className="text-sm text-stone-400 mt-2 mb-6">
          間違えた問題やブックマークした問題はここに保存され、いつでも集中復習できます。
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium text-sm transition-colors shadow-sm"
        >
          トップ画面へ戻る
        </button>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, currentIndex), filteredQuestions.length - 1);
  const currentQ = filteredQuestions[safeIndex];

  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <h3 className="text-lg font-bold text-stone-200">問題の読み込みに失敗しました</h3>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 rounded-lg bg-stone-800 text-stone-200 text-sm border border-stone-600"
        >
          トップへ戻る
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(currentQ.id);
  const selectedOption = answersMap[currentQ.id] !== undefined ? answersMap[currentQ.id] : null;
  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && selectedOption === currentQ.answer;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return; // 既に回答済みの場合は変更不可
    setAnswersMap((prev) => ({
      ...prev,
      [currentQ.id]: idx,
    }));
    const correct = idx === currentQ.answer;
    onRecordAnswer(currentQ.id, correct);
  };

  const handleNext = () => {
    if (safeIndex < filteredQuestions.length - 1) {
      setCurrentIndex(safeIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* 上部ヘッダー・進行バー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors py-1 px-1.5 rounded hover:bg-stone-800 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>戻る</span>
          </button>

          {/* 出題数セレクター（10問、20問、全問） */}
          {sessionQuestions.length > 10 && (
            <div className="flex items-center gap-1 bg-stone-950/60 p-1 rounded-lg border border-stone-800 text-xs">
              <span className="text-[11px] text-stone-400 px-1.5 hidden xs:inline">出題数:</span>
              <button
                onClick={() => handleLimitChange(10)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  questionLimit === 10
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                10問
              </button>
              {sessionQuestions.length >= 20 && (
                <button
                  onClick={() => handleLimitChange(20)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                    questionLimit === 20
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  20問
                </button>
              )}
              <button
                onClick={() => handleLimitChange('all')}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  questionLimit === 'all'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                全{sessionQuestions.length}問
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <span className="text-xs text-stone-400 font-mono">
            第 <strong className="text-amber-400 text-sm">{safeIndex + 1}</strong> / {filteredQuestions.length} 問
          </span>
          <button
            onClick={() => onToggleBookmark(currentQ.id)}
            title={isBookmarked ? "気になる問題の保存を解除" : "後で復習するためにこの問題を保存（ブックマーク）"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${
              isBookmarked
                ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-sm'
                : 'bg-stone-850/80 border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isBookmarked ? '保存済み' : '後で復習（保存）'}</span>
          </button>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-amber-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((safeIndex + 1) / filteredQuestions.length) * 100}%` }}
        />
      </div>

      {/* 問題カード */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 sm:p-7 shadow-xl">
        {/* カテゴリバッジ */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-amber-400">
            {currentQ.category}
          </span>
          <span className="text-xs font-mono text-stone-500">
            第 {currentQ.id} 問
          </span>
        </div>

        {/* 問題文 */}
        <h3 className="text-base sm:text-lg font-medium text-stone-100 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* 4つの選択肢 */}
        <div className="space-y-3 mt-6">
          {currentQ.options.map((option, idx) => {
            let optionStyles = 'bg-stone-900/80 hover:bg-stone-800 border-stone-750 text-stone-200';
            
            if (isAnswered) {
              if (idx === currentQ.answer) {
                // 正解の選択肢（常に緑）
                optionStyles = 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 font-medium ring-1 ring-emerald-500/50';
              } else if (idx === selectedOption) {
                // 不正解の選択肢を選んでしまった場合（赤）
                optionStyles = 'bg-red-950/70 border-red-500/80 text-red-200 line-through';
              } else {
                optionStyles = 'bg-stone-900/40 border-stone-800 text-stone-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-sm sm:text-base transition-all flex items-center justify-between ${optionStyles} ${
                  !isAnswered ? 'cursor-pointer hover:border-amber-500/40 active:scale-[0.99]' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-800/80 border border-stone-700 text-xs font-mono flex items-center justify-center text-stone-300 shrink-0">
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && idx === currentQ.answer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQ.answer && (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 判定結果バナー */}
        {isAnswered && (
          <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${
            isCorrect 
              ? 'bg-emerald-950/50 border border-emerald-700/60 text-emerald-200' 
              : 'bg-red-950/50 border border-red-700/60 text-red-200'
          }`}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">正解です！見事な知識です。</span>
                    {title.includes('弱点') && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                        弱点を克服しました！
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-300/80 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>正解：{currentQ.options[currentQ.answer]}</span>
                    {(() => {
                      const spot = findSpotByNameOrAlias(currentQ.options[currentQ.answer]);
                      if (!spot) return null;
                      return (
                        <a
                          href={spot.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline decoration-amber-400/50"
                          title={`${spot.name}のGoogleマップを開く`}
                        >
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Googleマップ ↗</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm">残念、不正解です。</div>
                  <div className="text-xs text-red-300/90 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>正解は「<span className="font-semibold underline">{currentQ.options[currentQ.answer]}</span>」でした。</span>
                    {(() => {
                      const spot = findSpotByNameOrAlias(currentQ.options[currentQ.answer]);
                      if (!spot) return null;
                      return (
                        <a
                          href={spot.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline decoration-amber-400/50"
                          title={`${spot.name}のGoogleマップを開く`}
                        >
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Googleマップ ↗</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 詳細解説セクション */}
      {isAnswered && (
        <div className="bg-stone-850/80 border border-stone-750 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-stone-100 font-serif">
                問題の詳しい解説
              </h4>
            </div>

          </div>

          {/* 統合解説 */}
          <div className="pt-1">
            <UnifiedExplanation question={currentQ} selectedIdx={selectedOption ?? undefined} />
          </div>
        </div>
      )}

      {/* フッターナビゲーション */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={safeIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-stone-200 text-xs sm:text-sm border border-stone-750 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>前の問題</span>
        </button>

        <span className="text-xs text-stone-500 font-mono">
          {safeIndex + 1} / {filteredQuestions.length}
        </span>

        {safeIndex < filteredQuestions.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold text-xs sm:text-sm shadow-md transition-all"
          >
            <span>次の問題</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-100 font-semibold text-xs sm:text-sm shadow-md transition-all"
          >
            <span>演習を終了</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
