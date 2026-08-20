const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const [xoMode, setXoMode] = useState<'1p'|'2p'>('1p');",
  "const [xoMode, setXoMode] = useState<'1p'|'2p'>('1p');\n  const [xoGridSize, setXoGridSize] = useState<number>(3);"
);

code = code.replace(
  "onStart={(m, diff) => {\n            setXoMode(m);\n            setXoDifficulty(diff);\n            setView('xo_game');\n          }}",
  "onStart={(m, diff, size) => {\n            setXoMode(m);\n            setXoDifficulty(diff);\n            setXoGridSize(size || 3);\n            setView('xo_game');\n          }}"
);

code = code.replace(
  "<XoBoard\n          mode={xoMode}\n          difficulty={xoDifficulty}\n          onBack={() => setView('xo_menu')}\n        />",
  "<XoBoard\n          mode={xoMode}\n          difficulty={xoDifficulty}\n          gridSize={xoGridSize}\n          onBack={() => setView('xo_menu')}\n        />"
);

fs.writeFileSync('src/App.tsx', code);
