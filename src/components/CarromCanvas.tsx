import React, { useRef, useEffect, useCallback } from 'react';
import {
  BOARD_SIZE,
  CUSHION_INSET,
  PLAYABLE_MIN,
  PLAYABLE_MAX,
  POCKETS,
  BASELINES,
  STRIKER_RADIUS,
  GOTI_THEMES,
  QUEEN_THEMES,
} from '../data/carromConstants';
import { BoardTheme, GotiTheme, Piece, Player, QueenTheme, StrikerSkin } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface CarromCanvasProps {
  pieces: Piece[];
  striker: Piece;
  activePlayer: Player;
  theme: BoardTheme;
  skin: StrikerSkin;
  gotiTheme?: GotiTheme;
  queenTheme?: QueenTheme;
  status: 'placement' | 'aiming' | 'shooting' | 'animating' | 'turn_end' | 'game_over';
  aimAngle: number;
  aimPower: number; // 0 to 100
  onBoardPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onBoardPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onBoardPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  showAimGuide?: boolean;
  guidelineLength?: 'standard' | 'extended' | 'full';
}

export const CarromCanvas: React.FC<CarromCanvasProps> = ({
  pieces,
  striker,
  activePlayer,
  theme,
  skin,
  gotiTheme = GOTI_THEMES[0],
  queenTheme = QUEEN_THEMES[0],
  status,
  aimAngle,
  aimPower,
  onBoardPointerDown,
  onBoardPointerMove,
  onBoardPointerUp,
  showAimGuide = true,
  guidelineLength = 'extended',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const pocketedIdsRef = useRef<Set<string>>(new Set());
  const pocketGlowsRef = useRef<{ pocketId: number; color: string; life: number; type: string }[]>([]);

  // Add spark particles on heavy strike
  const addImpactSparks = useCallback((x: number, y: number, color: string = '#FFEAA7', count = 8) => {
    for (let i = 0; i < count; i++) {
      const speed = 1.5 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 20 + Math.random() * 15,
        color,
        size: 1.5 + Math.random() * 2,
      });
    }
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Handle DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale((displayWidth * dpr) / BOARD_SIZE, (displayHeight * dpr) / BOARD_SIZE);

      // Clear canvas
      ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // 1. Draw High-Gloss Wooden Frame, Teak Grains and Gold Inlay Corner Ornaments
      drawBoardFrame(ctx, theme);

      // 2. Draw Felt Playing Surface, Powder Sheen & Royal Lotus Rosette
      drawFeltSurface(ctx, theme, activePlayer.side);

      // 3. Draw Deep 3D Pocket Wells and Braided Mesh Nets
      drawPockets(ctx, theme);

      // Track newly pocketed pieces for premium glows
      for (const p of [...pieces, striker]) {
        if (p.isPocketed && p.pocketId !== undefined && !pocketedIdsRef.current.has(p.id)) {
          pocketedIdsRef.current.add(p.id);
          let glowColor = 'rgba(255, 255, 255, 0.9)'; // White
          if (p.type === 'black') glowColor = 'rgba(20, 20, 20, 0.9)'; // Dark/Black
          if (p.type === 'queen') glowColor = 'rgba(255, 77, 109, 0.9)'; // Reddish pink
          if (p.type === 'striker') glowColor = 'rgba(212, 175, 55, 0.9)'; // Gold

          pocketGlowsRef.current.push({
            pocketId: p.pocketId,
            color: glowColor,
            life: 1.0,
            type: p.type
          });
        }
      }

      // Draw premium pocket highlights
      for (let i = pocketGlowsRef.current.length - 1; i >= 0; i--) {
        const glow = pocketGlowsRef.current[i];
        const pocket = POCKETS.find(p => p.id === glow.pocketId);
        if (pocket) {
          ctx.save();
          // Animated pulsating scale based on life
          const pulse = Math.sin((1 - glow.life) * Math.PI) * 15;
          const outerRadius = pocket.radius + 15 + pulse;
          
          const grad = ctx.createRadialGradient(pocket.x, pocket.y, pocket.radius, pocket.x, pocket.y, outerRadius);
          // Split alpha so it fades out
          const alpha = Math.max(0, glow.life);
          
          let colorParts = glow.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
          if (colorParts) {
             const r = colorParts[1];
             const g = colorParts[2];
             const b = colorParts[3];
             grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
             grad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
             grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          } else {
             // Fallback
             grad.addColorStop(0, glow.color);
             grad.addColorStop(1, 'rgba(0,0,0,0)');
          }

          ctx.beginPath();
          ctx.arc(pocket.x, pocket.y, outerRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Add a sharp neon ring
          if (colorParts) {
            ctx.beginPath();
            ctx.arc(pocket.x, pocket.y, pocket.radius + 5 + (1 - glow.life) * 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${colorParts[1]}, ${colorParts[2]}, ${colorParts[3]}, ${alpha})`;
            ctx.lineWidth = 3 * alpha;
            ctx.stroke();
          }

          ctx.restore();
        }
        
        glow.life -= 0.008; // Approx 1 second fade (1/60 * 66 frames = ~1 sec)
        if (glow.life <= 0) {
          pocketGlowsRef.current.splice(i, 1);
        }
      }

      // 4. Draw Baseline Placement highlight for current player
      if (status === 'placement' && !activePlayer.isBot) {
        drawPlacementZoneGlow(ctx, activePlayer.side, theme);
      }

      // 5. Draw Aiming Guideline and Exact Rebound Trajectory (with power meter)
      if (showAimGuide && (status === 'aiming' || status === 'placement') && !activePlayer.isBot) {
        drawAimingGuide(ctx, striker, aimAngle, aimPower, pieces, guidelineLength, theme);
      }

      // 6. Draw 3D Crystal Goties with Matching Goti & Queen Themes
      for (const piece of pieces) {
        drawCrystalPiece(ctx, piece, theme, gotiTheme, queenTheme);
      }

      // 7. Draw Heavy Master Tournament Striker with Real-Time Power Ring
      if (status !== 'animating' || !striker.isPocketed) {
        drawStriker(ctx, striker, skin, status, aimPower, aimAngle);
      }

      // 8. Update & Draw Particles
      updateAndDrawParticles(ctx, particlesRef.current);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [pieces, striker, activePlayer, theme, skin, gotiTheme, queenTheme, status, aimAngle, aimPower, showAimGuide, guidelineLength, addImpactSparks]);

  return (
    <div className="relative w-full aspect-square max-w-[min(540px,94vw,calc(100dvh-230px))] max-h-[min(540px,94vw,calc(100dvh-230px))] mx-auto select-none touch-none rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.95)] border-2 border-[#d4af37]/40 ring-1 ring-black/80 shrink-0">
      <canvas
        id="royal-carrom-canvas"
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
        onPointerDown={onBoardPointerDown}
        onPointerMove={onBoardPointerMove}
        onPointerUp={onBoardPointerUp}
        onPointerCancel={onBoardPointerUp}
      />
    </div>
  );
};

// --- DRAWING HELPER FUNCTIONS ---

function drawBoardFrame(ctx: CanvasRenderingContext2D, theme: BoardTheme) {
  // 1. Deep Rich Wood Gradient Frame (Mysore Teak / Indian Rosewood)
  const frameGrad = ctx.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
  frameGrad.addColorStop(0, theme.woodColorLight);
  frameGrad.addColorStop(0.25, theme.woodColorDark);
  frameGrad.addColorStop(0.5, theme.woodColorLight);
  frameGrad.addColorStop(0.75, theme.woodColorDark);
  frameGrad.addColorStop(1, theme.woodColorLight);

  ctx.fillStyle = frameGrad;
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

  // Subtle Woodgrain simulation lines
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 4; i < CUSHION_INSET - 4; i += 5) {
    ctx.strokeRect(i, i, BOARD_SIZE - i * 2, BOARD_SIZE - i * 2);
  }
  ctx.restore();

  // 2. Inner Hardwood Cushion Rim
  ctx.fillStyle = theme.woodColorDark;
  ctx.fillRect(
    CUSHION_INSET - 8,
    CUSHION_INSET - 8,
    BOARD_SIZE - (CUSHION_INSET - 8) * 2,
    BOARD_SIZE - (CUSHION_INSET - 8) * 2
  );

  // 3. 24K Gold Inlaid Filigree Border Lines
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    CUSHION_INSET - 3,
    CUSHION_INSET - 3,
    BOARD_SIZE - (CUSHION_INSET - 3) * 2,
    BOARD_SIZE - (CUSHION_INSET - 3) * 2
  );

  ctx.strokeStyle = 'rgba(255, 223, 115, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    CUSHION_INSET - 6,
    CUSHION_INSET - 6,
    BOARD_SIZE - (CUSHION_INSET - 6) * 2,
    BOARD_SIZE - (CUSHION_INSET - 6) * 2
  );

  // 4. Four Corner Brass / Gold Plate Filigree Brackets
  const cornerSize = 52;
  const corners = [
    { x: 0, y: 0, r: 0 },
    { x: BOARD_SIZE, y: 0, r: Math.PI / 2 },
    { x: BOARD_SIZE, y: BOARD_SIZE, r: Math.PI },
    { x: 0, y: BOARD_SIZE, r: -Math.PI / 2 },
  ];

  for (const c of corners) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.r);

    // Brass corner plate
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.lineTo(cornerSize * 0.7, cornerSize * 0.3);
    ctx.lineTo(cornerSize * 0.3, cornerSize * 0.7);
    ctx.lineTo(0, cornerSize);
    ctx.closePath();

    const brassGrad = ctx.createLinearGradient(0, 0, cornerSize, cornerSize);
    brassGrad.addColorStop(0, '#FFF3C4');
    brassGrad.addColorStop(0.4, '#D4AF37');
    brassGrad.addColorStop(0.8, '#8C6718');
    brassGrad.addColorStop(1, '#5C4008');
    ctx.fillStyle = brassGrad;
    ctx.fill();

    ctx.strokeStyle = '#FFEAA7';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Corner brass rivets
    [
      { x: 12, y: 12 },
      { x: 38, y: 8 },
      { x: 8, y: 38 },
    ].forEach((rivet) => {
      ctx.beginPath();
      ctx.arc(rivet.x, rivet.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#4A2800';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rivet.x - 0.7, rivet.y - 0.7, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF3C4';
      ctx.fill();
    });

    ctx.restore();
  }
}

function drawFeltSurface(ctx: CanvasRenderingContext2D, theme: BoardTheme, activeSide: number) {
  const innerSize = PLAYABLE_MAX - PLAYABLE_MIN;

  // Felt Background with subtle central lighting gradient (smooth powder sheen)
  const feltGrad = ctx.createRadialGradient(
    BOARD_SIZE / 2,
    BOARD_SIZE / 2,
    20,
    BOARD_SIZE / 2,
    BOARD_SIZE / 2,
    BOARD_SIZE * 0.65
  );
  feltGrad.addColorStop(0, theme.feltColor);
  feltGrad.addColorStop(1, theme.feltPatternColor);

  ctx.fillStyle = feltGrad;
  ctx.fillRect(PLAYABLE_MIN, PLAYABLE_MIN, innerSize, innerSize);

  // Soft inner cushion contact drop-shadow
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 6;
  ctx.strokeRect(PLAYABLE_MIN + 3, PLAYABLE_MIN + 3, innerSize - 6, innerSize - 6);

  const cx = BOARD_SIZE / 2;
  const cy = BOARD_SIZE / 2;

  // --- Center Royal Lotus Mandala Rosette ---
  // Outer decorative ring
  ctx.beginPath();
  ctx.arc(cx, cy, 66, 0, Math.PI * 2);
  ctx.strokeStyle = theme.lineColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Secondary concentric ring
  ctx.beginPath();
  ctx.arc(cx, cy, 54, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 12-Petal Lotus Pattern
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * 38, cy + Math.sin(angle) * 38, 19, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Center Red Queen Base Circle
  ctx.beginPath();
  ctx.arc(cx, cy, 23, 0, Math.PI * 2);
  ctx.fillStyle = '#B02A2A';
  ctx.fill();
  ctx.strokeStyle = theme.lineColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central Gold Star Core
  ctx.beginPath();
  ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = theme.accentGold;
  ctx.fill();

  // --- Baselines and End Circles on 4 Sides ---
  BASELINES.forEach((b) => {
    const isActive = b.side === activeSide;
    ctx.strokeStyle = isActive ? theme.accentGold : theme.lineColor;
    ctx.lineWidth = isActive ? 2.6 : 1.8;

    if (b.side === 0 || b.side === 2) {
      // Horizontal Baselines (2 parallel lines 8px apart)
      ctx.beginPath();
      ctx.moveTo(b.minX, b.y - 4);
      ctx.lineTo(b.maxX, b.y - 4);
      ctx.moveTo(b.minX, b.y + 4);
      ctx.lineTo(b.maxX, b.y + 4);
      ctx.stroke();

      // Red End Circles
      [b.circle1, b.circle2].forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#A93226';
        ctx.fill();
        ctx.strokeStyle = theme.lineColor;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = theme.accentGold;
        ctx.fill();
      });
    } else {
      // Vertical Baselines (2 parallel lines 8px apart)
      ctx.beginPath();
      ctx.moveTo(b.x - 4, b.minY);
      ctx.lineTo(b.x - 4, b.maxY);
      ctx.moveTo(b.x + 4, b.minY);
      ctx.lineTo(b.x + 4, b.maxY);
      ctx.stroke();

      // Red End Circles
      [b.circle1, b.circle2].forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#A93226';
        ctx.fill();
        ctx.strokeStyle = theme.lineColor;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = theme.accentGold;
        ctx.fill();
      });
    }
  });

  // --- Diagonal Corner Pocket Arrows (Standard Carrom Design) ---
  const diagonals = [
    { signX: -1, signY: -1 }, // Top-Left
    { signX: 1, signY: -1 },  // Top-Right
    { signX: 1, signY: 1 },   // Bottom-Right
    { signX: -1, signY: 1 },  // Bottom-Left
  ];

  diagonals.forEach((diag) => {
    // Direction vector from center to corner
    const dx = diag.signX;
    const dy = diag.signY;
    const dist = Math.hypot(dx, dy);
    const nx = dx / dist;
    const ny = dy / dist;

    // Start point near the center mandala
    const startDist = 95;
    const startX = cx + nx * startDist;
    const startY = cy + ny * startDist;

    // End point near the pocket (pocket is at 42,42)
    const pocketX = cx + nx * (cx - 55);
    const pocketY = cy + ny * (cy - 55);

    // Draw the long diagonal line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(pocketX, pocketY);
    ctx.strokeStyle = theme.lineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw the small semi-circle base at the start of the diagonal
    ctx.beginPath();
    const angle = Math.atan2(ny, nx);
    // Draw an arc centered slightly further in, facing the corner
    ctx.arc(startX, startY, 12, angle - Math.PI / 2, angle + Math.PI / 2, true);
    ctx.strokeStyle = theme.lineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw the arrow inside/at the arc pointing to the pocket
    ctx.save();
    ctx.translate(startX + nx * 6, startY + ny * 6);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -5);
    ctx.lineTo(-8, 5);
    ctx.closePath();
    ctx.fillStyle = theme.lineColor;
    ctx.fill();
    ctx.restore();
  });
}

function drawPockets(ctx: CanvasRenderingContext2D, theme: BoardTheme) {
  for (const pocket of POCKETS) {
    // Pocket Hole Outer Dark Shadow
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fill();

    // Deep Recessed Pocket Well
    const holeGrad = ctx.createRadialGradient(
      pocket.x,
      pocket.y,
      2,
      pocket.x,
      pocket.y,
      pocket.radius
    );
    holeGrad.addColorStop(0, '#000000');
    holeGrad.addColorStop(0.7, '#07080c');
    holeGrad.addColorStop(1, '#181922');

    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
    ctx.fillStyle = holeGrad;
    ctx.fill();

    // Braided Netting Mesh Pattern inside pocket
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let i = -pocket.radius + 6; i < pocket.radius; i += 6) {
      ctx.beginPath();
      ctx.arc(pocket.x + i * 0.4, pocket.y + i * 0.4, pocket.radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Polished Brass Bevel Rim Accent
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPlacementZoneGlow(ctx: CanvasRenderingContext2D, side: number, theme: BoardTheme) {
  const b = BASELINES[side];
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 223, 115, 0.75)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';

  ctx.shadowColor = '#FFDF73';
  ctx.shadowBlur = 14;

  if (side === 0 || side === 2) {
    ctx.beginPath();
    ctx.moveTo(b.minX + STRIKER_RADIUS, b.y);
    ctx.lineTo(b.maxX - STRIKER_RADIUS, b.y);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(b.x, b.minY + STRIKER_RADIUS);
    ctx.lineTo(b.x, b.maxY - STRIKER_RADIUS);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Advanced Raycasting with Exact Cushion Rebound & Piece Deflection
 */
function drawAimingGuide(
  ctx: CanvasRenderingContext2D,
  striker: Piece,
  angle: number,
  power: number,
  pieces: Piece[],
  lengthSetting: 'standard' | 'extended' | 'full' | string = 'extended',
  theme: BoardTheme
) {
  const maxDist = lengthSetting === 'full' ? 650 : lengthSetting === 'standard' ? 220 : 380;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  // Playable bounds for striker center
  const minX = PLAYABLE_MIN + STRIKER_RADIUS;
  const maxX = PLAYABLE_MAX - STRIKER_RADIUS;
  const minY = PLAYABLE_MIN + STRIKER_RADIUS;
  const maxY = PLAYABLE_MAX - STRIKER_RADIUS;

  // 1. Find collision along primary ray
  const primaryResult = castStrikerRay(striker.x, striker.y, dirX, dirY, maxDist, pieces, striker.id, minX, maxX, minY, maxY);

  ctx.save();

  // Draw Primary Ray (Dotted Golden Directional Guide)
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = 'rgba(255, 223, 115, 0.95)';
  ctx.lineWidth = 2.4;
  ctx.shadowColor = '#FFDF73';
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(striker.x + dirX * STRIKER_RADIUS, striker.y + dirY * STRIKER_RADIUS);
  ctx.lineTo(primaryResult.hitX, primaryResult.hitY);
  ctx.stroke();

  // If hit a piece on primary ray
  if (primaryResult.hitPiece) {
    drawHitDeflection(ctx, primaryResult.hitX, primaryResult.hitY, primaryResult.hitPiece, power);
  } else if (primaryResult.hitCushion) {
    // 2. Draw Cushion Impact Marker & Rebound Trajectory
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(primaryResult.hitX, primaryResult.hitY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFEAA7';
    ctx.fill();

    // Compute reflected direction
    let reboundDirX = dirX;
    let reboundDirY = dirY;
    if (primaryResult.cushionNormal === 'x') reboundDirX = -dirX;
    if (primaryResult.cushionNormal === 'y') reboundDirY = -dirY;

    const remainingDist = Math.max(0, maxDist - primaryResult.dist);
    if (remainingDist > 20) {
      const reboundResult = castStrikerRay(
        primaryResult.hitX,
        primaryResult.hitY,
        reboundDirX,
        reboundDirY,
        remainingDist,
        pieces,
        striker.id,
        minX,
        maxX,
        minY,
        maxY
      );

      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(255, 175, 80, 0.85)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(primaryResult.hitX, primaryResult.hitY);
      ctx.lineTo(reboundResult.hitX, reboundResult.hitY);
      ctx.stroke();

      if (reboundResult.hitPiece) {
        drawHitDeflection(ctx, reboundResult.hitX, reboundResult.hitY, reboundResult.hitPiece, power * 0.8);
      }
    }
  }

  // 3. Draw Pullback Vector / Cue Indicator behind the striker
  if (power > 5) {
    const pullDist = (power / 100) * 55;
    const backX = striker.x - dirX * (STRIKER_RADIUS + pullDist);
    const backY = striker.y - dirY * (STRIKER_RADIUS + pullDist);

    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 77, 109, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(striker.x - dirX * STRIKER_RADIUS, striker.y - dirY * STRIKER_RADIUS);
    ctx.lineTo(backX, backY);
    ctx.stroke();

    // Pull Grip Bead
    ctx.beginPath();
    ctx.arc(backX, backY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4D6D';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

function castStrikerRay(
  startX: number,
  startY: number,
  dirX: number,
  dirY: number,
  maxDist: number,
  pieces: Piece[],
  strikerId: string,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) {
  let closestDist = maxDist;
  let hitPiece: Piece | null = null;
  let hitCushion = false;
  let cushionNormal: 'x' | 'y' | null = null;

  // 1. Test Wall Intersections
  if (dirX > 0.0001) {
    const dist = (maxX - startX) / dirX;
    if (dist > 0 && dist < closestDist) {
      closestDist = dist;
      hitCushion = true;
      cushionNormal = 'x';
    }
  } else if (dirX < -0.0001) {
    const dist = (minX - startX) / dirX;
    if (dist > 0 && dist < closestDist) {
      closestDist = dist;
      hitCushion = true;
      cushionNormal = 'x';
    }
  }

  if (dirY > 0.0001) {
    const dist = (maxY - startY) / dirY;
    if (dist > 0 && dist < closestDist) {
      closestDist = dist;
      hitCushion = true;
      cushionNormal = 'y';
      hitPiece = null;
    }
  } else if (dirY < -0.0001) {
    const dist = (minY - startY) / dirY;
    if (dist > 0 && dist < closestDist) {
      closestDist = dist;
      hitCushion = true;
      cushionNormal = 'y';
      hitPiece = null;
    }
  }

  // 2. Test Piece Intersections
  for (const p of pieces) {
    if (p.isPocketed || p.id === strikerId) continue;

    const px = p.x - startX;
    const py = p.y - startY;
    const proj = px * dirX + py * dirY;

    if (proj > 0 && proj < closestDist + p.radius) {
      const perpSq = px * px + py * py - proj * proj;
      const combinedRadius = STRIKER_RADIUS + p.radius;
      if (perpSq < combinedRadius * combinedRadius) {
        const hitDist = proj - Math.sqrt(combinedRadius * combinedRadius - perpSq);
        if (hitDist > 0 && hitDist < closestDist) {
          closestDist = hitDist;
          hitPiece = p;
          hitCushion = false;
          cushionNormal = null;
        }
      }
    }
  }

  return {
    hitX: startX + dirX * closestDist,
    hitY: startY + dirY * closestDist,
    dist: closestDist,
    hitPiece,
    hitCushion,
    cushionNormal,
  };
}

function drawHitDeflection(
  ctx: CanvasRenderingContext2D,
  hitX: number,
  hitY: number,
  hitPiece: Piece,
  power: number
) {
  // Ghost striker at impact position
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(hitX, hitY, STRIKER_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Deflection trajectory of target goti
  const deflectDx = hitPiece.x - hitX;
  const deflectDy = hitPiece.y - hitY;
  const deflectLen = Math.hypot(deflectDx, deflectDy);

  if (deflectLen > 0) {
    const normDx = deflectDx / deflectLen;
    const normDy = deflectDy / deflectLen;
    const deflectEndDist = Math.min(130, 45 + power * 0.85);

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle =
      hitPiece.type === 'queen' ? '#FF4D6D' : hitPiece.type === 'white' ? '#FFFFFF' : '#A0A0A0';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(hitPiece.x, hitPiece.y);
    ctx.lineTo(hitPiece.x + normDx * deflectEndDist, hitPiece.y + normDy * deflectEndDist);
    ctx.stroke();

    // Glowing Target Piece Ring
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(hitPiece.x, hitPiece.y, hitPiece.radius + 3.5, 0, Math.PI * 2);
    ctx.strokeStyle =
      hitPiece.type === 'queen' ? 'rgba(255, 77, 109, 0.9)' : 'rgba(255, 223, 115, 0.9)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }
}

/**
 * 3D Crystal Goties with Specular Highlights & Metallic Inlays
 */
function drawCrystalPiece(
  ctx: CanvasRenderingContext2D,
  piece: Piece,
  theme: BoardTheme,
  gotiTheme: GotiTheme = GOTI_THEMES[0],
  queenTheme: QueenTheme = QUEEN_THEMES[0]
) {
  const progress = piece.pocketProgress;
  const scale = piece.isPocketed ? Math.max(0.01, 1 - progress * 0.95) : 1;
  const opacity = piece.isPocketed ? Math.max(0, 1 - progress) : 1;
  const r = piece.radius * scale;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.rotation);

  // Soft Ambient Drop Shadow
  if (!piece.isPocketed) {
    ctx.beginPath();
    ctx.arc(2.5, 3.5, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fill();
  }

  // Piece Body & Crystal Finish
  if (piece.type === 'white') {
    // Ultra-Glossy 3D Ivory / Selected Goti Theme
    const whiteGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r);
    whiteGrad.addColorStop(0, gotiTheme.whiteGradStart);
    whiteGrad.addColorStop(0.4, gotiTheme.whiteGradMid);
    whiteGrad.addColorStop(1, gotiTheme.whiteGradEnd);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = whiteGrad;
    ctx.fill();

    // Concentric Metallic Engraved Grooves
    ctx.strokeStyle = gotiTheme.whiteRim;
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = gotiTheme.whiteGroove;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Center Core Bead
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = gotiTheme.whiteCore;
    ctx.fill();
    ctx.strokeStyle = gotiTheme.whiteRim;
    ctx.lineWidth = 0.8 * scale;
    ctx.stroke();
  } else if (piece.type === 'black') {
    // Ultra-Glossy Obsidian / Selected Goti Theme
    const blackGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r);
    blackGrad.addColorStop(0, gotiTheme.blackGradStart);
    blackGrad.addColorStop(0.4, gotiTheme.blackGradMid);
    blackGrad.addColorStop(1, gotiTheme.blackGradEnd);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = blackGrad;
    ctx.fill();

    // Metallic Rim & Grooves
    ctx.strokeStyle = gotiTheme.blackRim;
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = gotiTheme.blackGroove;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Center Core Bead
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = gotiTheme.blackCore;
    ctx.fill();
  } else if (piece.type === 'queen') {
    // Radiant Queen Crystal with Chosen Queen Theme & Emperor Crown
    const queenGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r);
    queenGrad.addColorStop(0, queenTheme.gradStart);
    queenGrad.addColorStop(0.4, queenTheme.gradMid);
    queenGrad.addColorStop(1, queenTheme.gradEnd);

    // Glowing Aura for Queen
    ctx.shadowColor = queenTheme.glowColor;
    ctx.shadowBlur = 10 * scale;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = queenGrad;
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Outer Rim
    ctx.strokeStyle = queenTheme.rimColor;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // Center Crown Star
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = queenTheme.crownColor;
    ctx.fill();
    ctx.strokeStyle = queenTheme.gemColor;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // 8-Pointed Royal Crown Jewel Rays
    for (let k = 0; k < 8; k++) {
      const rayAngle = (k * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rayAngle) * r * 0.36, Math.sin(rayAngle) * r * 0.36);
      ctx.lineTo(Math.cos(rayAngle) * r * 0.65, Math.sin(rayAngle) * r * 0.65);
      ctx.strokeStyle = queenTheme.rayColor;
      ctx.lineWidth = 1.3 * scale;
      ctx.stroke();
    }
  }

  // 3D Glass Specular Reflection
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.45, r * 0.22, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();

  ctx.restore();
}

/**
 * Heavy Tournament Striker with Real-Time Power Ring
 */
function drawStriker(
  ctx: CanvasRenderingContext2D,
  striker: Piece,
  skin: StrikerSkin,
  status: string,
  power: number,
  aimAngle: number
) {
  const r = striker.radius;
  ctx.save();
  ctx.translate(striker.x, striker.y);

  // 1. Dynamic Circular Power Meter Arc around striker
  if (status === 'aiming' || power > 5) {
    const powerRatio = power / 100;
    const meterRadius = r + 6;

    // Background track
    ctx.beginPath();
    ctx.arc(0, 0, meterRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Filled Power Arc (Gold to Crimson)
    ctx.beginPath();
    ctx.arc(0, 0, meterRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * powerRatio);
    ctx.strokeStyle = power > 75 ? '#FF4D6D' : power > 45 ? '#FFDF73' : '#2ECC71';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Power Value Tag
    if (power > 10) {
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#FFEAA7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(power)}%`, 0, -r - 14);
      ctx.restore();
    }
  }

  ctx.rotate(striker.rotation);

  // Soft Drop Shadow
  ctx.beginPath();
  ctx.arc(3.5, 4.5, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fill();

  // Outer Striker Body with Multi-Tiered Bevel
  const strikerGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r);
  strikerGrad.addColorStop(0, '#FFFFFF');
  strikerGrad.addColorStop(0.3, skin.primaryColor);
  strikerGrad.addColorStop(0.8, skin.secondaryColor);
  strikerGrad.addColorStop(1, '#15151E');

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = strikerGrad;
  ctx.fill();

  // Multi-Ring Gold Metal Inlays
  ctx.strokeStyle = '#FFEAA7';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
  ctx.stroke();

  // Skin Emblem Patterns
  if (skin.pattern === 'royal_crest') {
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r * 0.52, Math.sin(angle) * r * 0.52);
      ctx.strokeStyle = '#FFF3C4';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else if (skin.pattern === 'lotus_mandala') {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r * 0.32, Math.sin(angle) * r * 0.32, r * 0.24, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  } else if (skin.pattern === 'phoenix_sun') {
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r * 0.32, Math.sin(angle) * r * 0.32);
      ctx.lineTo(Math.cos(angle) * r * 0.54, Math.sin(angle) * r * 0.54);
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  } else if (skin.pattern === 'sapphire_cross') {
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1.8;
    for (let k = 0; k < 4; k++) {
      const angle = (k * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r * 0.54, Math.sin(angle) * r * 0.54);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // diamond_star & emerald_emperor
    ctx.strokeStyle = '#FFEAA7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.moveTo(0, -r * 0.5);
    ctx.lineTo(0, r * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.35);
    ctx.lineTo(r * 0.35, r * 0.35);
    ctx.moveTo(r * 0.35, -r * 0.35);
    ctx.lineTo(-r * 0.35, r * 0.35);
    ctx.stroke();
  }

  // Center Faceted Gemstone
  const gemGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, r * 0.26);
  gemGrad.addColorStop(0, '#FFFFFF');
  gemGrad.addColorStop(0.5, skin.gemColor);
  gemGrad.addColorStop(1, '#4A000D');

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2);
  ctx.fillStyle = gemGrad;
  ctx.fill();
  ctx.strokeStyle = '#FFF3C4';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glass Specular Highlight
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.45, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
  ctx.fill();

  ctx.restore();
}

function updateAndDrawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life -= 1 / p.maxLife;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }
}
