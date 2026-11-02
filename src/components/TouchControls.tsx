/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { Swords, Shield, Hand } from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const stickRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch device
    const onTouch = () => setIsTouchDevice(true);
    window.addEventListener('touchstart', onTouch, { once: true });
    return () => window.removeEventListener('touchstart', onTouch);
  }, []);

  if (!isTouchDevice) return null;

  const handleStickStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateStick(touch);
  };

  const handleStickMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        updateStick(e.changedTouches[i]);
        break;
      }
    }
  };

  const handleStickEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setStickPos({ x: 0, y: 0 });
        engine.setTouchInput({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateStick = (touch: React.Touch) => {
    if (!stickRef.current) return;
    const rect = stickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 38;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setStickPos({ x: nx, y: ny });
    engine.setTouchInput({
      x: clampedDist > 6 ? nx / maxRadius : 0,
      y: clampedDist > 6 ? ny / maxRadius : 0
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex justify-between items-end p-4 md:hidden">
      {/* Virtual Joystick (Bottom Left) */}
      <div
        ref={stickRef}
        onTouchStart={handleStickStart}
        onTouchMove={handleStickMove}
        onTouchEnd={handleStickEnd}
        onTouchCancel={handleStickEnd}
        className="pointer-events-auto w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-700/80 flex items-center justify-center relative touch-none backdrop-blur-xs mb-2 ml-2"
      >
        <div
          className="w-12 h-12 rounded-full bg-emerald-500/80 border border-emerald-300 shadow-md transform transition-transform duration-75"
          style={{ transform: `translate(${stickPos.x}px, ${stickPos.y}px)` }}
        />
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5 mb-2 mr-2">
        {/* Interact Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            engine.triggerTouchAction('interact');
          }}
          className="w-12 h-12 rounded-full bg-amber-600/80 border border-amber-400 flex items-center justify-center text-white active:scale-95 shadow-lg active:bg-amber-500 cursor-pointer"
        >
          <Hand className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Dodge Roll Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engine.triggerTouchAction('roll');
            }}
            className="w-13 h-13 rounded-full bg-sky-600/80 border border-sky-400 flex items-center justify-center text-white active:scale-95 shadow-lg active:bg-sky-500 cursor-pointer"
          >
            <Shield className="w-5 h-5" />
          </button>

          {/* Primary Attack / Action Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engine.triggerTouchAction('action');
            }}
            className="w-15 h-15 rounded-full bg-rose-600/90 border-2 border-rose-400 flex items-center justify-center text-white active:scale-95 shadow-xl active:bg-rose-500 cursor-pointer"
          >
            <Swords className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
