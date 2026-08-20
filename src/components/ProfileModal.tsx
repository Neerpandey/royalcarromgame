import React, { useState } from 'react';
import { Crown, X, User, Check, Award, Trophy, Target, Sparkles, UserCircle2, PenSquare } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    avatar: string;
    score: number;
    queens: number;
    gamesPlayed: number;
    gamesWon: number;
  };
  onSaveProfile: (name: string, avatar: string) => void;
}

const AVATARS = ['👑', '🤴', '👸', '🦁', '🐅', '🦅', '💎', '🔥', '⚡', '🏹', '⚔️', '🦚'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  if (!isOpen) return null;

  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  const getRankTitle = (queens: number) => {
    if (queens >= 15) return '👑 King of Carrom';
    if (queens >= 8) return '⚔️ Maharaja Striker';
    if (queens >= 3) return '💎 Mysore Champion';
    return '🎯 Royal Apprentice';
  };

  const handleSave = () => {
    soundManager.playButtonClick();
    onSaveProfile(name.trim() || 'Royal Striker', selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#1c1a24] to-[#121118] border-2 border-[#d4af37]/40 rounded-2xl shadow-2xl p-4 sm:p-5 text-[#f3e5ab]">
        {/* Top Close Button */}
        <button
          id="profile-modal-close-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-[#232738] hover:bg-[#2d3248] text-gray-400 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#2a2212] border border-[#d4af37]/40 text-[#ffdf73]">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="font-royal font-bold text-base sm:text-lg text-[#f3e5ab]">Player Profile</h2>
            <p className="text-[11px] sm:text-xs text-[#d4af37]">{getRankTitle(profile.queens)}</p>
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-2">
            <UserCircle2 className="w-4 h-4 text-[#d4af37]" /> Select Royal Avatar
          </label>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setSelectedAvatar(av);
                }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-lg sm:text-xl flex items-center justify-center transition border active:scale-95 cursor-pointer ${
                  selectedAvatar === av
                    ? 'bg-[#d4af37]/20 border-[#d4af37] scale-105 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                    : 'bg-[#202434] border-gray-700 hover:border-gray-500'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
            <PenSquare className="w-4 h-4 text-[#d4af37]" /> Player Name
          </label>
          <input
            id="profile-name-input"
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#202434] border border-gray-700 focus:border-[#d4af37] text-white text-sm outline-none transition"
            placeholder="Enter your royal title..."
          />
        </div>

        {/* Player Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 rounded-xl bg-[#171923] border border-[#d4af37]/20 mb-4">
          <div className="flex flex-col items-center text-center">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffdf73] mb-1" />
            <span className="text-[9px] sm:text-[10px] text-gray-400">Wins</span>
            <span className="font-bold text-xs sm:text-sm text-white">{profile.gamesWon}</span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-gray-800">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff4d6d] mb-1" />
            <span className="text-[9px] sm:text-[10px] text-gray-400">Queens</span>
            <span className="font-bold text-xs sm:text-sm text-[#ff758f]">{profile.queens}</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2ecc71] mb-1" />
            <span className="text-[9px] sm:text-[10px] text-gray-400">Win Rate</span>
            <span className="font-bold text-xs sm:text-sm text-[#2ecc71]">{winRate}%</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          id="profile-save-btn"
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl font-royal font-bold text-xs sm:text-sm bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#1a0f0a] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Save Profile</span>
        </button>
      </div>
    </div>
  );
};
