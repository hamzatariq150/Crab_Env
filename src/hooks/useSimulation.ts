import { useState, useRef, useCallback, useEffect } from 'react';
import { Robot, Obstacle, TrainingStats, SimulationState, Scenario, Waypoint, SensorReading } from '../types';

const SENSOR_COUNT = 8;
const SENSOR_RANGE = 120;
const ROBOT_SIZE = 20;
const WALK_SPEED = 2.5;
const TURN_SPEED = 0.08;
const COLLISION_DISTANCE = 25;

function createRobot(canvasWidth: number, canvasHeight: number): Robot {
  return {
    position: { x: canvasWidth / 2, y: canvasHeight / 2 },
    velocity: { x: 0, y: 0 },
    angle: 0,
    targetAngle: 0,
    speed: 0,
    energy: 100,
    sensors: Array.from({ length: SENSOR_COUNT }, (_, i) => ({
      angle: (i / SENSOR_COUNT) * Math.PI * 2,
      distance: SENSOR_RANGE,
      detected: false,
    })),
    legPhase: 0,
    state: 'idle',
  };
}

function createNeuralNetwork(): { weights: number[][]; biases: number[]; hiddenWeights: number[][]; hiddenBiases: number[]; fitness: number } {
  const inputSize = SENSOR_COUNT + 2; // sensors + target direction + target distance
  const hiddenSize = 12;
  const outputSize = 3; // speed, turn, brake

  const weights = Array.from({ length: hiddenSize }, () =>
    Array.from({ length: inputSize }, () => (Math.random() * 2 - 1))
  );
  const biases = Array.from({ length: hiddenSize }, () => Math.random() * 0.5 - 0.25);
  const hiddenWeights = Array.from({ length: outputSize }, () =>
    Array.from({ length: hiddenSize }, () => (Math.random() * 2 - 1))
  );
  const hiddenBiases = Array.from({ length: outputSize }, () => Math.random() * 0.5 - 0.25);

  return { weights, biases, hiddenWeights, hiddenBiases, fitness: 0 };
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
}

function forwardPass(
  inputs: number[],
  nn: { weights: number[][]; biases: number[]; hiddenWeights: number[][]; hiddenBiases: number[] }
): number[] {
  // Hidden layer
  const hidden = nn.biases.map((bias, i) => {
    let sum = bias;
    for (let j = 0; j < inputs.length; j++) {
      sum += inputs[j] * nn.weights[i][j];
    }
    return sigmoid(sum);
  });

  // Output layer
  const output = nn.hiddenBiases.map((bias, i) => {
    let sum = bias;
    for (let j = 0; j < hidden.length; j++) {
      sum += hidden[j] * nn.hiddenWeights[i][j];
    }
    return sigmoid(sum);
  });

  return output;
}

function mutateWeights(weights: number[][], rate: number): number[][] {
  return weights.map(row =>
    row.map(w => {
      if (Math.random() < rate) {
        return w + (Math.random() * 2 - 1) * 0.3;
      }
      return w;
    })
  );
}

function mutateBiases(biases: number[], rate: number): number[] {
  return biases.map(b => {
    if (Math.random() < rate) {
      return b + (Math.random() * 2 - 1) * 0.3;
    }
    return b;
  });
}

