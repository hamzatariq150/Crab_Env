import { useState, useRef, useCallback, useEffect } from 'react';
import { HardwareConfig, ConnectionState, HardwareTelemetry, NeuralWeights, SerialMessage } from '../types';

export function useHardwareBridge() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [config, setConfig] = useState<HardwareConfig>({
    connectionType: 'serial',
    baudRate: 115200,
    boardType: 'esp32',
  });
  const [telemetry, setTelemetry] = useState<HardwareTelemetry | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<HardwareTelemetry[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const bufferRef = useRef<string>('');

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' | 'data' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-99), `[${timestamp}] [${type.toUpperCase()}] ${message}`]);
  }, []);

  const parseMessage = useCallback((data: string): SerialMessage | null => {
    try {
      const json = JSON.parse(data);
      return json as SerialMessage;
    } catch {
      // Try to parse as sensor data format: "S:val1,val2,val3..."
      if (data.startsWith('S:')) {
        const values = data.substring(2).split(',').map(Number);
        return {
          type: 'sensor_data',
          payload: { sensors: values },
          timestamp: Date.now(),
        };
      }
      // Telemetry format: "T:battery,roll,pitch,yaw"
      if (data.startsWith('T:')) {
        const values = data.substring(2).split(',').map(Number);
        return {
          type: 'telemetry',
          payload: { battery: values[0], imu: { roll: values[1], pitch: values[2], yaw: values[3] } },
          timestamp: Date.now(),
        };
      }
      // Status format: "STATUS:message"
      if (data.startsWith('STATUS:')) {
        return {
          type: 'status',
          payload: { message: data.substring(7) },
          timestamp: Date.now(),
        };
      }
      return null;
    }
  }, []);

  const handleIncomingData = useCallback((data: string) => {
    bufferRef.current += data;
    
    // Process complete lines
    const lines = bufferRef.current.split('\n');
    bufferRef.current = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        const message = parseMessage(line.trim());
        if (message) {
          if (message.type === 'sensor_data') {
            setTelemetry(prev => ({
              timestamp: Date.now(),
              sensors: message.payload.sensors || [],
              motorSpeeds: prev?.motorSpeeds || [0, 0, 0, 0],
              battery: prev?.battery || 100,
              imu: prev?.imu || { roll: 0, pitch: 0, yaw: 0 },
              status: 'receiving',
            }));
          } else if (message.type === 'telemetry') {
            setTelemetry(prev => ({
              ...prev!,
              battery: message.payload.battery,
              imu: message.payload.imu,
              timestamp: Date.now(),
            }));
          } else if (message.type === 'status') {
            addLog(message.payload.message, 'data');
          }
        }
        addLog(line.trim(), 'data');
      }
    }
  }, [parseMessage, addLog]);

  // Update telemetry history
  useEffect(() => {
    if (telemetry) {
      setTelemetryHistory(prev => [...prev.slice(-99), telemetry]);
    }
  }, [telemetry]);

  const connectSerial = useCallback(async () => {
    if (!('serial' in navigator)) {
      addLog('Web Serial API not supported in this browser. Use Chrome or Edge.', 'error');
      setConnectionState('error');
      return;
    }

    try {
      setConnectionState('connecting');
      addLog('Requesting serial port...', 'info');

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: config.baudRate });

      portRef.current = port;
      addLog(`Port opened at ${config.baudRate} baud`, 'success');

      // Set up reader
      const reader = port.readable?.getReader();
      if (reader) {
        readerRef.current = reader;
        
        const readLoop = async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (value) {
                const text = new TextDecoder().decode(value);
                handleIncomingData(text);
              }
            }
          } catch (error) {
            addLog(`Read error: ${error}`, 'error');
          }
        };
        readLoop();
      }

      // Set up writer
      const writer = port.writable?.getWriter();
      if (writer) {
        writerRef.current = writer;
      }

      setConnectionState('connected');
      addLog('Connected to device successfully!', 'success');

    } catch (error) {
      addLog(`Connection failed: ${error}`, 'error');
      setConnectionState('error');
    }
  }, [config.baudRate, addLog, handleIncomingData]);

  const disconnectSerial = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (writerRef.current) {
        writerRef.current.releaseLock();
        writerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      setConnectionState('disconnected');
      addLog('Disconnected from device', 'info');
    } catch (error) {
      addLog(`Disconnect error: ${error}`, 'error');
    }
  }, [addLog]);

  const sendCommand = useCallback(async (command: string) => {
    if (!writerRef.current) {
      addLog('Not connected - cannot send command', 'error');
      return;
    }

    try {
      const encoder = new TextEncoder();
      await writerRef.current.write(encoder.encode(command + '\n'));
      addLog(`Sent: ${command}`, 'info');
    } catch (error) {
      addLog(`Send error: ${error}`, 'error');
    }
  }, [addLog]);

  const sendMotorCommand = useCallback(async (speeds: number[]) => {
    const cmd = `M:${speeds.join(',')}`;
    await sendCommand(cmd);
  }, [sendCommand]);

  const uploadWeights = useCallback(async (weights: NeuralWeights) => {
    if (!writerRef.current) {
      addLog('Not connected - cannot upload weights', 'error');
      return;
    }

    try {
      // Send weights as JSON
      const message: SerialMessage = {
        type: 'weights_upload',
        payload: weights,
        timestamp: Date.now(),
      };
      
      const cmd = `W:${JSON.stringify(message.payload)}`;
      await sendCommand(cmd);
      addLog(`Uploaded neural network weights (Gen ${weights.generation})`, 'success');
    } catch (error) {
      addLog(`Upload error: ${error}`, 'error');
    }
  }, [sendCommand, addLog]);

  const connectWiFi = useCallback(async () => {
    if (!config.wifiIP) {
      addLog('WiFi IP address required', 'error');
      return;
    }

    try {
      setConnectionState('connecting');
      addLog(`Connecting to ESP32 at ${config.wifiIP}:${config.wifiPort || 80}...`, 'info');

      // WebSocket connection for real-time communication
      const ws = new WebSocket(`ws://${config.wifiIP}:${config.wifiPort || 81}/ws`);
      
      ws.onopen = () => {
        setConnectionState('connected');
        addLog('Connected via WiFi!', 'success');
      };

      ws.onmessage = (event) => {
        handleIncomingData(event.data);
      };

      ws.onerror = (error) => {
        addLog(`WebSocket error: ${error}`, 'error');
        setConnectionState('error');
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        addLog('WiFi connection closed', 'info');
      };

    } catch (error) {
      addLog(`WiFi connection failed: ${error}`, 'error');
      setConnectionState('error');
    }
  }, [config.wifiIP, config.wifiPort, addLog, handleIncomingData]);

  const connect = useCallback(async () => {
    if (config.connectionType === 'serial') {
      await connectSerial();
    } else if (config.connectionType === 'wifi') {
      await connectWiFi();
    }
  }, [config.connectionType, connectSerial, connectWiFi]);

  const disconnect = useCallback(async () => {
    if (config.connectionType === 'serial') {
      await disconnectSerial();
    }
  }, [config.connectionType, disconnectSerial]);

  return {
    connectionState,
    config,
    telemetry,
    telemetryHistory,
    logs,
    setConfig,
    connect,
    disconnect,
    sendCommand,
    sendMotorCommand,
    uploadWeights,
    clearLogs: () => setLogs([]),
  };
}
