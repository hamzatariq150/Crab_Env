import { Scenario, Obstacle } from './types';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const scenarios: Scenario[] = [
  {
    id: 'open-field',
    name: 'Open Field',
    description: 'Learn to walk in an open area with no obstacles. Perfect for initial training.',
    icon: '🌿',
    difficulty: 'easy',
    generateObstacles: () => [],
    goalPosition: { x: 0, y: 0 },
  },
  {
    id: 'simple-obstacles',
    name: 'Simple Obstacles',
    description: 'Navigate around a few static boxes. Learn basic obstacle avoidance.',
    icon: '📦',
    difficulty: 'easy',
    generateObstacles: (w: number, h: number) => [
      { position: { x: w * 0.3, y: h * 0.3 }, width: 50, height: 50, type: 'box', color: '#ef4444' },
      { position: { x: w * 0.7, y: h * 0.6 }, width: 60, height: 40, type: 'box', color: '#f97316' },
      { position: { x: w * 0.5, y: h * 0.8 }, width: 40, height: 60, type: 'box', color: '#eab308' },
    ],
  },
  {
    id: 'maze-runner',
    name: 'Maze Runner',
    description: 'Navigate through walls in a maze-like environment. Tests pathfinding ability.',
    icon: '🏰',
    difficulty: 'medium',
    generateObstacles: (w: number, h: number) => [
      { position: { x: w * 0.25, y: h * 0.2 }, width: 10, height: h * 0.5, type: 'wall', color: '#6b7280' },
      { position: { x: w * 0.5, y: h * 0.7 }, width: 10, height: h * 0.5, type: 'wall', color: '#6b7280' },
      { position: { x: w * 0.75, y: h * 0.3 }, width: 10, height: h * 0.5, type: 'wall', color: '#6b7280' },
      { position: { x: w * 0.35, y: h * 0.5 }, width: w * 0.2, height: 10, type: 'wall', color: '#9ca3af' },
      { position: { x: w * 0.65, y: h * 0.4 }, width: w * 0.15, height: 10, type: 'wall', color: '#9ca3af' },
    ],
    goalPosition: { x: 0, y: 0 },
  },
  {
    id: 'crowded-room',
    name: 'Crowded Room',
    description: 'Many obstacles packed together. Advanced avoidance training required.',
    icon: '🏙️',
    difficulty: 'hard',
    generateObstacles: (w: number, h: number) => {
      const obs: Obstacle[] = [];
      for (let i = 0; i < 15; i++) {
        obs.push({
          position: {
            x: 80 + Math.random() * (w - 160),
            y: 80 + Math.random() * (h - 160),
          },
          width: 25 + Math.random() * 40,
          height: 25 + Math.random() * 40,
          type: 'box',
          color: randomColor(),
        });
      }
      return obs;
    },
  },
  {
    id: 'moving-targets',
    name: 'Moving Targets',
    description: 'Obstacles that move around. Train dynamic avoidance and prediction.',
    icon: '🎯',
    difficulty: 'hard',
    generateObstacles: (w: number, h: number) => {
      const obs: Obstacle[] = [];
      for (let i = 0; i < 6; i++) {
        obs.push({
          position: {
            x: 100 + Math.random() * (w - 200),
            y: 100 + Math.random() * (h - 200),
          },
          width: 35,
          height: 35,
          type: 'moving',
          velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
          color: '#ec4899',
        });
      }
      return obs;
    },
  },
  {
    id: 'gauntlet',
    name: 'The Gauntlet',
    description: 'A narrow path with obstacles on both sides. Precision walking required.',
    icon: '⚔️',
    difficulty: 'hard',
    generateObstacles: (w: number, h: number) => {
      const obs: Obstacle[] = [];
      const gapWidth = 80;
      const centerX = w / 2;
      for (let y = 50; y < h - 50; y += 80) {
        const offset = (Math.random() - 0.5) * 30;
        obs.push({
          position: { x: centerX - gapWidth - 20 + offset, y },
          width: 40,
          height: 30,
          type: 'box',
          color: '#8b5cf6',
        });
        obs.push({
          position: { x: centerX + gapWidth + 20 - offset, y },
          width: 40,
          height: 30,
          type: 'box',
          color: '#06b6d4',
        });
      }
      return obs;
    },
    goalPosition: { x: 0, y: 0 },
  },
];
