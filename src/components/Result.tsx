import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  Download, 
  Share2, 
  Copy,
  Check, 
  ArrowLeft, 
  BookOpen, 
  Bookmark, 
  Info, 
  HelpCircle, 
  X, 
  BarChart3,
  ExternalLink,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';
import { TestResult, NOTE_700_3KYU_URL, COMMUNITY_NOTE_URL, APP_50_3KYU_URL } from '../types';
import { downloadTestResultText, downloadTestResultCSV } from '../utils/exportTestResult';
import { RANK_LEGEND_ITEMS } from './MyPage';
import { KyotoSpotsView } from './KyotoSpotsView';
import { UnifiedExplanation } from './UnifiedExplanation';
import { addWrongQuestionIds } from '../utils/wrongQuestions';
import { SeriesPromotionSection } from './SeriesPromotionSection';

interface ResultProps {
  result: TestResult;
  onRetake: () => void;
  onGoToReview: () => void;
  onBackToHome: () => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  onDownloaded?: () => void;
  onGoToMyPage?: () => void;
}

export const Result: React.FC<ResultProps> = ({
  result,
  onRetake,
  onGoToReview,
  onBackToHome,
  bookmarkedIds,
  onToggleBookmark,
  onDownloaded,
  onGoToMyPage,
}) => {
  const isMockExam = result.mode === 'mock-exam' || result.questions.length >= 20;
  const isMiniTest = !isMockExam; // 10問ミニテスト
  const wrongQuestions = result.questions.filter((q) => result.userAnswers[q.id] !== q.answer);

  // 100問模試用の10問刻みタブ（'wrong' | 1 | 2 | 3 ... 10 | 'all'）
  const [blockTab, setBlockTab] = useState<'wrong' | 'all' | number>(
    wrongQuestions.length > 0 ? 'wrong' : 1
  );

  // ミニテスト用の絞り込み
  const [miniFilter, setMiniFilter] = useState<'all' | 'wrong'>(
    wrongQuestions.length > 0 ? 'wrong' : 'all'
  );

  // 展開状態（間違えた問題のみ初期展開、正解はスッキリ折りたたむ）
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
    return new Set(wrongQuestions.map((q) => q.id));
  });

  const [showFullMapModal, setShowFullMapModal] = useState<boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);
  const [tweetCopied, setTweetCopied] = useState<boolean>(false);

  // ユーザー指定のX（Twitter）投稿用テキスト
  const tweetText = React.useMemo(() => {
    const title = isMockExam 
      ? '【京都検定3級 模試】' 
      : '【京都検定3級 10問無料お試し版】ミニテスト';

    // 受験日時の整形（例: 9/22 12:11）
    let dateStr = '';
    try {
      const d = new Date(result.date);
      if (!isNaN(d.getTime())) {
        dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } else {
        const match = result.date.match(/(?:20\d{2}[\/\-])?0?(\d{1,2})[\/\-]0?(\d{1,2})\s+(\d{1,2}:\d{2})/);
        dateStr = match ? `${parseInt(match[1])}/${match[2]} ${match[3]}` : result.date;
      }
    } catch {
      dateStr = result.date;
    }

    let rankLabel = '';
    if (result.percentage >= 90) {
      rankLabel = 'S判定（🌸 合格確実！）';
    } else if (result.percentage >= 70) {
      rankLabel = 'A判定（🌸 合格ライン突破！）';
    } else if (result.percentage >= 50) {
      rankLabel = 'B判定（あと一歩！要復習🌿）';
    } else {
      rankLabel = 'C判定（基礎固め推奨⛩️）';
    }

    return `${title}\n受験日時：${dateStr}\n結果：${result.total}問中 ${result.score}問正解（正答率 ${result.percentage}%）\n判定：${rankLabel}\n\n#京都検定 #京都検定3級`;
  }, [isMockExam, result]);

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCopyTweet = async () => {
    try {
      await navigator.clipboard.writeText(tweetText);
      setTweetCopied(true);
      setTimeout(() => setTweetCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  // 間違えた問題を自動的に要復習リスト（wrong_question_ids）に収録
  useEffect(() => {
    if (wrongQuestions.length > 0) {
      addWrongQuestionIds(wrongQuestions.map((q) => q.id));
    }
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 該当問題の先頭（「問題○」の位置）に確実にジャンプするスクロール関数
  const scrollToQuestion = (qId: number) => {
    // 確実に展開する
    setExpandedIds((prev) => {
      if (prev.has(qId)) return prev;
      const next = new Set(prev);
      next.add(qId);
      return next;
    });

    // レンダリング・展開完了を待ってから問題ヘッダー位置へ正確にスクロール
    setTimeout(() => {
      const el = document.getElementById(`result-q-${qId}`);
      if (el) {
        const navHeight = 72; // 上部固定ナビゲーションバーの高さ分オフセット
        const elTop = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: Math.max(0, elTop - navHeight),
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  // テキストダウンロード実行
  const handleDownloadText = () => {
    downloadTestResultText(
      {
        title: isMockExam ? '本番模試（100問・90分）' : '対策ミニテスト（5問）',
        date: result.date,
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        passed: result.passed,
      },
      result.questions,
      result.userAnswers
    );
    setHasDownloaded(true);
    if (onDownloaded) onDownloaded();
  };

  // CSVダウンロード
  const handleDownloadCSV = () => {
    downloadTestResultCSV(
      {
        title: isMockExam ? '本番模試（100問）' : '対策ミニテスト（5問）',
        date: result.date,
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        passed: result.passed,
      },
      result.questions,
      result.userAnswers
    );
    setHasDownloaded(true);
    if (onDownloaded) onDownloaded();
  };

  // 表示対象の問題リストの決定
  const displayedQuestions = (() => {
    if (isMiniTest) {
      if (miniFilter === 'wrong') return wrongQuestions;
      return result.questions;
    }
    // 100問模試の場合
    if (blockTab === 'wrong') return wrongQuestions;
    if (blockTab === 'all') return result.questions;
    // 10問刻み (1 -> 0..9, 2 -> 10..19, ...)
    const pageIndex = typeof blockTab === 'number' ? blockTab - 1 : 0;
    const startIdx = pageIndex * 10;
    const endIdx = startIdx + 10;
    return result.questions.slice(startIdx, endIdx);
  })();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* 上部戻るバー */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ホームへ戻る</span>
        </button>

        <span className="text-xs text-stone-500 font-mono">
          {new Date(result.date).toLocaleDateString('ja-JP')} 実施
        </span>
      </div>

      {/* スコアサマリーヒーローカード */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-2xl ${
          result.passed
            ? 'bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border-amber-500/50'
            : 'bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border-stone-750'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-xs font-medium text-stone-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isMockExam ? '京都検定3級 本番模試（100問）' : '京都検定3級 対策ミニテスト（5問）'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-100 flex items-center justify-center sm:justify-start gap-2">
              {result.passed ? (
                <>
                  <span className="text-amber-400">合格ライン達成！</span>
                  <span>🌸</span>
                </>
              ) : (
                <>
                  <span className="text-stone-300">合格ライン未到達</span>
                  <span>🍵</span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 max-w-md">
              {result.passed
                ? 'お見事です！京都検定3級の合格基準（正答率70%以上）をクリアしています。本番でも高得点を狙いましょう。'
                : '合格基準は正答率70%以上です。間違えた問題を復習して弱点を克服しましょう。'}
            </p>

            {/* 成績保存案内 */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs text-emerald-200 font-semibold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>テスト結果をマイページ（学習カルテ）に記録しました</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-850 border border-stone-700 text-xs text-stone-300">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>解答解説は、保存したい場合のみ「解答解説を保存」から保存できます</span>
              </div>
              {hasDownloaded && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs text-emerald-300 font-semibold shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>解答解説テキストをダウンロード保存しました</span>
                </div>
              )}
              {wrongQuestions.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/70 border border-rose-600/50 text-xs text-rose-300">
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>間違えた {wrongQuestions.length} 問は「要復習リスト」で復習可能</span>
                </div>
              )}
            </div>
          </div>

          {/* スコアサークル */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-stone-950/70 border border-stone-800 min-w-44 shadow-inner">
            <span className="text-xs text-stone-400 font-medium mb-1">あなたの得点</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl sm:text-5xl font-extrabold font-mono ${
                result.passed ? 'text-amber-400' : 'text-stone-200'
              }`}>
                {result.score}
              </span>
              <span className="text-stone-500 font-mono text-lg">/ {result.total}</span>
            </div>
            <div className="mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-850 text-stone-300 border border-stone-750">
              正答率 {result.percentage}%
            </div>
          </div>
        </div>

        {/* アクションボタンバー */}
        <div className="mt-6 pt-5 border-t border-stone-800 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          {wrongQuestions.length > 0 && (
            <button
              onClick={onGoToReview}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>間違えた問題（{wrongQuestions.length}問）を今すぐ復習</span>
            </button>
          )}

          {/* X（Twitter）定型投稿ボタン */}
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-950/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="X（旧Twitter）に定型文で成績を投稿する"
          >
            <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>成績を𝕏に投稿（定型）</span>
          </a>

          {/* 解答解説ダウンロード保存ボタン */}
          <button
            onClick={handleDownloadText}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
              hasDownloaded
                ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400 shadow-amber-500/20'
            }`}
            title="出題問題と全選択肢解説をテキストファイルとしてダウンロード保存"
          >
            {hasDownloaded ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{hasDownloaded ? '解答解説を保存済み（再保存）' : '解答解説を保存'}</span>
          </button>

          {/* CSV保存ボタン */}
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-750 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="出題問題と回答・全選択肢解説をCSV（Excel形式）で保存"
          >
            <Download className="w-4 h-4 text-stone-400" />
            <span>CSVで保存</span>
          </button>

          {/* マイページで成績変化を確認ボタン */}
          {onGoToMyPage && (
            <button
              onClick={onGoToMyPage}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 hover:text-amber-200 border border-stone-700 hover:border-amber-500/50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="マイページでこれまでの成績の変化・推移グラフを確認する"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>マイページで成績の変化を確認</span>
            </button>
          )}

          <button
            onClick={onRetake}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>新しい問題で再テスト</span>
          </button>
        </div>
      </div>

      {/* 次のステップ・推奨学習環境（3級・2級の受検級に合わせて選べるガイド） */}
      <div className="space-y-3.5">
        <SeriesPromotionSection defaultTab="3kyu" variant="result" />
      </div>

      {/* 成績をX（Twitter）に投稿する定型セクション */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1D9BF0]/15 border border-[#1D9BF0]/30 flex items-center justify-center text-[#1D9BF0] shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-100 font-serif">
                  成績を𝕏（Twitter）に投稿する
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60">
                  定型文
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                今回のテスト結果（得点・正答率・判定）があらかじめ記載された定型文ですぐに𝕏へ投稿できます。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              title="X（旧Twitter）に定型文で成績を投稿する"
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>𝕏に成績を投稿する</span>
            </a>

            <button
              onClick={handleCopyTweet}
              className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white border border-stone-700 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="X投稿用の定型文をクリップボードにコピー"
            >
              {tweetCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">コピー完了！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-400" />
                  <span>定型文をコピー</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 定型文プレビュー表示 */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 text-xs font-mono text-stone-300 whitespace-pre-wrap select-all leading-relaxed shadow-inner">
          {tweetText}
        </div>
      </div>

      {/* 詳細解説・正誤ナビゲーションセクション */}
      <div className="space-y-4 pt-1">
        <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>出題問題の正誤確認・全問徹底解説</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  全 {result.questions.length} 問
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                正解だけでなく誤答を含むすべての選択肢の解説を閲覧できます。
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 正解: {result.score}問
              </span>
              <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                <XCircle className="w-3.5 h-3.5" /> 不正解: {wrongQuestions.length}問
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* A. 5問ミニテストの場合のナビゲーション                      */}
          {/* ============================================================ */}
          {isMiniTest && (
            <div className="space-y-3">
              {/* 不正解問題への即座ジャンプボタン */}
              {wrongQuestions.length > 0 ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/60 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-rose-200 font-bold flex-wrap gap-1">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>間違えた問題（不正解 {wrongQuestions.length}問）:</span>
                    </span>
                    <span className="text-[11px] text-rose-300/80 font-normal">
                       タップで該当問題の先頭へジャンプ
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wrongQuestions.map((wq) => {
                      const origIdx = result.questions.findIndex((q) => q.id === wq.id);
                      return (
                        <button
                          key={wq.id}
                          type="button"
                          onClick={() => {
                            if (miniFilter === 'all') setMiniFilter('all');
                            if (!expandedIds.has(wq.id)) toggleExpand(wq.id);
                            scrollToQuestion(wq.id);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-900 text-rose-100 border border-rose-400 hover:bg-rose-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                        >
                          <span>第{origIdx + 1}問 ✕</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>全問正解です！素晴らしい成果です🌸</span>
                </div>
              )}

              {/* ミニテスト用表示切替タブ */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMiniFilter('wrong')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    miniFilter === 'wrong'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>間違えた問題のみ表示 ({wrongQuestions.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMiniFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    miniFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>全{result.questions.length}問を表示 ({result.questions.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* B. 100問模試の場合の10問刻み＋間違えた問題ナビゲーション    */}
          {/* ============================================================ */}
          {isMockExam && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 flex-wrap gap-1">
                <span className="font-medium text-stone-200">10問刻み・間違えた問題ナビゲーション:</span>
                <span className="text-[11px] text-stone-400">タブ選択で10問ずつ快適に確認できます</span>
              </div>

              {/* 10問刻みタブバー */}
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-stone-900 border border-stone-800">
                {/* 間違えた問題のみタブ */}
                <button
                  type="button"
                  onClick={() => setBlockTab('wrong')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    blockTab === 'wrong'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/80'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>間違えた問題のみ ({wrongQuestions.length})</span>
                </button>

                {/* 10問刻みボタン (1〜10, 11〜20, ...) */}
                {Array.from({ length: Math.ceil(result.questions.length / 10) }).map((_, pIdx) => {
                  const pageNum = pIdx + 1;
                  const startNum = pIdx * 10 + 1;
                  const endNum = Math.min((pIdx + 1) * 10, result.questions.length);
                  const isCurrent = blockTab === pageNum;

                  // 当該ブロック内の誤答数を算出
                  const blockWrongCount = result.questions
                    .slice(pIdx * 10, (pIdx + 1) * 10)
                    .filter((q) => result.userAnswers[q.id] !== q.answer).length;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setBlockTab(pageNum)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 font-extrabold shadow-sm'
                          : 'bg-stone-850 text-stone-300 hover:bg-stone-800 border border-stone-750'
                      }`}
                      title={`${startNum}〜${endNum}問の解説を表示（不正解: ${blockWrongCount}問）`}
                    >
                      <span>{startNum}〜{endNum}</span>
                      {blockWrongCount > 0 && (
                        <span className={`text-[10px] px-1 rounded-full ${
                          isCurrent ? 'bg-stone-950 text-rose-300' : 'bg-rose-950 text-rose-300'
                        }`}>
                          {blockWrongCount}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* 全問一括表示タブ */}
                <button
                  type="button"
                  onClick={() => setBlockTab('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    blockTab === 'all'
                      ? 'bg-stone-200 text-stone-950 font-bold shadow-sm'
                      : 'bg-stone-850 text-stone-400 hover:text-stone-200 border border-stone-750'
                  }`}
                >
                  全{result.questions.length}問表示
                </button>
              </div>

              {/* 選択中ブロック内の各問題へのダイレクトジャンプボタン */}
              {displayedQuestions.length > 0 && (
                <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 mr-1 flex items-center gap-1">
                    <span>問題番号ジャンプ:</span>
                  </span>
                  {displayedQuestions.map((dq) => {
                    const origIdx = result.questions.findIndex((q) => q.id === dq.id);
                    const isCorr = result.userAnswers[dq.id] === dq.answer;
                    return (
                      <button
                        key={dq.id}
                        type="button"
                        onClick={() => scrollToQuestion(dq.id)}
                        className={`px-2 py-1 rounded-md text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                          isCorr
                            ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/80'
                            : 'bg-rose-950/70 border-rose-600/60 text-rose-300 hover:bg-rose-900/90 shadow-sm'
                        }`}
                        title={`問題 ${origIdx + 1} の「問題○」位置へジャンプ`}
                      >
                        <span>問題 {origIdx + 1}</span>
                        {isCorr ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 解説カードリスト                                             */}
        {/* ============================================================ */}
        <div className="space-y-4">
          {displayedQuestions.map((q) => {
            const originalIdx = result.questions.findIndex((tq) => tq.id === q.id);
            const selectedIdx = result.userAnswers[q.id];
            const isCorrect = selectedIdx === q.answer;
            const isExpanded = expandedIds.has(q.id);
            const isBookmarked = bookmarkedIds.includes(q.id);

            return (
              <div
                key={q.id}
                id={`result-q-${q.id}`}
                className={`scroll-mt-24 bg-stone-850/90 border rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                  isCorrect ? 'border-stone-750' : 'border-rose-900/60 bg-stone-850/95 shadow-rose-950/20'
                }`}
              >
                {/* カードヘッダー */}
                <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-stone-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{isCorrect ? '正解' : '不正解'}</span>
                    </span>

                    {/* 「問題○」の表記（ジャンプ先ターゲット） */}
                    <span className="text-sm sm:text-base font-bold font-serif text-amber-300">
                      問題 {originalIdx + 1}
                    </span>

                    <span className="text-xs text-stone-400 font-mono">
                      （第{originalIdx + 1}問 / 全{result.questions.length}問）
                    </span>

                    <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-750">
                      {q.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-950/70 border-amber-500/70 text-amber-300'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                      }`}
                      title={isBookmarked ? '保存を解除' : '気になる問題として保存'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* 正解問題はトグルボタン、不正解問題は常に展開またはトグル */}
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs border border-stone-700 transition-colors cursor-pointer"
                    >
                      {isExpanded ? '解説を閉じる ▲' : '解説を見る ▼'}
                    </button>
                  </div>
                </div>

                {/* 問題文 */}
                <h4 className="text-sm sm:text-base font-medium text-stone-100 leading-relaxed font-serif mt-2.5">
                  {q.question}
                </h4>

                {/* あなたの回答 vs 正解 */}
                <div className="mt-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-0.5">あなたの回答:</span>
                    <span
                      className={`font-semibold ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {selectedIdx !== undefined ? `${selectedIdx + 1}. ${q.options[selectedIdx]}` : '未回答'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-0.5">正しい正解:</span>
                    <span className="font-semibold text-emerald-400">
                      {q.answer + 1}. {q.options[q.answer]}
                    </span>
                  </div>
                </div>

                {/* 展開時の統合解説（重複を排除したわかりやすい解説） */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-stone-800">
                    <UnifiedExplanation
                      question={q}
                      selectedIdx={selectedIdx}
                      onOpenFullMap={() => setShowFullMapModal(true)}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {displayedQuestions.length === 0 && (
            <div className="p-8 text-center bg-stone-850/80 border border-stone-750 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-stone-200 font-bold text-sm">
                間違えた問題はありません！全問正解です！🌸
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 寺社全体マップモーダル */}
      {showFullMapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-stone-800 flex items-center justify-between">
              <span className="font-bold text-sm text-amber-300">京都 寺社・史跡総合マップ</span>
              <button
                type="button"
                onClick={() => setShowFullMapModal(false)}
                className="p-1 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              <KyotoSpotsView onBackToHome={() => setShowFullMapModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
