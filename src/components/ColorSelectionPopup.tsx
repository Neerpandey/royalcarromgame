import React from 'react';
import { Palette, X, Ban, Paintbrush } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { GameMode } from '../types';

interface ColorSelectionPopupProps {
  isOpen: boolean;
  mode: GameMode | null;
  onClose: () => void;
  onSelect: (assignColors: boolean) => void;
}

export const ColorSelectionPopup: React.FC<ColorSelectionPopupProps> = ({ isOpen, mode, onClose, onSelect }) => {
  if (!isOpen || !mode) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#121118] border border-[#d4af37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform animate-scale-in">
        <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between bg-gradient-to-r from-[#171923] to-[#121118]">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#d4af37]" />
            <h2 className="font-royal text-xl font-bold text-[#f3e5ab]">Match Rules</h2>
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

        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-gray-300 text-center mb-2">
            How would you like to play this match?
          </p>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onSelect(false);
            }}
            className="w-full relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#1c1a24] to-[#121118] border border-[#d4af37]/30 hover:border-[#d4af37] transition group overflow-hidden"
          >
            <div className="p-3 rounded-full bg-[#2a2e42] text-gray-300">
              <Ban className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[#f3e5ab] text-sm group-hover:text-[#ffdf73] transition">
                Without Color Restriction
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Freestyle: Pocket any coin (White or Black) freely.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onSelect(true);
            }}
            className="w-full relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#1c1a24] to-[#121118] border border-[#d4af37]/30 hover:border-[#d4af37] transition group overflow-hidden"
          >
            <div className="p-3 rounded-full bg-[#10382b] text-[#2ecc71]">
              <Paintbrush className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[#f3e5ab] text-sm group-hover:text-[#ffdf73] transition">
                Pick White/Black Coins
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Strict Rule: You can only pocket your assigned color.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
