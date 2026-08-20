const fs = require('fs');
let code = fs.readFileSync('src/components/HomeHub.tsx', 'utf8');

code = code.replace("import { Play, Sparkles, Crown } from 'lucide-react';", "import { Play, Sparkles, Crown, Gem } from 'lucide-react';");

const oldBadge = `<div className="absolute top-0 right-0 p-4 z-20">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1c24]/90 border border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.4)] animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] font-black tracking-widest uppercase text-[#f3e5ab]">NEW MODE</span>
             </div>
          </div>`;

const newBadge = `<div className="absolute top-0 right-0 p-4 z-20 flex flex-col gap-2 items-end">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#d4af37] to-[#aa8022] border border-[#ffdf73] shadow-[0_0_20px_rgba(212,175,55,0.6)] animate-pulse">
                <Gem className="w-4 h-4 text-[#0a0a0f]" fill="currentColor" />
                <span className="text-[11px] font-black tracking-widest uppercase text-[#0a0a0f]">PREMIUM</span>
             </div>
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1c24]/90 border border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] font-black tracking-widest uppercase text-[#f3e5ab]">NEW MODE</span>
             </div>
          </div>`;

code = code.replace(oldBadge, newBadge);
fs.writeFileSync('src/components/HomeHub.tsx', code);
