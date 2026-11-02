/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { CauldronModal } from './components/CauldronModal';
import { ForgeModal } from './components/ForgeModal';
import { PauseModal, GameOverModal, VictoryModal } from './components/GameModals';
import { ExportModal } from './components/ExportModal';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level React state synchronized with engine
  const [screen, setScreen] = useState<'TITLE' | 'FARM' | 'DUNGEON' | 'PAUSE' | 'GAME_OVER' | 'VICTORY'>('TITLE');
  const [activeModal, setActiveModal] = useState<'cauldron' | 'forge' | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [, setTick] = useState(0); // Periodic tick for HUD sync

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onStateChange = (eng) => {
      setScreen(eng.screen);
      setTick((t) => (t + 1) % 10000);
    };

    engine.onOpenModal = (modalType) => {
      if (modalType === 'cauldron' || modalType === 'forge') {
        setActiveModal(modalType);
      } else if (modalType === 'game_over') {
        setScreen('GAME_OVER');
      } else if (modalType === 'victory') {
        setScreen('VICTORY');
      }
      setTick((t) => (t + 1) % 10000);
    };

    engine.start();

    const handleResize = () => {
      engine.resizeCanvases();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
      setScreen('FARM');
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.screen = 'PAUSE';
      setScreen('PAUSE');
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.screen = engineRef.current.currentFloorData ? 'DUNGEON' : 'FARM';
      setScreen(engineRef.current.screen);
    }
  };

  const handleReturnToFarm = () => {
    setActiveModal(null);
    if (engineRef.current) {
      engineRef.current.returnToFarm();
      setScreen('FARM');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090d16] select-none font-sans">
      {/* 60fps Game Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pixel-art cursor-crosshair"
      />

      {/* Title Screen */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenExport={() => setIsExportOpen(true)}
        />
      )}

      {/* In-Game Active HUD */}
      {(screen === 'FARM' || screen === 'DUNGEON' || screen === 'PAUSE') && engineRef.current && (
        <>
          <GameHUD
            engine={engineRef.current}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
          />
          <TouchControls engine={engineRef.current} />
        </>
      )}

      {/* Modals & Overlays */}
      {screen === 'PAUSE' && engineRef.current && (
        <PauseModal
          engine={engineRef.current}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onResume={handleResume}
          onReturnToFarm={handleReturnToFarm}
          onOpenExport={() => setIsExportOpen(true)}
        />
      )}

      {screen === 'GAME_OVER' && engineRef.current && (
        <GameOverModal
          engine={engineRef.current}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onReturnToFarm={handleReturnToFarm}
        />
      )}

      {screen === 'VICTORY' && engineRef.current && (
        <VictoryModal
          engine={engineRef.current}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onReturnToFarm={handleReturnToFarm}
        />
      )}

      {/* Cauldron Modal */}
      {activeModal === 'cauldron' && engineRef.current && (
        <CauldronModal
          engine={engineRef.current}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Blacksmith Forge Modal */}
      {activeModal === 'forge' && engineRef.current && (
        <ForgeModal
          engine={engineRef.current}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Export / Standalone Game Modal */}
      {isExportOpen && engineRef.current && (
        <ExportModal
          engine={engineRef.current}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
