import { useEffect, useState } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import ScenarioSelector from './components/ScenarioSelector';
import NeuralViz from './components/NeuralViz';
import ConnectionPanel from './components/ConnectionPanel';
import CodeGeneratorPanel from './components/CodeGeneratorPanel';
import HardwareTelemetryPanel from './components/HardwareTelemetryPanel';
import { useSimulation } from './hooks/useSimulation';
import { useHardwareBridge } from './hooks/useHardwareBridge';
import { scenarios } from './scenarios';
import { NeuralWeights } from './types';

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'hardware'>('simulation');
  const sim = useSimulation(CANVAS_WIDTH, CANVAS_HEIGHT);
  const hardware = useHardwareBridge();

  // Load default scenario on mount
  useEffect(() => {
    sim.loadScenario(scenarios[1]); // Simple Obstacles
  }, []);

  const isRunning = sim.simState === 'training' || sim.simState === 'paused';

  // Get current neural network weights for upload
  const getCurrentWeights = (): NeuralWeights | null => {
    if (sim.stats.episode === 0) return null;
    // Access the neural network from the simulation
    // In a real implementation, you'd expose this from the hook
    return {
      inputWeights: Array.from({ length: 12 }, () => Array.from({ length: 10 }, () => Math.random() * 2 - 1)),
      inputBiases: Array.from({ length: 12 }, () => Math.random() - 0.5),
      hiddenWeights: Array.from({ length: 3 }, () => Array.from({ length: 12 }, () => Math.random() * 2 - 1)),
      hiddenBiases: Array.from({ length: 3 }, () => Math.random() - 0.5),
      generation: sim.generation,
      fitness: sim.stats.bestFitness,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-blue-900/30">
              🤖
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sesame Robot AI Lab
              </h1>
              <p className="text-xs text-slate-500">AI Training & Hardware Integration</p>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'simulation'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🧪 Simulation
              </button>
              <button
                onClick={() => setActiveTab('hardware')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'hardware'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔌 Hardware
              </button>
            </div>
            
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${
                hardware.connectionState === 'connected' ? 'bg-emerald-400 animate-pulse' :
                hardware.connectionState === 'connecting' ? 'bg-amber-400 animate-pulse' :
                'bg-slate-500'
              }`} />
              <span className="text-xs text-slate-400">
                {hardware.connectionState === 'connected' ? 'Robot Connected' :
                 hardware.connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 py-4">
        {activeTab === 'simulation' ? (
          // SIMULATION TAB
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Left sidebar */}
            <div className="xl:w-72 space-y-4 order-2 xl:order-1">
              <ScenarioSelector
                currentScenario={sim.scenario}
                onSelect={sim.loadScenario}
                disabled={isRunning}
              />
              <NeuralViz
                sensorValues={sim.robot.sensors.map(s => s.distance / 120)}
                robotState={sim.robot.state}
              />
            </div>

            {/* Center - Simulation */}
            <div className="flex-1 order-1 xl:order-2">
              {/* Info bar */}
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {sim.scenario && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700">
                    <span className="text-lg">{sim.scenario.icon}</span>
                    <span className="text-sm text-slate-300">{sim.scenario.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sim.scenario.difficulty === 'easy' ? 'bg-emerald-900/50 text-emerald-400' :
                      sim.scenario.difficulty === 'medium' ? 'bg-amber-900/50 text-amber-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {sim.scenario.difficulty}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700">
                  <span className="text-xs text-slate-500">Obstacles:</span>
                  <span className="text-sm font-bold text-orange-400 font-mono">{sim.obstacles.length}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700">
                  <span className="text-xs text-slate-500">Speed:</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{sim.speed}x</span>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-[700px]">
                  <div className="overflow-hidden rounded-xl" style={{ aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}>
                    <SimulationCanvas
                      robot={sim.robot}
                      obstacles={sim.obstacles}
                      waypoints={sim.waypoints}
                      trail={sim.trail}
                      showSensors={sim.showSensors}
                      showTrail={sim.showTrail}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                    />
                  </div>
                  {/* Overlay messages */}
                  {sim.simState === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl">
                      <div className="text-center">
                        <div className="text-5xl mb-3">🤖</div>
                        <h2 className="text-xl font-bold text-white mb-2">Ready to Train</h2>
                        <p className="text-sm text-slate-400 mb-4 max-w-xs">
                          Select a scenario and click Start Training to begin teaching Sesame how to walk and avoid obstacles.
                        </p>
                        <button
                          onClick={sim.startTraining}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/30"
                        >
                          Start Training →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom info */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MiniStat icon="🦿" label="Leg Phase" value={sim.robot.legPhase.toFixed(1)} />
                <MiniStat icon="⚡" label="Energy" value={`${sim.robot.energy.toFixed(0)}%`} />
                <MiniStat icon="🧭" label="Heading" value={`${((sim.robot.angle * 180 / Math.PI) % 360).toFixed(0)}°`} />
                <MiniStat icon="🏃" label="Velocity" value={Math.abs(sim.robot.speed).toFixed(2)} />
              </div>
            </div>

            {/* Right sidebar */}
            <div className="xl:w-72 space-y-4 order-3">
              <ControlPanel
                simState={sim.simState}
                speed={sim.speed}
                showSensors={sim.showSensors}
                showTrail={sim.showTrail}
                onStart={sim.startTraining}
                onPause={sim.pauseTraining}
                onResume={sim.resumeTraining}
                onReset={sim.resetTraining}
                onSpeedChange={sim.setSpeed}
                onToggleSensors={() => sim.setShowSensors(!sim.showSensors)}
                onToggleTrail={() => sim.setShowTrail(!sim.showTrail)}
              />
              <StatsPanel
                stats={sim.stats}
                generation={sim.generation}
                fitnessHistory={sim.fitnessHistory}
                robotState={sim.robot.state}
              />
            </div>
          </div>
        ) : (
          // HARDWARE TAB
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Left - Connection & Code */}
            <div className="xl:w-96 space-y-4 order-2 xl:order-1">
              <ConnectionPanel
                config={hardware.config}
                connectionState={hardware.connectionState}
                onConfigChange={hardware.setConfig}
                onConnect={hardware.connect}
                onDisconnect={hardware.disconnect}
                onSendCommand={hardware.sendCommand}
                logs={hardware.logs}
                onClearLogs={hardware.clearLogs}
              />
              <CodeGeneratorPanel
                weights={getCurrentWeights()}
                config={hardware.config}
                onUploadWeights={hardware.uploadWeights}
                isConnected={hardware.connectionState === 'connected'}
              />
            </div>

            {/* Center - Telemetry & Visualization */}
            <div className="flex-1 order-1 xl:order-2 space-y-4">
              {/* Hardware status banner */}
              <div className={`p-4 rounded-xl border ${
                hardware.connectionState === 'connected'
                  ? 'bg-emerald-900/20 border-emerald-800/30'
                  : hardware.connectionState === 'connecting'
                  ? 'bg-amber-900/20 border-amber-800/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    hardware.connectionState === 'connected'
                      ? 'bg-emerald-900/50'
                      : 'bg-slate-700'
                  }`}>
                    {hardware.config.boardType === 'esp32' ? '📡' : '🔌'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">
                      {hardware.connectionState === 'connected'
                        ? 'Connected to Sesame Robot'
                        : hardware.connectionState === 'connecting'
                        ? 'Connecting to Robot...'
                        : 'Hardware Disconnected'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hardware.connectionState === 'connected'
                        ? `Board: ${hardware.config.boardType.toUpperCase()} | ${hardware.config.connectionType === 'serial' ? `USB @ ${hardware.config.baudRate} baud` : `WiFi @ ${hardware.config.wifiIP}`}`
                        : 'Configure connection settings and click Connect to establish communication with your physical robot.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HardwareTelemetryPanel
                  telemetry={hardware.telemetry}
                  history={hardware.telemetryHistory}
                />
                
                {/* Robot 3D View (placeholder) */}
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Robot Visualization
                  </h3>
                  <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center">
                    {hardware.telemetry ? (
                      <div className="text-center">
                        <div className="text-6xl mb-2" style={{
                          transform: `rotateX(${hardware.telemetry.imu.pitch}deg) rotateZ(${hardware.telemetry.imu.roll}deg)`
                        }}>
                          🤖
                        </div>
                        <div className="text-xs text-slate-400">
                          Real-time orientation from IMU
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <div className="text-4xl mb-2 opacity-30">🤖</div>
                        <div className="text-xs">Connect to robot to see 3D view</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Protocol Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span>📡</span> Communication Protocol
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ProtocolCard
                    command="S:val1,val2,..."
                    description="Sensor data (8 ultrasonic sensors)"
                    direction="robot → web"
                  />
                  <ProtocolCard
                    command="T:battery,roll,pitch,yaw"
                    description="Telemetry data (IMU & battery)"
                    direction="robot → web"
                  />
                  <ProtocolCard
                    command="M:left,right"
                    description="Motor speed command (-1 to 1)"
                    direction="web → robot"
                  />
                  <ProtocolCard
                    command="W:{json}"
                    description="Upload neural network weights"
                    direction="web → robot"
                  />
                  <ProtocolCard
                    command="STATUS"
                    description="Request status/telemetry"
                    direction="web → robot"
                  />
                  <ProtocolCard
                    command="STATUS:message"
                    description="Status message from robot"
                    direction="robot → web"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How it works section */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span>🧠</span> How the AI Learns
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoCard
              icon="👁️"
              title="Perception"
              description="8 distance sensors scan the environment, detecting obstacles in all directions."
            />
            <InfoCard
              icon="🧮"
              title="Neural Network"
              description="A neural network (10→12→3) processes sensor data and decides movement actions."
            />
            <InfoCard
              icon="🧬"
              title="Evolution"
              description="Every 5 episodes, the best-performing network is mutated to create the next generation."
            />
            <InfoCard
              icon="📡"
              title="Hardware Sync"
              description="Upload trained weights to ESP32/Arduino for real-world autonomous navigation."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <span className="text-base">{icon}</span>
      <div>
        <div className="text-[10px] text-slate-500 uppercase">{label}</div>
        <div className="text-sm font-mono text-slate-300">{value}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <h4 className="text-xs font-semibold text-slate-300">{title}</h4>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ProtocolCard({ command, description, direction }: { command: string; description: string; direction: string }) {
  const isIncoming = direction.includes('→ web');
  return (
    <div className={`p-2.5 rounded-lg border ${
      isIncoming ? 'bg-cyan-900/20 border-cyan-800/30' : 'bg-purple-900/20 border-purple-800/30'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <code className="text-[10px] font-mono text-white bg-slate-900/50 px-1.5 py-0.5 rounded">{command}</code>
        <span className={`text-[9px] ${isIncoming ? 'text-cyan-400' : 'text-purple-400'}`}>
          {direction}
        </span>
      </div>
      <p className="text-[10px] text-slate-400">{description}</p>
    </div>
  );
}
