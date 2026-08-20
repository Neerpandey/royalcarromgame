import React, { useState } from 'react';
import { ArrowLeft, Play, User, Bot, Crown } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface XoMenuProps {
  onBack: () => void;
  onStart: (mode: '1p' | '2p', difficulty?: 'easy' | 'medium' | 'hard', gridSize?: number) => void;
}

export const XoMenu: React.FC<XoMenuProps> = ({ onBack, onStart }) => {
  const [mode, setMode] = useState<'1p' | '2p'>('1p');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gridSize, setGridSize] = useState<number>(3);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="absolute top-4 left-4">
        <button 
          onClick={() => { soundManager.playButtonClick(); onBack(); }}
          className="flex items-center gap-2 text-[#d4af37] hover:text-[#ffdf73] transition px-3 py-1.5 rounded-lg bg-[#1a1c26] border border-[#d4af37]/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold text-sm">Back to Hub</span>
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="flex gap-2 z-10 relative items-center mb-2">
           <div className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#f3e5ab] to-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] filter brightness-125">X</div>
           <div className="text-4xl sm:text-5xl text-[#d4af37]/50 font-black">/</div>
           <div className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] to-[#a1a1aa] drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] filter brightness-125">O</div>
        </div>
        <h1 className="font-royal text-2xl sm:text-4xl font-black tracking-widest gold-gradient-text">ROYAL X/O</h1>
      </div>

      <div className="w-full max-w-md bg-[#12141c]/90 backdrop-blur-xl border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
        
        {/* Mode Selection */}
        <div>
          <h3 className="text-[#f3e5ab] font-bold mb-3 uppercase tracking-wider text-sm">Game Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { soundManager.playButtonClick(); setMode('1p'); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${mode === '1p' ? 'bg-[#2a2212] border-[#d4af37] text-[#ffdf73] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-[#1a1c26] border-transparent text-gray-400 hover:border-[#d4af37]/50'}`}
            >
              <Bot className="w-6 h-6" />
              <span className="font-bold">1 Player</span>
            </button>
            <button 
              onClick={() => { soundManager.playButtonClick(); setMode('2p'); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${mode === '2p' ? 'bg-[#2a2212] border-[#d4af37] text-[#ffdf73] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-[#1a1c26] border-transparent text-gray-400 hover:border-[#d4af37]/50'}`}
            >
              <User className="w-6 h-6" />
              <span className="font-bold">2 Players</span>
            </button>
          </div>
        </div>

        {/* Difficulty Selection (Only for 1P) */}
        {mode === '1p' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <h3 className="text-[#f3e5ab] font-bold mb-3 uppercase tracking-wider text-sm">AI Difficulty</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => { soundManager.playButtonClick(); setDifficulty(diff); }}
                  className={`py-2 px-1 rounded-lg border text-xs sm:text-sm font-bold uppercase transition ${difficulty === diff ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#ffdf73]' : 'bg-[#1a1c26] border-[#d4af37]/30 text-gray-400 hover:bg-[#d4af37]/10'}`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Grid Size Selection */}
        <div className="animate-in fade-in slide-in-from-top-2">
          <h3 className="text-[#f3e5ab] font-bold mb-3 uppercase tracking-wider text-sm">Grid Size</h3>
          <div className="grid grid-cols-5 gap-2">
            {[3, 4, 6, 12, 24].map(size => (
              <button
                key={size}
                onClick={() => { soundManager.playButtonClick(); setGridSize(size); }}
                className={`py-2 px-1 rounded-lg border text-xs sm:text-sm font-bold transition ${gridSize === size ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#ffdf73]' : 'bg-[#1a1c26] border-[#d4af37]/30 text-gray-400 hover:bg-[#d4af37]/10'}`}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>


        <button 
          onClick={() => { soundManager.playButtonClick(); onStart(mode, mode === '1p' ? difficulty : undefined, gridSize); }}
          className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8022] text-[#0a0a0f] font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Game
        </button>

      </div>
    </div>
  );
};
