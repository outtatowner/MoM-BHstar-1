/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : MoM-BHstar-1 Ray-Tracing Engine & Co-Play Manifold
 * Sovereign bare-metal Q16.16 Ray-Tracer, 112 Organelles Array, Quipu Ledger
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActiveObserver, ActiveViewMode, EngineConfig, FramebufferMode } from './types';
import { CovalentRayTracer } from './engine/raytracer';
import { QuipuLedgerEngine } from './engine/quipu_ledger';
import { BeOfficiatorEngine } from './engine/be_officiator';
import { floatToQ16, q16ToFloat } from './engine/q16math';
import { Header } from './components/Header';
import { FramebufferCanvas } from './components/FramebufferCanvas';
import { Manifold4DCanvas } from './components/Manifold4DCanvas';
import { MoMBHStarView } from './components/MoMBHStarView';
import { ImaginariumView } from './components/ImaginariumView';
import { SpectroscopyPanel } from './components/SpectroscopyPanel';
import { OrganelleMatrix } from './components/OrganelleMatrix';
import { BaremetalViewer } from './components/BaremetalViewer';
import { EpistemicReconciliationPanel } from './components/EpistemicReconciliationPanel';
import { FlightHud } from './components/FlightHud';
import { BARE_METAL_SOURCES } from './baremetal_c/sources';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engines
  const rayTracerRef = useRef<CovalentRayTracer | null>(null);
  const ledgerRef = useRef<QuipuLedgerEngine | null>(null);
  const officiatorRef = useRef<BeOfficiatorEngine | null>(null);

  // Engine configuration
  const [config, setConfig] = useState<EngineConfig>({
    resolutionWidth: 280,
    resolutionHeight: 160,
    maxBounces: 2,
    lyapunovBudgetMs: 25.0,
    quadbitPalette: 'phosphor_amber',
    crtScanlines: true,
    gravitationalLensingEnabled: true,
    balmerSpectroscopyEnabled: true,
  });

  // UI state
  const [mode, setMode] = useState<FramebufferMode>('truecolor');
  const [observer, setObserver] = useState<ActiveObserver>('human');
  const [viewMode, setViewMode] = useState<ActiveViewMode>('mom_bhstar_view');
  const [wavelengthNm, setWavelengthNm] = useState<number>(420.0);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showOrganelles, setShowOrganelles] = useState<boolean>(false);
  const [showSpectroscopy, setShowSpectroscopy] = useState<boolean>(false);
  const [showEpistemicTest, setShowEpistemicTest] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);

  // Live telemetry metrics
  const [fps, setFps] = useState<number>(60);
  const [renderTimeMs, setRenderTimeMs] = useState<number>(16.0);
  const [lyapunovScale, setLyapunovScale] = useState<number>(1.0);
  const [fiedlerValue, setFiedlerValue] = useState<string>('0.785');
  const [lyapunovDv, setLyapunovDv] = useState<string>('-0.005');
  const [merkleRoot, setMerkleRoot] = useState<string>('0xCOVALENT_GENESIS');
  const [coPlayState, setCoPlayState] = useState(() => new BeOfficiatorEngine().getState());
  const [telemetry4D, setTelemetry4D] = useState(() => new BeOfficiatorEngine().get4DTelemetry());
  const [recentBlocks, setRecentBlocks] = useState(() => new QuipuLedgerEngine().getRecentBlocks());
  const [organelles, setOrganelles] = useState(() => new QuipuLedgerEngine().getOrganelles());

  // Initialize engine instances
  useEffect(() => {
    rayTracerRef.current = new CovalentRayTracer();
    ledgerRef.current = new QuipuLedgerEngine();
    officiatorRef.current = new BeOfficiatorEngine();
  }, []);

  // Handle Human movement input
  const handleMoveInput = useCallback(
    (input: { forward: number; strafe: number; elevate: number; boost: boolean }) => {
      if (officiatorRef.current) {
        officiatorRef.current.handleHumanInput({
          forward: input.forward,
          strafe: input.strafe,
          elevate: input.elevate,
          yawDelta: 0,
          pitchDelta: 0,
          boost: input.boost,
        });
      }
    },
    []
  );

  // Handle Human look input
  const handleLookInput = useCallback((delta: { yaw: number; pitch: number }) => {
    if (officiatorRef.current) {
      officiatorRef.current.handleHumanInput({
        forward: 0,
        strafe: 0,
        elevate: 0,
        yawDelta: delta.yaw,
        pitchDelta: delta.pitch,
        boost: false,
      });
    }
  }, []);

  // Reset orbit position
  const handleResetView = useCallback(() => {
    if (officiatorRef.current) {
      const h = officiatorRef.current.getState().human;
      h.position = { x: 0, y: floatToQ16(4), z: floatToQ16(-28) };
      h.yawQ16 = 0;
      h.pitchQ16 = floatToQ16(0.08);
      h.velocity = { x: 0, y: 0, z: 0 };
    }
  }, []);

  // Download all Bare-Metal C source files
  const handleDownloadAllC = useCallback(() => {
    BARE_METAL_SOURCES.forEach((file) => {
      const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  }, []);

  // Main Ray-Tracing & Simulation Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let tickCounter = 0;
    let currentSimTime = 0;

    const renderLoop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      currentSimTime += dt;

      // Update Be <> autonomous kinetic vector & referee
      if (officiatorRef.current) {
        officiatorRef.current.updateBeAutonomous(dt);
        const beState = officiatorRef.current.getState();
        if (rayTracerRef.current) {
          rayTracerRef.current.updateBeNodePosition(beState.beOfficiator.position);
          rayTracerRef.current.updateHumanNodePosition(beState.human.position);
        }
      }

      // Physics / Quipu Ledger tick every 10 frames
      tickCounter++;
      if (tickCounter % 10 === 0 && ledgerRef.current) {
        const block = ledgerRef.current.updateTick(floatToQ16(dt), 0);
        setMerkleRoot(block.merkleRoot);
        setLyapunovDv(q16ToFloat(block.lyapunovDerivative).toFixed(3));
        setFiedlerValue(q16ToFloat(block.fiedlerValue).toFixed(3));
        setRecentBlocks([...ledgerRef.current.getRecentBlocks()]);
        setOrganelles([...ledgerRef.current.getOrganelles()]);
      }

      // Execute Q16.16 Ray-Tracing onto /dev/fb canvas if raytracer is visible
      if (viewMode === 'raytracer' || viewMode === 'split') {
        const canvas = canvasRef.current;
        if (canvas && rayTracerRef.current && officiatorRef.current) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const w = config.resolutionWidth;
            const h = config.resolutionHeight;

            if (canvas.width !== w || canvas.height !== h) {
              canvas.width = w;
              canvas.height = h;
            }

            let imgData: ImageData;
            try {
              imgData = ctx.getImageData(0, 0, w, h);
            } catch {
              imgData = ctx.createImageData(w, h);
            }

            const beState = officiatorRef.current.getState();
            const human = beState.human;
            rayTracerRef.current.renderToFramebuffer(
              imgData.data,
              w,
              h,
              human.position,
              human.yawQ16,
              human.pitchQ16,
              config,
              mode,
              wavelengthNm,
              observer,
              beState.beOfficiator.position
            );

            ctx.putImageData(imgData, 0, 0);

            setRenderTimeMs(rayTracerRef.current.getFrameTimeMs());
            setLyapunovScale(rayTracerRef.current.getLyapunovDissipationFactor());
          }
        }
      }

      // Telemetry updates
      if (officiatorRef.current && tickCounter % 4 === 0) {
        setCoPlayState({ ...officiatorRef.current.getState() });
        setTelemetry4D(officiatorRef.current.get4DTelemetry());
        setSimTime(currentSimTime);
      }

      // Calculate FPS
      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [config, mode, wavelengthNm, observer, viewMode]);

  return (
    <div className="flex flex-col w-screen h-screen bg-black text-white font-mono overflow-hidden">
      {/* Top Header & Sovereign Status Bar */}
      <Header
        mode={mode}
        onSelectMode={(m) => setMode(m)}
        observer={observer}
        onSelectObserver={(obs) => setObserver(obs)}
        viewMode={viewMode}
        onSelectViewMode={(vm) => setViewMode(vm)}
        crtScanlines={config.crtScanlines}
        onToggleScanlines={() =>
          setConfig((prev) => ({ ...prev, crtScanlines: !prev.crtScanlines }))
        }
        showCodeModal={showCodeModal}
        onToggleCodeModal={() => setShowCodeModal((prev) => !prev)}
        showOrganelles={showOrganelles}
        onToggleOrganelles={() => setShowOrganelles((prev) => !prev)}
        showSpectroscopy={showSpectroscopy}
        onToggleSpectroscopy={() => setShowSpectroscopy((prev) => !prev)}
        showEpistemicTest={showEpistemicTest}
        onToggleEpistemicTest={() => setShowEpistemicTest((prev) => !prev)}
        fiedlerValue={fiedlerValue}
        lyapunovDv={lyapunovDv}
        merkleRoot={merkleRoot}
        fps={fps}
        onDownloadAllC={handleDownloadAllC}
        onResetView={handleResetView}
      />

      {/* Main Viewport Area (Ray-Tracer / 4D Manifold / Split / MoM-BH*-1-View / Imaginarium) */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        {/* The Imaginarium: Audio-visual interactive 3-observer mathematical manifold */}
        {viewMode === 'imaginarium' && (
          <div className="w-full h-full relative">
            <ImaginariumView coPlayState={coPlayState} simTime={simTime} />
          </div>
        )}

        {/* Dedicated MoM-BH*-1 Infinite Zoom Scale Model View */}
        {viewMode === 'mom_bhstar_view' && (
          <div className="w-full h-full relative">
            <MoMBHStarView coPlayState={coPlayState} simTime={simTime} />
          </div>
        )}

        {/* Ray-Traced Framebuffer View */}
        {(viewMode === 'raytracer' || viewMode === 'split') && (
          <div
            className={`relative ${
              viewMode === 'split' ? 'w-full md:w-1/2 h-1/2 md:h-full border-r border-zinc-800' : 'w-full h-full'
            }`}
          >
            <FramebufferCanvas
              canvasRef={canvasRef}
              mode={mode}
              crtScanlines={config.crtScanlines}
              coPlayState={coPlayState}
              renderTimeMs={renderTimeMs}
              lyapunovScale={lyapunovScale}
              onMoveInput={handleMoveInput}
              onLookInput={handleLookInput}
              wavelengthNm={wavelengthNm}
            />
            {viewMode === 'split' && (
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-400 border border-zinc-800">
                3D RAY-TRACED FRAMEBUFFER ({observer.toUpperCase()})
              </div>
            )}
          </div>
        )}

        {/* 4D Spacetime Projection Canvas */}
        {(viewMode === 'manifold4d' || viewMode === 'split') && (
          <div
            className={`relative ${
              viewMode === 'split' ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full h-full'
            }`}
          >
            <Manifold4DCanvas coPlayState={coPlayState} simTime={simTime} />
            {viewMode === 'split' && (
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 text-[10px] text-cyan-400 border border-zinc-800">
                4D SPACETIME PROJECTION (FLAMM EMBEDDING)
              </div>
            )}
          </div>
        )}

        {/* 3D+t and 4D Telemetry HUD (active in Raytracer / Manifold4D / Split views) */}
        {viewMode !== 'mom_bhstar_view' && viewMode !== 'imaginarium' && (
          <FlightHud
            coPlayState={coPlayState}
            telemetry4D={telemetry4D}
            activeObserver={observer}
          />
        )}

        {/* JWST Spectroscopy Profile Overlay */}
        {showSpectroscopy && (
          <SpectroscopyPanel
            wavelengthNm={wavelengthNm}
            onChangeWavelength={(nm) => setWavelengthNm(nm)}
            onClose={() => setShowSpectroscopy(false)}
          />
        )}

        {/* 112 Organelle Consensus Matrix Overlay */}
        {showOrganelles && (
          <OrganelleMatrix
            organelles={organelles}
            recentBlocks={recentBlocks}
            onClose={() => setShowOrganelles(false)}
          />
        )}

        {/* Triadic Epistemic Reconciliation Modal Overlay */}
        {showEpistemicTest && (
          <EpistemicReconciliationPanel
            coPlayState={coPlayState}
            onClose={() => setShowEpistemicTest(false)}
          />
        )}
      </div>

      {/* Bare-Metal C Organelle Source Inspector Modal */}
      {showCodeModal && (
        <BaremetalViewer
          onClose={() => setShowCodeModal(false)}
          onDownloadAll={handleDownloadAllC}
        />
      )}
    </div>
  );
}
