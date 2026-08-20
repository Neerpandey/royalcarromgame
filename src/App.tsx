import React, { useState, useEffect } from 'react';
import { GameMode, BotDifficulty, GameSettings, Player } from './types';
import { MainMenu } from './components/MainMenu';
import { GameBoard } from './components/GameBoard';
import { ProfileModal } from './components/ProfileModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { MatchmakingModal } from './components/MatchmakingModal';
import { ColorSelectionPopup } from './components/ColorSelectionPopup';
import { soundManager } from './audio/soundManager';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DEFAULT_SETTINGS: GameSettings = {
  boardTheme: 'royal_emerald',
  strikerSkin: 'imperial_gold',
  gotiTheme: 'classic_ivory_obsidian',
  queenTheme: 'royal_ruby_empress',
  powderLevel: 1.0,
  soundVolume: 0.8,
  soundEnabled: true,
  bgmEnabled: false,
  bgmVolume: 0.3,
  screenShakeEnabled: true,
  enableTurnTimer: true,
  turnTimeSeconds: 30,
  aimGuidelineLength: 'extended',
  queensCount: 2, // 2 Red Queens by default as requested!
  queenPoints: 50, // 50 Points each (Both = 100 Points + 25 Bonus)
  whitePoints: 20,
  blackPoints: 10,
  enableCoinAssignment: true,
  strictFouls: true,
};

interface UserProfile {
  name: string;
  avatar: string;
  score: number;
  queens: number;
  gamesPlayed: number;
  gamesWon: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Maharaja Striker',
  avatar: '👑',
  score: 0,
  queens: 0,
  gamesPlayed: 0,
  gamesWon: 0,
};

