# Hardware Setup Guide

## Complete Wiring Diagram for ESP32

### Component List
- 1x ESP32 DevKit V1
- 8x HC-SR04 Ultrasonic Sensors
- 1x L298N Motor Driver
- 2x DC Gear Motors (6V-12V)
- 1x MPU6050 IMU Module
- 1x Voltage Divider (for battery monitoring)
- 1x 7.4V LiPo Battery (2S)
- 1x Power Switch
- Jumper wires, breadboard/PCB

### Pin Connections

#### HC-SR04 Ultrasonic Sensors (8x)
```
Sensor 0 (Front):
  VCC → 5V
  GND → GND
  TRIG → GPIO 32
  ECHO → GPIO 18 (via voltage divider 5V→3.3V)

Sensor 1 (Front-Right 45°):
  VCC → 5V
  GND → GND
  TRIG → GPIO 35
  ECHO → GPIO 19

Sensor 2 (Right 90°):
  VCC → 5V
  GND → GND
  TRIG → GPIO 34
  ECHO → GPIO 21

Sensor 3 (Back-Right 135°):
  VCC → 5V
  GND → GND
  TRIG → GPIO 39
  ECHO → GPIO 22

Sensor 4 (Back 180°):
  VCC → 5V
  GND → GND
  TRIG → GPIO 36
  ECHO → GPIO 23

Sensor 5 (Back-Left 225°):
  VCC → 5V
  GND → GND
  TRIG → GPIO 13
  ECHO → GPIO 4

Sensor 6 (Left 270°):
  VCC → 5V
  GND → GND
  TRIG → GPIO 16
  ECHO → GPIO 15

Sensor 7 (Front-Left 315°):
  VCC → 5V
  GND → GND
  TRIG → GPIO 17
  ECHO → GPIO 2
```

**Note**: HC-SR04 ECHO pins output 5V. Use a voltage divider (2x 1kΩ + 2x 2kΩ resistors) or logic level converter to protect ESP32 GPIO pins.

#### L298N Motor Driver
```
L298N        ESP32
-------      -----
ENA    →     GPIO 14 (PWM)
IN1    →     GPIO 27
IN2    →     GPIO 26
ENB    →     GPIO 12 (PWM)
IN3    →     GPIO 25
IN4    →     GPIO 33
VCC    →     7.4V Battery (+)
GND    →     Battery (-) AND ESP32 GND
5V OUT →     Can power ESP32 (if regulator on board)
```

**Motor Connections:**
```
Left Motor  → OUT1, OUT2
Right Motor → OUT3, OUT4
```

#### MPU6050 IMU
```
MPU6050      ESP32
-------      -----
VCC    →     3.3V
GND    →     GND
SCL    →     GPIO 22 (I2C Clock)
SDA    →     GPIO 21 (I2C Data)
INT    →     (optional) GPIO 2
```

#### Battery Monitoring
```
Battery (+) → 10kΩ → GPIO 35 → 10kΩ → GND
                    (voltage divider: 7.4V → 3.7V)
```

### Power Supply
- Use a 7.4V LiPo battery (2S)
- Connect to L298N VCC input
- ESP32 can be powered from L298N 5V output (if it has onboard regulator)
- Or use a separate buck converter (7.4V → 5V) for ESP32

### Assembly Tips

1. **Sensor Placement**:
   - Mount sensors evenly around the robot at 45° intervals
   - Angle sensors slightly downward (10-15°) for better ground detection
   - Keep sensors at least 5cm above ground

2. **Motor Mounting**:
   - Use differential drive (2 wheels + caster)
   - Ensure motors are securely mounted
   - Add rubber wheels for better traction

3. **Wiring**:
   - Use twisted pairs for motor wires (reduce noise)
   - Keep sensor wires short (<30cm)
   - Add decoupling capacitors (100µF) near motors
   - Use heat shrink tubing for all connections

4. **PCB Design** (Optional):
   - Design a custom PCB for cleaner connections
   - Include test points for debugging
   - Add mounting holes for sensors

## Arduino IDE Setup

