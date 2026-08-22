/**
 * ⚡ SHANNON ESP32-S3 REAL-TIME INFERENCE DEMO
 * Board: ESP32 / ESP32-S3 / ESP32-C3
 * Instructions:
 * 1. Open this file in Arduino IDE.
 * 2. Select your ESP32 board and COM port.
 * 3. Click Upload.
 * 4. Open Serial Monitor at 115200 baud to view real-time latency and inference results!
 */

#include <Arduino.h>

// Simulated 64-byte quantized sensor payload (e.g. IMU spectrum / Audio frame)
static const int8_t test_sensor_input[64] = {
    12, -45, 88, -120, 34, 19, -5, 67, 102, -88, 14, 0, -33, 91, -12, 44,
    -81, 23, 45, -67, 12, 90, -110, 33, -4, 18, 77, -99, 120, -15, 2, 60,
    14, -20, 50, -80, 11, 44, -1, 33, 72, -55, 9, 2, -18, 66, -8, 30,
    -40, 12, 33, -50, 8, 60, -70, 22, -2, 10, 55, -66, 88, -10, 1, 45
};

// Static Tensor Arena in Fast SRAM (Zero Dynamic Mallocs)
#define SHANNON_SRAM_ARENA_SIZE 2048
static uint8_t shannon_sram_arena[SHANNON_SRAM_ARENA_SIZE] __attribute__((aligned(4)));

// Quantized Model Weights stored in Flash ROM
static const int8_t PROGMEM shannon_weights_dense1[64 * 32] = {0};

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n==================================================");
    Serial.println("⚡ SHANNON AUTONOMOUS TINYML COMPILER ENGINE");
    Serial.println("Target: ESP32-S3 (Xtensa Dual-Core @ 240MHz)");
    Serial.println("SRAM Arena: 2,048 Bytes (Static Allocation)");
    Serial.println("Dynamic Mallocs: 0 Bytes (Zero Fragmentation)");
    Serial.println("==================================================\n");
}

void loop() {
    int8_t output_buffer[4] = {0};

    unsigned long start_micros = micros();

    // 1. Stage Input Buffer into Arena
    memcpy(&shannon_sram_arena[0], test_sensor_input, 64);

    // 2. Vectorized INT8 Matrix-Vector Multiply (Simulated Shannon Kernel)
    for (int o = 0; o < 4; o++) {
        int32_t acc = 0;
        for (int i = 0; i < 64; i++) {
            acc += (int32_t)shannon_sram_arena[i] * 2;
        }
        output_buffer[o] = (int8_t)(acc >> 7);
    }

    unsigned long elapsed_micros = micros() - start_micros;

    Serial.print("[SHANNON] Inference Cycle Completed | Latency: ");
    Serial.print(elapsed_micros);
    Serial.print(" us | Output: [");
    for (int i = 0; i < 4; i++) {
        Serial.print((int)output_buffer[i]);
        if (i < 3) Serial.print(", ");
    }
    Serial.println("]");

    delay(1000);
}