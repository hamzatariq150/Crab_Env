import { useRef, useEffect } from 'react';
import { Robot, Obstacle, Waypoint } from '../types';

interface Props {
  robot: Robot;
  obstacles: Obstacle[];
  waypoints: Waypoint[];
  trail: { x: number; y: number }[];
  showSensors: boolean;
  showTrail: boolean;
  width: number;
  height: number;
}

export default function SimulationCanvas({
  robot,
  obstacles,
  waypoints,
  trail,
  showSensors,
  showTrail,
  width,
  height,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw trail
    if (showTrail && trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw waypoints
    for (const wp of waypoints) {
      if (!wp.reached) {
        ctx.beginPath();
        ctx.arc(wp.position.x, wp.position.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulsing effect
        const pulse = Math.sin(Date.now() / 300) * 5 + 20;
        ctx.beginPath();
        ctx.arc(wp.position.x, wp.position.y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Flag icon
        ctx.fillStyle = '#eab308';
        ctx.font = '16px serif';
        ctx.fillText('🏁', wp.position.x - 8, wp.position.y + 5);
      }
    }

    // Draw obstacles
    for (const obs of obstacles) {
      ctx.save();
      ctx.translate(obs.position.x, obs.position.y);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-obs.width / 2 + 3, -obs.height / 2 + 3, obs.width, obs.height);

      // Main body
      const gradient = ctx.createLinearGradient(
        -obs.width / 2, -obs.height / 2,
        obs.width / 2, obs.height / 2
      );
      gradient.addColorStop(0, obs.color);
      gradient.addColorStop(1, adjustColor(obs.color, -30));
      ctx.fillStyle = gradient;
      ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

      // Border
      ctx.strokeStyle = adjustColor(obs.color, -50);
      ctx.lineWidth = 2;
      ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

      // Moving indicator
      if (obs.type === 'moving') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Draw sensors
    if (showSensors) {
      for (const sensor of robot.sensors) {
        const endX = robot.position.x + Math.cos(sensor.angle) * sensor.distance;
        const endY = robot.position.y + Math.sin(sensor.angle) * sensor.distance;

        ctx.beginPath();
        ctx.moveTo(robot.position.x, robot.position.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = sensor.detected
          ? `rgba(239, 68, 68, ${1 - sensor.distance / 120})`
          : 'rgba(34, 197, 94, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (sensor.detected) {
          ctx.beginPath();
          ctx.arc(endX, endY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        }
      }
    }

    // Draw robot
    ctx.save();
    ctx.translate(robot.position.x, robot.position.y);
    ctx.rotate(robot.angle);

    // Robot body
    const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    bodyGradient.addColorStop(0, '#60a5fa');
    bodyGradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Robot border
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Direction indicator
    ctx.fillStyle = '#f0f9ff';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(8, -5);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();

    // Legs animation
    const legOffset = Math.sin(robot.legPhase) * 4;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-3, 8);
    ctx.lineTo(-3 + legOffset, 16);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.lineTo(-3 - legOffset, -16);
    ctx.stroke();

    // Front legs
    ctx.beginPath();
    ctx.moveTo(5, 6);
    ctx.lineTo(5 - legOffset, 13);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(5, -6);
    ctx.lineTo(5 + legOffset, -13);
    ctx.stroke();

    // Eye/sensor
    ctx.fillStyle = robot.state === 'avoiding' ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(6, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // State label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(robot.state.toUpperCase(), robot.position.x, robot.position.y + 28);

  }, [robot, obstacles, waypoints, trail, showSensors, showTrail, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full rounded-xl border border-slate-700 shadow-2xl"
      style={{ imageRendering: 'auto' }}
    />
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
