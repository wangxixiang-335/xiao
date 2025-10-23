export interface GameElement {
  id: string;
  type: ElementType;
  row: number;
  col: number;
  isMatched: boolean;
  isSelected: boolean;
  isAnimating: boolean;
}

export enum ElementType {
  STRAWBERRY = '🍓',
  LEMON = '🍋',
  ORANGE = '🍊',
  APPLE = '🍎',
  GRAPE = '🍇',
  BLUEBERRY = '🫐'
}

export interface GameGrid {
  rows: number;
  cols: number;
  cells: (GameElement | null)[][];
}

export interface GameState {
  score: number;
  moves: number;
  level: number;
  mode: GameMode;
  isGameActive: boolean;
  selectedCell: { row: number; col: number } | null;
  isAnimating: boolean;
  combo: number;
  isAutoCompleting: boolean;
  target?: GameTarget;
}

export enum GameMode {
  CLASSIC = 'classic',
  COLLECT = 'collect',
  INFINITE = 'infinite'
}

export interface GameTarget {
  type: ElementType;
  current: number;
  required: number;
}

export interface PlayerProgress {
  currentLevel: number;
  levelStars: Record<number, { stars: number; score: number }>;
  achievements: string[];
  infiniteModeHighScore: number;
}

export interface PlayerInventory {
  hammers: number;
  swappers: number;
  rainbowBalls: number;
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  vibration: boolean;
}

export interface PlayerData {
  playerId: string;
  settings: GameSettings;
  inventory: PlayerInventory;
  progress: PlayerProgress;
}

export interface LevelConfig {
  levelId: number;
  mode: GameMode;
  gridLayout: string;
  initialElements?: ElementType[][];
  target?: {
    type: ElementType;
    count: number;
  };
  moves: number;
  obstacles?: Obstacle[];
}

export interface Obstacle {
  type: 'ice' | 'chain' | 'rock';
  row: number;
  col: number;
  health: number;
}

export interface MatchResult {
  matches: GameElement[];
  specialCandies: SpecialCandy[];
  score: number;
}

export interface SpecialCandy {
  type: 'striped' | 'wrapped' | 'colorBomb';
  element: GameElement;
  direction?: 'horizontal' | 'vertical';
}