import { HardwareTelemetry } from '../types';

interface Props {
  telemetry: HardwareTelemetry | null;
  history: HardwareTelemetry[];
}

export default function HardwareTelemetryPanel({ telemetry, history }: Props) {
  if (!telemetry) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          Robot Telemetry
        </h3>
        <div className="text-center py-8 text-slate-500 text-xs">
          Connect to robot to view telemetry
        </div>
      </div>
    );
  }

  const recentSensors = history.slice(-10);
  const maxSensor = Math.max(...telemetry.sensors, 1);

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
        Robot Telemetry
      </h3>

      {/* Sensor readings */}
      <div className="mb-4">
        <h4 className="text-xs text-slate-400 mb-2 font-medium">Sensor Distances (cm)</h4>
        <div className="grid grid-cols-4 gap-1">
          {telemetry.sensors.map((val, i) => (
            <div key={i} className="bg-slate-900/50 rounded p-1.5 text-center">
              <div className="text-[9px] text-slate-500">S{i}</div>
              <div className="text-xs font-mono text-cyan-400">{val.toFixed(1)}</div>
            </div>
          ))}
        </div>
        
        {/* Sensor visualization */}
        <div className="mt-2 h-16 bg-slate-900/50 rounded-lg p-2 flex items-end gap-0.5">
          {telemetry.sensors.map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t transition-all"
              style={{ height: `${(val / maxSensor) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* IMU */}
      <div className="mb-4">
        <h4 className="text-xs text-slate-400 mb-2 font-medium">IMU (Orientation)</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-[9px] text-slate-500">Roll</div>
            <div className="text-xs font-mono text-purple-400">{telemetry.imu.roll.toFixed(1)}°</div>
          </div>
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-[9px] text-slate-500">Pitch</div>
            <div className="text-xs font-mono text-purple-400">{telemetry.imu.pitch.toFixed(1)}°</div>
          </div>
          <div className="bg-slate-900/50 rounded p-2 text-center">
            <div className="text-[9px] text-slate-500">Yaw</div>
            <div className="text-xs font-mono text-purple-400">{telemetry.imu.yaw.toFixed(1)}°</div>
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="mb-4">
        <h4 className="text-xs text-slate-400 mb-2 font-medium">Battery</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                telemetry.battery > 50 ? 'bg-emerald-500' :
                telemetry.battery > 20 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${telemetry.battery}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-300 w-10 text-right">{telemetry.battery.toFixed(0)}%</span>
        </div>
      </div>

      {/* Motor speeds */}
      <div className="mb-4">
        <h4 className="text-xs text-slate-400 mb-2 font-medium">Motor Speeds</h4>
        <div className="grid grid-cols-2 gap-2">
          {telemetry.motorSpeeds.map((val, i) => (
            <div key={i} className="bg-slate-900/50 rounded p-2">
              <div className="text-[9px] text-slate-500 mb-1">Motor {i + 1}</div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${val >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.abs(val) / 255 * 100}%`, marginLeft: val < 0 ? 'auto' : '0' }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{val.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="p-2 bg-slate-900/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Status:</span>
          <span className="text-xs text-emerald-400 font-medium">{telemetry.status}</span>
        </div>
      </div>
    </div>
  );
}
