#include <Wire.h>
#include <BH1750.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
//http://arduino.esp8266.com/stable/package_esp8266com_index.json


const char* ssid = "Thatte";
const char* password = "doinhucac";
const char* mqtt_server = "broker.hivemq.com";  

const char* mqtt_user = "anh123";     // ...
const char* mqtt_password = "1234";

#define DHTPIN D4
#define DHTTYPE DHT22
#define LED1 D5
#define LED2 D6
#define LED3 D7

DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter;
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastSensorPublish = 0;
const long sensorInterval = 3000;

void setup_wifi() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);
  
  if (String(topic) == "device") {
    String historyJson = "{";
    bool firstDevice = true;
    
    // Xử lý điều khiển device1 và thêm vào history
    if (message.indexOf("\"device1\": \"on\"") != -1) {
      digitalWrite(LED1, HIGH);
      if (!firstDevice) historyJson += ", ";
      historyJson += "\"device1\": \"on\"";
      firstDevice = false;
      Serial.println("Device1 turned ON");
    } else if (message.indexOf("\"device1\": \"off\"") != -1) {
      digitalWrite(LED1, LOW);
      if (!firstDevice) historyJson += ", ";
      historyJson += "\"device1\": \"off\"";
      firstDevice = false;
      Serial.println("Device1 turned OFF");
    }
    
    // Xử lý điều khiển device2 và thêm vào history
    if (message.indexOf("\"device2\": \"on\"") != -1) {
      digitalWrite(LED2, HIGH);
      if (!firstDevice) historyJson += ", ";
      historyJson += "\"device2\": \"on\"";
      firstDevice = false;
      Serial.println("Device2 turned ON");
    } else if (message.indexOf("\"device2\": \"off\"") != -1) {
      digitalWrite(LED2, LOW);
      if (!firstDevice) historyJson += ", ";
      historyJson += "\"device2\": \"off\"";
      firstDevice = false;
      Serial.println("Device2 turned OFF");
    }
    
    // Xử lý điều khiển device3 và thêm vào history
    if (message.indexOf("\"device3\": \"on\"") != -1) {
      digitalWrite(LED3, HIGH);
      if (!firstDevice) historyJson += ", ";
      historyJson += "\"device3\": \"on\"";
      firstDevice = false;
      Serial.println("Device3 turned ON");
    } else if (message.indexOf("\"device3\": \"off\"") != -1) {
      digitalWrite(LED3, LOW);
      if (!firstDevice) historyJson += ", ";
      historyJson += "\"device3\": \"off\"";
      firstDevice = false;
      Serial.println("Device3 turned OFF");
    }
    
    historyJson += "}";
    
    // Pub lịch sử hành động đến topic historyaction
    client.publish("historyaction", historyJson.c_str());
    Serial.print("Published to historyaction: ");
    Serial.println(historyJson);
  }
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      client.subscribe("device");
      Serial.println("MQTT connected and subscribed to 'device' topic");
    } else {
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // Bật tất cả đèn LED ngay khi khởi động
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  digitalWrite(LED1, HIGH);
  digitalWrite(LED2, HIGH);
  digitalWrite(LED3, HIGH);
  Serial.println("All LEDs turned ON");

  Wire.begin(D2, D1);
  lightMeter.begin();
  dht.begin();

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  randomSeed(micros());
  
  Serial.println("Setup completed");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastSensorPublish > sensorInterval) {
    lastSensorPublish = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    float l = lightMeter.readLightLevel();

    if (!isnan(h) && !isnan(t)) {
      //            Hiển thị giá trị cảm biến lên Serial Monitor (can khi fix code)
      Serial.print("Temperature: ");
      Serial.print(t);
      Serial.print("°C, Humidity: ");
      Serial.print(h);
      Serial.print("%, Light: ");
      Serial.print(l);
      Serial.println(" lux");
      
      // Pub giá trị cảm biến dạng JSON
      String sensorJson = "{\"temperature\": " + String(t) + 
                         ", \"humidity\": " + String(h) + 
                         ", \"light\": " + String(l) + "}";
      client.publish("datasensor", sensorJson.c_str());
      Serial.println("Published to datasensor: " + sensorJson);
    } else {
      Serial.println("Failed to read from DHT sensor!");
    }
  }
  delay(5000);// thoi gian cho phong thay bat sua code 
}
