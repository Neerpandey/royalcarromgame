import React from 'react';
import { Play, Sparkles, Crown, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';
import { soundManager } from '../audio/soundManager';

interface HomeHubProps {
  onLaunchCarrom: () => void;
  onLaunchXO: () => void;
  userProfile: any;
  currentUser: any;
  onSignOut: () => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({ onLaunchCarrom, onLaunchXO, userProfile, currentUser, onSignOut }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-700 overflow-y-auto relative">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a2212] via-[#0a0a0f] to-[#0a0a0f] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37]/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

      {/* Top Header Profile & Premium Sign Out Button */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3 bg-[#13151f]/90 border border-[#d4af37]/30 px-4 py-2 rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#aa8022] flex items-center justify-center text-lg shadow-md">
          {currentUser?.avatar || userProfile.avatar || '👑'}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-black text-white">{currentUser?.name || userProfile.name}</div>
          <div className="text-[10px] text-[#d4af37] font-bold">{currentUser?.email || 'Maharaja Member'}</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSignOut}
          className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition shadow-md"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sign Out</span>
        </motion.button>
      </div>

      <div className="text-center mb-10 sm:mb-16 relative z-10 flex flex-col items-center mt-12 sm:mt-0">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-[#151722] border border-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
           <Crown className="w-8 h-8 text-[#d4af37]" />
        </div>
        <h1 className="font-royal text-5xl sm:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#ffdf73] via-[#d4af37] to-[#aa8022] drop-shadow-[0_10px_30px_rgba(212,175,55,0.5)] mb-3">
          ROYAL ARCADE
        </h1>
        <p className="text-[#f3e5ab] text-sm sm:text-xl font-medium opacity-90 max-w-lg mx-auto tracking-wide">
          Welcome back, <span className="text-white font-bold">{currentUser?.name || userProfile.name}</span>. Choose your luxury experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 w-full max-w-5xl relative z-10">
        {/* Carrom Card */}
        <div 
          onClick={() => { soundManager.playButtonClick(); onLaunchCarrom(); }}
          className="group relative flex flex-col items-center p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-[#1a150b] to-[#0c0d12] border-2 border-[#d4af37]/30 hover:border-[#d4af37] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(212,175,55,0.1)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.3),inset_0_0_20px_rgba(212,175,55,0.1)] transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-4"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 mix-blend-overlay transition-opacity group-hover:opacity-40"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mb-8 rounded-full bg-[#1b1c24] border-4 border-[#d4af37] flex items-center justify-center shadow-[inset_0_10px_30px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:rotate-12 transition-transform duration-700">
               <div className="absolute inset-0 rounded-full border border-[#f3e5ab]/30 m-2"></div>
               {/* Abstract Carrom Board Graphic */}
               <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-[#d4af37]/50 rounded-md flex items-center justify-center relative bg-[#12141c]/50 backdrop-blur-sm">
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-[#0a0a0f] border border-[#d4af37]/50 shadow-inner"></div>
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#0a0a0f] border border-[#d4af37]/50 shadow-inner"></div>
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full bg-[#0a0a0f] border border-[#d4af37]/50 shadow-inner"></div>
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#0a0a0f] border border-[#d4af37]/50 shadow-inner"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c9184a] shadow-[0_0_15px_#ff4d6d,inset_0_2px_4px_rgba(255,255,255,0.5)] border border-[#ffb3c6]/50"></div>
               </div>
            </div>
            
            <h2 className="font-royal text-3xl sm:text-4xl font-bold text-[#ffdf73] mb-3 tracking-wider group-hover:text-white transition-colors duration-300 drop-shadow-md">Royal Carrom</h2>
            <p className="text-[#a1a1aa] text-center text-sm sm:text-base mb-8 max-w-[240px] leading-relaxed">The classic Indian board game with ultra-premium physics and AI.</p>
            
            <button className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] bg-[length:200%_auto] hover:bg-[position:100%_0] text-[#0a0a0f] font-black text-sm sm:text-base shadow-[0_10px_25px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-all duration-500">
              <Play className="w-5 h-5 fill-current" />
              PLAY NOW
            </button>
          </div>
        </div>

        {/* X/O Card */}
        <div 
          onClick={() => { soundManager.playButtonClick(); onLaunchXO(); }}
          className="group relative flex flex-col items-center p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-[#1a1c26] to-[#0c0d12] border-2 border-[#d4af37]/30 hover:border-[#d4af37] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(212,175,55,0.1)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.3),inset_0_0_20px_rgba(212,175,55,0.1)] transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-4"
        >
          <div className="absolute top-0 right-0 p-4 z-20">
             <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#1b1c24] to-[#2a2212] border border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.5)] animate-pulse">
                <Sparkles className="w-4 h-4 text-[#ffdf73]" />
                <span className="text-xs font-black tracking-widest uppercase text-[#ffdf73]">NEW MODE</span>
             </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mb-8 rounded-3xl bg-[#12141c] border-2 border-[#d4af37]/50 flex items-center justify-center shadow-[inset_0_10px_30px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:-rotate-6 transition-transform duration-700">
               {/* Glowing Grid Background */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(212,175,55,0.1)_2px,transparent_2px)] bg-[size:33.33%_33.33%]"></div>
               {/* 3D X and O */}
               <div className="flex gap-3 z-10 relative items-center">
                 <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#f3e5ab] to-[#d4af37] drop-shadow-[0_10px_15px_rgba(212,175,55,0.6)] filter brightness-125 transform group-hover:scale-110 transition-transform duration-500 delay-100">X</div>
                 <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] to-[#a1a1aa] drop-shadow-[0_10px_15px_rgba(255,255,255,0.4)] filter brightness-125 transform group-hover:scale-110 transition-transform duration-500 delay-200">O</div>
               </div>
            </div>
            
            <h2 className="font-royal text-3xl sm:text-4xl font-bold text-[#f3e5ab] mb-3 tracking-wider group-hover:text-white transition-colors duration-300 drop-shadow-md">Royal X/O</h2>
            <p className="text-[#a1a1aa] text-center text-sm sm:text-base mb-8 max-w-[240px] leading-relaxed">The classic Tic-Tac-Toe reimagined in a golden crystal aesthetic.</p>
            
            <button className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] bg-[length:200%_auto] hover:bg-[position:100%_0] text-[#0a0a0f] font-black text-sm sm:text-base shadow-[0_10px_25px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-all duration-500">
              <Play className="w-5 h-5 fill-current" />
              PLAY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
