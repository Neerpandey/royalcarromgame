import React, { useEffect, useRef } from 'react';
import { Player } from '../types';
import {
  Crown,
  Trophy,
  RotateCcw,
  Home,
  Sparkles,
  Target,
  Flame,
  Award,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface VictoryModalProps {
  isOpen: boolean;
  winner?: Player | { team: number; players: Player[] };
  players: Player[];
  onRematch: () => void;
  onExitToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  players,
  onRematch,
  onExitToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isTeamWin = winner && 'team' in winner;
  const humanPlayer = players.find((p) => !p.isBot && p.id === 'p1');
  const isHumanWinner =
    winner && humanPlayer
      ? isTeamWin
        ? (winner as { team: number }).team === humanPlayer.team
        : (winner as Player).id === humanPlayer.id
      : true;

  // Trigger celebration confetti & victory/defeat audio upon opening
  useEffect(() => {
    if (!isOpen || !winner) return;

    if (isHumanWinner) {
      soundManager.playWinFanfare();

      // Multi-stage golden confetti cannon
      const end = Date.now() + 3.5 * 1000;
      const colors = ['#d4af37', '#ffd700', '#f3e5ab', '#ff4d6d', '#ffffff'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Big center burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5 },
          colors,
          zIndex: 9999,
        });
      }, 400);
    } else {
      soundManager.playDefeatSound();
    }
  }, [isOpen, winner, isHumanWinner]);

  // Floating background sparkles & 3D stars particle canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      alphaSpeed: number;
      color: string;
      rotation: number;
      rotSpeed: number;
    }[] = [];

    const pColors = isHumanWinner
      ? ['#ffd700', '#f3e5ab', '#ffdf73', '#ff6b81', '#ffffff']
      : ['#9aa0a6', '#5f6368', '#bdc1c6', '#d4af37'];

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1.5,
        speedY: -(Math.random() * 0.8 + 0.3),
        speedX: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        alphaSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        color: pColors[Math.floor(Math.random() * pColors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
      });
    }

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.9 || p.alpha < 0.2) p.alphaSpeed = -p.alphaSpeed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        // Draw diamond spark
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 2);
        ctx.lineTo(p.size * 0.8, 0);
        ctx.lineTo(0, p.size * 2);
        ctx.lineTo(-p.size * 0.8, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, isHumanWinner]);

  if (!isOpen || !winner) return null;

  const winnerTitle = isTeamWin
    ? `Team ${winner.team} Triumphs!`
    : `${(winner as Player).name} is the Carrom King!`;

  const topPlayer = players.slice().sort((a, b) => b.score - a.score)[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-lg">
        {/* Animated Background Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

        {/* Dynamic Spotlight Radial Rays */}
        <div
          className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${
            isHumanWinner
              ? 'bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.22)_0%,rgba(0,0,0,0.85)_75%)]'
              : 'bg-[radial-gradient(circle_at_center,rgba(90,95,110,0.18)_0%,rgba(0,0,0,0.9)_75%)]'
          }`}
        />

        {/* Main Modal Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className={`relative z-10 w-full max-w-lg max-h-[92dvh] overflow-y-auto my-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center border-2 shadow-[0_0_60px_rgba(0,0,0,0.8)] ${
            isHumanWinner
              ? 'bg-gradient-to-b from-[#1f1b29] via-[#15131e] to-[#0c0b10] border-[#d4af37] text-[#f3e5ab]'
              : 'bg-gradient-to-b from-[#1b1c24] via-[#13141a] to-[#0a0a0e] border-[#555a6e] text-gray-200'
          }`}
        >
          {/* Top Shimmer Header Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-80" />

          {/* Central Crown / Trophy Spotlight Icon */}
          <div className="relative mb-2.5 flex justify-center">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-2xl ${
                isHumanWinner
                  ? 'bg-gradient-to-tr from-[#aa7c11] via-[#ffd700] to-[#fff3c4] text-[#1a0f0a] shadow-[0_0_40px_rgba(255,215,0,0.5)]'
                  : 'bg-gradient-to-tr from-[#3a3f50] via-[#70778c] to-[#d0d4e0] text-[#111319] shadow-[0_0_30px_rgba(100,110,130,0.3)]'
              }`}
            >
              {isHumanWinner ? (
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 fill-current drop-shadow-md" />
              ) : (
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 fill-current drop-shadow-md" />
              )}
            </motion.div>
          </div>

          {/* Subtitle Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isHumanWinner
                ? 'bg-[#2a2212] border-[#d4af37]/50 text-[#ffdf73]'
                : 'bg-[#1e2029] border-gray-600 text-gray-300'
            }`}
          >
            {isHumanWinner ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" /> Royal Grand Victory
              </>
            ) : (
              <>
                <Award className="w-3.5 h-3.5 text-gray-400" /> Match Concluded
              </>
            )}
          </div>

          {/* Main Title */}
          <h2
            className={`font-royal font-black text-2xl sm:text-3xl tracking-wide mb-1 ${
              isHumanWinner ? 'gold-gradient-text' : 'text-gray-100'
            }`}
          >
            {isHumanWinner ? winnerTitle : 'Valiant Effort! Better Luck Next Time'}
          </h2>

          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            {isHumanWinner
              ? 'A majestic display of carrom mastery, rebound calculations, and royal queen captures.'
              : 'Every grandmaster began with missed angles. Hone your bank shots in practice and strike again!'}
          </p>

          {/* Match Key Stats Highlight Box */}
          {topPlayer && (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl bg-[#141620]/90 border border-gray-800/80 mb-4 text-center">
              <div className="p-1.5 rounded-xl bg-[#1a1d2c]/60">
                <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Target className="w-3 h-3 text-[#64b5f6]" /> Shots
                </div>
                <div className="font-royal font-bold text-sm sm:text-base text-white mt-0.5">
                  {topPlayer.totalShots || 1}
                </div>
              </div>

              <div className="p-1.5 rounded-xl bg-[#1a1d2c]/60">
                <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-[#2ecc71]" /> Accuracy
                </div>
                <div className="font-royal font-bold text-sm sm:text-base text-[#2ecc71] mt-0.5">
                  {topPlayer.totalShots > 0
                    ? Math.round(((topPlayer.successfulShots || 0) / topPlayer.totalShots) * 100)
                    : 100}
                  %
                </div>
              </div>

              <div className="p-1.5 rounded-xl bg-[#1a1d2c]/60">
                <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-[#ff4d6d]" /> Queens
                </div>
                <div className="font-royal font-bold text-sm sm:text-base text-[#ff758f] mt-0.5">
                  {topPlayer.coveredQueens}
                </div>
              </div>

              <div className="p-1.5 rounded-xl bg-[#1a1d2c]/60">
                <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-[#ff9f43]" /> Combo
                </div>
                <div className="font-royal font-bold text-sm sm:text-base text-[#ff9f43] mt-0.5">
                  {topPlayer.highestCombo || topPlayer.currentCombo || 0}x
                </div>
              </div>
            </div>
          )}

          {/* Standings Leaderboard */}
          <div className="space-y-1.5 mb-5 text-left">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#ffdf73] uppercase tracking-wider px-1">
              <span>Final Standings</span>
              <span className="text-[10px] text-gray-400 font-normal">Score & Pockets</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
              {players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p, rank) => {
                  const isPWinner = !isTeamWin
                    ? (winner as Player).id === p.id
                    : (winner as { team: number }).team === p.team;

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rank * 0.08 }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                        isPWinner
                          ? 'bg-gradient-to-r from-[#2a2212] via-[#221c10] to-[#17140e] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                          : 'bg-[#151722]/80 border-gray-800 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-xs font-bold w-4 text-center ${
                            rank === 0 ? 'text-[#ffd700]' : 'text-gray-400'
                          }`}
                        >
                          #{rank + 1}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#202434] border border-gray-700 flex items-center justify-center text-sm shadow-inner">
                          {p.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#f3e5ab] flex items-center gap-1">
                            <span>{p.name}</span>
                            {isPWinner && <span className="text-xs">👑</span>}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="text-[#ff758f] font-semibold">
                              {p.coveredQueens} ♛
                            </span>
                            <span>{p.coinsPocketed.white} White</span>
                            <span>{p.coinsPocketed.black} Black</span>
                            {p.fouls > 0 && (
                              <span className="text-[#ff6b6b] flex items-center gap-0.5">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                {p.fouls} Foul
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-royal font-black text-sm text-[#ffdf73]">
                          {p.score} Pts
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="victory-rematch-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onRematch();
              }}
              className="py-2.5 px-4 rounded-xl font-royal font-bold text-xs sm:text-sm bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] text-[#1a0f0a] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch</span>
            </button>

            <button
              id="victory-menu-btn"
              onClick={() => {
                soundManager.playButtonClick();
                onExitToMenu();
              }}
              className="py-2.5 px-4 rounded-xl font-royal font-bold text-xs sm:text-sm bg-[#202434] hover:bg-[#2a3044] border border-[#d4af37]/40 text-[#f3e5ab] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-[#d4af37]" />
              <span>Main Menu</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
