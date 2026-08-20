const fs = require('fs');
let code = fs.readFileSync('src/components/xo/XoMenu.tsx', 'utf8');

code = code.replace(
  "onStart: (mode: '1p' | '2p', difficulty?: 'easy' | 'medium' | 'hard') => void;",
  "onStart: (mode: '1p' | '2p', difficulty?: 'easy' | 'medium' | 'hard', gridSize?: number) => void;"
);

code = code.replace(
  "const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');",
  "const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');\n  const [gridSize, setGridSize] = useState<number>(3);"
);

const difficultyBlock = `{mode === '1p' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <h3 className="text-[#f3e5ab] font-bold mb-3 uppercase tracking-wider text-sm">AI Difficulty</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => { soundManager.playButtonClick(); setDifficulty(diff); }}
                  className={\`py-2 px-1 rounded-lg border text-xs sm:text-sm font-bold uppercase transition \${difficulty === diff ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#ffdf73]' : 'bg-[#1a1c26] border-[#d4af37]/30 text-gray-400 hover:bg-[#d4af37]/10'}\`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}`;

const gridSizeBlock = `
        {/* Grid Size Selection */}
        <div className="animate-in fade-in slide-in-from-top-2">
          <h3 className="text-[#f3e5ab] font-bold mb-3 uppercase tracking-wider text-sm">Grid Size</h3>
          <div className="grid grid-cols-5 gap-2">
            {[3, 4, 6, 12, 24].map(size => (
              <button
                key={size}
                onClick={() => { soundManager.playButtonClick(); setGridSize(size); }}
                className={\`py-2 px-1 rounded-lg border text-xs sm:text-sm font-bold transition \${gridSize === size ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#ffdf73]' : 'bg-[#1a1c26] border-[#d4af37]/30 text-gray-400 hover:bg-[#d4af37]/10'}\`}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>
`;

code = code.replace(difficultyBlock, difficultyBlock + gridSizeBlock);

code = code.replace(
  "onStart(mode, mode === '1p' ? difficulty : undefined);",
  "onStart(mode, mode === '1p' ? difficulty : undefined, gridSize);"
);

fs.writeFileSync('src/components/xo/XoMenu.tsx', code);