export default function App() {
  const [view, setView] = useState<'menu' | 'game'>('menu');
  const [currentMode, setCurrentMode] = useState<GameMode>('vs_bot');
  const [currentBotDifficulty, setCurrentBotDifficulty] = useState<BotDifficulty>('grandmaster');
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Persistent settings & profile with safe local fallback
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('royal_carrom_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queenPoints === 25) parsed.queenPoints = 50;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('royal_carrom_profile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Modals state
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState<boolean>(false);
  const [colorPopupMode, setColorPopupMode] = useState<GameMode | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<{
    isOpen: boolean;
    winner?: Player | { team: number; players: Player[] };
    players: Player[];
  }>({
    isOpen: false,
    players: [],
  });

  // Save settings
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('royal_carrom_settings', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Save profile
  const handleSaveProfile = (name: string, avatar: string) => {
    setProfile((prev) => {
      const updated = { ...prev, name, avatar };
      try {
        localStorage.setItem('royal_carrom_profile', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    if (!nextMuted) soundManager.playButtonClick();
  };

  const [pendingBotDifficulty, setPendingBotDifficulty] = useState<BotDifficulty | undefined>();

  // Configure players setup based on selected mode
  const handleStartGame = (mode: GameMode, botDifficulty?: BotDifficulty) => {
    if ((mode === '1v1' || mode === '2v2') && settings.enableCoinAssignment) {
      setColorPopupMode(mode);
      if (botDifficulty) setPendingBotDifficulty(botDifficulty);
      return;
    }
    startGameWithColors(mode, true, botDifficulty);
  };

  const startGameWithColors = (mode: GameMode, assignColors: boolean, botDifficulty?: BotDifficulty) => {
    setCurrentMode(mode);
    if (botDifficulty) setCurrentBotDifficulty(botDifficulty);

    let playersList: Player[] = [];
    const p1Coin = assignColors ? 'white' : 'any';
    const p2Coin = assignColors ? 'black' : 'any';

    if (mode === 'vs_bot') {
      playersList = [
        {
          id: 'p1',
          name: profile.name,
          avatar: profile.avatar,
          side: 0, // South
          assignedCoin: 'white',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p2-bot',
          name: botDifficulty === 'grandmaster' ? 'Grandmaster AI' : botDifficulty === 'rookie' ? 'Rookie Bot' : 'Maharaja Bot',
          avatar: '🤖',
          side: 2, // North
          assignedCoin: p2Coin,
          isBot: true,
          botDifficulty: botDifficulty || 'maharaja',
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
      ];
    } else if (mode === '1v1') {
      playersList = [
        {
          id: 'p1',
          name: profile.name || 'Player 1',
          avatar: profile.avatar,
          side: 0, // South
          assignedCoin: p1Coin,
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p2',
          name: 'Player 2',
          avatar: '🦁',
          side: 2, // North
          assignedCoin: p2Coin,
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
      ];
    } else if (mode === '3p') {
      playersList = [
        {
          id: 'p1',
          name: profile.name || 'Player 1',
          avatar: profile.avatar,
          side: 0, // South
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p2',
          name: 'Player 2',
          avatar: '🦅',
          side: 1, // East
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p3',
          name: 'Player 3',
          avatar: '🐅',
          side: 2, // North
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
      ];
    } else if (mode === '4p') {
      playersList = [
        {
          id: 'p1',
          name: profile.name || 'Player 1',
          avatar: profile.avatar,
          side: 0, // South
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p2',
          name: 'Player 2',
          avatar: '🦅',
          side: 1, // East
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p3',
          name: 'Player 3',
          avatar: '🐅',
          side: 2, // North
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p4',
          name: 'Player 4',
          avatar: '👑',
          side: 3, // West
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
      ];
    } else if (mode === '2v2') {
      playersList = [
        {
          id: 'p1',
          name: profile.name || 'Player 1',
          avatar: profile.avatar,
          side: 0, // South
          team: 1,
          assignedCoin: p1Coin,
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
        {
          id: 'p2',
          name: 'Player 2',
          avatar: '🦁',
          side: 2, // North
          team: 2,
          assignedCoin: p2Coin,
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        }
      ];
    } else {
      // Practice Mode
      playersList = [
        {
          id: 'practice-player',
          name: 'Practice Mode',
          avatar: '🎯',
          side: 0,
          assignedCoin: 'any',
          isBot: false,
          score: 0,
          coinsPocketed: { white: 0, black: 0, queen: 0 },
          fouls: 0,
          penaltyDues: 0,
          currentQueenNeedsCover: false,
          coveredQueens: 0,
        },
      ];
    }

    setActivePlayers(playersList);
    setVictoryData({ isOpen: false, players: [] });
    setView('game');
  };

  const handleGameOver = (
    winner: Player | { team: number; players: Player[] },
    finalPlayers: Player[]
  ) => {
    // Update player profile stats if playing vs bot or 1v1
    const user = finalPlayers.find((p) => p.id === 'p1');
    if (user) {
      const isWinner =
        'id' in winner
          ? winner.id === 'p1'
          : winner.players.some((p) => p.id === 'p1');

      setProfile((prev) => {
        const updated = {
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: isWinner ? prev.gamesWon + 1 : prev.gamesWon,
          queens: prev.queens + user.coveredQueens,
          score: prev.score + user.score,
        };
        try {
          localStorage.setItem('royal_carrom_profile', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }

    setVictoryData({
      isOpen: true,
      winner,
      players: finalPlayers,
    });
  };

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#0a0a0f] text-[#f3e5ab] font-sans antialiased select-none overflow-hidden flex flex-col">
      {view === 'menu' ? (
        <MainMenu
          settings={settings}
          onStartGame={handleStartGame}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onToggleSound={handleToggleSound}
          isMuted={isMuted}
          userProfile={profile}
          onOpenMatchmaking={() => setIsMatchmakingOpen(true)}
          canInstall={!!deferredPrompt}
          onInstallClick={async () => {
            if (!deferredPrompt) return;
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') {
              setDeferredPrompt(null);
            }
          }}
        />
      ) : (
        <GameBoard
          key={`game-${currentMode}-${activePlayers.length}`}
          mode={currentMode}
          players={activePlayers}
          settings={settings}
          onExitToMenu={() => setView('menu')}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGameOver={handleGameOver}
        />
      )}

      {/* Global Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <MatchmakingModal
        isOpen={isMatchmakingOpen}
        onClose={() => setIsMatchmakingOpen(false)}
        onStartMatch={(mode) => {
          setIsMatchmakingOpen(false);
          handleStartGame(mode);
        }}
      />

      <ColorSelectionPopup
        isOpen={colorPopupMode !== null}
        mode={colorPopupMode}
        onClose={() => setColorPopupMode(null)}
        onSelect={(assignColors) => {
          if (colorPopupMode) {
            startGameWithColors(colorPopupMode, assignColors, pendingBotDifficulty);
            setColorPopupMode(null);
          }
        }}
      />

      <VictoryModal
        isOpen={victoryData.isOpen}
        winner={victoryData.winner}
        players={victoryData.players}
        onRematch={() => handleStartGame(currentMode, currentBotDifficulty)}
        onExitToMenu={() => {
          setVictoryData({ isOpen: false, players: [] });
          setView('menu');
        }}
      />
    </div>
  );
}
