import { Question, TestRecord } from '../types';

/**
 * テスト結果・解答解説をCSVファイルとしてダウンロードするユーティリティ
 */
export function downloadTestResultCSV(
  record: {
    title: string;
    date: string;
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    rank?: string;
  },
  questions: Question[],
  userAnswers: { [questionId: number]: number }
) {
  const sanitize = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;

  const rows: string[] = [];

  // ヘッダー情報（サマリー）
  rows.push('\uFEFF'); // UTF-8 BOM（Excelでの文字化け防止）
  rows.push(`テスト名称,${sanitize(record.title)}`);
  rows.push(`実施日時,${sanitize(record.date)}`);
  rows.push(`得点,${record.score} / ${record.total} 問正解`);
  rows.push(`正解率,${record.percentage}%`);
  rows.push(`判定,${record.rank ? record.rank + '判定・' : ''}${record.passed ? '合格' : '不合格'}`);
  rows.push(''); // 空行

  // 明細テーブルのヘッダー
  rows.push([
    '問題番号',
    '分野',
    '難易度',
    '出題問題文',
    'あなたの回答',
    '正解',
    '正誤',
    '正解選択肢',
    '選択肢1',
    '選択肢1解説',
    '選択肢2',
    '選択肢2解説',
    '選択肢3',
    '選択肢3解説',
    '選択肢4',
    '選択肢4解説',
    '試験対策ポイント',
    '歴史的背景'
  ].join(','));

  // 明細データ
  questions.forEach((q, idx) => {
    const selectedIdx = userAnswers[q.id];
    const isCorrect = selectedIdx === q.answer;
    const userSelectedText = selectedIdx !== undefined && q.options[selectedIdx] ? q.options[selectedIdx] : '未回答';
    const correctAnswerText = q.options[q.answer] || '';

    const row = [
      idx + 1,
      sanitize(q.category),
      sanitize(q.difficulty || '普通'),
      sanitize(q.question),
      sanitize(userSelectedText),
      sanitize(correctAnswerText),
      isCorrect ? '正解' : '不正解',
      q.answer + 1,
      sanitize(q.options[0] || ''),
      sanitize(q.choiceExplanations?.[0]?.explanation || ''),
      sanitize(q.options[1] || ''),
      sanitize(q.choiceExplanations?.[1]?.explanation || ''),
      sanitize(q.options[2] || ''),
      sanitize(q.choiceExplanations?.[2]?.explanation || ''),
      sanitize(q.options[3] || ''),
      sanitize(q.choiceExplanations?.[3]?.explanation || ''),
      sanitize(q.explanation?.tip || ''),
      sanitize(q.explanation?.history || '')
    ];

    rows.push(row.join(','));
  });

  const csvContent = rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = record.title.replace(/[\s/\\:]/g, '_');
  const safeDate = record.date.replace(/[\s/\\:]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `京都検定3級_${safeTitle}_${safeDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * テスト結果・解答解説を整形テキスト（TXT）としてダウンロードするユーティリティ
 */
export function downloadTestResultText(
  record: {
    title: string;
    date: string;
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    rank?: string;
  },
  questions: Question[],
  userAnswers: { [questionId: number]: number }
) {
  const lines: string[] = [];

  lines.push('================================================================');
  lines.push(`【京都検定3級 合格対策アプリ】${record.title} 解答・解説シート`);
  lines.push('================================================================');
  lines.push(`実施日時: ${record.date}`);
  lines.push(`成績結果: ${record.score} / ${record.total} 問正解 (正解率 ${record.percentage}%)`);
  lines.push(`合否判定: ${record.rank ? `[${record.rank}判定] ` : ''}${record.passed ? '🌸 合格ラインクリア' : '🌿 要復習'}`);
  lines.push('----------------------------------------------------------------\n');

  questions.forEach((q, idx) => {
    const selectedIdx = userAnswers[q.id];
    const isCorrect = selectedIdx === q.answer;
    const userSelectedText = selectedIdx !== undefined && q.options[selectedIdx] ? q.options[selectedIdx] : '未回答';
    const correctAnswerText = q.options[q.answer] || '';

    lines.push(`第${idx + 1}問 【${q.category}】 [${isCorrect ? '正解 ⭕' : '不正解 ❌'}]`);
    lines.push(`問題: ${q.question}`);
    lines.push(`あなたの回答: ${userSelectedText}`);
    lines.push(`正しい正解　: ${correctAnswerText} (選択肢 ${q.answer + 1})`);
    lines.push('');
    lines.push('＜選択肢解説＞');
    q.choiceExplanations?.forEach((c, cIdx) => {
      lines.push(`  ${cIdx + 1}. ${c.option} [${c.isCorrect ? '正解' : '誤り'}]: ${c.explanation}`);
    });

    if (q.explanation?.tip) {
      lines.push('');
      lines.push(`💡 合格対策ポイント: ${q.explanation.tip}`);
    }
    if (q.explanation?.history) {
      lines.push(`📜 歴史的背景: ${q.explanation.history}`);
    }
    lines.push('\n----------------------------------------------------------------\n');
  });

  const textContent = lines.join('\n');
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = record.title.replace(/[\s/\\:]/g, '_');
  const safeDate = record.date.replace(/[\s/\\:]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `京都検定3級_${safeTitle}_${safeDate}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
