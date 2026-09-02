import { ModelGraph, Tensor, Layer } from './ir';

/**
 * Audio Keyword Spotting (KWS) 1D-CNN Model (Google Speech Commands v2)
 * Input: Audio Spectrogram (49 time steps x 10 MFCC features = 490)
 * Output: 12 Classes ("yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go", "_silence", "_unknown")
 */
export function getKeywordSpottingModel(): ModelGraph {
  const g = new ModelGraph('Audio_KWS_1DCNN');

  // Layer 1: Conv1D (Kernel 3x1, 16 filters, in_ch 10)
  const l1 = new Layer('conv1d_input', 'Conv1D', ['input_audio'], ['conv1_out'], {
    kernel_size: 3,
    in_channels: 10,
    out_channels: 16,
    out_length: 49,
  });
  // Weight shape: (16, 10, 3) = 480 params
  const w1 = new Float32Array(480);
  for (let i = 0; i < 480; i++) {
    w1[i] = Math.sin(i * 0.1) * 0.15 + 0.02;
  }
  l1.weights = new Tensor('conv1_w', [16, 10, 3], 'float32', w1);
  l1.bias = new Tensor('conv1_b', [16], 'float32', new Float32Array(16));
  g.addLayer(l1);

  // Layer 2: ReLU + MaxPool1D (2x1)
  const l2 = new Layer('relu_pool1', 'MaxPool2D', ['conv1_out'], ['pool1_out'], {
    stride: 2,
    pool_size: 2,
    out_length: 24,
  });
  g.addLayer(l2);

  // Layer 3: DepthwiseConv1D (3x1, 24 filters)
  const l3 = new Layer('conv1d_dw', 'Conv1D', ['pool1_out'], ['dw_out'], {
    kernel_size: 3,
    in_channels: 16,
    out_channels: 24,
    out_length: 24,
  });
  const w3 = new Float32Array(1152);
  for (let i = 0; i < 1152; i++) {
    w3[i] = Math.cos(i * 0.08) * 0.12;
  }
  l3.weights = new Tensor('dw_w', [24, 16, 3], 'float32', w3);
  l3.bias = new Tensor('dw_b', [24], 'float32', new Float32Array(24));
  g.addLayer(l3);

  // Layer 4: Dense FC (288 -> 64)
  const l4 = new Layer('dense_fc1', 'Dense', ['dw_out'], ['fc1_out'], {
    in_features: 288,
    out_features: 64,
  });
  const w4 = new Float32Array(288 * 64);
  for (let i = 0; i < 288 * 64; i++) {
    w4[i] = (Math.sin(i * 0.05) * 0.08);
  }
  l4.weights = new Tensor('fc1_w', [288, 64], 'float32', w4);
  l4.bias = new Tensor('fc1_b', [64], 'float32', new Float32Array(64));
  g.addLayer(l4);

  // Layer 5: Classifier (64 -> 12)
  const l5 = new Layer('dense_classifier', 'Dense', ['fc1_out'], ['output_logits'], {
    in_features: 64,
    out_features: 12,
  });
  const w5 = new Float32Array(64 * 12);
  for (let i = 0; i < 64 * 12; i++) {
    w5[i] = (Math.cos(i * 0.1) * 0.1);
  }
  l5.weights = new Tensor('cls_w', [64, 12], 'float32', w5);
  l5.bias = new Tensor('cls_b', [12], 'float32', new Float32Array(12));
  g.addLayer(l5);

  g.addTensor(new Tensor('input_audio', [1, 49, 10], 'float32'));
  g.addTensor(new Tensor('conv1_out', [1, 49, 16], 'float32'));
  g.addTensor(new Tensor('pool1_out', [1, 24, 16], 'float32'));
  g.addTensor(new Tensor('dw_out', [1, 24, 24], 'float32'));
  g.addTensor(new Tensor('fc1_out', [1, 64], 'float32'));
  g.addTensor(new Tensor('output_logits', [1, 12], 'float32'));

  g.inputs = ['input_audio'];
  g.outputs = ['output_logits'];
  g.computeStats();
  return g;
}

