import { Question } from '../types';

/**
 * 全問題データから指定問数を重複なくランダムに抽出する関数（Fisher-Yatesシャッフル）
 * @param allQuestions 全問題データの配列
 * @param count 抽出する問題数（ミニテスト: 10, 模試: 100）
 * @returns 重複のないランダムな問題配列
 */
export function getRandomQuestions(allQuestions: Question[], count: number): Question[] {
  if (!allQuestions || allQuestions.length === 0) {
    return [];
  }

  // 元の配列を変更しないようコピー
  const pool = [...allQuestions];
  const n = pool.length;

  // Fisher-Yates シャッフル
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 指定問題数を切り出して返却
  return pool.slice(0, Math.min(count, n));
}
