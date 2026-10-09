/**
 * 京都検定3級 頻出神社・寺院・史跡・名所 総合ロケーションデータベース
 * 
 * 軽量化設計：
 * - 外部地図への安全な公式URL生成（Google Maps）
 * - 問題文・選択肢・解説から関連寺社を自動検出するスマートマッチャー搭載
 * - アプリ動作を重くせず、コンパクトで風情あるバッジ/リンクを提供
 */

import { Question } from '../types';

export interface KyotoSpot {
  id: string;
  name: string;             // 正式名称 / 通称併記 (例: 金閣寺（鹿苑寺）)
  shortName: string;        // 略称 (例: 金閣寺)
  aliases: string[];        // 検出用別名 (例: ['金閣寺', '鹿苑寺', '金閣'])
  category: 'temple' | 'shrine' | 'castle_palace' | 'historic';
  categoryLabel: string;    // '寺院' | '神社' | '城郭・宮殿' | '史跡・名所'
  area: '洛東・東山・岡崎' | '洛西・嵯峨嵐山・太秦' | '洛中・京都御所周辺' | '洛北・大原・鞍馬' | '洛南・伏見' | '宇治・山城・八幡';
  ward: string;             // 区・市 (例: '京都市北区')
  address: string;          // 所在地
  nearestAccess: string;    // 最寄交通機関 (検定頻出)
  worldHeritage: boolean;   // 世界文化遺産「古都京都の文化財」
  description: string;      // 寺社概要・京都検定の急所
  searchQuery: string;      // Google Maps 検索クエリ
  googleMapsUrl: string;    // Google Maps 公式URL
  lat: number;              // 緯度
  lng: number;              // 経度
  direction?: string;       // 方角（例: '南', '東', '北西', '中央'）
  locationRelation?: string;// 京都市内の位置・他史跡との位置関係
}

