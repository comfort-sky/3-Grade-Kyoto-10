import React, { useState } from 'react';
import { Lock, User, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

// 全角英数を半角に変換し、前後の空白を除去するユーティリティ
const normalizeInput = (str: string) => {
  return str
    .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ')
    .trim();
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('kyotomaster');
  const [password, setPassword] = useState('otameshi');
  const [rememberMe, setRememberMe] = useState(true); // 次回からログインを省略（自動ログイン）
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const cleanId = normalizeInput(userId);
    const cleanPw = normalizeInput(password);

    // 規定の認証情報: ID "kyotomaster" (大文字小文字不問), パスワード "otameshi" (または従来の "50kyoto2026pass")
    setTimeout(() => {
      const isIdValid = cleanId.toLowerCase() === 'kyotomaster';
      const isPwValid = cleanPw === 'otameshi' || cleanPw === '50kyoto2026pass';

      if (isIdValid && isPwValid) {
        if (rememberMe) {
          localStorage.setItem('kyoto_exam_auth', 'authenticated_v2');
          localStorage.setItem('kyoto_exam_remember', 'true');
        } else {
          sessionStorage.setItem('kyoto_exam_auth', 'authenticated_v2');
          localStorage.removeItem('kyoto_exam_auth');
        }
        onLoginSuccess();
      } else {
        setError('ユーザーIDまたはパスワードが正しくありません。半角英数（前後の不要な空白なし）でご入力ください。');
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* 背景装飾（京都の伝統色と格子の落ち着いた雰囲気） */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,83,9,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* タイトルヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-600/40 text-amber-400 mb-4 shadow-lg shadow-amber-950/40">
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400/90 font-medium mb-1">
            Kyoto Examination Level 3 Free Trial
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-100 font-serif">
            京都検定3級 対策クイズ
          </h1>
          <p className="text-sm text-stone-300 font-medium mt-2">
            重要ポイントマスター【10問 無料お試し版】（ミニテスト5問付）
          </p>
          <p className="text-xs text-stone-400 mt-1">
            全6分野対応・5問ミニテスト＆学習カルテ機能付き
          </p>
        </div>

        {/* ログインフォームカード */}
        <div className="bg-stone-850/90 border border-stone-700/70 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-stone-300">受講生・お試し認証</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              無料お試し版
            </span>
          </div>

          {/* 自動入力案内バナー */}
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <div className="font-bold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ID・パスワード自動入力済み
              </span>
              <span className="text-[10px] text-stone-400 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-750">
                すぐログイン可
              </span>
            </div>
            <div className="text-[11px] text-stone-300 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>ID: <code className="font-mono text-amber-300 font-bold bg-stone-900/80 px-1.5 py-0.5 rounded border border-stone-750">kyotomaster</code></span>
              <span>PW: <code className="font-mono text-amber-300 font-bold bg-stone-900/80 px-1.5 py-0.5 rounded border border-stone-750">otameshi</code></span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-950/70 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div>{error}</div>
                  <div className="text-[11px] text-red-300/80 mt-1">
                    ※ スマートフォン等の入力で全角文字やスペースが含まれている場合も自動で半角変換して判定します。
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                ユーザーID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="ユーザーIDを入力"
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-stone-900/80 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-stone-300">
                  パスワード
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
                >
                  {showPassword ? '隠す' : '表示する'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-stone-900/80 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* 次回からログインを省略する（自動ログイン・端末保持） */}
            <div 
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2.5 py-1 text-xs text-stone-300 cursor-pointer select-none hover:text-stone-100 transition-colors"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-stone-500 shrink-0" />
              )}
              <span>この端末で次回から自動ログインする（ログイン状態を保持）</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:from-amber-700 active:to-amber-800 text-stone-950 font-semibold rounded-lg text-sm shadow-md shadow-amber-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>認証確認中...</span>
                </>
              ) : (
                <span>ログインして学習を開始</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-800/80 text-center text-xs text-stone-500">
            京都・観光文化検定試験 3級 合格対策プログラム
          </div>
        </div>
      </div>
    </div>
  );
};
