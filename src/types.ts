export interface Question {
  id: number;
  text: string;
  type: 'OX' | 'SUBJECTIVE';
  correctAnswer: 'O' | 'X' | string;
  explanation: string;
  options?: string[];
  placeholder?: string;
  suggestions?: string[]; // For cafeteria question 4 suggestions
}

export interface Point {
  x: number;
  y: number;
}

export interface Checkpoint {
  id: number; // 1, 2, 3, 4
  title: string;
  question: Question;
  point: Point; // Map coordinate percentage (0 - 100)
}

export type GameStatus = 'INTRO' | 'PLAYING' | 'FAIL' | 'SUCCESS';

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  vx: number;
  vy: number;
  life: number;
}
