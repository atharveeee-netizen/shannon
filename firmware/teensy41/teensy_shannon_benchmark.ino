/* ===========================================================================
 * SHANNON AI — TEENSY 4.1 ULTRA-HIGH-SPEED BENCHMARK RUNNER
 * 
 * Hardware:
 *   - Teensy 4.0 / 4.1 (NXP i.MX RT1062 ARM Cortex-M7 @ 600 MHz)
 *   - Hardware DWT (Data Watchpoint and Trace) CPU cycle accurate timer
 * =========================================================================== */

#include <Arduino.h>
#include "shannon_vision_model.h"

#define INPUT_SIZE (48 * 48)
static int8_t image_input[INPUT_SIZE];
static int8_t vision_logits[2];

void setup() {
    Serial.begin(115200);
    while (!Serial && millis() < 2000);

    // Enable ARM Cortex-M7 DWT Cycle Counter
    ARM_DEMCR |= ARM_DEMCR_TRCENA;
    ARM_DWT_CTRL |= ARM_DWT_CTRL_CYCCNT;

    Serial.println("==========================================================");
    Serial.println("★ SHANNON AI — TEENSY 4.1 600MHz CORTEX-M7 BENCHMARK");
    Serial.println("==========================================================");
    Serial.printf("[*] Model:               MicroVision Person Detector\n");
    Serial.printf("[*] SRAM Tensor Arena:   %d Bytes (0 Malloc)\n", SHANNON_ARENA_SIZE);
    Serial.printf("[*] Model Flash ROM:     %d Bytes\n", SHANNON_FLASH_BYTES);
    Serial.printf("[*] Total MAC Operations:%d\n", SHANNON_TOTAL_MACS);
    Serial.println("----------------------------------------------------------");
}

void loop() {
    // Fill test image buffer
    for (int i = 0; i < INPUT_SIZE; i++) {
        image_input[i] = (int8_t)((i % 127) - 64);
    }

    uint32_t start_cycles = ARM_DWT_CYCCNT;
    uint32_t start_us = micros();
    
    int ret = shannon_run_inference(image_input, vision_logits);
    
    uint32_t end_cycles = ARM_DWT_CYCCNT;
    uint32_t elapsed_us = micros() - start_us;
    uint32_t total_cycles = end_cycles - start_cycles;

    if (ret == 0) {
        Serial.printf("[TEENSY INFERENCE] Latency: %u us | Total CPU Cycles: %u | FPS: %u\n",
                      elapsed_us, total_cycles, 1000000 / (elapsed_us + 1));
    }

    delay(1000);
}
