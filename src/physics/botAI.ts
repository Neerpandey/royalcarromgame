import {
  BOARD_SIZE,
  POCKETS,
  BASELINES,
  PIECE_RADIUS,
  STRIKER_RADIUS,
  PLAYABLE_MIN,
  PLAYABLE_MAX,
} from '../data/carromConstants';
import { BotDifficulty, Piece, Player } from '../types';
import { getLegalStrikerBounds } from './carromEngine';

export interface AIShotPlan {
  strikerPos: { x: number; y: number };
  angle: number;
  power: number; // 0 to 100
  targetPiece?: Piece;
  pocketId?: number;
  isBankShot?: boolean;
  reason?: string;
}

export async function computeAIShot(
  player: Player,
  allPieces: Piece[],
  difficulty: BotDifficulty = 'maharaja'
): Promise<AIShotPlan> {
  const side = player.side;
  const baseline = BASELINES[side];
  const bounds = getLegalStrikerBounds(side);

  const activePieces = allPieces.filter((p) => !p.isPocketed && p.type !== 'striker');

  if (activePieces.length === 0) {
    const defaultX = bounds.isVertical ? bounds.fixedPos : (bounds.min + bounds.max) / 2;
    const defaultY = bounds.isVertical ? (bounds.min + bounds.max) / 2 : bounds.fixedPos;
    return {
      strikerPos: { x: defaultX, y: defaultY },
      angle: baseline.aimDirection,
      power: 60,
      reason: 'No active pieces remaining',
    };
  }

  // Determine allowed/preferred pieces according to coin assignment rules
  const assigned = player.assignedCoin || 'any';
  const needsCover = player.currentQueenNeedsCover;

  const getPieceStrategicValue = (p: Piece): number => {
    if (p.type === 'queen') {
      return needsCover ? 120 : 100;
    }
    if (needsCover) {
      // If covering queen, any legal coin is golden
      if (assigned === 'white') return p.type === 'white' ? 95 : -80;
      if (assigned === 'black') return p.type === 'black' ? 95 : -80;
      return 90;
    }
    if (assigned === 'white') {
      return p.type === 'white' ? 60 : -100; // Penalize opponent coins
    }
    if (assigned === 'black') {
      return p.type === 'black' ? 60 : -100;
    }
    // FFA / points mode
    return p.type === 'white' ? 45 : 30;
  };

  const targetablePieces = [...activePieces]
    .filter((p) => getPieceStrategicValue(p) > -50)
    .sort((a, b) => getPieceStrategicValue(b) - getPieceStrategicValue(a));

  const searchPieces = targetablePieces.length > 0 ? targetablePieces : activePieces;

  interface ShotCandidate {
    strikerPos: { x: number; y: number };
    angle: number;
    power: number;
    score: number;
    targetPiece: Piece;
    pocketId: number;
    isBankShot?: boolean;
    reason: string;
  }

  const candidates: ShotCandidate[] = [];

  // Sampling resolution along the baseline
  const sampleSteps = difficulty === 'grandmaster' ? 18 : difficulty === 'maharaja' ? 10 : 6;

  for (let s = 0; s <= sampleSteps; s++) {
    const ratio = s / sampleSteps;
    let sx = 0;
    let sy = 0;

    if (bounds.isVertical) {
      sx = bounds.fixedPos;
      sy = bounds.min + (bounds.max - bounds.min) * ratio;
    } else {
      sx = bounds.min + (bounds.max - bounds.min) * ratio;
      sy = bounds.fixedPos;
    }

    // Baseline collision safety check
    let overlap = false;
    for (const p of activePieces) {
      if (Math.hypot(sx - p.x, sy - p.y) < STRIKER_RADIUS + p.radius + 2) {
        overlap = true;
        break;
      }
    }
    if (overlap) continue;

    // 1. Direct Shots Evaluation
    for (const piece of searchPieces) {
      for (const pocket of POCKETS) {
        const pocketDx = pocket.x - piece.x;
        const pocketDy = pocket.y - piece.y;
        const distPieceToPocket = Math.hypot(pocketDx, pocketDy);

        if (distPieceToPocket < 0.001) continue;

        const pDirX = pocketDx / distPieceToPocket;
        const pDirY = pocketDy / distPieceToPocket;

        // Ghost ball contact center
        const contactDist = STRIKER_RADIUS + PIECE_RADIUS;
        const ghostX = piece.x - pDirX * contactDist;
        const ghostY = piece.y - pDirY * contactDist;

        if (
          ghostX < PLAYABLE_MIN ||
          ghostX > PLAYABLE_MAX ||
          ghostY < PLAYABLE_MIN ||
          ghostY > PLAYABLE_MAX
        ) {
          continue;
        }

        const strikeDx = ghostX - sx;
        const strikeDy = ghostY - sy;
        const distStrikerToGhost = Math.hypot(strikeDx, strikeDy);

        if (distStrikerToGhost < 12) continue;

        const strikeDirX = strikeDx / distStrikerToGhost;
        const strikeDirY = strikeDy / distStrikerToGhost;

        // Cut angle dot product
        const cutDot = strikeDirX * pDirX + strikeDirY * pDirY;
        if (cutDot < (difficulty === 'rookie' ? 0.35 : 0.12)) {
          continue;
        }

        // Obstacle check: Striker to ghost contact
        let blocked = false;
        for (const obs of activePieces) {
          if (obs.id === piece.id) continue;
          const obsDist = pointToSegmentDistance(obs.x, obs.y, sx, sy, ghostX, ghostY);
          if (obsDist < STRIKER_RADIUS + obs.radius + 1) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;

        // Obstacle check: Piece to pocket
        for (const obs of activePieces) {
          if (obs.id === piece.id) continue;
          const obsDist = pointToSegmentDistance(obs.x, obs.y, piece.x, piece.y, pocket.x, pocket.y);
          if (obsDist < piece.radius + obs.radius + 1) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;

        // Calculate score
        const basePieceScore = getPieceStrategicValue(piece);
        const cutScore = cutDot * 45;
        const distPenalty = (distStrikerToGhost + distPieceToPocket) * 0.04;
        const totalScore = basePieceScore + cutScore - distPenalty;

        const totalDist = distStrikerToGhost + distPieceToPocket;
        let basePower = Math.min(95, Math.max(30, 25 + totalDist * 0.13));
        if (cutDot < 0.6) {
          basePower += 18 * (1 - cutDot);
        }

        candidates.push({
          strikerPos: { x: sx, y: sy },
          angle: Math.atan2(strikeDy, strikeDx),
          power: Math.min(100, basePower),
          score: totalScore,
          targetPiece: piece,
          pocketId: pocket.id,
          isBankShot: false,
          reason: `Direct cut on ${piece.type} to ${pocket.name}`,
        });
      }
    }

    // 2. Grandmaster Cushion Bank Shot Evaluation (1-Cushion Rebound)
    if (difficulty === 'grandmaster') {
      for (const piece of searchPieces.slice(0, 4)) {
        for (const pocket of POCKETS) {
          const pocketDx = pocket.x - piece.x;
          const pocketDy = pocket.y - piece.y;
          const distPieceToPocket = Math.hypot(pocketDx, pocketDy);
          if (distPieceToPocket < 0.001) continue;

          const pDirX = pocketDx / distPieceToPocket;
          const pDirY = pocketDy / distPieceToPocket;

          const contactDist = STRIKER_RADIUS + PIECE_RADIUS;
          const ghostX = piece.x - pDirX * contactDist;
          const ghostY = piece.y - pDirY * contactDist;

          // Test reflection across 4 cushions (Top, Bottom, Left, Right)
          const cushions = [
            { name: 'Top', mirrorY: PLAYABLE_MIN + STRIKER_RADIUS, axis: 'y' as const },
            { name: 'Bottom', mirrorY: PLAYABLE_MAX - STRIKER_RADIUS, axis: 'y' as const },
            { name: 'Left', mirrorX: PLAYABLE_MIN + STRIKER_RADIUS, axis: 'x' as const },
            { name: 'Right', mirrorX: PLAYABLE_MAX - STRIKER_RADIUS, axis: 'x' as const },
          ];

          for (const cushion of cushions) {
            let mirGhostX = ghostX;
            let mirGhostY = ghostY;
            let reflectX = 0;
            let reflectY = 0;

            if (cushion.axis === 'y') {
              mirGhostY = 2 * cushion.mirrorY! - ghostY;
              // Intersection of line (sx, sy) -> (mirGhostX, mirGhostY) with y = cushion.mirrorY
              if (Math.abs(mirGhostY - sy) < 0.01) continue;
              const t = (cushion.mirrorY! - sy) / (mirGhostY - sy);
              if (t <= 0 || t >= 1) continue;
              reflectX = sx + t * (mirGhostX - sx);
              reflectY = cushion.mirrorY!;
            } else {
              mirGhostX = 2 * cushion.mirrorX! - ghostX;
              if (Math.abs(mirGhostX - sx) < 0.01) continue;
              const t = (cushion.mirrorX! - sx) / (mirGhostX - sx);
              if (t <= 0 || t >= 1) continue;
              reflectX = cushion.mirrorX!;
              reflectY = sy + t * (mirGhostY - sy);
            }

            if (
              reflectX < PLAYABLE_MIN + 30 ||
              reflectX > PLAYABLE_MAX - 30 ||
              reflectY < PLAYABLE_MIN + 30 ||
              reflectY > PLAYABLE_MAX - 30
            ) {
              continue;
            }

            // Path 1: Striker to Cushion
            let leg1Blocked = false;
            for (const obs of activePieces) {
              if (obs.id === piece.id) continue;
              if (pointToSegmentDistance(obs.x, obs.y, sx, sy, reflectX, reflectY) < STRIKER_RADIUS + obs.radius) {
                leg1Blocked = true;
                break;
              }
            }
            if (leg1Blocked) continue;

            // Path 2: Cushion to Ghost
            let leg2Blocked = false;
            for (const obs of activePieces) {
              if (obs.id === piece.id) continue;
              if (pointToSegmentDistance(obs.x, obs.y, reflectX, reflectY, ghostX, ghostY) < STRIKER_RADIUS + obs.radius) {
                leg2Blocked = true;
                break;
              }
            }
            if (leg2Blocked) continue;

            // Path 3: Piece to Pocket
            let leg3Blocked = false;
            for (const obs of activePieces) {
              if (obs.id === piece.id) continue;
              if (pointToSegmentDistance(obs.x, obs.y, piece.x, piece.y, pocket.x, pocket.y) < piece.radius + obs.radius) {
                leg3Blocked = true;
                break;
              }
            }
            if (leg3Blocked) continue;

            // Vector incoming to piece from reflection
            const inDx = ghostX - reflectX;
            const inDy = ghostY - reflectY;
            const inDist = Math.hypot(inDx, inDy);
            if (inDist < 1) continue;

            const cutDot = (inDx / inDist) * pDirX + (inDy / inDist) * pDirY;
            if (cutDot < 0.25) continue;

            const totalDist = Math.hypot(reflectX - sx, reflectY - sy) + inDist + distPieceToPocket;
            const bankScore = getPieceStrategicValue(piece) * 0.9 + cutDot * 35 - totalDist * 0.05;

            candidates.push({
              strikerPos: { x: sx, y: sy },
              angle: Math.atan2(reflectY - sy, reflectX - sx),
              power: Math.min(100, Math.max(55, 45 + totalDist * 0.15)),
              score: bankScore,
              targetPiece: piece,
              pocketId: pocket.id,
              isBankShot: true,
              reason: `Grandmaster 1-Cushion Bank via ${cushion.name} Cushion`,
            });
          }
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    let best = candidates[0];

    // Apply difficulty noise (Rookie: kum dangerous, Maharaja: moderate, Grandmaster: extremely dangerous & deadly precise)
    let angleNoise = 0;
    let powerNoise = 0;

    if (difficulty === 'rookie') {
      angleNoise = (Math.random() - 0.5) * 0.22; // Loose accuracy (kum dangerous)
      powerNoise = (Math.random() - 0.5) * 35;
    } else if (difficulty === 'maharaja') {
      angleNoise = (Math.random() - 0.5) * 0.04; // Moderate accuracy
      powerNoise = (Math.random() - 0.5) * 12;
    } else {
      // Grandmaster: Extremely dangerous sniper precision
      angleNoise = (Math.random() - 0.5) * 0.002; // Deadliest precision
      powerNoise = (Math.random() - 0.5) * 1.5;
    }

    return {
      strikerPos: best.strikerPos,
      angle: best.angle + angleNoise,
      power: Math.min(100, Math.max(25, best.power + powerNoise)),
      targetPiece: best.targetPiece,
      pocketId: best.pocketId,
      isBankShot: best.isBankShot,
      reason: best.reason,
    };
  }

  // Fallback: Break cluster or push target toward pocket
  const target = searchPieces[0] || activePieces[0];
  const defaultX = bounds.isVertical ? bounds.fixedPos : (bounds.min + bounds.max) / 2;
  const defaultY = bounds.isVertical ? (bounds.min + bounds.max) / 2 : bounds.fixedPos;

  const dx = target.x - defaultX;
  const dy = target.y - defaultY;
  const breakAngle = Math.atan2(dy, dx);

  return {
    strikerPos: { x: defaultX, y: defaultY },
    angle: breakAngle,
    power: 70,
    targetPiece: target,
    reason: 'Strategic cluster break / defensive push',
  };
}

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return Math.hypot(px - x1, py - y1);

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY);
}

