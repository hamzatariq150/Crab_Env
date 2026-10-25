import { TrainingStats } from '../types';

interface Props {
  stats: TrainingStats;
  generation: number;
  fitnessHistory: number[];
  robotState: string;
}

export default function StatsPanel({ stats, generation, fitnessHistory, robotState }: Props) {
  const maxFitness = Math.max(...fitnessHistory, 1);
  const recentFitness = fitnessHistory.slice(-20);
  const maxRecent = Math.max(...recentFitness, 1);

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Training Metrics
      </h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard label="Episode" value={stats.episode.toString()} color="text-blue-400" />
        <StatCard label="Generation" value={generation.toString()} color="text-purple-400" />
        <StatCard label="Best Fitness" value={stats.bestFitness.toFixed(1)} color="text-emerald-400" />
        <StatCard label="Avg Fitness" value={stats.avgFitness.toFixed(1)} color="text-amber-400" />
        <StatCard label="Collisions" value={stats.collisions.toString()} color="text-red-400" />
        <StatCard label="Total Steps" value={stats.totalSteps.toString()} color="text-cyan-400" />
      </div>

      {/* AI Parameters */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <h4 className="text-xs text-slate-400 mb-2 font-medium">AI Parameters</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Exploration Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${stats.explorationRate * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono w-10 text-right">{(stats.explorationRate * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Learning Rate</span>
            <span className="text-xs text-slate-400 font-mono">{stats.learningRate.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Network</span>
            <span className="text-xs text-slate-400 font-mono">10→12→3</span>
          </div>
        </div>
      </div>

      {/* Fitness chart */}
      <div className="mb-3">
        <h4 className="text-xs text-slate-400 mb-2 font-medium">Fitness History (Last 20)</h4>
        <div className="h-20 bg-slate-900/50 rounded-lg p-2 flex items-end gap-0.5">
          {Array.from({ length: 20 }, (_, i) => {
            const val = recentFitness[i] || 0;
            const height = (val / maxRecent) * 100;
            const isBest = val === maxFitness;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all ${
                  isBest ? 'bg-emerald-400' : 'bg-blue-500/70'
                }`}
                style={{ height: `${Math.max(2, height)}%` }}
                title={`Episode ${fitnessHistory.length - 20 + i + 1}: ${val.toFixed(1)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Robot state */}
      <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
        <div className={`w-2 h-2 rounded-full ${
          robotState === 'walking' ? 'bg-emerald-400' :
          robotState === 'avoiding' ? 'bg-red-400 animate-pulse' :
          robotState === 'stuck' ? 'bg-amber-400' :
          'bg-slate-500'
        }`} />
        <span className="text-xs text-slate-400">State:</span>
        <span className={`text-xs font-medium capitalize ${
          robotState === 'walking' ? 'text-emerald-400' :
          robotState === 'avoiding' ? 'text-red-400' :
          robotState === 'stuck' ? 'text-amber-400' :
          'text-slate-400'
        }`}>{robotState}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-2.5">
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
