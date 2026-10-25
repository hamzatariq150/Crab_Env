import { Scenario } from '../types';
import { scenarios } from '../scenarios';

interface Props {
  currentScenario: Scenario | null;
  onSelect: (scenario: Scenario) => void;
  disabled: boolean;
}

export default function ScenarioSelector({ currentScenario, onSelect, disabled }: Props) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
        Training Scenarios
      </h3>

      {disabled && (
        <div className="mb-3 p-2 bg-amber-900/30 border border-amber-800/50 rounded-lg">
          <p className="text-xs text-amber-400">⚠️ Reset training to change scenario</p>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {scenarios.map(sc => (
          <button
            key={sc.id}
            onClick={() => !disabled && onSelect(sc)}
            disabled={disabled}
            className={`w-full text-left p-3 rounded-lg transition-all border ${
              currentScenario?.id === sc.id
                ? 'bg-blue-900/40 border-blue-600/50 shadow-lg shadow-blue-900/20'
                : 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{sc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-white truncate">{sc.name}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    sc.difficulty === 'easy' ? 'bg-emerald-900/50 text-emerald-400' :
                    sc.difficulty === 'medium' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {sc.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{sc.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
