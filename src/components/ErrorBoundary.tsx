import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('kyoto_exam_user_stats_v2');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-stone-850 border border-stone-700 rounded-2xl p-6 text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold font-serif text-stone-100 mb-2">
              画面の表示中に問題が発生しました
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              端末の保存データまたはブラウザの状態をリフレッシュして再読み込みしてください。
            </p>
            {this.state.error && (
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 text-[11px] font-mono text-stone-400 text-left mb-6 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>データを更新して再読み込み</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
