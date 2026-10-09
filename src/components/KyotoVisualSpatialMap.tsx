import React from 'react';
import { Compass, MapPin } from 'lucide-react';
import { KyotoSpot } from '../data/kyotoSpotsData';

interface KyotoVisualSpatialMapProps {
  targetSpot: KyotoSpot | null;
  otherSpots?: KyotoSpot[];
  compact?: boolean;
  onSelectSpot?: (spot: KyotoSpot) => void;
}

// 基準となる京都の主要ランドマーク（誰でも知っている方角・位置の目印）
const BASE_LANDMARKS = [
  { id: 'gosho', name: '京都御所', label: '京都御所', lat: 35.025, lng: 135.762, area: '洛中', role: 'center' },
  { id: 'kyotostation', name: '京都駅', label: '京都駅', lat: 34.985, lng: 135.758, area: '洛中南', role: 'benchmark' },
  { id: 'kinkakuji', name: '金閣寺', label: '金閣寺', lat: 35.039, lng: 135.729, area: '洛西/北西', role: 'landmark' },
  { id: 'ginkakuji', name: '銀閣寺', label: '銀閣寺', lat: 35.027, lng: 135.798, area: '洛東', role: 'landmark' },
  { id: 'kiyomizudera', name: '清水寺', label: '清水寺', lat: 34.994, lng: 135.785, area: '洛東', role: 'landmark' },
  { id: 'arashiyama', name: '嵐山・渡月橋', label: '嵐山', lat: 35.013, lng: 135.677, area: '洛西', role: 'landmark' },
  { id: 'toji', name: '東寺', label: '東寺', lat: 34.980, lng: 135.747, area: '洛南', role: 'landmark' },
  { id: 'fushimiinari', name: '伏見稲荷', label: '伏見稲荷', lat: 34.967, lng: 135.772, area: '洛南', role: 'landmark' },
  { id: 'kamigamo', name: '上賀茂神社', label: '上賀茂', lat: 35.059, lng: 135.752, area: '洛北', role: 'landmark' },
  { id: 'byodoin', name: '平等院', label: '平等院(宇治)', lat: 34.889, lng: 135.807, area: '宇治', role: 'landmark' },
];

// 緯度・経度からSVG座標 (width: 480, height: 320) へ変換
function projectCoordinates(lat: number, lng: number): { x: number; y: number } {
  const minLat = 34.880; // 宇治
  const maxLat = 35.080; // 上賀茂・北山
  const minLng = 135.660; // 嵐山・嵯峨野西
  const maxLng = 135.820; // 東山・銀閣寺・宇治東

  const paddingX = 40;
  const paddingY = 32;
  const width = 480 - paddingX * 2;
  const height = 320 - paddingY * 2;

  // 経度 (西->東)
  const normX = Math.max(0, Math.min(1, (lng - minLng) / (maxLng - minLng)));
  const x = paddingX + normX * width;

  // 緯度 (北->南: 上が北なので maxLat - lat)
  const normY = Math.max(0, Math.min(1, (maxLat - lat) / (maxLat - minLat)));
  const y = paddingY + normY * height;

  return { x: Math.round(x), y: Math.round(y) };
}

