import React from 'react';
import { GameMode, BotDifficulty, GameSettings, Player } from '../types';
import { BOARD_THEMES, STRIKER_SKINS } from '../data/carromConstants';
import { soundManager } from '../audio/soundManager';
import {
  Crown,
  Users,
  Bot,
  UserCheck,
  Award,
  Sparkles,
  Play,
  Settings,
  HelpCircle,
  Shield,
  Volume2,
  VolumeX,
  Target,
  Wifi,
  Menu,
  X,
} from 'lucide-react';

interface MainMenuProps {
  settings: GameSettings;
  onStartGame: (mode: GameMode, botDifficulty?: BotDifficulty) => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  userProfile: { name: string; avatar: string; score: number; queens: number };
  onOpenMatchmaking?: () => void;
  canInstall?: boolean;
  onInstallClick?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  settings,
  onStartGame,
  onOpenSettings,
  onOpenRules,
  onOpenProfile,
  onToggleSound,
  isMuted,
  userProfile,
  onOpenMatchmaking,
  canInstall,
  onInstallClick,
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="relative h-[100dvh] min-h-[100dvh] w-full flex flex-col items-center justify-between p-3 sm:p-5 bg-[#0a0a0f] text-[#f3e5ab] overflow-y-auto overflow-x-hidden wood-pattern">
      {/* Background Ambience Radial Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#10382b]/30 via-transparent to-[#0a0a0f] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <nav className="w-full max-w-4xl flex items-center justify-between z-50 px-3 py-2 bg-[#12141c]/95 backdrop-blur-md rounded-2xl border border-[#d4af37]/20 shadow-xl shrink-0">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#d4af37]" />
          <span className="font-royal font-bold tracking-wider gold-gradient-text text-sm sm:text-base hidden xs:inline-block">Royal Carrom</span>
        </div>

        {/* Desktop Nav & Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => { soundManager.playButtonClick(); onOpenProfile(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a1c26] hover:bg-[#202434] border border-[#d4af37]/30 transition shadow-md group cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#2a2e42] border border-[#d4af37] flex items-center justify-center text-xs">{userProfile.avatar}</div>
            <span className="text-[11px] font-bold text-[#f3e5ab] group-hover:text-[#ffdf73]">{userProfile.name}</span>
          </button>
          
          <button onClick={onToggleSound} className="p-2 rounded-xl bg-[#1a1c26] hover:bg-[#202434] text-[#d4af37] border border-[#d4af37]/30 transition" title="Toggle Sound">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={() => { soundManager.playButtonClick(); onOpenRules(); }} className="p-2 rounded-xl bg-[#1a1c26] hover:bg-[#202434] text-[#d4af37] border border-[#d4af37]/30 transition" title="Rules">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button onClick={() => { soundManager.playButtonClick(); onOpenSettings(); }} className="p-2 rounded-xl bg-[#1a1c26] hover:bg-[#202434] text-[#d4af37] border border-[#d4af37]/30 transition" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          {canInstall && (
            <button onClick={() => { soundManager.playButtonClick(); if (onInstallClick) onInstallClick(); }} className="px-3 py-1.5 ml-1 rounded-xl bg-[#d4af37] text-[#0a0a0f] font-bold text-[10px] shadow-[0_0_10px_rgba(212,175,55,0.4)] transition hover:scale-105 cursor-pointer">
              INSTALL
            </button>
          )}
        </div>

        {/* Mobile Hamburger / Profile Mini */}
        <div className="flex sm:hidden items-center gap-2">
           {canInstall && (
            <button onClick={() => { soundManager.playButtonClick(); if (onInstallClick) onInstallClick(); }} className="px-2.5 py-1 rounded-lg bg-[#d4af37] text-[#0a0a0f] font-bold text-[10px] shadow-[0_0_8px_rgba(212,175,55,0.4)]">
              INSTALL
            </button>
          )}
          <button 
            className="p-1.5 text-[#d4af37] bg-[#1a1c26] border border-[#d4af37]/30 rounded-lg cursor-pointer"
            onClick={() => { soundManager.playButtonClick(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-[70px] left-1/2 -translate-x-1/2 w-[95%] max-w-sm bg-[#12141c]/95 backdrop-blur-xl border border-[#d4af37]/30 rounded-2xl flex flex-col items-center py-4 gap-4 z-40 shadow-2xl animate-in slide-in-from-top-2">
          <button onClick={() => { soundManager.playButtonClick(); onOpenProfile(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 w-[90%] rounded-xl bg-[#1a1c26] border border-[#d4af37]/30">
             <div className="w-8 h-8 rounded-full bg-[#2a2e42] border border-[#d4af37] flex items-center justify-center text-lg">{userProfile.avatar}</div>
             <div className="text-left">
               <div className="text-sm font-bold text-[#f3e5ab]">{userProfile.name}</div>
               <div className="text-[10px] text-[#d4af37]">👑 {userProfile.queens} Queens Sunk</div>
             </div>
          </button>
          
          <div className="flex gap-2 w-[90%] justify-center">
            <button onClick={onToggleSound} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-[#1a1c26] border border-[#d4af37]/30 text-[#d4af37] active:scale-95 transition">
              {isMuted ? <VolumeX className="w-5 h-5 mb-1" /> : <Volume2 className="w-5 h-5 mb-1" />}
              <span className="text-[10px]">Sound</span>
            </button>
            <button onClick={() => { soundManager.playButtonClick(); onOpenRules(); setIsMobileMenuOpen(false); }} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-[#1a1c26] border border-[#d4af37]/30 text-[#d4af37] active:scale-95 transition">
              <HelpCircle className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Rules</span>
            </button>
            <button onClick={() => { soundManager.playButtonClick(); onOpenSettings(); setIsMobileMenuOpen(false); }} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-[#1a1c26] border border-[#d4af37]/30 text-[#d4af37] active:scale-95 transition">
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Title Section */}
      <div className="flex flex-col items-center text-center my-2 sm:my-4 z-10 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1c24]/90 border border-[#d4af37]/40 shadow-inner mb-1.5">
          <Sparkles className="w-3 h-3 text-[#d4af37]" />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#ffdf73]">
            Ultra-Premium Indian Carrom
          </span>
        </div>

        <div className="relative flex items-center justify-center gap-3">
          <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-pulse" />
          <h1 className="font-royal text-2xl sm:text-4xl lg:text-5xl font-black tracking-wider gold-gradient-text drop-shadow-[0_4px_20px_rgba(212,175,55,0.4)]">
            ROYAL CARROM
          </h1>
          <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-pulse" />
        </div>
        <p className="font-royal text-xs sm:text-sm text-[#d4af37] tracking-widest mt-1 uppercase flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> King's Strike • 2 Queens Edition <Shield className="w-3.5 h-3.5" />
        </p>
      </div>

      {/* Game Mode Cards Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 z-10 my-1 py-1">
        {/* 1. vs Smart AI Bot */}
        <div
          id="mode-vs-bot-card"
          className="relative flex flex-col p-4 rounded-2xl bg-gradient-to-b from-[#1c1a24] to-[#121118] border border-[#d4af37]/40 hover:border-[#d4af37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition duration-300 text-left group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-[#2a2212] border border-[#d4af37]/40 text-[#ffdf73]">
              <Bot className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/20 text-[#ffdf73] border border-[#d4af37]/30">
              SMART BOT
            </span>
          </div>
          <h3 className="font-royal font-bold text-base text-[#f3e5ab] group-hover:text-[#ffdf73] transition">
            Play vs AI Bot
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 mb-2.5">
            Rule-aware AI bot with trajectory prediction & bank shot calculations.
          </p>

          {/* Difficulty Quick Buttons */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onStartGame('vs_bot', 'rookie');
              }}
              className="py-1 px-1 rounded-lg text-[10px] font-bold bg-[#1b2230] hover:bg-[#253046] text-[#64b5f6] border border-[#64b5f6]/30 transition text-center"
              title="Easy: Direct pot attempts with relaxed accuracy"
            >
              Rookie
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onStartGame('vs_bot', 'maharaja');
              }}
              className="py-1 px-1 rounded-lg text-[10px] font-bold bg-[#2a2212] hover:bg-[#3d3118] text-[#ffdf73] border border-[#d4af37]/50 transition text-center"
              title="Medium: Strategic Queen covering and defense"
            >
              Maharaja
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onStartGame('vs_bot', 'grandmaster');
              }}
              className="py-1 px-1 rounded-lg text-[10px] font-bold bg-[#2d1218] hover:bg-[#421822] text-[#ff758f] border border-[#ff4d6d]/50 transition text-center"
              title="Hard: 1-Cushion bank shots & precision pots"
            >
              Grandmaster
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onStartGame('vs_bot', 'maharaja');
            }}
            className="mt-auto flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 hover:from-[#d4af37]/40 hover:to-[#d4af37]/20 border border-[#d4af37]/40 text-xs text-[#ffdf73] font-semibold transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Maharaja Match</span>
          </button>
        </div>

        {/* 2. 1 vs 1 Pass & Play */}
        <button
          id="mode-1v1-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onStartGame('1v1');
          }}
          className="relative flex flex-col p-4 rounded-2xl bg-gradient-to-b from-[#1c1a24] to-[#121118] border border-[#d4af37]/40 hover:border-[#d4af37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition duration-300 text-left group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2ecc71]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#12281e] border border-[#2ecc71]/40 text-[#2ecc71]">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2ecc71]/20 text-[#2ecc71] border border-[#2ecc71]/30">
              CLASSIC
            </span>
          </div>
          <h3 className="font-royal font-bold text-base text-[#f3e5ab] group-hover:text-[#ffdf73] transition">
            1 vs 1 Match
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Classic 2-player duel with assigned White/Black coins and South/North baselines.
          </p>
          <div className="mt-auto flex items-center gap-1.5 text-xs text-[#2ecc71] font-semibold">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start 1v1 Duel</span>
          </div>
        </button>

        {/* 3. 2 vs 2 Partnership Team Mode */}
        <button
          id="mode-2v2-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onStartGame('2v2');
          }}
          className="relative flex flex-col p-4 rounded-2xl bg-gradient-to-b from-[#1c1a24] to-[#121118] border border-[#d4af37]/40 hover:border-[#d4af37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition duration-300 text-left group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#e74c3c]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#2e1515] border border-[#e74c3c]/40 text-[#ff7675]">
              <Shield className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e74c3c]/20 text-[#ff7675] border border-[#e74c3c]/30">
              PARTNERSHIP
            </span>
          </div>
          <h3 className="font-royal font-bold text-base text-[#f3e5ab] group-hover:text-[#ffdf73] transition">
            Local 2 Player
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Team Red (P1 & P3) vs Team Gold (P2 & P4) seated opposite. Shared team points.
          </p>
          <div className="mt-auto flex items-center gap-1.5 text-xs text-[#ff7675] font-semibold">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start 2v2 Teams</span>
          </div>
        </button>

        {/* 4. 1 vs 1 vs 1 (3-Player FFA) */}
        <button
          id="mode-3p-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onStartGame('3p');
          }}
          className="relative flex flex-col p-4 rounded-2xl bg-gradient-to-b from-[#1c1a24] to-[#121118] border border-[#d4af37]/40 hover:border-[#d4af37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition duration-300 text-left group overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#261e38] border border-[#a29bfe]/40 text-[#a29bfe]">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#a29bfe]/20 text-[#a29bfe] border border-[#a29bfe]/30">
              3-PLAYER FFA
            </span>
          </div>
          <h3 className="font-royal font-bold text-base text-[#f3e5ab] group-hover:text-[#ffdf73] transition">
            3 Players Free-For-All
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            3 players on 3 separate baselines competing for the highest score. Point Carrom rules.
          </p>
          <div className="mt-auto flex items-center gap-1.5 text-xs text-[#a29bfe] font-semibold">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start 3-Player FFA</span>
          </div>
        </button>

        {/* 5. 4-Player Free-For-All */}
        <button
          id="mode-4p-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onStartGame('4p');
          }}
          className="relative flex flex-col p-4 rounded-2xl bg-gradient-to-b from-[#1c1a24] to-[#121118] border border-[#d4af37]/40 hover:border-[#d4af37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition duration-300 text-left group overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#2b2112] border border-[#f39c12]/40 text-[#f39c12]">
              <Crown className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f39c12]/20 text-[#f39c12] border border-[#f39c12]/30">
              4-PLAYER FFA
            </span>
          </div>
          <h3 className="font-royal font-bold text-base text-[#f3e5ab] group-hover:text-[#ffdf73] transition">
            4 Players Free-For-All
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            4 individual contestants on all 4 baselines. Dynamic clockwise turn rotation.
          </p>
          <div className="mt-auto flex items-center gap-1.5 text-xs text-[#f39c12] font-semibold">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start 4-Player FFA</span>
          </div>
        </button>

        {/* 6. Matchmaking / Room Code */}
        <button
          id="mode-matchmaking-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onOpenMatchmaking?.(); // We will need to add this prop
          }}
          className="relative flex flex-col p-4 rounded-2xl bg-gradient-to-b from-[#1c1a24] to-[#121118] border border-[#d4af37]/40 hover:border-[#d4af37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition duration-300 text-left group overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#2b1226] border border-[#e056fd]/40 text-[#e056fd]">
              <Wifi className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e056fd]/20 text-[#e056fd] border border-[#e056fd]/30">
              MULTIPLAYER
            </span>
          </div>
          <h3 className="font-royal font-bold text-base text-[#f3e5ab] group-hover:text-[#ffdf73] transition">
            Matchmaking Hub
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Generate a unique room code or join a friend's private lobby instantly.
          </p>
          <div className="mt-auto flex items-center gap-1.5 text-xs text-[#e056fd] font-semibold">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Connect & Play</span>
          </div>
        </button>

        {/* 7. Trick Shot Practice */}
        <button
          id="mode-practice-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onStartGame('practice');
          }}
          className="relative flex flex-col p-4 rounded-2xl bg-gradient-to-b from-[#1c1a24] to-[#121118] border border-[#d4af37]/40 hover:border-[#d4af37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition duration-300 text-left group overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#1b263b] border border-[#64b5f6]/40 text-[#64b5f6]">
              <Target className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#64b5f6]/20 text-[#64b5f6] border border-[#64b5f6]/30">
              PRACTICE
            </span>
          </div>
          <h3 className="font-royal font-bold text-base text-[#f3e5ab] group-hover:text-[#ffdf73] transition">
            Trick Shot Training
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Infinite strikes, trajectory guide calibration, and cushion rebound mastery.
          </p>
          <div className="mt-auto flex items-center gap-1.5 text-xs text-[#64b5f6] font-semibold">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Enter Practice Arena</span>
          </div>
        </button>
      </div>

      {/* Footer Features Bar */}
      <footer className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-[#14151e]/80 rounded-xl border border-[#d4af37]/20 text-xs text-gray-400 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[#ff758f] font-semibold">
            <Crown className="w-3.5 h-3.5" /> 2 Queens Special Rule Active
          </span>
          <span className="hidden sm:inline text-gray-500">•</span>
          <span className="hidden sm:inline text-[#d4af37]">Boric Powder Physics</span>
        </div>

        <div className="text-[11px] text-gray-400">
          Royal Carrom • Made with Precision & Craftsmanship
        </div>
      </footer>
    </div>
  );
};
