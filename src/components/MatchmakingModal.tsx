import React, { useState } from 'react';
import { Wifi, X, Users, Play, Copy, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { GameMode } from '../types';

interface MatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (mode: GameMode) => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ isOpen, onClose, onStartMatch }) => {
  const [roomCode, setRoomCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    soundManager.playButtonClick();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    setCopied(false);
  };

  const handleCopy = () => {
    if (generatedCode) {
      soundManager.playButtonClick();
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = () => {
    if (roomCode.length > 3) {
      soundManager.playButtonClick();
      onStartMatch('1v1');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#121118] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between bg-gradient-to-r from-[#171923] to-[#121118]">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-[#e056fd]" />
            <h2 className="font-royal text-xl font-bold text-[#f3e5ab]">Matchmaking Hub</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-6">
          {/* Create Room */}
          <div className="bg-[#1c1a24] p-4 rounded-xl border border-[#d4af37]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#e056fd]/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-sm font-bold text-[#f3e5ab] mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#e056fd]" /> Host a Private Room
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Generate a unique match code and share it with a friend to play instantly.
            </p>

            {!generatedCode ? (
              <button
                onClick={handleGenerate}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#1a0f0a] font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition"
              >
                Generate Room Code
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0a0a0f] border border-[#d4af37]/30 rounded-lg p-2.5 text-center text-lg font-mono font-bold tracking-widest text-[#f3e5ab]">
                  {generatedCode}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2.5 rounded-lg bg-[#2a2e42] border border-[#d4af37]/30 hover:bg-[#343950] transition text-[#f3e5ab]"
                  title="Copy Code"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-[#2ecc71]" /> : <Copy className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => onStartMatch('1v1')}
                  className="px-4 py-2.5 rounded-lg bg-[#2ecc71] hover:bg-[#27ae60] text-black font-bold shadow-[0_0_15px_rgba(46,204,113,0.4)] transition"
                >
                  Start
                </button>
              </div>
            )}
          </div>

          {/* Join Room */}
          <div className="bg-[#1c1a24] p-4 rounded-xl border border-[#d4af37]/20 relative overflow-hidden">
            <h3 className="text-sm font-bold text-[#f3e5ab] mb-2 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-[#2ecc71]" /> Join by Code
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter a friend's room code to connect to their lobby.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-DIGIT CODE"
                maxLength={6}
                className="flex-1 bg-[#0a0a0f] border border-[#d4af37]/30 rounded-lg p-2.5 text-center font-mono font-bold tracking-widest text-[#f3e5ab] placeholder:text-gray-600 focus:outline-none focus:border-[#d4af37]"
              />
              <button
                onClick={handleJoin}
                disabled={roomCode.length < 3}
                className="px-6 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#ffeaa7] text-[#1a0f0a] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
