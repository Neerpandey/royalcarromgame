import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  Piece,
  Player,
  GameSettings,
  TurnNotification,
} from '../types';
import {
  createInitialPieces,
  createStriker,
  getLegalStrikerBounds,
  isStrikerPositionValid,
  stepPhysics,
  returnPieceToCenter,
} from '../physics/carromEngine';
import { computeAIShot } from '../physics/botAI';
import { CarromCanvas } from './CarromCanvas';
import { BOARD_THEMES, STRIKER_SKINS, GOTI_THEMES, QUEEN_THEMES, BASELINES, BOARD_SIZE, STRIKER_RADIUS } from '../data/carromConstants';
import { soundManager } from '../audio/soundManager';
import { QueenCinematicOverlay, QueenCinematicEvent } from './QueenCinematicOverlay';
import {
  Volume2,
  VolumeX,
  Menu,
  X,
  Zap,
  ArrowLeft,
  Crown,
  HelpCircle,
  Settings as SettingsIcon,
  Sliders,
  Bot,
  Music,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameBoardProps {
  mode: GameMode;
  players: Player[];
  settings: GameSettings;
  onExitToMenu: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onGameOver: (winner: Player | { team: number; players: Player[] }, finalPlayers: Player[]) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  mode,
  players: initialPlayers,
  settings,
  onExitToMenu,
  onOpenRules,
  onOpenSettings,
  onGameOver,
}) => {
  const [players, setPlayers] = useState<Player[]>(() =>
    initialPlayers.map((p) => ({
      ...p,
      totalShots: p.totalShots || 0,
      successfulShots: p.successfulShots || 0,
      currentCombo: p.currentCombo || 0,
      highestCombo: p.highestCombo || 0,
    }))
  );
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [, setTurnNumber] = useState<number>(1);
  const [status, setStatus] = useState<
    'placement' | 'aiming' | 'shooting' | 'animating' | 'turn_end' | 'game_over'
  >('placement');

  const [pieces, setPieces] = useState<Piece[]>(() => createInitialPieces(settings.queensCount));
  const [striker, setStriker] = useState<Piece>(() => createStriker(initialPlayers[0].side, 0.5));
  const [aimAngle, setAimAngle] = useState<number>(BASELINES[initialPlayers[0].side].aimDirection);
  const [aimPower, setAimPower] = useState<number>(50); // 0 to 100
  const [strikerPlacementRatio, setStrikerPlacementRatio] = useState<number>(0.5);

  const [notifications, setNotifications] = useState<TurnNotification[]>([]);
  const [queenCinematicEvent, setQueenCinematicEvent] = useState<QueenCinematicEvent | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(settings.turnTimeSeconds);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isBgmActive, setIsBgmActive] = useState<boolean>(settings.bgmEnabled);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  const isDraggingPlacement = useRef<boolean>(false);
  const isDraggingAim = useRef<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragCurrentDist = useRef<number>(0);
  const shotPocketedPieces = useRef<Piece[]>([]);
  const shotHitPieceIds = useRef<string[]>([]);
  const aiTimeoutRef = useRef<number | null>(null);
  const [aiThinkingText, setAiThinkingText] = useState<string>('');

  const activePlayer = players[activePlayerIndex];
  const currentTheme = BOARD_THEMES.find((t) => t.id === settings.boardTheme) || BOARD_THEMES[0];
  const currentSkin = STRIKER_SKINS.find((s) => s.id === settings.strikerSkin) || STRIKER_SKINS[0];
  const currentGotiTheme = GOTI_THEMES.find((g) => g.id === settings.gotiTheme) || GOTI_THEMES[0];
  const currentQueenTheme = QUEEN_THEMES.find((q) => q.id === settings.queenTheme) || QUEEN_THEMES[0];

  const triggerScreenShake = useCallback(() => {
    if (!settings.screenShakeEnabled) return;
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 260);
  }, [settings.screenShakeEnabled]);

  // Helper to add toast notification
  const addNotification = useCallback((text: string, type: TurnNotification['type'], subtext?: string) => {
    const newNotif: TurnNotification = {
      id: Math.random().toString(),
      text,
      type,
      subtext,
    };
    setNotifications((prev) => [...prev.slice(-2), newNotif]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 2800);
  }, []);

  // Update striker position along baseline based on ratio
  const updateStrikerPosition = useCallback(
    (ratio: number) => {
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      setStrikerPlacementRatio(clampedRatio);
      const side = activePlayer.side;
      const bounds = getLegalStrikerBounds(side);

      setStriker((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        if (bounds.isVertical) {
          newX = bounds.fixedPos;
          newY = bounds.min + (bounds.max - bounds.min) * clampedRatio;
        } else {
          newX = bounds.min + (bounds.max - bounds.min) * clampedRatio;
          newY = bounds.fixedPos;
        }
        return {
          ...prev,
          x: newX,
          y: newY,
          vx: 0,
          vy: 0,
          isPocketed: false,
          pocketProgress: 0,
        };
      });
    },
    [activePlayer.side]
  );

  // Turn reset / initialize for current active player
  const setupTurnForPlayer = useCallback(
    (playerIdx: number) => {
      const player = players[playerIdx];
      setActivePlayerIndex(playerIdx);
      const baseline = BASELINES[player.side];
      setAimAngle(baseline.aimDirection);
      setAimPower(50);
      setStrikerPlacementRatio(0.5);
      setTurnTimeLeft(settings.turnTimeSeconds);
      setAiThinkingText('');

      // Create new striker for this player's side
      const freshStriker = createStriker(player.side, 0.5);
      setStriker(freshStriker);
      setStatus('placement');
      shotPocketedPieces.current = [];
      shotHitPieceIds.current = [];

      // Check if this player needs to cover a queen
      if (player.currentQueenNeedsCover) {
        addNotification(`${player.name}: Must Pocket A Coin To Cover Queen!`, 'queen', '👑 Queen at Stake');
      }
    },
    [players, settings.turnTimeSeconds, addNotification]
  );

  // AI Bot automated shot flow (100% Client-Side Pure Physics Raycasting - Ultra Fast & Responsive)
  useEffect(() => {
    if (activePlayer.isBot && status === 'placement') {
      setStatus('aiming');
      setAiThinkingText(`${activePlayer.name} aiming...`);

      // Ultra-Fast local AI calculations (no external API calls needed)
      aiTimeoutRef.current = window.setTimeout(() => {
        const plan = computeAIShot(activePlayer, pieces, activePlayer.botDifficulty || 'maharaja');

        // Position striker immediately
        setStriker((prev) => ({
          ...prev,
          x: plan.strikerPos.x,
          y: plan.strikerPos.y,
        }));
        setAimAngle(plan.angle);
        setAimPower(plan.power);
        soundManager.playPlacementTick();
        setAiThinkingText(plan.isBankShot ? '⚡ Fast Bank Shot' : '🎯 Target Locked');

        // Rapid strike release in 220ms
        aiTimeoutRef.current = window.setTimeout(() => {
          setAiThinkingText('');
          executeStrike(plan.angle, plan.power, plan.strikerPos);
        }, 220);
      }, 140);
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [activePlayerIndex, status]);

  // Turn timer countdown
  useEffect(() => {
    if (!settings.enableTurnTimer || status === 'animating' || status === 'game_over') return;

    const timer = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          addNotification('Turn Time Expired!', 'foul');
          handleTurnTimeout();
          return settings.turnTimeSeconds;
        }
        if (prev <= 6 && prev > 1) {
          soundManager.playTimerTick(prev);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.enableTurnTimer, status, activePlayerIndex]);

  const returnPendingQueens = (
    player: Player,
    piecesList: Piece[],
    reasonMessage: string
  ) => {
    const qIds =
      player.pendingQueenIds && player.pendingQueenIds.length > 0
        ? player.pendingQueenIds
        : player.pendingQueenId
        ? [player.pendingQueenId]
        : [];

    let returnedCount = 0;
    if (qIds.length > 0) {
      for (const qId of qIds) {
        const queenPiece = piecesList.find((p) => p.id === qId);
        if (queenPiece) {
          returnPieceToCenter(queenPiece, piecesList);
          returnedCount++;
        }
      }
    } else {
      // Fallback: return the first pocketed queen piece
      const queenPiece = piecesList.find((p) => p.type === 'queen' && p.isPocketed);
      if (queenPiece) {
        returnPieceToCenter(queenPiece, piecesList);
        returnedCount++;
      }
    }

    player.currentQueenNeedsCover = false;
    player.pendingQueenId = undefined;
    player.pendingQueenIds = [];

    if (returnedCount > 0) {
      setQueenCinematicEvent({
        type: 'lost',
        playerName: player.name,
        message: reasonMessage,
      });
      addNotification(`QUEEN LOST: ${reasonMessage}`, 'cover_failed', 'Returned to center');
    }
  };

  const handleTurnTimeout = () => {
    const updatedPlayers = [...players];
    const curPlayer = { ...updatedPlayers[activePlayerIndex] };

    // If player had a pending queen cover, return the queen to center!
    if (curPlayer.currentQueenNeedsCover) {
      returnPendingQueens(curPlayer, pieces, 'Turn Time Expired (No Cover)');
      soundManager.playFoulSound();
      setPieces([...pieces]);
    }

    updatedPlayers[activePlayerIndex] = curPlayer;
    setPlayers(updatedPlayers);

    // Switch to next player on timeout
    const nextIdx = (activePlayerIndex + 1) % players.length;
    setupTurnForPlayer(nextIdx);
  };

  // Execute Strike with velocity impulse
  const executeStrike = (angle: number, power: number, overrideStrikerPos?: { x: number; y: number }) => {
    if (status === 'animating') return;

    const currentStrikerPos = overrideStrikerPos || { x: striker.x, y: striker.y };

    // Check legal non-overlapping striker position
    const testStriker: Piece = {
      ...striker,
      x: currentStrikerPos.x,
      y: currentStrikerPos.y,
    };

    const validity = isStrikerPositionValid(testStriker, pieces);
    if (!validity.valid && !activePlayer.isBot) {
      addNotification(validity.reason || 'Invalid striker position!', 'foul');
      soundManager.playFoulSound();
      return;
    }

    // Update player shot stats
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === activePlayerIndex ? { ...p, totalShots: (p.totalShots || 0) + 1 } : p
      )
    );

    if (power > 80) {
      triggerScreenShake();
    }

    // Convert power (0-100) to physical velocity impulse
    const impulseSpeed = 6 + (power / 100) * 22;
    const vx = Math.cos(angle) * impulseSpeed;
    const vy = Math.sin(angle) * impulseSpeed;

    soundManager.playStrikerRelease(power / 100);

    setStriker((prev) => ({
      ...prev,
      x: currentStrikerPos.x,
      y: currentStrikerPos.y,
      vx,
      vy,
      isPocketed: false,
      pocketProgress: 0,
    }));

    setStatus('animating');
    shotPocketedPieces.current = [];
    shotHitPieceIds.current = [];
  };

  // Physics animation loop
  useEffect(() => {
    if (status !== 'animating') return;

    let animFrame: number;

    const loop = () => {
      // Step pieces & striker together in one physics simulation batch
      const combinedPieces = [...pieces, striker];
      const result = stepPhysics(combinedPieces, settings.powderLevel, 1 / 60);

      // Separate updated pieces and striker
      const updatedStriker = combinedPieces[combinedPieces.length - 1];
      const updatedPieces = combinedPieces.slice(0, combinedPieces.length - 1);

      // Check high impact collisions for screen shake
      if (result.highImpactEvents && result.highImpactEvents.length > 0) {
        triggerScreenShake();
      }

      // Record any newly pocketed items during this shot
      if (result.pocketedEvents.length > 0) {
        for (const p of result.pocketedEvents) {
          if (!shotPocketedPieces.current.some((existing) => existing.id === p.id)) {
            shotPocketedPieces.current.push(p);
          }
        }
      }

      // Record any pieces hit by striker
      if (result.strikerHitPieceIds && result.strikerHitPieceIds.length > 0) {
        for (const id of result.strikerHitPieceIds) {
          if (!shotHitPieceIds.current.includes(id)) {
            shotHitPieceIds.current.push(id);
          }
        }
      }

      setPieces(updatedPieces);
      setStriker(updatedStriker);

      if (result.isMoving) {
        animFrame = requestAnimationFrame(loop);
      } else {
        // All motion stopped: evaluate turn outcome!
        evaluateTurnOutcome(shotPocketedPieces.current, updatedStriker, updatedPieces, shotHitPieceIds.current);
      }
    };

    animFrame = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animFrame);
  }, [status, pieces, striker, settings.powderLevel, triggerScreenShake]);

  // Turn Outcome Evaluation with Queen Cover & Scoring
  const evaluateTurnOutcome = (
    pocketedThisShot: Piece[],
    finalStriker: Piece,
    currentPieces: Piece[],
    hitPieceIds: string[]
  ) => {
    setStatus('turn_end');

    const updatedPlayers = [...players];
    const curPlayer = { ...updatedPlayers[activePlayerIndex] };
    const assignedCoin = curPlayer.assignedCoin || 'any';

    const strikerPocketed = finalStriker.isPocketed;
    const pocketedCoins = pocketedThisShot.filter((p) => p.id !== finalStriker.id);

    let pointsThisTurn = 0;
    let ownCoinsSunk = 0;
    let opponentCoinsSunk = 0;
    let queenSunk = 0;
    let whiteSunk = 0;
    let blackSunk = 0;
    let extraTurnEarned = false;

    // 1. Check Striker Foul (Scratch / Pocketed Striker)
    if (strikerPocketed) {
      soundManager.playFoulSound();
      curPlayer.fouls += 1;
      curPlayer.currentCombo = 0;

      // Dynamic Foul Points Deduction: >=100 pts -> -30 pts, >=50 pts -> -20 pts, <50 pts -> -10 pts
      const ptsToDeduct =
        curPlayer.score >= 100 ? 30 : curPlayer.score >= 50 ? 20 : Math.min(10, curPlayer.score);
      curPlayer.score = Math.max(0, curPlayer.score - ptsToDeduct);

      // Penalty: Return 1 own pocketed coin to center if available
      const ownPocketed = currentPieces.filter(
        (p) => p.isPocketed && p.type !== 'queen' && (assignedCoin === 'any' || p.type === assignedCoin)
      );

      if (ownPocketed.length > 0) {
        const coinToReturn = ownPocketed[0];
        returnPieceToCenter(coinToReturn, currentPieces);
        if (coinToReturn.type === 'white') {
          curPlayer.coinsPocketed.white = Math.max(0, (curPlayer.coinsPocketed.white || 0) - 1);
        } else if (coinToReturn.type === 'black') {
          curPlayer.coinsPocketed.black = Math.max(0, (curPlayer.coinsPocketed.black || 0) - 1);
        }
        addNotification(
          `FOUL! Striker Pocketed (-${ptsToDeduct} Pts)`,
          'foul',
          'Penalty: 1 coin returned to center'
        );
      } else {
        // Penalty due: player owes 1 piece when pocketed in future
        curPlayer.penaltyDues = (curPlayer.penaltyDues || 0) + 1;
        addNotification(
          `FOUL! Striker Pocketed (-${ptsToDeduct} Pts)`,
          'foul',
          'Due Recorded: Next pocketed coin will return to center'
        );
      }

      // If fouled while needing cover or pocketed queen on scratch, return pending queen to center
      if (curPlayer.currentQueenNeedsCover) {
        returnPendingQueens(curPlayer, currentPieces, 'Striker Scratch on Cover Attempt');
      }

      // If queen was sunk on this scratching shot, it must also return to center
      const scratchQueens = pocketedCoins.filter((p) => p.type === 'queen');
      for (const sq of scratchQueens) {
        returnPieceToCenter(sq, currentPieces);
      }

      updatedPlayers[activePlayerIndex] = curPlayer;
      setPlayers(updatedPlayers);
      setPieces([...currentPieces]);
      endTurnAndSwitchPlayer(updatedPlayers, currentPieces, false);
      return;
    }

    // 2. Check Strict Foul: No pieces hit at all
    if (settings.strictFouls && hitPieceIds.length === 0) {
      soundManager.playFoulSound();
      const ptsToDeduct =
        curPlayer.score >= 100 ? 30 : curPlayer.score >= 50 ? 20 : Math.min(10, curPlayer.score);
      curPlayer.score = Math.max(0, curPlayer.score - ptsToDeduct);
      addNotification(`FOUL! No Pieces Hit (-${ptsToDeduct} Pts)`, 'foul', 'Missed shot penalty');
      curPlayer.fouls += 1;
      curPlayer.currentCombo = 0;

      if (curPlayer.currentQueenNeedsCover) {
        returnPendingQueens(curPlayer, currentPieces, 'No pieces hit on cover');
      }

      updatedPlayers[activePlayerIndex] = curPlayer;
      setPlayers(updatedPlayers);
      setPieces([...currentPieces]);
      endTurnAndSwitchPlayer(updatedPlayers, currentPieces, false);
      return;
    }

    // 3. Process Pocketed Coins (White 20 pts, Black 10 pts)
    for (const p of pocketedCoins) {
      if (p.type === 'queen') {
        queenSunk++;
      } else if (p.type === 'white') {
        whiteSunk++;
        if (assignedCoin === 'white' || assignedCoin === 'any') {
          ownCoinsSunk++;
          pointsThisTurn += settings.whitePoints; // 20 pts
          curPlayer.coinsPocketed.white += 1;
        } else {
          opponentCoinsSunk++;
          awardOpponentPoints(updatedPlayers, 'white', settings.whitePoints);
        }
      } else if (p.type === 'black') {
        blackSunk++;
        if (assignedCoin === 'black' || assignedCoin === 'any') {
          ownCoinsSunk++;
          pointsThisTurn += settings.blackPoints; // 10 pts
          curPlayer.coinsPocketed.black += 1;
        } else {
          opponentCoinsSunk++;
          awardOpponentPoints(updatedPlayers, 'black', settings.blackPoints);
        }
      }
    }

    // Opponent Coin Pocketed Foul in Assigned Mode
    if (opponentCoinsSunk > 0 && assignedCoin !== 'any') {
      soundManager.playFoulSound();
      const ptsToDeduct =
        curPlayer.score >= 100 ? 30 : curPlayer.score >= 50 ? 20 : Math.min(10, curPlayer.score);
      curPlayer.score = Math.max(0, curPlayer.score - ptsToDeduct);
      curPlayer.fouls += 1;
      curPlayer.currentCombo = 0;
      addNotification(
        `FOUL! Opponent's Coin Pocketed (-${ptsToDeduct} Pts)`,
        'foul',
        'Turn Ended: No Extra Strike for Opponent Coin'
      );

      const ownPocketed = currentPieces.filter(
        (p) => p.isPocketed && p.type !== 'queen' && p.type === assignedCoin
      );
      if (ownPocketed.length > 0) {
        returnPieceToCenter(ownPocketed[0], currentPieces);
        curPlayer.coinsPocketed[assignedCoin] = Math.max(
          0,
          (curPlayer.coinsPocketed[assignedCoin] || 0) - 1
        );
        addNotification(`Penalty: 1 Own Coin Returned to Center`, 'foul');
      } else {
        curPlayer.penaltyDues = (curPlayer.penaltyDues || 0) + 1;
        addNotification(`Penalty Due Logged: Will return next pocketed coin`, 'foul');
      }

      if (curPlayer.currentQueenNeedsCover) {
        returnPendingQueens(curPlayer, currentPieces, 'Opponent coin pocketed on cover');
      }

      updatedPlayers[activePlayerIndex] = curPlayer;
      setPlayers(updatedPlayers);
      setPieces([...currentPieces]);
      endTurnAndSwitchPlayer(updatedPlayers, currentPieces, false);
      return;
    }

    // Update Combo & Successful Shots
    const didScore =
      pointsThisTurn > 0 ||
      queenSunk > 0 ||
      (curPlayer.currentQueenNeedsCover && (ownCoinsSunk > 0 || queenSunk > 0));
    if (didScore) {
      curPlayer.successfulShots = (curPlayer.successfulShots || 0) + 1;
      curPlayer.currentCombo = (curPlayer.currentCombo || 0) + 1;
      curPlayer.highestCombo = Math.max(curPlayer.highestCombo || 0, curPlayer.currentCombo);
      if (curPlayer.currentCombo >= 2) {
        addNotification(`${curPlayer.currentCombo}x Royal Combo! ⚡`, 'strike', 'Momentum Bonus active');
      }
    } else {
      curPlayer.currentCombo = 0;
    }

    // 4. Queen Cover & Double Empress Logic
    if (curPlayer.currentQueenNeedsCover) {
      if (
        ownCoinsSunk > 0 ||
        queenSunk > 0 ||
        (assignedCoin === 'any' && (whiteSunk > 0 || blackSunk > 0))
      ) {
        // Successfully covered Queen!
        curPlayer.currentQueenNeedsCover = false;
        curPlayer.coveredQueens += 1;
        curPlayer.score += settings.queenPoints;
        curPlayer.coinsPocketed.queen += 1;
        curPlayer.pendingQueenId = undefined;
        curPlayer.pendingQueenIds = [];
        triggerScreenShake();

        if (curPlayer.coveredQueens >= 2) {
          // ROYAL DOUBLE EMPRESS BONUS!
          curPlayer.score += 25;
          setQueenCinematicEvent({
            type: 'double_empress',
            playerName: curPlayer.name,
            playerAvatar: curPlayer.avatar,
            pointsAwarded: settings.queenPoints + 25,
          });
          addNotification(
            `ROYAL DOUBLE EMPRESS BONUS! (+25 PTS)`,
            'double_queen',
            'Both Queens Captured!'
          );
        } else {
          setQueenCinematicEvent({
            type: 'secured',
            playerName: curPlayer.name,
            playerAvatar: curPlayer.avatar,
            pointsAwarded: settings.queenPoints,
          });
          addNotification(
            `QUEEN COVERED! (+${settings.queenPoints} PTS)`,
            'cover_success',
            'Royal Crown Secured!'
          );
        }
        extraTurnEarned = true;
      } else {
        // Cover failed: Return Queen to center!
        returnPendingQueens(curPlayer, currentPieces, 'No cover coin pocketed');
      }
    }

    // If new Queen was sunk this shot
    if (queenSunk > 0) {
      triggerScreenShake();
      const newlySunkQueens = pocketedCoins.filter((p) => p.type === 'queen');

      if (ownCoinsSunk > 0 || (assignedCoin === 'any' && (whiteSunk > 0 || blackSunk > 0))) {
        // Instant cover combo on the same turn!
        curPlayer.coveredQueens += queenSunk;
        curPlayer.score += settings.queenPoints * queenSunk;
        curPlayer.coinsPocketed.queen += queenSunk;

        if (curPlayer.coveredQueens >= 2) {
          curPlayer.score += 25;
          setQueenCinematicEvent({
            type: 'double_empress',
            playerName: curPlayer.name,
            playerAvatar: curPlayer.avatar,
            pointsAwarded: settings.queenPoints * queenSunk + 25,
          });
          addNotification(`ROYAL DOUBLE EMPRESS! (+25 BONUS PTS)`, 'double_queen', 'Grand Royal Mastery!');
        } else {
          setQueenCinematicEvent({
            type: 'secured',
            playerName: curPlayer.name,
            playerAvatar: curPlayer.avatar,
            pointsAwarded: settings.queenPoints * queenSunk,
          });
          addNotification(
            `ROYAL COMBO! Queen Covered Instantly! (+${settings.queenPoints * queenSunk} Pts)`,
            'queen'
          );
        }
        extraTurnEarned = true;
      } else {
        curPlayer.currentQueenNeedsCover = true;
        curPlayer.pendingQueenIds = [
          ...(curPlayer.pendingQueenIds || []),
          ...newlySunkQueens.map((q) => q.id),
        ];
        curPlayer.pendingQueenId = curPlayer.pendingQueenIds[0];
        addNotification(`QUEEN POCKETED! (Cover Required Next Turn)`, 'queen', '👑 Pocket a coin next!');
        extraTurnEarned = true; // Player gets next strike to cover
      }
    }

    // 5. Immediate Penalty Due Settle & Points Award
    // If player has pending penalty dues (from past 0-coin foul), deduct due coin immediately!
    while ((curPlayer.penaltyDues || 0) > 0 && ownCoinsSunk > 0) {
      curPlayer.penaltyDues = (curPlayer.penaltyDues || 1) - 1;
      ownCoinsSunk -= 1;

      // Find a pocketed piece of this player to immediately return to center
      const duePiece = currentPieces.find(
        (p) => p.isPocketed && p.type !== 'queen' && (assignedCoin === 'any' || p.type === assignedCoin)
      );

      if (duePiece) {
        returnPieceToCenter(duePiece, currentPieces);
        const dueCoinVal = duePiece.type === 'white' ? settings.whitePoints : settings.blackPoints;
        pointsThisTurn = Math.max(0, pointsThisTurn - dueCoinVal);

        if (duePiece.type === 'white') {
          curPlayer.coinsPocketed.white = Math.max(0, (curPlayer.coinsPocketed.white || 0) - 1);
        } else if (duePiece.type === 'black') {
          curPlayer.coinsPocketed.black = Math.max(0, (curPlayer.coinsPocketed.black || 0) - 1);
        }

        soundManager.playFoulSound();
        addNotification(
          `⚠️ Penalty Due Settled! 1 Coin Returned to Center`,
          'foul',
          (curPlayer.penaltyDues || 0) > 0
            ? `${curPlayer.penaltyDues} due(s) remaining`
            : 'All past penalty dues settled!'
        );
      }
    }

    // Normal Points Award for remaining pocketed coins
    if (pointsThisTurn > 0) {
      curPlayer.score += pointsThisTurn;
      extraTurnEarned = true;
      addNotification(`+${pointsThisTurn} Pts Pocketed! Strike Again!`, 'strike');
    }

    updatedPlayers[activePlayerIndex] = curPlayer;
    setPlayers(updatedPlayers);
    setPieces([...currentPieces]);

    // 6. Check Victory / Board Clear
    const remainingWhite = currentPieces.filter((p) => !p.isPocketed && p.type === 'white').length;
    const remainingBlack = currentPieces.filter((p) => !p.isPocketed && p.type === 'black').length;
    
    // Win if assigned color is cleared
    if (mode === '1v1' || mode === '2v2' || mode === 'vs_bot') {
      if (remainingWhite === 0 || remainingBlack === 0) {
        // Find players of that color and give them a massive completion bonus to guarantee win
        const winningCoin = remainingWhite === 0 ? 'white' : 'black';
        updatedPlayers.forEach((p) => {
           if (p.assignedCoin === winningCoin) {
             p.score += 5000; // Guaranteed win
           }
        });
        handleGameOver(updatedPlayers);
        return;
      }
    }

    const remainingBoardCoins = currentPieces.filter((p) => !p.isPocketed && p.type !== 'striker');
    if (remainingBoardCoins.length === 0) {
      handleGameOver(updatedPlayers);
      return;
    }

    // 7. Next Turn or Continuous Strike
    endTurnAndSwitchPlayer(updatedPlayers, currentPieces, extraTurnEarned);
  };

  const awardOpponentPoints = (playersList: Player[], coinType: 'white' | 'black', points: number) => {
    if (playersList.length === 2) {
      const oppIdx = activePlayerIndex === 0 ? 1 : 0;
      playersList[oppIdx].score += points;
      if (coinType === 'white') playersList[oppIdx].coinsPocketed.white += 1;
      else playersList[oppIdx].coinsPocketed.black += 1;
    } else if (mode === '2v2') {
      const curTeam = playersList[activePlayerIndex].team;
      const oppTeam = curTeam === 1 ? 2 : 1;
      const oppPlayer = playersList.find((p) => p.team === oppTeam);
      if (oppPlayer) {
        oppPlayer.score += points;
      }
    }
  };

  const endTurnAndSwitchPlayer = (
    updatedPlayers: Player[],
    currentPieces: Piece[],
    extraTurn: boolean
  ) => {
    setTurnNumber((prev) => prev + 1);

    if (extraTurn) {
      // Same player shoots again
      setupTurnForPlayer(activePlayerIndex);
    } else {
      // Next player's turn
      const nextIdx = (activePlayerIndex + 1) % updatedPlayers.length;
      setupTurnForPlayer(nextIdx);
    }
  };

  const handleGameOver = (finalPlayers: Player[]) => {
    setStatus('game_over');
    soundManager.playWinFanfare();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFDF73', '#FF4D6D', '#2ECC71', '#FFFFFF'],
    });

    if (mode === '2v2') {
      const team1Score = finalPlayers.filter((p) => p.team === 1).reduce((sum, p) => sum + p.score, 0);
      const team2Score = finalPlayers.filter((p) => p.team === 2).reduce((sum, p) => sum + p.score, 0);
      const winningTeam = team1Score >= team2Score ? 1 : 2;
      const teamPlayers = finalPlayers.filter((p) => p.team === winningTeam);
      onGameOver({ team: winningTeam, players: teamPlayers }, finalPlayers);
    } else {
      const sorted = [...finalPlayers].sort((a, b) => b.score - a.score);
      onGameOver(sorted[0], finalPlayers);
    }
  };

  // --- Interactive Drag-to-Aim & Release Mechanics ---
  const handleBoardPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePlayer.isBot || status === 'animating' || status === 'game_over') return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scale = BOARD_SIZE / rect.width;
    const touchX = (e.clientX - rect.left) * scale;
    const touchY = (e.clientY - rect.top) * scale;

    const distToStriker = Math.hypot(touchX - striker.x, touchY - striker.y);

    if (status === 'placement') {
      // If clicking near striker or on baseline, slide striker along baseline
      if (distToStriker < STRIKER_RADIUS * 2.5) {
        isDraggingPlacement.current = true;
        handlePlacementDrag(touchX, touchY);
        soundManager.playPlacementTick();
      } else {
        // If clicking on the board in front of striker, switch to aiming
        setStatus('aiming');
        isDraggingAim.current = true;
        dragStartPos.current = { x: touchX, y: touchY };
        dragCurrentDist.current = 0;
        updateAimFromPointer(touchX, touchY);
      }
    } else if (status === 'aiming') {
      isDraggingAim.current = true;
      dragStartPos.current = { x: touchX, y: touchY };
      dragCurrentDist.current = 0;
      updateAimFromPointer(touchX, touchY);
    }
  };

  const handleBoardPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePlayer.isBot || status === 'animating' || status === 'game_over') return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scale = BOARD_SIZE / rect.width;
    const touchX = (e.clientX - rect.left) * scale;
    const touchY = (e.clientY - rect.top) * scale;

    if (isDraggingPlacement.current && status === 'placement') {
      handlePlacementDrag(touchX, touchY);
    } else if (isDraggingAim.current && (status === 'aiming' || status === 'placement')) {
      if (status === 'placement') setStatus('aiming');
      updateAimFromPointer(touchX, touchY);
    }
  };

  const handleBoardPointerUp = () => {
    const wasDraggingAim = isDraggingAim.current;
    const dragDistance = dragCurrentDist.current;
    const currentPower = aimPower;

    isDraggingPlacement.current = false;
    isDraggingAim.current = false;
    dragCurrentDist.current = 0;

    // Release Strike: Releasing a drag pullback executes the strike with calculated velocity
    if (wasDraggingAim && dragDistance > 20 && currentPower >= 15 && status === 'aiming') {
      executeStrike(aimAngle, currentPower);
    }
  };

  const handlePlacementDrag = (touchX: number, touchY: number) => {
    const side = activePlayer.side;
    const bounds = getLegalStrikerBounds(side);
    let ratio = 0.5;

    if (bounds.isVertical) {
      ratio = (touchY - bounds.min) / (bounds.max - bounds.min);
    } else {
      ratio = (touchX - bounds.min) / (bounds.max - bounds.min);
    }

    updateStrikerPosition(ratio);
  };

  const updateAimFromPointer = (touchX: number, touchY: number) => {
    // Vector from striker to touch point
    const dx = touchX - striker.x;
    const dy = touchY - striker.y;
    const dist = Math.hypot(dx, dy);

    // Vector from drag start point
    const pullDx = touchX - dragStartPos.current.x;
    const pullDy = touchY - dragStartPos.current.y;
    const pullDist = Math.hypot(pullDx, pullDy);
    dragCurrentDist.current = pullDist;

    // Check if player is dragging backward (slingshot pullback) vs forward (direct aim)
    const baselineAimDir = BASELINES[activePlayer.side].aimDirection;
    const dragAngleFromStriker = Math.atan2(dy, dx);
    const angleDiff = Math.abs(dragAngleFromStriker - baselineAimDir);
    const isPullingBackward = angleDiff > Math.PI / 2;

    if (isPullingBackward && dist > 10) {
      // Slingshot Pullback: aim points opposite to pull direction
      const forwardAngle = Math.atan2(-dy, -dx);
      setAimAngle(forwardAngle);
      const calculatedPower = Math.min(100, Math.max(15, (dist / 140) * 100));
      setAimPower(calculatedPower);
    } else if (dist > 10) {
      // Direct Aim: aim points directly toward pointer
      const angle = Math.atan2(dy, dx);
      setAimAngle(angle);
      if (pullDist > 15) {
        const calculatedPower = Math.min(100, Math.max(15, (pullDist / 120) * 100));
        setAimPower(calculatedPower);
      }
    }
  };

  // Toggle Mute
  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    if (!nextMuted) soundManager.playButtonClick();
  };

  // Coins counts left on board
  const whitesLeft = pieces.filter((p) => !p.isPocketed && p.type === 'white').length;
  const blacksLeft = pieces.filter((p) => !p.isPocketed && p.type === 'black').length;
  const queensLeft = pieces.filter((p) => !p.isPocketed && p.type === 'queen').length;

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-[100dvh] max-h-[100dvh] bg-[#0d0e14] text-[#f3e5ab] p-1 sm:p-3 overflow-hidden select-none">
      {/* Queen Cinematic Celebration Overlay */}
      <QueenCinematicOverlay
        event={queenCinematicEvent}
        onDismiss={() => setQueenCinematicEvent(null)}
      />

      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between px-2 sm:px-3 py-1.5 bg-[#171923]/95 backdrop-blur-md rounded-xl border border-[#d4af37]/30 shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            id="carrom-back-menu-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onExitToMenu();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#232738] hover:bg-[#2d3248] text-[#f3e5ab] text-xs font-semibold transition border border-[#d4af37]/20 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden xs:inline sm:inline">Menu</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-[#d4af37]/20">
            <Crown className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="font-royal font-bold text-xs tracking-wider gold-gradient-text">
              Royal Carrom
            </span>
          </div>
        </div>

        {/* Coins Remaining Quick Badges */}
        <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-semibold">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#202434] border border-[#d4af37]/20 shadow-sm"
            title="White Goti = 20 Points"
          >
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#f5ebe1] border border-[#b8a38e] inline-block shadow-sm" />
            <span className="text-white font-bold">{whitesLeft}</span>
            <span className="text-[9px] text-[#d4af37] hidden sm:inline">(20p)</span>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#202434] border border-[#d4af37]/20 shadow-sm"
            title="Black Goti = 10 Points"
          >
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#24242a] border border-[#5e5e6b] inline-block shadow-sm" />
            <span className="text-gray-300 font-bold">{blacksLeft}</span>
            <span className="text-[9px] text-[#d4af37] hidden sm:inline">(10p)</span>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#202434] border border-[#ff4d6d]/40 shadow-sm"
            title="Red Queen = 25 Points (Cover Required)"
          >
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#c9184a] border border-[#ffdf73] inline-block shadow-sm animate-pulse" />
            <span className="text-[#ff758f] font-bold">{queensLeft}Q</span>
          </div>
        </div>

        {/* Audio & Settings Buttons - Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            id="carrom-bgm-toggle-btn"
            onClick={() => {
              const nextBgm = !isBgmActive;
              setIsBgmActive(nextBgm);
              soundManager.toggleBGM(nextBgm);
              soundManager.playButtonClick();
            }}
            className={`p-1.5 sm:p-2 rounded-lg transition border active:scale-95 cursor-pointer ${
              isBgmActive
                ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#ffdf73]'
                : 'bg-[#232738] border-[#d4af37]/20 text-gray-400 hover:text-[#d4af37]'
            }`}
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
            <Music className={`w-4 h-4 ${isBgmActive ? 'text-[#d4af37]' : 'text-gray-400'}`} />
            <span className={`text-xs font-bold ${isBgmActive ? 'text-[#f3e5ab]' : 'text-gray-400'}`}>Ambient BGM</span>
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
      )}

      {/* Main Players HUD bar */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-1 z-10 shrink-0 px-0.5">
        {players.map((p, idx) => {
          const isActive = idx === activePlayerIndex;
          return (
            <div
              key={p.id}
              className={`relative flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#2a2212] to-[#1c1810] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.35)] scale-[1.01]'
                  : 'bg-[#151722]/80 border-gray-800 opacity-75'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#2a2e42] border-2 border-[#d4af37] flex items-center justify-center text-sm sm:text-base overflow-hidden">
                  {p.avatar}
                </div>
                {isActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#2ecc71] border border-[#0d0e14] animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-bold text-[11px] sm:text-xs truncate text-[#f3e5ab]">
                      {p.name}
                    </span>
                    {p.assignedCoin && p.assignedCoin !== 'any' && (
                      <span
                        className={`w-2 h-2 rounded-full border shrink-0 ${
                          p.assignedCoin === 'white'
                            ? 'bg-[#f5ebe1] border-[#b8a38e]'
                            : 'bg-[#24242a] border-[#8e8e9e]'
                        }`}
                        title={`Assigned: ${p.assignedCoin} coins`}
                      />
                    )}
                  </div>
                  {p.currentQueenNeedsCover ? (
                    <span className="text-[9px] sm:text-[10px] text-[#ff4d6d] font-bold animate-bounce shrink-0">
                      👑 Cover!
                    </span>
                  ) : (p.currentCombo || 0) >= 2 ? (
                    <span className="text-[9px] sm:text-[10px] text-[#ffdf73] font-bold flex items-center gap-0.5 animate-pulse shrink-0">
                      <Flame className="w-2.5 h-2.5 text-[#ff7675]" /> {p.currentCombo}x
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-300 mt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[#d4af37] font-bold text-[11px] sm:text-xs">{p.score} Pts</span>
                    {p.coveredQueens > 0 && (
                      <span className="text-[9px] sm:text-[10px] text-[#ff758f] font-bold">
                        👑x{p.coveredQueens}
                      </span>
                    )}
                    {p.penaltyDues && p.penaltyDues > 0 ? (
                      <span className="text-[9px] sm:text-[10px] text-[#ff7675] font-bold">
                        ⚠️{p.penaltyDues} Due
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {p.team ? `T${p.team}` : `P${idx + 1}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Thinking Status Bar */}
      {aiThinkingText && (
        <div className="w-full max-w-xs flex items-center justify-center gap-1.5 py-0.5 px-2.5 my-0.5 rounded-full bg-[#1b1c28]/90 border border-[#d4af37]/40 shadow-lg text-[11px] text-[#ffdf73] animate-pulse z-20 shrink-0">
          <Bot className="w-3 h-3 text-[#d4af37]" />
          <span>{aiThinkingText}</span>
        </div>
      )}

      {/* Center Toast Notifications */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 pointer-events-none w-full max-w-xs px-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-3 py-1.5 rounded-xl text-center shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-2 duration-150 ${
              n.type === 'queen'
                ? 'bg-[#800f2f]/95 border-[#ff4d6d] text-white'
                : n.type === 'foul'
                ? 'bg-[#4a1010]/95 border-[#e74c3c] text-[#ffcdd2]'
                : n.type === 'cover_success'
                ? 'bg-[#145a32]/95 border-[#2ecc71] text-[#d4efdf]'
                : 'bg-[#2a2212]/95 border-[#d4af37] text-[#fff6d1]'
            }`}
          >
            <div className="font-royal font-bold text-[11px] sm:text-xs tracking-wide">{n.text}</div>
            {n.subtext && <div className="text-[9px] sm:text-[10px] opacity-85 mt-0.5">{n.subtext}</div>}
          </div>
        ))}
      </div>

      {/* Main Carrom Playing Canvas with drag-and-release instructions */}
      <main
        className={`relative flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-full my-auto z-10 transition-transform duration-100 px-1 ${
          isScreenShaking ? 'animate-shake' : ''
        }`}
      >
        <CarromCanvas
          pieces={pieces}
          striker={striker}
          activePlayer={activePlayer}
          theme={currentTheme}
          skin={currentSkin}
          gotiTheme={currentGotiTheme}
          queenTheme={currentQueenTheme}
          status={status}
          aimAngle={aimAngle}
          aimPower={aimPower}
          onBoardPointerDown={handleBoardPointerDown}
          onBoardPointerMove={handleBoardPointerMove}
          onBoardPointerUp={handleBoardPointerUp}
          showAimGuide={true}
          guidelineLength={settings.aimGuidelineLength}
        />

        {/* Intuitive Drag & Release Helper Badge */}
        {!activePlayer.isBot && status !== 'animating' && (
          <div className="mt-0.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-[#d4af37]/30 text-[10px] text-[#ffdf73]/90 flex items-center gap-1 shadow-md">
            <span>🎯 Touch & drag striker to position & pull to fire</span>
          </div>
        )}
      </main>

      {/* Bottom Interactive Controls Panel */}
      <footer className="w-full max-w-4xl flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-[#151722]/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#d4af37]/30 shadow-2xl z-20 shrink-0">
        <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#f3e5ab] px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[#d4af37] font-royal uppercase tracking-wider text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-none">
              {activePlayer.isBot ? `🤖 ${activePlayer.name} Aiming...` : `${activePlayer.name}'s Turn`}
            </span>
            {settings.enableTurnTimer && (
              <span className="px-1.5 py-0.5 rounded bg-[#232738] border border-[#d4af37]/30 text-[10px] sm:text-xs text-[#ffdf73]">
                ⏳ {turnTimeLeft}s
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="carrom-mode-placement-btn"
              onClick={() => {
                if (!activePlayer.isBot && status !== 'animating') {
                  soundManager.playButtonClick();
                  setStatus('placement');
                }
              }}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold transition border active:scale-95 cursor-pointer ${
                status === 'placement'
                  ? 'bg-[#d4af37] text-[#1a0f0a] border-[#fff]'
                  : 'bg-[#232738] text-gray-300 border-transparent hover:border-[#d4af37]/40'
              }`}
            >
              1. Position
            </button>

            <button
              id="carrom-mode-aim-btn"
              onClick={() => {
                if (!activePlayer.isBot && status !== 'animating') {
                  soundManager.playButtonClick();
                  setStatus('aiming');
                }
              }}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold transition border active:scale-95 cursor-pointer ${
                status === 'aiming'
                  ? 'bg-[#d4af37] text-[#1a0f0a] border-[#fff]'
                  : 'bg-[#232738] text-gray-300 border-transparent hover:border-[#d4af37]/40'
              }`}
            >
              2. Aim & Fire
            </button>
          </div>
        </div>

        {/* Baseline Placement Slider & Aim/Power Controls */}
        <div className="w-full grid grid-cols-12 gap-1.5 sm:gap-3 items-center">
          {/* Baseline Slider */}
          <div className="col-span-5 sm:col-span-5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-gray-400">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Sliders className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#d4af37]" /> Position
              </span>
              <span className="text-[#f3e5ab] font-bold">{Math.round(strikerPlacementRatio * 100)}%</span>
            </div>
            <input
              id="carrom-placement-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              disabled={activePlayer.isBot || status === 'animating'}
              value={strikerPlacementRatio}
              onChange={(e) => {
                updateStrikerPosition(parseFloat(e.target.value));
                soundManager.playPlacementTick();
              }}
              className="w-full h-1.5 sm:h-2 bg-[#202434] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
            />
          </div>

          {/* Aim Angle & Power Slider */}
          <div className="col-span-4 sm:col-span-4 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-gray-400">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#d4af37]" /> Power
              </span>
              <span className="text-[#ffdf73] font-bold">{Math.round(aimPower)}%</span>
            </div>
            <input
              id="carrom-power-slider"
              type="range"
              min="15"
              max="100"
              step="1"
              disabled={activePlayer.isBot || status === 'animating'}
              value={aimPower}
              onChange={(e) => setAimPower(parseInt(e.target.value))}
              className="w-full h-1.5 sm:h-2 bg-[#202434] rounded-lg appearance-none cursor-pointer accent-[#e74c3c]"
            />
          </div>

          {/* Big Strike Button */}
          <div className="col-span-3 sm:col-span-3 flex items-center justify-end">
            <button
              id="carrom-fire-strike-btn"
              disabled={activePlayer.isBot || status === 'animating'}
              onClick={() => executeStrike(aimAngle, aimPower)}
              className={`w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl font-royal font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1 sm:gap-2 shadow-lg transition-all transform active:scale-95 ${
                status === 'animating'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                  : activePlayer.isBot
                  ? 'bg-[#2a2e42] text-gray-400 border border-gray-700'
                  : 'bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] text-[#1a0f0a] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] cursor-pointer'
              }`}
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
              <span>STRIKE!</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
