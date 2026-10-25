import { useState } from 'react';
import { HardwareConfig, NeuralWeights } from '../types';
import { generateArduinoCode, generatePlatformIOConfig } from '../utils/codeGenerator';

interface Props {
  weights: NeuralWeights | null;
  config: HardwareConfig;
  onUploadWeights: (weights: NeuralWeights) => void;
  isConnected: boolean;
}

export default function CodeGeneratorPanel({ weights, config, onUploadWeights, isConnected }: Props) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const code = generateArduinoCode(weights, config);
  const platformio = generatePlatformIOConfig(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sesame_robot_${config.boardType}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPlatformIO = () => {
    const blob = new Blob([platformio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'platformio.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    if (weights) {
      onUploadWeights(weights);
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000);
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
        Arduino/ESP32 Code
      </h3>

      {/* Info */}
      <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
        <p className="text-xs text-blue-300 leading-relaxed">
          {weights 
            ? '✅ Neural network weights are available. Generate code with trained weights or upload directly to the robot.'
            : '⚠️ No trained weights available. Start training to generate AI-powered firmware.'}
        </p>
      </div>

      {/* Weight info */}
      {weights && (
        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
          <h4 className="text-xs text-slate-400 mb-2 font-medium">Trained Network</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Generation:</span>
              <span className="ml-2 text-purple-400 font-mono">{weights.generation}</span>
            </div>
            <div>
              <span className="text-slate-500">Fitness:</span>
              <span className="ml-2 text-emerald-400 font-mono">{weights.fitness.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-500">Input:</span>
              <span className="ml-2 text-cyan-400 font-mono">{weights.inputWeights[0].length}</span>
            </div>
            <div>
              <span className="text-slate-500">Hidden:</span>
              <span className="ml-2 text-cyan-400 font-mono">{weights.inputWeights.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 mb-4">
        <button
          onClick={() => setShowCode(!showCode)}
          className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {showCode ? 'Hide Code' : 'View Generated Code'}
        </button>

        {weights && isConnected && (
          <button
            onClick={handleUpload}
            disabled={uploaded}
            className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              uploaded
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
            }`}
          >
            {uploaded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Weights Uploaded!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Weights to Robot
              </>
            )}
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .ino
          </button>
        </div>

        <button
          onClick={handleDownloadPlatformIO}
          className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download platformio.ini
        </button>
      </div>

      {/* Code display */}
      {showCode && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-400">Generated Code ({config.boardType})</label>
            <span className="text-[10px] text-slate-500">{code.split('\n').length} lines</span>
          </div>
          <div className="h-64 bg-slate-900 rounded-lg p-3 overflow-auto">
            <pre className="text-[10px] text-slate-300 font-mono whitespace-pre">{code}</pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
        <h4 className="text-xs text-slate-400 mb-2 font-medium">📋 Setup Instructions</h4>
        <ol className="text-[10px] text-slate-500 space-y-1 list-decimal list-inside">
          <li>Download the .ino file or copy the code</li>
          <li>Open Arduino IDE or PlatformIO</li>
          <li>Select your board: {config.boardType}</li>
          <li>Install required libraries (see platformio.ini)</li>
          <li>Upload to your {config.boardType}</li>
          {config.boardType === 'esp32' && (
            <>
              <li>Update WiFi credentials in the code</li>
              <li>Note the IP address from Serial Monitor</li>
              <li>Connect via WiFi using the IP above</li>
            </>
          )}
        </ol>
      </div>
    </div>
  );
}
