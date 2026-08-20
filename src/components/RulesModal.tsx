import React from 'react';
import { Crown, X, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col bg-gradient-to-b from-[#1c1a24] to-[#121118] border-2 border-[#d4af37]/40 rounded-2xl shadow-2xl text-[#f3e5ab] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/20 bg-[#171923]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2a2212] border border-[#d4af37]/40 text-[#ffdf73]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-royal font-bold text-base text-[#f3e5ab]">
                Carrom Rules & 2 Queens Edition
              </h2>
              <p className="text-[11px] text-[#d4af37]">Official Royal Court Rules</p>
            </div>
          </div>

          <button
            id="rules-modal-close-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-[#232738] hover:bg-[#2d3248] text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Rules Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Special 2-Queens Rule Highlight */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#4a0e1b] to-[#260810] border border-[#ff4d6d]/50 shadow-md">
            <div className="flex items-center gap-2 text-[#ff758f] font-bold text-sm mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Special Rule: 2 Red Queens on Board!</span>
            </div>
            <p className="text-gray-200 leading-relaxed">
              In this special royal edition, <strong>2 Red Queens</strong> are placed at the center of the board!
              Each Queen is worth <strong>50 Points</strong>. Both Queens must be covered to secure their points, doubling the tactical depth and excitement!
            </p>
          </div>

          {/* Piece Scoring Table */}
          <div className="space-y-2">
            <h3 className="font-royal font-bold text-sm text-[#ffdf73] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" /> Piece Points & Scoring
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#171923] border border-gray-700">
                <span className="w-5 h-5 rounded-full bg-[#f5ebe1] border border-[#b8a38e] shadow-sm mb-1" />
                <span className="font-bold text-white text-xs">White Goti</span>
                <span className="text-[#d4af37] font-semibold">20 Points</span>
              </div>

              <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#171923] border border-gray-700">
                <span className="w-5 h-5 rounded-full bg-[#24242a] border border-[#5e5e6b] shadow-sm mb-1" />
                <span className="font-bold text-gray-300 text-xs">Black Goti</span>
                <span className="text-[#d4af37] font-semibold">10 Points</span>
              </div>

              <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#171923] border border-[#ff4d6d]/40">
                <span className="w-5 h-5 rounded-full bg-[#c9184a] border border-[#ffdf73] shadow-sm mb-1 animate-pulse" />
                <span className="font-bold text-[#ff758f] text-xs">2x Red Queens</span>
                <span className="text-[#ffdf73] font-semibold">50 Pts Each</span>
              </div>
            </div>
          </div>

          {/* Queen Cover & Double Empress Rule */}
          <div className="p-3 rounded-xl bg-[#171923] border border-[#d4af37]/20 space-y-1.5">
            <h4 className="font-royal font-bold text-xs text-[#ffdf73] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2ecc71]" /> Covering the Queen & Double Empress Bonus
            </h4>
            <p className="text-gray-300 leading-relaxed">
              When a player pockets a Queen, they must <strong>cover</strong> it by pocketing any legal coin on either the same shot or the immediate next turn.
            </p>
            <ul className="list-disc pl-4 text-gray-400 space-y-1">
              <li><strong>Cover Success:</strong> +50 Points awarded & continue your turn!</li>
              <li><strong>Cover Missed:</strong> Queen is returned to the center circle.</li>
              <li><strong>Royal Double Empress:</strong> Securing both Queens awards a special <strong>+25 Bonus Points</strong>!</li>
            </ul>
          </div>

          {/* Turn Flow & Coin Assignment */}
          <div className="p-3 rounded-xl bg-[#171923] border border-[#d4af37]/20 space-y-1.5">
            <h4 className="font-royal font-bold text-xs text-[#ffdf73] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#f39c12]" /> Game Modes & Dynamic Turns
            </h4>
            <ul className="list-disc pl-4 text-gray-300 space-y-1">
              <li><strong>Pass on Miss:</strong> Missing or committing a foul passes the turn to the next player clockwise.</li>
              <li><strong>Continuous Strike:</strong> Pocketing your designated piece grants an extra strike.</li>
              <li><strong>1v1 & 2v2:</strong> Players are assigned White or Black coins. 2v2 partners share the same coin color.</li>
              <li><strong>3P & 4P Free-For-All:</strong> Point Carrom rules where all coins score points.</li>
            </ul>
          </div>

          {/* Professional Fouls & Penalties */}
          <div className="p-3 rounded-xl bg-[#261313] border border-[#e74c3c]/40 space-y-2">
            <h4 className="font-royal font-bold text-xs text-[#ff7675] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#e74c3c]" /> Dynamic Foul & Penalty System
            </h4>
            <ul className="list-disc pl-4 text-gray-300 space-y-1.5">
              <li>
                <strong>Striker Sunk (Scratch Foul):</strong>
                <div className="mt-0.5 text-gray-400 pl-2 space-y-0.5">
                  <div>• If score ≥ 100 pts: <strong>-30 Points Penalty</strong></div>
                  <div>• If score ≥ 50 pts: <strong>-20 Points Penalty</strong></div>
                  <div>• If score &lt; 50 pts: <strong>-10 Points Penalty</strong></div>
                </div>
              </li>
              <li>
                <strong>Coin Penalty & Penalty Due System:</strong> 1 previously pocketed coin is immediately returned to the center circle. If the player has 0 pocketed coins, a <strong>Penalty Due</strong> is logged and as soon as sufficient coins are pocketed on future turns, the due coin is immediately deducted and returned to center!
              </li>
              <li>
                <strong>Opponent's Coin Pocketed:</strong> Points awarded to opponent, shooter loses turn, points deducted, and 1 penalty coin returned to center.
              </li>
              <li>
                <strong>1v1 Fast Bot Engine:</strong> High-speed local physics raycasting without external API delays for snappy, realistic turns.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#d4af37]/20 bg-[#171923]">
          <button
            id="rules-got-it-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl font-royal font-bold text-sm bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#1a0f0a] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition"
          >
            I Understand the Royal Code
          </button>
        </div>
      </div>
    </div>
  );
};
