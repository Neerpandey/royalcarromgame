const fs = require('fs');
let code = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

const navReplacement = `  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

      {/* Hero Title Section */}`;

// Regex to replace everything from "return (" down to "{/* Hero Title Section */}"
code = code.replace(/return \(\s*<div className="relative h-\[100dvh\] min-h-\[100dvh\] w-full flex flex-col items-center justify-between p-3 sm:p-5 bg-\[#0a0a0f\] text-\[#f3e5ab\] overflow-y-auto overflow-x-hidden wood-pattern">[\s\S]*?\{\/\* Hero Title Section \*\/\}/m, navReplacement);

fs.writeFileSync('src/components/MainMenu.tsx', code);
console.log("Updated MainMenu");
