import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Checkpoint, Particle } from '../types';
import { soundManager } from '../utils/audio';
import Bee from './Bee';
import { Milestone, Trophy, Lock, CheckCircle2 } from 'lucide-react';

interface GameMapProps {
  currentCheckpoint: number; // 0 (start), 1..6 (checkpoints), 7 (reached goal)
  checkpoints: Checkpoint[];
  solvedStages?: Record<number, boolean>;
  isBeeTravelling: boolean;
  setIsBeeTravelling: (travelling: boolean) => void;
  onReachCheckpoint: (checkpointId: number) => void;
  onReachGoal: () => void;
}

interface GridCell {
  c: number;
  r: number;
}

// ============================================================================
// 11 x 7 PERFECT GARDEN HEDGE LABYRINTH SPECIFICATION (77 cells, 0 orphans)
// Every consecutive pair in SOLUTION_PATH & DEAD_END_BRANCHES is orthogonal.
// ============================================================================
const COLS = 11;
const ROWS = 7;
const CELL = 80;
const PAD_X = 28;
const PAD_Y = 28;
const SVG_W = PAD_X * 2 + COLS * CELL; // 936
const SVG_H = PAD_Y * 2 + ROWS * CELL; // 616

const SOLUTION_PATH: GridCell[] = [
  // 0: Start Entrance (bottom-left)
  { c: 0, r: 6 },
  { c: 1, r: 6 },
  { c: 1, r: 5 },
  { c: 0, r: 5 },
  { c: 0, r: 4 },
  { c: 1, r: 4 },
  { c: 1, r: 3 },
  // 7: Checkpoint 1 — 클로버 들판
  { c: 1, r: 2 },

  { c: 1, r: 1 },
  { c: 2, r: 1 },
  { c: 2, r: 2 },
  { c: 2, r: 3 },
  { c: 3, r: 3 },
  { c: 3, r: 4 },
  { c: 2, r: 4 },
  { c: 2, r: 5 },
  // 16: Checkpoint 2 — 장미 벌판
  { c: 3, r: 5 },

  { c: 3, r: 6 },
  { c: 4, r: 6 },
  { c: 4, r: 5 },
  { c: 4, r: 4 },
  { c: 5, r: 4 },
  { c: 5, r: 3 },
  { c: 4, r: 3 },
  { c: 4, r: 2 },
  // 25: Checkpoint 3 — 메밀꽃밭
  { c: 4, r: 1 },

  { c: 4, r: 0 },
  { c: 5, r: 0 },
  { c: 6, r: 0 },
  { c: 6, r: 1 },
  { c: 5, r: 1 },
  { c: 5, r: 2 },
  { c: 6, r: 2 },
  { c: 6, r: 3 },
  { c: 6, r: 4 },
  // 35: Checkpoint 4 — 해바라기 정원
  { c: 6, r: 5 },

  { c: 6, r: 6 },
  { c: 7, r: 6 },
  { c: 7, r: 5 },
  { c: 7, r: 4 },
  { c: 7, r: 3 },
  { c: 7, r: 2 },
  { c: 7, r: 1 },
  { c: 8, r: 1 },
  // 44: Checkpoint 5 — 벚꽃 동산
  { c: 8, r: 2 },

  { c: 8, r: 3 },
  { c: 9, r: 3 },
  { c: 9, r: 4 },
  { c: 8, r: 4 },
  { c: 8, r: 5 },
  // 50: Checkpoint 6 — 무궁화 꽃밭
  { c: 9, r: 5 },

  { c: 9, r: 6 },
  { c: 10, r: 6 },
  { c: 10, r: 5 },
  { c: 10, r: 4 },
  { c: 10, r: 3 },
  { c: 10, r: 2 },
  { c: 9, r: 2 },
  { c: 9, r: 1 },
  { c: 10, r: 1 },
  // 60: Final Goal — 황금 꽃밭 (top-right)
  { c: 10, r: 0 },
];

