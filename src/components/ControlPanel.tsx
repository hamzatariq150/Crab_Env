import { SimulationState } from '../types';

interface Props {
  simState: SimulationState;
  speed: number;
  showSensors: boolean;
  showTrail: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleSensors: () => void;
  onToggleTrail: () => void;
}

export default function ControlPanel({
  simState,
  speed,
  showSensors,
  showTrail,
  onStart,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
  onToggleSensors,
  onToggleTrail,
}: Props) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Controls
      </h3>

      {/* Main controls */}
      <div className="flex gap-2 mb-4">
        {simState === 'idle' && (
          <button
            onClick={onStart}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Start Training
          </button>
        )}
        {simState === 'training' && (
          <button
            onClick={onPause}
            className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
            Pause
          </button>
        )}
        {simState === 'paused' && (
          <button
            onClick={onResume}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Resume
          </button>
        )}
        <button
          onClick={onReset}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>

      {/* Speed control */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 mb-1.5 block">Simulation Speed</label>
        <div className="flex gap-1">
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                speed === s
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Toggle options */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-9 h-5 rounded-full transition-all relative ${showSensors ? 'bg-blue-600' : 'bg-slate-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${showSensors ? 'left-4.5' : 'left-0.5'}`}
              style={{ left: showSensors ? '18px' : '2px' }}
            />
          </div>
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Show Sensors</span>
          <input type="checkbox" checked={showSensors} onChange={onToggleSensors} className="hidden" />
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-9 h-5 rounded-full transition-all relative ${showTrail ? 'bg-emerald-600' : 'bg-slate-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all`}
              style={{ left: showTrail ? '18px' : '2px' }}
            />
          </div>
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Show Trail</span>
          <input type="checkbox" checked={showTrail} onChange={onToggleTrail} className="hidden" />
        </label>
      </div>

      {/* Status indicator */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            simState === 'training' ? 'bg-emerald-400 animate-pulse' :
            simState === 'paused' ? 'bg-amber-400' :
            simState === 'idle' ? 'bg-slate-500' : 'bg-blue-400'
          }`} />
          <span className="text-xs text-slate-400 capitalize">{simState}</span>
        </div>
      </div>
    </div>
  );
}
