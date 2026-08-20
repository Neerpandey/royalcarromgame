const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

type Player = 'X' | 'O' | null;
type Difficulty = 'easy' | 'medium' | 'hard';
type Mode = '1p' | '2p';

interface XoBoardProps {
  mode: Mode;
  difficulty?: Difficulty;
  gridSize?: number;
  onBack: () => void;
}

export const XoBoard: React.FC<XoBoardProps> = ({ mode, difficulty, gridSize = 3, onBack }) => {
  const totalSquares = gridSize * gridSize;
  const winLength = Math.min(5, gridSize); // Connect 3, 4, or 5

  const [board, setBoard] = useState<Player[]>(Array(totalSquares).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const playMoveSound = (player: 'X' | 'O') => {
    if (player === 'X') soundManager.playWoodStrike(1);
    else soundManager.playCushionHit(1);
  };

  const checkWinner = (squares: Player[]) => {
    for (let i = 0; i < totalSquares; i++) {
      if (!squares[i]) continue;
      const player = squares[i];
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      const directions = [
        [0, 1],   // Right
        [1, 0],   // Down
        [1, 1],   // Down-Right
        [1, -1],  // Down-Left
      ];

      for (let [dRow, dCol] of directions) {
        let isWinningLine = true;
        const line = [i];
        for (let step = 1; step < winLength; step++) {
          const nRow = row + dRow * step;
          const nCol = col + dCol * step;
          if (nRow < 0 || nRow >= gridSize || nCol < 0 || nCol >= gridSize) {
            isWinningLine = false;
            break;
          }
          const nIndex = nRow * gridSize + nCol;
          if (squares[nIndex] !== player) {
            isWinningLine = false;
            break;
          }
          line.push(nIndex);
        }
        if (isWinningLine) {
          return { winner: player, line };
        }
      }
    }
    if (!squares.includes(null)) return { winner: 'Draw', line: null };
    return null;
  };

  // Score a potential move (Heuristic AI for larger grids)
  const scoreMove = (squares: Player[], moveIndex: number, player: 'X' | 'O') => {
    const original = squares[moveIndex];
    squares[moveIndex] = player;
    const res = checkWinner(squares);
    squares[moveIndex] = original;
    if (res?.winner === player) return 10000; // Immediate win
    return 0;
  };

  const getBestMoveLargeGrid = (squares: Player[]): number => {
    let move = -1;
    const available = squares.map((sq, i) => sq === null ? i : null).filter(val => val !== null) as number[];
    if (available.length === 0) return -1;

    // Easy: Random
    if (difficulty === 'easy') {
      return available[Math.floor(Math.random() * available.length)];
    }

    // Check if AI can win
    for (let i of available) {
      if (scoreMove(squares, i, 'O') >= 10000) return i;
    }
    
    // Check if Player can win (Block)
    for (let i of available) {
      if (scoreMove(squares, i, 'X') >= 10000) return i;
    }

    // Medium: Random if no immediate threat
    if (difficulty === 'medium' && Math.random() > 0.5) {
      return available[Math.floor(Math.random() * available.length)];
    }

    // Fallback: Pick a square near existing pieces
    let bestScore = -Infinity;
    for (let i of available) {
      let score = 0;
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      // Closer to center is slightly better
      const centerDist = Math.abs(row - gridSize/2) + Math.abs(col - gridSize/2);
      score -= centerDist * 0.1;

      // Adjacent to own or enemy pieces
      for (let r = Math.max(0, row - 1); r <= Math.min(gridSize - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(gridSize - 1, col + 1); c++) {
          const idx = r * gridSize + c;
          if (squares[idx] === 'O') score += 2;
          else if (squares[idx] === 'X') score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
    return move !== -1 ? move : available[Math.floor(Math.random() * available.length)];
  };

  // Minimax for 3x3 only
  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    if (result?.winner === 'O') return 10 - depth;
    if (result?.winner === 'X') return depth - 10;
    if (result?.winner === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          bestScore = Math.max(minimax(squares, depth + 1, false), bestScore);
          squares[i] = null;
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          bestScore = Math.min(minimax(squares, depth + 1, true), bestScore);
          squares[i] = null;
        }
      }
      return bestScore;
    }
  };

  const getBestMove3x3 = (squares: Player[]): number => {
    let bestScore = -Infinity;
    let move = -1;
    const useMinimax = difficulty === 'hard' || (difficulty === 'medium' && Math.random() > 0.5);

    if (useMinimax) {
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          let score = minimax(squares, 0, false);
          squares[i] = null;
          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
    } else {
      const available = squares.map((sq, i) => sq === null ? i : null).filter(val => val !== null) as number[];
      if (available.length > 0) move = available[Math.floor(Math.random() * available.length)];
    }
    return move;
  };

  useEffect(() => {
    const result = checkWinner(board);
    if (result) {
      setWinner(result.winner as Player | 'Draw');
      setWinningLine(result.line);
      if (result.winner !== 'Draw') {
        soundManager.playWinFanfare();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: result.winner === 'X' ? ['#d4af37', '#ffdf73'] : ['#ffffff', '#a1a1aa']
        });
      }
      // Auto restart after a few seconds
      const restartTimer = setTimeout(() => {
        resetGame();
      }, 4000);
      return () => clearTimeout(restartTimer);
    }

    if (mode === '1p' && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        const move = gridSize === 3 ? getBestMove3x3([...board]) : getBestMoveLargeGrid([...board]);
        if (move !== -1) {
          handleMove(move, 'O');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [board, xIsNext, winner, mode]);

  const handleMove = (index: number, player: 'X' | 'O') => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);
    playMoveSound(player);
    setXIsNext(player === 'O');
  };

  const onSquareClick = (index: number) => {
    if (mode === '1p' && !xIsNext) return;
    handleMove(index, xIsNext ? 'X' : 'O');
  };

  const resetGame = () => {
    soundManager.playButtonClick();
    setBoard(Array(totalSquares).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const renderSquare = (i: number) => {
    const isWinningSquare = winningLine?.includes(i);
    const value = board[i];
    
    // Dynamic styles based on grid size
    const fontSize = \`calc((min(90vw, 600px) / \${gridSize}) * 0.6)\`;

    return (
      <button
        key={i}
        onClick={() => onSquareClick(i)}
        disabled={!!value || !!winner || (mode === '1p' && !xIsNext)}
        className={\`flex items-center justify-center rounded-md sm:rounded-xl bg-[#1b1c24]/80 backdrop-blur-sm border transition-all duration-300 shadow-inner w-full h-full
          \${!value && !winner && !(mode === '1p' && !xIsNext) ? 'hover:bg-[#202434] cursor-pointer hover:border-[#d4af37]/50 hover:shadow-[inset_0_0_15px_rgba(212,175,55,0.1)]' : 'cursor-default'}
          \${isWinningSquare ? 'border-[#d4af37] bg-[#2a2212]/80 shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105 z-10' : 'border-[#d4af37]/20'}
        \`}
      >
        {value === 'X' && (
          <div style={{ fontSize }} className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[#f3e5ab] to-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.8)] filter brightness-125 animate-in zoom-in-50 duration-300 leading-none">
            X
          </div>
        )}
        {value === 'O' && (
          <div style={{ fontSize }} className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] to-[#a1a1aa] drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] filter brightness-125 animate-in zoom-in-50 duration-300 leading-none">
            O
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-4 sm:p-8 animate-in fade-in duration-500 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-opacity-5">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 z-10 shrink-0">
        <button 
          onClick={() => { soundManager.playButtonClick(); onBack(); }}
          className="flex items-center gap-2 text-[#d4af37] hover:text-[#ffdf73] transition px-3 py-1.5 rounded-lg bg-[#1a1c26] border border-[#d4af37]/30 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold text-sm hidden sm:inline">Menu</span>
        </button>

        <div className="flex flex-col items-center">
           <h1 className="font-royal text-xl sm:text-3xl font-black tracking-widest gold-gradient-text">ROYAL X/O</h1>
           <span className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">
             {gridSize}x{gridSize} • {mode === '1p' ? \`VS AI (\${difficulty})\` : '2 Players'}
           </span>
        </div>

        <button 
          onClick={resetGame}
          className="flex items-center gap-2 text-[#d4af37] hover:text-[#ffdf73] transition px-3 py-1.5 rounded-lg bg-[#1a1c26] border border-[#d4af37]/30 shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="font-bold text-sm hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Auto-Restart Winner Overlay */}
      {winner && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
           <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b from-[#2a2212] to-[#151722] border-2 border-[#d4af37] shadow-[0_0_50px_rgba(212,175,55,0.4)] transform scale-110 animate-in zoom-in-75 duration-500">
             {winner === 'Draw' ? (
                <h2 className="text-4xl sm:text-6xl font-black text-[#ffdf73] tracking-widest uppercase mb-4">DRAW</h2>
             ) : (
                <>
                  <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-[#d4af37] mb-4 animate-bounce" />
                  <h2 className="text-5xl sm:text-7xl font-black tracking-widest uppercase drop-shadow-2xl">
                    <span className={winner === 'X' ? 'text-transparent bg-clip-text bg-gradient-to-br from-[#f3e5ab] to-[#d4af37]' : 'text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] to-[#a1a1aa]'}>
                      {winner}
                    </span>
                    <span className="text-white ml-4">WINS</span>
                  </h2>
                </>
             )}
             <p className="mt-6 text-[#a1a1aa] font-bold tracking-widest text-sm animate-pulse">Auto-restarting...</p>
           </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-12 flex items-center justify-center mb-4 z-10 shrink-0">
        {!winner && (
          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-[#1a1c26]/80 border border-[#d4af37]/30">
             <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Turn:</span>
             <span className={\`text-xl font-black \${xIsNext ? 'text-transparent bg-clip-text bg-gradient-to-br from-[#f3e5ab] to-[#d4af37]' : 'text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] to-[#a1a1aa]'}\`}>
               {xIsNext ? 'X' : 'O'}
             </span>
             {mode === '1p' && !xIsNext && <span className="ml-2 text-xs text-[#a1a1aa] animate-pulse">Thinking...</span>}
          </div>
        )}
      </div>

      {/* Game Board Container */}
      <div className="relative z-10 bg-gradient-to-br from-[#12141c] to-[#0a0a0f] p-3 sm:p-5 rounded-3xl border border-[#d4af37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-1 w-full max-w-[90vw] max-h-[90vw] sm:max-w-[600px] sm:max-h-[600px] aspect-square flex items-center justify-center">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(212,175,55,0.05)_2px,transparent_2px)] bg-[size:33.33%_33.33%] rounded-3xl pointer-events-none"></div>
         
         <div 
           className="w-full h-full relative"
           style={{ 
             display: 'grid', 
             gridTemplateColumns: \`repeat(\${gridSize}, minmax(0, 1fr))\`,
             gridTemplateRows: \`repeat(\${gridSize}, minmax(0, 1fr))\`,
             gap: gridSize > 10 ? '2px' : gridSize > 5 ? '4px' : '8px'
           }}
         >
           {board.map((_, i) => renderSquare(i))}
         </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/xo/XoBoard.tsx', content);
