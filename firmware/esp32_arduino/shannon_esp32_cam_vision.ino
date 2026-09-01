/* ===========================================================================
 * SHANNON AI — ESP32-CAM PERSON DETECTION FIRMWARE
 * 
 * Hardware:
 *   - ESP32-CAM (AI-Thinker, Xiao ESP32S3 Sense, Freenove ESP32-WROVER)
 *   - OV2640 / OV3660 Camera Sensor
 *
 * Capabilities:
 *   - Real-time 48x48 Grayscale crop & downsample from camera frame buffer
 *   - Zero-malloc MobileNet-Tiny inference using "shannon_vision_model.h"
 *   - Flash LED trigger on Person presence detected
 * =========================================================================== */

#include <Arduino.h>
#include "esp_camera.h"
#include "shannon_vision_model.h"

// AI-Thinker ESP32-CAM Pin Configuration
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4

#define INPUT_DIM         48
static int8_t camera_tensor_in[INPUT_DIM * INPUT_DIM];
static int8_t vision_logits[2]; // 0: No Person, 1: Person Present

void init_camera() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_GRAYSCALE;
    config.frame_size = FRAMESIZE_96X96;
    config.jpeg_quality = 12;
    config.fb_count = 1;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("[!] Camera init failed with error 0x%x\n", err);
        while (1) delay(1000);
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(FLASH_LED_PIN, OUTPUT);
    digitalWrite(FLASH_LED_PIN, LOW);
    
    delay(1000);
    Serial.println("\n[SHANNON AI] Starting ESP32-CAM MicroVision Person Detector...");
    Serial.printf("[*] SRAM Tensor Arena: %d Bytes (0 Dynamic Malloc)\n", SHANNON_ARENA_SIZE);
    
    init_camera();
    Serial.println("[+] Camera Sensor Initialized (48x48 Grayscale Mode).");
}

void loop() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("[!] Camera frame capture failed");
        delay(100);
        return;
    }

    // Downsample 96x96 grayscale frame buffer to 48x48 model tensor
    for (int r = 0; r < INPUT_DIM; r++) {
        for (int c = 0; c < INPUT_DIM; c++) {
            // Sample every 2nd pixel
            uint8_t raw_pixel = fb->buf[(r * 2) * 96 + (c * 2)];
            // Normalize uint8 (0..255) to INT8 (-128..127)
            camera_tensor_in[r * INPUT_DIM + c] = (int8_t)((int)raw_pixel - 128);
        }
    }
    esp_camera_fb_return(fb);

    // Run Shannon Zero-Malloc Model Inference
    uint32_t t_start = micros();
    int status = shannon_run_inference(camera_tensor_in, vision_logits);
    uint32_t t_latency = micros() - t_start;

    if (status == 0) {
        int8_t no_person_logit = vision_logits[0];
        int8_t person_logit    = vision_logits[1];

        if (person_logit > no_person_logit && person_logit > 20) {
            digitalWrite(FLASH_LED_PIN, HIGH);
            Serial.printf(">>> [PERSON DETECTED] Score: %d | Latency: %u us (%u FPS)\n",
                          person_logit, t_latency, 1000000 / (t_latency + 1));
        } else {
            digitalWrite(FLASH_LED_PIN, LOW);
            Serial.printf("[IDLE] No Person | Score: %d | Latency: %u us\n", no_person_logit, t_latency);
        }
    }

    delay(100);
}
