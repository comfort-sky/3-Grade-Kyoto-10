import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  Layers, 
  Users, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { 
  APP_50_3KYU_URL, 
  NOTE_700_3KYU_URL, 
  APP_50_2KYU_URL, 
  NOTE_700_2KYU_URL, 
  COMMUNITY_NOTE_URL 
} from '../types';

interface SeriesPromotionProps {
  defaultTab?: '3kyu' | 'all' | '2kyu';
  variant?: 'dashboard' | 'result' | 'mypage';
  className?: string;
}

export const SeriesPromotionSection: React.FC<SeriesPromotionProps> = ({
  defaultTab = '3kyu',
  variant = 'dashboard',
  className = '',
}) => {
  const [selectedGrade, setSelectedGrade] = useState<'3kyu' | 'all' | '2kyu'>(defaultTab);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* セクション見出し & 級別切り替えタブ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-3.5 sm:p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Series Guide
            </span>
            <span className="text-xs text-stone-400">上位版・公式教材</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-stone-100 mt-1 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span>京都検定 合格対策シリーズ一覧（3級・2級）</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            学習段階に合わせて選べる3級・2級の公式教材。受検級のタブでスムーズに切り替えできます。
          </p>
        </div>

        {/* タブ切り替えボタン */}
        <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedGrade('3kyu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedGrade === '3kyu'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-black scale-[1.02]'
                : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />
            <span>🌸 3級対策</span>
            <span className="text-[10px] opacity-80 font-normal">おすすめ</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade('2kyu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedGrade === '2kyu'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md font-black scale-[1.02]'
                : 'text-stone-400 hover:text-indigo-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-300 inline-block" />
            <span>⛩️ 2級対策</span>
            <span className="text-[10px] opacity-80 font-normal">上位級</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              selectedGrade === 'all'
                ? 'bg-stone-800 text-stone-100 shadow-sm font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>全表示</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 🌸 3級 対策シリーズ                                        */}
      {/* ========================================================== */}
      {(selectedGrade === '3kyu' || selectedGrade === 'all') && (
        <div className="space-y-3">
          {selectedGrade === 'all' && (
            <div className="flex items-center gap-2 pt-1 pb-0.5">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                🌸 京都検定 3級 対策教材
              </span>
              <span className="text-xs text-stone-400">（現在の10問お試し版からそのままステップアップ）</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 3級 700問 完全攻略Webアプリ（最優先ハイライト） */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/70 via-stone-900 to-amber-950/40 border-2 border-amber-400 hover:border-amber-300 p-4 sm:p-5 shadow-xl shadow-amber-950/30 flex flex-col justify-between transition-all group ring-1 ring-amber-400/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-stone-950" />
                      <span>3級 決定版</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-300">Webアプリ付</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/40">
                    全700問
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold font-serif text-stone-100 group-hover:text-amber-200 transition-colors leading-snug">
                  <a
                    href={NOTE_700_3KYU_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 transition-colors hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    title="【京都検定3級】完全攻略700問 Webアプリをnoteで開く"
                  >
                    <span>【京都検定3級】完全攻略700問＋本番100問模試・ミニテスト・復習・地図機能付きWebアプリ</span>
                    <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                  </a>
                </h4>

                <p className="text-xs text-stone-300 leading-relaxed">
                  3級合格（70点以上）を確実に掴む決定版！全6分野完全網羅の700問演習、本番同一条件の100問模試（90分）、弱点復習、寺社マップ連動まで揃ったフル機能Webアプリです。
                </p>
              </div>

              <div className="pt-3.5 mt-3 border-t border-amber-500/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">公式noteにて公開中</span>
                <a
                  href={NOTE_700_3KYU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                  <span>3級 700問版を見る</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>

            {/* 3級 厳選50問＋10問ミニテスト Webアプリ */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-900/90 border border-amber-500/50 hover:border-amber-400 p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      3級 お手軽速習
                    </span>
                    <span className="text-[11px] font-bold text-stone-400">Webアプリ付</span>
                  </div>
                  <span className="text-xs font-mono text-stone-300 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    厳選50問＋ミニ10問
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold font-serif text-stone-100 group-hover:text-amber-300 transition-colors leading-snug">
                  <a
                    href={APP_50_3KYU_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 transition-colors hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    title="【京都検定3級】厳選50問＋10問ミニテスト機能付き Webアプリをnoteで開く"
                  >
                    <span>【京都検定3級】厳選50問＋10問ミニテスト機能付き Webアプリ</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </a>
                </h4>

                <p className="text-xs text-stone-300 leading-relaxed">
                  まずは手軽に実戦力を5倍に！京都検定3級の頻出要点を厳選50問に凝縮。毎回ランダムに出題される10問ミニテスト機能でスキマ時間に対策できます。
                </p>
              </div>

              <div className="pt-3.5 mt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">公式noteにて公開中</span>
                <a
                  href={APP_50_3KYU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-100 hover:text-amber-300 border border-stone-700 hover:border-amber-500/50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>3級 50問版を見る</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ⛩️ 2級 対策シリーズ                                        */}
      {/* ========================================================== */}
      {(selectedGrade === '2kyu' || selectedGrade === 'all') && (
        <div className="space-y-3">
          {selectedGrade === 'all' && (
            <div className="flex items-center gap-2 pt-2 pb-0.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black">
                ⛩️ 京都検定 2級 対策教材
              </span>
              <span className="text-xs text-stone-400">（難易度アップ！合格率20〜30%の本格中級ステージ）</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 2級 700問 完全対策note */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-stone-900 to-indigo-950/40 border-2 border-indigo-400 hover:border-indigo-300 p-4 sm:p-5 shadow-xl shadow-indigo-950/30 flex flex-col justify-between transition-all group ring-1 ring-indigo-400/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 text-stone-950 shadow-sm flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-stone-950" />
                      <span>2級 本格対策</span>
                    </span>
                    <span className="text-[11px] font-bold text-indigo-300">価格: 3,300円</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40">
                    全700問＋模試
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold font-serif text-stone-100 group-hover:text-indigo-200 transition-colors leading-snug">
                  <a
                    href={NOTE_700_2KYU_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-300 transition-colors hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    title="【京都検定2級】完全対策700問＋本番模試100問をnoteで開く"
                  >
                    <span>【京都検定2級】完全対策700問＋本番模試100問</span>
                    <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
                  </a>
                </h4>

                <p className="text-xs text-stone-300 leading-relaxed">
                  2級合格を確実にする本格対策700問（価格: 3,300円）。合格率20%台の難関を突破するため、全6分野の深掘り知識と本番同一条件の90分模試を完全収録した決定版教材です。
                </p>
              </div>

              <div className="pt-3.5 mt-3 border-t border-indigo-500/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">公式noteにて公開中</span>
                <a
                  href={NOTE_700_2KYU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>2級 700問版を見る</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>

            {/* 2級 厳選50問＋ミニテスト Webアプリ */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-900/90 border border-indigo-500/50 hover:border-indigo-400 p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      2級 お手軽速習
                    </span>
                    <span className="text-[11px] font-bold text-stone-400">Webアプリ付</span>
                  </div>
                  <span className="text-xs font-mono text-stone-300 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    厳選50問＋ミニテスト
                  </span>
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

              <div className="pt-3.5 mt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">公式noteにて公開中</span>
                <a
                  href={APP_50_2KYU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-100 hover:text-indigo-300 border border-stone-700 hover:border-indigo-500/50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2級 50問版を見る</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* サポート & コミュニティ（すっきり1行バナー） */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <Users className="w-4 h-4" />
          </span>
          <a
            href={COMMUNITY_NOTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300 transition-colors hover:underline cursor-pointer"
          >
            <strong>公式コミュニティ＆メンバーシップ:</strong> 仲間とのクイズ出題や最難関1級論述添削も実施中
          </a>
        </div>
        <a
          href={COMMUNITY_NOTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
        >
          <span>コミュニティ詳細</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
