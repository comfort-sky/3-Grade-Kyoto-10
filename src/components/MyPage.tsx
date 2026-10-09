import React, { useState, useRef, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  RotateCcw, 
  Bookmark, 
  Sparkles, 
  ArrowLeft,
  Trash2,
  BookOpen,
  MessageSquare,
  ExternalLink,
  UserPlus,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  Download,
  FileText,
  Users,
  GraduationCap
} from 'lucide-react';
import { UserStats, Question, TestRecord, COMMUNITY_NOTE_URL, APP_50_3KYU_URL, NOTE_700_3KYU_URL } from '../types';
import { downloadTestResultCSV, downloadTestResultText } from '../utils/exportTestResult';
import { SeriesPromotionSection } from './SeriesPromotionSection';

interface MyPageProps {
  stats: UserStats;
  questions: Question[];
  onBackToDashboard: () => void;
  onStartMode: (mode: any, category?: string, customIds?: number[]) => void;
  onResetStats?: () => void;
}

// 判定ランク基準・凡例データ
export const RANK_LEGEND_ITEMS = [
  {
    rank: 'S',
    label: '合格確実',
    score100: '90点以上',
    score10: '5問（満点）',
    score5: '5問（満点）',
    percentage: '90%以上',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    dotColor: 'bg-emerald-400',
    description: '京都検定3級合格は確実圏。基本事項が完璧に定着しています。',
    status: '合格 🌸'
  },
  {
    rank: 'A',
    label: '合格圏到達',
    score100: '70〜89点',
    score10: '4問',
    score5: '4問',
    percentage: '70〜89%',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    dotColor: 'bg-amber-400',
    description: '合格ライン（70%以上）を突破。本番合格圏内です。',
    status: '合格 🌸'
  },
  {
    rank: 'B',
    label: 'あと一歩',
    score100: '50〜69点',
    score10: '3問',
    score5: '3問',
    percentage: '50〜69%',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    dotColor: 'bg-sky-400',
    description: '合格ラインまであと一歩。間違えた問題の復習が鍵です。',
    status: '要復習 🌿'
  },
  {
    rank: 'C',
    label: '要復習',
    score100: '49点以下',
    score10: '2問以下',
    score5: '2問以下',
    percentage: '49%以下',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    dotColor: 'bg-rose-400',
    description: '基礎固め推奨。主要な社寺や歴史から見直しましょう。',
    status: '要復習 ⛩️'
  }
];

