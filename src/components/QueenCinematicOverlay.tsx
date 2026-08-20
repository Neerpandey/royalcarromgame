import React, { useEffect } from 'react';
import { Crown, Sparkles, AlertOctagon, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../audio/soundManager';

export interface QueenCinematicEvent {
  type: 'secured' | 'lost' | 'double_empress';
  playerName: string;
  playerAvatar?: string;
  pointsAwarded?: number;
  message?: string;
}

interface QueenCinematicOverlayProps {
  event: QueenCinematicEvent | null;
  onDismiss: () => void;
}

export const QueenCinematicOverlay: React.FC<QueenCinematicOverlayProps> = ({
  event,
  onDismiss,
}) => {
  useEffect(() => {
    if (!event) return;

    if (event.type === 'secured' || event.type === 'double_empress') {
      soundManager.playQueenSecured();
      confetti({
        particleCount: event.type === 'double_empress' ? 140 : 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#D4AF37', '#FFDF73', '#FF4D6D', '#FFFFFF', '#C9184A'],
      });
    } else if (event.type === 'lost') {
      soundManager.playQueenLost();
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);

    return () => clearTimeout(timer);
  }, [event, onDismiss]);

  if (!event) return null;

  const isSecured = event.type === 'secured' || event.type === 'double_empress';

  return (
    <div
      id="queen-cinematic-overlay"
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md cursor-pointer animate-in fade-in zoom-in-95 duration-300 select-none"
    >
      {/* Background Radial Flare */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isSecured
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.25)_0%,rgba(201,24,74,0.18)_50%,transparent_75%)]'
            : 'bg-[radial-gradient(ellipse_at_center,rgba(231,76,60,0.25)_0%,rgba(40,10,15,0.3)_60%,transparent_80%)]'
        }`}
      />

      <div
        className={`relative max-w-xs sm:max-w-md w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center flex flex-col items-center gap-3 transition-transform transform scale-100 ${
          isSecured
            ? 'bg-gradient-to-b from-[#2a1b0d] via-[#1a121d] to-[#0f0c13] border-[#d4af37]'
            : 'bg-gradient-to-b from-[#2d0f14] via-[#1a0a0d] to-[#0e0608] border-[#e74c3c]/80'
        }`}
      >
        {/* Animated Floating Crown / Alert Icon */}
        <div className="relative flex justify-center gap-4">
          {event.type === 'double_empress' ? (
            <>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 shadow-2xl bg-gradient-to-br from-[#d4af37] via-[#aa7c11] to-[#6a4900] border-[#ffeaa7] text-[#1a0f0a] animate-bounce delay-100">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 shadow-2xl bg-gradient-to-br from-[#d4af37] via-[#aa7c11] to-[#6a4900] border-[#ffeaa7] text-[#1a0f0a] animate-bounce">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
              </div>
            </>
          ) : (
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 shadow-2xl ${
                isSecured
                  ? 'bg-gradient-to-br from-[#d4af37] via-[#aa7c11] to-[#6a4900] border-[#ffeaa7] text-[#1a0f0a] animate-bounce'
                  : 'bg-gradient-to-br from-[#c0392b] via-[#962d22] to-[#4a0e1b] border-[#ff7675] text-white animate-pulse'
              }`}
            >
              {isSecured ? (
                <Crown className="w-9 h-9 sm:w-12 sm:h-12 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
              ) : (
                <AlertOctagon className="w-9 h-9 sm:w-12 sm:h-12 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
              )}
            </div>
          )}

          {isSecured && (
            <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-[#ff4d6d] text-white border border-[#ffdf73] shadow-lg animate-spin">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Cinematic Headline */}
        <div className="space-y-1">
          <div
            className={`text-xs font-black tracking-widest uppercase ${
              isSecured ? 'text-[#ffdf73]' : 'text-[#ff7675]'
            }`}
          >
            {event.type === 'double_empress'
              ? '✨ Royal Mastery Achievement ✨'
              : isSecured
              ? '👑 Royal Cover Successful 👑'
              : '⚠️ Cover Requirement Missed ⚠️'}
          </div>

          <h2
            className={`font-royal font-black text-2xl sm:text-3xl uppercase tracking-wider drop-shadow-md ${
              isSecured
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ffeaa7] via-[#d4af37] to-[#ffdf73]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff7675] via-[#e74c3c] to-[#ff4d6d]'
            }`}
          >
            {event.type === 'double_empress'
              ? 'ROYAL DOUBLE EMPRESS!'
              : isSecured
              ? `QUEEN SECURED BY ${event.playerName}!`
              : 'QUEEN LOST: NO COVER SECURED!'}
          </h2>
        </div>

        {/* Player Badge & Points Award */}
        {isSecured ? (
          <div className="w-full p-3.5 rounded-2xl bg-black/40 border border-[#d4af37]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-2xl">{event.playerAvatar || '👑'}</span>
              <div>
                <div className="font-bold text-sm text-white">{event.playerName}</div>
                <div className="text-[11px] text-[#d4af37]">Royal Crown Claimed</div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#1a0f0a] font-black text-sm sm:text-base shadow-md">
              +{event.pointsAwarded || (event.type === 'double_empress' ? 125 : 50)} PTS
            </div>
          </div>
        ) : (
          <div className="w-full p-3.5 rounded-2xl bg-black/40 border border-[#e74c3c]/30 flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-[#4a0e1b] text-[#ff7675] border border-[#ff4d6d]/40">
              <RotateCcw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Queen Returned to Center</div>
              <div className="text-[11px] text-gray-300">
                Failed to pocket a cover coin immediately after Queen
              </div>
            </div>
          </div>
        )}

        <div className="text-[11px] text-gray-400 font-medium tracking-wide">
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
};