// Authentic labyrinth dead-end corridors covering all remaining 16 cells
const DEAD_END_BRANCHES: GridCell[][] = [
  // Branch A: Long upper-left false corridor (Ladybug alcove)
  [
    { c: 0, r: 4 },
    { c: 0, r: 3 },
    { c: 0, r: 2 },
    { c: 0, r: 1 },
    { c: 0, r: 0 },
    { c: 1, r: 0 },
  ],
  // Branch B: Upper-mid loop around CP 1 & CP 3
  [
    { c: 2, r: 1 },
    { c: 2, r: 0 },
    { c: 3, r: 0 },
    { c: 3, r: 1 },
    { c: 3, r: 2 },
  ],
  // Branch C: Bottom-left alcove
  [
    { c: 2, r: 5 },
    { c: 2, r: 6 },
  ],
  // Branch D: Bottom-center alcove (Caterpillar alcove)
  [
    { c: 4, r: 5 },
    { c: 5, r: 5 },
    { c: 5, r: 6 },
  ],
  // Branch E: Tantalizing upper-right dead end stopping right beside Goal's wall
  [
    { c: 7, r: 1 },
    { c: 7, r: 0 },
    { c: 8, r: 0 },
    { c: 9, r: 0 },
  ],
  // Branch F: Bottom-right alcove
  [
    { c: 8, r: 5 },
    { c: 8, r: 6 },
  ],
];

// Index in SOLUTION_PATH for: [Start, CP1, CP2, CP3, CP4, CP5, CP6, Goal]
const CHECKPOINT_PATH_INDICES = [0, 7, 16, 25, 35, 44, 50, 60];

const CHECKPOINT_THEMES = [
  { icon: '🍀', shortLabel: '1. 클로버', padFill: '#d1fae5', padStroke: '#059669', badgeBg: '#059669', labelPlacement: 'bottom' as const },
  { icon: '🌹', shortLabel: '2. 장미', padFill: '#ffe4e6', padStroke: '#e11d48', badgeBg: '#e11d48', labelPlacement: 'top' as const },
  { icon: '🌾', shortLabel: '3. 메밀꽃', padFill: '#fef3c7', padStroke: '#d97706', badgeBg: '#d97706', labelPlacement: 'bottom' as const },
  { icon: '🌻', shortLabel: '4. 해바라기', padFill: '#fef9c3', padStroke: '#ca8a04', badgeBg: '#ca8a04', labelPlacement: 'top' as const },
  { icon: '🌸', shortLabel: '5. 벚꽃', padFill: '#fce7f3', padStroke: '#db2777', badgeBg: '#db2777', labelPlacement: 'top' as const },
  { icon: '🌺', shortLabel: '6. 무궁화', padFill: '#ede9fe', padStroke: '#7c3aed', badgeBg: '#7c3aed', labelPlacement: 'top' as const },
];

// Coordinate helpers
const cellCenterX = (c: number) => PAD_X + (c + 0.5) * CELL;
const cellCenterY = (r: number) => PAD_Y + (r + 0.5) * CELL;
const toPctX = (svgX: number) => (svgX / SVG_W) * 100;
const toPctY = (svgY: number) => (svgY / SVG_H) * 100;

function edgeKey(c1: number, r1: number, c2: number, r2: number): string {
  if (c1 < c2 || (c1 === c2 && r1 < r2)) {
    return `${c1},${r1}-${c2},${r2}`;
  }
  return `${c2},${r2}-${c1},${r1}`;
}

interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface HedgeBlossom {
  x: number;
  y: number;
  color: string;
}

function buildMazeGeometry() {
  const openEdges = new Set<string>();

  for (let i = 0; i < SOLUTION_PATH.length - 1; i++) {
    const a = SOLUTION_PATH[i];
    const b = SOLUTION_PATH[i + 1];
    openEdges.add(edgeKey(a.c, a.r, b.c, b.r));
  }

  for (const branch of DEAD_END_BRANCHES) {
    for (let i = 0; i < branch.length - 1; i++) {
      const a = branch[i];
      const b = branch[i + 1];
      openEdges.add(edgeKey(a.c, a.r, b.c, b.r));
    }
  }

  const walls: WallSegment[] = [];

  // Horizontal walls (r = 0..ROWS, c = 0..COLS-1)
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isOuterBorder = r === 0 || r === ROWS;
      const isClosedInterior = !isOuterBorder && !openEdges.has(edgeKey(c, r - 1, c, r));
      if (isOuterBorder || isClosedInterior) {
        walls.push({
          x1: PAD_X + c * CELL,
          y1: PAD_Y + r * CELL,
          x2: PAD_X + (c + 1) * CELL,
          y2: PAD_Y + r * CELL,
        });
      }
    }
  }

  // Vertical walls (c = 0..COLS, r = 0..ROWS-1)
  for (let c = 0; c <= COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      // Leave entrance open on left of Start (0, 6) and exit open on right of Goal (10, 0)
      if (c === 0 && r === 6) continue;
      if (c === COLS && r === 0) continue;

      const isOuterBorder = c === 0 || c === COLS;
      const isClosedInterior = !isOuterBorder && !openEdges.has(edgeKey(c - 1, r, c, r));
      if (isOuterBorder || isClosedInterior) {
        walls.push({
          x1: PAD_X + c * CELL,
          y1: PAD_Y + r * CELL,
          x2: PAD_X + c * CELL,
          y2: PAD_Y + (r + 1) * CELL,
        });
      }
    }
  }

  const wallPathD = walls.map((w) => `M ${w.x1} ${w.y1} L ${w.x2} ${w.y2}`).join(' ');

  // Deterministic decorative tiny blossoms & foliage highlights along hedge walls
  const blossoms: HedgeBlossom[] = [];
  const palette = ['#fef08a', '#fbcfe8', '#ffffff', '#fed7aa'];
  walls.forEach((w, idx) => {
    if (idx % 4 === 1) {
      const mx = (w.x1 + w.x2) / 2;
      const my = (w.y1 + w.y2) / 2;
      blossoms.push({
        x: mx,
        y: my - 2,
        color: palette[idx % palette.length],
      });
    }
  });

  return { walls, wallPathD, blossoms };
}

