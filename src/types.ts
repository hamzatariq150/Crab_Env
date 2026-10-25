export interface Vector2 {
  x: number;
  y: number;
}

export interface Robot {
  position: Vector2;
  velocity: Vector2;
  angle: number;
  targetAngle: number;
  speed: number;
  energy: number;
  sensors: SensorReading[];
  legPhase: number;
  state: 'idle' | 'walking' | 'avoiding' | 'stuck' | 'exploring';
}

export interface SensorReading {
  angle: number;
  distance: number;
  detected: boolean;
}

export interface Obstacle {
  position: Vector2;
  width: number;
  height: number;
  type: 'box' | 'wall' | 'ramp' | 'moving';
  velocity?: Vector2;
  color: string;
}

export interface Waypoint {
  position: Vector2;
  reached: boolean;
}

export interface NeuralNetwork {
  weights: number[][];
  biases: number[];
  hiddenWeights: number[][];
  hiddenBiases: number[];
  fitness: number;
  generation: number;
}

export interface TrainingStats {
  episode: number;
  totalSteps: number;
  distanceTraveled: number;
  obstaclesAvoided: number;
  collisions: number;
  fitness: number;
  bestFitness: number;
  avgFitness: number;
  learningRate: number;
  explorationRate: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  generateObstacles: (width: number, height: number) => Obstacle[];
  goalPosition?: Vector2;
}

export type SimulationState = 'idle' | 'running' | 'paused' | 'training';
