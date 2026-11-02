/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Download } from 'lucide-react';
import { sound } from '../game/audio';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenExport: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, isMuted, onToggleMute, onOpenExport }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 bg-[#070b14] overflow-hidden flex flex-col justify-between p-6 md:p-12 z-20 select-none">
      {/* Background Animated Retro Grid & Ambient Embers */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Bar with sound toggle, export button and version tag */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-2 text-xs font-pixel-sm text-emerald-400">
          <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
          <span className="hidden sm:inline">16-BIT ROGUELITE & BOTANICAL SURVIVAL</span>
          <span className="sm:hidden">VERDANT DEPTHS</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-emerald-600/60 px-3 py-1.5 rounded-lg text-xs font-pixel-sm text-emerald-300 hover:text-white transition-colors cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>EXPORT GAME</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-pixel-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">SOUND OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">SOUND ON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Centerpiece: Bespoke SVG Title Lockup over 35% negative space */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="w-full max-w-xl mb-4">
          <svg viewBox="0 0 600 130" className="w-full drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <defs>
              <linearGradient id="verdantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="depthsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <filter id="pixelGlow">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#047857" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Crest / Seed sprout icon */}
            <path
              d="M300 15 C290 5, 275 10, 275 22 C275 35, 300 45, 300 45 C300 45, 325 35, 325 22 C325 10, 310 5, 300 15 Z"
              fill="#34D399"
              filter="url(#pixelGlow)"
            />

            {/* Main title text */}
            <text
              x="300"
              y="85"
              textAnchor="middle"
              fill="url(#verdantGrad)"
              fontFamily="'Press Start 2P', monospace"
              fontSize="34"
              fontWeight="bold"
              letterSpacing="2"
            >
              VERDANT DEPTHS
            </text>

            {/* Subtitle banner */}
            <text
              x="300"
              y="118"
              textAnchor="middle"
              fill="url(#depthsGrad)"
              fontFamily="'Silkscreen', monospace"
              fontSize="16"
              fontWeight="700"
              letterSpacing="4"
            >
              DUNGEON & HARVEST
            </text>
          </svg>
        </div>

        {/* Narrative Hook */}
        <p className="text-slate-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed font-sans">
          Cultivate enchanted subterranean flora on your surface farmstead to brew alchemical elixirs,
          forge iron weaponry, and survive increasingly deadly floors of the ancient abyss.
        </p>

        {/* Start Game CTA Button */}
        <button
          onClick={() => {
            sound.unlock();
            onStart();
          }}
          className="group relative inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs md:text-sm px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all transform hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
        >
          <span>ENTER THE HOMESTEAD</span>
          <span className="text-emerald-200 group-hover:translate-x-1 transition-transform">⚔️</span>
        </button>

        {/* Enter / Space key prompt */}
        <span className="text-[11px] font-pixel-sm text-slate-500 mt-3">
          Press <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">ENTER</kbd> or <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">SPACE</kbd>
        </span>
      </div>

      {/* Bottom Flat Control Hint Line & Credits */}
      <div className="relative z-10 flex flex-col items-center gap-2 border-t border-slate-800/80 pt-4 text-center">
        <p className="text-[11px] md:text-xs font-mono text-slate-400 tracking-wide">
          WASD Move · Click / Space Action · Right-Click / Shift Dodge · E Interact · 1-5 Hotbar · Esc Pause
        </p>
        <p className="text-[10px] md:text-[11px] font-pixel-sm text-slate-500 tracking-wider">
          Created by <span className="text-emerald-400 font-semibold">Bryn Espiritu</span> · Built with <span className="text-amber-400 font-semibold">Google AI Studio</span>
        </p>
      </div>
    </div>
  );
};