export const KyotoVisualSpatialMap: React.FC<KyotoVisualSpatialMapProps> = ({
  targetSpot,
  otherSpots = [],
  compact = false,
  onSelectSpot,
}) => {
  // ターゲットスポットの座標
  const targetCoords = targetSpot ? projectCoordinates(targetSpot.lat, targetSpot.lng) : null;

  // 他の選択肢のスポットの座標
  const otherPoints = otherSpots.map((spot, idx) => ({
    spot,
    idx: idx + 1,
    coords: projectCoordinates(spot.lat, spot.lng),
  }));

  // ターゲットスポットのIDと一致するベースランドマーク
  const targetId = targetSpot?.id;

  return (
    <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-inner">
      {/* マップ上部バー: 方位インジケーター & 説明 */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-stone-200">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <span>京都市内 寺社・史跡 位置関係マップ</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm"></span>
            <span className="text-amber-300 font-semibold">出題・正解</span>
          </span>
          {otherSpots.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
              <span className="text-sky-300">他の選択肢</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-600 inline-block"></span>
            <span>基準地名</span>
          </span>
        </div>
      </div>

      {/* ターゲットスポット選択時の案内バナー（マップへジャンプしたことが一目でわかる） */}
      {targetSpot && (
        <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-amber-500/25 via-stone-900 to-amber-500/20 border-2 border-amber-500/70 rounded-xl px-3 py-2 text-xs shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="font-bold text-amber-200">
              「{targetSpot.name}」の位置を点滅表示中（京都市の【{targetSpot.direction || (targetSpot.area.includes('洛南') ? '南' : targetSpot.area.includes('洛北') ? '北' : targetSpot.area.includes('洛東') ? '東' : targetSpot.area.includes('洛西') ? '西' : '中央')}】）
            </span>
          </div>
          {onSelectSpot && (
            <button
              onClick={() => onSelectSpot(null as any)}
              className="text-[11px] text-stone-400 hover:text-stone-200 underline cursor-pointer shrink-0"
              title="選択を解除して全体表示に戻す"
            >
              解除
            </button>
          )}
        </div>
      )}

      {/* SVGビジュアル配置図 */}
      <div className={`relative w-full aspect-[480/320] max-h-[300px] bg-stone-900/90 border rounded-xl overflow-hidden shadow-md select-none transition-all ${
        targetSpot ? 'border-amber-500/80 ring-2 ring-amber-500/30' : 'border-stone-800'
      }`}>
        <svg
          viewBox="0 0 480 320"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
        >
          {/* 背景グリッド (京都の碁盤の目を連想させる薄いグリッド) */}
          <defs>
            <pattern id="kyotoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            {/* ターゲット用のパルスアニメーショングラデーション */}
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="480" height="320" fill="url(#kyotoGrid)" />

          {/* 方角エリアガイド（背景の薄いゾーン境界） */}
          {/* 洛北 */}
          <text x="240" y="24" textAnchor="middle" fill="rgba(214,211,209,0.3)" fontSize="11" fontWeight="bold">
            ▲ 北（洛北・鞍馬・大原）
          </text>
          {/* 洛南 */}
          <text x="240" y="310" textAnchor="middle" fill="rgba(214,211,209,0.3)" fontSize="11" fontWeight="bold">
            ▼ 南（洛南・伏見・宇治方面）
          </text>
          {/* 洛西 */}
          <text x="24" y="160" textAnchor="middle" fill="rgba(214,211,209,0.3)" fontSize="11" fontWeight="bold" transform="rotate(-90, 24, 160)">
            ◀ 西（洛西・嵐山）
          </text>
          {/* 洛東 */}
          <text x="460" y="160" textAnchor="middle" fill="rgba(214,211,209,0.3)" fontSize="11" fontWeight="bold" transform="rotate(90, 460, 160)">
            ▶ 東（洛東・東山）
          </text>

          {/* 鴨川（かもがわ）の流路（賀茂川＋高野川合流〜四条〜京都駅東〜伏見） */}
          <path
            d="M 330 20 Q 320 60, 315 90 Q 305 130, 310 170 Q 315 210, 310 250 Q 300 280, 280 320"
            fill="none"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="3.5"
            strokeDasharray="4 2"
          />
          <text x="322" y="80" fill="rgba(56, 189, 248, 0.4)" fontSize="9" fontWeight="medium">
            鴨川
          </text>

          {/* 京都駅の東西基準ライン（京都駅より南が「洛南」であることの明確な視覚指標） */}
          <line
            x1="120"
            y1="184"
            x2="420"
            y2="184"
            stroke="rgba(245, 158, 11, 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text x="125" y="180" fill="rgba(245, 158, 11, 0.4)" fontSize="8">
            ── JR京都駅 東西ライン（ここより南が「洛南」）
          </text>

          {/* 基準ランドマーク（控えめに常時表示） */}
          {BASE_LANDMARKS.map((lm) => {
            const coords = projectCoordinates(lm.lat, lm.lng);
            const isTarget = targetId === lm.id;
            if (isTarget) return null; // ターゲットの場合は後で大きく描画

            const isStation = lm.id === 'kyotostation';
            const isGosho = lm.id === 'gosho';

            return (
              <g key={lm.id} className="cursor-default">
                {isStation ? (
                  // 京都駅は基準四角
                  <rect
                    x={coords.x - 16}
                    y={coords.y - 7}
                    width="32"
                    height="14"
                    rx="3"
                    fill="rgba(38, 38, 38, 0.9)"
                    stroke="rgba(168, 162, 158, 0.5)"
                    strokeWidth="1"
                  />
                ) : isGosho ? (
                  // 京都御所は緑の四角
                  <rect
                    x={coords.x - 14}
                    y={coords.y - 8}
                    width="28"
                    height="16"
                    rx="2"
                    fill="rgba(20, 83, 45, 0.35)"
                    stroke="rgba(34, 197, 94, 0.4)"
                    strokeWidth="1"
                  />
                ) : (
                  // その他の寺社ランドマーク
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="3"
                    fill="rgba(120, 113, 108, 0.6)"
                    stroke="rgba(41, 37, 36, 0.8)"
                    strokeWidth="1"
                  />
                )}
                <text
                  x={coords.x}
                  y={coords.y + (isGosho ? 3 : isStation ? 3 : 11)}
                  textAnchor="middle"
                  fill={isStation ? '#e7e5e4' : isGosho ? '#86efac' : '#a8a29e'}
                  fontSize={isStation || isGosho ? '8.5' : '7.5'}
                  fontWeight={isStation || isGosho ? 'bold' : 'normal'}
                >
                  {lm.label}
                </text>
              </g>
            );
          })}

          {/* 他の選択肢のスポット（青色ピン） */}
          {otherPoints.map(({ spot, coords, idx }) => {
            if (targetId === spot.id) return null;
            return (
              <g
                key={spot.id}
                className="cursor-pointer group"
                onClick={() => onSelectSpot && onSelectSpot(spot)}
              >
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="5"
                  fill="#38bdf8"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />
                <rect
                  x={coords.x - 22}
                  y={coords.y - 18}
                  width="44"
                  height="12"
                  rx="3"
                  fill="rgba(12, 74, 110, 0.85)"
                  stroke="#0284c7"
                  strokeWidth="0.8"
                />
                <text
                  x={coords.x}
                  y={coords.y - 9}
                  textAnchor="middle"
                  fill="#bae6fd"
                  fontSize="7.5"
                  fontWeight="bold"
                >
                  {spot.shortName || spot.name}
                </text>
              </g>
            );
          })}

          {/* 出題・正解のターゲットスポット（特大・金/緑の光るピン・連続点滅パルス） */}
          {targetSpot && targetCoords && (
            <g>
              {/* 外側へ広がる点滅波紋（連続アニメーション） */}
              <circle
                cx={targetCoords.x}
                cy={targetCoords.y}
                r="10"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              >
                <animate attributeName="r" values="8;36;8" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle
                cx={targetCoords.x}
                cy={targetCoords.y}
                r="16"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              >
                <animate attributeName="r" values="14;48;14" dur="1.8s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" begin="0.4s" repeatCount="indefinite" />
              </circle>

              {/* グロー背景 */}
              <circle
                cx={targetCoords.x}
                cy={targetCoords.y}
                r="24"
                fill="url(#targetGlow)"
              />

              {/* 中心ピン（白フチ＋黄金色） */}
              <circle
                cx={targetCoords.x}
                cy={targetCoords.y}
                r="7.5"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2.5"
              >
                <animate attributeName="transform" type="scale" values="1;1.15;1" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* ターゲット名吹き出しバナー */}
              <g transform={`translate(${targetCoords.x}, ${targetCoords.y - 30})`}>
                <rect
                  x="-60"
                  y="-1"
                  width="120"
                  height="24"
                  rx="6"
                  fill="#1c1917"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.9))"
                />
                <polygon
                  points="-5,23 5,23 0,29"
                  fill="#1c1917"
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="15"
                  textAnchor="middle"
                  fill="#fef08a"
                  fontSize="10"
                  fontWeight="bold"
                >
                  📍 {targetSpot.shortName || targetSpot.name}
                </text>
              </g>
            </g>
          )}

          {/* 方位コンパスローズ (右上) */}
          <g transform="translate(440, 36)">
            <circle cx="0" cy="0" r="14" fill="rgba(28, 25, 23, 0.7)" stroke="rgba(168, 162, 158, 0.4)" strokeWidth="1" />
            <polygon points="0,-12 3,-2 0,0 -3,-2" fill="#ef4444" />
            <polygon points="0,12 3,2 0,0 -3,2" fill="#a8a29e" />
            <polygon points="-12,0 -2,3 0,0 -2,-3" fill="#a8a29e" />
            <polygon points="12,0 2,3 0,0 2,-3" fill="#a8a29e" />
            <text x="0" y="-14" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">北</text>
            <text x="0" y="21" textAnchor="middle" fill="#a8a29e" fontSize="7">南</text>
            <text x="19" y="3" textAnchor="middle" fill="#a8a29e" fontSize="7">東</text>
            <text x="-19" y="3" textAnchor="middle" fill="#a8a29e" fontSize="7">西</text>
          </g>
        </svg>
      </div>

      {/* マップ下の要点解説バー: 一目でわかる方角と基準地との関係 */}
      {targetSpot && (
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs bg-stone-900/90 border border-stone-800 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500 text-stone-950">
              京都市の【{targetSpot.direction || (targetSpot.area.includes('洛南') ? '南' : targetSpot.area.includes('洛北') ? '北' : targetSpot.area.includes('洛東') ? '東' : targetSpot.area.includes('洛西') ? '西' : '中央')}】
            </span>
            <span className="text-stone-300 font-medium">
              {targetSpot.area}
            </span>
            <span className="text-stone-400 text-[11px]">
              （最寄: {targetSpot.nearestAccess}）
            </span>
          </div>

          <a
            href={targetSpot.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition-all cursor-pointer shrink-0"
            title={`${targetSpot.name}をGoogleマップで開く`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google マップで正確な場所を開く ↗</span>
          </a>
        </div>
      )}
    </div>
  );
};
