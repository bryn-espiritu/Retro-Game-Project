/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameEngine } from '../game/engine';
import { BLACKSMITH_UPGRADES, CROPS } from '../game/constants';
import { BlacksmithUpgrade } from '../game/types';
import { sound } from '../game/audio';
import { X, Hammer, Coins, Check, ShieldAlert } from 'lucide-react';

interface ForgeModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const ForgeModal: React.FC<ForgeModalProps> = ({ engine, onClose }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getPlayerCropCount = (seedType: string) => {
    const item = engine.inventory.find((i) => i.type === 'crop' && i.seedType === seedType);
    return item ? item.count : 0;
  };

  const getCurrentTier = (category: string) => {
    if (category === 'sword') return engine.stats.swordTier;
    if (category === 'bow') return engine.stats.bowTier;
    if (category === 'hp') return Math.floor((engine.stats.maxHp - 100) / 25) + 1;
    if (category === 'stamina') return Math.floor((engine.stats.maxStamina - 100) / 20) + 1;
    return 1;
  };

  const handleUpgrade = (upgrade: BlacksmithUpgrade) => {
    const currentTier = getCurrentTier(upgrade.category);
    if (currentTier >= upgrade.maxTier) return;

    const scaledGold = upgrade.goldCost * currentTier;
    if (engine.stats.gold < scaledGold) return;

    // Check crops
    for (const req of upgrade.requiredCrops) {
      if (getPlayerCropCount(req.seedType) < req.count) return;
    }

    // Deduct crops
    for (const req of upgrade.requiredCrops) {
      const item = engine.inventory.find((i) => i.type === 'crop' && i.seedType === req.seedType);
      if (item) item.count -= req.count;
    }
    engine.inventory = engine.inventory.filter((i) => i.count > 0);

    // Deduct gold
    engine.stats.gold -= scaledGold;

    // Apply upgrade
    if (upgrade.category === 'sword') {
      engine.stats.swordTier += 1;
      const swordItem = engine.inventory.find((i) => i.type === 'sword');
      if (swordItem) swordItem.name = `Tier ${engine.stats.swordTier} Forged Blade`;
    } else if (upgrade.category === 'bow') {
      engine.stats.bowTier += 1;
      const bowItem = engine.inventory.find((i) => i.type === 'bow');
      if (bowItem) bowItem.name = `Tier ${engine.stats.bowTier} Reinforced Bow`;
    } else if (upgrade.category === 'hp') {
      engine.stats.maxHp += 25;
      engine.stats.hp += 25;
    } else if (upgrade.category === 'stamina') {
      engine.stats.maxStamina += 20;
      engine.stats.stamina += 20;
    }

    sound.playVictory();
    setSuccessMessage(`Forged ${upgrade.name} (Tier ${currentTier + 1})!`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-600/80 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(217,119,6,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚒️</span>
            <div>
              <h2 className="text-sm font-pixel text-amber-400">BLACKSMITH FORGE</h2>
              <p className="text-xs text-slate-400">Temper your gear with subterranean crops and gold</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Resources Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-amber-950/20 border-b border-amber-900/30 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Coins className="w-4 h-4" />
            <span className="tabular-nums font-bold">{engine.stats.gold} Gold</span>
          </div>

          {successMessage && (
            <div className="flex items-center gap-1 text-emerald-400 font-pixel-sm animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Upgrades List */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {BLACKSMITH_UPGRADES.map((upgrade) => {
            const currentTier = getCurrentTier(upgrade.category);
            const isMaxed = currentTier >= upgrade.maxTier;
            const scaledGold = upgrade.goldCost * currentTier;
            const hasGold = engine.stats.gold >= scaledGold;
            const canAffordCrops = upgrade.requiredCrops.every(
              (req) => getPlayerCropCount(req.seedType) >= req.count
            );
            const canUpgrade = !isMaxed && hasGold && canAffordCrops;

            return (
              <div
                key={upgrade.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-amber-600/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">
                      {upgrade.category === 'sword' ? '⚔️' : upgrade.category === 'bow' ? '🏹' : '🛡️'}
                    </span>
                    <h3 className="font-semibold text-slate-100 text-sm">
                      {upgrade.name}
                      <span className="text-xs font-pixel-sm text-amber-400 ml-2">
                        {isMaxed ? 'MAX TIER' : `Tier ${currentTier}/${upgrade.maxTier}`}
                      </span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{upgrade.description}</p>

                  {/* Requirements List */}
                  {!isMaxed && (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {upgrade.requiredCrops.map((req) => {
                        const count = getPlayerCropCount(req.seedType);
                        const hasEnough = count >= req.count;
                        return (
                          <span
                            key={req.seedType}
                            className={`font-mono tabular-nums ${hasEnough ? 'text-emerald-400' : 'text-rose-400'}`}
                          >
                            {CROPS[req.seedType].name}: {count}/{req.count}
                          </span>
                        );
                      })}

                      <span className={`font-mono tabular-nums ${hasGold ? 'text-amber-400' : 'text-rose-400'}`}>
                        Cost: {scaledGold} Gold
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleUpgrade(upgrade)}
                  disabled={!canUpgrade}
                  className={`w-full md:w-auto px-4 py-2.5 rounded-lg text-xs font-pixel-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    canUpgrade
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>{isMaxed ? 'MAXED' : 'FORGE UPGRADE'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
