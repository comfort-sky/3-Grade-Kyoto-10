import React, { useState, useMemo, useRef } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  Search, 
  Award, 
  Navigation, 
  ArrowLeft, 
  ArrowRight,
  Compass,
  Map as MapIcon,
  Play
} from 'lucide-react';
import { KYOTO_SPOTS, KyotoSpot } from '../data/kyotoSpotsData';
import { KyotoVisualSpatialMap } from './KyotoVisualSpatialMap';

interface KyotoSpotsViewProps {
  onBackToHome: () => void;
  onResumeTest?: () => void;
}

const AREAS = [
  'すべて',
  '洛東・東山・岡崎',
  '洛西・嵯峨嵐山・太秦',
  '洛中・京都御所周辺',
  '洛北・大原・鞍馬',
  '洛南・伏見',
  '宇治・山城・八幡',
] as const;

export const KyotoSpotsView: React.FC<KyotoSpotsViewProps> = ({ onBackToHome, onResumeTest }) => {
  const [selectedArea, setSelectedArea] = useState<string>('すべて');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyWorldHeritage, setOnlyWorldHeritage] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'temple' | 'shrine' | 'castle_palace'>('all');
  const [selectedMapSpot, setSelectedMapSpot] = useState<KyotoSpot | null>(null);
  const [isMapFlashing, setIsMapFlashing] = useState<boolean>(false);

  // 位置関係マップへのスクロール用Ref
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToMap = (spot: KyotoSpot) => {
    setSelectedMapSpot(spot);
    setIsMapFlashing(true);
    setTimeout(() => setIsMapFlashing(false), 2400);

    // 確実に位置関係マップへスムーズスクロール
    requestAnimationFrame(() => {
      const el = document.getElementById('kyoto-spatial-map-section') || mapSectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = Math.max(0, rect.top + scrollTop - 75);
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  // アクティブなテストセッションの確認
  const [activeSession, setActiveSession] = useState<{
    mode: 'mini-test' | 'mock-exam';
    total: number;
    answered: number;
  } | null>(() => {
    try {
      const raw = localStorage.getItem('kyoto_exam_active_test_session_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.questions?.length > 0 || parsed.questionIds?.length > 0)) {
          const total = parsed.questions?.length || parsed.questionIds?.length;
          const answered = parsed.userAnswers ? Object.keys(parsed.userAnswers).length : 0;
          return {
            mode: parsed.mode || 'mini-test',
            total,
            answered,
          };
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  // フィルタリング処理
  const filteredSpots = useMemo(() => {
    return KYOTO_SPOTS.filter((spot) => {
      // エリア
      if (selectedArea !== 'すべて' && spot.area !== selectedArea) {
        return false;
      }
      // 世界遺産
      if (onlyWorldHeritage && !spot.worldHeritage) {
        return false;
      }
      // カテゴリ
      if (selectedCategory !== 'all' && spot.category !== selectedCategory) {
        return false;
      }
      // 検索キーワード
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const target = `${spot.name} ${spot.shortName} ${spot.aliases.join(' ')} ${spot.address} ${spot.nearestAccess} ${spot.description}`.toLowerCase();
        if (!target.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [selectedArea, onlyWorldHeritage, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fadeIn">
      {/* 上部ヘッダーバー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-850/90 border border-stone-750 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700 transition-colors cursor-pointer shrink-0"
            title="ホームへ戻る"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                京都検定3級対応
              </span>
              <span className="text-xs text-stone-400">
                全{KYOTO_SPOTS.length}スポット収録
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-100 flex items-center gap-2 mt-0.5">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <span>京都 寺社・史跡ロケーションガイド</span>
            </h2>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs sm:text-sm font-medium border border-stone-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          ホームへ戻る
        </button>
      </div>

      {/* テスト中断中の場合の復帰バナー */}
      {activeSession && onResumeTest && (
        <div className="bg-gradient-to-r from-amber-950/90 via-stone-850 to-amber-950/80 border-2 border-amber-500/70 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-100 font-serif flex items-center gap-2">
                <span>ミニテスト（10問）を受験中です</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  回答済み: {activeSession.answered} / {activeSession.total} 問
                </span>
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                寺社や史跡の場所を確認したら、いつでもテストの続きへ戻れます。
              </p>
            </div>
          </div>
          <button
            onClick={onResumeTest}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <span>テストの続きに戻る</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 京都市内 方位・位置関係マップ（文字ではなく図で一目で南北・東西の関係がわかる） */}
      <div 
        ref={mapSectionRef}
        id="kyoto-spatial-map-section"
        className={`space-y-2.5 scroll-mt-20 sm:scroll-mt-24 transition-all duration-300 rounded-2xl ${
          isMapFlashing 
            ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-stone-900 shadow-2xl shadow-amber-500/50 scale-[1.01]' 
            : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2 font-serif">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <span>京都市内 寺社・史跡 位置関係マップ</span>
          </h3>
          <span className="text-[11px] text-stone-400">
            京都駅・御所・鴨川を基準に、各寺社が南・北・東・西のどこにあるかを可視化
          </span>
        </div>
        <KyotoVisualSpatialMap
          targetSpot={selectedMapSpot}
          onSelectSpot={(spot) => setSelectedMapSpot(spot)}
        />
      </div>

      {/* 検索・絞り込みコントロール */}
      <div className="bg-stone-850/90 border border-stone-750 rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5">
        {/* キーワード検索入力 */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="寺社名、最寄バス停、駅名、キーワードで検索（例: 金閣、市バス、世界遺産、空海）..."
            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-stone-400 hover:text-stone-200 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              クリア
            </button>
          )}
        </div>

        {/* エリアタブ切り替え */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                selectedArea === area
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-300 border-stone-750 hover:bg-stone-800'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* サブフィルター（世界遺産のみ・種別） */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-stone-800 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-stone-750 text-stone-100 border border-stone-600'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setSelectedCategory('temple')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedCategory === 'temple'
                  ? 'bg-stone-750 text-stone-100 border border-stone-600'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              寺院のみ
            </button>
            <button
              onClick={() => setSelectedCategory('shrine')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedCategory === 'shrine'
                  ? 'bg-stone-750 text-stone-100 border border-stone-600'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              神社のみ
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-stone-300 hover:text-stone-100">
            <input
              type="checkbox"
              checked={onlyWorldHeritage}
              onChange={(e) => setOnlyWorldHeritage(e.target.checked)}
              className="rounded border-stone-600 text-amber-500 focus:ring-amber-400 focus:ring-offset-stone-900"
            />
            <span className="flex items-center gap-1 font-medium text-[11px] sm:text-xs">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>世界文化遺産のみ表示</span>
            </span>
          </label>
        </div>
      </div>

      {/* スポット数カウンター */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
        <span>
          該当: <strong className="text-amber-400 font-mono text-sm">{filteredSpots.length}</strong> 件の寺社・史跡
        </span>
        <span className="text-[11px] text-stone-500">
          ※ カードの「Google マップ」ボタンから直ちに現在地からのルートや正確な境内を確認できます
        </span>
      </div>

      {/* スポットカード一覧グリッド */}
      {filteredSpots.length === 0 ? (
        <div className="bg-stone-850/60 border border-stone-750 rounded-2xl p-8 text-center space-y-3">
          <MapPin className="w-8 h-8 text-stone-500 mx-auto" />
          <p className="text-stone-300 font-medium">条件に一致する寺社・史跡が見つかりませんでした</p>
          <button
            onClick={() => {
              setSelectedArea('すべて');
              setSearchQuery('');
              setOnlyWorldHeritage(false);
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs border border-stone-700 transition-colors"
          >
            フィルターをリセット
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSpots.map((spot) => {
            // 方角の自動判定
            const direction = spot.direction || (
              spot.area.includes('洛南') ? '南' :
              spot.area.includes('洛北') ? '北' :
              spot.area.includes('洛東') ? '東' :
              spot.area.includes('洛西') ? '西' :
              spot.area.includes('宇治') ? '南郊外' : '中央'
            );

            return (
              <div
                key={spot.id}
                className="bg-stone-850/90 hover:bg-stone-850 border border-stone-750 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-md transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  {/* バッジ群: 方角・エリア・種別・世界遺産 */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* 方角バッジ（南なのか北なのかが直感的にわかる） */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-stone-950 shadow-sm">
                        【{direction}】
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                        {spot.area}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                        {spot.categoryLabel}
                      </span>
                    </div>

                    {spot.worldHeritage && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>世界遺産</span>
                      </span>
                    )}
                  </div>

                  {/* スポット名称 */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-stone-100 font-serif group-hover:text-amber-300 transition-colors">
                      {spot.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleScrollToMap(spot)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 hover:text-amber-100 border border-amber-500/40 flex items-center gap-1 shrink-0 cursor-pointer transition-all active:scale-95 shadow-sm"
                      title="上の位置関係マップへジャンプして位置を確認"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>マップで確認 ↑</span>
                    </button>
                  </div>

                  {/* 説明欄・見どころ（カード内に直接掲載） */}
                  <p className="text-xs text-stone-300 leading-relaxed pt-0.5">
                    {spot.description}
                  </p>

                  {/* 所在地 */}
                  <div className="text-[11px] text-stone-400 pt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                    <span>所在地: {spot.address || spot.ward}</span>
                  </div>
                </div>

                {/* カード下部アクション: 直接Googleマップへジャンプ */}
                <div className="pt-2 border-t border-stone-800 shrink-0">
                  <a
                    href={spot.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    title={`${spot.name}の正確な場所・ルートをGoogleマップで確認する`}
                  >
                    <MapPin className="w-3.5 h-3.5 fill-stone-950" />
                    <span>Google マップで場所・ルートを見る ↗</span>
                    <ExternalLink className="w-3 h-3 text-stone-950/80" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
