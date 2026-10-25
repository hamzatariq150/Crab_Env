# Sesame Robot AI Training Lab

A comprehensive reinforcement learning environment for training a Sesame robot to walk and avoid obstacles, with full hardware integration for Arduino and ESP32.

![Sesame Robot AI Lab](https://img.shields.io/badge/AI-Reinforcement_Learning-blue)
![Hardware](https://img.shields.io/badge/Hardware-Arduino%20%7C%20ESP32-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Features

### 🧪 Simulation Environment
- **6 Training Scenarios**: From simple obstacle avoidance to complex mazes
- **Real-time Neural Network Visualization**: Watch the AI learn in real-time
- **Genetic Algorithm Training**: Evolutionary approach to learning
- **Performance Metrics**: Track fitness, collisions, and learning progress
- **Adjustable Speed**: Train 1x to 10x faster than real-time

### 🔌 Hardware Integration
- **Web Serial API**: Direct USB connection to Arduino/ESP32
- **WiFi Support**: Wireless communication with ESP32 via WebSocket
- **Real-time Telemetry**: Live sensor data, IMU readings, and battery status
- **Weight Upload**: Transfer trained neural networks directly to hardware
- **Code Generation**: Auto-generate Arduino/ESP32 firmware with trained weights

### 🤖 Supported Hardware
- **ESP32** (recommended) - WiFi + Bluetooth support
- **Arduino Uno**
- **Arduino Mega**
- **Arduino Nano**

## 🚀 Quick Start

### 1. Train in Simulation
1. Open the web application
2. Select a training scenario (start with "Simple Obstacles")
3. Click "Start Training"
4. Watch the robot learn to avoid obstacles
5. Train for at least 50-100 episodes for good results

### 2. Deploy to Hardware
1. Switch to the "Hardware" tab
2. Select your board type (ESP32 recommended)
3. Click "View Generated Code" or "Download .ino"
4. Upload to your Arduino/ESP32 via Arduino IDE
5. Connect back to the web app via USB or WiFi
6. Click "Upload Weights to Robot" to transfer the trained AI

## 🔧 Hardware Setup

### Required Components

#### For ESP32 (Recommended):
- ESP32 Development Board
- 8x HC-SR04 Ultrasonic Sensors
- L298N Motor Driver
- 2x DC Motors (for differential drive)
- MPU6050 IMU (accelerometer/gyroscope)
- Battery pack (7.4V LiPo recommended)
- Jumper wires and breadboard

#### For Arduino Uno/Mega/Nano:
- Arduino board
- Same sensors as above
- USB cable for serial connection

### Wiring Diagram

#### Ultrasonic Sensors (8x HC-SR04):
```
ESP32 Pin Mapping:
Sensor 0: TRIG=32, ECHO=18
Sensor 1: TRIG=35, ECHO=19
Sensor 2: TRIG=34, ECHO=21
Sensor 3: TRIG=39, ECHO=22
Sensor 4: TRIG=36, ECHO=23
Sensor 5: TRIG=13, ECHO=4
Sensor 6: TRIG=16, ECHO=15
Sensor 7: TRIG=17, ECHO=2
```

#### Motor Driver (L298N):
```
ESP32 Pin Mapping:
Motor A (Left):
  - ENA = 14 (PWM)
  - IN1 = 27
  - IN2 = 26

Motor B (Right):
  - ENB = 12 (PWM)
  - IN3 = 25
  - IN4 = 33
```

#### IMU (MPU6050):
```
SDA = GPIO 21
SCL = GPIO 22
VCC = 3.3V
GND = GND
```

#### Battery Monitoring:
```
Voltage divider to GPIO 35 (ESP32) or A0 (Arduino)
```

## 📡 Communication Protocol

The web app communicates with the robot using a simple text-based protocol:

### Robot → Web (Telemetry)
```
S:dist0,dist1,dist2,dist3,dist4,dist5,dist6,dist7
```
Sensor distances in cm (8 ultrasonic sensors)

```
T:battery,roll,pitch,yaw
```
Battery percentage and IMU orientation

```
STATUS:message
```
Status messages from robot

### Web → Robot (Commands)
```
M:left_speed,right_speed
```
Motor speeds from -1.0 to 1.0

```
W:{json_weights}
```
Upload neural network weights

```
STATUS
```
Request telemetry update

## 🧠 Neural Network Architecture

The AI uses a simple feedforward neural network:

```
Input Layer (10 neurons):
  - 8 sensor distances (normalized 0-1)
  - Target direction (angle to goal)
  - Target distance (normalized)

Hidden Layer (12 neurons):
  - Sigmoid activation function

Output Layer (3 neurons):
  - Forward speed (0-1)
  - Turn rate (0-1, centered at 0.5)
  - Brake (0-1)
```

### Training Process
1. **Initialization**: Random weights
2. **Episode**: Robot explores environment for 1000 steps
3. **Fitness Calculation**: Based on distance traveled, obstacles avoided, collisions
4. **Selection**: Best performing networks are kept
5. **Mutation**: Weights are slightly modified to create next generation
6. **Repeat**: Every 5 episodes, evolve to next generation

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Chrome or Edge browser (for Web Serial API)
- Arduino IDE or PlatformIO

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/sesame-robot-ai-lab.git
cd sesame-robot-ai-lab

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure
```
src/
├── components/
│   ├── SimulationCanvas.tsx    # 2D simulation renderer
│   ├── ControlPanel.tsx        # Training controls
│   ├── StatsPanel.tsx          # Performance metrics
│   ├── ScenarioSelector.tsx    # Scenario selection
│   ├── NeuralViz.tsx           # Neural network visualization
│   ├── ConnectionPanel.tsx     # Hardware connection UI
│   ├── CodeGeneratorPanel.tsx  # Arduino code generator
│   └── HardwareTelemetryPanel.tsx  # Live robot data
├── hooks/
│   ├── useSimulation.ts        # Simulation logic
│   └── useHardwareBridge.ts    # Hardware communication
├── utils/
│   └── codeGenerator.ts        # Arduino/ESP32 code generation
├── types.ts                    # TypeScript definitions
├── scenarios.ts                # Training scenarios
└── App.tsx                     # Main application
```

## 📊 Training Tips

1. **Start Simple**: Begin with "Open Field" or "Simple Obstacles"
2. **Train Longer**: More episodes = better learning (aim for 100+)
3. **Monitor Fitness**: Watch for improving fitness scores
4. **Adjust Speed**: Use 5x-10x speed for faster training
5. **Progressive Difficulty**: Move to harder scenarios as robot improves
6. **Test Frequently**: Upload weights to hardware regularly to test

## 🐛 Troubleshooting

### Web Serial API Not Working
- Use Chrome or Edge browser
- Ensure HTTPS or localhost
- Check browser permissions for serial access

### Robot Not Responding
- Verify baud rate matches (default: 115200)
- Check USB connection
- View Serial Monitor in Arduino IDE for debugging

### Poor Learning Performance
- Train for more episodes
- Try different scenarios
- Adjust exploration rate in simulation
- Ensure sensor readings are accurate on hardware

### WiFi Connection Issues (ESP32)
- Verify WiFi credentials in code
- Check ESP32 IP address from Serial Monitor
- Ensure both devices are on same network
- Try different WebSocket port (default: 81)

## 🔮 Future Enhancements

- [ ] Deep Q-Network (DQN) implementation
- [ ] Camera-based obstacle detection
- [ ] Multi-robot coordination
- [ ] Cloud training and deployment
- [ ] Mobile app control
- [ ] Voice commands
- [ ] SLAM (Simultaneous Localization and Mapping)
- [ ] Path planning algorithms

## 📄 License

MIT License - feel free to use this project for learning, research, or commercial applications.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 🙏 Acknowledgments

- Inspired by OpenAI's robotics research
- Built with React, TypeScript, and Tailwind CSS
- Hardware integration via Web Serial API and WebSockets

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Happy Training! 🤖✨**
