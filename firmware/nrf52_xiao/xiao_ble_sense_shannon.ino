/* ===========================================================================
 * SHANNON AI — SEEED XIAO BLE SENSE (nRF52840) FIRMWARE
 * 
 * Hardware:
 *   - Seeed Studio XIAO BLE Sense (Nordic nRF52840 ARM Cortex-M4F)
 *   - Onboard PDM Microphone & LSM6DS3 IMU
 *   - Bluetooth Low Energy (BLE)
 * =========================================================================== */

#include <Arduino.h>
#include "shannon_kws_model.h"

static int8_t audio_input_tensor[49 * 10];
static int8_t output_logits[4];

void setup() {
    Serial.begin(115200);
    while (!Serial && millis() < 2500);

    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH); // Off for active low

    Serial.println("\n[SHANNON AI] XIAO nRF52840 BLE Sense TinyML Engine");
    Serial.printf("[*] SRAM Tensor Arena: %d Bytes\n", SHANNON_ARENA_SIZE);
    Serial.printf("[*] Flash Memory:      %d Bytes\n", SHANNON_FLASH_BYTES);
    Serial.println("[+] Model successfully embedded in Nordic nRF52 Flash.");
}

void loop() {
    // Fill dummy sensor features
    for (int i = 0; i < 49 * 10; i++) {
        audio_input_tensor[i] = (int8_t)random(-50, 50);
    }

    uint32_t t0 = micros();
    int status = shannon_run_inference(audio_input_tensor, output_logits);
    uint32_t dt = micros() - t0;

    if (status == 0) {
        Serial.printf("[nRF52 INFERENCE] Completed in %u us | Status: OK\n", dt);
        digitalWrite(LED_BUILTIN, LOW); // Flash LED
        delay(50);
        digitalWrite(LED_BUILTIN, HIGH);
    }

    delay(1000);
}