/**
 * MicroVision Person Detector (MobileNet-Tiny 48x48)
 * Input: 48x48 Grayscale Image Frame (2,304 pixels)
 * Output: 2 Classes (Person / Background)
 */
export function getVisionClassifierModel(): ModelGraph {
  const g = new ModelGraph('MicroVision_PersonDetect');

  // Layer 1: Stem Conv2D (3x3, s2, 8 filters)
  const l1 = new Layer('conv2d_stem', 'Conv2D', ['camera_frame'], ['stem_out'], {
    kernel_h: 3,
    kernel_w: 3,
    in_channels: 1,
    out_channels: 8,
    out_height: 24,
    out_width: 24,
    stride: 2,
  });
  const w1 = new Float32Array(72);
  for (let i = 0; i < 72; i++) w1[i] = Math.sin(i * 0.2) * 0.2;
  l1.weights = new Tensor('stem_w', [8, 1, 3, 3], 'float32', w1);
  l1.bias = new Tensor('stem_b', [8], 'float32', new Float32Array(8));
  g.addLayer(l1);

  // Layer 2: Depthwise Conv2D (3x3, 8 filters)
  const l2 = new Layer('dwconv2d_block1', 'DepthwiseConv2D', ['stem_out'], ['dw1_out'], {
    kernel_h: 3,
    kernel_w: 3,
    in_channels: 8,
    out_channels: 8,
    out_height: 24,
    out_width: 24,
    stride: 1,
  });
  const w2 = new Float32Array(72);
  for (let i = 0; i < 72; i++) w2[i] = Math.cos(i * 0.15) * 0.18;
  l2.weights = new Tensor('dw1_w', [8, 1, 3, 3], 'float32', w2);
  l2.bias = new Tensor('dw1_b', [8], 'float32', new Float32Array(8));
  g.addLayer(l2);

  // Layer 3: Pointwise Conv2D (1x1, 16 filters)
  const l3 = new Layer('pwconv2d_block1', 'Conv2D', ['dw1_out'], ['pw1_out'], {
    kernel_h: 1,
    kernel_w: 1,
    in_channels: 8,
    out_channels: 16,
    out_height: 24,
    out_width: 24,
    stride: 1,
  });
  const w3 = new Float32Array(128);
  for (let i = 0; i < 128; i++) w3[i] = Math.sin(i * 0.1) * 0.15;
  l3.weights = new Tensor('pw1_w', [16, 8, 1, 1], 'float32', w3);
  l3.bias = new Tensor('pw1_b', [16], 'float32', new Float32Array(16));
  g.addLayer(l3);

  // Layer 4: Global Avg Pool
  const l4 = new Layer('global_avgpool', 'GlobalAvgPool2D', ['pw1_out'], ['pool_out'], {
    in_channels: 16,
    out_channels: 16,
  });
  g.addLayer(l4);

  // Layer 5: Classifier Dense (16 -> 2)
  const l5 = new Layer('classifier_fc', 'Dense', ['pool_out'], ['logits'], {
    in_features: 16,
    out_features: 2,
  });
  const w5 = new Float32Array(32);
  for (let i = 0; i < 32; i++) w5[i] = Math.cos(i * 0.25) * 0.2;
  l5.weights = new Tensor('cls_w', [16, 2], 'float32', w5);
  l5.bias = new Tensor('cls_b', [2], 'float32', new Float32Array(2));
  g.addLayer(l5);

  g.addTensor(new Tensor('camera_frame', [1, 48, 48, 1], 'float32'));
  g.addTensor(new Tensor('stem_out', [1, 24, 24, 8], 'float32'));
  g.addTensor(new Tensor('dw1_out', [1, 24, 24, 8], 'float32'));
  g.addTensor(new Tensor('pw1_out', [1, 24, 24, 16], 'float32'));
  g.addTensor(new Tensor('pool_out', [1, 16], 'float32'));
  g.addTensor(new Tensor('logits', [1, 2], 'float32'));

  g.inputs = ['camera_frame'];
  g.outputs = ['logits'];
  g.computeStats();
  return g;
}

