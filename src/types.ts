export const OFFICIAL_CATEGORIES = [
  '歴史・史跡',
  '神社・寺院',
  '建築・庭園・美術',
  '芸術・文化',
  '生活・行事',
  '公園・文化施設',
] as const;

export type OfficialCategory = typeof OFFICIAL_CATEGORIES[number];

export interface ChoiceExplanation {
  option: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizExplanation {
  reason: string;
  history: string;
  trivia: string;
  tip: string;
}

export interface Question {
  id: number;
  category: string;
  difficulty?: string;
  question: string;
  options: string[];
  answer: number; // 0-indexed (0, 1, 2, 3)
  choiceExplanations: ChoiceExplanation[];
  explanation: QuizExplanation;
}

export type QuizMode = 
  | 'home'
  | 'mini-test' 
  | 'mock-exam' 
  | 'result'
  | 'review'
  | 'spots-map'
  | 'all-practice' 
  | 'category' 
  | 'weak' 
  | 'bookmark' 
  | 'mypage';

export interface TestResult {
  mode: 'mini-test' | 'mock-exam';
  questions: Question[];
  userAnswers: { [questionId: number]: number };
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  rank: 'S' | 'A' | 'B' | 'C';
  timeSpentSeconds: number;
  date: string;
  wrongIds: number[];
}

export interface TestRecord {
  id: string;
  testType?: 'mini' | 'mock'; // 'mini': ランダム5問ミニテスト, 'mock': 本番模試ランダム100問90分
  date: string;       // 例: "2026/09/17 14:30"
  timestamp: number;
  score: number;      // 正解数
  total: number;      // 出題数 (5 または 100)
  percentage: number; // 70 etc.
  passed: boolean;    // >= 70%
  timeSpentSeconds?: number;
  questionIds?: number[];
  wrongQuestionIds?: number[];
  userAnswers?: { [questionId: number]: number };
}

export interface UserStats {
  totalAnswered: number;
  correctCount: number;
  bookmarkedIds: number[];
  wrongIds: number[];
  testHistory: TestRecord[];
  lastTestScore: {
    score: number;
    total: number;
    date: string;
    passed: boolean;
  } | null;
}

// ==========================================
// 公式note・上位版Webアプリ リンク定数
// ==========================================

// 【京都検定3級】厳選50問＋10問ミニテスト機能付き Webアプリ
export const APP_50_3KYU_URL = 'https://note.com/fair_tiger775/n/nb3e6744564a4';

// 【京都検定3級】完全攻略700問＋本番100問模試・ミニテスト・復習・地図機能付きWebアプリ
export const NOTE_700_3KYU_URL = 'https://note.com/fair_tiger775/n/n56b6fff32e8e';

// 【京都検定2級】厳選50問＋ミニテスト機能付き Webアプリ
export const APP_50_2KYU_URL = 'https://note.com/fair_tiger775/n/n3d97822700fa';

// 【京都検定2級】完全対策700問＋本番模試100問 公式note
export const NOTE_700_2KYU_URL = 'https://note.com/fair_tiger775/n/n44cbcb632728';

// 京都検定 公式コミュニティ＆メンバーシップ（仲間とクイズ出題・最難関1級論述添削）
export const COMMUNITY_NOTE_URL = 'https://note.com/fair_tiger775/n/ne4d353c19e4e?app_launch=false';

// 互換用デフォルトエイリアス（当アプリは3級のためデフォルトは3級）
export const NOTE_700_URL = NOTE_700_3KYU_URL;
export const APP_50_URL = APP_50_3KYU_URL;

