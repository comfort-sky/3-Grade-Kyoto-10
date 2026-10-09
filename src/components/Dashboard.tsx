import React, { useMemo } from 'react';
import { 
  Play, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  Compass,
  ArrowRight,
  BarChart3,
  MessageSquare,
  ExternalLink,
  UserPlus,
  Calendar,
  Award,
  CheckCircle2,
  MapPin,
  Users,
  GraduationCap
} from 'lucide-react';
import { 
  QuizMode, 
  UserStats, 
  Question, 
  NOTE_700_3KYU_URL, 
  APP_50_3KYU_URL, 
  NOTE_700_2KYU_URL, 
  APP_50_2KYU_URL, 
  COMMUNITY_NOTE_URL 
} from '../types';
import { SeriesPromotionSection } from './SeriesPromotionSection';

interface DashboardProps {
  questions: Question[];
  stats: UserStats;
  onStartMode: (mode: QuizMode, category?: string) => void;
  categories: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  questions,
  stats,
  onStartMode,
  categories,
}) => {
  // 保存された進行中テストセッションの確認
  const [activeSession, setActiveSession] = React.useState<{
    mode: 'mini-test';
    total: number;
    answered: number;
    timeRemaining: number;
  } | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('kyoto_exam_active_test_session_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const qList = Array.isArray(parsed.questions) ? parsed.questions : Array.isArray(parsed.questionIds) ? parsed.questionIds : null;
        if (parsed && qList && qList.length > 0) {
          const answered = parsed.userAnswers ? Object.keys(parsed.userAnswers).length : 0;
          setActiveSession({
            mode: 'mini-test',
            total: qList.length,
            answered,
            timeRemaining: parsed.timeRemaining || 0,
          });
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setActiveSession(null);
  }, []);

  const handleDiscardSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem('kyoto_exam_active_test_session_v2');
      setActiveSession(null);
    } catch (e) {
      // ignore
    }
  };

  // 2026年 京都検定（12月第2日曜日 = 2026年12月13日を基準）までのカウントダウン日数
  const daysUntilExam = useMemo(() => {
    const now = new Date();
    // 2026年12月13日 10:00
    const examDate = new Date(2026, 11, 13, 10, 0, 0);
    const diffTime = examDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, []);

  // 直近のテスト正解率から合格ランクを判定（ミニテスト・本番模試共通）
  const passRank = useMemo(() => {
    if (!stats.testHistory || stats.testHistory.length === 0) {
      return { rank: '未受験', color: 'text-stone-400 bg-stone-800/80 border-stone-700', text: 'テスト受験で合格可能性を判定' };
    }
    // 直近3回平均（最新3件）
    const recent = stats.testHistory.slice(0, 3);
    const avgPercent = recent.reduce((sum, r) => sum + r.percentage, 0) / recent.length;
    if (avgPercent >= 90) {
      return { rank: 'S判定', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/50', text: `合格確実ライン（直近平均 ${avgPercent.toFixed(0)}%）` };
    } else if (avgPercent >= 70) {
      return { rank: 'A判定', color: 'text-amber-300 bg-amber-950/60 border-amber-500/50', text: `合格圏内（直近平均 ${avgPercent.toFixed(0)}%）` };
    } else if (avgPercent >= 50) {
      return { rank: 'B判定', color: 'text-sky-300 bg-sky-950/60 border-sky-500/50', text: `あと少しで合格圏（直近平均 ${avgPercent.toFixed(0)}%）` };
    }
    return { rank: 'C判定', color: 'text-rose-300 bg-rose-950/60 border-rose-500/50', text: `基礎固め推奨（直近平均 ${avgPercent.toFixed(0)}%）` };
  }, [stats.testHistory]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12">
      {/* 画面最上部に中断中セッションの再開バナーを最優先表示 */}
      {activeSession && (
        <div className="bg-gradient-to-r from-amber-950 via-stone-850 to-amber-950/80 border-2 border-amber-500 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn ring-2 ring-amber-500/20">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-lg">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ミニテスト 中断データ
                </span>
                <span className="text-xs text-stone-300">
                  回答済み: <strong className="text-amber-300 font-mono text-sm">{activeSession.answered}</strong> / {activeSession.total} 問
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  （残り約 {Math.ceil(activeSession.timeRemaining / 60)} 分）
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-stone-100 font-serif mt-1">
                前回中断したテストの続きを再開できます
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                中断した問題番号・回答済みの選択肢・残り時間がそのまま保持されています。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={handleDiscardSession}
              className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-red-400 text-xs border border-stone-700 transition-colors shrink-0 cursor-pointer"
            >
              破棄する
            </button>
            <button
              onClick={() => onStartMode(activeSession.mode)}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-[0.98]"
            >
              <span>続きから再開する</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ヒーローバナー：京都らしい風情あるモダンなヘッダー */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-700/80 p-5 sm:p-7 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10">
          {/* 上部バッジ：カウントダウン ＆ 合格ランク */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>本番（12月予定）まであと <strong className="font-mono text-amber-300">{daysUntilExam}</strong> 日</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-medium ${passRank.color}`}>
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>{passRank.rank}：{passRank.text}</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-3xl font-bold font-serif text-stone-100 leading-snug">
            【京都検定3級】10問 無料お試し版（ミニテスト5問付）
            <span className="block text-amber-400 font-sans text-xs sm:text-base font-medium mt-2 leading-relaxed">
              重要ポイントマスター・出題分野別演習対応・学習カルテ付
            </span>
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-2.5 sm:mt-3 leading-relaxed max-w-2xl">
            出題分野の重要ポイントを網羅した厳選10問を収録。
            1問ごとに全4選択肢の徹底解説付き。日々の演習、5問ミニテスト、学習カルテの成績推移で着実に合格基準（70%）到達を体験できます。
          </p>
        </div>
      </div>

      {/* ★ メイン目玉・3級 700問 完全攻略Webアプリ（最優先で目立たせる） */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-stone-850 to-amber-950 border-2 border-amber-400 shadow-2xl p-5 sm:p-6 ring-2 ring-amber-500/30 group">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-stone-950 shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                <span>3級 決定版Webアプリ</span>
              </span>
              <span className="text-xs text-amber-300 font-bold">
                公式noteにて大好評公開中！
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold font-serif text-stone-100">
              <a
                href={NOTE_700_3KYU_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-300 transition-colors inline-flex items-center gap-2 hover:underline cursor-pointer"
                title="【京都検定3級】完全攻略700問 Webアプリをnoteで開く"
              >
                <span>【京都検定3級】完全攻略700問＋本番100問模試・ミニテスト・復習・地図機能付きWebアプリ</span>
                <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
              </a>
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-2xl">
              全6分野を徹底網羅！<strong>圧倒的ボリュームの700問＋本番100問模試（90分）・ミニテスト・復習・地図機能</strong>を完全収録。京都検定3級合格（70点以上）を確実に勝ち取るための決定版Webアプリです。
            </p>
          </div>

          <a
            href={NOTE_700_3KYU_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-950/60 transition-all flex items-center gap-2 shrink-0 active:scale-95 group cursor-pointer ring-2 ring-amber-300/60"
          >
            <Sparkles className="w-4 h-4 fill-stone-950 text-stone-950" />
            <span>3級 700問 Webアプリを見る</span>
            <ExternalLink className="w-4 h-4 text-stone-950 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* サブステップ・推奨環境（手軽な2級 50問版 ＆ 公式コミュニティ） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* カード1: 【京都検定2級】厳選50問＋ミニテスト機能付き Webアプリ */}
        <div className="relative overflow-hidden rounded-2xl bg-stone-850/80 border border-indigo-500/50 hover:border-indigo-400 p-4 sm:p-5 shadow-md flex flex-col justify-between transition-all group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                ⛩️ 2級 お手軽速習
              </span>
              <span className="text-[11px] text-stone-400">noteで公開中</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold font-serif text-stone-100 group-hover:text-indigo-300 transition-colors leading-snug">
              <a
                href={APP_50_2KYU_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-300 transition-colors hover:underline cursor-pointer inline-flex items-center gap-1.5"
                title="【京都検定2級】厳選50問＋ミニテスト機能付き Webアプリをnoteで開く"
              >
                <span>【京都検定2級】厳選50問＋ミニテスト機能付き Webアプリ</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </a>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              2級の頻出重要問題を厳選50問でスピード演習！毎回ランダムに出題されるミニテスト機能付きWebアプリ。2級のレベル感を気軽に試したい方にも最適です。
            </p>
          </div>

          <div className="pt-3 mt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">Webアプリ付き</span>
            <a
              href={APP_50_2KYU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-indigo-300 border border-stone-700 hover:border-indigo-500/50 font-bold text-xs shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>2級 50問版を見る</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* カード2: 会員限定 公式コミュニティ＆メンバーシップ */}
        <div className="relative overflow-hidden rounded-2xl bg-stone-850/80 border border-stone-750 hover:border-indigo-400/60 p-4 sm:p-5 shadow-md flex flex-col justify-between transition-all group">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>会員限定</span>
              </span>
              <span className="text-[11px] text-indigo-300">メンバーシップ</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold font-serif text-stone-100 group-hover:text-indigo-200 transition-colors">
              <a
                href={COMMUNITY_NOTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-200 transition-colors hover:underline cursor-pointer inline-flex items-center gap-1.5"
                title="公式コミュニティ＆メンバーシップをnoteで開く"
              >
                <span>公式コミュニティ＆メンバーシップ</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </a>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              仲間とクイズを出し合ったり、最難関・1級の論述添削を受けられる専用部屋まで充実！
            </p>
          </div>

          <div className="pt-3 mt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[11px] text-indigo-300/80">1級論述添削完備</span>
            <a
              href={COMMUNITY_NOTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>コミュニティを見る</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. 演習モード（知識定着・インプット）                         */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold font-serif text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>演習モード（インプット ＆ 知識定着）</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            1問ごとに即時判定と全選択肢の徹底解説。まずは分野別の章別演習や全問演習で基礎知識を固めましょう。
          </p>
        </div>

        {/* 分野別（章別）集中演習 */}
        <div className="bg-stone-850/60 border border-stone-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-200 font-serif flex items-center gap-2">
                <span>分野別（章別）集中演習</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  全6章対応
                </span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                苦手な章や重点的に学びたい分野を選んで一問一答演習できます
              </p>
            </div>
            <span className="text-xs text-stone-400 font-medium">
              全 {categories.length} 分野
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {categories.map((cat) => {
              const count = questions.filter(q => q.category === cat).length;
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
                  className="p-3.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-750 hover:border-amber-500/50 text-left transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    {chapter && (
                      <span className="text-[10px] font-mono text-amber-400/90 font-semibold block mb-0.5">
                        {chapter}
                      </span>
                    )}
                    <div className="text-xs sm:text-sm font-bold text-stone-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {cat}
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2.5 flex items-center justify-between">
                    <span>{count} 問収録</span>
                    <span className="text-amber-400/80 group-hover:translate-x-0.5 transition-transform text-[11px]">
                      演習 →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 演習カード（全問マスター ＆ 弱点克服） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* カード: 全問集中マスター演習 */}
          <div 
            onClick={() => onStartMode('all-practice')}
            className="group cursor-pointer bg-gradient-to-b from-stone-850 to-stone-900 border border-amber-500/30 hover:border-amber-400/80 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-amber-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  一問一答・即時判定
                </span>
                <BookOpen className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-base font-bold text-stone-100 font-serif group-hover:text-amber-300 transition-colors">
                全{questions.length}問 集中マスター演習
              </h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                収録されている全{questions.length}問を1問ずつ解き進める標準演習モード。1問ごとに即時判定され、正解の理由だけでなく誤答選択肢3つの解説や豆知識、頻出tipを深く学べます。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-xs font-medium text-amber-400 flex items-center justify-between">
              <span>全{questions.length}問網羅</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                演習開始 <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* カード: 間違えた問題の復習 */}
          <div 
            onClick={() => onStartMode('weak')}
            className="group cursor-pointer bg-stone-850/80 hover:bg-stone-800/90 border border-stone-700/80 hover:border-stone-600 rounded-xl p-5 transition-all hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  弱点克服
                </span>
                <RotateCcw className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-base font-bold text-stone-100 font-serif group-hover:text-red-300 transition-colors">
                間違えた問題の復習
              </h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                過去の演習やミニテストで誤答した問題（現在 {stats.wrongIds.length} 問）だけをピンポイントで再演習。正解すると自動的に弱点リストから外れます。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-xs font-medium text-stone-300 flex items-center justify-between">
              <span>要復習: <strong className="text-red-400 font-mono">{stats.wrongIds.length}</strong> 問</span>
              <span className="flex items-center gap-1 text-red-400 group-hover:translate-x-1 transition-transform">
                復習する <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* 京都 寺社・史跡ロケーションガイド ＆ 地図バナー */}
        <div 
          onClick={() => onStartMode('spots-map')}
          className="group cursor-pointer bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-700/80 hover:border-amber-500/70 rounded-2xl p-4 sm:p-5 transition-all shadow-md hover:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  新機能・Googleマップ連携
                </span>
                <span className="text-xs text-stone-400">
                  洛中・洛東・洛西・洛北・洛南・宇治エリア対応
                </span>
              </div>
              <h4 className="text-base font-bold text-stone-100 font-serif mt-1 group-hover:text-amber-300 transition-colors">
                京都 寺社・史跡ロケーションガイド ＆ 地図
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                問題に出てくる主要寺社・史跡の所在地、最寄バス停・駅、世界遺産情報を網羅。1クリックでGoogleマップを開いて位置関係やルートを確認できます。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 self-end sm:self-center">
            <span>マップを見る</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. テストモード（実力測定・タイマー演習）                     */}
      {/* ============================================================ */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-lg font-bold font-serif text-stone-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <span>テストモード（実力測定 ＆ タイムアタック）</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            制限時間内で全問を一括解答。解答後にまとめて採点・合否判定を行い、本番試験さながらの実戦力を養います。
          </p>
        </div>

        {/* 中断中セッションの再開バナー */}
        {activeSession && (
          <div className="bg-gradient-to-r from-amber-950/80 via-stone-850 to-amber-950/60 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ミニテスト 中断データ
                  </span>
                  <span className="text-xs text-stone-400">
                    回答済み: <strong className="text-amber-300 font-mono">{activeSession.answered}</strong> / {activeSession.total} 問
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-100 font-serif mt-1">
                  前回中断したテストを続きから再開できます
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  残り時間：約 {Math.ceil(activeSession.timeRemaining / 60)} 分
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={handleDiscardSession}
                className="px-3 py-2 rounded-xl bg-stone-800/90 hover:bg-stone-750 text-stone-400 hover:text-stone-200 text-xs border border-stone-700 transition-colors shrink-0"
              >
                破棄する
              </button>
              <button
                onClick={() => onStartMode(activeSession.mode)}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>続きから再開する</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {/* カード: 毎回ランダム10問ミニテスト */}
          <div 
            onClick={() => onStartMode('mini-test')}
            className="group cursor-pointer bg-gradient-to-r from-stone-850 via-stone-800/90 to-stone-850 hover:border-amber-400 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-xl hover:shadow-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    実力測定・タイマー演習
                  </span>
                  <span className="text-xs text-stone-400">
                    制限時間 8分（全5問）
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-stone-100 font-serif group-hover:text-amber-300 transition-colors">
                  5問ミニテスト（実戦測定）
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed max-w-xl">
                  全6分野の重要ポイントから厳選された5問をランダム出題。8分タイマーで手軽に力試し＆弱点発見ができます。4問以上（70%）正解で合格判定！結果は学習カルテに自動記録されます。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 self-end sm:self-center px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
              <span>ミニテスト開始</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. 学習カルテ ＆ 合格分析                                     */}
      {/* ============================================================ */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-lg font-bold font-serif text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>学習カルテ ＆ 合格分析</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            日々の学習の積み上げ、ミニテストの得点推移グラフ、6大分野の弱点レーダーを確認して合格への最短ルートを把握できます。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* カード: マイページ（学習カルテ） */}
          <div 
            onClick={() => onStartMode('mypage')}
            className="group cursor-pointer bg-gradient-to-b from-stone-850 via-stone-850 to-stone-900 hover:bg-stone-800/90 border border-amber-500/40 hover:border-amber-400 rounded-xl p-5 transition-all hover:shadow-lg flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  個人成績・推移グラフ
                </span>
                <BarChart3 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-base font-bold text-stone-100 font-serif group-hover:text-amber-300 transition-colors">
                マイページ（学習カルテ）
              </h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                ミニテストの得点推移グラフ、合否判定記録、6大分野ごとの習熟状況をいつでも確認できます。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-xs font-medium text-amber-300 flex items-center justify-between">
              <span>受験履歴: {stats.testHistory?.length || 0} 回記録中</span>
              <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform">
                カルテを見る <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 受験生意見交換 & 間違い指摘・改善・要望・感想 */}
      <div className="bg-stone-850/80 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-stone-200 font-serif flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>受験生コミュニティ ＆ ご意見窓口</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              学習の励まし合いや情報交換、アプリへのご意見をお待ちしております
            </p>
          </div>

          <a
            href="https://twitter.com/intent/follow?screen_name=Kyoto_TopMaster"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-white text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Xで直接フォローする"
          >
            <UserPlus className="w-3.5 h-3.5 text-stone-900" />
            <span>@Kyoto_TopMaster をフォロー</span>
          </a>
        </div>

        {/* 3級・2級 合格対策シリーズ一覧（整理された見やすいデザイン） */}
        <div className="mt-4">
          <SeriesPromotionSection defaultTab="all" variant="dashboard" />
        </div>
      </div>

      {/* ガイドカード: 京都検定3級合格基準（一番下に配置） */}
      <div className="bg-stone-850/60 border border-stone-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-700/60 text-stone-300 border border-stone-600/60">
            試験概要
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <h4 className="text-base font-bold text-stone-100 font-serif">
          京都検定3級 合格基準と傾向
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-300 mt-3 leading-relaxed">
          <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
            <span><strong>合格ライン：</strong> 70%以上（100点満点中70点以上）</span>
          </div>
          <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
            <span><strong>出題形式：</strong> マークシート四者択一（全100問・90分）</span>
          </div>
          <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
            <span><strong>合格戦略：</strong> 公式テキストの基本事項から約90%出題。まずは6分野の基本・頻出問題を確実に抑えることが合格への最短ルートです。</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-stone-800/80 text-xs text-stone-400 flex items-center justify-between">
          <span>目標：日々の演習・ミニテストで安定して80%以上を獲得</span>
          <span className="text-amber-400 font-medium">京都観光文化検定試験 3級対策</span>
        </div>
      </div>
    </div>
  );
};
