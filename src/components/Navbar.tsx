import React, { useState } from 'react';
import { BookOpen, Bookmark, LogOut, RotateCcw, BarChart3, MapPin, Home, ArrowLeft, ExternalLink, Sparkles, Users, GraduationCap, X } from 'lucide-react';
import { QuizMode, NOTE_700_3KYU_URL, APP_50_3KYU_URL, NOTE_700_2KYU_URL, APP_50_2KYU_URL, COMMUNITY_NOTE_URL } from '../types';
import { SeriesPromotionSection } from './SeriesPromotionSection';

interface NavbarProps {
  currentMode: QuizMode | 'home';
  onNavigateHome: () => void;
  onLogout: () => void;
  bookmarkCount: number;
  weakCount: number;
  onSelectBookmark: () => void;
  onSelectWeak: () => void;
  onSelectMyPage: () => void;
  onSelectSpotsMap?: () => void;
  totalQuestions?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onNavigateHome,
  onLogout,
  bookmarkCount,
  weakCount,
  onSelectBookmark,
  onSelectWeak,
  onSelectMyPage,
  onSelectSpotsMap,
}) => {
  const [showSeriesModal, setShowSeriesModal] = useState<boolean>(false);
  const isNotHome = currentMode !== 'home';

  return (
    <>
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-3">
        {/* 左側：ロゴ・タイトル または 「ホームへ戻る」ボタン */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
          {/* ホーム以外にいる場合、モバイル・PC問わず即座にホームへ戻れる目立つボタン */}
          {isNotHome && (
            <button
              onClick={onNavigateHome}
              type="button"
              title="トップページ・ホームへ戻る"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="whitespace-nowrap">ホーム</span>
            </button>
          )}

          {/* ロゴ・タイトル（いつでもタップしてホームへ戻れる） */}
          <button
            onClick={onNavigateHome}
            type="button"
            title="トップページ（ホーム）へ戻る"
            className="flex items-center gap-1.5 sm:gap-2 text-left group transition-all hover:opacity-90 focus:outline-none min-w-0 cursor-pointer py-1"
          >
            {/* 本アイコン */}
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-amber-900/90 transition-colors shadow-sm shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              {/* タイトル行：バッジとメインタイトルを水平配置（文字被りを完全防止） */}
              <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                <span className="text-[9px] sm:text-[10px] md:text-xs font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap shrink-0 tracking-tight">
                  京都検定3級
                </span>
                <h1 className="text-xs sm:text-sm md:text-base font-bold font-serif tracking-tight text-stone-100 group-hover:text-amber-300 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                  10問 無料お試し版（ミニテスト5問付）
                </h1>
              </div>

              {/* サブテキスト（タブレット・デスクトップ用） */}
              <p className="hidden md:block text-[11px] text-stone-400 truncate mt-0.5 leading-normal">
                全6分野対応・5問ミニテスト・学習カルテ付
              </p>
            </div>
          </button>
        </div>

        {/* 右側アクション（モバイルでも絶対にかぶらず横並びで収まる設計） */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* ★ 3級 700問 Webアプリ（最優先） */}
          <a
            href={NOTE_700_3KYU_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="【京都検定3級】完全攻略700問＋本番100問模試・ミニテスト・復習・地図機能付きWebアプリ"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black transition-all bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 shadow-md shadow-amber-950/40 shrink-0 whitespace-nowrap active:scale-95 border border-amber-300/80 ring-1 ring-amber-400/40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950 shrink-0" />
            <span className="font-extrabold text-[11px] sm:text-xs">3級 700問</span>
            <ExternalLink className="w-3 h-3 text-stone-950 stroke-[2.5] shrink-0" />
          </a>

          {/* ★ 2級 50問 Webアプリ直接リンク */}
          <a
            href={APP_50_2KYU_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="【京都検定2級】厳選50問＋ミニテスト機能付き Webアプリ"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/50 hover:border-indigo-400 text-indigo-200 hover:text-white shadow-sm shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
            <span className="font-bold text-[11px] sm:text-xs">2級 50問</span>
            <ExternalLink className="w-3 h-3 stroke-[2]" />
          </a>

          {/* 教材一覧（3級・2級）モーダルボタン */}
          <button
            onClick={() => setShowSeriesModal(true)}
            type="button"
            title="京都検定教材一覧（3級・2級シリーズ）"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-amber-500/50 text-stone-200 hover:text-amber-300 shadow-sm shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              <span className="hidden sm:inline">教材一覧</span>
              <span className="sm:hidden">教材</span>
            </span>
          </button>

          {/* 寺社マップボタン */}
          {onSelectSpotsMap && (
            <button
              onClick={onSelectSpotsMap}
              title="京都 寺社・史跡マップ（Googleマップ連携）"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 whitespace-nowrap shadow-sm cursor-pointer ${
                currentMode === 'spots-map'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-extrabold'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:text-amber-200 hover:bg-amber-900/40'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${currentMode === 'spots-map' ? 'text-stone-950' : 'text-amber-400'}`} />
              <span className="text-[11px] sm:text-xs">
                <span className="hidden sm:inline">寺社マップ</span>
                <span className="sm:hidden">マップ</span>
              </span>
            </button>
          )}

          {/* マイページボタン */}
          <button
            onClick={onSelectMyPage}
            title="成績グラフ・マイページ"
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 whitespace-nowrap shadow-sm cursor-pointer ${
              currentMode === 'mypage'
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-850 border-amber-500/40 text-amber-300 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${currentMode === 'mypage' ? 'text-stone-950' : 'text-amber-400'}`} />
            <span className="text-[11px] sm:text-xs">
              <span className="hidden sm:inline">マイページ</span>
              <span className="sm:hidden">マイ</span>
            </span>
          </button>

          {/* 保存問題ボタン（PCおよびタブレットで表示） */}
          <button
            onClick={onSelectBookmark}
            title="保存した問題一覧"
            className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border shrink-0 whitespace-nowrap cursor-pointer ${
              currentMode === 'bookmark'
                ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                : 'bg-stone-850/80 border-stone-700/60 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden md:inline">保存</span>
            <span className="px-1 rounded-full bg-stone-800 text-[10px] sm:text-[11px] font-mono text-stone-300">
              {bookmarkCount}
            </span>
          </button>

          {/* 弱点克服ボタン（PCおよびタブレットで表示） */}
          <button
            onClick={onSelectWeak}
            title="間違えた問題の復習"
            className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border shrink-0 whitespace-nowrap cursor-pointer ${
              currentMode === 'weak'
                ? 'bg-red-950/70 border-red-500 text-red-300'
                : 'bg-stone-850/80 border-stone-700/60 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="hidden md:inline">要復習</span>
            <span className="px-1 rounded-full bg-stone-800 text-[10px] sm:text-[11px] font-mono text-stone-300">
              {weakCount}
            </span>
          </button>

          {/* ログアウト */}
          <button
            onClick={onLogout}
            title="ログアウト"
            className="p-1.5 sm:p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>

    {/* 教材一覧（3級・2級）モーダル */}
    {showSeriesModal && (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
        <div className="bg-stone-900 border border-stone-750 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="font-bold text-sm sm:text-base text-stone-100 font-serif">
                京都検定 合格対策シリーズ一覧（3級・2級）
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSeriesModal(false)}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto flex-1">
            <SeriesPromotionSection defaultTab="all" />
          </div>
        </div>
      </div>
    )}
    </>
  );
};
