/* ===========================================================================
 * SHANNON AI — RASPBERRY PI PICO (RP2040) C-SDK FIRMWARE
 * 
 * Hardware:
 *   - Raspberry Pi Pico / Pico W / Pico 2 (RP2040 / RP2350)
 *   - Dual ARM Cortex-M0+ @ 133 MHz / Cortex-M33 @ 150 MHz
 *
 * Build with Pico SDK:
 *   mkdir build && cd build && cmake .. && make
 * =========================================================================== */

#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/timer.h"
#include "shannon_kws_model.h"

static int8_t input_features[49 * 10];
static int8_t output_logits[4];

int main() {
    stdio_init_all();
    sleep_ms(2000);

    printf("\n=======================================================\n");
    printf("[SHANNON AI] Raspberry Pi Pico (RP2040) TinyML Runner\n");
    printf("=======================================================\n");
    printf("[*] SRAM Tensor Arena:   %d Bytes\n", SHANNON_ARENA_SIZE);
    printf("[*] Model Flash (ROM):   %d Bytes\n", SHANNON_FLASH_BYTES);
    printf("[*] Total MAC Ops:       %d\n", SHANNON_TOTAL_MACS);
    printf("[+] Initializing Shannon Zero-Malloc Execution Core...\n");

    while (1) {
        // Mock / ADC sensor sampling
        for (int i = 0; i < 49 * 10; i++) {
            input_features[i] = (int8_t)((i * 7) % 127);
        }

        uint64_t t_start = time_us_64();
        int res = shannon_run_inference(input_features, output_logits);
        uint64_t t_duration = time_us_64() - t_start;

        if (res == 0) {
            printf("[PICO INFERENCE] Status: OK | Top Logit: %d | Latency: %llu us\n",
                   output_logits[2], t_duration);
        }

        sleep_ms(1000);
    }

    return 0;
}
