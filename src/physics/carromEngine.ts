import {
  BOARD_SIZE,
  PLAYABLE_MIN,
  PLAYABLE_MAX,
  POCKETS,
  PIECE_RADIUS,
  STRIKER_RADIUS,
  PIECE_MASS,
  STRIKER_MASS,
  BASELINES,
} from '../data/carromConstants';
import { Piece, PieceType, Player } from '../types';
import { soundManager } from '../audio/soundManager';

export function createInitialPieces(queensCount: 2 | 1 = 2): Piece[] {
  const pieces: Piece[] = [];
  const cx = BOARD_SIZE / 2;
  const cy = BOARD_SIZE / 2;
  const r = PIECE_RADIUS;
  const d = r * 2;

  let idCounter = 1;

  if (queensCount === 2) {
    // 2 Red Queens placed in the center rosette
    pieces.push({
      id: `queen-${idCounter++}`,
      type: 'queen',
      x: cx - r + 1,
      y: cy,
      vx: 0,
      vy: 0,
      radius: r,
      mass: PIECE_MASS,
      isPocketed: false,
      pocketProgress: 0,
      rotation: 0,
      angularVelocity: 0,
    });
    pieces.push({
      id: `queen-${idCounter++}`,
      type: 'queen',
      x: cx + r - 1,
      y: cy,
      vx: 0,
      vy: 0,
      radius: r,
      mass: PIECE_MASS,
      isPocketed: false,
      pocketProgress: 0,
      rotation: 0,
      angularVelocity: 0,
    });

    // 9 White and 9 Black coins arranged in concentric royal ring pattern
    // Inner ring (6 coins)
    const innerRadius = d * 1.1;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const type: PieceType = i % 2 === 0 ? 'white' : 'black';
      pieces.push({
        id: `piece-${idCounter++}`,
        type,
        x: cx + Math.cos(angle) * innerRadius,
        y: cy + Math.sin(angle) * innerRadius,
        vx: 0,
        vy: 0,
        radius: r,
        mass: PIECE_MASS,
        isPocketed: false,
        pocketProgress: 0,
        rotation: 0,
        angularVelocity: 0,
      });
    }

    // Outer ring (12 coins)
    const outerRadius = d * 2.1;
    // Types arranged alternating in pairs to give 6 White and 6 Black in outer ring
    const outerTypes: PieceType[] = [
      'white', 'black', 'white', 'black', 'white', 'black',
      'white', 'black', 'white', 'black', 'white', 'black',
    ];

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      pieces.push({
        id: `piece-${idCounter++}`,
        type: outerTypes[i],
        x: cx + Math.cos(angle) * outerRadius,
        y: cy + Math.sin(angle) * outerRadius,
        vx: 0,
        vy: 0,
        radius: r,
        mass: PIECE_MASS,
        isPocketed: false,
        pocketProgress: 0,
        rotation: 0,
        angularVelocity: 0,
      });
    }
  } else {
    // Standard 1 Queen setup
    pieces.push({
      id: `queen-1`,
      type: 'queen',
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      radius: r,
      mass: PIECE_MASS,
      isPocketed: false,
      pocketProgress: 0,
      rotation: 0,
      angularVelocity: 0,
    });

    // Inner ring: 6 pieces (3 white, 3 black)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const type: PieceType = i % 2 === 0 ? 'white' : 'black';
      pieces.push({
        id: `piece-${idCounter++}`,
        type,
        x: cx + Math.cos(angle) * d,
        y: cy + Math.sin(angle) * d,
        vx: 0,
        vy: 0,
        radius: r,
        mass: PIECE_MASS,
        isPocketed: false,
        pocketProgress: 0,
        rotation: 0,
        angularVelocity: 0,
      });
    }

    // Outer ring: 12 pieces (6 white, 6 black)
    const outerRadius = d * 1.98;
    const outerPattern: PieceType[] = [
      'white', 'white', 'black',
      'white', 'white', 'black',
      'white', 'white', 'black',
      'white', 'white', 'black',
    ];

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      pieces.push({
        id: `piece-${idCounter++}`,
        type: outerPattern[i],
        x: cx + Math.cos(angle) * outerRadius,
        y: cy + Math.sin(angle) * outerRadius,
        vx: 0,
        vy: 0,
        radius: r,
        mass: PIECE_MASS,
        isPocketed: false,
        pocketProgress: 0,
        rotation: 0,
        angularVelocity: 0,
      });
    }
  }

  return pieces;
}