export default function GameMap({
  currentCheckpoint,
  checkpoints,
  solvedStages = {},
  isBeeTravelling,
  setIsBeeTravelling,
  onReachCheckpoint,
  onReachGoal,
}: GameMapProps) {
  const { wallPathD, blossoms } = useMemo(() => buildMazeGeometry(), []);

  // Bee position in SVG coordinates + continuous progress index along SOLUTION_PATH (0..60)
  const [beeSvgPos, setBeeSvgPos] = useState({
    x: cellCenterX(SOLUTION_PATH[0].c),
    y: cellCenterY(SOLUTION_PATH[0].r),
  });
  const [beePathProgress, setBeePathProgress] = useState<number>(0);
  const [beeDirection, setBeeDirection] = useState<'left' | 'right'>('right');
  const [beeExpression, setBeeExpression] = useState<'HAPPY' | 'BUZZING' | 'DIZZY' | 'THINKING'>('BUZZING');

  // Nectar particles state (in percentage coordinates)
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);

  // Classroom interactive critters in dead-end alcoves
  const [clickCountLadybug, setClickCountLadybug] = useState(0);
  const [clickCountCaterpillar, setClickCountCaterpillar] = useState(0);
  const [ladybugBubble, setLadybugBubble] = useState('');
  const [caterpillarBubble, setCaterpillarBubble] = useState('');

  // Refs for animation loops & exact aspect-ratio board sizing
  const requestRef = useRef<number | null>(null);
  const sourceCheckpointRef = useRef<number>(0);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const [boardSize, setBoardSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = stageContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const aspect = SVG_W / SVG_H;
      let width = rect.width;
      let height = width / aspect;
      if (height > rect.height) {
        height = rect.height;
        width = height * aspect;
      }
      setBoardSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Trigger bee travel when currentCheckpoint advances
  useEffect(() => {
    const targetCheckpoint = currentCheckpoint;
    const sourceCheckpoint = sourceCheckpointRef.current;

    if (targetCheckpoint > sourceCheckpoint) {
      setIsBeeTravelling(true);
      setBeeExpression('HAPPY');
      animateBee(sourceCheckpoint, targetCheckpoint);
    } else if (targetCheckpoint < sourceCheckpoint) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      sourceCheckpointRef.current = targetCheckpoint;
      const pathIdx = CHECKPOINT_PATH_INDICES[targetCheckpoint];
      setBeePathProgress(pathIdx);
      setBeeSvgPos({
        x: cellCenterX(SOLUTION_PATH[pathIdx].c),
        y: cellCenterY(SOLUTION_PATH[pathIdx].r),
      });
      setBeeDirection('right');
      setBeeExpression('BUZZING');
    } else {
      if (targetCheckpoint === 7) {
        setBeeExpression('HAPPY');
      } else if (targetCheckpoint === 0) {
        setBeeExpression('BUZZING');
      } else {
        setBeeExpression('THINKING');
      }
    }
  }, [currentCheckpoint]);

  // Particle update loop
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            opacity: p.opacity - 0.055,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0 && p.opacity > 0)
      );
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Animate bee crisply through the maze corridors cell-by-cell
  const animateBee = (startCP: number, targetCP: number) => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const startIndex = CHECKPOINT_PATH_INDICES[startCP];
    const targetIndex = CHECKPOINT_PATH_INDICES[targetCP];
    const stepsBetween = targetIndex - startIndex;

    // 11 frames per grid cell (~180ms/cell at 60fps) for crisp, readable maze navigation
    const framesPerCell = 11;
    const totalFrames = Math.max(1, stepsBetween * framesPerCell);
    let frame = 0;

    const tick = () => {
      frame++;
      const currentPct = Math.min(1, frame / totalFrames);

      if (frame % 15 === 0) {
        soundManager.playBuzz();
      }

      const exactProgress = startIndex + currentPct * stepsBetween;
      const currentNodeIdx = Math.floor(exactProgress);
      const relativePct = exactProgress - currentNodeIdx;

      if (currentNodeIdx >= targetIndex || frame >= totalFrames) {
        const finalCell = SOLUTION_PATH[targetIndex];
        setBeePathProgress(targetIndex);
        setBeeSvgPos({
          x: cellCenterX(finalCell.c),
          y: cellCenterY(finalCell.r),
        });
        setIsBeeTravelling(false);
        sourceCheckpointRef.current = targetCP;

        if (targetCP === 7) {
          setBeeExpression('HAPPY');
          onReachGoal();
        } else {
          setBeeExpression('THINKING');
          onReachCheckpoint(targetCP);
        }
        return;
      }

      const cellA = SOLUTION_PATH[currentNodeIdx];
      const cellB = SOLUTION_PATH[currentNodeIdx + 1];

      const ax = cellCenterX(cellA.c);
      const ay = cellCenterY(cellA.r);
      const bx = cellCenterX(cellB.c);
      const by = cellCenterY(cellB.r);

      const curX = ax + (bx - ax) * relativePct;
      const curY = ay + (by - ay) * relativePct;

      if (cellB.c > cellA.c) {
        setBeeDirection('right');
      } else if (cellB.c < cellA.c) {
        setBeeDirection('left');
      }

      setBeePathProgress(exactProgress);
      setBeeSvgPos({ x: curX, y: curY });

      // Emit golden nectar trail sparkles
      if (Math.random() > 0.45) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.28 + 0.08;
        setParticles((prev) => [
          ...prev.slice(-24),
          {
            id: ++particleIdCounter.current,
            x: toPctX(curX),
            y: toPctY(curY),
            size: Math.random() * 4 + 3,
            color: Math.random() > 0.35 ? '#FCD34D' : '#F59E0B',
            opacity: 1,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.12,
            life: 18,
          },
        ]);
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Build SVG path string for the bee's traveled golden honey trail
  const traveledTrailD = useMemo(() => {
    if (beePathProgress <= 0.01) return '';
    const wholeIdx = Math.floor(beePathProgress);
    let d = `M ${cellCenterX(SOLUTION_PATH[0].c)} ${cellCenterY(SOLUTION_PATH[0].r)}`;
    for (let i = 1; i <= Math.min(wholeIdx, SOLUTION_PATH.length - 1); i++) {
      d += ` L ${cellCenterX(SOLUTION_PATH[i].c)} ${cellCenterY(SOLUTION_PATH[i].r)}`;
    }
    d += ` L ${beeSvgPos.x} ${beeSvgPos.y}`;
    return d;
  }, [beePathProgress, beeSvgPos]);

  // Interactive dead-end critters handlers
  const handleLadybugClick = () => {
    soundManager.playClick();
    const bubbles = [
      '무당벌레: 여긴 막다른 길이야! 돌아가~ 🐞',
      '무당벌레: 꿀벌아, 관문 문제를 맞춰야 문이 열려!',
      '무당벌레: 윙윙 탐정님 화이팅! 📣',
      '무당벌레: 진딧물은 꼼짝 마라! ✨',
    ];
    setLadybugBubble(bubbles[clickCountLadybug % bubbles.length]);
    setClickCountLadybug((c) => c + 1);
    setTimeout(() => setLadybugBubble(''), 2600);
  };

  const handleCaterpillarClick = () => {
    soundManager.playClick();
    const bubbles = [
      '애벌레: 여기도 막다른 미로 골목이야~ 🐛',
      '애벌레: 아삭아삭, 나뭇잎이 너무 맛있어!',
      '애벌레: 지구가 계속 따뜻해지면 힘들어 ㅠㅠ',
      '애벌레: 6개 관문을 모두 열어 꽃밭으로 가자!',
    ];
    setCaterpillarBubble(bubbles[clickCountCaterpillar % bubbles.length]);
    setClickCountCaterpillar((c) => c + 1);
    setTimeout(() => setCaterpillarBubble(''), 2600);
  };

  // Next checkpoint target ID (1..7) when ready to depart
  const isCurrentSolved = currentCheckpoint === 0 || Boolean(solvedStages[currentCheckpoint]);
  const nextTargetCP = !isBeeTravelling && isCurrentSolved && currentCheckpoint < 7 ? currentCheckpoint + 1 : null;

  // Dead-end alcove coordinates for interactive critters
  const ladybugPos = { x: toPctX(cellCenterX(0)), y: toPctY(cellCenterY(1)) };
  const caterpillarPos = { x: toPctX(cellCenterX(5)), y: toPctY(cellCenterY(6)) };

  return (
    <div id="garden-stage" className="relative w-full h-full bg-gradient-to-b from-emerald-100 via-emerald-50 to-lime-100 flex flex-col overflow-hidden select-none">
      {/* Subtle maze animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes honey-dash {
          to { stroke-dashoffset: -32; }
        }
        @keyframes beacon-ring {
          0% { transform: scale(0.85); opacity: 0.85; }
          70% { transform: scale(1.32); opacity: 0; }
          100% { transform: scale(1.32); opacity: 0; }
        }
        .honey-trail-dash {
          animation: honey-dash 1.8s linear infinite;
        }
        .maze-beacon-ring {
          transform-box: fill-box;
          transform-origin: center;
          animation: beacon-ring 1.6s ease-out infinite;
        }
      `}} />

      {/* Main Centered Aspect-Locked Real Labyrinth Board */}
      <div className="flex-1 min-h-0 w-full p-2 sm:p-3">
        <div
          ref={stageContainerRef}
          className="relative w-full h-full flex items-center justify-center"
        >
          <div
            className="relative shadow-xl rounded-2xl overflow-visible"
            style={
              boardSize
                ? { width: `${boardSize.width}px`, height: `${boardSize.height}px` }
                : { width: '100%', aspectRatio: `${SVG_W} / ${SVG_H}` }
            }
          >
            {/* ============================================================== */}
            {/* LAYER 1: COMPLETE 11x7 SVG GARDEN HEDGE MAZE                   */}
            {/* ============================================================== */}
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full h-full block rounded-2xl"
              preserveAspectRatio="xMidYMid meet"
              aria-label="6개 관문을 통과하는 숲속 정원 미로 지도"
            >
              <defs>
                {/* Sunlit outer grass backdrop */}
                <linearGradient id="maze-lawn-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dcfce7" />
                  <stop offset="50%" stopColor="#bbf7d0" />
                  <stop offset="100%" stopColor="#d9f99d" />
                </linearGradient>

                {/* Warm garden sandstone corridor floor */}
                <linearGradient id="maze-floor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fefce8" />
                  <stop offset="100%" stopColor="#fef3c7" />
                </linearGradient>

                {/* Royal golden goal glow */}
                <radialGradient id="goal-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
                  <stop offset="65%" stopColor="#fef08a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Outer Meadow Canvas */}
              <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="18" fill="url(#maze-lawn-bg)" />

              {/* Maze Courtyard Base Floor */}
              <rect
                x={PAD_X}
                y={PAD_Y}
                width={COLS * CELL}
                height={ROWS * CELL}
                rx="8"
                fill="url(#maze-floor-grad)"
              />

              {/* Subtle Stepping-Stone Tiles on All 77 Maze Cells */}
              <g>
                {Array.from({ length: ROWS }).map((_, r) =>
                  Array.from({ length: COLS }).map((__, c) => {
                    const isEven = (c + r) % 2 === 0;
                    return (
                      <rect
                        key={`tile-${c}-${r}`}
                        x={PAD_X + c * CELL + 8}
                        y={PAD_Y + r * CELL + 8}
                        width={CELL - 16}
                        height={CELL - 16}
                        rx="12"
                        fill={isEven ? '#faf1d6' : '#f5e7c2'}
                        fillOpacity="0.72"
                      />
                    );
                  })
                )}
              </g>

              {/* Entrance Welcome Mat & Arrow on Left Opening of Start (0, 6) */}
              <g>
                <rect
                  x={2}
                  y={PAD_Y + 6 * CELL + 12}
                  width={PAD_X + 12}
                  height={CELL - 24}
                  rx="8"
                  fill="#fef08a"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />
                <path
                  d={`M 9 ${cellCenterY(6)} L 21 ${cellCenterY(6)} M 16 ${cellCenterY(6) - 5} L 21 ${cellCenterY(6)} L 16 ${cellCenterY(6) + 5}`}
                  stroke="#0f172a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>

              {/* Exit Royal Archway Mat on Right Opening of Goal (10, 0) */}
              <g>
                <rect
                  x={PAD_X + COLS * CELL - 8}
                  y={PAD_Y + 12}
                  width={PAD_X + 6}
                  height={CELL - 24}
                  rx="8"
                  fill="#fde047"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />
              </g>

              {/* Dead-End Subtle Botanical Clues */}
              <text x={cellCenterX(3)} y={cellCenterY(2) + 8} textAnchor="middle" fontSize="24" opacity="0.85">
                🍄
              </text>
              <text x={cellCenterX(2)} y={cellCenterY(6) + 8} textAnchor="middle" fontSize="22" opacity="0.8">
                🌱
              </text>
              <g opacity="0.85">
                <text x={cellCenterX(9)} y={cellCenterY(0) + 5} textAnchor="middle" fontSize="22">
                  🌼
                </text>
                <text x={cellCenterX(9)} y={cellCenterY(0) + 23} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#78716c">
                  막다른 길
                </text>
              </g>
              <text x={cellCenterX(8)} y={cellCenterY(6) + 8} textAnchor="middle" fontSize="22" opacity="0.8">
                🌷
              </text>

              {/* Traveled Golden Honey Trail Behind the Bee */}
              {traveledTrailD && (
                <g>
                  <path
                    d={traveledTrailD}
                    fill="none"
                    stroke="#facc15"
                    strokeOpacity="0.48"
                    strokeWidth="26"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={traveledTrailD}
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="7 9"
                    className="honey-trail-dash"
                  />
                </g>
              )}

              {/* START OFFICE FLOOR PAD (0, 6) */}
              <g>
                <circle
                  cx={cellCenterX(0)}
                  cy={cellCenterY(6)}
                  r="25"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="3"
                />
                <text x={cellCenterX(0)} y={cellCenterY(6) + 7} textAnchor="middle" fontSize="23">
                  🪵
                </text>
              </g>

              {/* 6 CHECKPOINT FLOOR PADS & FLOWERS (1..6) */}
              {checkpoints.map((cp) => {
                const pathIdx = CHECKPOINT_PATH_INDICES[cp.id];
                const cell = SOLUTION_PATH[pathIdx];
                const theme = CHECKPOINT_THEMES[cp.id - 1];
                if (!cell || !theme) return null;

                const cx = cellCenterX(cell.c);
                const cy = cellCenterY(cell.r);
                const isSolved = Boolean(solvedStages[cp.id]) || currentCheckpoint > cp.id;
                const isActive = currentCheckpoint === cp.id && !isSolved;
                const isNext = nextTargetCP === cp.id;

                return (
                  <g key={`cp-pad-${cp.id}`}>
                    {(isActive || isNext) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="30"
                        fill="none"
                        stroke={isActive ? '#ef4444' : '#f59e0b'}
                        strokeWidth="4"
                        className="maze-beacon-ring"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="25"
                      fill={isSolved ? '#ecfdf5' : theme.padFill}
                      stroke={isSolved ? '#10b981' : isActive ? '#0f172a' : theme.padStroke}
                      strokeWidth={isActive || isSolved ? '3.5' : '2.5'}
                      opacity={isSolved || isActive || isNext ? 1 : 0.88}
                    />
                    <text
                      x={cx}
                      y={cy + 8}
                      textAnchor="middle"
                      fontSize="25"
                      opacity={isSolved || isActive || isNext ? 1 : 0.78}
                    >
                      {theme.icon}
                    </text>
                  </g>
                );
              })}

              {/* FINAL GOAL FLOOR PAD (10, 0) */}
              <g>
                <circle cx={cellCenterX(10)} cy={cellCenterY(0)} r="35" fill="url(#goal-glow)" />
                {(currentCheckpoint === 7 || nextTargetCP === 7) && (
                  <circle
                    cx={cellCenterX(10)}
                    cy={cellCenterY(0)}
                    r="30"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="4.5"
                    className="maze-beacon-ring"
                  />
                )}
                <circle
                  cx={cellCenterX(10)}
                  cy={cellCenterY(0)}
                  r="25"
                  fill="#fef08a"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                />
                <text x={cellCenterX(10)} y={cellCenterY(0) + 8} textAnchor="middle" fontSize="25">
                  👑
                </text>
              </g>

              {/* ============================================================ */}
              {/* 6 PHYSICAL CORRIDOR GATES (TUCKED NEATLY INTO HEDGE WALLS)   */}
              {/* ============================================================ */}
              {checkpoints.map((cp) => {
                const idx = CHECKPOINT_PATH_INDICES[cp.id];
                const curr = SOLUTION_PATH[idx];
                const next = SOLUTION_PATH[idx + 1];
                if (!curr || !next) return null;

                const isSolved = Boolean(solvedStages[cp.id]) || currentCheckpoint > cp.id;
                const isHorizontalGate = curr.c === next.c;
                const midX = (cellCenterX(curr.c) + cellCenterX(next.c)) / 2;
                const midY = (cellCenterY(curr.r) + cellCenterY(next.r)) / 2;

                if (isSolved) {
                  return (
                    <g key={`gate-open-${cp.id}`}>
                      {isHorizontalGate ? (
                        <>
                          <circle cx={midX - 24} cy={midY} r="5.5" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
                          <circle cx={midX + 24} cy={midY} r="5.5" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
                        </>
                      ) : (
                        <>
                          <circle cx={midX} cy={midY - 24} r="5.5" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
                          <circle cx={midX} cy={midY + 24} r="5.5" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
                        </>
                      )}
                    </g>
                  );
                }

                return (
                  <g key={`gate-locked-${cp.id}`}>
                    {isHorizontalGate ? (
                      <>
                        <rect
                          x={midX - 36}
                          y={midY - 6}
                          width="72"
                          height="12"
                          rx="3"
                          fill="#dc2626"
                          stroke="#0f172a"
                          strokeWidth="2.5"
                        />
                        <line x1={midX - 22} y1={midY - 5} x2={midX - 15} y2={midY + 5} stroke="#fef08a" strokeWidth="3" />
                        <line x1={midX + 15} y1={midY - 5} x2={midX + 22} y2={midY + 5} stroke="#fef08a" strokeWidth="3" />
                      </>
                    ) : (
                      <rect
                        x={midX - 6}
                        y={midY - 36}
                        width="12"
                        height="72"
                        rx="3"
                        fill="#dc2626"
                        stroke="#0f172a"
                        strokeWidth="2.5"
                      />
                    )}
                    <circle cx={midX} cy={midY} r="10.5" fill="#fde047" stroke="#0f172a" strokeWidth="2.4" />
                    <text x={midX} y={midY + 4} textAnchor="middle" fontSize="11">
                      🔒
                    </text>
                  </g>
                );
              })}

              {/* ============================================================ */}
              {/* MULTI-LAYERED 3D TOP-DOWN GARDEN HEDGE WALLS                 */}
              {/* ============================================================ */}
              <g pointerEvents="none">
                {/* 1. Soft Cast Shadow */}
                <path
                  d={wallPathD}
                  fill="none"
                  stroke="#0f172a"
                  strokeOpacity="0.18"
                  strokeWidth="21"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(4, 5)"
                />
                {/* 2. Crisp Storybook Dark Outline */}
                <path
                  d={wallPathD}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="19"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 3. Lush Deep Emerald Hedge Body */}
                <path
                  d={wallPathD}
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="13.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 4. Sunlit Top Canopy Ridge */}
                <path
                  d={wallPathD}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(0, -1.8)"
                />
                {/* 5. Tiny Decorative Hedge Blossoms */}
                {blossoms.map((b, i) => (
                  <circle
                    key={`blossom-${i}`}
                    cx={b.x}
                    cy={b.y}
                    r="2.6"
                    fill={b.color}
                    stroke="#14532d"
                    strokeWidth="0.9"
                  />
                ))}
              </g>

              {/* ============================================================ */}
              {/* TOP LAYER: CRISP NAMEPLATES & STAGE BADGES ABOVE HEDGE WALLS */}
              {/* ============================================================ */}
              {/* Start Badge */}
              <g transform={`translate(${cellCenterX(0)}, ${cellCenterY(6) - 31})`}>
                <rect x="-25" y="-10" width="50" height="19" rx="9" fill="#0f172a" />
                <text x="0" y="3" textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#fde047">
                  출발 🔍
                </text>
              </g>

              {/* 6 Checkpoint Stage Badges & Zone Nameplates */}
              {checkpoints.map((cp) => {
                const pathIdx = CHECKPOINT_PATH_INDICES[cp.id];
                const cell = SOLUTION_PATH[pathIdx];
                const theme = CHECKPOINT_THEMES[cp.id - 1];
                if (!cell || !theme) return null;

                const cx = cellCenterX(cell.c);
                const cy = cellCenterY(cell.r);
                const isSolved = Boolean(solvedStages[cp.id]) || currentCheckpoint > cp.id;
                const isActive = currentCheckpoint === cp.id && !isSolved;
                const labelYOffset = theme.labelPlacement === 'top' ? -31 : 31;

                return (
                  <g key={`cp-label-${cp.id}`}>
                    {/* Corner Stage Number / Solved Checkmark */}
                    <g transform={`translate(${cx + 21}, ${cy - 18})`}>
                      <circle
                        r="11"
                        fill={isSolved ? '#10b981' : isActive ? '#ef4444' : theme.badgeBg}
                        stroke="#0f172a"
                        strokeWidth="2.2"
                      />
                      <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill="#ffffff">
                        {isSolved ? '✓' : cp.id}
                      </text>
                    </g>

                    {/* Crisp Zone Nameplate */}
                    <g transform={`translate(${cx}, ${cy + labelYOffset})`}>
                      <rect
                        x="-33"
                        y="-10"
                        width="66"
                        height="19"
                        rx="9"
                        fill={isSolved ? '#059669' : isActive ? '#facc15' : '#ffffff'}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="900"
                        fill={isSolved ? '#ffffff' : '#0f172a'}
                      >
                        {theme.shortLabel}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Goal Nameplate */}
              <g transform={`translate(${cellCenterX(10) - 2}, ${cellCenterY(0) + 31})`}>
                <rect
                  x="-34"
                  y="-10"
                  width="68"
                  height="19"
                  rx="9"
                  fill={currentCheckpoint === 7 ? '#facc15' : '#0f172a'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="900"
                  fill={currentCheckpoint === 7 ? '#0f172a' : '#fde047'}
                >
                  황금 꽃밭 🌸
                </text>
              </g>
            </svg>

            {/* ============================================================== */}
            {/* LAYER 2: GOLDEN NECTAR PARTICLES OVERLAY                       */}
            {/* ============================================================== */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    opacity: p.opacity,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>

            {/* ============================================================== */}
            {/* LAYER 3: INTERACTIVE DEAD-END GARDEN CRITTERS                  */}
            {/* ============================================================== */}
            {/* Interactive Ladybug in top-left dead end (0, 1) */}
            <button
              type="button"
              onClick={handleLadybugClick}
              aria-label="무당벌레 친구와 대화하기"
              className="absolute z-20 cursor-pointer select-none transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-full"
              style={{
                left: `${ladybugPos.x}%`,
                top: `${ladybugPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <AnimatePresence>
                {ladybugBubble && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-10 left-4 bg-white text-slate-800 font-extrabold text-[10px] md:text-xs rounded-xl px-2.5 py-1 border-2 border-slate-900 shadow-md whitespace-nowrap z-50"
                  >
                    {ladybugBubble}
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-xl sm:text-2xl drop-shadow-sm block">🐞</span>
            </button>

            {/* Interactive Caterpillar in bottom-center dead end (5, 6) */}
            <button
              type="button"
              onClick={handleCaterpillarClick}
              aria-label="애벌레 친구와 대화하기"
              className="absolute z-20 cursor-pointer select-none transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-full"
              style={{
                left: `${caterpillarPos.x}%`,
                top: `${caterpillarPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <AnimatePresence>
                {caterpillarBubble && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white text-slate-800 font-extrabold text-[10px] md:text-xs rounded-xl px-2.5 py-1 border-2 border-slate-900 shadow-md whitespace-nowrap z-50"
                  >
                    {caterpillarBubble}
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-xl sm:text-2xl drop-shadow-sm block">🐛</span>
            </button>

            {/* ============================================================== */}
            {/* LAYER 4: DYNAMIC MOVING DETECTIVE BEE CHARACTER                */}
            {/* ============================================================== */}
            <div
              className="absolute z-40 pointer-events-none aspect-square"
              style={{
                width: '7.8%',
                left: `${toPctX(beeSvgPos.x)}%`,
                top: `${toPctY(beeSvgPos.y)}%`,
                transform: 'translate(-50%, -56%)',
                transition: isBeeTravelling ? 'none' : 'left 0.35s ease-out, top 0.35s ease-out',
              }}
            >
              <Bee
                expression={isBeeTravelling ? 'BUZZING' : beeExpression}
                isMoving={isBeeTravelling}
                direction={beeDirection}
                className="w-full h-full"
              />

              {/* Bee Status Speech Callout */}
              {!isBeeTravelling && currentCheckpoint < 7 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md border-2 border-slate-900 whitespace-nowrap">
                  {currentCheckpoint === 0
                    ? '출동 대기!'
                    : isCurrentSolved
                    ? '관문 돌파! 🔓'
                    : '수수께끼 관문!'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slim Non-Overlapping Bottom Map Legend Strip */}
      <div className="shrink-0 bg-white border-t-4 border-slate-900 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-700">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-slate-900 font-black">
            <Milestone className="w-3.5 h-3.5 text-emerald-700" />
            숲속 정원 대미로
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-red-600" />
            <span>잠긴 관문</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>열린 관문</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>황금 꽃밭</span>
          </span>
        </div>
        <span className="text-slate-500 hidden sm:inline">
          막다른 길의 🐞·🐛 친구도 눌러보세요!
        </span>
      </div>
    </div>
  );
}
