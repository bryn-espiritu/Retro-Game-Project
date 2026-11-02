/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameEngine } from '../game/engine';
import { ALCHEMY_RECIPES, CROPS } from '../game/constants';
import { Recipe } from '../game/types';
import { sound } from '../game/audio';
import { X, Sparkles, Coins, Check } from 'lucide-react';

interface CauldronModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const CauldronModal: React.FC<CauldronModalProps> = ({ engine, onClose }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getPlayerCropCount = (seedType: string) => {
    const item = engine.inventory.find((i) => i.type === 'crop' && i.seedType === seedType);
    return item ? item.count : 0;
  };

  const handleBrew = (recipe: Recipe) => {
    // Check gold
    if (engine.stats.gold < recipe.goldCost) return;

    // Check crops
    for (const req of recipe.requiredCrops) {
      if (getPlayerCropCount(req.seedType) < req.count) return;
    }

    // Deduct crops
    for (const req of recipe.requiredCrops) {
      const item = engine.inventory.find((i) => i.type === 'crop' && i.seedType === req.seedType);
      if (item) {
        item.count -= req.count;
      }
    }
    // Remove empty crop slots
    engine.inventory = engine.inventory.filter((i) => i.count > 0);

    // Deduct gold
    engine.stats.gold -= recipe.goldCost;

    // Add potion to inventory
    const existingPotion = engine.inventory.find(
      (i) => i.type === 'potion' && i.potionEffect === recipe.resultPotion.effect
    );

    if (existingPotion) {
      existingPotion.count += 1;
    } else {
      engine.inventory.push({
        id: `potion_${recipe.resultPotion.effect}_${Date.now()}`,
        type: 'potion',
        name: recipe.resultPotion.name,
        count: 1,
        potionEffect: recipe.resultPotion.effect,
        potionDuration: recipe.resultPotion.duration,
        icon: '🧪'
      });
    }

    sound.playPotionDrink();
    setSuccessMessage(`Brewed 1x ${recipe.resultPotion.name}!`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-purple-500/80 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔮</span>
            <div>
              <h2 className="text-sm font-pixel text-purple-300">ALCHEMICAL CAULDRON</h2>
              <p className="text-xs text-slate-400">Brew harvested crops into potent combat tonics</p>
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
        <div className="flex items-center justify-between px-6 py-2.5 bg-purple-950/20 border-b border-purple-900/30 text-xs font-mono">
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

        {/* Recipes Grid */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {ALCHEMY_RECIPES.map((recipe) => {
            const hasGold = engine.stats.gold >= recipe.goldCost;
            const canAffordCrops = recipe.requiredCrops.every(
              (req) => getPlayerCropCount(req.seedType) >= req.count
            );
            const canBrew = hasGold && canAffordCrops;

            return (
              <div
                key={recipe.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🧪</span>
                    <h3 className="font-semibold text-slate-100 text-sm">{recipe.resultPotion.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{recipe.resultPotion.description}</p>

                  {/* Requirements List */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {recipe.requiredCrops.map((req) => {
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
                      Cost: {recipe.goldCost} Gold
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBrew(recipe)}
                  disabled={!canBrew}
                  className={`w-full md:w-auto px-4 py-2.5 rounded-lg text-xs font-pixel-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    canBrew
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BREW TONIC</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
