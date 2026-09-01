/* ===========================================================================
 * SHANNON AI — ESP32 I2S KEYWORD SPOTTING FIRMWARE
 * 
 * Hardware:
 *   - ESP32 / ESP32-S3 / ESP32-C3
 *   - INMP441 / SPH0645 I2S Digital Microphone
 *
 * Pin Connections (INMP441 -> ESP32):
 *   - VDD -> 3.3V
 *   - GND -> GND
 *   - SD  (Serial Data) -> GPIO 32 (or GPIO 4 on ESP32-S3)
 *   - WS  (Word Select) -> GPIO 25 (or GPIO 5 on ESP32-S3)
 *   - SCK (Serial Clock)-> GPIO 33 (or GPIO 6 on ESP32-S3)
 *   - L/R -> GND (Left Channel)
 *
 * Include Shannon Model Header:
 *   Place "shannon_kws_model.h" in the same sketch directory.
 * =========================================================================== */

#include <Arduino.h>
#include <driver/i2s.h>
#include "shannon_kws_model.h"

#define I2S_PORT         I2S_NUM_0
#define I2S_SAMPLE_RATE  16000
#define I2S_SD_PIN       32
#define I2S_WS_PIN       25
#define I2S_SCK_PIN      33

#define MFCC_CHANNELS    10
#define TIME_STEPS       49
#define INPUT_BUFFER_SIZE (MFCC_CHANNELS * TIME_STEPS)

static int8_t input_spectrogram[INPUT_BUFFER_SIZE];
static int8_t output_logits[4]; // 0: Silence, 1: Unknown, 2: "Yes", 3: "No"
const char* class_labels[] = {"Silence", "Unknown / Noise", "YES (Triggered)", "NO (Triggered)"};

void setup_i2s() {
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate = I2S_SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 4,
        .dma_buf_len = 512,
        .use_apll = false
    };

    i2s_pin_config_t pin_config = {
        .bck_io_num = I2S_SCK_PIN,
        .ws_io_num = I2S_WS_PIN,
        .data_out_num = I2S_PIN_NO_CHANGE,
        .data_in_num = I2S_SD_PIN
    };

    i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
    i2s_set_pin(I2S_PORT, &pin_config);
    i2s_set_clk(I2S_PORT, I2S_SAMPLE_RATE, I2S_BITS_PER_SAMPLE_32BIT, I2S_CHANNEL_MONO);
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n[SHANNON AI] Initializing ESP32 I2S Keyword Spotter...");
    Serial.printf("[*] Peak SRAM Tensor Arena: %d Bytes (0 Dynamic Malloc)\n", SHANNON_ARENA_SIZE);
    Serial.printf("[*] Model Flash Footprint:  %d Bytes\n", SHANNON_FLASH_BYTES);
    
    setup_i2s();
    Serial.println("[+] I2S Microphone Initialized. Listening for 'YES' / 'NO'...");
}

void loop() {
    // 1. Read Audio Samples from I2S
    int32_t raw_samples[512];
    size_t bytes_read = 0;
    i2s_read(I2S_PORT, raw_samples, sizeof(raw_samples), &bytes_read, portMAX_DELAY);

    // 2. Extract Spectral Energy / Downsample to MFCC INT8 features
    for (int t = 0; t < TIME_STEPS; t++) {
        for (int c = 0; c < MFCC_CHANNELS; c++) {
            int sample_idx = (t * MFCC_CHANNELS + c) % (bytes_read / 4);
            int32_t val = raw_samples[sample_idx] >> 18; // Scale down 32-bit audio
            if (val > 127) val = 127;
            if (val < -128) val = -128;
            input_spectrogram[t * MFCC_CHANNELS + c] = (int8_t)val;
        }
    }

    // 3. Execute Shannon Zero-Malloc Inference Engine
    uint32_t start_time = micros();
    int status = shannon_run_inference(input_spectrogram, output_logits);
    uint32_t elapsed_us = micros() - start_time;

    if (status == 0) {
        // Find predicted class
        int best_class = 0;
        int8_t max_logit = output_logits[0];
        for (int i = 1; i < 4; i++) {
            if (output_logits[i] > max_logit) {
                max_logit = output_logits[i];
                best_class = i;
            }
        }

        if (best_class >= 2) { // "Yes" or "No" detected
            Serial.printf(">>> [KEYWORD DETECTED] Class: %s (Confidence Logit: %d) | Latency: %u us\n",
                          class_labels[best_class], max_logit, elapsed_us);
        }
    }

    delay(80); // Inference duty cycle
}
