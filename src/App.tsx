import React, { useState, useEffect, useMemo } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { QuizPracticeView } from './components/QuizPracticeView';
import { Quiz } from './components/Quiz';
import { Result } from './components/Result';
import { Review } from './components/Review';
import { MyPage } from './components/MyPage';
import { KyotoSpotsView } from './components/KyotoSpotsView';
import { quizQuestionsData } from './data/questionsData';
import { 
  QuizMode, 
  UserStats, 
  Question, 
  TestResult, 
  TestRecord, 
  COMMUNITY_NOTE_URL, 
  APP_50_3KYU_URL, 
  NOTE_700_3KYU_URL, 
  APP_50_2KYU_URL, 
  NOTE_700_2KYU_URL 
} from './types';
import { getWrongQuestionIds, subscribeWrongQuestionIds } from './utils/wrongQuestions';
import { UserPlus, Pause, Users, Sparkles, ExternalLink } from 'lucide-react';

const STATS_STORAGE_KEY = 'kyoto_exam_user_stats_v2';
const AUTH_STORAGE_KEY = 'kyoto_exam_auth';

export default function App() {
  // 認証ステート（端末に保存された永続ログイン、またはセッション中ログイン）
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const localAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const sessionAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return localAuth === 'authenticated_v2' || sessionAuth === 'authenticated_v2';
    } catch {
      return false;
    }
  });

  // 画面・演習モードステート
  const [currentMode, setCurrentMode] = useState<QuizMode>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<{ mode: QuizMode; category?: string } | null>(null);

  // テスト結果の一時ステート
  const [currentTestResult, setCurrentTestResult] = useState<TestResult | null>(null);

  // 間違えた問題のID配列（LocalStorage: 'wrong_question_ids' と完全同期）
  const [wrongQuestionIds, setWrongQuestionIds] = useState<number[]>(() => getWrongQuestionIds());

  useEffect(() => {
    const unsubscribe = subscribeWrongQuestionIds((updatedIds) => {
      setWrongQuestionIds(updatedIds);
    });
    return unsubscribe;
  }, []);

  // ユーザー統計ステート（集計数値・ブックマーク・テスト履歴[模試＆ミニテスト]を保持）
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            totalAnswered: typeof parsed.totalAnswered === 'number' ? parsed.totalAnswered : 0,
            correctCount: typeof parsed.correctCount === 'number' ? parsed.correctCount : 0,
            bookmarkedIds: Array.isArray(parsed.bookmarkedIds) ? parsed.bookmarkedIds : [],
            wrongIds: Array.isArray(parsed.wrongIds) ? parsed.wrongIds : [],
            testHistory: Array.isArray(parsed.testHistory) ? parsed.testHistory : [],
            lastTestScore: parsed.lastTestScore || null,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved stats from storage', e);
    }
    return {
      totalAnswered: 0,
      correctCount: 0,
      bookmarkedIds: [],
      wrongIds: [],
      testHistory: [],
      lastTestScore: null,
    };
  });

  // 統計が更新されたらlocalStorageに安全に保存
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats to storage', e);
    }
  }, [stats]);

  // 出題分野の全カテゴリ一覧（全6章順）
  const categories = useMemo(() => {
    const OFFICIAL_CATEGORY_ORDER = [
      '歴史・史跡',
      '神社・寺院',
      '建築・庭園・美術',
      '芸術・文化',
      '生活・行事',
      '公園・文化施設'
    ];
    const cats = new Set<string>();
    quizQuestionsData.forEach((q) => cats.add(q.category));
    return Array.from(cats).sort((a, b) => {
      const indexA = OFFICIAL_CATEGORY_ORDER.indexOf(a);
      const indexB = OFFICIAL_CATEGORY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, []);

  // ログイン成功ハンドラ
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // ログアウトハンドラ
  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('kyoto_exam_remember');
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCurrentMode('home');
    setCurrentTestResult(null);
  };

  const requestLogout = () => {
    handleLogout();
  };

  // 統計リセットハンドラ
  const handleResetStats = () => {
    const initialStats: UserStats = {
      totalAnswered: 0,
      correctCount: 0,
      bookmarkedIds: [],
      wrongIds: [],
      testHistory: [],
      lastTestScore: null,
    };
    setStats(initialStats);
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(initialStats));
  };

  // ブックマークトグル
  const handleToggleBookmark = (id: number) => {
    setStats((prev) => {
      const exists = prev.bookmarkedIds.includes(id);
      const newBookmarks = exists
        ? prev.bookmarkedIds.filter((bId) => bId !== id)
        : [...prev.bookmarkedIds, id];
      return {
        ...prev,
        bookmarkedIds: newBookmarks,
      };
    });
  };

  // 一問一答の回答記録
  const handleRecordAnswer = (questionId: number, isCorrect: boolean) => {
    setStats((prev) => ({
      ...prev,
      totalAnswered: prev.totalAnswered + 1,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
    }));
  };

  // テスト完了ハンドラ（ミニテスト・本番模試ともにマイページ学習カルテに保存して成績変化を確認可能に）
  const handleQuizFinish = (result: TestResult) => {
    setCurrentTestResult(result);
    setCurrentMode('result');

    const isMock = result.mode === 'mock-exam';
    const newRecord: TestRecord = {
      id: `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      testType: isMock ? 'mock' : 'mini',
      date: result.date,
      timestamp: Date.now(),
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      passed: result.passed,
      timeSpentSeconds: result.timeSpentSeconds,
      questionIds: result.questions.map((q) => q.id),
      wrongQuestionIds: result.wrongIds || [],
      userAnswers: result.userAnswers,
    };

    setStats((prev) => {
      const updatedHistory = [newRecord, ...(prev.testHistory || [])].slice(0, 100);
      return {
        ...prev,
        totalAnswered: prev.totalAnswered + result.total,
        correctCount: prev.correctCount + result.score,
        testHistory: updatedHistory,
        lastTestScore: {
          score: result.score,
          total: result.total,
          date: result.date,
          passed: result.passed,
        },
      };
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // モード開始ハンドラ
  const handleStartMode = (mode: QuizMode, category?: string) => {
    if (mode === 'weak') {
      setCurrentMode('review');
    } else {
      setCurrentMode(mode);
    }
    setSelectedCategory(category || null);
    if (mode === 'mypage') {
      window.dispatchEvent(new CustomEvent('close-mypage-modal'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ナビゲーション・画面遷移リクエスト（テスト中一時保存の確認）
  const requestModeSwitch = (mode: QuizMode, category?: string) => {
    if (currentMode === 'mini-test' || currentMode === 'mock-exam') {
      setPendingModeSwitch({ mode, category });
      return;
    }
    handleStartMode(mode, category);
  };

  const requestNavigateHome = () => {
    if (currentMode === 'mini-test' || currentMode === 'mock-exam') {
      setPendingModeSwitch({ mode: 'home' });
      return;
    }
    setCurrentTestResult(null);
    setCurrentMode('home');
  };

  // 一問一答などの表示問題セット
  const activeQuestions: Question[] = useMemo(() => {
    if (currentMode === 'category' && selectedCategory) {
      return quizQuestionsData.filter((q) => q.category === selectedCategory);
    }
    if (currentMode === 'bookmark') {
      return quizQuestionsData.filter((q) => stats.bookmarkedIds.includes(q.id));
    }
    return quizQuestionsData;
  }, [currentMode, selectedCategory, stats.bookmarkedIds]);

  const practiceTitle = useMemo(() => {
    if (currentMode === 'category') return `分野別演習：${selectedCategory}`;
    if (currentMode === 'bookmark') return 'ブックマーク問題';
    return `全${quizQuestionsData.length}問 集中マスター`;
  }, [currentMode, selectedCategory]);

  // 未ログイン時は認証画面
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Dashboardに渡す現在の統計（wrongIdsは最新のwrong_question_idsと連動）
  const dashboardStats: UserStats = {
    ...stats,
    wrongIds: wrongQuestionIds,
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* ナビゲーションバー */}
      <Navbar
        currentMode={currentMode}
        onNavigateHome={requestNavigateHome}
        onLogout={requestLogout}
        bookmarkCount={stats.bookmarkedIds.length}
        weakCount={wrongQuestionIds.length}
        onSelectBookmark={() => requestModeSwitch('bookmark')}
        onSelectWeak={() => requestModeSwitch('review')}
        onSelectMyPage={() => requestModeSwitch('mypage')}
        onSelectSpotsMap={() => requestModeSwitch('spots-map')}
        totalQuestions={quizQuestionsData.length}
      />

      {/* テスト中の画面離脱・中断防止確認モーダル */}
      {pendingModeSwitch && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPendingModeSwitch(null)}
        >
          <div 
            className="bg-stone-850 border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Pause className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif">
                  ミニテストを実施中です
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  テストを一時保存して他の画面へ移動しますか？
                </p>
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-750 rounded-xl p-3.5 text-xs text-stone-300">
              <p className="leading-relaxed">
                ※ 現在の解答状況・残り時間は自動保存されます。トップ画面の「続きから再開する」からいつでも再開できます。
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setPendingModeSwitch(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs sm:text-sm font-medium border border-stone-700 transition-colors cursor-pointer"
              >
                テストを続ける
              </button>
              <button
                onClick={() => {
                  const target = pendingModeSwitch;
                  setPendingModeSwitch(null);
                  if (target.mode === 'home') {
                    setCurrentTestResult(null);
                    setCurrentMode('home');
                  } else {
                    handleStartMode(target.mode, target.category);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>一時保存して移動</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツエリア */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* 1. ホーム / ダッシュボード */}
        {currentMode === 'home' && (
          <Dashboard
            questions={quizQuestionsData}
            stats={dashboardStats}
            onStartMode={handleStartMode}
            categories={categories}
          />
        )}

        {/* 2. テストモード（ミニテスト10問 / 模試100問） */}
        {(currentMode === 'mini-test' || currentMode === 'mock-exam') && (
          <Quiz
            key={currentMode}
            mode={currentMode}
            allQuestions={quizQuestionsData}
            onFinish={handleQuizFinish}
            onCancel={() => setCurrentMode('home')}
            bookmarkedIds={stats.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {/* 3. 結果表示画面（解答解説は保存したい場合のみ保存可能、成績はマイページに保存済み） */}
        {currentMode === 'result' && currentTestResult && (
          <Result
            result={currentTestResult}
            onRetake={() => setCurrentMode(currentTestResult.mode)}
            onGoToReview={() => setCurrentMode('review')}
            onBackToHome={() => {
              setCurrentTestResult(null);
              setCurrentMode('home');
            }}
            onGoToMyPage={() => {
              setCurrentTestResult(null);
              setCurrentMode('mypage');
            }}
            bookmarkedIds={stats.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {/* 4. 間違えた問題（復習モード：LocalStorage 'wrong_question_ids' 管理） */}
        {(currentMode === 'review' || currentMode === 'weak') && (
          <Review
            allQuestions={quizQuestionsData}
            onBackToHome={() => setCurrentMode('home')}
            onStartTest={(mode) => setCurrentMode(mode)}
            bookmarkedIds={stats.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {/* 5. 分野別演習 / 全問集中演習 / ブックマーク */}
        {(currentMode === 'all-practice' ||
          currentMode === 'category' ||
          currentMode === 'bookmark') && (
          <QuizPracticeView
            key={`${currentMode}_${selectedCategory || 'default'}`}
            questions={activeQuestions}
            title={practiceTitle}
            onBackToDashboard={() => setCurrentMode('home')}
            bookmarkedIds={stats.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {/* 6. マイページ */}
        {currentMode === 'mypage' && (
          <MyPage
            stats={dashboardStats}
            questions={quizQuestionsData}
            onBackToDashboard={() => setCurrentMode('home')}
            onStartMode={handleStartMode}
            onResetStats={handleResetStats}
          />
        )}

        {/* 7. 京都 寺社・史跡マップ（検定対応） */}
        {currentMode === 'spots-map' && (
          <KyotoSpotsView 
            onBackToHome={() => setCurrentMode('home')} 
            onResumeTest={() => {
              try {
                const raw = localStorage.getItem('kyoto_exam_active_test_session_v2');
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed && (parsed.mode === 'mini-test' || parsed.mode === 'mock-exam')) {
                    setCurrentMode(parsed.mode);
                    return;
                  }
                }
              } catch {
                // ignore
              }
              setCurrentMode('mini-test');
            }}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-stone-800/80 py-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 space-y-3">
          {/* 公式note・コミュニティ・上位版リンク */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            {/* 3級 700問 Webアプリ */}
            <a
              href={NOTE_700_3KYU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black transition-all shadow-md active:scale-95 border border-amber-300/80"
              title="【京都検定3級】完全攻略700問＋本番100問模試・ミニテスト・復習・地図機能付きWebアプリ"
            >
              <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
              <span>【3級】完全攻略700問 Webアプリ</span>
              <ExternalLink className="w-3 h-3 text-stone-950 stroke-[2.5]" />
            </a>

            <a
              href={APP_50_3KYU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-850 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/50 text-stone-200 hover:text-amber-300 transition-all shadow-sm"
              title="【京都検定3級】厳選50問＋10問ミニテスト機能付き Webアプリ"
            >
              <span className="font-bold">【3級】厳選50問 Webアプリ</span>
              <ExternalLink className="w-3 h-3 stroke-[2]" />
            </a>

            <a
              href={NOTE_700_2KYU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 hover:text-white font-bold transition-all shadow-sm"
              title="【京都検定2級】完全対策700問＋本番模試100問（価格: 3,300円）"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>【2級】完全対策700問 (3,300円)</span>
              <ExternalLink className="w-3 h-3 stroke-[2]" />
            </a>

            <a
              href={APP_50_2KYU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-850 hover:bg-stone-800 border border-stone-700 hover:border-indigo-400/50 text-stone-200 hover:text-indigo-300 transition-all shadow-sm"
              title="【京都検定2級】厳選50問＋ミニテスト機能付き Webアプリ"
            >
              <span className="font-bold">【2級】厳選50問 Webアプリ</span>
              <ExternalLink className="w-3 h-3 stroke-[2]" />
            </a>

            <a
              href={COMMUNITY_NOTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200 transition-all shadow-sm"
              title="公式コミュニティ＆メンバーシップ（クイズ出題＆1級論述添削）"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold">公式コミュニティ</span>
              <ExternalLink className="w-3 h-3 stroke-[2]" />
            </a>
          </div>

          {/* 公式X（Twitter）リンク */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs pt-1">
            <a
              href="https://twitter.com/intent/follow?screen_name=Kyoto_TopMaster"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-200 hover:text-white transition-all inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-amber-400/50 shadow-sm"
              title="Xで直接フォローする"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>@Kyoto_TopMaster をフォロー</span>
            </a>
            <span className="text-stone-700 hidden sm:inline">|</span>
            <a
              href="https://x.com/Kyoto_TopMaster"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span className="font-bold text-xs text-amber-400">𝕏</span>
              <span>受験生意見交換</span>
            </a>
            <span className="text-stone-700">|</span>
            <a
              href="https://x.com/Kyoto_TopMaster"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span className="font-bold text-xs text-amber-400">𝕏</span>
              <span>間違い指摘、改善、要望、感想</span>
            </a>
          </div>
          <p className="text-stone-500 pt-1">© 京都・観光文化検定試験 3級 合格対策クイズプログラム</p>
          <p className="text-stone-600 text-[11px]">
            出題分野全6章対応（厳選全{quizQuestionsData.length}問収録） / 5問ミニテスト機能付き【無料お試し版】 / 間違えた問題（復習）LocalStorage管理
          </p>
        </div>
      </footer>
    </div>
  );
}
