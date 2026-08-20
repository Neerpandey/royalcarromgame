export type GameMode = '1v1' | 'vs_bot' | '2v2' | '3p' | '4p' | 'practice';

export type BotDifficulty = 'rookie' | 'maharaja' | 'grandmaster';

export type PieceType = 'white' | 'black' | 'queen' | 'striker';

export type CoinAssignment = 'white' | 'black' | 'any';

export interface Piece {
  id: string;
  type: PieceType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isPocketed: boolean;
  pocketProgress: number; // 0 = on board, 1 = fully dropped into pocket
  pocketId?: number;
  rotation: number;
  angularVelocity: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  side: 0 | 1 | 2 | 3; // 0: South (bottom), 1: East (right), 2: North (top), 3: West (left)
  team?: 1 | 2; // For 2v2: Team 1 (P1 & P3) vs Team 2 (P2 & P4)
  assignedCoin?: CoinAssignment; // 'white' | 'black' | 'any' (for points/FFA)
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  score: number;
  coinsPocketed: {
    white: number;
    black: number;
    queen: number;
  };
  fouls: number;
  penaltyDues: number; // Dues to return to center upon next pocketing
  currentQueenNeedsCover: boolean;
  pendingQueenId?: string;
  pendingQueenIds?: string[];
  coveredQueens: number;
  totalShots?: number;
  successfulShots?: number;
  currentCombo?: number;
  highestCombo?: number;
}

export interface BoardTheme {
  id: string;
  name: string;
  feltColor: string;
  feltPatternColor: string;
  woodColorDark: string;
  woodColorLight: string;
  lineColor: string;
  accentGold: string;
  rosettePattern: string;
  category?: string;
}

export interface GotiTheme {
  id: string;
  name: string;
  description: string;
  whiteGradStart: string;
  whiteGradMid: string;
  whiteGradEnd: string;
  whiteRim: string;
  whiteGroove: string;
  whiteCore: string;
  blackGradStart: string;
  blackGradMid: string;
  blackGradEnd: string;
  blackRim: string;
  blackGroove: string;
  blackCore: string;
}

export interface QueenTheme {
  id: string;
  name: string;
  title: string;
  glowColor: string;
  gradStart: string;
  gradMid: string;
  gradEnd: string;
  rimColor: string;
  crownColor: string;
  gemColor: string;
  rayColor: string;
}

export interface StrikerSkin {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  gemColor: string;
  pattern: 'royal_crest' | 'lotus_mandala' | 'diamond_star' | 'emerald_emperor' | 'phoenix_sun' | 'sapphire_cross';
}

export interface GameSettings {
  boardTheme: string;
  strikerSkin: string;
  gotiTheme: string;
  queenTheme: string;
  powderLevel: number; // 0.85 = fast boric powder, 1.0 = normal, 1.2 = high friction
  soundVolume: number;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  bgmVolume: number;
  screenShakeEnabled: boolean;
  enableTurnTimer: boolean;
  turnTimeSeconds: number;
  aimGuidelineLength: 'standard' | 'extended' | 'full';
  queensCount: 2 | 1;
  queenPoints: number;
  whitePoints: number;
  blackPoints: number;
  enableCoinAssignment: boolean; // Assign White/Black to players in 1v1 and 2v2
  strictFouls: boolean; // Opponent coin sinking & no-hit foul penalties
}

export interface TurnNotification {
  id: string;
  text: string;
  subtext?: string;
  type: 'foul' | 'queen' | 'white' | 'black' | 'cover_success' | 'cover_failed' | 'strike' | 'double_queen';
}

export interface ShotResult {
  pocketed: Piece[];
  strikerPocketed: boolean;
  firstHitPiece?: Piece;
  hasFoul: boolean;
  foulReason?: string;
  queenCovered: boolean;
  queenReturnedToCenter: boolean;
}