export function createStriker(side: 0 | 1 | 2 | 3 = 0, initialPositionPercent: number = 0.5): Piece {
  const base = BASELINES[side];
  let x = 300;
  let y = 300;

  if (side === 0 || side === 2) {
    const minX = base.minX + STRIKER_RADIUS;
    const maxX = base.maxX - STRIKER_RADIUS;
    x = minX + (maxX - minX) * initialPositionPercent;
    y = base.y;
  } else {
    const minY = base.minY + STRIKER_RADIUS;
    const maxY = base.maxY - STRIKER_RADIUS;
    y = minY + (maxY - minY) * initialPositionPercent;
    x = base.x;
  }

  return {
    id: 'striker',
    type: 'striker',
    x,
    y,
    vx: 0,
    vy: 0,
    radius: STRIKER_RADIUS,
    mass: STRIKER_MASS,
    isPocketed: false,
    pocketProgress: 0,
    rotation: 0,
    angularVelocity: 0,
  };
}

export function getLegalStrikerBounds(side: 0 | 1 | 2 | 3) {
  const base = BASELINES[side];
  if (side === 0 || side === 2) {
    return {
      min: base.minX + STRIKER_RADIUS,
      max: base.maxX - STRIKER_RADIUS,
      fixedPos: base.y,
      isVertical: false,
    };
  } else {
    return {
      min: base.minY + STRIKER_RADIUS,
      max: base.maxY - STRIKER_RADIUS,
      fixedPos: base.x,
      isVertical: true,
    };
  }
}

export function isStrikerPositionValid(
  striker: Piece,
  otherPieces: Piece[]
): { valid: boolean; reason?: string } {
  // Check overlapping with any other coin
  for (const p of otherPieces) {
    if (p.isPocketed) continue;
    const dx = striker.x - p.x;
    const dy = striker.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < striker.radius + p.radius) {
      return { valid: false, reason: 'Striker overlaps an existing coin on the baseline!' };
    }
  }

  return { valid: true };
}

export interface PhysicsStepResult {
  isMoving: boolean;
  pocketedEvents: Piece[];
  collisionsCount: number;
  strikerHitPieceIds: string[];
  highImpactEvents: { x: number; y: number; intensity: number }[];
}