export function useSimulation(canvasWidth: number, canvasHeight: number) {
  const [robot, setRobot] = useState<Robot>(() => createRobot(canvasWidth, canvasHeight));
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [stats, setStats] = useState<TrainingStats>({
    episode: 0,
    totalSteps: 0,
    distanceTraveled: 0,
    obstaclesAvoided: 0,
    collisions: 0,
    fitness: 0,
    bestFitness: 0,
    avgFitness: 0,
    learningRate: 0.01,
    explorationRate: 0.3,
  });
  const [simState, setSimState] = useState<SimulationState>('idle');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [speed, setSpeed] = useState(1);
  const [showSensors, setShowSensors] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [generation, setGeneration] = useState(1);
  const [fitnessHistory, setFitnessHistory] = useState<number[]>([]);

  const nnRef = useRef(createNeuralNetwork());
  const bestNNRef = useRef(createNeuralNetwork());
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const episodeStepsRef = useRef(0);
  const episodeFitnessRef = useRef(0);
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: canvasWidth / 2, y: canvasHeight / 2 });

  const updateSensors = useCallback((robotPos: { x: number; y: number }, angle: number, obs: Obstacle[]): SensorReading[] => {
    return Array.from({ length: SENSOR_COUNT }, (_, i) => {
      const sensorAngle = angle + (i / SENSOR_COUNT) * Math.PI * 2;
      let minDist = SENSOR_RANGE;
      let detected = false;

      for (const obstacle of obs) {
        const dx = obstacle.position.x - robotPos.x;
        const dy = obstacle.position.y - robotPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const obstacleAngle = Math.atan2(dy, dx);
        let angleDiff = Math.abs(sensorAngle - obstacleAngle);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff < 0.4 && dist < SENSOR_RANGE) {
          if (dist < minDist) {
            minDist = dist;
            detected = true;
          }
        }
      }

      return { angle: sensorAngle, distance: minDist, detected };
    });
  }, []);

  const checkCollision = useCallback((robotPos: { x: number; y: number }, obs: Obstacle[]): boolean => {
    for (const obstacle of obs) {
      const dx = Math.abs(robotPos.x - obstacle.position.x);
      const dy = Math.abs(robotPos.y - obstacle.position.y);
      if (dx < (obstacle.width / 2 + ROBOT_SIZE / 2) && dy < (obstacle.height / 2 + ROBOT_SIZE / 2)) {
        return true;
      }
    }
    return false;
  }, []);

  // Move obstacles with velocity
  useEffect(() => {
    if (simState !== 'training') return;
    const interval = setInterval(() => {
      setObstacles(prev => prev.map(obs => {
        if (obs.type === 'moving' && obs.velocity) {
          let newX = obs.position.x + obs.velocity.x;
          let newY = obs.position.y + obs.velocity.y;
          let newVx = obs.velocity.x;
          let newVy = obs.velocity.y;

          // Bounce off walls
          if (newX < 30 || newX > canvasWidth - 30) newVx = -newVx;
          if (newY < 30 || newY > canvasHeight - 30) newVy = -newVy;

          return {
            ...obs,
            position: { x: newX, y: newY },
            velocity: { x: newVx, y: newVy },
          };
        }
        return obs;
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [simState, canvasWidth, canvasHeight]);

  const step = useCallback(() => {
    setRobot(prev => {
      const inputs: number[] = [
        ...prev.sensors.map(s => s.distance / SENSOR_RANGE),
        waypoints.length > 0 ? Math.atan2(
          waypoints[0].position.y - prev.position.y,
          waypoints[0].position.x - prev.position.x
        ) - prev.angle : 0,
        waypoints.length > 0 ? Math.sqrt(
          (waypoints[0].position.x - prev.position.x) ** 2 +
          (waypoints[0].position.y - prev.position.y) ** 2
        ) / canvasWidth : 0,
      ];

      const output = forwardPass(inputs, nnRef.current);
      const desiredSpeed = output[0] * WALK_SPEED * 2;
      const turnRate = (output[1] - 0.5) * TURN_SPEED * 4;
      const brake = output[2];

      // Add exploration noise
      const exploration = stats.explorationRate;
      const noisySpeed = desiredSpeed + (Math.random() - 0.5) * exploration;
      const noisyTurn = turnRate + (Math.random() - 0.5) * exploration * 0.1;

      const newAngle = prev.angle + noisyTurn;
      const actualSpeed = noisySpeed * (1 - brake * 0.5);

      const newPos = {
        x: prev.position.x + Math.cos(newAngle) * actualSpeed,
        y: prev.position.y + Math.sin(newAngle) * actualSpeed,
      };

      // Boundary wrapping
      if (newPos.x < 0) newPos.x = canvasWidth;
      if (newPos.x > canvasWidth) newPos.x = 0;
      if (newPos.y < 0) newPos.y = canvasHeight;
      if (newPos.y > canvasHeight) newPos.y = 0;

      // Determine state
      let state: Robot['state'] = 'walking';
      const hasObstacleNear = prev.sensors.some(s => s.detected && s.distance < 50);
      if (hasObstacleNear) state = 'avoiding';
      if (Math.abs(actualSpeed) < 0.1) state = 'stuck';

      // Calculate fitness
      const distMoved = Math.sqrt(
        (newPos.x - lastPositionRef.current.x) ** 2 +
        (newPos.y - lastPositionRef.current.y) ** 2
      );

      let waypointBonus = 0;
      if (waypoints.length > 0) {
        const wp = waypoints[0];
        const distToWp = Math.sqrt(
          (wp.position.x - newPos.x) ** 2 + (wp.position.y - newPos.y) ** 2
        );
        if (distToWp < 30) {
          waypointBonus = 50;
          setWaypoints(prev => {
            const newWps = [...prev];
            newWps[0] = { ...newWps[0], reached: true };
            return newWps;
          });
        }
      }

      const collision = checkCollision(newPos, obstacles);
      const collisionPenalty = collision ? -10 : 0;

      episodeFitnessRef.current += distMoved * 2 + waypointBonus + collisionPenalty;
      episodeStepsRef.current++;
      lastPositionRef.current = newPos;

      if (trailRef.current.length > 500) trailRef.current.shift();
      trailRef.current.push({ x: newPos.x, y: newPos.y });

      // Check if episode should end
      if (collision || episodeStepsRef.current > 1000) {
        // End episode - evolve
        const fitness = episodeFitnessRef.current;
        setFitnessHistory(prev => [...prev, fitness]);
        setStats(prev => ({
          ...prev,
          episode: prev.episode + 1,
          totalSteps: prev.totalSteps + episodeStepsRef.current,
          fitness,
          bestFitness: Math.max(prev.bestFitness, fitness),
          collisions: prev.collisions + (collision ? 1 : 0),
          avgFitness: (prev.avgFitness * prev.episode + fitness) / (prev.episode + 1),
        }));

        if (fitness > bestNNRef.current.fitness) {
          bestNNRef.current = { ...nnRef.current, fitness };
        }

        // Evolve every 5 episodes
        if ((stats.episode + 1) % 5 === 0) {
          setGeneration(prev => prev + 1);
          nnRef.current = {
            weights: mutateWeights(bestNNRef.current.weights, 0.2),
            biases: mutateBiases(bestNNRef.current.biases, 0.2),
            hiddenWeights: mutateWeights(bestNNRef.current.hiddenWeights, 0.2),
            hiddenBiases: mutateBiases(bestNNRef.current.hiddenBiases, 0.2),
            fitness: bestNNRef.current.fitness,
          };
          setStats(prev => ({
            ...prev,
            explorationRate: Math.max(0.05, prev.explorationRate * 0.98),
          }));
        }

        episodeStepsRef.current = 0;
        episodeFitnessRef.current = 0;
        lastPositionRef.current = { x: canvasWidth / 2, y: canvasHeight / 2 };

        return createRobot(canvasWidth, canvasHeight);
      }

      return {
        ...prev,
        position: newPos,
        angle: newAngle,
        speed: actualSpeed,
        sensors: updateSensors(newPos, newAngle, obstacles),
        legPhase: prev.legPhase + Math.abs(actualSpeed) * 0.2,
        state,
        energy: Math.max(0, prev.energy - 0.01),
      };
    });
  }, [obstacles, waypoints, canvasWidth, canvasHeight, checkCollision, updateSensors, stats.explorationRate, stats.episode]);

  const stepRef = useRef(step);
  stepRef.current = step;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const gameLoopRef = useRef<(timestamp: number) => void>();
  gameLoopRef.current = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;

    if (delta > 16 / speedRef.current) {
      lastTimeRef.current = timestamp;
      for (let i = 0; i < speedRef.current; i++) {
        stepRef.current();
      }
    }

    animFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));
  };

  const startTraining = useCallback(() => {
    setSimState('training');
    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));
  }, []);

  const pauseTraining = useCallback(() => {
    setSimState('paused');
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const resumeTraining = useCallback(() => {
    setSimState('training');
    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));
  }, []);

  const resetTraining = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setSimState('idle');
    setRobot(createRobot(canvasWidth, canvasHeight));
    setStats({
      episode: 0,
      totalSteps: 0,
      distanceTraveled: 0,
      obstaclesAvoided: 0,
      collisions: 0,
      fitness: 0,
      bestFitness: 0,
      avgFitness: 0,
      learningRate: 0.01,
      explorationRate: 0.3,
    });
    nnRef.current = createNeuralNetwork();
    bestNNRef.current = createNeuralNetwork();
    trailRef.current = [];
    episodeStepsRef.current = 0;
    episodeFitnessRef.current = 0;
    setGeneration(1);
    setFitnessHistory([]);
  }, [canvasWidth, canvasHeight]);

  const loadScenario = useCallback((sc: Scenario) => {
    setScenario(sc);
    const obs = sc.generateObstacles(canvasWidth, canvasHeight);
    setObstacles(obs);
    if (sc.goalPosition) {
      setWaypoints([{ position: sc.goalPosition, reached: false }]);
    } else {
      setWaypoints([]);
    }
    setRobot(createRobot(canvasWidth, canvasHeight));
    trailRef.current = [];
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return {
    robot,
    obstacles,
    waypoints,
    stats,
    simState,
    scenario,
    speed,
    showSensors,
    showTrail,
    generation,
    fitnessHistory,
    trail: trailRef.current,
    setSpeed,
    setShowSensors,
    setShowTrail,
    startTraining,
    pauseTraining,
    resumeTraining,
    resetTraining,
    loadScenario,
    setObstacles,
  };
}