/**
 * Vibration Anomaly Autoencoder (NASA Bearing IMS Physics Dataset)
 * Input: 128-FFT Vibration Accelerometer Spectrum
 * Output: 128 Reconstructed Features (Reconstruction MSE = Defect Metric)
 */
export function getAnomalyDetectionModel(): ModelGraph {
  const g = new ModelGraph('MotorVibration_Autoencoder');

  // Layer 1: Encoder FC1 (128 -> 64)
  const l1 = new Layer('encoder_fc1', 'Dense', ['imu_spectrum'], ['enc1'], {
    in_features: 128,
    out_features: 64,
  });
  const w1 = new Float32Array(128 * 64);
  for (let i = 0; i < 128 * 64; i++) w1[i] = Math.sin(i * 0.05) * 0.1;
  l1.weights = new Tensor('enc1_w', [128, 64], 'float32', w1);
  l1.bias = new Tensor('enc1_b', [64], 'float32', new Float32Array(64));
  g.addLayer(l1);

  // Layer 2: Bottleneck (64 -> 16)
  const l2 = new Layer('bottleneck_fc2', 'Dense', ['enc1'], ['bottleneck'], {
    in_features: 64,
    out_features: 16,
  });
  const w2 = new Float32Array(64 * 16);
  for (let i = 0; i < 64 * 16; i++) w2[i] = Math.cos(i * 0.1) * 0.1;
  l2.weights = new Tensor('bot_w', [64, 16], 'float32', w2);
  l2.bias = new Tensor('bot_b', [16], 'float32', new Float32Array(16));
  g.addLayer(l2);

  // Layer 3: Decoder FC3 (16 -> 64)
  const l3 = new Layer('decoder_fc3', 'Dense', ['bottleneck'], ['dec1'], {
    in_features: 16,
    out_features: 64,
  });
  const w3 = new Float32Array(16 * 64);
  for (let i = 0; i < 16 * 64; i++) w3[i] = Math.sin(i * 0.1) * 0.1;
  l3.weights = new Tensor('dec1_w', [16, 64], 'float32', w3);
  l3.bias = new Tensor('dec1_b', [64], 'float32', new Float32Array(64));
  g.addLayer(l3);

  // Layer 4: Reconstruction FC4 (64 -> 128)
  const l4 = new Layer('reconstruct_fc4', 'Dense', ['dec1'], ['reconstruction'], {
    in_features: 64,
    out_features: 128,
  });
  const w4 = new Float32Array(64 * 128);
  for (let i = 0; i < 64 * 128; i++) w4[i] = Math.cos(i * 0.05) * 0.1;
  l4.weights = new Tensor('rec_w', [64, 128], 'float32', w4);
  l4.bias = new Tensor('rec_b', [128], 'float32', new Float32Array(128));
  g.addLayer(l4);

  g.addTensor(new Tensor('imu_spectrum', [1, 128], 'float32'));
  g.addTensor(new Tensor('enc1', [1, 64], 'float32'));
  g.addTensor(new Tensor('bottleneck', [1, 16], 'float32'));
  g.addTensor(new Tensor('dec1', [1, 64], 'float32'));
  g.addTensor(new Tensor('reconstruction', [1, 128], 'float32'));

  g.inputs = ['imu_spectrum'];
  g.outputs = ['reconstruction'];
  g.computeStats();
  return g;
}

export function getPresetGraphById(presetId: string): ModelGraph {
  const pid = presetId.toLowerCase().trim();
  if (pid === 'kws' || pid === 'audio' || pid === 'keyword') {
    return getKeywordSpottingModel();
  } else if (pid === 'vision' || pid === 'person' || pid === 'camera') {
    return getVisionClassifierModel();
  } else if (pid === 'anomaly' || pid === 'vibration' || pid === 'motor') {
    return getAnomalyDetectionModel();
  }
  return getKeywordSpottingModel();
}
