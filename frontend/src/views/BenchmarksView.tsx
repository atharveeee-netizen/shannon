import React, { useState } from 'react';
import { BarChart2, Download, Copy, Check } from 'lucide-react';

export const BenchmarksView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const benchmarks = [
    {
      model: 'Audio Keyword Spotter',
      precision: 'INT8',
      flash: '24.0 KB',
      sram: '1.12 KB',
      macs: '46,368',
      latency: '1.1 ms',
      throughput: '909 FPS',
      parity: 'PASS (0.0031)',
      target: 'STM32H7 (480MHz)',
    },
    {
      model: 'Audio Keyword Spotter',
      precision: 'INT8',
      flash: '24.0 KB',
      sram: '1.12 KB',
      macs: '46,368',
      latency: '2.1 ms',
      throughput: '476 FPS',
      parity: 'PASS (0.0031)',
      target: 'ESP32-S3 (240MHz)',
    },
    {
      model: 'MicroVision Person',
      precision: 'INT8',
      flash: '18.1 KB',
      sram: '18.0 KB',
      macs: '239,680',
      latency: '2.0 ms',
      throughput: '500 FPS',
      parity: 'PASS (0.0028)',
      target: 'STM32H7 (480MHz)',
    },
    {
      model: 'MicroVision Person',
      precision: 'INT8',
      flash: '18.1 KB',
      sram: '18.0 KB',
      macs: '239,680',
      latency: '4.8 ms',
      throughput: '208 FPS',
      parity: 'PASS (0.0028)',
      target: 'ESP32-S3 (240MHz)',
    },
    {
      model: 'Motor Vibration Autoencoder',
      precision: 'INT8',
      flash: '19.5 KB',
      sram: '0.19 KB',
      macs: '18,432',
      latency: '0.4 ms',
      throughput: '2,500 FPS',
      parity: 'PASS (0.0009)',
      target: 'RP2040 Pico (133MHz)',
    },
    {
      model: 'Motor Vibration Autoencoder',
      precision: 'INT8',
      flash: '19.5 KB',
      sram: '0.19 KB',
      macs: '18,432',
      latency: '0.15 ms',
      throughput: '6,666 FPS',
      parity: 'PASS (0.0009)',
      target: 'STM32H7 (480MHz)',
    },
  ];

  const handleCopy = () => {
    const csv = [
      'Model,Precision,Flash,SRAM,MACs,Latency,Throughput,Parity,Target',
      ...benchmarks.map((b) =>
        `"${b.model}","${b.precision}","${b.flash}","${b.sram}","${b.macs}","${b.latency}","${b.throughput}","${b.parity}","${b.target}"`
      ),
    ].join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csv = [
      'Model,Precision,Flash,SRAM,MACs,Latency,Throughput,Parity,Target',
      ...benchmarks.map((b) =>
        `"${b.model}","${b.precision}","${b.flash}","${b.sram}","${b.macs}","${b.latency}","${b.throughput}","${b.parity}","${b.target}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shannon_benchmarks_telemetry.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Engineering Benchmarks Matrix
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            Measured execution cycles, memory footprints, and numerical parity scores across target microcontroller silicon.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-surface-raised hover:bg-surface-hover border border-border rounded text-xs text-text-secondary hover:text-text-primary transition flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy CSV'}</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold transition flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded p-4 space-y-3 font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted text-[11px]">
                <th className="py-2 px-2 font-medium">Model</th>
                <th className="py-2 px-2 font-medium">Precision</th>
                <th className="py-2 px-2 font-medium">Flash (ROM)</th>
                <th className="py-2 px-2 font-medium">Peak SRAM</th>
                <th className="py-2 px-2 font-medium">MACs</th>
                <th className="py-2 px-2 font-medium">Latency</th>
                <th className="py-2 px-2 font-medium">Throughput</th>
                <th className="py-2 px-2 font-medium">Parity</th>
                <th className="py-2 px-2 font-medium">Target Hardware</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {benchmarks.map((b, idx) => (
                <tr key={idx} className="hover:bg-surface-hover transition">
                  <td className="py-2.5 px-2 text-text-primary font-bold">{b.model}</td>
                  <td className="py-2.5 px-2 text-primary font-semibold">{b.precision}</td>
                  <td className="py-2.5 px-2 text-text-secondary">{b.flash}</td>
                  <td className="py-2.5 px-2 text-primary font-semibold">{b.sram}</td>
                  <td className="py-2.5 px-2 text-text-secondary">{b.macs}</td>
                  <td className="py-2.5 px-2 text-text-primary font-semibold">{b.latency}</td>
                  <td className="py-2.5 px-2 text-text-secondary">{b.throughput}</td>
                  <td className="py-2.5 px-2 text-success font-semibold">{b.parity}</td>
                  <td className="py-2.5 px-2 text-text-primary font-medium">{b.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
