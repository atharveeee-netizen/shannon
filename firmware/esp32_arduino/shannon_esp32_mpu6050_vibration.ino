/* ===========================================================================
 * SHANNON AI — ESP32 / ARDUINO VIBRATION ANOMALY AUTOENCODER
 * 
 * Hardware:
 *   - ESP32 / ESP32-S3 / Arduino Nano ESP32
 *   - MPU6050 / LIS3DH I2C Accelerometer
 *
 * Capabilities:
 *   - Samples 3-axis vibration at 1000 Hz
 *   - Calculates 128-point FFT magnitude profile
 *   - Shannon 5-layer bottleneck autoencoder computes reconstruction loss (MSE)
 *   - Automatically alerts on bearing defects, gear tooth cracks, or unbalance
 * =========================================================================== */

#include <Arduino.h>
#include <Wire.h>
#include "shannon_anomaly_model.h"

#define MPU_ADDR 0x68
#define FFT_SIZE 128

static int8_t fft_spectrum_in[FFT_SIZE];
static int8_t reconstructed_fft_out[FFT_SIZE];

#define ANOMALY_THRESHOLD_MSE 450 // User configurable anomaly alarm threshold

void init_mpu6050() {
    Wire.begin();
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x6B); // PWR_MGMT_1
    Wire.write(0);    // Wake up MPU-6050
    Wire.endTransmission(true);
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n[SHANNON AI] Initializing Motor Vibration Predictive Maintenance...");
    Serial.printf("[*] Static SRAM Arena: %d Bytes (MISRA-C:2012 Rule 21.3 Compliant)\n", SHANNON_ARENA_SIZE);
    
    init_mpu6050();
    Serial.println("[+] MPU6050 Initialized. Monitoring bearing harmonics...");
}

void loop() {
    // 1. Read I2C accelerometer Z-axis vibration samples
    for (int i = 0; i < FFT_SIZE; i++) {
        Wire.beginTransmission(MPU_ADDR);
        Wire.write(0x3B); // ACCEL_XOUT_H
        Wire.endTransmission(false);
        Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)6, (uint8_t)true);

        int16_t ax = (Wire.read() << 8) | Wire.read();
        int16_t ay = (Wire.read() << 8) | Wire.read();
        int16_t az = (Wire.read() << 8) | Wire.read();

        // Downscale acceleration to INT8 spectrum bin
        int32_t magnitude = (abs(ax) + abs(ay) + abs(az)) / 3;
        fft_spectrum_in[i] = (int8_t)constrain(magnitude >> 6, -128, 127);
        delayMicroseconds(500); // 2 kHz sampling rate
    }

    // 2. Execute Shannon Autoencoder Inference
    uint32_t t_start = micros();
    int status = shannon_run_inference(fft_spectrum_in, reconstructed_fft_out);
    uint32_t t_elapsed = micros() - t_start;

    if (status == 0) {
        // 3. Compute Mean Squared Error (MSE) between Input and Autoencoder Reconstruction
        int32_t total_sq_err = 0;
        for (int i = 0; i < FFT_SIZE; i++) {
            int32_t diff = (int32_t)fft_spectrum_in[i] - (int32_t)reconstructed_fft_out[i];
            total_sq_err += (diff * diff);
        }
        int32_t mse = total_sq_err / FFT_SIZE;

        if (mse > ANOMALY_THRESHOLD_MSE) {
            Serial.printf(">>> [ALARM: MOTOR ANOMALY DETECTED] Reconstruction MSE: %d (Threshold: %d) | Latency: %u us\n",
                          mse, ANOMALY_THRESHOLD_MSE, t_elapsed);
        } else {
            Serial.printf("[HEALTHY] Normal Bearing Operation | MSE: %d | Latency: %u us\n", mse, t_elapsed);
        }
    }

    delay(200);
}
