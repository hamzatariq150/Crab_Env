import { HardwareConfig, ConnectionState } from '../types';

interface Props {
  config: HardwareConfig;
  connectionState: ConnectionState;
  onConfigChange: (config: HardwareConfig) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onSendCommand: (cmd: string) => void;
  logs: string[];
  onClearLogs: () => void;
}

export default function ConnectionPanel({
  config,
  connectionState,
  onConfigChange,
  onConnect,
  onDisconnect,
  onSendCommand,
  logs,
  onClearLogs,
}: Props) {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
        Hardware Connection
      </h3>

      {/* Connection Status */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              connectionState === 'connected' ? 'bg-emerald-400 animate-pulse' :
              connectionState === 'connecting' ? 'bg-amber-400 animate-pulse' :
              connectionState === 'error' ? 'bg-red-400' :
              'bg-slate-500'
            }`} />
            <span className={`text-xs font-medium capitalize ${
              connectionState === 'connected' ? 'text-emerald-400' :
              connectionState === 'connecting' ? 'text-amber-400' :
              connectionState === 'error' ? 'text-red-400' :
              'text-slate-400'
            }`}>
              {connectionState}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-3 mb-4">
        {/* Connection Type */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Connection Type</label>
          <div className="grid grid-cols-2 gap-1">
            {(['serial', 'wifi'] as const).map(type => (
              <button
                key={type}
                onClick={() => onConfigChange({ ...config, connectionType: type })}
                disabled={isConnected}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  config.connectionType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {type === 'serial' ? '🔌 USB Serial' : '📡 WiFi'}
              </button>
            ))}
          </div>
        </div>

        {/* Board Type */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Board Type</label>
          <select
            value={config.boardType}
            onChange={(e) => onConfigChange({ ...config, boardType: e.target.value as HardwareConfig['boardType'] })}
            disabled={isConnected}
            className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="esp32">ESP32</option>
            <option value="arduino_uno">Arduino Uno</option>
            <option value="arduino_mega">Arduino Mega</option>
            <option value="arduino_nano">Arduino Nano</option>
          </select>
        </div>

        {/* Serial-specific settings */}
        {config.connectionType === 'serial' && (
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Baud Rate</label>
            <select
              value={config.baudRate}
              onChange={(e) => onConfigChange({ ...config, baudRate: Number(e.target.value) })}
              disabled={isConnected}
              className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200</option>
            </select>
          </div>
        )}

        {/* WiFi-specific settings */}
        {config.connectionType === 'wifi' && (
          <>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">ESP32 IP Address</label>
              <input
                type="text"
                value={config.wifiIP || ''}
                onChange={(e) => onConfigChange({ ...config, wifiIP: e.target.value })}
                placeholder="192.168.1.100"
                disabled={isConnected}
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">WebSocket Port</label>
              <input
                type="number"
                value={config.wifiPort || 81}
                onChange={(e) => onConfigChange({ ...config, wifiPort: Number(e.target.value) })}
                disabled={isConnected}
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </>
        )}
      </div>

      {/* Connect/Disconnect Button */}
      <div className="mb-4">
        {!isConnected ? (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect to Robot
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Disconnect
          </button>
        )}
      </div>

      {/* Command Input */}
      {isConnected && (
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1.5 block">Send Command</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="cmd-input"
              placeholder="M:1.0,0.5"
              className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    onSendCommand(input.value.trim());
                    input.value = '';
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('cmd-input') as HTMLInputElement;
                if (input.value.trim()) {
                  onSendCommand(input.value.trim());
                  input.value = '';
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-all"
            >
              Send
            </button>
          </div>
          <div className="mt-2 flex gap-1 flex-wrap">
            <button
              onClick={() => onSendCommand('STATUS')}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-all"
            >
              Status
            </button>
            <button
              onClick={() => onSendCommand('M:0.5,0.5')}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-all"
            >
              Forward
            </button>
            <button
              onClick={() => onSendCommand('M:0,0')}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-all"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Logs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">Communication Log</label>
          <button
            onClick={onClearLogs}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="h-32 bg-slate-900 rounded-lg p-2 overflow-y-auto font-mono text-[10px]">
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-4">No messages yet</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={`${
                log.includes('[ERROR]') ? 'text-red-400' :
                log.includes('[SUCCESS]') ? 'text-emerald-400' :
                log.includes('[DATA]') ? 'text-cyan-400' :
                'text-slate-400'
              } leading-relaxed`}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