export const MyPage: React.FC<MyPageProps> = ({
  stats,
  questions,
  onBackToDashboard,
  onStartMode,
  onResetStats,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [graphFilter, setGraphFilter] = useState<'all' | 'mini'>('all');
  const [reviewingRecord, setReviewingRecord] = useState<TestRecord | null>(null);
  const [modalFilter, setModalFilter] = useState<'wrong' | 'all' | 'correct'>('wrong');
  const [modalExpandedIds, setModalExpandedIds] = useState<Set<number>>(new Set());
  const [historyTab, setHistoryTab] = useState<'all' | 'passed' | 'failed'>('all');
  const [historyLimit, setHistoryLimit] = useState<number>(15);
  const [showRankLegendModal, setShowRankLegendModal] = useState<boolean>(false);
  const modalScrollContainerRef = useRef<HTMLDivElement>(null);

  // モーダルを開いた時に一番上にスクロールする
  useEffect(() => {
    if (reviewingRecord) {
      if (modalScrollContainerRef.current) {
        modalScrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [reviewingRecord, modalFilter]);

  // スムーズスクロール
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-amber-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-amber-400');
      }, 1600);
    }
  };

  // 履歴データ（最新順）
  const history: TestRecord[] = [...(stats.testHistory || [])].sort((a, b) => b.timestamp - a.timestamp);

  // 5問ミニテスト 指標
  const miniHistory = history;
  const miniTotal = miniHistory.length;
  const miniPassed = miniHistory.filter((h) => h.passed).length;
  const miniPassRate = miniTotal > 0 ? Math.round((miniPassed / miniTotal) * 100) : 0;
  const miniHighest = miniTotal > 0 ? Math.max(...miniHistory.map((h) => h.score)) : 0;
  const miniAverage = miniTotal > 0 
    ? (miniHistory.reduce((acc, h) => acc + h.score, 0) / miniTotal).toFixed(1) 
    : '0.0';
  const miniAvgPercent = miniTotal > 0 
    ? (miniHistory.reduce((acc, h) => acc + h.percentage, 0) / miniTotal).toFixed(1) 
    : '0.0';

  // 通算正答率
  const overallAccuracy = stats.totalAnswered > 0 
    ? Math.round((stats.correctCount / stats.totalAnswered) * 100) 
    : 0;

  // 各テストレコードの得点・正答率からS/A/B/C判定を算出するヘルパー関数
  const getTestRank = (percentage: number) => {
    if (percentage >= 90) {
      return { rank: 'S', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: '合格確実' };
    } else if (percentage >= 70) {
      return { rank: 'A', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: '合格圏' };
    } else if (percentage >= 50) {
      return { rank: 'B', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40', label: '要復習' };
    }
    return { rank: 'C', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: '基礎強化' };
  };

  // 直近成績（直近3回）に基づく総合ランク判定
  const overallRank = React.useMemo(() => {
    if (!history || history.length === 0) {
      return { rank: '未判定', color: 'text-stone-400 bg-stone-800 border-stone-700', text: 'ミニテスト受験で判定' };
    }
    const recent = history.slice(0, 3);
    const avgPercentage = recent.reduce((sum, r) => sum + r.percentage, 0) / recent.length;
    if (avgPercentage >= 90) {
      return { rank: 'S判定', color: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/60', text: `合格確実ライン（直近平均 ${avgPercentage.toFixed(0)}%）` };
    } else if (avgPercentage >= 70) {
      return { rank: 'A判定', color: 'text-amber-300 bg-amber-950/80 border-amber-500/60', text: `合格圏内（直近平均 ${avgPercentage.toFixed(0)}%）` };
    } else if (avgPercentage >= 55) {
      return { rank: 'B判定', color: 'text-sky-300 bg-sky-950/80 border-sky-500/60', text: `あと少しで合格圏（直近平均 ${avgPercentage.toFixed(0)}%）` };
    }
    return { rank: 'C判定', color: 'text-rose-300 bg-rose-950/80 border-rose-500/60', text: `基礎固め推奨（直近平均 ${avgPercentage.toFixed(0)}%）` };
  }, [history]);

  // 全出題カテゴリ一覧（全6章順）
  const OFFICIAL_CATEGORY_ORDER = [
    '歴史・史跡',
    '神社・寺院',
    '建築・庭園・美術',
    '芸術・文化',
    '生活・行事',
    '公園・文化施設'
  ];
  const categories = Array.from(new Set<string>(questions.map((q) => q.category))).sort((a, b) => {
    const indexA = OFFICIAL_CATEGORY_ORDER.indexOf(a);
    const indexB = OFFICIAL_CATEGORY_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  // グラフ用フィルタリング＆時系列データ（古い順）
  const filteredChronologicalHistory = React.useMemo(() => {
    const subset = [...(stats.testHistory || [])];
    return subset.sort((a, b) => a.timestamp - b.timestamp);
  }, [stats.testHistory]);

  // SVGグラフ設定
  const graphWidth = 600;
  const graphHeight = 220;
  const paddingX = 45;
  const paddingY = 32;
  const usableWidth = graphWidth - paddingX * 2;
  const usableHeight = graphHeight - paddingY * 2;

  // グラフの目盛り設定
  const isMiniGraph = graphFilter === 'mini';
  const gridVals = isMiniGraph ? [0, 5, 7, 10] : [0, 50, 70, 100];
  const passVal = isMiniGraph ? 7 : 70;
  const maxVal = isMiniGraph ? 10 : 100;

  // 表示用データ（長くなりすぎないよう件数制限＆展開）
  const displayedHistory = React.useMemo(() => {
    const list = history.filter((h) => {
      if (historyTab === 'passed') return h.passed;
      if (historyTab === 'failed') return !h.passed;
      return true;
    });
    return list.slice(0, historyLimit);
  }, [history, historyTab, historyLimit]);

  const totalFilteredCount = React.useMemo(() => {
    if (historyTab === 'passed') return history.filter((h) => h.passed).length;
    if (historyTab === 'failed') return history.filter((h) => !h.passed).length;
    return history.length;
  }, [historyTab, history]);

  // ユーザー指定フォーマットに準拠したX（Twitter）投稿URLの生成
  const getRecordTweetUrl = (rec: TestRecord) => {
    const title = '【京都検定3級 10問無料お試し版】ミニテスト';

    let dateStr = '';
    try {
      const d = new Date(rec.date);
      if (!isNaN(d.getTime())) {
        dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } else {
        const match = rec.date.match(/(?:20\d{2}[\/\-])?0?(\d{1,2})[\/\-]0?(\d{1,2})\s+(\d{1,2}:\d{2})/);
        dateStr = match ? `${parseInt(match[1])}/${match[2]} ${match[3]}` : rec.date;
      }
    } catch {
      dateStr = rec.date;
    }

    let rankLabel = '';
    if (rec.percentage >= 90) {
      rankLabel = 'S判定（🌸 合格確実！）';
    } else if (rec.percentage >= 70) {
      rankLabel = 'A判定（🌸 合格ライン突破！）';
    } else if (rec.percentage >= 50) {
      rankLabel = 'B判定（あと一歩！要復習🌿）';
    } else {
      rankLabel = 'C判定（基礎固め推奨⛩️）';
    }

    const tweet = `${title}\n受験日時：${dateStr}\n結果：${rec.total}問中 ${rec.score}問正解（正答率 ${rec.percentage}%）\n判定：${rankLabel}\n\n#京都検定 #京都検定3級`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
  };

  // モーダル用問題リスト展開
  const toggleModalExpand = (id: number) => {
    setModalExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAllModal = (ids: number[]) => {
    setModalExpandedIds(new Set(ids));
  };

  const collapseAllModal = () => {
    setModalExpandedIds(new Set());
  };

  // 出題問題・解答解説シートを開くハンドラー（初期表示を適切に設定）
  const openReviewModal = (rec: TestRecord) => {
    setReviewingRecord(rec);
    const wrongCount = rec.wrongQuestionIds ? rec.wrongQuestionIds.length : (rec.total - rec.score);
    // 間違えた問題がある場合は「間違えた問題」タブ、満点の場合は「全問」タブを初期選択
    if (wrongCount > 0) {
      setModalFilter('wrong');
      setModalExpandedIds(new Set(rec.wrongQuestionIds || []));
    } else {
      setModalFilter('all');
      setModalExpandedIds(new Set(rec.questionIds || []));
    }
  };

  // 外部（ナビバー等）からマイページが再クリックされた際に開いているモーダルを閉じる
  useEffect(() => {
    const handleCloseReviewModal = () => {
      setReviewingRecord(null);
    };
    window.addEventListener('close-mypage-modal', handleCloseReviewModal);
    return () => {
      window.removeEventListener('close-mypage-modal', handleCloseReviewModal);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* 戻るナビゲーション */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-stone-850 border border-stone-800 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span><span className="hidden sm:inline">ダッシュボードへ</span>戻る</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
            京都検定3級 学習カルテ
          </span>
        </div>
      </div>

      {/* ユーザーヘッダーバナー */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-750 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-100">
                  学習カルテ（模試・ミニテスト実績）
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                  京都検定3級
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${overallRank.color}`}>
                  <Award className="w-3 h-3" />
                  <span>{overallRank.rank}：{overallRank.text}</span>
                </span>
                <button
                  onClick={() => setShowRankLegendModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors cursor-pointer"
                  title="S/A/B/C判定の基準と合格ラインを見る"
                >
                  <HelpCircle className="w-3 h-3 text-amber-400" />
                  <span>判定基準（凡例）</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                毎回ランダム5問ミニテストの受験成績と日々の弱点克服状況を一元管理できます。
              </p>
            </div>
          </div>

          {/* クイックアクションボタン群 */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onStartMode('mini-test')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-stone-950" />
              <span>ミニテストに挑戦（5問）</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主要サマリー指標カード（ミニテスト・学習実績・弱点問題の3枠構成、正解率データ統合＆履歴直結リンク） */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* カード1: 5問ミニテスト（クリックでミニテスト履歴へジャンプ） */}
        <div 
          onClick={() => {
            setHistoryTab('all');
            scrollToSection('test-history-section');
          }}
          className="bg-stone-850/90 hover:bg-stone-800/90 border border-stone-750 hover:border-amber-500/60 rounded-xl p-4 shadow-sm transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          title="クリックすると5問ミニテストの受験履歴へジャンプします"
        >
          <div>
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5 group-hover:text-amber-200 transition-colors">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>5問ミニテスト</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800">
                制限8分
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-1">
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                  {miniTotal}
                </span>
                <span className="text-xs text-stone-400 font-normal ml-1">回受験</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">平均正解率</span>
                <span className="text-lg font-bold font-mono text-amber-300">
                  {miniAvgPercent}%
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-xs text-stone-300 space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">最高得点:</span>
                <span className="font-mono font-bold text-amber-400">{miniHighest} / 5点</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">合格率（4問以上）:</span>
                <span className="font-mono font-bold text-emerald-300">{miniPassRate}%</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-amber-400/90 group-hover:text-amber-300 font-medium">
            <span>▼ ミニテストの履歴を見る ({miniTotal}件)</span>
            <span className="text-[10px] opacity-70 group-hover:translate-y-0.5 transition-transform">↓</span>
          </div>
        </div>

        {/* カード2: 通算演習・学習実績 */}
        <div 
          onClick={() => onStartMode('all-practice')}
          className="bg-stone-850/90 hover:bg-stone-800/90 border border-stone-750 hover:border-amber-500/60 rounded-xl p-4 shadow-sm transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          title={`クリックすると全${questions.length}問集中マスター演習を開始します`}
        >
          <div>
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
              <span className="font-semibold text-stone-200 flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span>通算演習・学習実績</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800">
                厳選{questions.length}問
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-1">
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-100">
                  {stats.totalAnswered}
                </span>
                <span className="text-xs text-stone-400 font-normal ml-1">問解答</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">通算正答率</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {stats.totalAnswered > 0 ? Math.round((stats.correctCount / stats.totalAnswered) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-xs text-stone-300 space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">通算正解数:</span>
                <span className="font-mono font-bold text-emerald-400">{stats.correctCount} 問</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">ブックマーク登録:</span>
                <span className="font-mono font-bold text-amber-300">{stats.bookmarkedIds.length} 問</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-300 group-hover:text-amber-300 font-medium">
            <span>▼ 全{questions.length}問演習を開始する →</span>
            <span className="text-[10px] opacity-70 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* カード3: 要復習（弱点問題・ブックマーク） */}
        <div 
          onClick={() => stats.wrongIds.length > 0 && onStartMode('weak')}
          className={`bg-stone-850/90 border border-stone-750 rounded-xl p-4 shadow-sm transition-all duration-200 flex flex-col justify-between ${
            stats.wrongIds.length > 0 ? 'hover:bg-stone-800/90 hover:border-red-500/60 cursor-pointer group' : ''
          }`}
          title={stats.wrongIds.length > 0 ? 'クリックすると弱点問題の集中特訓を開始します' : '現在弱点問題はありません'}
        >
          <div>
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5 group-hover:text-rose-200 transition-colors">
                <RotateCcw className="w-4 h-4 text-red-400 shrink-0 group-hover:rotate-180 transition-transform duration-300" />
                <span>要復習（弱点問題）</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800">
                要克服
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-1">
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-red-400">
                  {stats.wrongIds.length}
                </span>
                <span className="text-xs text-stone-400 font-normal ml-1">問</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">保存済み</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  ★ {stats.bookmarkedIds.length}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-xs text-stone-300 space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">累計演習問題数:</span>
                <span className="font-mono text-stone-200">{stats.totalAnswered} 問</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">通算正答数:</span>
                <span className="font-mono text-emerald-400">{stats.correctCount} 問</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
            {stats.wrongIds.length > 0 ? (
              <>
                <span className="text-red-400 font-bold group-hover:underline">
                  弱点集中特訓を開始する →
                </span>
                <span className="text-red-400 text-[10px] font-mono">今すぐ復習</span>
              </>
            ) : (
              <span className="text-emerald-400 text-[11px] font-medium">
                苦手な問題はありません 🌸
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 成績推移グラフカード */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-stone-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-stone-100 font-serif">
                成績推移グラフ（合否判定ライン付き）
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              5問ミニテストの得点推移と京都検定3級合格ライン（4点・70％以上）
            </p>
          </div>

          {/* グラフ絞り込み切り替えタブ */}
          <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setGraphFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                graphFilter === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              正答率（％）
            </button>
            <button
              onClick={() => setGraphFilter('mini')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                graphFilter === 'mini'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              得点（/10点）
            </button>
          </div>
        </div>

        {filteredChronologicalHistory.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30 text-stone-500" />
            <p className="text-sm font-medium text-stone-300">
              まだミニテストの受験履歴がありません
            </p>
            <p className="text-xs text-stone-500 mt-1">
              ミニテストを受験すると、ここに日々の成績推移グラフが自動プロットされます。
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => onStartMode('mini-test')}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                ミニテストに挑戦する（10問）
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[520px] relative">
              <svg 
                viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
                className="w-full h-auto overflow-visible select-none"
              >
                {/* 背景グリッド線 */}
                {gridVals.map((val) => {
                  const y = paddingY + usableHeight - (val / maxVal) * usableHeight;
                  const isPassLine = val === passVal;

                  return (
                    <g key={val}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={graphWidth - paddingX}
                        y2={y}
                        stroke={isPassLine ? '#10b981' : '#333'}
                        strokeWidth={isPassLine ? 1.5 : 1}
                        strokeDasharray={isPassLine ? '4,4' : '2,2'}
                        opacity={isPassLine ? 0.85 : 0.4}
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fill={isPassLine ? '#34d399' : '#888'}
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                        fontWeight={isPassLine ? 'bold' : 'normal'}
                      >
                        {val}{isMiniGraph ? '点' : '%'}
                      </text>
                    </g>
                  );
                })}

                {/* 合格ラインラベル */}
                <text
                  x={graphWidth - paddingX}
                  y={paddingY + usableHeight - (passVal / maxVal) * usableHeight - 6}
                  fill="#34d399"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  {isMiniGraph ? '7点 合格ライン' : '70% 合格ライン'}
                </text>

                {/* 折れ線プロット計算 */}
                {(() => {
                  const points = filteredChronologicalHistory.map((h, index) => {
                    const count = filteredChronologicalHistory.length;
                    const x = count === 1
                      ? graphWidth / 2
                      : paddingX + (index / (count - 1)) * usableWidth;

                    // Y軸の正規化計算（満点に応じた正確なパーセンテージまたは点数）
                    let plottedVal = h.percentage;
                    if (isMiniGraph) {
                      plottedVal = (h.score / h.total) * 10;
                    }
                    // 上限下限クリップ
                    const clampedVal = Math.max(0, Math.min(maxVal, plottedVal));
                    const y = paddingY + usableHeight - (clampedVal / maxVal) * usableHeight;

                    return { x, y, record: h, index, plottedVal: Math.round(plottedVal) };
                  });

                  // 折れ線パス
                  const pathD = points.length > 1
                    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
                    : '';

                  // エリアグラデーションパス
                  const areaD = points.length > 1
                    ? `${pathD} L ${points[points.length - 1].x} ${paddingY + usableHeight} L ${points[0].x} ${paddingY + usableHeight} Z`
                    : '';

                  return (
                    <>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* 塗りつぶし領域 */}
                      {areaD && (
                        <path d={areaD} fill="url(#scoreGradient)" />
                      )}

                      {/* 折れ線 */}
                      {pathD && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* データポイント点 */}
                      {points.map((p) => {
                        const isHovered = hoveredPointIndex === p.index;
                        const isPass = p.record.passed;
                        const isMock = p.record.testType === 'mock' || p.record.total >= 50;

                        return (
                          <g 
                            key={p.index}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(p.index)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                            onClick={() => setReviewingRecord(p.record)}
                          >
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={isHovered ? 6.5 : isMock ? 5 : 4}
                              fill={isPass ? '#10b981' : isMock ? '#ef4444' : '#f59e0b'}
                              stroke="#1c1917"
                              strokeWidth="2"
                              className="transition-all"
                            />
                            {/* 点数ラベル */}
                            <text
                              x={p.x}
                              y={p.y - 8}
                              fill={isPass ? '#34d399' : '#fbbf24'}
                              fontSize="10"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {isMiniGraph ? p.record.score : `${p.record.percentage}%`}
                            </text>
                            {/* X軸ラベル */}
                            <text
                              x={p.x}
                              y={paddingY + usableHeight + 16}
                              fill="#78716c"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              {p.record.date.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* ホバー詳細ツールチップ */}
              {hoveredPointIndex !== null && filteredChronologicalHistory[hoveredPointIndex] && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-stone-900 border border-amber-500/60 p-3 rounded-xl shadow-2xl text-xs pointer-events-none z-20 flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        10問ミニ
                      </span>
                      <span>{filteredChronologicalHistory[hoveredPointIndex].date}</span>
                    </div>
                    <div className="font-bold text-stone-100 flex items-center gap-2 mt-1">
                      <span className="text-amber-400 text-sm font-mono font-extrabold">
                        {filteredChronologicalHistory[hoveredPointIndex].score} / {filteredChronologicalHistory[hoveredPointIndex].total} 問正解
                      </span>
                      <span className="text-stone-300 font-mono">
                        （{filteredChronologicalHistory[hoveredPointIndex].percentage}%）
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        filteredChronologicalHistory[hoveredPointIndex].passed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {filteredChronologicalHistory[hoveredPointIndex].passed ? '合格 🌸' : '要復習 🌿'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-amber-300 font-medium border-l border-stone-800 pl-3">
                    クリックで全問復習カルテ表示
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 分野別（カテゴリー別）問題数＆学習ショートカット */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-stone-100 font-serif">
              分野別 習熟状況
            </h3>
          </div>
          <span className="text-xs text-stone-400">
            全 {categories.length} 分野（タップで演習開始）
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const catQuestions = questions.filter((q) => q.category === cat);
            const totalInCat = catQuestions.length;
            const wrongInCat = catQuestions.filter((q) => stats.wrongIds.includes(q.id)).length;
            const bookmarkedInCat = catQuestions.filter((q) => stats.bookmarkedIds.includes(q.id)).length;
            const chapterNames: Record<string, string> = {
              '歴史・史跡': '第1章',
              '神社・寺院': '第2章',
              '建築・庭園・美術': '第3章',
              '芸術・文化': '第4章',
              '生活・行事': '第5章',
              '公園・文化施設': '第6章',
            };
            const chapter = chapterNames[cat] || '';

            return (
              <button
                key={cat}
                onClick={() => onStartMode('category', cat)}
                className="p-3.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-750 hover:border-amber-500/50 text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {chapter && (
                    <span className="text-[10px] font-mono text-amber-400/90 font-semibold block mb-0.5">
                      {chapter}
                    </span>
                  )}
                  <div className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors">
                    {cat}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    収録: {totalInCat} 問
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-800 text-[10px]">
                  {wrongInCat > 0 ? (
                    <span className="text-red-400 font-medium">
                      要復習: {wrongInCat} 問
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">
                      苦手なし
                    </span>
                  )}
                  {bookmarkedInCat > 0 && (
                    <span className="text-amber-400 font-medium ml-auto">
                      ★ {bookmarkedInCat}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 統合: テスト受験履歴・学習実績カルテ */}
      <div 
        id="test-history-section" 
        className="bg-stone-850/90 border border-stone-750 rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 scroll-mt-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-stone-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-stone-100 font-serif">
                  受験履歴・カルテ一覧
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  全 {history.length} 件
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                10問ミニテストの受験結果（合否・得点・正答率・詳細カルテ）を記録し、成績の変化を確認できます。
              </p>
            </div>
          </div>

          {/* 履歴フィルタータブ（すべて / 合格 / 要復習） */}
          <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => {
                setHistoryTab('all');
                setHistoryLimit(15);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                historyTab === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              すべて ({history.length})
            </button>
            <button
              onClick={() => {
                setHistoryTab('passed');
                setHistoryLimit(15);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                historyTab === 'passed'
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              合格 🌸 ({history.filter(h => h.passed).length})
            </button>
            <button
              onClick={() => {
                setHistoryTab('failed');
                setHistoryLimit(15);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                historyTab === 'failed'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              要復習 🌿 ({history.filter(h => !h.passed).length})
            </button>
          </div>
        </div>

        {displayedHistory.length === 0 ? (
          <div className="text-center py-8 px-4 bg-stone-900/50 rounded-xl border border-dashed border-stone-750">
            <Award className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-300">
              まだミニテストの受験履歴がありません
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
              10問ミニテストを受験すると、ここに毎回のスコア・合否・詳細カルテが保存され、成績の変化をいつでも確認できます。
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => onStartMode('mini-test')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-stone-950" />
                <span>ミニテストを受験（10問）</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400">
                    <th className="pb-2 font-medium">種別・受験日時</th>
                    <th className="pb-2 font-medium">得点</th>
                    <th className="pb-2 font-medium">正解率</th>
                    <th className="pb-2 font-medium">
                      <button
                        onClick={() => setShowRankLegendModal(true)}
                        className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer group"
                        title="判定ランク（S/A/B/C）の基準凡例を表示"
                      >
                        <span>判定</span>
                        <HelpCircle className="w-3 h-3 text-stone-400 group-hover:text-amber-400" />
                      </button>
                    </th>
                    <th className="pb-2 font-medium">合否</th>
                    <th className="pb-2 font-medium">所要時間</th>
                    <th className="pb-2 font-medium text-center">出題問題・解説</th>
                    <th className="pb-2 font-medium text-right">𝕏 ポスト</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {displayedHistory.map((rec) => {
                    const isMock = rec.testType === 'mock' || rec.total >= 50;
                    const rankInfo = getTestRank(rec.percentage);
                    const tweetUrl = getRecordTweetUrl(rec);
                    const wrongCount = rec.wrongQuestionIds ? rec.wrongQuestionIds.length : (rec.total - rec.score);

                    let displayDate = rec.date;
                    try {
                      const d = new Date(rec.date);
                      if (!isNaN(d.getTime())) {
                        displayDate = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                      }
                    } catch {
                      // fallback
                    }

                    return (
                      <tr key={rec.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              10問ミニ
                            </span>
                            <span className="text-stone-300 font-mono text-[11px] sm:text-xs">
                              {displayDate}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 font-mono font-bold text-stone-100">
                          {rec.score} <span className="text-stone-400 font-normal">/ {rec.total}</span>
                        </td>
                        <td className="py-3 font-mono font-bold text-amber-400">
                          {rec.percentage}%
                        </td>
                        <td className="py-3">
                          <span 
                            className={`inline-flex items-center justify-center font-mono font-bold px-2 py-0.5 rounded text-xs border ${rankInfo.color}`}
                            title={`${rankInfo.rank}判定（${rankInfo.label}）`}
                          >
                            {rankInfo.rank}判定
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rec.passed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-stone-800 text-stone-400'
                          }`}>
                            {rec.passed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>合格</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-red-400" />
                                <span>不合格</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 text-stone-400 font-mono text-[11px]">
                          {rec.timeSpentSeconds 
                            ? `${Math.floor(rec.timeSpentSeconds / 60)}分${rec.timeSpentSeconds % 60}秒` 
                            : '記録なし'}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => openReviewModal(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-amber-300 hover:text-amber-200 border border-stone-700 hover:border-amber-500/50 transition-all font-medium cursor-pointer shadow-sm text-xs"
                            title="この回の出題問題と回答・解説を確認する"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>問題・解説</span>
                            {wrongCount > 0 && (
                              <span className="text-[10px] text-red-400 font-bold ml-0.5">
                                (✕{wrongCount})
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <a
                            href={tweetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="この結果を𝕏（Twitter）に投稿する"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#1D9BF0]/15 hover:bg-[#1D9BF0] text-[#1D9BF0] hover:text-white border border-[#1D9BF0]/30 transition-colors text-[11px] font-medium cursor-pointer"
                          >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>ポスト</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 件数展開コントローラー */}
            {totalFilteredCount > 15 && (
              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span>
                  表示中: {displayedHistory.length} 件 / 全 {totalFilteredCount} 件
                </span>
                <div className="flex items-center gap-2">
                  {displayedHistory.length < totalFilteredCount ? (
                    <>
                      <button
                        onClick={() => setHistoryLimit((prev) => prev + 15)}
                        className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
                      >
                        さらに15件表示（残り{totalFilteredCount - displayedHistory.length}件）
                      </button>
                      <button
                        onClick={() => setHistoryLimit(totalFilteredCount)}
                        className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors cursor-pointer"
                      >
                        すべて表示
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setHistoryLimit(15)}
                      className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors cursor-pointer"
                    >
                      直近15件に折りたたむ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 判定ランクの目安（下部・シンプル凡例） */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 text-xs text-stone-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 mb-2.5 border-b border-stone-800/80">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-stone-200">判定ランクの目安</span>
            <span className="text-[11px] text-stone-400">（京都検定3級 合格ライン：正解率70%以上）</span>
          </div>
          <button
            onClick={() => setShowRankLegendModal(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>詳しい判定基準を見る</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RANK_LEGEND_ITEMS.map((item) => (
            <div key={item.rank} className="p-2.5 rounded-lg bg-stone-850/90 border border-stone-750/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs border ${item.badgeColor}`}>
                  {item.rank}判定
                </span>
                <span className="text-[11px] font-semibold text-stone-200">
                  {item.label}
                </span>
              </div>
              <div className="text-[11px] font-mono text-amber-300 mt-1">
                正解率 {item.percentage}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                100問: {item.score100} / 10問: {item.score10}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 合格へ向けた推奨ステップ＆学習環境（700問本編を最優先・目玉に配置） */}
      <div className="bg-stone-850/80 border border-stone-750/90 rounded-2xl p-4 sm:p-6 space-y-3.5 shadow-md">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-stone-100 font-serif flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>合格に向けた推奨ステップアップ ＆ 学習環境</span>
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            日々の演習・ミニテストと並行して、完全合格対策版や仲間とのコミュニティを活用しましょう。
          </p>
        </div>

        {/* 3級・2級 合格対策シリーズ一覧（整理された見やすいデザイン） */}
        <SeriesPromotionSection defaultTab="all" variant="mypage" />
      </div>

      {/* データの初期化（リセット） */}
      {onResetStats && (
        <div className="pt-2 text-right">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="text-xs text-stone-500 hover:text-red-400 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>成績・履歴データをリセットする</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-800 text-xs">
              <span className="text-red-300">本当にすべての学習記録を初期化しますか？</span>
              <button
                onClick={() => {
                  onResetStats();
                  setShowConfirmReset(false);
                }}
                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-stone-100 font-bold cursor-pointer"
              >
                初期化する
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      )}

      {/* テスト結果・全問復習カルテモーダル */}
      {reviewingRecord && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setReviewingRecord(null);
          }}
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:py-6 overflow-y-auto"
        >
          <div className="bg-stone-900 border border-stone-750 rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn my-auto sm:my-0">
            {/* モーダルヘッダー */}
            <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-850 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    10問ミニテスト
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {reviewingRecord.date} 受験
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif flex flex-wrap items-center gap-2">
                  <span>出題問題・解答解説シート</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    reviewingRecord.passed 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {reviewingRecord.score} / {reviewingRecord.total} 問正解（{reviewingRecord.percentage}%・{reviewingRecord.passed ? '合格 🌸' : '要復習 🌿'}）
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setReviewingRecord(null)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700 transition-colors cursor-pointer text-xs font-medium flex items-center gap-1"
                  title="マイページに戻る"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">マイページへ</span>
                </button>
                <button
                  onClick={() => setReviewingRecord(null)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors cursor-pointer"
                  aria-label="閉じる"
                  title="シートを閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* モーダルコンテンツ（スクロール可能） */}
            <div ref={modalScrollContainerRef} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* 間違えた問題の特訓ボタン */}
              {reviewingRecord.wrongQuestionIds && reviewingRecord.wrongQuestionIds.length > 0 && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm text-red-200 block">
                      このテストで間違えた {reviewingRecord.wrongQuestionIds.length} 問を復習
                    </span>
                    <span className="text-xs text-stone-400">
                      一問一答形式で、間違えた問題だけをピンポイントで反復演習できます。
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const wrongIds = reviewingRecord.wrongQuestionIds!;
                      setReviewingRecord(null);
                      onStartMode('weak', undefined, wrongIds);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>間違えた {reviewingRecord.wrongQuestionIds.length} 問を特訓演習</span>
                  </button>
                </div>
              )}

              {/* 出題問題リストの取得 */}
              {(() => {
                const questionMap = new Map<number, Question>(questions.map((q) => [q.id, q]));
                const testQuestions: Question[] = [];

                if (reviewingRecord.questionIds && reviewingRecord.questionIds.length > 0) {
                  for (const id of reviewingRecord.questionIds) {
                    const found = questionMap.get(id);
                    if (found) testQuestions.push(found);
                  }
                }

                if (testQuestions.length === 0) {
                  return (
                    <div className="py-10 px-4 text-center text-stone-400 space-y-4 bg-stone-850/40 rounded-xl border border-stone-800">
                      <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Info className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-base text-stone-200 font-bold">
                          この過去回の個別問題リストは保存されていません
                        </p>
                        <p className="text-xs text-stone-400 max-w-lg mx-auto leading-relaxed">
                          この受験履歴は「問題ごとの回答記録機能」が導入される前のセッションデータです。<br className="hidden sm:inline" />
                          そのため得点と正解率・合否判定のみが保存されており、問題ごとの復習リストは利用できません。新しく受験したミニテストからは、全問の詳細な解説や間違えた問題の一問一答演習がご利用いただけます。
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() => setReviewingRecord(null)}
                          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
                        >
                          マイページの一覧に戻る
                        </button>
                        {stats.wrongIds.length > 0 && (
                          <button
                            onClick={() => {
                              setReviewingRecord(null);
                              onStartMode('weak');
                            }}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
                          >
                            現在の苦手問題（{stats.wrongIds.length}問）を特訓する
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setReviewingRecord(null);
                            onStartMode('mini');
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer shadow-md transition-all"
                        >
                          新しいミニテスト（10問）を受ける
                        </button>
                      </div>
                    </div>
                  );
                }

                const userAnswers = reviewingRecord.userAnswers || {};
                const wrongList = testQuestions.filter((q) => userAnswers[q.id] !== q.answer);
                const correctList = testQuestions.filter((q) => userAnswers[q.id] === q.answer);

                const displayedQuestions = testQuestions.filter((q) => {
                  if (modalFilter === 'wrong') return userAnswers[q.id] !== q.answer;
                  if (modalFilter === 'correct') return userAnswers[q.id] === q.answer;
                  return true;
                });

                return (
                  <div className="space-y-4">
                    {/* 絞り込みタブ & 一括展開 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                      <div className="flex items-center gap-1.5 bg-stone-850 p-1 rounded-xl border border-stone-800 text-xs">
                        <button
                          onClick={() => setModalFilter('wrong')}
                          className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            modalFilter === 'wrong'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          間違えた問題 ({wrongList.length})
                        </button>
                        <button
                          onClick={() => setModalFilter('all')}
                          className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            modalFilter === 'all'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          全問 ({testQuestions.length})
                        </button>
                        <button
                          onClick={() => setModalFilter('correct')}
                          className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            modalFilter === 'correct'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          正解した問題 ({correctList.length})
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* 解答・解説ダウンロードボタン */}
                        <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                          <button
                            onClick={() => {
                              downloadTestResultCSV(
                                {
                                  title: '10問ミニテスト',
                                  date: reviewingRecord.date,
                                  score: reviewingRecord.score,
                                  total: reviewingRecord.total,
                                  percentage: reviewingRecord.percentage,
                                  passed: reviewingRecord.passed,
                                },
                                testQuestions,
                                userAnswers
                              );
                            }}
                            className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="この回の全出題・回答・全選択肢解説をCSV（Excel形式）で保存"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>CSV保存</span>
                          </button>
                          <button
                            onClick={() => {
                              downloadTestResultText(
                                {
                                  title: '10問ミニテスト',
                                  date: reviewingRecord.date,
                                  score: reviewingRecord.score,
                                  total: reviewingRecord.total,
                                  percentage: reviewingRecord.percentage,
                                  passed: reviewingRecord.passed,
                                },
                                testQuestions,
                                userAnswers
                              );
                            }}
                            className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="この回の全出題・回答・全選択肢解説をテキスト形式で保存"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>解答をテキストで保存</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 問題リスト */}
                    {displayedQuestions.length === 0 ? (
                      <div className="py-12 text-center text-stone-400 space-y-3 bg-stone-850/40 rounded-xl border border-stone-800">
                        {modalFilter === 'wrong' ? (
                          <>
                            <div className="inline-flex p-3 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 mb-1">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <p className="text-stone-200 font-bold text-sm">
                              素晴らしい！間違えた問題はありません（満点です🌸）
                            </p>
                            <p className="text-xs text-stone-400">
                              「全問 ({testQuestions.length})」タブから全問題の解説を確認できます。
                            </p>
                            <button
                              onClick={() => setModalFilter('all')}
                              className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium cursor-pointer"
                            >
                              全問の解説を見る
                            </button>
                          </>
                        ) : modalFilter === 'correct' ? (
                          <>
                            <p className="text-stone-300 font-medium text-sm">正解した問題はありませんでした</p>
                            <button
                              onClick={() => setModalFilter('all')}
                              className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium cursor-pointer"
                            >
                              全問の解説を見る
                            </button>
                          </>
                        ) : (
                          <p className="text-stone-400 text-sm">表示できる問題がありません</p>
                        )}
                      </div>
                    ) : (
                    <div className="space-y-3">
                      {displayedQuestions.map((q, idx) => {
                        const originalIdx = testQuestions.findIndex((tq) => tq.id === q.id);
                        const selected = userAnswers[q.id];
                        const isCorrect = selected === q.answer;
                        const isExp = modalExpandedIds.has(q.id);

                        return (
                          <div
                            key={q.id}
                            className={`rounded-xl border transition-all ${
                              isCorrect
                                ? 'bg-stone-850/80 border-stone-750'
                                : 'bg-stone-850/95 border-red-800/50 shadow-sm'
                            }`}
                          >
                            {/* 問題カードヘッダー */}
                            <div
                              onClick={() => toggleModalExpand(q.id)}
                              className="p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-stone-800/50 rounded-xl"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 shrink-0">
                                  {isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-mono font-bold text-stone-400">
                                      第 {originalIdx + 1} 問
                                    </span>
                                    <span className="text-[10px] px-2 py-0.2 rounded bg-stone-800 text-amber-300 border border-stone-700">
                                      {q.category}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                      isCorrect ? 'text-emerald-400 bg-emerald-950/40' : 'text-red-400 bg-red-950/40'
                                    }`}>
                                      {isCorrect ? '正解' : '不正解'}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm font-medium text-stone-200">
                                    {q.question}
                                  </p>
                                </div>
                              </div>

                              <div className="text-stone-400 shrink-0 mt-1">
                                {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>

                            {/* 展開時詳細 */}
                            {isExp && (
                              <div className="p-4 pt-0 border-t border-stone-800 text-xs space-y-3 animate-fadeIn">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                  <div className={`p-2.5 rounded-lg border ${
                                    isCorrect ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-red-950/30 border-red-800/40'
                                  }`}>
                                    <span className="text-stone-400 block text-[10px]">あなたの回答：</span>
                                    <span className={`font-bold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                                      {selected !== undefined ? `${selected + 1}. ${q.options[selected]}` : '未回答'}
                                    </span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
                                    <span className="text-emerald-400 block text-[10px]">正解：</span>
                                    <span className="font-bold text-emerald-200">
                                      {q.answer + 1}. {q.options[q.answer]}
                                    </span>
                                  </div>
                                </div>

                                {/* 選択肢解説 */}
                                <div className="space-y-1.5">
                                  <span className="font-bold text-stone-300 text-[11px] block">
                                    【選択肢解説】
                                  </span>
                                  {q.choiceExplanations.map((c, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className={`p-2 rounded-lg leading-relaxed ${
                                        c.isCorrect 
                                          ? 'bg-emerald-950/30 text-emerald-200 border border-emerald-800/40' 
                                          : 'bg-stone-900/60 text-stone-300 border border-stone-800'
                                      }`}
                                    >
                                      <span className="font-bold mr-1.5">{cIdx + 1}. {c.option}:</span>
                                      <span>{c.explanation}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* 試験対策のポイント */}
                                {q.explanation?.tip && (
                                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-200/90 leading-relaxed">
                                    <span className="font-bold text-amber-300 block mb-1">
                                      💡 京都検定3級 試験対策ポイント
                                    </span>
                                    {q.explanation.tip}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* モーダルフッター */}
            <div className="p-4 border-t border-stone-800 bg-stone-850 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-stone-400 hidden sm:inline">
                「マイページへ戻る」または「閉じる」を押すと受験履歴一覧に戻ります
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setReviewingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>マイページへ戻る</span>
                </button>
                <button
                  onClick={() => setReviewingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-stone-100 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 判定ランク基準・凡例モーダルダイアログ */}
      {showRankLegendModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-750 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* モーダルヘッダー */}
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
                    5問ミニテストにおける各判定ランクの正解率と合否目安
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

            {/* モーダル本文 */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* 合格ライン公式規定バナー */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-stone-300 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">
                    京都検定3級の合格基準：70%以上（正解率70%以上で合格）
                  </span>
                  <span>
                    京都検定3級では、総得点の70%以上で合格となります。当アプリの5問ミニテストでは、4問（70%以上）のスコアに対して「A判定（合格圏）」または「S判定（合格確実）」を付与しています。
                  </span>
                </div>
              </div>

              {/* 各判定ランク一覧カード */}
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
                          5問ミニ: <strong className="text-amber-300">{item.score5 || item.score10}</strong>
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

              {/* 総合ランク（カルテ上部バナー）の補足 */}
              <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-400 leading-relaxed">
                <span className="font-bold text-stone-200 block mb-1">
                  💡 マイページ上部の「総合ランク判定」について
                </span>
                <span>
                  マイページ上部に表示される総合判定は、直近3回のミニテストの平均正解率をもとに、最新の学習到達度を総合的に判定しています。
                </span>
              </div>
            </div>

            {/* モーダルフッター */}
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
