import confetti from 'canvas-confetti';

/**
 * 合格ライン（70%以上）突破時の雅な桜・ゴールド花吹雪エフェクト
 */
export const triggerPassConfetti = () => {
  // 桜色、金色、山吹色、白、紅梅色の雅な伝統色パレット
  const colors = ['#f43f5e', '#fbbf24', '#f59e0b', '#fbcfe8', '#ffffff', '#e11d48'];

  // 中央からのメインバースト
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
    shapes: ['circle', 'square'],
    scalar: 1.1,
  });

  // 左右からの花吹雪キャノン
  const end = Date.now() + 2.5 * 1000;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};
