const fs = require('fs');
let code = fs.readFileSync('src/components/GameBoard.tsx', 'utf8');

const regex = /\{\/\* Audio \& Settings Buttons \*\/\}[\s\S]*?<\/header>/m;

const replacement = `{/* Audio & Settings Buttons - Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            id="carrom-bgm-toggle-btn"
            onClick={() => {
              const nextBgm = !isBgmActive;
              setIsBgmActive(nextBgm);
              soundManager.toggleBGM(nextBgm);
              soundManager.playButtonClick();
            }}
            className={\`p-1.5 sm:p-2 rounded-lg transition border active:scale-95 cursor-pointer \${
              isBgmActive
                ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#ffdf73]'
                : 'bg-[#232738] border-[#d4af37]/20 text-gray-400 hover:text-[#d4af37]'
            }\`}
            title="Tanpura Drone Ambient BGM"
          >
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            id="carrom-sound-toggle-btn"
            onClick={toggleSound}
            className="p-1.5 sm:p-2 rounded-lg bg-[#232738] hover:bg-[#2d3248] text-[#d4af37] transition border border-[#d4af37]/20 active:scale-95 cursor-pointer"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <button
            id="carrom-rules-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onOpenRules();
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-[#232738] hover:bg-[#2d3248] text-[#d4af37] transition border border-[#d4af37]/20 active:scale-95 cursor-pointer"
            title="Rules & How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            id="carrom-settings-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onOpenSettings();
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-[#232738] hover:bg-[#2d3248] text-[#d4af37] transition border border-[#d4af37]/20 active:scale-95 cursor-pointer"
            title="Settings & Themes"
          >
            <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        
        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center">
          <button 
            className="p-1.5 text-[#d4af37] bg-[#232738] border border-[#d4af37]/20 rounded-lg cursor-pointer"
            onClick={() => { soundManager.playButtonClick(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>
      
      {/* Mobile Menu Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-[48px] right-2 w-[180px] bg-[#171923]/95 backdrop-blur-xl border border-[#d4af37]/30 rounded-xl flex flex-col py-2 gap-1 z-50 shadow-2xl animate-in slide-in-from-top-2">
          <button onClick={() => { 
            const nextBgm = !isBgmActive;
            setIsBgmActive(nextBgm);
            soundManager.toggleBGM(nextBgm);
            soundManager.playButtonClick();
          }} className="flex items-center gap-3 px-4 py-2 hover:bg-[#202434] transition">
            <Music className={\`w-4 h-4 \${isBgmActive ? 'text-[#d4af37]' : 'text-gray-400'}\`} />
            <span className={\`text-xs font-bold \${isBgmActive ? 'text-[#f3e5ab]' : 'text-gray-400'}\`}>Ambient BGM</span>
          </button>
          <button onClick={toggleSound} className="flex items-center gap-3 px-4 py-2 hover:bg-[#202434] transition">
            {isMuted ? <VolumeX className="w-4 h-4 text-[#d4af37]" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
            <span className="text-xs font-bold text-[#f3e5ab]">SFX Sound</span>
          </button>
          <button onClick={() => { soundManager.playButtonClick(); onOpenRules(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-[#202434] transition">
            <HelpCircle className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-bold text-[#f3e5ab]">Rules</span>
          </button>
          <button onClick={() => { soundManager.playButtonClick(); onOpenSettings(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-[#202434] transition">
            <SettingsIcon className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-bold text-[#f3e5ab]">Settings</span>
          </button>
        </div>
      )}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/GameBoard.tsx', code);
console.log("Updated GameBoard");
