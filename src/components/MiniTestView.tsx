import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Send,
  AlertTriangle,
  BookOpen,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  BarChart3,
  UserPlus,
  Pause,
  Play,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  X,
  Info,
  Download,
  FileText
} from 'lucide-react';
import { Question } from '../types';
import { triggerPassConfetti } from '../utils/confetti';
import { RANK_LEGEND_ITEMS } from './MyPage';
import { downloadTestResultCSV, downloadTestResultText } from '../utils/exportTestResult';
import { addWrongQuestionIds } from '../utils/wrongQuestions';
import { UnifiedExplanation } from './UnifiedExplanation';

interface MiniTestViewProps {
  allQuestions: Question[];
  mode?: 'mini-test' | 'mock-exam';
  onFinishTest: (
    score: number, 
    total: number, 
    wrongIds: number[], 
    timeSpentSeconds: number, 
    testType?: 'mini' | 'mock',
    questionIds?: number[],
    userAnswers?: { [questionId: number]: number }
  ) => void;
  onBackToDashboard: () => void;
  onGoToMyPage?: () => void;
  onStartReviewPractice?: (wrongIds: number[]) => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
}

export const ACTIVE_TEST_STORAGE_KEY = 'kyoto_exam_active_test_session_v2';

export const MiniTestView: React.FC<MiniTestViewProps> = ({
  allQuestions,
  mode = 'mini-test',
  onFinishTest,
  onBackToDashboard,
  onGoToMyPage,
  onStartReviewPractice,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const isMockExam = mode === 'mock-exam';
  const targetCount = isMockExam ? Math.min(100, allQuestions.length) : Math.min(5, allQuestions.length);
  const initialTimeSeconds = isMockExam ? 90 * 60 : 8 * 60; // 模試90分 (5400秒) / ミニテスト8分 (480秒)

  // 重複解答・同一テーマ重複を徹底排除した問題抽出関数
  const generateQuestions = () => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected: Question[] = [];
    const usedAnswers = new Set<string>();

    for (const q of shuffled) {
      const rawAns = q.options[q.answer] || '';
      const cleanAns = rawAns
        .replace(/（[^）]+）/g, '')
        .replace(/\([^)]+\)/g, '')
        .replace(/／.+/g, '')
        .trim();
      const key = cleanAns.length >= 2 ? cleanAns : rawAns;

      if (!usedAnswers.has(key)) {
        usedAnswers.add(key);
        selected.push(q);
      }
      if (selected.length >= targetCount) break;
    }

    // もし一意の正解数で足りない場合のフォールバック（ID重複なしで補填）
    if (selected.length < targetCount) {
      for (const q of shuffled) {
        if (!selected.some((s) => s.id === q.id)) {
          selected.push(q);
        }
        if (selected.length >= targetCount) break;
      }
    }

    return selected;
  };

  // 前回の進行中セッションを安全に復元
  const getSavedSession = () => {
    try {
      const raw = localStorage.getItem(ACTIVE_TEST_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.mode === mode &&
        Array.isArray(parsed.questionIds) &&
        parsed.questionIds.length > 0
      ) {
        const qMap = new Map<number, Question>(allQuestions.map((q) => [q.id, q]));
        const restored: Question[] = [];
        for (const id of parsed.questionIds) {
          const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
          const q = qMap.get(numId);
          if (q) restored.push(q);
        }
        if (restored.length === parsed.questionIds.length) {
          const restoredIdx =
            typeof parsed.currentIdx === 'number' &&
            parsed.currentIdx >= 0 &&
            parsed.currentIdx < restored.length
              ? parsed.currentIdx
              : 0;
          const restoredAnswers =
            parsed.userAnswers && typeof parsed.userAnswers === 'object'
              ? parsed.userAnswers
              : {};
          const restoredTime =
            typeof parsed.timeRemaining === 'number' && parsed.timeRemaining > 0
              ? parsed.timeRemaining
              : initialTimeSeconds;

          return {
            questions: restored,
            currentIdx: restoredIdx,
            userAnswers: restoredAnswers,
            timeRemaining: restoredTime,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load active test session', e);
    }
    return null;
  };

  const initialSession = getSavedSession();

  const [testQuestions, setTestQuestions] = useState<Question[]>(() =>
    initialSession ? initialSession.questions : generateQuestions()
  );
  const [currentIdx, setCurrentIdx] = useState<number>(() =>
    initialSession ? initialSession.currentIdx : 0
  );
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number }>(() =>
    initialSession ? initialSession.userAnswers : {}
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(() =>
    initialSession ? initialSession.timeRemaining : initialTimeSeconds
  );
  const [reviewFilter, setReviewFilter] = useState<'wrong' | 'all' | 'correct'>('wrong');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasRestoredSession] = useState(!!initialSession);
  const [showRankLegendModal, setShowRankLegendModal] = useState(false);
  const [showLeaveWarningConfirm, setShowLeaveWarningConfirm] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState<(() => void) | null>(null);
  const [hasDownloadedResults, setHasDownloadedResults] = useState(false);
  const [mockBlockTab, setMockBlockTab] = useState<'wrong' | 'all' | number>('wrong');

  const scrollToReviewQuestion = (qId: number) => {
    const el = document.getElementById(`review-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = (idsToExpand: number[]) => {
    setExpandedIds(new Set(idsToExpand));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // ブラウザの誤リロードやタブ閉じを防止するbeforeunload
  useEffect(() => {
    if (isSubmitted) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitted]);

  // 回答中セッションのlocalStorage自動バックアップ（スマホのスリープや予期せぬリロードでも100%保護）
  useEffect(() => {
    if (isSubmitted) {
      try {
        localStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
      return;
    }

    if (testQuestions.length > 0) {
      try {
        const sessionPayload = {
          mode,
          questionIds: testQuestions.map((q) => q.id),
          currentIdx,
          userAnswers,
          timeRemaining,
          lastUpdated: Date.now(),
        };
        localStorage.setItem(ACTIVE_TEST_STORAGE_KEY, JSON.stringify(sessionPayload));
      } catch (e) {
        console.warn('Failed to autosave active test session', e);
      }
    }
  }, [testQuestions, currentIdx, userAnswers, timeRemaining, isSubmitted, mode]);

  // 安全なカウントダウンタイマー（state更新内でのhandleSubmit直接呼び出しによるクラッシュを防止）
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // 残り時間が0になった時の自動提出（useEffect経由で安全に実行）
  useEffect(() => {
    if (!isSubmitted && timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (isSubmitted) return;
    const current = testQuestions[currentIdx];
    if (!current) return;
    const qId = current.id;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    try {
      localStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
    } catch (e) {
      // ignore
    }

    let score = 0;
    const wrongIds: number[] = [];

    testQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) {
        score += 1;
      } else {
        wrongIds.push(q.id);
      }
    });

    const timeSpent = initialTimeSeconds - timeRemaining;
    const passed = score / testQuestions.length >= 0.7;

    if (passed) {
      setTimeout(() => {
        triggerPassConfetti();
      }, 150);
    }

    const questionIds = testQuestions.map((q) => q.id);
    onFinishTest(
      score, 
      testQuestions.length, 
      wrongIds, 
      timeSpent, 
      isMockExam ? 'mock' : 'mini',
      questionIds,
      userAnswers
    );

    if (wrongIds.length > 0) {
      addWrongQuestionIds(wrongIds);
      setReviewFilter('wrong');
      setMockBlockTab('wrong');
      setExpandedIds(new Set(wrongIds));
    } else {
      setReviewFilter('all');
      setMockBlockTab(1);
      setExpandedIds(new Set());
    }
  };

  const requestLeaveResultScreen = (action: () => void) => {
    // もしすでにダウンロード済みならそのまま画面遷移
    if (hasDownloadedResults) {
      action();
      return;
    }
    // 未ダウンロードの場合は警告モーダルを表示
    setPendingLeaveAction(() => action);
    setShowLeaveWarningConfirm(true);
  };

  const handleRestartNewTest = () => {
    try {
      localStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    const newQuestions = generateQuestions();
    setTestQuestions(newQuestions);
    setUserAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setTimeRemaining(initialTimeSeconds);
    setExpandedIds(new Set());
    setReviewFilter('wrong');
    setCopied(false);
    setShowExitConfirm(false);
    setShowLeaveWarningConfirm(false);
    setHasDownloadedResults(false);
    setPendingLeaveAction(null);
  };

  const handleBackRequest = () => {
    if (isSubmitted) {
      requestLeaveResultScreen(() => onBackToDashboard());
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleDiscardAndExit = () => {
    try {
      localStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setShowExitConfirm(false);
    onBackToDashboard();
  };

  const answeredCount = Object.keys(userAnswers).length;
  const safeIdx = Math.max(0, Math.min(testQuestions.length - 1, currentIdx));
  const currentQ = testQuestions[safeIdx] || testQuestions[0];
  const isBookmarked = currentQ ? bookmarkedIds.includes(currentQ.id) : false;

  // 採点計算
  const calculateResult = () => {
    let score = 0;
    testQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) score += 1;
    });
    const percentage = Math.round((score / testQuestions.length) * 100);
    const passed = percentage >= 70;
    const rank = percentage >= 90 ? 'S' : percentage >= 70 ? 'A' : percentage >= 50 ? 'B' : 'C';
    return { score, total: testQuestions.length, percentage, passed, rank };
  };

  const result = isSubmitted ? calculateResult() : null;

  // ツイッター（X）シェア用のテキスト生成（ミニテストと本番100問模試で文言を明確に分岐）
  const getShareText = () => {
    if (!result) return '';
    if (isMockExam) {
      // 本番100問模試用のツイート文言
      const statusText = result.passed 
        ? '🌸【本番合格圏突破】70点以上をクリア！本番合格に向けて視界良好！' 
        : '🌿【要復習・再挑戦】合格基準（70点）目指して苦手分野を集中対策中！';
      return `【京都検定3級 本番模試（全${result.total}問・90分）】\n結果：${result.total}問中 ${result.score}問正解（得点率 ${result.percentage}%）\n判定：${result.rank}判定\n${statusText}\n\n#京都検定 #京都検定3級 #本番模試 #京都観光文化検定 #合格対策 #京都`;
    } else {
      // 5問ミニテスト用のツイート文言
      const statusText = result.passed ? '🌸 合格ライン突破（70%以上達成）！' : '🌿 要復習（次回リベンジ）';
      return `【京都検定3級 対策ミニテスト（5問）】\n結果：${result.total}問中 ${result.score}問正解（正答率 ${result.percentage}%）\n判定：${result.rank}判定（${statusText}）\n\n#京都検定 #京都検定3級 #京都観光文化検定 #京都 #資格試験`;
    }
  };

  const shareText = result ? getShareText() : '';
  const twitterShareUrl = result ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` : '#';

  const handleCopyShareText = () => {
    if (!shareText) return;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* 中断確認モーダル */}
      {showExitConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowExitConfirm(false)}
        >
          <div 
            className="bg-stone-850 border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                <Pause className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif">
                  {isMockExam ? '本番模試を一時中断しますか？' : 'ミニテストを一時中断しますか？'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  いつでもダッシュボードから続きを再開できます
                </p>
              </div>
            </div>

            {/* 回答状況と残り時間の明示ブロック */}
            <div className="bg-stone-900/95 border border-stone-750 rounded-xl p-4 text-xs sm:text-sm text-stone-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">現在の回答状況:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {answeredCount} / {testQuestions.length} 問回答済み
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">残り時間:</span>
                <span className="font-mono font-bold text-stone-100 text-sm">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">現在表示中の問題:</span>
                <span className="font-mono text-stone-300">
                  第 {currentIdx + 1} 問
                </span>
              </div>
              <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 leading-relaxed">
                ※「一時保存して戻る」を押すと、現在の回答状況・残り時間がそのまま端末に保存されます。トップ画面の「続きから再開する」からいつでも再開できます。
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>テストを続ける</span>
              </button>
              <button
                onClick={onBackToDashboard}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold border border-amber-500/40 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span>一時保存して戻る</span>
              </button>
            </div>

            <div className="text-center pt-1 border-t border-stone-800/80">
              <button
                onClick={handleDiscardAndExit}
                className="text-stone-500 hover:text-red-400 text-xs transition-colors py-1 cursor-pointer underline decoration-stone-600 hover:decoration-red-400"
              >
                中断データを破棄して戻る（最初からやり直す）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 自動復元通知バナー */}
      {hasRestoredSession && !isSubmitted && (
        <div className="bg-amber-950/50 border border-amber-500/50 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400 shrink-0" />
            <span>前回の回答途中データから自動復元しました（回答済み: {answeredCount}/{testQuestions.length}問）</span>
          </div>
          <button
            onClick={handleRestartNewTest}
            className="text-[11px] text-amber-400 hover:underline shrink-0"
          >
            最初から解き直す
          </button>
        </div>
      )}

      {/* 上部ヘッダー（タイマー＆進捗） */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-3 sm:p-4 shadow-lg flex items-center justify-between gap-2">
        <button
          onClick={handleBackRequest}
          className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors py-1.5 px-2.5 rounded-lg bg-stone-800/90 hover:bg-stone-750 border border-amber-500/30 shrink-0 cursor-pointer shadow-sm"
          title="テストを一時保存して中断する"
        >
          <Pause className="w-3.5 h-3.5 text-amber-400" />
          <span>中断<span className="hidden sm:inline">・一時保存</span></span>
        </button>

        {!isSubmitted ? (
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* 解答状況 */}
            <div className="text-xs text-stone-300 whitespace-nowrap">
              回答: <span className="font-mono font-bold text-amber-400">{answeredCount}</span>/{testQuestions.length}
            </div>

            {/* タイマー */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-750 text-xs font-mono font-bold text-stone-200 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className={timeRemaining < 180 ? 'text-red-400 animate-pulse' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs font-semibold px-2 py-1 rounded bg-stone-800 text-stone-300 shrink-0 whitespace-nowrap">
            {isMockExam ? '本番模試採点完了' : 'ミニテスト採点完了'}
          </div>
        )}
      </div>

      {/* テスト受験中画面 */}
      {!isSubmitted && (
        <>
          {/* 問題ナビゲーションバブル（全問を一覧で行き来可能） */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {testQuestions.map((q, idx) => {
              const answered = userAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                      : answered
                      ? 'bg-stone-750 text-stone-200 border-stone-600'
                      : 'bg-stone-900/80 text-stone-500 border-stone-800 hover:text-stone-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* 問題カード */}
          <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-800 border border-stone-750 text-amber-400">
                  {currentQ.category}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  第 {currentIdx + 1} 問 / 全 {testQuestions.length} 問
                </span>
              </div>

              <button
                onClick={() => onToggleBookmark(currentQ.id)}
                title={isBookmarked ? "気になる問題の保存を解除" : "後で復習するためにこの問題を保存（ブックマーク）"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  isBookmarked
                    ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-sm'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-750'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="text-[11px] font-medium">{isBookmarked ? '保存中' : '後で復習（保存）'}</span>
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-medium text-stone-100 leading-relaxed">
              {currentQ.question}
            </h3>

            {/* 選択肢 */}
            <div className="space-y-3 mt-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-medium ring-1 ring-amber-500/40'
                        : 'bg-stone-900/80 hover:bg-stone-800/90 border-stone-750 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 border ${
                        isSelected 
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold' 
                          : 'bg-stone-800 text-stone-400 border-stone-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 前へ・次へ・提出ボタン */}
          <div className="flex items-center justify-between pt-2 gap-2">
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-stone-200 text-xs sm:text-sm border border-stone-750 transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>前の問題</span>
            </button>

            {/* スマホでも迷わず中断できる「一時保存」ボタン */}
            <button
              onClick={handleBackRequest}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>一時保存して中断</span>
            </button>

            {currentIdx < testQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((p) => Math.min(testQuestions.length - 1, p + 1))}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-100 font-medium text-xs sm:text-sm border border-stone-700 transition-colors shrink-0 cursor-pointer"
              >
                <span>次の問題</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>テストを提出して採点</span>
              </button>
            )}
          </div>

          {/* 未回答がある場合の案内＆ジャンプ */}
          {answeredCount < testQuestions.length && (() => {
            const firstUnanswered = testQuestions.findIndex((q) => userAnswers[q.id] === undefined);
            return (
              <div 
                onClick={() => {
                  if (firstUnanswered !== -1) {
                    setCurrentIdx(firstUnanswered);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }
                }}
                className="bg-amber-950/40 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 text-xs shadow-md animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-stone-200">
                    未回答の問題が <strong className="text-rose-400 font-mono text-sm">{testQuestions.length - answeredCount}</strong> 問あります（タップでジャンプ ↗）
                  </span>
                </div>
                <div 
                  className="flex items-center gap-1.5 flex-wrap justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {testQuestions
                    .map((q, idx) => (userAnswers[q.id] === undefined ? idx : -1))
                    .filter((i) => i !== -1)
                    .map((uIdx) => (
                      <button
                        key={uIdx}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(uIdx);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow transition-all active:scale-95 cursor-pointer"
                        title={`第${uIdx + 1}問へジャンプ`}
                      >
                        第{uIdx + 1}問へジャンプ ↗
                      </button>
                    ))}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* 採点結果発表・詳細レビュー画面 */}
      {isSubmitted && result && (() => {
        const wrongQuestions = testQuestions.filter((q) => userAnswers[q.id] !== q.answer);
        const correctQuestions = testQuestions.filter((q) => userAnswers[q.id] === q.answer);
        const wrongIds = wrongQuestions.map((q) => q.id);

        return (
          <div className="space-y-8 animate-fadeIn">
          {/* スコア・合否バナー */}
          <div className={`p-6 sm:p-8 rounded-2xl border text-center relative overflow-hidden ${
            result.passed
              ? 'bg-gradient-to-b from-emerald-950/60 to-stone-900 border-emerald-500/60 shadow-xl shadow-emerald-950/30'
              : 'bg-gradient-to-b from-stone-850 to-stone-900 border-stone-700 shadow-xl'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900/90 border border-stone-700 mb-3 shadow-inner">
              <Award className={`w-8 h-8 ${result.passed ? 'text-emerald-400' : 'text-stone-400'}`} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-100">
              {result.passed ? '【合格ライン到達！】' : '【不合格（要復習）】'}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span className={`inline-flex items-center font-mono font-bold px-3 py-1 rounded-full text-sm border ${
                result.rank === 'S'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : result.rank === 'A'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : result.rank === 'B'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              }`}>
                判定ランク：{result.rank}判定
              </span>
              <button
                onClick={() => setShowRankLegendModal(true)}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-amber-300 border border-stone-750 transition-colors cursor-pointer"
                title="判定基準（凡例）を確認する"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>判定の基準・凡例</span>
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              （京都検定3級 合格基準：正解率70%以上）
            </p>

            <div className="flex items-baseline justify-center gap-2 my-4">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-stone-100">
                {result.score}
              </span>
              <span className="text-lg text-stone-400 font-mono">
                / {result.total} 問正解
              </span>
              <span className="text-sm font-bold text-amber-400 ml-2">
                （正答率 {result.percentage}%）
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              {result.passed
                ? 'おめでとうございます！京都検定3級合格基準の70%をクリアしています。この調子で全問マスターを目指しましょう！'
                : '合格ライン（70%以上 / 4問正解）まであと少し！間違えた問題の解説をよく読んで、再度チャレンジしてみましょう。'}
            </p>

            {/* ツイッター（X）投稿用エリア（デフォルトで結果を記載） */}
            <div className="mt-6 pt-5 border-t border-stone-800/80 max-w-lg mx-auto text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-200 font-bold flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>成績をツイッター（X）に投稿する</span>
                </span>
                <span className="text-[11px] text-stone-400">
                  ※結果があらかじめ記載されています
                </span>
              </div>

              {/* デフォルトで結果が記載されている投稿文プレビュー */}
              <div className="bg-stone-900/90 border border-stone-700/80 rounded-xl p-3 text-xs font-mono text-stone-200 leading-relaxed shadow-inner mb-3 whitespace-pre-wrap select-all">
                {shareText}
              </div>

              {/* 投稿用ボタン（リンク形式でiframe環境やポップアップブロックを回避） */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-950/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {/* Twitter / X ロゴ */}
                  <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>ツイッターに成績を投稿する</span>
                </a>

                <button
                  onClick={handleCopyShareText}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-stone-100 text-xs sm:text-sm border border-stone-700 hover:border-stone-600 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">投稿文をコピー完了！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-400" />
                      <span>投稿文をコピー</span>
                    </>
                  )}
                </button>
              </div>

              {/* 公式アカウント直接フォロー案内 */}
              <div className="mt-2.5 flex items-center justify-center">
                <a
                  href="https://twitter.com/intent/follow?screen_name=Kyoto_TopMaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-stone-100 text-[11px] font-medium border border-stone-700 hover:border-sky-400/40 transition-colors"
                >
                  <UserPlus className="w-3 h-3 text-sky-400" />
                  <span>京都検定公式𝕏（@Kyoto_TopMaster）をフォローする</span>
                </a>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-5 border-t border-stone-800/80">
              <button
                onClick={handleRestartNewTest}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isMockExam ? '新しい問題で本番模試に再挑戦（100問）' : '新しい問題で再テスト（ランダム10問）'}</span>
              </button>

              {onGoToMyPage && (
                <button
                  onClick={onGoToMyPage}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 font-medium text-xs sm:text-sm border border-stone-700 hover:border-amber-500/40 transition-colors flex items-center gap-1.5"
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>マイページで成績グラフを見る</span>
                </button>
              )}

              <button
                onClick={onBackToDashboard}
                className="px-5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs sm:text-sm border border-stone-750 transition-colors"
              >
                ダッシュボードへ戻る
              </button>
            </div>
          </div>

          {/* 出題問題の全問レビュー・復習セクション */}
          <div className="space-y-5 pt-2">
            {/* レビューヘッダー＆クイック特訓バナー */}
            <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif flex items-center gap-2">
                      <span>出題問題の正誤確認・全問徹底復習</span>
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                        全 {testQuestions.length} 問
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      正誤の確認と、4つの各選択肢の解説・試験頻出ポイントを復習できます。
                    </p>
                  </div>
                </div>

                {/* 間違えた問題がある場合、今すぐ復習特訓できるボタン＆ダウンロードボタン群 */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {wrongQuestions.length > 0 && onStartReviewPractice && (
                    <button
                      onClick={() => onStartReviewPractice(wrongIds)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>間違えた {wrongQuestions.length} 問を今すぐ特訓</span>
                    </button>
                  )}

                  {/* 解答・解説ダウンロードボタン群 */}
                  <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-750">
                    <button
                      onClick={() => {
                        downloadTestResultCSV(
                          {
                            title: isMockExam ? '本番模試（100問）' : '対策ミニテスト（10問）',
                            date: new Date().toLocaleString('ja-JP'),
                            score: result.score,
                            total: result.total,
                            percentage: result.percentage,
                            passed: result.passed,
                            rank: result.rank
                          },
                          testQuestions,
                          userAnswers
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 text-xs font-medium border border-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                      title="問題・回答・全選択肢解説・頻出ポイントをCSV（Excel形式）で保存"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV保存</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadTestResultText(
                          {
                            title: isMockExam ? '本番模試（100問）' : '対策ミニテスト（10問）',
                            date: new Date().toLocaleString('ja-JP'),
                            score: result.score,
                            total: result.total,
                            percentage: result.percentage,
                            passed: result.passed,
                            rank: result.rank
                          },
                          testQuestions,
                          userAnswers
                        );
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 text-xs font-medium border border-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                      title="問題・回答・全選択肢解説・頻出ポイントをテキスト形式で保存"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>解答をテキストで保存</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* A. 10問ミニテストの場合のナビゲーション                      */}
              {/* ============================================================ */}
              {!isMockExam && (
                <div className="pt-4 space-y-3">
                  {wrongQuestions.length > 0 ? (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/60 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-xs text-rose-200 font-bold flex-wrap gap-1">
                        <span className="flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>間違えた問題（不正解 {wrongQuestions.length}問）:</span>
                        </span>
                        <span className="text-[11px] text-rose-300/80 font-normal">
                          タップで該当問題の先頭へ直接ジャンプ
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {wrongQuestions.map((wq) => {
                          const origIdx = testQuestions.findIndex((q) => q.id === wq.id);
                          return (
                            <button
                              key={wq.id}
                              type="button"
                              onClick={() => {
                                if (reviewFilter === 'correct') setReviewFilter('all');
                                if (!expandedIds.has(wq.id)) toggleExpand(wq.id);
                                scrollToReviewQuestion(wq.id);
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

                  {/* 絞り込みタブ */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('wrong')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        reviewFilter === 'wrong'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>間違えた問題のみ表示 ({wrongQuestions.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        reviewFilter === 'all'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>全10問を表示 ({testQuestions.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* B. 100問模試の場合の10問刻み＋間違えた問題ナビゲーション    */}
              {/* ============================================================ */}
              {isMockExam && (
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-400 flex-wrap gap-1">
                    <span className="font-medium text-stone-200">10問刻み・間違えた問題ナビゲーション:</span>
                    <span className="text-[11px] text-stone-400">タブ選択で10問ずつ快適に確認できます</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-stone-900 border border-stone-800">
                    {/* 間違えた問題のみタブ */}
                    <button
                      type="button"
                      onClick={() => setMockBlockTab('wrong')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        mockBlockTab === 'wrong'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/80'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>間違えた問題のみ ({wrongQuestions.length})</span>
                    </button>

                    {/* 10問刻みボタン (1〜10, 11〜20, ...) */}
                    {Array.from({ length: Math.ceil(testQuestions.length / 10) }).map((_, pIdx) => {
                      const pageNum = pIdx + 1;
                      const startNum = pIdx * 10 + 1;
                      const endNum = Math.min((pIdx + 1) * 10, testQuestions.length);
                      const isCurrent = mockBlockTab === pageNum;

                      const blockWrongCount = testQuestions
                        .slice(pIdx * 10, (pIdx + 1) * 10)
                        .filter((q) => userAnswers[q.id] !== q.answer).length;

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setMockBlockTab(pageNum)}
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

                    <button
                      type="button"
                      onClick={() => setMockBlockTab('all')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        mockBlockTab === 'all'
                          ? 'bg-stone-200 text-stone-950 font-bold shadow-sm'
                          : 'bg-stone-850 text-stone-400 hover:text-stone-200 border border-stone-750'
                      }`}
                    >
                      全{testQuestions.length}問表示
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* レビューリスト */}
            <div className="space-y-3.5">
              {(() => {
                const displayedReviewQuestions = (() => {
                  if (!isMockExam) {
                    if (reviewFilter === 'wrong') return wrongQuestions;
                    return testQuestions;
                  }
                  if (mockBlockTab === 'wrong') return wrongQuestions;
                  if (mockBlockTab === 'all') return testQuestions;
                  const pIdx = typeof mockBlockTab === 'number' ? mockBlockTab - 1 : 0;
                  return testQuestions.slice(pIdx * 10, (pIdx + 1) * 10);
                })();

                return displayedReviewQuestions.map((q) => {
                  const originalIdx = testQuestions.findIndex((tq) => tq.id === q.id);
                  const selected = userAnswers[q.id];
                  const isCorrect = selected === q.answer;
                  const isExpanded = expandedIds.has(q.id);
                  const isBookmarked = bookmarkedIds.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      id={`review-q-${q.id}`}
                      className={`scroll-mt-24 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-stone-850/80 border-stone-750'
                          : 'bg-stone-850/95 border-red-800/60 shadow-md shadow-red-950/20'
                      }`}
                    >
                      {/* ヘッダー行 */}
                      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="mt-0.5 shrink-0">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-stone-300">
                                第 {originalIdx + 1} 問
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700 font-medium">
                                {q.category}
                              </span>
                              {q.difficulty && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                                  {q.difficulty}
                                </span>
                              )}
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                isCorrect 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}>
                                {isCorrect ? '正解 ⭕' : '不正解 ❌'}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-stone-100 leading-snug font-serif">
                              {q.question}
                            </p>
                            
                            {/* コンパクトサマリー：回答と正解 */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                              <span className={`px-2 py-0.5 rounded ${
                                isCorrect 
                                  ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-800/40' 
                                  : 'text-red-300 bg-red-950/40 border border-red-800/40'
                              }`}>
                                回答: {selected !== undefined ? q.options[selected] : '未回答'}
                              </span>
                              {!isCorrect && (
                                <span className="text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded font-semibold">
                                  正解: {q.options[q.answer]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-stone-400">
                          <button
                            type="button"
                            onClick={() => onToggleBookmark(q.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isBookmarked
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                            }`}
                            title={isBookmarked ? 'ブックマーク解除' : 'ブックマークに保存'}
                          >
                            <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleExpand(q.id)}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs border border-stone-700 transition-colors cursor-pointer"
                          >
                            {isExpanded ? '解説を閉じる ▲' : '解説を見る ▼'}
                          </button>
                        </div>
                      </div>

                      {/* 展開時：統合解説（重複を排除したわかりやすい解説） */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-stone-800">
                          <UnifiedExplanation question={q} selectedIdx={selected} />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* 出題問題がない場合の空状態 */}
            {testQuestions.filter((q) => {
              if (reviewFilter === 'wrong') return userAnswers[q.id] !== q.answer;
              if (reviewFilter === 'correct') return userAnswers[q.id] === q.answer;
              return true;
            }).length === 0 && (
              <div className="p-8 text-center bg-stone-850/80 border border-stone-750 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-stone-200 font-bold text-sm">
                  {reviewFilter === 'wrong' ? '間違えた問題はありません！全問正解です！🌸' : '該当する問題がありません'}
                </p>
                {reviewFilter === 'wrong' && (
                  <button
                    onClick={() => setReviewFilter('all')}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-amber-300 text-xs font-medium border border-stone-700"
                  >
                    全問題の解説を見る
                  </button>
                )}
              </div>
            )}

            {/* ボトムアクションバー */}
            <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-6 text-center space-y-4 mt-6">
              <div className="text-xs text-stone-300">
                出題全{result.total}問の確認が完了しました。今回の成績（<span className="font-bold font-mono text-amber-400">{result.score}/{result.total}問正解</span>）はマイページの学習実績に永久保存されています。
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {wrongQuestions.length > 0 && onStartReviewPractice && (
                  <button
                    onClick={() => onStartReviewPractice(wrongIds)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>間違えた {wrongQuestions.length} 問を集中特訓する</span>
                  </button>
                )}

                {onGoToMyPage && (
                  <button
                    onClick={onGoToMyPage}
                    className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 font-bold text-xs sm:text-sm border border-stone-700 hover:border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>マイページで成績推移を見る</span>
                  </button>
                )}

                <button
                  onClick={handleRestartNewTest}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-stone-950" />
                  <span>{isMockExam ? '新しい問題で模試に再挑戦（100問）' : '新しい問題で再テスト（5問）'}</span>
                </button>

                <button
                  onClick={onBackToDashboard}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs sm:text-sm border border-stone-700 transition-colors cursor-pointer"
                >
                  ダッシュボードへ戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* 判定ランク基準・凡例モーダルダイアログ */}
    {showRankLegendModal && (
      <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-stone-900 border border-stone-750 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
          {/* ヘッダー */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-850">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-100 font-serif">
                  京都検定3級 判定ランク（S / A / B / C）の算出基準・凡例
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  各判定ランクの正解率と合否目安
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRankLegendModal(false)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 本文 */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-stone-300 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">
                  京都検定3級 合格基準：70%以上（100問中70問以上正解 / 5問中4問以上正解）
                </span>
                <span>
                  本番の京都検定3級試験では総得点の70%以上で合格となります。当アプリでは、70%以上のスコアに対して「A判定（合格圏）」または「S判定（合格確実）」を判定しています。
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {RANK_LEGEND_ITEMS.map((item) => (
                <div 
                  key={item.rank} 
                  className="p-4 rounded-xl bg-stone-850 border border-stone-750/80 hover:border-stone-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center justify-center font-mono font-bold px-3 py-1 rounded-md text-sm border ${item.badgeColor}`}>
                        {item.rank}判定
                      </span>
                      <div>
                        <span className="text-sm font-bold text-stone-100">
                          {item.label}
                        </span>
                        <span className="text-xs text-amber-300 font-mono font-bold ml-2">
                          【正解率 {item.percentage}】
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                        本番100問: <strong className="text-amber-300">{item.score100}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                        5問ミニ: <strong className="text-amber-300">{(item as any).score5 || item.score10}</strong>
                      </span>
                      <span className={`font-semibold ${item.rank === 'S' || item.rank === 'A' ? 'text-emerald-400' : 'text-stone-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 mt-2.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* フッター */}
          <div className="p-4 border-t border-stone-800 bg-stone-850 flex items-center justify-end">
            <button
              onClick={() => setShowRankLegendModal(false)}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow transition-all cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
