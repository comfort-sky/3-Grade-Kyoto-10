import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Pause, 
  Play, 
  Bookmark, 
  AlertTriangle,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  MapPin,
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import { Question, TestResult } from '../types';
import { getRandomQuestions } from '../utils/quizHelper';
import { addWrongQuestionIds } from '../utils/wrongQuestions';
import { triggerPassConfetti } from '../utils/confetti';

export const ACTIVE_TEST_STORAGE_KEY = 'kyoto_exam_active_test_session_v2';

interface QuizProps {
  mode: 'mini-test' | 'mock-exam';
  allQuestions: Question[];
  onFinish: (result: TestResult) => void;
  onCancel: () => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
}

export const Quiz: React.FC<QuizProps> = ({
  mode,
  allQuestions,
  onFinish,
  onCancel,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const isMockExam = mode === 'mock-exam';
  const targetCount = isMockExam ? Math.min(100, allQuestions.length) : Math.min(5, allQuestions.length);
  const initialTimeSeconds = isMockExam ? 90 * 60 : 8 * 60; // 模試90分 / ミニテスト8分

  // 前回の進行中セッションを安全に復元
  const getSavedSession = () => {
    try {
      const raw = localStorage.getItem(ACTIVE_TEST_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.mode === mode &&
        Array.isArray(parsed.questions) &&
        parsed.questions.length > 0
      ) {
        return {
          questions: parsed.questions as Question[],
          currentIndex:
            typeof parsed.currentIndex === 'number' &&
            parsed.currentIndex >= 0 &&
            parsed.currentIndex < parsed.questions.length
              ? parsed.currentIndex
              : 0,
          userAnswers:
            parsed.userAnswers && typeof parsed.userAnswers === 'object'
              ? parsed.userAnswers
              : {},
          timeRemaining:
            typeof parsed.timeRemaining === 'number' && parsed.timeRemaining > 0
              ? parsed.timeRemaining
              : initialTimeSeconds,
        };
      }
    } catch (e) {
      console.warn('Failed to load active test session', e);
    }
    return null;
  };

  const initialSession = getSavedSession();

  // 問題データステート（保存セッションがあれば復元、なければランダム抽出）
  const [questions, setQuestions] = useState<Question[]>(() =>
    initialSession ? initialSession.questions : getRandomQuestions(allQuestions, targetCount)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    initialSession ? initialSession.currentIndex : 0
  );
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number }>(() =>
    initialSession ? initialSession.userAnswers : {}
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(() =>
    initialSession ? initialSession.timeRemaining : initialTimeSeconds
  );
  const [hasRestoredSession, setHasRestoredSession] = useState<boolean>(!!initialSession);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [startTime] = useState<number>(() => Date.now());

  // ブラウザの誤リロードやタブ閉じ防止
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 回答中セッションのlocalStorage自動バックアップ（スマホのスリープやタブ切り替え、リロードでも100%保護）
  useEffect(() => {
    if (questions.length > 0) {
      try {
        const sessionPayload = {
          mode,
          questionIds: questions.map((q) => q.id),
          questions,
          currentIndex,
          userAnswers,
          timeRemaining,
          lastUpdated: Date.now(),
        };
        localStorage.setItem(ACTIVE_TEST_STORAGE_KEY, JSON.stringify(sessionPayload));
      } catch (e) {
        console.warn('Failed to autosave active test session', e);
      }
    }
  }, [mode, questions, currentIndex, userAnswers, timeRemaining]);

  // カウントダウンタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 時間切れ時の自動採点
  useEffect(() => {
    if (timeRemaining === 0) {
      handleCompleteSubmission();
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIdx: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIdx,
    }));
  };

  // 採点＆完了処理
  const handleCompleteSubmission = () => {
    // 進行中セッションを削除
    try {
      localStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
    } catch {
      // ignore
    }

    let score = 0;
    const wrongIds: number[] = [];

    questions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) {
        score += 1;
      } else {
        wrongIds.push(q.id);
      }
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;
    const rank: 'S' | 'A' | 'B' | 'C' =
      percentage >= 90 ? 'S' : percentage >= 70 ? 'A' : percentage >= 50 ? 'B' : 'C';

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 合格時に紙吹雪
    if (passed) {
      setTimeout(() => {
        triggerPassConfetti();
      }, 150);
    }

    // 間違えた問題IDをLocalStorage（wrong_question_ids）に自動保存（軽量化設計：ID配列のみ）
    if (wrongIds.length > 0) {
      addWrongQuestionIds(wrongIds);
    }

    const resultPayload: TestResult = {
      mode,
      questions,
      userAnswers,
      score,
      total,
      percentage,
      passed,
      rank,
      timeSpentSeconds,
      date: formattedDate,
      wrongIds,
    };

    onFinish(resultPayload);
  };

  // 最初から解き直す（セッションクリアして新規問題抽出）
  const handleRestartFresh = () => {
    try {
      localStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
    } catch {
      // ignore
    }
    const newQuestions = getRandomQuestions(allQuestions, targetCount);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeRemaining(initialTimeSeconds);
    setHasRestoredSession(false);
    setShowExitConfirm(false);
  };

  // 中断データを破棄して終了
  const handleDiscardAndExit = () => {
    try {
      localStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
    } catch {
      // ignore
    }
    setShowExitConfirm(false);
    onCancel();
  };

  // 一時保存して終了（localStorageに保持したままホームへ戻る）
  const handleSaveAndExit = () => {
    setShowExitConfirm(false);
    onCancel();
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <h3 className="text-lg font-bold text-stone-200">問題データが見つかりませんでした</h3>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 rounded-lg bg-stone-800 text-stone-200 text-sm border border-stone-600 hover:bg-stone-700 cursor-pointer"
        >
          ホームへ戻る
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const isBookmarked = bookmarkedIds.includes(currentQ.id);
  const answeredCount = Object.keys(userAnswers).length;

  // 未回答問題のインデックス一覧
  const unansweredIndices = useMemo(() => {
    return questions
      .map((q, idx) => (userAnswers[q.id] === undefined ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [questions, userAnswers]);

  // 指定問題番号へのジャンプ
  const handleJumpToQuestion = (targetIdx: number) => {
    setCurrentIndex(targetIdx);
    requestAnimationFrame(() => {
      const qCard = document.getElementById('main-question-card');
      if (qCard) {
        const rect = qCard.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: Math.max(0, rect.top + scrollTop - 75), behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-20">
      {/* 自動復元通知バナー */}
      {hasRestoredSession && (
        <div className="bg-amber-950/60 border border-amber-500/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-200 animate-fadeIn shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              前回の回答途中データから自動復元しました（現在: 第{currentIndex + 1}問 / 回答済み: {answeredCount}問）
            </span>
          </div>
          <button
            onClick={handleRestartFresh}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium shrink-0 cursor-pointer"
            title="現在の回答を破棄して最初から解き直す"
          >
            最初から解き直す
          </button>
        </div>
      )}

      {/* 中断確認モーダル */}
      {showExitConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowExitConfirm(false)}
        >
          <div 
            className="bg-stone-850 border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp"
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
                  中断しても解答状況は安全に自動保存されています
                </p>
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-750 rounded-xl p-3.5 text-xs text-stone-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-400">現在の回答状況:</span>
                <span className="font-mono font-bold text-amber-400">
                  {answeredCount} / {questions.length} 問回答済み
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">残り時間:</span>
                <span className="font-mono font-bold text-stone-200">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">現在表示中の問題:</span>
                <span className="font-mono text-stone-300">
                  第 {currentIndex + 1} 問
                </span>
              </div>
              <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                ※「一時保存して戻る」を押すと、トップ画面の「続きから再開する」からいつでも再開できます。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>テストを続ける</span>
              </button>
              <button
                onClick={handleSaveAndExit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>一時保存して戻る</span>
              </button>
            </div>

            <div className="text-center pt-2 border-t border-stone-800">
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

      {/* 提出確認モーダル（未回答がある場合） */}
      {showSubmitConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div 
            className="bg-stone-850 border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif">
                  テストを提出して採点しますか？
                </h3>
                <p className="text-xs text-rose-300 mt-0.5 font-medium">
                  ⚠️ 未回答の問題は「不正解」として採点されます
                </p>
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-750 rounded-xl p-3.5 text-xs text-stone-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-400">回答済み問題:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {answeredCount} 問
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">未回答問題:</span>
                <span className="font-mono font-bold text-rose-400">
                  {unansweredIndices.length} 問
                </span>
              </div>

              {unansweredIndices.length > 0 && (
                <div className="pt-2 border-t border-stone-800 space-y-1.5">
                  <span className="text-amber-300 block text-[11px] font-bold">
                    未回答の問題をタップしてジャンプ:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-stone-950/50 rounded-lg border border-stone-800">
                    {unansweredIndices.map((uIdx) => (
                      <button
                        key={uIdx}
                        type="button"
                        onClick={() => {
                          setShowSubmitConfirm(false);
                          handleJumpToQuestion(uIdx);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        title={`第${uIdx + 1}問へジャンプして回答する`}
                      >
                        <span>第{uIdx + 1}問へ ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  if (unansweredIndices.length > 0) {
                    handleJumpToQuestion(unansweredIndices[0]);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>未回答（第{unansweredIndices[0] + 1}問）に戻る</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleCompleteSubmission();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs sm:text-sm font-medium border border-stone-700 transition-colors cursor-pointer"
              >
                <span>このまま採点する</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* トップヘッダー：モード名、進捗、タイマー、中断 */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-3 sm:p-4 shadow-lg flex items-center justify-between gap-3">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors py-1.5 px-2.5 rounded-lg bg-stone-800/90 hover:bg-stone-750 border border-amber-500/30 shrink-0 cursor-pointer shadow-sm"
          title="テストを一時保存して中断する"
        >
          <Pause className="w-3.5 h-3.5 text-amber-400" />
          <span>中断・一時保存</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-300 hidden sm:inline">
            {isMockExam ? '本番模試（100問）' : 'ミニテスト（10問）'}
          </span>

          <div className="text-xs text-stone-300 whitespace-nowrap flex items-center gap-2">
            <span>回答: <span className="font-mono font-bold text-amber-400">{answeredCount}</span> / {questions.length}</span>
            {unansweredIndices.length > 0 && (
              <button
                type="button"
                onClick={() => handleJumpToQuestion(unansweredIndices[0])}
                className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/35 font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                title={`未回答の第${unansweredIndices[0] + 1}問へジャンプ`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                <span>未回答 {unansweredIndices.length}問 ↗</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 border border-stone-750 text-xs font-mono font-bold text-stone-100 whitespace-nowrap shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={timeRemaining < 180 ? 'text-rose-400 animate-pulse font-extrabold' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* 問題ナビゲーションボタンバー（横スクロールで全問行き来可能） */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1">
        {questions.map((q, idx) => {
          const isAnswered = userAnswers[q.id] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => handleJumpToQuestion(idx)}
              className={`relative w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center justify-center border cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md scale-105 ring-2 ring-amber-400/50'
                  : isAnswered
                  ? 'bg-stone-750 text-stone-200 border-stone-600 hover:bg-stone-700'
                  : 'bg-stone-900/90 text-rose-300 border border-dashed border-rose-500/40 hover:bg-stone-850 hover:border-rose-400'
              }`}
              title={`第${idx + 1}問へジャンプ（${isAnswered ? '回答済' : '未回答'}）`}
            >
              <span>{idx + 1}</span>
              {!isAnswered && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* メイン問題カード */}
      <div id="main-question-card" className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5 scroll-mt-24">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-amber-400">
              {currentQ.category}
            </span>
            {currentQ.difficulty && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                難易度: {currentQ.difficulty}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-stone-300">
              第 {currentIndex + 1} 問 <span className="text-stone-500 font-normal">/ 全 {questions.length} 問</span>
            </span>
            <button
              onClick={() => onToggleBookmark(currentQ.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-sm'
                  : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-750'
              }`}
              title={isBookmarked ? 'ブックマーク解除' : '気になる問題としてブックマーク'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="text-[11px] hidden sm:inline">{isBookmarked ? '保存中' : '保存'}</span>
            </button>
          </div>
        </div>

        {/* 問題文 */}
        <div className="pt-1">
          <h3 className="text-base sm:text-lg font-medium text-stone-100 leading-relaxed font-serif">
            {currentQ.question}
          </h3>
        </div>

        {/* 4択選択肢リスト */}
        <div className="space-y-2.5 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = userAnswers[currentQ.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/40 shadow-sm'
                    : 'bg-stone-900/70 border-stone-750 text-stone-200 hover:bg-stone-800 hover:border-stone-600'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 border ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="flex-1 leading-relaxed pt-0.5">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* フッター操作バー（前へ、次へ、提出） */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-stone-300 text-xs sm:text-sm border border-stone-750 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>前の問題</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
          >
            <span>次の問題</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (answeredCount < questions.length) {
                setShowSubmitConfirm(true);
              } else {
                handleCompleteSubmission();
              }
            }}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>テストを提出して採点</span>
          </button>
        )}
      </div>

      {/* 未回答アナウンス＆ジャンプ機能 */}
      {unansweredIndices.length > 0 && (
        <div 
          onClick={() => handleJumpToQuestion(unansweredIndices[0])}
          className="bg-gradient-to-r from-amber-950/60 via-stone-850 to-amber-950/60 border-2 border-amber-500/70 hover:border-amber-400 rounded-2xl p-4 text-xs shadow-lg animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-stone-100 font-bold text-sm">
                未回答の問題が <span className="text-rose-400 font-mono text-base font-extrabold">{unansweredIndices.length}</span> 問あります
              </p>
              <p className="text-[11px] text-amber-300/90 mt-0.5 font-medium">
                👉 ここをタップすると未回答の第{unansweredIndices[0] + 1}問へ直接ジャンプします
              </p>
            </div>
          </div>

          <div 
            className="flex items-center gap-2 flex-wrap justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 最初の未回答へ直行ボタン */}
            <button
              type="button"
              onClick={() => handleJumpToQuestion(unansweredIndices[0])}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              title={`未回答の第${unansweredIndices[0] + 1}問へジャンプ`}
            >
              <span>未回答（第{unansweredIndices[0] + 1}問）へジャンプ ↗</span>
            </button>

            {/* 複数ある場合は各問題番号へ個別ジャンプ（漏れなくすべて一覧表示） */}
            {unansweredIndices.length > 1 && (
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {unansweredIndices.map((uIdx) => (
                  <button
                    key={uIdx}
                    type="button"
                    onClick={() => handleJumpToQuestion(uIdx)}
                    className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-rose-300 font-mono text-xs font-bold border border-rose-500/40 hover:border-rose-400 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                    title={`未回答の第${uIdx + 1}問へジャンプ`}
                  >
                    第{uIdx + 1}問 ↗
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
