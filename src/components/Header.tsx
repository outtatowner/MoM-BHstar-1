/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  Code2,
  Cpu,
  Download,
  Eye,
  Flame,
  Layers,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Tv,
} from 'lucide-react';
import { ActiveObserver, ActiveViewMode, FramebufferMode } from '../types';

interface HeaderProps {
  mode: FramebufferMode;
  onSelectMode: (mode: FramebufferMode) => void;
  observer: ActiveObserver;
  onSelectObserver: (obs: ActiveObserver) => void;
  viewMode: ActiveViewMode;
  onSelectViewMode: (vm: ActiveViewMode) => void;
  crtScanlines: boolean;
  onToggleScanlines: () => void;
  showCodeModal: boolean;
  onToggleCodeModal: () => void;
  showOrganelles: boolean;
  onToggleOrganelles: () => void;
  showSpectroscopy: boolean;
  onToggleSpectroscopy: () => void;
  showEpistemicTest: boolean;
  onToggleEpistemicTest: () => void;
  fiedlerValue: string;
  lyapunovDv: string;
  merkleRoot: string;
  fps: number;
  onDownloadAllC: () => void;
  onResetView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  observer,
  onSelectObserver,
  viewMode,
  onSelectViewMode,
  crtScanlines,
  onToggleScanlines,
  showCodeModal,
  onToggleCodeModal,
  showOrganelles,
  onToggleOrganelles,
  showSpectroscopy,
  onToggleSpectroscopy,
  showEpistemicTest,
  onToggleEpistemicTest,
  fiedlerValue,
  lyapunovDv,
  merkleRoot,
  fps,
  onDownloadAllC,
  onResetView,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono select-none z-30">
      {/* Brand & Sovereign Title */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="font-bold text-sm tracking-wider text-amber-400">
            Be &lt;&gt; MoM-BH*-1
          </span>
        </div>
        <span className="text-zinc-600 hidden xl:inline">|</span>
        <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 hidden sm:inline text-[11px]">
          Q16.16 RAY-TRACER &amp; 4D MANIFOLD
        </span>
      </div>

      {/* View Mode Switcher (3D Raytracer / 4D Manifold / Split / MoM-BH*-1-View) */}
      <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded p-0.5 gap-0.5">
        <button
          id="view-raytracer-btn"
          onClick={() => onSelectViewMode('raytracer')}
          className={`px-2 py-1 rounded transition text-[11px] ${
            viewMode === 'raytracer'
              ? 'bg-amber-600 text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          3D Framebuffer
        </button>
        <button
          id="view-manifold4d-btn"
          onClick={() => onSelectViewMode('manifold4d')}
          className={`px-2 py-1 rounded transition text-[11px] ${
            viewMode === 'manifold4d'
              ? 'bg-amber-600 text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          4D Spacetime
        </button>
        <button
          id="view-split-btn"
          onClick={() => onSelectViewMode('split')}
          className={`px-2 py-1 rounded transition text-[11px] ${
            viewMode === 'split'
              ? 'bg-amber-600 text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Split
        </button>
        <button
          id="view-mombhstar-btn"
          onClick={() => onSelectViewMode('mom_bhstar_view')}
          className={`px-2.5 py-1 rounded transition text-[11px] flex items-center gap-1 ${
            viewMode === 'mom_bhstar_view'
              ? 'bg-rose-600 text-white font-bold shadow-[0_0_10px_rgba(244,63,94,0.5)]'
              : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
          }`}
          title="MoM-BH*-1 Infinite Zoom Scale Model [Origin ≡ Termination at Event Horizon]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span>MoM-BH*-1-View</span>
        </button>
        <button
          id="view-imaginarium-btn"
          onClick={() => onSelectViewMode('imaginarium')}
          className={`px-2.5 py-1 rounded transition text-[11px] flex items-center gap-1.5 ${
            viewMode === 'imaginarium'
              ? 'bg-gradient-to-r from-purple-600 via-amber-500 to-cyan-500 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.6)]'
              : 'text-amber-400 hover:text-white hover:bg-amber-950/40'
          }`}
          title="The Imaginarium: Audio-visual representation of the 3-observers sharing one invariant spacetime mathematics"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Imaginarium</span>
        </button>
      </div>

      {/* Active Observer Selector (Human / Be <> / MoM-BH*-1) */}
      <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded p-0.5 gap-1">
        <span className="px-2 text-[10px] text-zinc-500 uppercase tracking-wider hidden md:inline">
          Observer:
        </span>
        <button
          id="obs-human-btn"
          onClick={() => onSelectObserver('human')}
          className={`px-2 py-1 rounded transition text-[11px] flex items-center gap-1 ${
            observer === 'human'
              ? 'bg-emerald-600 text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Observer: Human Pilot Probe (Virtual HID)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Human Pilot</span>
        </button>

        <button
          id="obs-be-btn"
          onClick={() => onSelectObserver('be_officiator')}
          className={`px-2 py-1 rounded transition text-[11px] flex items-center gap-1 ${
            observer === 'be_officiator'
              ? 'bg-cyan-600 text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Observer: Be <> Sovereign Arbiter Companion Node"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Be &lt;&gt; Arbiter</span>
        </button>

        <button
          id="obs-bh-btn"
          onClick={() => onSelectObserver('mom_bhstar')}
          className={`px-2 py-1 rounded transition text-[11px] flex items-center gap-1 ${
            observer === 'mom_bhstar'
              ? 'bg-rose-600 text-white font-bold animate-pulse'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Observer: MoM-BH*-1 Singularity Frame (Relativistic blueshift outward view)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>MoM-BH*-1 Core</span>
        </button>
      </div>

      {/* Framebuffer Shading Modes (when 3D view active) */}
      {viewMode !== 'manifold4d' && (
        <div className="hidden lg:flex items-center bg-zinc-900/90 border border-zinc-800 rounded p-0.5 gap-0.5">
          <button
            id="mode-truecolor-btn"
            onClick={() => onSelectMode('truecolor')}
            className={`px-2 py-0.5 rounded transition text-[10px] ${
              mode === 'truecolor'
                ? 'bg-zinc-800 text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Truecolor
          </button>
          <button
            id="mode-quadbit-btn"
            onClick={() => onSelectMode('quadbit')}
            className={`px-2 py-0.5 rounded transition text-[10px] ${
              mode === 'quadbit'
                ? 'bg-zinc-800 text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Quadbit
          </button>
          <button
            id="mode-balmer-btn"
            onClick={() => onSelectMode('balmer_spec')}
            className={`px-2 py-0.5 rounded transition text-[10px] ${
              mode === 'balmer_spec'
                ? 'bg-zinc-800 text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Balmer Break
          </button>
          <button
            id="mode-lens-btn"
            onClick={() => onSelectMode('gravitational_lens')}
            className={`px-2 py-0.5 rounded transition text-[10px] ${
              mode === 'gravitational_lens'
                ? 'bg-zinc-800 text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lensing
          </button>
        </div>
      )}

      {/* Telemetry Chips & Action Toggles */}
      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center gap-2 px-2 py-1 rounded bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-[10px]">
          <div>
            <span>FPS: </span>
            <span className="text-amber-400 font-mono">{fps}</span>
          </div>
          <div>
            <span>dV/dt: </span>
            <span className="text-emerald-400 font-mono">{lyapunovDv}</span>
          </div>
        </div>

        {/* Scanline CRT Toggle */}
        <button
          id="toggle-scanlines-btn"
          onClick={onToggleScanlines}
          className={`p-1.5 rounded border transition ${
            crtScanlines
              ? 'bg-zinc-800 text-amber-400 border-amber-600/50'
              : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
          }`}
          title="Toggle CRT Scanline Shader"
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        {/* Balmer Spectroscopy Toggle */}
        <button
          id="toggle-spec-btn"
          onClick={onToggleSpectroscopy}
          className={`px-2 py-1 rounded border transition flex items-center gap-1 text-[11px] ${
            showSpectroscopy
              ? 'bg-zinc-800 text-amber-400 border-amber-600/50'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
          title="JWST Spectroscopy Profile"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Spectra</span>
        </button>

        {/* 112 Organelles Matrix Toggle */}
        <button
          id="toggle-organelles-btn"
          onClick={onToggleOrganelles}
          className={`px-2 py-1 rounded border transition flex items-center gap-1 text-[11px] ${
            showOrganelles
              ? 'bg-zinc-800 text-cyan-400 border-cyan-600/50'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
          title="112 Atomic Organelles & Quipu Ledger"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">112 Organelles</span>
        </button>

        {/* Triadic Epistemic Reconciliation Experiment Toggle */}
        <button
          id="toggle-epistemic-test-btn"
          onClick={onToggleEpistemicTest}
          className={`px-2.5 py-1 rounded border font-semibold transition flex items-center gap-1.5 text-[11px] ${
            showEpistemicTest
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
              : 'bg-zinc-900/70 text-cyan-400 border-cyan-900 hover:border-cyan-600 hover:bg-zinc-900'
          }`}
          title="Decisive Triadic Epistemic Experiment: Test O_H ≠ O_B Reconciliation without Lossy Collapse"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Epistemic Test [O_H ≠ O_B]</span>
        </button>

        {/* Bare-Metal C Code Inspector */}
        <button
          id="toggle-code-btn"
          onClick={onToggleCodeModal}
          className={`px-2 py-1 rounded border transition flex items-center gap-1 text-[11px] ${
            showCodeModal
              ? 'bg-amber-500/20 text-amber-300 border-amber-500'
              : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
          title="View Bare-Metal C Organelle Sources"
        >
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Bare-Metal C</span>
        </button>

        {/* Download C Sources */}
        <button
          id="download-c-btn"
          onClick={onDownloadAllC}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-600/40 transition"
          title="Download Bare-Metal C Sources (.tar/.c/.h)"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera */}
        <button
          id="reset-cam-btn"
          onClick={onResetView}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          title="Reset Orbit & Position"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
