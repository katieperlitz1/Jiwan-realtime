#include <bluefruit.h> // BLE coomunication
#include "LSM6DS3.h" // XIAO BLE Sense LSM6DS3 Accelerometer Raw Data
#include "Wire.h"

LSM6DS3 myIMU(I2C_MODE, 0x6A);  // IMU setting
int16_t ax, ay, az; // 2 btye each sensor data value
int16_t gx, gy, gz; // 2 btye each sensor data value
uint32_t timestamp; // 4 btye for timestamp

#define BUF_SIZE  247
byte  sampleBuffer_8bit[BUF_SIZE]; // 21 byte for data

int sampleCounter = 0;    // packet ID

// BLE Service
BLEUart bleuart; // uart over ble

// GATT:  rule for data transmission
// GAP: advertising management layer
// Advertising: send device info GAP peripheral to central 
void startAdv(void)
{
  // Advertising packet
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE); 
  Bluefruit.Advertising.addTxPower();

  //bleuart service enroll
  Bluefruit.Advertising.addService(bleuart);
  Bluefruit.ScanResponse.addName();

  Bluefruit.setName ("XIAO nRF52840 Sense");


  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 32);     // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(30);      // number of seconds in fast mode
  Bluefruit.Advertising.start(0);                // 0 = Don't stop advertising after n seconds  
}

void connect_callback(uint16_t conn_handle)
{
  // Get the reference to current connection
  BLEConnection* connection = Bluefruit.Connection(conn_handle);

  char central_name[32] = { 0 };
  connection->getPeerName(central_name, sizeof(central_name));
  delay(100);

  connection->requestPHY(BLE_GAP_PHY_2MBPS);  // set PHY to 2MBPS
  delay(100);

  Serial.print("Connected to ");
  Serial.println(central_name);
}

void disconnect_callback(uint16_t conn_handle, uint8_t reason)
{
  (void) conn_handle;
  (void) reason;

  Serial.println();
  Serial.print("Disconnected, reason = 0x"); Serial.println(reason, HEX);
}

void initIMU(void){
  Wire.begin();
  delay(2000);

  if (myIMU.begin() != 0) {
    Serial.println("Device error");
  } else {
    Serial.println("Device OK!");
  }
}

void initBLE(void){
  // Setup the BLE LED to be enabled on CONNECT
  Bluefruit.autoConnLed(true);

  // Config the peripheral connection with maximum bandwidth 
  // more SRAM required by SoftDevice
  // Note: All config***() function must be called before begin()
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX); // I modified configPrphBandwidth function in bluefruit.cpp

  Bluefruit.begin();
  Bluefruit.setTxPower(8); // NRF52840 can work up to 8dBm
  // Bluefruit.setName("XIAO nRF52840 Sense"); // set device name

  //callback func enrollment
  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);

  // Connection interval: 7.5 ms ~ 4 secs.
  Bluefruit.Periph.setConnInterval(6, 12); // 7.5-15ms 

  // Configure and Start BLE Uart Service
  bleuart.begin();
}

void initLED(void){
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
}

void setup() {
  Serial.begin(115200);
  initLED();
  initIMU();
  initBLE();

  // Set up and start advertising
  startAdv();
}

void loop() {
  // Pointers for accessing the arrays
  byte* bytePtr = sampleBuffer_8bit;
  sampleCounter += 1;

  // built-in IMU sensor in the XIAO mcu
  ax = myIMU.readRawAccelX();
  ay = myIMU.readRawAccelY();
  az = myIMU.readRawAccelZ();
  gx = myIMU.readRawGyroX();
  gy = myIMU.readRawGyroY();
  gz = myIMU.readRawGyroZ();
  timestamp = millis();

  // Write packet ID at first byte.
  *bytePtr++ = sampleCounter;

  // Write timestamp for next 4 bytes (1-4)
  *bytePtr++ = (timestamp >> 24) & 0xFF; 
  *bytePtr++ = (timestamp >> 16) & 0xFF;
  *bytePtr++ = (timestamp >> 8) & 0xFF;
  *bytePtr++ = timestamp & 0xFF; 

  // Write IMU data for next 12 bytes (5-16)
  *bytePtr++ = (ax >> 8) & 0xFF; *bytePtr++ = (ax & 0xFF);
  *bytePtr++ = (ay >> 8) & 0xFF; *bytePtr++ = (ay & 0xFF);
  *bytePtr++ = (az >> 8) & 0xFF; *bytePtr++ = (az & 0xFF);
  *bytePtr++ = (gx >> 8) & 0xFF; *bytePtr++ = (gx & 0xFF);
  *bytePtr++ = (gy >> 8) & 0xFF; *bytePtr++ = (gy & 0xFF);
  *bytePtr++ = (gz >> 8) & 0xFF; *bytePtr++ = (gz & 0xFF);

  // capactive sensors


  // send byte array data through BLEUART
  bleuart.write(sampleBuffer_8bit, 12+4+1);
}

