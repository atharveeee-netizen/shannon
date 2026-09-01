/* ===========================================================================
 * SHANNON AI — UNIVERSAL ARDUINO INFERENCE RUNNER
 * 
 * Target Boards:
 *   - Arduino Uno R4 (WiFi / Minima - Renesas RA4M1 ARM Cortex-M4)
 *   - Arduino Nano ESP32 / Nano 33 BLE Sense
 *   - Arduino GIGA R1 WiFi / Portenta H7
 *   - Adafruit Feather / Seeed Studio SAMD21 / ESP32 boards
 *
 * Requirements:
 *   - Zero extra libraries needed.
 *   - Place "shannon_kws_model.h" (or any other model) in this sketch directory.
 * =========================================================================== */

#include <Arduino.h>
#include "shannon_kws_model.h"

static int8_t synthetic_input[49 * 10];
static int8_t output_logits[4];
const char* labels[] = {"Silence", "Unknown", "YES", "NO"};

void setup() {
    Serial.begin(115200);
    while (!Serial && millis() < 3000); // Wait for Serial Monitor

    Serial.println("==========================================================");
    Serial.println("★ SHANNON AI — UNIVERSAL ARDUINO TINYML BENCHMARK");
    Serial.println("==========================================================");
    Serial.print("[*] SRAM Tensor Arena:   "); Serial.print(SHANNON_ARENA_SIZE); Serial.println(" Bytes (0 Dynamic Malloc)");
    Serial.print("[*] Model Flash (ROM):   "); Serial.print(SHANNON_FLASH_BYTES); Serial.println(" Bytes");
    Serial.print("[*] Total MAC Operations: "); Serial.println(SHANNON_TOTAL_MACS);
    Serial.println("[+] Model successfully mounted in static Flash ROM.");
    Serial.println("----------------------------------------------------------");
}

void loop() {
    // 1. Fill input buffer (synthetic acoustic or ADC stream)
    for (int i = 0; i < 49 * 10; i++) {
        synthetic_input[i] = (int8_t)random(-64, 64);
    }
    // Inject synthetic "YES" acoustic pattern into channels 6..9
    for (int t = 15; t < 35; t++) {
        for (int c = 6; c < 10; c++) {
            synthetic_input[t * 10 + c] = (int8_t)105;
        }
    }

    // 2. Benchmark Zero-Malloc Inference Execution
    uint32_t t_start = micros();
    int res = shannon_run_inference(synthetic_input, output_logits);
    uint32_t t_duration = micros() - t_start;

    if (res == 0) {
        int best_idx = 0;
        int8_t max_val = output_logits[0];
        for (int i = 1; i < 4; i++) {
            if (output_logits[i] > max_val) {
                max_val = output_logits[i];
                best_idx = i;
            }
        }

        Serial.print("[INFERENCE SUCCESS] Predicted: ");
        Serial.print(labels[best_idx]);
        Serial.print(" | Score: ");
        Serial.print(max_val);
        Serial.print(" | Execution Time: ");
        Serial.print(t_duration);
        Serial.println(" microseconds");
    } else {
        Serial.println("[ERROR] Inference execution failed.");
    }

    delay(1000);
}