### 1. Install ESP32 Board Support
```
File → Preferences → Additional Board Manager URLs:
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

Tools → Board → Board Manager → Search "ESP32" → Install
```

### 2. Install Required Libraries
```
Sketch → Include Library → Manage Libraries

Install:
- WebSockets by Markus Sattler (for ESP32 WiFi)
- ArduinoJson by Benoit Blanchon
- Wire (built-in)
```

### 3. Upload Firmware
```
1. Open the generated .ino file in Arduino IDE
2. Select Board: ESP32 Dev Module
3. Select Port: (your ESP32 COM port)
4. Update WiFi credentials in code
5. Click Upload
6. Open Serial Monitor (115200 baud)
7. Note the IP address displayed
```

### 4. Connect from Web App
```
1. Open Sesame Robot AI Lab in Chrome/Edge
2. Switch to "Hardware" tab
3. Select "WiFi" connection type
4. Enter ESP32 IP address
5. Port: 81 (default)
6. Click "Connect to Robot"
```

## Testing

### Sensor Test
Upload this test sketch to verify sensors:
```cpp
void setup() {
  Serial.begin(115200);
  // Initialize sensor pins...
}

void loop() {
  for (int i = 0; i < 8; i++) {
    float dist = readUltrasonic(SENSOR_TRIG_PINS[i], SENSOR_ECHO_PINS[i]);
    Serial.print("S");
    Serial.print(i);
    Serial.print(": ");
    Serial.print(dist);
    Serial.print("cm  ");
  }
  Serial.println();
  delay(200);
}
```

### Motor Test
```cpp
void setup() {
  // Initialize motor pins...
}

void loop() {
  // Forward
  setMotorSpeed(0, 150);
  setMotorSpeed(1, 150);
  delay(2000);
  
  // Stop
  setMotorSpeed(0, 0);
  setMotorSpeed(1, 0);
  delay(1000);
  
  // Turn
  setMotorSpeed(0, 100);
  setMotorSpeed(1, -100);
  delay(1500);
  
  // Stop
  setMotorSpeed(0, 0);
  setMotorSpeed(1, 0);
  delay(1000);
}
```

## Troubleshooting Hardware

### Sensors Not Reading
- Check wiring (TRIG/ECHO swapped?)
- Verify 5V power to sensors
- Test with simple sketch first
- Check voltage divider on ECHO pins

### Motors Not Moving
- Verify L298N power supply (need 7V+ on VCC)
- Check ENA/ENB jumpers are removed (using PWM)
- Test with simple motor sketch
- Ensure common GND between ESP32 and L298N

### WiFi Not Connecting
- Verify SSID and password in code
- Check router settings (2.4GHz only, ESP32 doesn't support 5GHz)
- Try different WiFi network
- Check ESP32 antenna (if external)

### Serial Connection Issues
- Try different USB cable (data cable, not charge-only)
- Install CP210x or CH340 drivers (depending on ESP32 board)
- Check baud rate matches (115200)
- Close other programs using serial port

### Robot Moving Erratically
- Check sensor readings (noise?)
- Add software filtering (moving average)
- Verify motor directions (swap wires if reversed)
- Check battery voltage (low voltage = weak motors)
- Ensure IMU is calibrated

## Cost Estimate

| Component | Quantity | Price (USD) |
|-----------|----------|-------------|
| ESP32 DevKit | 1 | $6-10 |
| HC-SR04 Sensors | 8 | $8-12 |
| L298N Driver | 1 | $3-5 |
| DC Gear Motors | 2 | $6-10 |
| MPU6050 IMU | 1 | $2-4 |
| LiPo Battery 7.4V | 1 | $10-15 |
| Wheels + Chassis | 1 set | $8-15 |
| Wires, Connectors | - | $5-10 |
| **Total** | | **$48-81** |

## Next Steps

1. ✅ Build the hardware
2. ✅ Test all components individually
3. ✅ Upload firmware with trained weights
4. ✅ Connect to web app
5. ✅ Test autonomous navigation
6. ✅ Fine-tune sensor placement
7. ✅ Retrain AI with real-world data
8. ✅ Iterate and improve!

---

**Need Help?** Check the main README.md or open an issue on GitHub.
