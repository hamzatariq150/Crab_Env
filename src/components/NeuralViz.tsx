import { useRef, useEffect } from 'react';

interface Props {
  sensorValues: number[];
  robotState: string;
}

export default function NeuralViz({ sensorValues, robotState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Layers: input (10) -> hidden (12) -> output (3)
    const layers = [
      { count: 8, label: 'Sensors', color: '#3b82f6' },
      { count: 4, label: 'Context', color: '#8b5cf6' },
      { count: 12, label: 'Hidden', color: '#06b6d4' },
      { count: 3, label: 'Actions', color: '#f97316' },
    ];

    const layerX = layers.map((_, i) => 30 + (i / (layers.length - 1)) * (w - 60));
    const nodePositions: { x: number; y: number }[][] = [];

    // Draw connections first
    for (let l = 0; l < layers.length - 1; l++) {
      const currLayer = layers[l];
      const nextLayer = layers[l + 1];
      const currPositions = nodePositions[l] || [];
      const nextPositions: { x: number; y: number }[] = [];

      for (let n = 0; n < nextLayer.count; n++) {
        const y = 25 + (n / (nextLayer.count - 1 || 1)) * (h - 50);
        nextPositions.push({ x: layerX[l + 1], y });
      }

      if (currPositions.length === 0) {
        for (let n = 0; n < currLayer.count; n++) {
          const y = 25 + (n / (currLayer.count - 1 || 1)) * (h - 50);
          currPositions.push({ x: layerX[l], y });
        }
      }

      // Draw connections
      for (const from of currPositions) {
        for (const to of nextPositions) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      nodePositions[l] = currPositions;
      nodePositions[l + 1] = nextPositions;
    }

    // Draw nodes
    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l];
      const positions = nodePositions[l];
      if (!positions) continue;

      for (let n = 0; n < positions.length; n++) {
        const pos = positions[n];
        const isActive = l === 0 && n < sensorValues.length && sensorValues[n] < 0.7;
        const activation = l === 0 && n < sensorValues.length ? (1 - sensorValues[n]) : 0.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);

        if (isActive) {
          ctx.fillStyle = `rgba(239, 68, 68, ${activation})`;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 5;
        } else {
          ctx.fillStyle = l === layers.length - 1
            ? (robotState === 'avoiding' ? '#ef4444' : layer.color)
            : layer.color;
          ctx.globalAlpha = 0.3 + activation * 0.7;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    for (let l = 0; l < layers.length; l++) {
      ctx.fillText(layers[l].label, layerX[l], h - 5);
    }

  }, [sensorValues, robotState]);

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
        Neural Network
      </h3>
      <canvas
        ref={canvasRef}
        width={280}
        height={140}
        className="w-full rounded-lg bg-slate-900/50"
      />
      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>Input: 8 sensors + 2 context</span>
        <span>Output: speed, turn, brake</span>
      </div>
    </div>
  );
}
