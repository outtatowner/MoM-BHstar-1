/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { calculateBalmerTransmission, DEFAULT_MOM_BHSTAR } from '../engine/mom_bhstar';
import { q16ToFloat } from '../engine/q16math';

interface SpectroscopyPanelProps {
  wavelengthNm: number;
  onChangeWavelength: (nm: number) => void;
  onClose: () => void;
}

export const SpectroscopyPanel: React.FC<SpectroscopyPanelProps> = ({
  wavelengthNm,
  onChangeWavelength,
  onClose,
}) => {
  const currentTransmission = calculateBalmerTransmission(wavelengthNm);
  const transFloat = q16ToFloat(currentTransmission.transmissionQ16);

  // Generate SVG spectrum curve (250 nm to 750 nm)
  const samples: { wl: number; flux: number }[] = [];
  for (let wl = 250; wl <= 750; wl += 5) {
    const t = calculateBalmerTransmission(wl);
    const fl = q16ToFloat(t.transmissionQ16);
    samples.push({ wl, flux: fl });
  }

  // Convert samples to SVG path
  const svgWidth = 400;
  const svgHeight = 120;
  const minWl = 250;
  const maxWl = 750;

  const points = samples.map((s) => {
    const x = ((s.wl - minWl) / (maxWl - minWl)) * svgWidth;
    const y = svgHeight - s.flux * (svgHeight - 20) - 10;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  // Position of current marker
  const markerX = ((wavelengthNm - minWl) / (maxWl - minWl)) * svgWidth;
  const markerY = svgHeight - transFloat * (svgHeight - 20) - 10;

  // Balmer limit line X
  const balmerX = ((DEFAULT_MOM_BHSTAR.balmerBreakNm - minWl) / (maxWl - minWl)) * svgWidth;

  return (
    <div className="absolute top-14 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-zinc-950/95 border border-amber-500/40 rounded-lg shadow-2xl backdrop-blur p-4 font-mono text-xs text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-400">JWST SPECTROSCOPY</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Discovery Summary */}
      <div className="mt-3 p-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MoM-BH*-1 &quot;Black Hole Star&quot; Discovery</span>
        </div>
        <p className="text-zinc-400">
          Detected by JWST at ~660 Myr post-Big Bang. Instead of standard fusion, a{' '}
          <strong className="text-amber-200">100,000 M☉ central black hole</strong> heats a
          solar-system-sized shroud of dense hydrogen, producing{' '}
          <strong className="text-yellow-300">100 Billion L☉</strong> luminosity.
        </p>
      </div>

      {/* Spectrum Graph */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
          <span>Rest-Frame Flux Spectrum F(λ)</span>
          <span className="text-amber-400">Balmer Jump @ 364.6 nm</span>
        </div>

        <div className="relative bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-28 overflow-visible"
          >
            {/* Grid lines */}
            <line
              x1="0"
              y1={svgHeight - 10}
              x2={svgWidth}
              y2={svgHeight - 10}
              stroke="#27272a"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={svgHeight / 2}
              x2={svgWidth}
              y2={svgHeight / 2}
              stroke="#27272a"
              strokeDasharray="4,4"
              strokeWidth="1"
            />

            {/* Extinction zone background (wavelength < 364.6 nm) */}
            <rect
              x="0"
              y="0"
              width={balmerX}
              height={svgHeight}
              fill="rgba(244, 63, 94, 0.08)"
            />

            {/* Balmer Limit Vertical Marker */}
            <line
              x1={balmerX}
              y1="0"
              x2={balmerX}
              y2={svgHeight}
              stroke="#f59e0b"
              strokeDasharray="3,3"
              strokeWidth="1.5"
            />

            {/* Spectrum Curve */}
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />

            {/* Current Selected Wavelength Marker */}
            <line
              x1={markerX}
              y1="0"
              x2={markerX}
              y2={svgHeight}
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <circle
              cx={markerX}
              cy={markerY}
              r="4"
              fill="#10b981"
              stroke="#000"
              strokeWidth="1.5"
            />
          </svg>

          {/* Graph annotations */}
          <div className="flex justify-between px-2 py-1 text-[9px] text-zinc-500 border-t border-zinc-800/80">
            <span>250 nm (UV)</span>
            <span className="text-amber-500 font-bold">364.6 nm (Break)</span>
            <span>656.3 nm (Hα)</span>
            <span>750 nm (NIR)</span>
          </div>
        </div>
      </div>

      {/* Wavelength Slider */}
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400">Ray Sensor Wavelength (λ):</span>
          <span className="font-bold text-emerald-400 text-sm font-mono">
            {wavelengthNm.toFixed(1)} nm
          </span>
        </div>

        <input
          type="range"
          min="250"
          max="750"
          step="0.5"
          value={wavelengthNm}
          onChange={(e) => onChangeWavelength(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        {/* Status result */}
        <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between text-[11px]">
          <div>
            <span className="text-zinc-500">Optical Transmission: </span>
            <span
              className={`font-bold ${
                currentTransmission.isExtinct ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {(transFloat * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Cocoon Optical Depth: </span>
            <span className="text-amber-300 font-mono">
              τ ≈ {q16ToFloat(currentTransmission.opticalDepthQ16).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="mt-3 flex gap-1.5">
        <button
          onClick={() => onChangeWavelength(280.0)}
          className="flex-1 py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] text-rose-400 border border-zinc-800"
        >
          280 nm (Extinct UV)
        </button>
        <button
          onClick={() => onChangeWavelength(364.6)}
          className="flex-1 py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] text-amber-400 border border-amber-600/30"
        >
          364.6 nm (Break)
        </button>
        <button
          onClick={() => onChangeWavelength(656.3)}
          className="flex-1 py-1 px-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] text-emerald-400 border border-zinc-800"
        >
          656 nm (H-Alpha)
        </button>
      </div>
    </div>
  );
};