export function stepPhysics(
  pieces: Piece[],
  frictionMultiplier: number = 1.0,
  dt: number = 1 / 60
): PhysicsStepResult {
  const subSteps = 8;
  const subDt = dt / subSteps;
  // Powder friction rate (e.g. 0.988 per frame, modified by powderLevel)
  const baseDecay = 0.988 / frictionMultiplier;
  const subDecay = Math.pow(baseDecay, 1 / subSteps);

  let hasMotion = false;
  const pocketedEvents: Piece[] = [];
  const strikerHitPieceIds: string[] = [];
  const highImpactEvents: { x: number; y: number; intensity: number }[] = [];
  let collisionsCount = 0;

  for (let s = 0; s < subSteps; s++) {
    // 1. Position update & basic movement
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];

      // Handle pocket dropping animation
      if (p.isPocketed) {
        if (p.pocketProgress < 1.0) {
          p.pocketProgress = Math.min(1.0, p.pocketProgress + 0.05);
          p.angularVelocity *= 0.9;
          p.rotation += p.angularVelocity;
        }
        continue;
      }

      const speedSq = p.vx * p.vx + p.vy * p.vy;
      if (speedSq > 0.0001) {
        hasMotion = true;
        p.x += p.vx * subDt * 60;
        p.y += p.vy * subDt * 60;

        // Apply friction
        p.vx *= subDecay;
        p.vy *= subDecay;

        // Angular rotation from linear velocity
        p.angularVelocity = (p.vx + p.vy) * 0.02;
        p.rotation += p.angularVelocity;

        // Stop if below velocity threshold
        if (Math.hypot(p.vx, p.vy) < 0.08) {
          p.vx = 0;
          p.vy = 0;
          p.angularVelocity = 0;
        }
      }

      // 2. Check Pocketing
      for (const pocket of POCKETS) {
        const pdx = p.x - pocket.x;
        const pdy = p.y - pocket.y;
        const pdist = Math.hypot(pdx, pdy);

        // Pocket suction when near hole rim
        if (pdist < pocket.radius + 8) {
          const suctionForce = 0.15 * (1 - pdist / (pocket.radius + 8));
          p.vx -= (pdx / (pdist || 1)) * suctionForce;
          p.vy -= (pdy / (pdist || 1)) * suctionForce;
        }

        // True pocket threshold
        if (pdist < pocket.radius - 2) {
          p.isPocketed = true;
          p.pocketId = pocket.id;
          p.pocketProgress = 0.01;
          p.vx *= 0.2;
          p.vy *= 0.2;
          pocketedEvents.push({ ...p });
          soundManager.playPocketSound(p.type === 'queen');
          break;
        }
      }

      if (p.isPocketed) continue;

      // 3. Cushion Collision
      const r = p.radius;
      const minBound = PLAYABLE_MIN + r;
      const maxBound = PLAYABLE_MAX - r;
      const restitution = 0.88;

      let hitCushion = false;
      let hitSpeed = 0;

      if (p.x < minBound) {
        p.x = minBound;
        hitSpeed = Math.abs(p.vx);
        p.vx = -p.vx * restitution;
        hitCushion = true;
      } else if (p.x > maxBound) {
        p.x = maxBound;
        hitSpeed = Math.abs(p.vx);
        p.vx = -p.vx * restitution;
        hitCushion = true;
      }

      if (p.y < minBound) {
        p.y = minBound;
        hitSpeed = Math.max(hitSpeed, Math.abs(p.vy));
        p.vy = -p.vy * restitution;
        hitCushion = true;
      } else if (p.y > maxBound) {
        p.y = maxBound;
        hitSpeed = Math.max(hitSpeed, Math.abs(p.vy));
        p.vy = -p.vy * restitution;
        hitCushion = true;
      }

      if (hitCushion && hitSpeed > 0.8) {
        soundManager.playCushionHit(Math.min(1.0, hitSpeed / 12));
        if (hitSpeed > 8.0) {
          highImpactEvents.push({ x: p.x, y: p.y, intensity: Math.min(1.0, hitSpeed / 14) });
        }
      }
    }

    // 4. Circle-to-Circle Collisions (2D Elastic Impulse)
    for (let i = 0; i < pieces.length; i++) {
      const p1 = pieces[i];
      if (p1.isPocketed) continue;

      for (let j = i + 1; j < pieces.length; j++) {
        const p2 = pieces[j];
        if (p2.isPocketed) continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist && dist > 0.0001) {
          collisionsCount++;

          // Record if striker collided with a piece
          if (p1.type === 'striker' && p2.type !== 'striker') {
            if (!strikerHitPieceIds.includes(p2.id)) strikerHitPieceIds.push(p2.id);
          } else if (p2.type === 'striker' && p1.type !== 'striker') {
            if (!strikerHitPieceIds.includes(p1.id)) strikerHitPieceIds.push(p1.id);
          }

          // Normal vector
          const nx = dx / dist;
          const ny = dy / dist;

          // Positional correction to avoid sticking / overlap
          const overlap = minDist - dist;
          const totalMass = p1.mass + p2.mass;
          const separationRatio1 = p2.mass / totalMass;
          const separationRatio2 = p1.mass / totalMass;

          p1.x -= nx * overlap * separationRatio1;
          p1.y -= ny * overlap * separationRatio1;
          p2.x += nx * overlap * separationRatio2;
          p2.y += ny * overlap * separationRatio2;

          // Relative velocity
          const rvx = p2.vx - p1.vx;
          const rvy = p2.vy - p1.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          // Do not resolve if moving apart
          if (velAlongNormal < 0) {
            const restitution = 0.94;
            const impulseMagnitude = (-(1 + restitution) * velAlongNormal) / (1 / p1.mass + 1 / p2.mass);

            const impulseX = impulseMagnitude * nx;
            const impulseY = impulseMagnitude * ny;

            p1.vx -= (impulseX / p1.mass);
            p1.vy -= (impulseY / p1.mass);
            p2.vx += (impulseX / p2.mass);
            p2.vy += (impulseY / p2.mass);

            const impactSpeed = Math.abs(velAlongNormal);
            if (impactSpeed > 0.5) {
              soundManager.playWoodStrike(Math.min(1.0, impactSpeed / 10));
              if (impactSpeed > 7.0) {
                highImpactEvents.push({
                  x: (p1.x + p2.x) / 2,
                  y: (p1.y + p2.y) / 2,
                  intensity: Math.min(1.0, impactSpeed / 15),
                });
              }
            }
          }
        }
      }
    }
  }

  // Check if any piece is still moving above threshold or animating drop
  const stillMoving = pieces.some((p) => {
    if (p.isPocketed) {
      return p.pocketProgress < 1.0;
    }
    return Math.hypot(p.vx, p.vy) > 0.08;
  });

  return {
    isMoving: stillMoving || hasMotion,
    pocketedEvents,
    collisionsCount,
    strikerHitPieceIds,
    highImpactEvents,
  };
}

export function returnPieceToCenter(piece: Piece, allPieces: Piece[]) {
  const cx = BOARD_SIZE / 2;
  const cy = BOARD_SIZE / 2;
  piece.isPocketed = false;
  piece.pocketProgress = 0;
  piece.pocketId = undefined;
  piece.vx = 0;
  piece.vy = 0;

  // Find nearest unoccupied radial spot in center
  let found = false;
  let testDist = 0;
  let testAngle = 0;

  while (!found && testDist < 120) {
    const tx = cx + Math.cos(testAngle) * testDist;
    const ty = cy + Math.sin(testAngle) * testDist;

    let overlap = false;
    for (const other of allPieces) {
      if (other.id === piece.id || other.isPocketed) continue;
      if (Math.hypot(tx - other.x, ty - other.y) < piece.radius + other.radius + 2) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      piece.x = tx;
      piece.y = ty;
      found = true;
    } else {
      testAngle += Math.PI / 4;
      if (testAngle >= Math.PI * 2) {
        testAngle = 0;
        testDist += PIECE_RADIUS * 1.5;
      }
    }
  }
}