// 京都検定3級 主要100+寺社・史跡マスターデータ
export const KYOTO_SPOTS: KyotoSpot[] = [
  // ==========================================
  // 世界遺産＆洛北エリア
  // ==========================================
  {
    id: 'kinkakuji',
    name: '金閣寺（鹿苑寺）',
    shortName: '金閣寺',
    aliases: ['金閣寺', '鹿苑寺', '舎利殿金閣', '金閣'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '京都市北区',
    address: '京都市北区金閣寺町1',
    nearestAccess: '市バス「金閣寺道」すぐ',
    worldHeritage: true,
    description: '臨済宗相国寺派。室町幕府3代将軍・足利義満が北山殿として営み、死後寺院化。金箔を貼った3層の舎利殿（寝殿造・武家造・禅宗様）と鏡湖池が名高い。',
    searchQuery: '金閣寺 京都市北区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('金閣寺 京都市北区'),
    lat: 35.0394,
    lng: 135.7292,
  },
  {
    id: 'kamigamo',
    name: '上賀茂神社（賀茂別雷神社）',
    shortName: '上賀茂神社',
    aliases: ['上賀茂神社', '賀茂別雷神社', '賀茂社'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛北・大原・鞍馬',
    ward: '京都市北区',
    address: '京都市北区上賀茂本山339',
    nearestAccess: '市バス「上賀茂神社前」すぐ',
    worldHeritage: true,
    description: '山城国一宮。祭神は賀茂別雷大神。細殿前の立砂（神山を模した陰陽の盛り砂）や流造の本殿・権殿（国宝）が著名。葵祭の終着地。',
    searchQuery: '上賀茂神社 京都市北区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('上賀茂神社 京都市北区'),
    lat: 35.0596,
    lng: 135.7525,
  },
  {
    id: 'shimogamo',
    name: '下鴨神社（賀茂御祖神社）',
    shortName: '下鴨神社',
    aliases: ['下鴨神社', '賀茂御祖神社', '糺の森'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛北・大原・鞍馬',
    ward: '京都市左京区',
    address: '京都市左京区下鴨泉川町59',
    nearestAccess: '京阪・叡電「出町柳駅」徒歩約10分 / 市バス「下鴨神社前」',
    worldHeritage: true,
    description: '山城国一宮。賀茂建角身命・玉依媛命を祀る。原生林「糺の森」に囲まれ、みたらし祭で知られる御手洗池や河合神社（方丈庵の鴨長明ゆかり）を擁する。',
    searchQuery: '下鴨神社 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('下鴨神社 京都市左京区'),
    lat: 35.0388,
    lng: 135.7731,
  },
  {
    id: 'daitokuji',
    name: '大徳寺',
    shortName: '大徳寺',
    aliases: ['大徳寺', '紫野大徳寺', '聚光院', '大仙院', '高桐院', '龍光院'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '京都市北区',
    address: '京都市北区紫野大徳寺町53',
    nearestAccess: '市バス「大徳寺前」すぐ',
    worldHeritage: false,
    description: '臨済宗大徳寺派大本山。宗峰妙超（大灯国師）が開山。一休宗純が復興し、千利休の切腹の原因となった山門（金毛閣）や大仙院枯山水庭園など名塔頭が密集。',
    searchQuery: '大徳寺 京都市北区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('大徳寺 京都市北区'),
    lat: 35.0435,
    lng: 135.7447,
  },
  {
    id: 'sanzenin',
    name: '三千院（三千院門跡）',
    shortName: '三千院',
    aliases: ['三千院', '三千院門跡', '梶井門跡', '往生極楽院'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '京都市左京区',
    address: '京都市左京区大原来迎院町540',
    nearestAccess: '京都バス「大原」徒歩約10分',
    worldHeritage: false,
    description: '天台宗五箇箇門跡の一つ。最澄が比叡山東塔に建立した円融房が起源で、明治初期に大原へ移転。往生極楽院の阿弥陀三尊像（国宝）や有清園の苔庭が有名。',
    searchQuery: '三千院 京都市左京区大原',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('三千院 京都市左京区大原'),
    lat: 35.1214,
    lng: 135.8344,
  },
  {
    id: 'jakkoin',
    name: '寂光院',
    shortName: '寂光院',
    aliases: ['寂光院'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '京都市左京区',
    address: '京都市左京区大原草生町676',
    nearestAccess: '京都バス「大原」徒歩約15分',
    worldHeritage: false,
    description: '聖徳太子創建と伝える天台宗尼寺。平家滅亡後に建礼門院（平徳子）が隠棲し、平家一門の菩提を弔った『平家物語』大原御幸の舞台。',
    searchQuery: '寂光院 京都市左京区大原',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('寂光院 京都市左京区大原'),
    lat: 35.1168,
    lng: 135.8197,
  },
  {
    id: 'kifune',
    name: '貴船神社',
    shortName: '貴船神社',
    aliases: ['貴船神社', '貴船社'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛北・大原・鞍馬',
    ward: '京都市左京区',
    address: '京都市左京区鞍馬貴船町180',
    nearestAccess: '叡電「貴船口駅」より京都バス「貴船」下車徒歩約5分',
    worldHeritage: false,
    description: '全国の貴船神社の総本社。主祭神は高龗神（水神）。「絵馬発祥の社」としても知られ、和泉式部が夫との復縁を祈願した結社など縁結びの信仰も篤い。',
    searchQuery: '貴船神社 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('貴船神社 京都市左京区'),
    lat: 35.1218,
    lng: 135.7629,
  },
  {
    id: 'kurama',
    name: '鞍馬寺',
    shortName: '鞍馬寺',
    aliases: ['鞍馬寺', '鞍馬山', '由岐神社'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '京都市左京区',
    address: '京都市左京区鞍馬本町1074',
    nearestAccess: '叡山電鉄「鞍馬駅」徒歩約3分（山門）',
    worldHeritage: false,
    description: '鑑真の弟子・鑑禎が毘沙門天を祀ったのが始まり。鞍馬弘教総本山。源義経（牛若丸）が鞍馬天狗から武術を学んだ伝説の地。10月22日の鞍馬の火祭（由岐神社）も有名。',
    searchQuery: '鞍馬寺 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('鞍馬寺 京都市左京区'),
    lat: 35.1186,
    lng: 135.7712,
  },
  {
    id: 'shisendo',
    name: '詩仙堂（丈山寺）',
    shortName: '詩仙堂',
    aliases: ['詩仙堂', '丈山寺', '石川丈山'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '京都市左京区',
    address: '京都市左京区一乗寺門口町27',
    nearestAccess: '市バス「一乗寺下り松町」徒歩約7分 / 叡電「一乗寺駅」',
    worldHeritage: false,
    description: '徳川家の武士を辞した石川丈山が営んだ山荘跡（曹洞宗寺院）。狩野探幽に描かせた中国の「詩家三十六人」の肖像を掲げた詩仙の間と、日本初の「添水（ししおどし）」の庭園が名高い。',
    searchQuery: '詩仙堂 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('詩仙堂 京都市左京区'),
    lat: 35.0444,
    lng: 135.7958,
  },
  {
    id: 'manshuin',
    name: '曼殊院（曼殊院門跡）',
    shortName: '曼殊院',
    aliases: ['曼殊院', '曼殊院門跡', '竹の内門跡'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '京都市左京区',
    address: '京都市左京区一乗寺竹ノ内町42',
    nearestAccess: '市バス「一乗寺清水町」徒歩約20分 / 叡電「修学院駅」',
    worldHeritage: false,
    description: '天台宗五箇箇門跡の一つ。是算国師開山。良尚法親王が現在地に移築し、桂離宮と共通する数寄屋風書院造の大書院・小書院（重文）と枯山水庭園が見事。',
    searchQuery: '曼殊院 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('曼殊院 京都市左京区'),
    lat: 35.0465,
    lng: 135.7997,
  },
  {
    id: 'enryakuji',
    name: '延暦寺（比叡山延暦寺）',
    shortName: '延暦寺',
    aliases: ['延暦寺', '比叡山延暦寺', '根本中堂', '東塔', '西塔', '横川'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛北・大原・鞍馬',
    ward: '滋賀県大津市・京都市左京区',
    address: '滋賀県大津市坂本本町4220（比叡山嶺）',
    nearestAccess: '叡山ケーブル・ロープウェイ「比叡山頂」よりシャトルバス',
    worldHeritage: true,
    description: '伝教大師最澄が延暦7年（788）に開創した天台宗総本山。日本仏教の母山と呼ばれ、法然・親鸞・栄西・道元・日蓮らが修行した。国宝・根本中堂の「不滅の法灯」が有名。',
    searchQuery: '比叡山 延暦寺',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('比叡山 延暦寺'),
    lat: 35.0705,
    lng: 135.8415,
  },

  // ==========================================
  // 洛東・東山・岡崎エリア
  // ==========================================
  {
    id: 'kiyomizudera',
    name: '清水寺',
    shortName: '清水寺',
    aliases: ['清水寺', '音羽山清水寺', '清水の舞台', '音羽の滝'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区清水1丁目294',
    nearestAccess: '市バス「清水道」または「五条坂」徒歩約10分',
    worldHeritage: true,
    description: '宝亀9年（778）延鎮開山、坂上田村麻呂開基と伝える北法相宗大本山。国宝の本堂「清水の舞台（懸造）」や音羽の滝（黄金水・延命水）で世界的に名高い。',
    searchQuery: '清水寺 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('清水寺 京都市東山区'),
    lat: 34.9948,
    lng: 135.7850,
  },
  {
    id: 'ginkakuji',
    name: '銀閣寺（慈照寺）',
    shortName: '銀閣寺',
    aliases: ['銀閣寺', '慈照寺', '観音殿銀閣', '東求堂', '銀閣'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市左京区',
    address: '京都市左京区銀閣寺町2',
    nearestAccess: '市バス「銀閣寺道」徒歩約7分',
    worldHeritage: true,
    description: '臨済宗相国寺派。室町幕府8代将軍・足利義政が東山殿として造営した東山文化の象徴。国宝の観音殿（銀閣）と、最古の書院造（同仁斎付）である東求堂を擁する。向月台・銀沙灘も見所。',
    searchQuery: '銀閣寺 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('銀閣寺 京都市左京区'),
    lat: 35.0272,
    lng: 135.7982,
  },
  {
    id: 'yasakajinja',
    name: '八坂神社（祇園社）',
    shortName: '八坂神社',
    aliases: ['八坂神社', '祇園社', '感神院', '祇園さん'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区祇園町北側625',
    nearestAccess: '京阪「祇園四条駅」徒歩約5分 / 市バス「祇園」すぐ',
    worldHeritage: false,
    description: '全国の祇園社の総本社。主祭神は素戔嗚尊。京都三大祭「祇園祭（7月1日〜31日）」の主催神社。本殿は本殿と拝殿を一つの入母屋屋根で覆う特異な「祇園造（国宝）」。',
    searchQuery: '八坂神社 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('八坂神社 京都市東山区'),
    lat: 35.0037,
    lng: 135.7785,
  },
  {
    id: 'heianjingu',
    name: '平安神宮',
    shortName: '平安神宮',
    aliases: ['平安神宮', '時代祭', '大鳥居'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛東・東山・岡崎',
    ward: '京都市左京区',
    address: '京都市左京区岡崎西天王町97',
    nearestAccess: '地下鉄東西線「東山駅」徒歩約10分 / 市バス「岡崎公園 美術館・平安神宮前」',
    worldHeritage: false,
    description: '明治28年（1895）、平安遷都1100年を記念して創建。桓武天皇と孝明天皇を祀る。大内裏の朝堂院を5/8規模で復元。京都三大祭「時代祭（10月22日）」の社。小川治兵衛作庭の神苑が名高い。',
    searchQuery: '平安神宮 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('平安神宮 京都市左京区'),
    lat: 35.0160,
    lng: 135.7824,
  },
  {
    id: 'nanzenji',
    name: '南禅寺',
    shortName: '南禅寺',
    aliases: ['南禅寺', '太平興国南禅禅寺', '水路閣', '南禅院'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市左京区',
    address: '京都市左京区南禅寺福地町86',
    nearestAccess: '地下鉄東西線「蹴上駅」徒歩約8分 / 市バス「南禅寺・永観堂道」',
    worldHeritage: false,
    description: '臨済宗南禅寺派大本山。亀山法皇が無関普門（大明国師）を開山として創建。「五山之上」の最高位に列せられた。「絶景かな」で知られる三門（天下竜門）や小川治兵衛庭園、赤煉瓦の「水路閣」が有名。',
    searchQuery: '南禅寺 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('南禅寺 京都市左京区'),
    lat: 35.0116,
    lng: 135.7942,
  },
  {
    id: 'chionin',
    name: '知恩院',
    shortName: '知恩院',
    aliases: ['知恩院', '華頂山知恩教院大谷寺', '御影堂', '鶯張りの廊下'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区林下町400',
    nearestAccess: '市バス「知恩院前」徒歩約5分 / 地下鉄「東山駅」徒歩約8分',
    worldHeritage: false,
    description: '浄土宗総本山。宗祖法然上人が草庵を結び専修念仏を弘めた地。徳川家康・秀忠・家光の手により巨大伽藍が整えられた。木造建築として日本最大級の三門（国宝）や「七不思議」が有名。',
    searchQuery: '知恩院 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('知恩院 京都市東山区'),
    lat: 35.0058,
    lng: 135.7831,
  },
  {
    id: 'kenninji',
    name: '建仁寺',
    shortName: '建仁寺',
    aliases: ['建仁寺', '風神雷神図屏風', '潮音庭', '栄西'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区大和大路通四条下る小松町584',
    nearestAccess: '京阪「祇園四条駅」徒歩約7分 / 阪急「京都河原町駅」徒歩約10分',
    worldHeritage: false,
    description: '建仁2年（1202）源頼家が開基、栄西禅師が開山となった京都最古の禅寺（京都五山第3位）。俵屋宗達筆の国宝「風神雷神図屏風」や海北友松の障壁画、法堂天井の「双龍図」で有名。',
    searchQuery: '建仁寺 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('建仁寺 京都市東山区'),
    lat: 35.0006,
    lng: 135.7736,
  },
  {
    id: 'eikando',
    name: '永観堂（禅林寺）',
    shortName: '永観堂',
    aliases: ['永観堂', '禅林寺', 'みかえり阿弥陀', 'もみじの永観堂'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市左京区',
    address: '京都市左京区永観堂町48',
    nearestAccess: '市バス「南禅寺・永観堂道」徒歩約3分 / 地下鉄「蹴上駅」徒歩約15分',
    worldHeritage: false,
    description: '空海の高弟・真紹が創建した浄土宗西山禅林寺派総本山。「もみじの永観堂」と親しまれ、首を左にかしげた重要文化財「みかえり阿弥陀像」が名高い。',
    searchQuery: '永観堂 禅林寺 京都市左京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('永観堂 禅林寺 京都市左京区'),
    lat: 35.0145,
    lng: 135.7954,
  },
  {
    id: 'kodaiji',
    name: '高台寺（高台寿聖禅寺）',
    shortName: '高台寺',
    aliases: ['高台寺', '北政所ねね', '高台寺蒔絵', '開山堂', '傘亭', '時雨亭'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区高台寺下河原町526',
    nearestAccess: '市バス「東山安井」徒歩約7分 / 京阪「祇園四条駅」徒歩約15分',
    worldHeritage: false,
    description: '慶長11年（1606）、豊臣秀吉の正室・北政所（ねね）が秀吉の菩提を弔うため徳川家康の援助で創建した臨済宗建仁寺派寺院。霊屋の蒔絵（高台寺蒔絵）や伏見城から移築された茶室「傘亭・時雨亭（重文）」が見所。',
    searchQuery: '高台寺 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('高台寺 京都市東山区'),
    lat: 35.0003,
    lng: 135.7816,
  },
  {
    id: 'sanjusangendo',
    name: '三十三間堂（蓮華王院本堂）',
    shortName: '三十三間堂',
    aliases: ['三十三間堂', '蓮華王院'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区三十三間堂廻り町657',
    nearestAccess: '市バス「博物館三十三間堂前」すぐ / 京阪「七条駅」徒歩約7分',
    worldHeritage: false,
    description: '長寛2年（1164）後白河上皇が平清盛に命じて建立した妙法院の飛地境内（天台宗）。南北約120mの本堂（国宝）内に1001体の木造千手観音立像（すべて国宝）や風神雷神・二十八部衆像が居並ぶ。新春の「通し矢（大的全国大会）」で有名。',
    searchQuery: '三十三間堂 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('三十三間堂 京都市東山区'),
    lat: 34.9879,
    lng: 135.7717,
  },
  {
    id: 'rokuharamitsuji',
    name: '六波羅蜜寺',
    shortName: '六波羅蜜寺',
    aliases: ['六波羅蜜寺', '西国十七番'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区五条通大和大路上る東',
    nearestAccess: '市バス「清水道」徒歩約7分 / 京阪「清水五条駅」徒歩約7分',
    worldHeritage: false,
    description: '天暦5年（951）醍醐天皇皇子・空也上人が悪病退散のため開創（真言宗智山派）。口から6体の阿弥陀仏を唱え出す「空也上人立像（国宝）」や「平清盛坐像（重文）」を所蔵。かつて平家一門の屋敷が立ち並んだ六波羅の中心地。',
    searchQuery: '六波羅蜜寺 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('六波羅蜜寺 京都市東山区'),
    lat: 34.9967,
    lng: 135.7733,
  },
  {
    id: 'tofukuji',
    name: '東福寺',
    shortName: '東福寺',
    aliases: ['東福寺', '通天橋'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区本町15丁目778',
    nearestAccess: 'JR奈良線・京阪本線「東福寺駅」徒歩約10分',
    worldHeritage: false,
    description: '九条道家が奈良の東大寺と興福寺から一字ずつ取って建立、円爾（弁円／聖一国師）を開山とした臨済宗東福寺派大本山（京都五山第4位）。渓谷洗玉澗に架かる「通天橋」の紅葉や、重森三玲作の八相の庭（市松模様の敷石）で有名。',
    searchQuery: '東福寺 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('東福寺 京都市東山区'),
    lat: 34.9810,
    lng: 135.7745,
  },
  {
    id: 'sennyuji',
    name: '泉涌寺（御寺泉涌寺）',
    shortName: '泉涌寺',
    aliases: ['泉涌寺', '御寺', '楊貴妃観音'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区泉涌寺山内町27',
    nearestAccess: '市バス「泉涌寺道」徒歩約15分 / JR・京阪「東福寺駅」徒歩約20分',
    worldHeritage: false,
    description: '俊蕚（月輪大師）が再興。境内から清水が湧き出たことから泉涌寺と改称。四条天皇以降、歴代天皇の御陵（月輪陵）が置かれ「御寺（みてら）」と呼ばれる。楊貴妃観音堂（重文）も有名。',
    searchQuery: '泉涌寺 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('泉涌寺 京都市東山区'),
    lat: 34.9786,
    lng: 135.7797,
  },
  {
    id: 'shorenin',
    name: '青蓮院（青蓮院門跡）',
    shortName: '青蓮院',
    aliases: ['青蓮院', '青蓮院門跡', '粟田口', '青不動'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛東・東山・岡崎',
    ward: '京都市東山区',
    address: '京都市東山区粟田口三条坊町69-1',
    nearestAccess: '地下鉄東西線「東山駅」徒歩約5分 / 市バス「神宮道」徒歩約3分',
    worldHeritage: false,
    description: '天台宗五箇箇門跡の一つ。親鸞が得度した寺院。日本三不動の一つ「青不動明王二童子像（国宝）」を蔵し、相阿弥・小堀遠州作と伝わる名庭園や楠の巨木が有名。',
    searchQuery: '青蓮院門跡 京都市東山区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('青蓮院門跡 京都市東山区'),
    lat: 35.0069,
    lng: 135.7818,
  },

  // ==========================================
  // 洛西・嵯峨野・嵐山・太秦エリア
  // ==========================================
  {
    id: 'tenryuji',
    name: '天龍寺（霊亀山天龍資聖禅寺）',
    shortName: '天龍寺',
    aliases: ['天龍寺', '曹源池庭園'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区嵯峨天龍寺芒ノ馬場町68',
    nearestAccess: '京福（嵐電）「嵐山駅」すぐ / JR「嵯峨嵐山駅」徒歩約13分',
    worldHeritage: true,
    description: '足利尊氏が後醍醐天皇の菩提を弔うため、夢窓疎石を開山として創建した臨済宗天龍寺派大本山（京都五山第1位）。建造費用捻出のための「天龍寺船」派遣で有名。特別名勝第1号の曹源池庭園（借景庭園）が見事。',
    searchQuery: '天龍寺 京都市右京区嵐山',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('天龍寺 京都市右京区嵐山'),
    lat: 35.0158,
    lng: 135.6776,
  },
  {
    id: 'daikakuji',
    name: '大覚寺（旧嵯峨御所 大覚寺門跡）',
    shortName: '大覚寺',
    aliases: ['大覚寺', '嵯峨御所', '大沢池', 'いけばな嵯峨御流'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区嵯峨大沢町4',
    nearestAccess: '市バス「大覚寺」すぐ / JR「嵯峨嵐山駅」徒歩約18分',
    worldHeritage: false,
    description: '嵯峨天皇の離宮「嵯峨院」を寺院に改めた真言宗大覚寺派大本山。日本最古の人工庭園池「大沢池（名勝）」や、狩野山楽筆の襖絵（重文）、いけばな嵯峨御流の総司所として著名。',
    searchQuery: '大覚寺 京都市右京区嵯峨',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('大覚寺 京都市右京区嵯峨'),
    lat: 35.0278,
    lng: 135.6781,
  },
  {
    id: 'ninnaji',
    name: '仁和寺（旧御室御所）',
    shortName: '仁和寺',
    aliases: ['仁和寺', '御室御所', '御室桜'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区御室大内33',
    nearestAccess: '京福（嵐電）「御室仁和寺駅」徒歩約3分 / 市バス「御室仁和寺」',
    worldHeritage: true,
    description: '光孝天皇の遺志を継ぎ宇多天皇が仁和4年（888）に完成させた真言宗御室派総本山。宇多法皇が入寺して以来門跡寺院となり「御室御所」と呼ばれる。遅咲きで背の低い「御室桜（名勝）」や国宝・金堂で有名。',
    searchQuery: '仁和寺 京都市右京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('仁和寺 京都市右京区'),
    lat: 35.0300,
    lng: 135.7145,
  },
  {
    id: 'fukuojijinja',
    name: '福王子神社',
    shortName: '福王子神社',
    aliases: ['福王子神社', '福王子', '班子女王'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区宇多野福王子町',
    nearestAccess: '市バス「福王子」すぐ / 嵐電「宇多野駅」徒歩約5分',
    worldHeritage: false,
    description: '仁和寺の西約300m（周山街道・福王子交差点角）に鎮座する仁和寺の御室総鎮守。宇多天皇の生母・班子女王（多福の母神）を祀り、子授け・安産祈願の信仰を集める。本殿は徳川家光再建の重文。独特の破風付き福王子鳥居でも知られる。',
    searchQuery: '福王子神社 京都市右京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('福王子神社 京都市右京区'),
    lat: 35.0302,
    lng: 135.7107,
  },
  {
    id: 'ryoanji',
    name: '龍安寺',
    shortName: '龍安寺',
    aliases: ['龍安寺', '石庭', '細川勝元'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区龍安寺御陵下町13',
    nearestAccess: '京福（嵐電）「龍安寺駅」徒歩約7分 / 市バス「竜安寺前」すぐ',
    worldHeritage: true,
    description: '宝徳2年（1450）細川勝元が創建した臨済宗妙心寺派寺院。白砂に15個の巨石を5群に配置した「枯山水方丈庭園（石庭・史跡特別名勝）」は世界的な禅の美の極致。「吾唯足知（知足の蹲踞）」も有名。',
    searchQuery: '龍安寺 京都市右京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('龍安寺 京都市右京区'),
    lat: 35.0345,
    lng: 135.7182,
  },
  {
    id: 'koryuji',
    name: '広隆寺（蜂岡寺）',
    shortName: '広隆寺',
    aliases: ['広隆寺', '蜂岡寺', '弥勒菩薩半跏思惟像'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区太秦蜂岡町32',
    nearestAccess: '京福（嵐電）「太秦広隆寺駅」すぐ / 地下鉄「太秦天神川駅」徒歩約10分',
    worldHeritage: false,
    description: '推古天皇11年（603）秦河勝が聖徳太子から仏像を賜り建立した山城最古の寺院（真言宗系単立）。国宝彫刻第1号に指定された赤松材の「弥勒菩薩半跏思惟像（国宝）」や10月12日の牛祭で有名。',
    searchQuery: '広隆寺 京都市右京区太秦',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('広隆寺 京都市右京区太秦'),
    lat: 35.0152,
    lng: 135.7061,
  },
  {
    id: 'saihoji',
    name: '西芳寺（苔寺）',
    shortName: '西芳寺（苔寺）',
    aliases: ['西芳寺', '苔寺'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市西京区',
    address: '京都市西京区松尾神ケ谷町56',
    nearestAccess: '京都バス「苔寺・すず虫寺」徒歩約3分 / 阪急「松尾大社駅」徒歩約20分',
    worldHeritage: true,
    description: '行基創建と伝え、夢窓疎石が中興した臨済宗寺院。境内一面を約120種の青苔が覆うことから「苔寺」と通称される。上段の枯山水庭園と下段の黄金池を中心とする池泉回遊式庭園は特別名勝。事前参拝申込制。',
    searchQuery: '西芳寺 苔寺 京都市西京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('西芳寺 苔寺 京都市西京区'),
    lat: 34.9922,
    lng: 135.6844,
  },
  {
    id: 'matsunoo',
    name: '松尾大社',
    shortName: '松尾大社',
    aliases: ['松尾大社', '松尾社'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市西京区',
    address: '京都市西京区嵐山宮町3',
    nearestAccess: '阪急嵐山線「松尾大社駅」すぐ / 市バス「松尾大社前」',
    worldHeritage: false,
    description: '大宝元年（701）秦忌寸都理が勧請した山城国最古の神社の一つ。大山咋神・中津島姫命を祀り、古くから「日本第一醸造祖神（酒造りの神）」として篤く崇敬される。重森三玲最晩年の名作「松風苑三庭」も見所。',
    searchQuery: '松尾大社 京都市西京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('松尾大社 京都市西京区'),
    lat: 35.0004,
    lng: 135.6853,
  },
  {
    id: 'myoshinji',
    name: '妙心寺',
    shortName: '妙心寺',
    aliases: ['妙心寺', '退蔵院', '瓢鮎図'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区花園妙心寺町1',
    nearestAccess: 'JR山陰本線「花園駅」徒歩約5分 / 京福「妙心寺駅」徒歩約3分',
    worldHeritage: false,
    description: '花園法皇が離宮を禅寺に改め、関山慧玄（無相大師）を開山として創建した臨済宗妙心寺派大本山。全国臨済宗寺院の約半数を占める大宗派。法堂の「八方睨みの龍」や梵鐘（国宝・最古の紀年銘）、塔頭・退蔵院の国宝「瓢鮎図」が有名。',
    searchQuery: '妙心寺 京都市右京区花園',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('妙心寺 京都市右京区花園'),
    lat: 35.0232,
    lng: 135.7203,
  },
  {
    id: 'seiryoji',
    name: '清涼寺（嵯峨釈迦堂）',
    shortName: '清涼寺',
    aliases: ['清涼寺', '嵯峨釈迦堂', '三国伝来の釈迦像', 'お松明式'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区嵯峨釈迦堂藤ノ木町46',
    nearestAccess: '市バス「嵯峨釈迦堂前」すぐ / JR「嵯峨嵐山駅」徒歩約15分',
    worldHeritage: false,
    description: '浄土宗寺院。奝然上人が中国（宋）から持ち帰った「三国伝来の生身の釈迦如来立像（国宝・絹製五臓六腑が体内に納められている）」が本尊。毎年3月15日のお松明式や狂言で知られる。',
    searchQuery: '清涼寺 嵯峨釈迦堂 京都市右京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('清涼寺 嵯峨釈迦堂 京都市右京区'),
    lat: 35.0221,
    lng: 135.6756,
  },
  {
    id: 'adashino',
    name: '化野念仏寺',
    shortName: '化野念仏寺',
    aliases: ['化野念仏寺', '千灯供養', '無縁仏'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛西・嵯峨嵐山・太秦',
    ward: '京都市右京区',
    address: '京都市右京区嵯峨鳥居本化野町17',
    nearestAccess: '京都バス「鳥居本」徒歩約5分',
    worldHeritage: false,
    description: '空海が無縁仏を供養するため開創、後に法然が念仏道場とした浄土宗寺院。古来鳥辺野・蓮台野と並ぶ風葬の地。境内に並ぶ約8000体の石仏・石塔群と、8月下旬の「千灯供養」が有名。',
    searchQuery: '化野念仏寺 京都市右京区嵯峨',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('化野念仏寺 京都市右京区嵯峨'),
    lat: 35.0270,
    lng: 135.6669,
  },

  // ==========================================
  // 洛中・京都御所周辺エリア
  // ==========================================
  {
    id: 'nijojo',
    name: '二条城（元離宮二条城）',
    shortName: '二条城',
    aliases: ['二条城', '元離宮二条城', '二の丸御殿'],
    category: 'castle_palace',
    categoryLabel: '城郭・宮殿',
    area: '洛中・京都御所周辺',
    ward: '京都市中京区',
    address: '京都市中京区二条通堀川西入二条城町541',
    nearestAccess: '地下鉄東西線「二条城前駅」すぐ / 市バス「二条城前」',
    worldHeritage: true,
    description: '慶長8年（1603）徳川家康が上洛時の宿館として築城。慶応3年（1867）15代将軍・徳川慶喜が大広間で「大政奉還」を表明した歴史的舞台。狩野派障壁画が華麗な二の丸御殿（国宝）や唐門が見所。',
    searchQuery: '元離宮二条城 京都市中京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('元離宮二条城 京都市中京区'),
    lat: 35.0142,
    lng: 135.7482,
  },
  {
    id: 'kyotogosho',
    name: '京都御所（京都御苑）',
    shortName: '京都御所',
    aliases: ['京都御所', '京都御苑', '紫宸殿', '清涼殿', '宜陽殿'],
    category: 'castle_palace',
    categoryLabel: '城郭・宮殿',
    area: '洛中・京都御所周辺',
    ward: '京都市上京区',
    address: '京都市上京区京都御苑3',
    nearestAccess: '地下鉄烏丸線「今出川駅」または「丸太町駅」徒歩約5分',
    worldHeritage: false,
    description: '明治維新まで歴代天皇が起居し公務を執り行った皇居。現在の建物は安政2年（1855）に平安時代の内裏の姿を忠実に再現して再建された「安政再建」。即位の礼が行われた紫宸殿や清涼殿が壮麗。',
    searchQuery: '京都御所 京都市上京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('京都御所 京都市上京区'),
    lat: 35.0254,
    lng: 135.7621,
  },
  {
    id: 'kitanotenmangu',
    name: '北野天満宮（天神さん）',
    shortName: '北野天満宮',
    aliases: ['北野天満宮', '天神さん', '御土居'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛中・京都御所周辺',
    ward: '京都市上京区',
    address: '京都市上京区馬喰町',
    nearestAccess: '市バス「北野天満宮前」すぐ / 京福（嵐電）「北野白梅町駅」徒歩約5分',
    worldHeritage: false,
    description: '全国約1万2000社の天満宮・天神社の総本社。主祭神は菅原道真公（学問の神様）。豊臣秀吉が主催した「北野大茶湯」や史跡「御土居」で名高い。八棟造の本殿・拝殿は国宝。毎月25日は天神市で賑わう。',
    searchQuery: '北野天満宮 京都市上京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('北野天満宮 京都市上京区'),
    lat: 35.0315,
    lng: 135.7351,
  },
  {
    id: 'seimeijinja',
    name: '晴明神社',
    shortName: '晴明神社',
    aliases: ['晴明神社', '安倍晴明', '五芒星', '一条戻橋'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛中・京都御所周辺',
    ward: '京都市上京区',
    address: '京都市上京区晴明町806（堀川通一条上る）',
    nearestAccess: '市バス「一条戻橋・晴明神社前」すぐ / 地下鉄「今出川駅」徒歩約12分',
    worldHeritage: false,
    description: '平安時代の陰陽師・安倍晴明を祀る神社。寛弘4年（1007）一条天皇の命により晴明の屋敷跡に創建。魔除けの呪符「五芒星（晴明桔梗）」が社紋。境内に旧一条戻橋の親柱がある。',
    searchQuery: '晴明神社 京都市上京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('晴明神社 京都市上京区'),
    lat: 35.0270,
    lng: 135.7516,
  },
  {
    id: 'shokokuji',
    name: '相国寺（萬年山相国承天禅寺）',
    shortName: '相国寺',
    aliases: ['相国寺', '鳴き龍', '承天閣美術館'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛中・京都御所周辺',
    ward: '京都市上京区',
    address: '京都市上京区今出川通烏丸東入',
    nearestAccess: '地下鉄烏丸線「今出川駅」徒歩約5分 / 市バス「同志社前」',
    worldHeritage: false,
    description: '足利義満が春屋妙葩の提言を受け夢窓疎石を開山として創建した臨済宗相国寺派大本山（京都五山第2位）。金閣寺・銀閣寺の本山。法堂天井の狩野光信筆「鳴き龍（蟠龍図）」や伊藤若冲の名品を擁する承天閣美術館で有名。',
    searchQuery: '相国寺 京都市上京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('相国寺 京都市上京区'),
    lat: 35.0331,
    lng: 135.7618,
  },
  {
    id: 'rokkakudo',
    name: '頂法寺（六角堂）',
    shortName: '六角堂（頂法寺）',
    aliases: ['頂法寺', '六角堂'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛中・京都御所周辺',
    ward: '京都市中京区',
    address: '京都市中京区六角通東洞院西入堂之前町248',
    nearestAccess: '地下鉄「烏丸御池駅」徒歩約3分 / 阪急「烏丸駅」徒歩約5分',
    worldHeritage: false,
    description: '用明天皇2年（587）聖徳太子創建と伝える天台宗系単立寺院。本堂が六角形であることから「六角堂」と呼ばれる。京都の中心を示す「へそ石」や、代々住職を務めた池坊家による「華道・いけばな発祥の地」として有名。西国十八番。',
    searchQuery: '六角堂 頂法寺 京都市中京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('六角堂 頂法寺 京都市中京区'),
    lat: 35.0075,
    lng: 135.7607,
  },
  {
    id: 'honnoji',
    name: '本能寺',
    shortName: '本能寺',
    aliases: ['本能寺', '本能寺の変'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛中・京都御所周辺',
    ward: '京都市中京区',
    address: '京都市中京区寺町通御池下る下本能寺前町522',
    nearestAccess: '地下鉄東西線「京都市役所前駅」すぐ / 市バス「京都市役所前」',
    worldHeritage: false,
    description: '法華宗本門流大本山。天正10年（1582）明智光秀が織田信長を討った「本能寺の変」で有名。変当時は蛸薬師油小路にあり、豊臣秀吉の都市改造により現在地（寺町御池）へ移転された。織田信長公廟がある。',
    searchQuery: '本能寺 京都市中京区寺町御池',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('本能寺 京都市中京区寺町御池'),
    lat: 35.0116,
    lng: 135.7686,
  },
  {
    id: 'mibudera',
    name: '壬生寺',
    shortName: '壬生寺',
    aliases: ['壬生寺', '壬生狂言'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛中・京都御所周辺',
    ward: '京都市中京区',
    address: '京都市中京区壬生梛ノ宮町31',
    nearestAccess: '市バス「壬生寺道」徒歩約3分 / 阪急「大宮駅」徒歩約8分',
    worldHeritage: false,
    description: '律宗大本山。快賢僧都が創建。円覚上人が始めた重要無形民俗文化財「壬生狂言（無言劇）」で知られる。幕末には新選組の兵法訓練場となり、境内壬生塚に近藤勇の胸像や隊士の墓がある。',
    searchQuery: '壬生寺 京都市中京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('壬生寺 京都市中京区'),
    lat: 35.0016,
    lng: 135.7436,
  },

  // ==========================================
  // 洛南・東寺・伏見エリア
  // ==========================================
  {
    id: 'toji',
    name: '東寺（教王護国寺）',
    shortName: '東寺',
    aliases: ['東寺', '教王護国寺', '立体曼荼羅', '弘法市'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛南・伏見',
    ward: '京都市南区',
    address: '京都市南区九条町1',
    nearestAccess: '近鉄京都線「東寺駅」徒歩約10分 / JR「京都駅」八条口徒歩約15分',
    worldHeritage: true,
    description: '延暦15年（796）平安京鎮護の官寺として創建。弘仁14年（823）嵯峨天皇が弘法大師空海に下賜し、真言密教の根本道場となった。講堂の「立体曼荼羅（21体の仏像群・国宝多数）」や日本一の高さを誇る五重塔（国宝・約55m）が著名。毎月21日の「弘法市」で賑わう。',
    searchQuery: '東寺 教王護国寺 京都市南区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('東寺 教王護国寺 京都市南区'),
    lat: 34.9806,
    lng: 135.7478,
  },
  {
    id: 'saiji',
    name: '西寺跡（唐橋西寺公園）',
    shortName: '西寺跡',
    aliases: ['西寺', '西寺跡'],
    category: 'historic',
    categoryLabel: '史跡・名所',
    area: '洛南・伏見',
    ward: '京都市南区',
    address: '京都市南区唐橋西寺町（唐橋西寺公園内）',
    nearestAccess: '近鉄「東寺駅」徒歩約15分 / 市バス「西寺前」すぐ',
    worldHeritage: false,
    description: '平安京遷都時、羅城門を挟んで東寺とともに建立されたもう一つの国立官寺。空海と祈雨を競った守敏が賜ったが、正暦元年（990）に火災で焼失し鎌倉期以降に衰退・廃絶。国の史跡に指定されている。',
    searchQuery: '唐橋西寺公園 京都市南区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('唐橋西寺公園 京都市南区'),
    lat: 34.9800,
    lng: 135.7410,
  },
  {
    id: 'fushimiinari',
    name: '伏見稲荷大社',
    shortName: '伏見稲荷大社',
    aliases: ['伏見稲荷大社', '千本鳥居', 'お稲荷さん', '稲荷山'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛南・伏見',
    ward: '京都市伏見区',
    address: '京都市伏見区深草藪之内町68',
    nearestAccess: 'JR奈良線「稲荷駅」すぐ / 京阪「伏見稲荷駅」徒歩約5分',
    worldHeritage: false,
    description: '和銅4年（711）秦伊呂具が稲荷山三ヶ峰に神を祀ったのが始まり。全国約3万社の稲荷神社の総本社。商売繁昌・五穀豊穣の神。朱塗りの鳥居が連なる「千本鳥居」やお山巡りが世界的に人気。',
    searchQuery: '伏見稲荷大社 京都市伏見区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('伏見稲荷大社 京都市伏見区'),
    lat: 34.9671,
    lng: 135.7727,
  },
  {
    id: 'daigoji',
    name: '醍醐寺',
    shortName: '醍醐寺',
    aliases: ['醍醐寺', '醍醐の花見', '三宝院', '上醍醐', '下醍醐'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛南・伏見',
    ward: '京都市伏見区',
    address: '京都市伏見区醍醐東大路町22',
    nearestAccess: '地下鉄東西線「醍醐駅」徒歩約10分',
    worldHeritage: true,
    description: '貞観16年（874）理源大師聖宝が開山した真言宗醍醐派総本山。笠取山（上醍醐・下醍醐）一帯に広大な境内を有する。慶長3年（1598）豊臣秀吉が催した「醍醐の花見」と、秀吉自ら設計した三宝院庭園（特別史跡・特別名勝）や府内最古の五重塔（国宝・天暦5年建立）が有名。',
    searchQuery: '醍醐寺 京都市伏見区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('醍醐寺 京都市伏見区'),
    lat: 34.9511,
    lng: 135.8203,
  },
  {
    id: 'jonangu',
    name: '城南宮',
    shortName: '城南宮',
    aliases: ['城南宮', '方除けの大社', '曲水の宴', '鳥羽離宮', '鳥羽・伏見の戦い'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛南・伏見',
    ward: '京都市伏見区',
    address: '京都市伏見区中島鳥羽離宮町7',
    nearestAccess: '近鉄・地下鉄「竹田駅」徒歩約15分 / 市バス「城南宮東口」',
    worldHeritage: false,
    description: '平安遷都の際、都の南の守護として創建された「方除けの大社」。白河・鳥羽上皇の「鳥羽離宮」の鎮守社。慶応4年（1868）の「鳥羽・伏見の戦い」開戦の地でもある。中根金作作庭の楽水苑で行われる「曲水の宴」や枝垂れ梅で名高い。',
    searchQuery: '城南宮 京都市伏見区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('城南宮 京都市伏見区'),
    lat: 34.9529,
    lng: 135.7483,
  },
  {
    id: 'gokonomiya',
    name: '御香宮神社',
    shortName: '御香宮神社',
    aliases: ['御香宮神社', '御香水', '伏見の名水'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '洛南・伏見',
    ward: '京都市伏見区',
    address: '京都市伏見区御香宮門前町174',
    nearestAccess: '近鉄「桃山御陵前駅」すぐ / 京阪「伏見桃山駅」徒歩約4分',
    worldHeritage: false,
    description: '社殿から香りの良い清泉が湧き出し、清和天皇から「御香宮」の名を賜った名社。名水「御香水」は名水百選に選ばれ伏見の酒造りを育んだ。徳川頼宣寄進の極彩色の表門（伏見城大手門遺構・重文）が著名。',
    searchQuery: '御香宮神社 京都市伏見区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('御香宮神社 京都市伏見区'),
    lat: 34.9328,
    lng: 135.7672,
  },
  {
    id: 'nishihonganji',
    name: '西本願寺（龍谷山本願寺）',
    shortName: '西本願寺',
    aliases: ['西本願寺', '本願寺', 'お西さん', '飛雲閣', '唐門', '白書院'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛南・伏見',
    ward: '京都市下京区',
    address: '京都市下京区堀川通花屋町下る本願寺前町',
    nearestAccess: '市バス「西本願寺前」すぐ / JR「京都駅」烏丸口徒歩約15分',
    worldHeritage: true,
    description: '浄土真宗本願寺派本山。天正19年（1591）豊臣秀吉が寺地を寄進。阿弥陀堂・御影堂（ともに国宝）の巨大木造建築や、京都三名閣の一つ「飛雲閣（国宝）」、伏見城遺構と伝わる「唐門（日暮らし門・国宝）」が見事。',
    searchQuery: '西本願寺 京都市下京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('西本願寺 京都市下京区'),
    lat: 34.9914,
    lng: 135.7517,
  },
  {
    id: 'higashihonganji',
    name: '東本願寺（真宗本廟）',
    shortName: '東本願寺',
    aliases: ['東本願寺', 'お東さん', '真宗本廟', '御影堂門', '渉成園'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '洛南・伏見',
    ward: '京都市下京区',
    address: '京都市下京区烏丸通七条上る',
    nearestAccess: 'JR「京都駅」烏丸口徒歩約7分 / 地下鉄「五条駅」徒歩約5分',
    worldHeritage: false,
    description: '真宗大谷派本山。慶長7年（1602）徳川家康が教如上人に寺地を寄進して成立。世界最大級の木造建築である御影堂や御影堂門が威容を誇る。飛地境内の「渉成園（枳殻邸・国指定名勝）」も有名。',
    searchQuery: '東本願寺 京都市下京区',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('東本願寺 京都市下京区'),
    lat: 34.9902,
    lng: 135.7593,
  },

  // ==========================================
  // 宇治・山城・八幡エリア
  // ==========================================
  {
    id: 'byodoin',
    name: '平等院',
    shortName: '平等院',
    aliases: ['平等院', '鳳凰堂', '阿弥陀如来坐像', '定朝', '10円玉'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '宇治・山城・八幡',
    ward: '宇治市',
    address: '宇治市宇治蓮華116',
    nearestAccess: 'JR奈良線・京阪宇治線「宇治駅」徒歩約10分',
    worldHeritage: true,
    description: '永承7年（1052）関白・藤原頼通が父道長の別荘を寺院に改創。末法思想が流行する中、極楽浄土を現世に具現化した「鳳凰堂（阿弥陀堂・国宝）」は十円硬貨の意匠。仏師定朝作の本尊「阿弥陀如来坐像（国宝）」や雲中供養菩薩像が有名。',
    searchQuery: '平等院 宇治市',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('平等院 宇治市'),
    lat: 34.8893,
    lng: 135.8078,
  },
  {
    id: 'ujikamijinja',
    name: '宇治上神社',
    shortName: '宇治上神社',
    aliases: ['宇治上神社', '菟道稚郎子', '最古の神社建築'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '宇治・山城・八幡',
    ward: '宇治市',
    address: '宇治市宇治山田59',
    nearestAccess: '京阪宇治線「宇治駅」徒歩約10分 / JR奈良線「宇治駅」徒歩約20分',
    worldHeritage: true,
    description: '菟道稚郎子・応神天皇・仁徳天皇を祀る。康平3年（1060）頃の造営とされ、現存する日本最古の神社建築である本殿（国宝・覆屋内に三社）や寝殿造の拝殿（国宝）を有する。宇治七名水の一つ「桐原水」が境内に湧く。',
    searchQuery: '宇治上神社 宇治市',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('宇治上神社 宇治市'),
    lat: 34.8913,
    lng: 135.8110,
  },
  {
    id: 'manpukuji',
    name: '萬福寺（黄檗山萬福寺）',
    shortName: '萬福寺',
    aliases: ['萬福寺', '黄檗山萬福寺', '隠元隆琦', '普茶料理', '明朝様式'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '宇治・山城・八幡',
    ward: '宇治市',
    address: '宇治市五ケ庄三番割34',
    nearestAccess: 'JR奈良線・京阪宇治線「黄檗駅」徒歩約5分',
    worldHeritage: false,
    description: '寛文元年（1661）中国（明）の高僧・隠元隆琦が創建した日本黄檗宗大本山。伽藍配置や建築様式（チーク材、半偈門、勾欄など）が完全な明朝様式を保つ。インゲン豆や煎茶道、精進料理「普茶料理」を伝えたことでも名高い。',
    searchQuery: '萬福寺 宇治市黄檗',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('萬福寺 宇治市黄檗'),
    lat: 34.9142,
    lng: 135.8078,
  },
  {
    id: 'mimurotoji',
    name: '三室戸寺',
    shortName: '三室戸寺',
    aliases: ['三室戸寺', 'あじさい寺', '西国十番'],
    category: 'temple',
    categoryLabel: '寺院',
    area: '宇治・山城・八幡',
    ward: '宇治市',
    address: '宇治市莵道滋賀谷21',
    nearestAccess: '京阪宇治線「三室戸駅」徒歩約15分',
    worldHeritage: false,
    description: '光仁天皇の勅願により創建された本山修験宗寺院。西国三十三所観音霊場第10番札所。「あじさい寺」「花の寺」として名高く、初夏の約2万株の紫陽花や蓮の花で賑わう。',
    searchQuery: '三室戸寺 宇治市',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('三室戸寺 宇治市'),
    lat: 34.9010,
    lng: 135.8197,
  },
  {
    id: 'iwashimizu',
    name: '石清水八幡宮',
    shortName: '石清水八幡宮',
    aliases: ['石清水八幡宮', '男山八幡宮', '男山ケーブル', 'エジソン竹'],
    category: 'shrine',
    categoryLabel: '神社',
    area: '宇治・山城・八幡',
    ward: '八幡市',
    address: '八幡市八幡高坊30（男山山頂）',
    nearestAccess: '京阪「石清水八幡宮駅」より参道ケーブル「八幡宮山上駅」すぐ',
    worldHeritage: false,
    description: '貞観元年（859）行教が宇佐神宮より勧請。平安京の裏鬼門を守護する国家鎮護の社。宇佐・鶴岡と並ぶ日本三大八幡宮の一つ。徳川家光造営の本殿（国宝・八幡造の最高峰）や、エジソンが白熱電球のフィラメントに使用した「男山の真竹」で有名。',
    searchQuery: '石清水八幡宮 八幡市',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('石清水八幡宮 八幡市'),
    lat: 34.8797,
    lng: 135.7001,
  }
];

/**
 * 単一の文字列（選択肢や単語）から該当する京都の寺社・史跡スポットを特定する
 */
export function findSpotByNameOrAlias(text: string): KyotoSpot | null {
  if (!text) return null;
  const clean = text.trim();
  for (const spot of KYOTO_SPOTS) {
    for (const alias of spot.aliases) {
      if (clean.includes(alias)) {
        return spot;
      }
    }
  }
  return null;
}

export interface QuestionSpotsDetail {
  correctSpot: KyotoSpot | null;
  otherSpots: KyotoSpot[];
  allSpots: KyotoSpot[];
  fallbackSearchQuery: string;
  googleMapsSearchUrl: string;
}

/**
 * 問題および正解・解説の関連寺社・史跡ロケーション詳細を構造化して抽出
 */
export function detectQuestionSpotsDetail(question: Question): QuestionSpotsDetail {
  if (!question) {
    return {
      correctSpot: null,
      otherSpots: [],
      allSpots: [],
      fallbackSearchQuery: '京都 寺社 観光',
      googleMapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('京都 寺社 観光'),
    };
  }

  const allSpots = detectSpotsForQuestion(question);

  // 正解選択肢に対応する寺社を特定
  const correctAnswerText = question.options && question.answer !== undefined 
    ? question.options[question.answer] || ''
    : '';

  let correctSpot: KyotoSpot | null = null;
  if (correctAnswerText) {
    correctSpot = findSpotByNameOrAlias(correctAnswerText);
  }

  // もし正解選択肢から直に見つからなくても、全マッチから正解テキストに含まれるものを検索
  if (!correctSpot && allSpots.length > 0) {
    for (const spot of allSpots) {
      if (spot.aliases.some(a => correctAnswerText.includes(a))) {
        correctSpot = spot;
        break;
      }
    }
  }

  // それでも見つからない場合、もし全マッチが1件だけならそれを主スポットとする
  if (!correctSpot && allSpots.length === 1) {
    correctSpot = allSpots[0];
  }

  const otherSpots = allSpots.filter(s => !correctSpot || s.id !== correctSpot.id);

  // フォールバック用のGoogleマップ検索URL
  const querySubject = correctSpot 
    ? correctSpot.name 
    : (question.category ? `${question.category} 京都市` : '京都 史跡 寺社');
  
  const googleMapsSearchUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(querySubject);

  return {
    correctSpot,
    otherSpots,
    allSpots,
    fallbackSearchQuery: querySubject,
    googleMapsSearchUrl,
  };
}

/**
 * 地図検索用のヘルパー：問題または解説から神社・寺院・史跡を検出する
 */
export function detectSpotsForQuestion(question: Question): KyotoSpot[] {
  if (!question) return [];

  // 検索対象テキストを結合
  const texts: string[] = [
    question.question || '',
    ...(question.options || []),
  ];

  if (question.choiceExplanations) {
    question.choiceExplanations.forEach(c => {
      texts.push(c.option || '');
      texts.push(c.explanation || '');
    });
  }

  if (question.explanation) {
    texts.push(question.explanation.reason || '');
    texts.push(question.explanation.history || '');
    texts.push(question.explanation.trivia || '');
    texts.push(question.explanation.tip || '');
  }

  const combinedText = texts.join(' ');
  const matchedSpots: KyotoSpot[] = [];
  const addedIds = new Set<string>();

  // 1. マスターデータからマッチング
  for (const spot of KYOTO_SPOTS) {
    let match = false;
    for (const alias of spot.aliases) {
      if (combinedText.includes(alias)) {
        match = true;
        break;
      }
    }

    if (match && !addedIds.has(spot.id)) {
      matchedSpots.push(spot);
      addedIds.add(spot.id);
    }
  }

  // もしマスターにない京都の寺社が問題中に出てきた場合、動的に安全なSpotを自動生成
  // (例: 妙心寺退蔵院, 泉屋博古館, 車折神社, 平野神社, 勝林院 など)
  if (matchedSpots.length === 0 || matchedSpots.length < 3) {
    // 寺社・神宮・大社・離宮・城・院などの名詞を抽出
    const regex = /([一-龥]{2,6}(?:寺|院|神社|大社|神宮|天満宮|八幡宮|城|離宮|御所))/g;
    let match;
    const dynamicNames = new Set<string>();

    // 除外ワード（寺社名と誤認しやすい一般語）
    const ignoreList = [
      '平安京遷都時', '南都仏教', '国立寺院', '世界遺産寺院', '官寺', '私寺',
      '名刹寺院', '神社仏閣', '寺院建築', '門跡寺院', '大本山寺院', '寺社仏閣'
    ];

    while ((match = regex.exec(combinedText)) !== null) {
      const name = match[1];
      if (!ignoreList.includes(name) && !addedIds.has(name) && name.length >= 3) {
        // すでに登録済みスポットのエイリアスと重複していないか確認
        const isAlreadyCovered = matchedSpots.some(s => s.aliases.includes(name) || s.name.includes(name));
        if (!isAlreadyCovered && !dynamicNames.has(name)) {
          dynamicNames.add(name);
        }
      }
    }

    // 最大2件まで動的スポットを追加（画面を圧迫しないよう配慮）
    let dynamicCount = 0;
    for (const name of dynamicNames) {
      if (dynamicCount >= 2) break;
      const query = `${name} 京都市`;
      matchedSpots.push({
        id: `dyn_${name}`,
        name: name,
        shortName: name,
        aliases: [],
        category: name.includes('社') || name.includes('宮') ? 'shrine' : 'temple',
        categoryLabel: name.includes('社') || name.includes('宮') ? '神社' : '寺社・名所',
        area: '洛中・京都御所周辺',
        ward: '京都市',
        address: '京都市内',
        nearestAccess: '市バス・電車各線',
        worldHeritage: false,
        description: `京都検定で出題された寺社・史跡スポット「${name}」です。`,
        searchQuery: query,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        lat: 35.0116,
        lng: 135.7681,
      });
      dynamicCount++;
    }
  }

  return matchedSpots;
}

export interface SpotSpatialInfo {
  zone: '洛北' | '洛東' | '洛西' | '洛中' | '洛南' | '山城宇治' | '京都';
  direction: string;         // '南', '東', '西', '北', '中央', '北西', '北東', '南東', '南郊外'
  areaName: string;          // '洛南・九条', '洛東・東山', etc.
  compassLabel: string;      // '南（洛南エリア）'
  relationText: string;      // 周辺史跡との具体的な位置関係
}

/**
 * 主要56寺社・史跡の京都市内での方角・位置関係データベース（京都検定必須知識）
 */
export const SPOT_SPATIAL_DATA: Record<string, { zone: SpotSpatialInfo['zone']; direction: string; areaName: string; relation: string }> = {
  toji: {
    zone: '洛南',
    direction: '南',
    areaName: '洛南・九条',
    relation: '京都駅のすぐ南西約1km。東海道新幹線の車窓からも五重塔（国宝・日本一の木造塔54.8m）が見える。平安京の羅城門を挟んで西側にあった「西寺跡」と東西に対をなした唯一の平安遺構。東へ約2kmに東福寺・伏見稲荷大社。',
  },
  saiji: {
    zone: '洛南',
    direction: '南',
    areaName: '洛南・九条',
    relation: '京都駅の南西約1.5km（現在の西寺児童公園）。東寺と羅城門を挟んでシンメトリーに対をなしていた官寺跡。東寺が空海に託され栄えたのに対し、西寺は平安末期に焼失。',
  },
  fushimiinari: {
    zone: '洛南',
    direction: '南',
    areaName: '洛南・伏見',
    relation: '京都市南部の稲荷山山麓。京都駅からJR奈良線で2駅（南東約3km）。東福寺の南隣。全国の稲荷神社の総本社で千本鳥居が有名。',
  },
  tofukuji: {
    zone: '洛南',
    direction: '南',
    areaName: '洛南・東山南部',
    relation: '京都駅の南東約1.5km。伏見稲荷大社の北隣（JR奈良線で1駅）。三十三間堂の南約1km、泉涌寺の西隣。通天橋で名高い紅葉の名所。',
  },
  sennyuji: {
    zone: '洛南',
    direction: '南東',
    areaName: '洛南・東山南部',
    relation: '東福寺の北東、三十三間堂の南東約1km。月輪山の山麓に佇む皇室の菩提寺（御寺）。楊貴妃観音像で有名。',
  },
  daigoji: {
    zone: '洛南',
    direction: '南東',
    areaName: '伏見・山科南部',
    relation: '京都市街地から東山を越えた南東の山科盆地南部。小野の随心院・勧修寺の南側。笠取山（上醍醐）から下醍醐にかけて広大な境内。豊臣秀吉の「醍醐の花見」の地。',
  },
  jonangu: {
    zone: '洛南',
    direction: '南',
    areaName: '洛南・伏見',
    relation: '京都駅の真南約4km、名神高速京都南ICすぐ。平安京の裏鬼門（南）を守護。鳥羽離宮跡に隣接し、鳥羽・伏見の戦いの勃発地。方除け・しだれ梅で著名。',
  },
  gokonomiya: {
    zone: '洛南',
    direction: '南',
    areaName: '伏見桃山',
    relation: '伏見の中心街、近鉄桃山御陵前駅・京阪伏見桃山駅すぐ東。伏見城の大手門が移築された社。伏見酒蔵地帯の北東。御香水（名水百選）が湧く。',
  },
  kiyomizudera: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・東山',
    relation: '京都市の東側、東山連峰の音羽山中腹。八坂神社・高台寺の南（産寧坂・二年坂で直結）。三十三間堂の北東約1.5km。東山散策ルートの南の起点。清水の舞台で名高い。',
  },
  yasakajinja: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・祇園',
    relation: '四条通の東突き当たり（祇園の中心）。南に高台寺・清水寺、北に知恩院・円山公園が直結する東山観光の中核。西の松尾大社と対をなす。祇園祭の社。',
  },
  chionin: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・東山',
    relation: '八坂神社・円山公園の北隣、青蓮院門跡の南隣。平安神宮の南東。三門（国宝）が東山山麓にそびえる浄土宗総本山。法然上人入滅の地。',
  },
  nanzenji: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・岡崎東',
    relation: '平安神宮・岡崎公園の東側。永観堂の南隣。「哲学の道」の南の起点。山門（絶景かな）や琵琶湖疏水水路閣が著名。京都五山の別格。',
  },
  eikando: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・東山',
    relation: '南禅寺の北隣、「哲学の道」の南側起点。銀閣寺へ向かう散策路沿い。「みかえり阿弥陀」と「秋はもみじの永観堂」で名高い。',
  },
  ginkakuji: {
    zone: '洛東',
    direction: '北東',
    areaName: '洛東・東山北部',
    relation: '京都市の北東部、大文字山（如意ヶ嶽）山麓。「哲学の道」の北端。南禅寺・永観堂から北へ約2km歩いた終点。法然院の北。足利義政の東山山荘（東山文化の拠点）。',
  },
  heianjingu: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・岡崎',
    relation: '鴨川東岸・岡崎公園の中心。南に南禅寺・知恩院、西に鴨川を挟んで京都御所。明治28年、平安遷都1100年を記念して創建。時代祭の舞台。',
  },
  kodaiji: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・東山',
    relation: '八坂神社と清水寺のちょうど中間地点（ねねの道沿い）。豊臣秀吉の菩提を弔うため正室・ねね（北政所）が創建。高台寺蒔絵で著名。',
  },
  sanjusangendo: {
    zone: '洛東',
    direction: '東南',
    areaName: '洛東・七条',
    relation: '京都駅の東約1.5km（七条通沿い）。京都国立博物館の向かい、智積院・養源院の西隣。清水寺の南西約1.5km。後白河法皇が平清盛に建立させた1001躯の千手観音立像。',
  },
  kenninji: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・祇園',
    relation: '花見小路通の南突き当たり。八坂神社の南西約500m、鴨川の東約300m。栄西が開山した京都最古の禅寺。俵屋宗達の「風神雷神図屏風」所蔵。',
  },
  shorenin: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・粟田口',
    relation: '知恩院の北隣、平安神宮の南東。三条通沿い粟田口近く。青不動（国宝）で名高い天台宗五箇門跡の一つ。親鸞得度の寺。',
  },
  rokuharamitsuji: {
    zone: '洛東',
    direction: '東',
    areaName: '洛東・五条',
    relation: '鴨川（五条大橋）の東約500m。清水寺の西約1km、建仁寺の南約400m。空也上人が平安中期に創建。平家六波羅館の地。',
  },
  kinkakuji: {
    zone: '洛西',
    direction: '北西',
    areaName: '洛西・衣笠',
    relation: '京都市北西部の衣笠山麓。「きぬかけの路」の東端。西隣に龍安寺（徒歩約20分）、仁和寺へと連なる観光ルートの起点。南東に北野天満宮（約1.5km）。足利義満の北山殿。',
  },
  ryoanji: {
    zone: '洛西',
    direction: '北西',
    areaName: '洛西・衣笠',
    relation: '京都市北西部「きぬかけの路」の中間。東に金閣寺（約1.5km）、西に仁和寺（約1.2km）に挟まれた位置。細川勝元創建。15個の石が配置された枯山水石庭（虎の子渡しの庭）で世界的に有名。',
  },
  ninnaji: {
    zone: '洛西',
    direction: '北西',
    areaName: '洛西・御室',
    relation: '京都市北西部「きぬかけの路」の西端。西約300mに御室総鎮守の福王子神社、東に龍安寺（徒歩約15分）、南東に妙心寺。嵐電御室仁和寺駅の正面。宇多天皇が開山した皇室ゆかりの御室御所門跡。御室桜で名高い。',
  },
  fukuojijinja: {
    zone: '洛西',
    direction: '北西',
    areaName: '洛西・宇多野',
    relation: '仁和寺の西約300m。周山街道（国道162号）と一条通が交わる福王子交差点の角。仁和寺の御室総鎮守社。宇多天皇の母・班子女王を祀る。',
  },
  myoshinji: {
    zone: '洛西',
    direction: '北西',
    areaName: '洛西・花園',
    relation: '仁和寺の南東約1km、北野天満宮の西南西約1.5km。JR花園駅すぐ。広大な敷地に46の塔頭が建ち並ぶ臨済宗妙心寺派の大本山。',
  },
  tenryuji: {
    zone: '洛西',
    direction: '西',
    areaName: '洛西・嵯峨嵐山',
    relation: '嵐山・嵯峨野観光の中心。渡月橋の北詰すぐ。大覚寺の南西約1.5km。竹林の小径の起点。足利尊氏が後醍醐天皇の冥福を祈るため夢窓疎石を開山に創建。曹源池庭園（特別名勝）。',
  },
  daikakuji: {
    zone: '洛西',
    direction: '西',
    areaName: '洛西・嵯峨野',
    relation: '嵐山・天龍寺から北へ約1.5km、大沢池の北西岸。清涼寺（嵯峨釈迦堂）の北東約800m。嵯峨天皇の離宮嵯峨院が寺院化。いけばな嵯峨御流の総司所。',
  },
  seiryoji: {
    zone: '洛西',
    direction: '西',
    areaName: '洛西・嵯峨野',
    relation: '天龍寺の北約800m、大覚寺の南西約800m。嵯峨野散策の結節点。源融の山荘・栖霞観跡。奝然が宋から持ち帰った三国伝来の生身釈迦如来像（国宝）を祀る。',
  },
  adashino: {
    zone: '洛西',
    direction: '西',
    areaName: '洛西・奥嵯峨',
    relation: '嵯峨野の最奥部・愛宕山山麓。大覚寺の西約1.5km、清涼寺の北西約1.2km。弘法大師空海が開基。千灯供養で名高い無縁仏の石仏・石塔が群をなす。',
  },
  koryuji: {
    zone: '洛西',
    direction: '西',
    areaName: '洛西・太秦',
    relation: '京都市西部・太秦映画村の南側。嵐電太秦広隆寺駅すぐ。妙心寺の西南西約1.5km。秦河勝が聖徳太子から仏像を賜り創建した山城最古の寺院。国宝第1号・弥勒菩薩半跏思惟像。',
  },
  matsunoo: {
    zone: '洛西',
    direction: '西',
    areaName: '洛西・松尾',
    relation: '渡月橋（嵐山）の南約1.5km、桂川西岸。四条通の西の起点（東の起点である八坂神社と対をなす）。秦氏の氏神でお酒の神様として篤い信仰。',
  },
  saihoji: {
    zone: '洛西',
    direction: '西',
    areaName: '洛西・松尾南',
    relation: '桂川の西側、西山山麓。松尾大社の南西約1.5km、鈴虫寺（華厳寺）のすぐ南。夢窓疎石が中興した枯山水と池泉回遊式庭園。境内一面を120種の苔が覆う「苔寺」。',
  },
  kamigamo: {
    zone: '洛北',
    direction: '北端',
    areaName: '洛北・上賀茂',
    relation: '京都市街の最北端、賀茂川上流の北岸。下鴨神社より賀茂川沿いに北へ約4km。大徳寺の北東約2.5km。山城国一宮・賀茂別雷大神を祀る。葵祭の終着地。細殿の立砂。',
  },
  shimogamo: {
    zone: '洛北',
    direction: '北',
    areaName: '洛北・出町柳',
    relation: '鴨川と高野川の合流点（出町柳）の北側。原生林「糺の森」に鎮座。京都御所の北東約1.5km、上賀茂神社の南約4km。みたらし祭発祥の社。',
  },
  daitokuji: {
    zone: '洛北',
    direction: '北',
    areaName: '洛北・紫野',
    relation: '京都市北部、船岡山（平安京の玄武）の北側。金閣寺の東約2km、北野天満宮の北東約2km。今宮神社の南東に隣接。千利休ゆかりの茶道文化・枯山水庭園の宝庫。',
  },
  sanzenin: {
    zone: '洛北',
    direction: '北東山間',
    areaName: '洛北・大原',
    relation: '市街地（出町柳）から高野川上流へ北東にバスで約40分の山里。寂光院とは大原の里の谷を挟んで東と西に対峙する。往生極楽院阿弥陀三尊像（国宝）と苔庭。',
  },
  jakkoin: {
    zone: '洛北',
    direction: '北東山間',
    areaName: '洛北・大原',
    relation: '大原の里の西山麓。三千院の西約2km（徒歩約25分）。聖徳太子創建。平家滅亡後に建礼門院（平徳子）が隠棲し平家一門を弔った平家物語大原御幸の寺。',
  },
  kifune: {
    zone: '洛北',
    direction: '北部山間',
    areaName: '洛北・貴船',
    relation: '出町柳から叡電で北へ約30分、貴船川上流。鞍馬寺の西隣（鞍馬山を越える木の根道の山道で結ばれる）。全国の貴船神社の総本社。絵馬発祥の社、水の神。',
  },
  kurama: {
    zone: '洛北',
    direction: '北部山間',
    areaName: '洛北・鞍馬',
    relation: '鞍馬川上流・鞍馬山南麓。貴船神社の東隣（山を挟んで隣接）。源義経（牛若丸）が鞍馬天狗から兵法を学んだ地。10月22日の鞍馬の火祭（由岐神社）。',
  },
  shisendo: {
    zone: '洛北',
    direction: '北東',
    areaName: '洛北・一乗寺',
    relation: '京都市北東部の一乗寺山麓。曼殊院の南約1km、銀閣寺の北約2.5km。徳川家康の元家臣・石川丈山が隠棲した山荘。三十六詩仙の肖像を掲げた詩仙の間と庭園。',
  },
  manshuin: {
    zone: '洛北',
    direction: '北東',
    areaName: '洛北・一乗寺',
    relation: '比叡山山麓、詩仙堂の北約1km、修学院離宮の南約1km。良尚法親王が現在地に整備した天台宗五箇門跡の一つ。数寄屋風書院造と名園。',
  },
  enryakuji: {
    zone: '洛北',
    direction: '北東山頂',
    areaName: '比叡山山頂',
    relation: '京都と滋賀の境【比叡山全域（山頂）】。平安京の鬼門（北東）を守護する天台宗総本山。伝教大師最澄が開山。「不滅の法灯」が灯る根本中堂（国宝）。',
  },
  nijojo: {
    zone: '洛中',
    direction: '中央',
    areaName: '洛中・二条堀川',
    relation: '京都市の中心部、堀川通沿い。京都御所の南西約1.5km、京都駅の北約3km、東西本願寺の北約2km。徳川家康が上洛時の宿館として築城。二の丸御殿（国宝）と大政奉還の舞台。',
  },
  kyotogosho: {
    zone: '洛中',
    direction: '中央',
    areaName: '洛中・京都御苑',
    relation: '京都市の中心部（上京区）。広大な国民公園「京都御苑」内。南に二条城（南西約1.5km）、北に相国寺、東に鴨川、西に堀川。明治維新まで歴代天皇が起居した皇居。',
  },
  kitanotenmangu: {
    zone: '洛中',
    direction: '北西',
    areaName: '洛中北西・北野',
    relation: '西陣の西端、今出川通沿い。最古の花街・上七軒に隣接。金閣寺の南東約1.5km、二条城の北北西約2km。菅原道真を祀る全国天満宮の総本社。八棟造の本殿（国宝）。',
  },
  shokokuji: {
    zone: '洛中',
    direction: '中央',
    areaName: '洛中・烏丸今出川',
    relation: '京都御所の北隣、同志社大学今出川校地の東。足利義満が創建した京都五山第二位。金閣寺・銀閣寺の本山。法堂天井の「鳴き龍」（狩野光信筆）。',
  },
  seimeijinja: {
    zone: '洛中',
    direction: '中央',
    areaName: '洛中・堀川今出川',
    relation: '堀川今出川の南側、堀川通沿い。京都御所の西約800m、二条城の北約1.5km。平安中期の陰陽師・安倍晴明の屋敷跡に一条天皇の命で創建。',
  },
  rokkakudo: {
    zone: '洛中',
    direction: '中央',
    areaName: '洛中・烏丸六角',
    relation: '烏丸六角東入る。京都の中心地。錦市場の北約200m、京都御所の南約1.5km。聖徳太子創建と伝える頂法寺本堂。境内の「へそ石」は京都の中心。華道池坊発祥の地。',
  },
  honnoji: {
    zone: '洛中',
    direction: '中央',
    areaName: '洛中・寺町御池',
    relation: '京都市役所の南向かい、寺町通御池下ル。織田信長が明智光秀に討たれた「本能寺の変」の旧地（四条西洞院）から、豊臣秀吉の都市改造により現在地へ移転。',
  },
  mibudera: {
    zone: '洛中',
    direction: '中西',
    areaName: '洛中・壬生',
    relation: '四条大宮の南西約600m、二条城の南西約1.2km。律宗大本山。新選組の兵法訓練場となり、境内には近藤勇像や隊士の墓所（壬生塚）がある。壬生狂言で有名。',
  },
  nishihonganji: {
    zone: '洛中',
    direction: '中南',
    areaName: '洛中南部・堀川七条',
    relation: '京都駅の北西約1km、堀川通七条上ル。東本願寺（烏丸七条）と堀川通・烏丸通を挟んで東西に並び立つ。二条城の南約2km。浄土真宗本願寺派本山。唐門・飛雲閣（国宝）。',
  },
  higashihonganji: {
    zone: '洛中',
    direction: '中南',
    areaName: '洛中南部・烏丸七条',
    relation: '京都駅の北約500m、烏丸通沿い。京都タワーのすぐ北。西本願寺の東隣。徳川家康から寺地を寄進され成立した真宗大谷派本山。世界最大級の木造建築・御影堂。',
  },
  byodoin: {
    zone: '山城宇治',
    direction: '南郊外',
    areaName: '宇治市',
    relation: '京都盆地の南郊外【宇治市】京都市街から南へ約15km、宇治川西岸。宇治上神社の対岸（宇治橋を渡る）。京都駅からJR奈良線快速で約17分。藤原頼通が極楽浄土を模した鳳凰堂（国宝・10円玉）。',
  },
  ujikamijinja: {
    zone: '山城宇治',
    direction: '南郊外',
    areaName: '宇治市',
    relation: '宇治川東岸の朝日山山麓。平等院の対岸。菟道稚郎子・応神天皇・仁徳天皇を祀る。日本最古の現存神社建築である本殿（国宝・平安時代後期）。',
  },
  manpukuji: {
    zone: '山城宇治',
    direction: '南郊外',
    areaName: '宇治・黄檗',
    relation: '京都盆地の南郊外、JR・京阪黄檗駅すぐ。平等院の北約3km。明の僧・隠元隆琦が江戸初期に開いた日本黄檗宗大本山。明朝様式の伽藍配置と普茶料理（精進料理）。',
  },
  mimurotoji: {
    zone: '山城宇治',
    direction: '南郊外',
    areaName: '宇治・三室戸',
    relation: '宇治川東岸、京阪三室戸駅徒歩約15分。宇治上神社の北東約1.5km。西国三十三所観音霊場第10番札所。初夏には約2万株の紫陽花が咲き乱れる「あじさい寺」。',
  },
  iwashimizu: {
    zone: '山城宇治',
    direction: '南西郊外',
    areaName: '八幡市',
    relation: '京都盆地の南西端【八幡市】京都市街から南西へ約15km、木津川・宇治川・桂川が合流する男山山頂。平安京の裏鬼門（南西）を守護する日本三大八幡宮。本殿（国宝・八幡造）。',
  },
};

/**
 * 任意の寺社スポットから京都市内での方角・ゾーン・周辺史跡との位置関係を取得
 */
export function getSpotSpatialInfo(spot: KyotoSpot): SpotSpatialInfo {
  if (!spot) {
    return {
      zone: '京都',
      direction: '中央',
      areaName: '京都市内',
      compassLabel: '京都市内',
      relationText: '京都市内の名所・史跡スポットです。',
    };
  }

  // 1. マスター定義を検索
  const spatialEntry = SPOT_SPATIAL_DATA[spot.id];
  if (spatialEntry) {
    return {
      zone: spatialEntry.zone,
      direction: spatialEntry.direction,
      areaName: spatialEntry.areaName,
      compassLabel: `${spatialEntry.direction}（${spatialEntry.zone}エリア）`,
      relationText: spatialEntry.relation,
    };
  }

  // 2. エリア文字列から自動推定
  const area = spot.area || '';
  if (area.includes('洛南') || area.includes('伏見')) {
    return {
      zone: '洛南',
      direction: '南',
      areaName: '洛南・伏見',
      compassLabel: '南（洛南・伏見エリア）',
      relationText: `京都市の南部（京都駅より南側）に位置する寺社・史跡です。周辺には東寺、東福寺、伏見稲荷大社などの名刹があります。`,
    };
  }
  if (area.includes('洛東') || area.includes('東山')) {
    return {
      zone: '洛東',
      direction: '東',
      areaName: '洛東・東山',
      compassLabel: '東（洛東・東山エリア）',
      relationText: `京都市の東側（鴨川東岸・東山山麓）に位置する寺社・史跡です。清水寺から祇園、南禅寺、銀閣寺へと連なる東山散策エリアです。`,
    };
  }
  if (area.includes('洛西') || area.includes('嵐山')) {
    return {
      zone: '洛西',
      direction: '西',
      areaName: '洛西・嵐山',
      compassLabel: '西〜北西（洛西・嵐山・衣笠エリア）',
      relationText: `京都市の西部〜北西部に位置する寺社・史跡です。嵐山・嵯峨野観光の中心地、または北西の「きぬかけの路（金閣・龍安・仁和寺）」周辺です。`,
    };
  }
  if (area.includes('洛北') || area.includes('大原') || area.includes('鞍馬')) {
    return {
      zone: '洛北',
      direction: '北',
      areaName: '洛北',
      compassLabel: '北（洛北エリア）',
      relationText: `京都市の北部（北山・賀茂川上流・大原・鞍馬）に位置する寺社・史跡です。豊かな自然と歴史ある山寺が点在します。`,
    };
  }
  if (area.includes('宇治') || area.includes('八幡') || area.includes('山城')) {
    return {
      zone: '山城宇治',
      direction: '南郊外',
      areaName: '宇治・山城',
      compassLabel: '南郊外（宇治・山城・八幡エリア）',
      relationText: `京都盆地の南郊外に位置する寺社・史跡です。宇治川沿いの平等院や、男山山頂の石清水八幡宮などが位置します。`,
    };
  }

  return {
    zone: '洛中',
    direction: '中央',
    areaName: '洛中・中心部',
    compassLabel: '中心部（洛中エリア）',
    relationText: `京都市の中心部（碁盤の目市街地・京都御所・二条城周辺）に位置する寺社・史跡です。`,
  };
}
