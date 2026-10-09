/**
 * 間違えた問題のLocalStorage管理ユーティリティ
 * キー名: 'wrong_question_ids'
 * アプリ軽量化のため、問題の全文ではなく数値IDの配列のみを保存します。
 */

export const WRONG_QUESTIONS_STORAGE_KEY = 'wrong_question_ids';
const EVENT_NAME = 'kyoto_exam_wrong_questions_updated';

/**
 * LocalStorageから間違えた問題のID配列を取得します
 */
export function getWrongQuestionIds(): number[] {
  try {
    const raw = localStorage.getItem(WRONG_QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((id) => (typeof id === 'number' ? id : parseInt(String(id), 10)))
          .filter((id) => !isNaN(id));
      }
    }

    // 後方互換性：旧統計データ（kyoto_exam_user_stats_v2）にwrongIdsがあれば初回引き継ぎ
    const legacyStats = localStorage.getItem('kyoto_exam_user_stats_v2');
    if (legacyStats) {
      try {
        const parsedLegacy = JSON.parse(legacyStats);
        if (Array.isArray(parsedLegacy?.wrongIds) && parsedLegacy.wrongIds.length > 0) {
          const ids = parsedLegacy.wrongIds
            .map((id: unknown) => (typeof id === 'number' ? id : parseInt(String(id), 10)))
            .filter((id: number) => !isNaN(id));
          if (ids.length > 0) {
            saveWrongQuestionIds(ids);
            return ids;
          }
        }
      } catch {
        // ignore
      }
    }
  } catch (e) {
    console.warn('Failed to read wrong_question_ids from localStorage', e);
  }
  return [];
}

/**
 * LocalStorageに間違えた問題のID配列を保存します（重複排除）
 */
export function saveWrongQuestionIds(ids: number[]): void {
  try {
    const uniqueIds = Array.from(new Set(ids));
    localStorage.setItem(WRONG_QUESTIONS_STORAGE_KEY, JSON.stringify(uniqueIds));
    // 他のコンポーネントに変更を通知
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: uniqueIds }));
  } catch (e) {
    console.warn('Failed to save wrong_question_ids to localStorage', e);
  }
}

/**
 * 新しく間違えた問題のID群を追加します
 */
export function addWrongQuestionIds(newIds: number[]): number[] {
  const current = getWrongQuestionIds();
  const merged = Array.from(new Set([...current, ...newIds]));
  saveWrongQuestionIds(merged);
  return merged;
}

/**
 * 「覚えた」ボタンなどで特定の問題IDを削除します
 */
export function removeWrongQuestionId(idToRemove: number): number[] {
  const current = getWrongQuestionIds();
  const updated = current.filter((id) => id !== idToRemove);
  saveWrongQuestionIds(updated);
  return updated;
}

/**
 * 間違えた問題リストをすべてクリアします
 */
export function clearWrongQuestionIds(): void {
  saveWrongQuestionIds([]);
}

/**
 * 変更イベントを監視するReact hookやリスナー用
 */
export function subscribeWrongQuestionIds(callback: (ids: number[]) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<number[]>;
    callback(customEvent.detail || getWrongQuestionIds());
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
