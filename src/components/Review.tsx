import React, { useState, useEffect, useMemo } from 'react';
import { 
  RotateCcw, 
  Check, 
  Trash2, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  Sparkles, 
  Lightbulb, 
  Info, 
  Filter, 
  AlertCircle,
  HelpCircle,
  Play,
  MapPin
} from 'lucide-react';
import { Question } from '../types';
import { 
  getWrongQuestionIds, 
  removeWrongQuestionId, 
  clearWrongQuestionIds,
  subscribeWrongQuestionIds 
} from '../utils/wrongQuestions';
import { SpotMapBadges } from './SpotMapBadges';
import { UnifiedExplanation } from './UnifiedExplanation';
import { findSpotByNameOrAlias } from '../data/kyotoSpotsData';

interface ReviewProps {
  allQuestions: Question[];
  onBackToHome: () => void;
  onStartTest?: (mode: 'mini-test') => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
}

export const Review: React.FC<ReviewProps> = ({
  allQuestions,
  onBackToHome,
  onStartTest,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  // LocalStorage（キー名: wrong_question_ids）から間違えた問題のID配列を取得
  const [wrongIds, setWrongIds] = useState<number[]>(() => getWrongQuestionIds());
  const [viewMode, setViewMode] = useState<'practice' | 'list'>('practice');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedListIds, setExpandedListIds] = useState<Set<number>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // LocalStorageの変更をリアルタイム同期
  useEffect(() => {
    const unsubscribe = subscribeWrongQuestionIds((updatedIds) => {
      setWrongIds(updatedIds);
    });
    return unsubscribe;
  }, []);

  // トースト表示タイマー
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // ID配列に対応するQuestionオブジェクト群を抽出
  const wrongQuestions = useMemo(() => {
    const idSet = new Set(wrongIds);
    return allQuestions.filter((q) => idSet.has(q.id));
  }, [allQuestions, wrongIds]);

  // 分野（カテゴリ）によるフィルタリング
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return wrongQuestions;
    return wrongQuestions.filter((q) => q.category === selectedCategory);
  }, [wrongQuestions, selectedCategory]);

  // 利用可能なカテゴリ一覧
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    wrongQuestions.forEach((q) => cats.add(q.category));
    return Array.from(cats);
  }, [wrongQuestions]);

  // 「覚えた（削除）」処理：LocalStorageからIDを削除
  const handleMarkAsLearned = (questionId: number) => {
    removeWrongQuestionId(questionId);
    setToastMessage('「覚えた問題」として復習リストから削除しました');

    // 演習モードで現在最後の問題を解いていた場合インデックス調整
    if (currentIndex >= filteredQuestions.length - 1 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 全件クリア
  const handleClearAll = () => {
    clearWrongQuestionIds();
    setShowClearConfirm(false);
    setToastMessage('復習リストをすべてリセットしました');
  };

  const toggleListExpand = (id: number) => {
    setExpandedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 間違えた問題が0件の場合の空状態表示
  if (wrongQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4 space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-100 font-serif">
            間違えた問題はありません！🌸
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed max-w-md mx-auto">
            すべての要復習問題をマスターしました。ミニテストや本番模試を受けて、新しい問題に挑戦してみましょう！
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {onStartTest && (
            <button
              onClick={() => onStartTest('mini-test')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>ランダム10問ミニテスト</span>
            </button>
          )}

          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs sm:text-sm border border-stone-750 transition-colors cursor-pointer"
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, currentIndex), filteredQuestions.length - 1);
  const currentQ = filteredQuestions[safeIndex];
  const isBookmarked = currentQ ? bookmarkedIds.includes(currentQ.id) : false;
  const currentAnswer = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const isAnswered = currentAnswer !== undefined;
  const isCorrect = isAnswered && currentQ && currentAnswer === currentQ.answer;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-20 animate-fadeIn relative">
      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn backdrop-blur-sm">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 全件クリア確認モーダル */}
      {showClearConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <div 
            className="bg-stone-850 border border-rose-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif">
                  間違えた問題リストをすべてリセットしますか？
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  保存されている {wrongQuestions.length} 問の弱点履歴が消去されます
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs sm:text-sm font-medium border border-stone-700 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                すべて削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* トップヘッダー：タイトル、件数、モード切替、戻る */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
            title="ホームへ戻る"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-100 font-serif flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>間違えた問題（復習モード）</span>
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                要復習: {wrongQuestions.length}問
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              各問題の「覚えた（削除）」を押すと復習リストから除外されます。
            </p>
          </div>
        </div>

        {/* 表示モード切り替え＆全件削除ボタン */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="bg-stone-900 p-1 rounded-xl border border-stone-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('practice')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'practice'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              一問一答演習
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              問題一覧
            </button>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-rose-400 border border-stone-700 transition-colors cursor-pointer"
            title="間違えた問題リストをすべてリセット"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 分野別フィルター（複数カテゴリがある場合） */}
      {availableCategories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 text-[11px] px-1 whitespace-nowrap">分野:</span>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                : 'bg-stone-850 text-stone-400 border-stone-750 hover:text-stone-200'
            }`}
          >
            全分野 ({wrongQuestions.length})
          </button>
          {availableCategories.map((cat) => {
            const count = wrongQuestions.filter((q) => q.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-stone-850 text-stone-400 border-stone-750 hover:text-stone-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. 一問一答 演習モード                                  */}
      {/* ======================================================== */}
      {viewMode === 'practice' && currentQ && (
        <div className="space-y-4 animate-fadeIn">
          {/* 問題カード */}
          <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-amber-400">
                  {currentQ.category}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {safeIndex + 1} / {filteredQuestions.length} 問
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 覚えた（削除）ボタン */}
                <button
                  onClick={() => handleMarkAsLearned(currentQ.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                  title="この問題はもうマスターしたので復習リストから削除する"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>覚えた（削除）</span>
                </button>

                <button
                  onClick={() => onToggleBookmark(currentQ.id)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-950/70 border-amber-500/70 text-amber-300'
                      : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                  }`}
                  title={isBookmarked ? 'ブックマーク解除' : 'ブックマーク保存'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* 問題文 */}
            <h3 className="text-base sm:text-lg font-medium text-stone-100 leading-relaxed font-serif">
              {currentQ.question}
            </h3>

            {/* 選択肢ボタン群 */}
            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentAnswer === idx;
                const isCorrectOption = idx === currentQ.answer;

                let buttonStyle = 'bg-stone-900/70 border-stone-750 text-stone-200 hover:bg-stone-800';

                if (isAnswered) {
                  if (isCorrectOption) {
                    buttonStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40';
                  } else if (isSelected) {
                    buttonStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                  } else {
                    buttonStyle = 'bg-stone-900/40 border-stone-800 text-stone-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => {
                      setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
                    }}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${buttonStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 border ${
                        isAnswered && isCorrectOption
                          ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                          : isAnswered && isSelected
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-stone-800 text-stone-400 border-stone-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed pt-0.5">{option}</span>
                    {isAnswered && isCorrectOption && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shrink-0">
                        正解
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 回答後の判定＆詳細解説 */}
            {isAnswered && (
              <div className="pt-4 border-t border-stone-800 space-y-4 animate-fadeIn">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="text-sm font-bold">
                      {isCorrect ? '正解です！見事リベンジ成功！🌸' : '残念、不正解です。解説を復習しましょう'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleMarkAsLearned(currentQ.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold transition-all shadow cursor-pointer shrink-0"
                  >
                    覚えたので削除
                  </button>
                </div>

                {/* 統合解説 */}
                <div className="pt-2">
                  <UnifiedExplanation question={currentQ} selectedIdx={currentAnswer ?? undefined} />
                </div>
              </div>
            )}
          </div>

          {/* 前後ナビゲーション */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-stone-300 text-xs border border-stone-750 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>前の問題</span>
            </button>

            <span className="text-xs text-stone-500 font-mono">
              {safeIndex + 1} / {filteredQuestions.length} 問
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))}
              disabled={safeIndex >= filteredQuestions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>次の問題</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. 復習リスト一覧モード                                 */}
      {/* ======================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-3.5 animate-fadeIn">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedListIds.has(q.id);
            const isBookmarked = bookmarkedIds.includes(q.id);

            return (
              <div
                key={q.id}
                className="bg-stone-850/90 border border-stone-750 rounded-2xl p-4 sm:p-5 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-stone-800 px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                      {q.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 覚えた（削除）ボタン */}
                    <button
                      onClick={() => handleMarkAsLearned(q.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition-all cursor-pointer active:scale-95"
                      title="この問題は覚えたのでリストから削除する"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>覚えた（削除）</span>
                    </button>

                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-950/70 border-amber-500/70 text-amber-300'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => toggleListExpand(q.id)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs border border-stone-700 transition-colors cursor-pointer"
                    >
                      {isExpanded ? '閉じる ▲' : '解説 ▼'}
                    </button>
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-medium text-stone-100 font-serif leading-relaxed">
                  {q.question}
                </h4>

                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs flex items-center justify-between gap-1 flex-wrap">
                  <div>
                    <span className="text-stone-400 mr-2">正しい正解:</span>
                    <span className="font-bold text-emerald-400">
                      {q.answer + 1}. {q.options[q.answer]}
                    </span>
                  </div>
                  {(() => {
                    const spot = findSpotByNameOrAlias(q.options[q.answer]);
                    if (!spot) return null;
                    return (
                      <a
                        href={spot.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline decoration-amber-400/50"
                        title={`${spot.name}のGoogleマップを開く`}
                      >
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>Googleマップ ↗</span>
                      </a>
                    );
                  })()}
                </div>

                {/* 展開時の全選択肢詳細解説 */}
                {isExpanded && (
                  <div className="pt-3 border-t border-stone-800 space-y-3 animate-fadeIn">
                    <div className="space-y-1.5">
                      {q.choiceExplanations?.map((choice, cIdx) => {
                        const choiceSpot = findSpotByNameOrAlias(choice.option);
                        return (
                          <div
                            key={cIdx}
                            className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                              choice.isCorrect
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-stone-200'
                                : 'bg-stone-900/60 border-stone-800 text-stone-300'
                            }`}
                          >
                            <div className="font-semibold flex items-center justify-between gap-1.5 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-stone-800 flex items-center justify-center text-[10px] font-mono">
                                  {cIdx + 1}
                                </span>
                                <span className={choice.isCorrect ? 'text-emerald-400' : 'text-stone-300'}>
                                  {choice.option}
                                </span>
                              </div>

                              {choiceSpot && (
                                <a
                                  href={choiceSpot.googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-[11px] text-amber-300 border border-amber-500/30 transition-colors ml-auto shrink-0"
                                  title={`${choiceSpot.name}のGoogleマップを開く`}
                                >
                                  <MapPin className="w-3 h-3 text-amber-400" />
                                  <span>Googleマップ ↗</span>
                                </a>
                              )}
                            </div>
                            <p className="text-stone-400 pl-5 pt-0.5">{choice.explanation}</p>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation.tip && (
                      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
                        <strong className="text-amber-300 block mb-0.5">💡 試験対策ポイント:</strong>
                        <p>{q.explanation.tip}</p>
                      </div>
                    )}

                    {/* 解説の一番下：出題・正解の寺社・史跡ロケーションマップ */}
                    <div className="pt-2 border-t border-stone-800">
                      <SpotMapBadges question={q} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
