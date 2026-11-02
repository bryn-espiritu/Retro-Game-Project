/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameEngine } from '../game/engine';
import { X, Download, Terminal, Upload, FileCode, Check, Copy, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';

interface ExportModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<'standalone' | 'source' | 'save'>('standalone');
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isCopyingHtml, setIsCopyingHtml] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Client-side Blob download that prevents Cloud Run cookie navigation issues
  const handleDownloadStandalone = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);

      const response = await fetch('/verdant-depths-standalone.html', {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'verdant-depths-game.html';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err: unknown) {
      console.error('Download error:', err);
      setDownloadError(err instanceof Error ? err.message : 'Download failed due to browser iframe restrictions.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 1-Click Copy full HTML code to clipboard
  const handleCopyHtmlToClipboard = async () => {
    try {
      setIsCopyingHtml(true);
      const response = await fetch('/verdant-depths-standalone.html');
      const htmlText = await response.text();
      await navigator.clipboard.writeText(htmlText);
      setHtmlCopied(true);
      setTimeout(() => setHtmlCopied(false), 3500);
    } catch (err) {
      console.error('Copy HTML error:', err);
      setDownloadError('Could not copy to clipboard directly.');
    } finally {
      setIsCopyingHtml(false);
    }
  };

  // Export save data as JSON
  const handleExportSave = () => {
    const saveData = {
      version: 1,
      stats: engine.stats,
      inventory: engine.inventory,
      farmPlots: engine.farmPlots,
      currentWeather: engine.currentWeather,
      activeBuffs: engine.activeBuffs,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verdant-depths-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveStatus('Save file exported successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Import save data from JSON
  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.stats && data.inventory && data.farmPlots) {
          engine.stats = { ...engine.stats, ...data.stats };
          engine.inventory = data.inventory;
          engine.farmPlots = data.farmPlots;
          if (data.currentWeather) engine.currentWeather = data.currentWeather;
          setSaveStatus('Save data restored successfully!');
          setTimeout(() => setSaveStatus(null), 3000);
        } else {
          setSaveStatus('Error: Invalid save file format.');
        }
      } catch {
        setSaveStatus('Error: Failed to parse JSON save file.');
      }
    };
    reader.readAsText(file);
  };

  const copyBashCommands = () => {
    navigator.clipboard.writeText(`npm install\nnpm run dev`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="text-sm font-pixel text-emerald-400">EXPORT & PLAY OFFLINE</h2>
              <p className="text-xs text-slate-400">Download single-file game or run local project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('standalone')}
            className={`px-3 py-2 text-xs font-pixel-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'standalone'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1-Click Offline Game
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`px-3 py-2 text-xs font-pixel-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'source'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Local Source Run
          </button>
          <button
            onClick={() => setActiveTab('save')}
            className={`px-3 py-2 text-xs font-pixel-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'save'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Save File Backup
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs font-sans text-slate-300">
          {activeTab === 'standalone' && (
            <div className="flex flex-col gap-4">
              {/* Primary Download Card */}
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-400 font-pixel-sm text-xs">
                  <FileCode className="w-4 h-4" />
                  <span>Standalone Single-File Game (.html)</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  The entire game, graphics, weather simulation, and 8-bit sound synthesizers have been bundled into a single self-contained HTML file.
                  Double-click the file on Windows, Mac, or Linux to play offline in Chrome, Safari, Edge, or Firefox!
                </p>

                {/* Direct JavaScript In-Memory Blob Download Button (Bypasses iframe navigation cookie check) */}
                <button
                  onClick={handleDownloadStandalone}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-pixel text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'PREPARING OFFLINE FILE...' : 'DOWNLOAD STANDALONE GAME (.HTML)'}</span>
                </button>

                {downloadSuccess && (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-pixel-sm text-xs bg-emerald-950/80 border border-emerald-500/50 py-2 rounded-lg animate-pulse">
                    <Check className="w-4 h-4" />
                    <span>Download started! Check your browser downloads folder.</span>
                  </div>
                )}
              </div>

              {/* Cookie / Sandbox Fallback Options */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-400 font-pixel-sm text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Alternative Export Options (If Browser Blocks Downloads)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Option B: Copy HTML text directly to clipboard */}
                  <button
                    onClick={handleCopyHtmlToClipboard}
                    disabled={isCopyingHtml}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-500 text-slate-200 py-2.5 px-3 rounded-lg font-pixel-sm text-[11px] cursor-pointer transition-colors"
                  >
                    {htmlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{htmlCopied ? 'HTML COPIED!' : 'COPY GAME CODE TO CLIPBOARD'}</span>
                  </button>

                  {/* Option C: Open standalone file directly in new tab */}
                  <a
                    href="/verdant-depths-standalone.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-500 text-slate-200 py-2.5 px-3 rounded-lg font-pixel-sm text-[11px] cursor-pointer transition-colors text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    <span>OPEN IN NEW TAB</span>
                  </a>
                </div>

                {htmlCopied && (
                  <p className="text-[11px] text-emerald-300 font-mono bg-slate-900 p-2 rounded border border-emerald-900/50">
                    ✓ Full standalone code copied! Create a new file named <strong>verdant-depths.html</strong> on your computer, paste the contents, and double-click to play!
                  </p>
                )}

                {downloadError && (
                  <div className="flex items-start gap-2 bg-rose-950/50 border border-rose-800/80 p-2.5 rounded-lg text-rose-300 text-[11px]">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Notice: {downloadError} If your browser asks to authenticate, click "Authenticate in new window" or use "Copy Game Code".</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <h4 className="font-pixel-sm text-slate-300 text-xs mb-1.5">Offline Play Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                  <li>Save <strong className="text-slate-200">verdant-depths-game.html</strong> to your desktop or documents folder.</li>
                  <li>Double-click the file to open in your favorite browser.</li>
                  <li>Play 100% offline with full audio, farming, and dungeon survival!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="flex flex-col gap-4">
              <p className="text-slate-300 text-xs leading-relaxed">
                Run and modify the full TypeScript + React + Vite source repository locally on your computer.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Terminal Commands</span>
                  </span>
                  <button
                    onClick={copyBashCommands}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg font-mono text-xs text-amber-300 overflow-x-auto">
{`# 1. Install dependencies
npm install

# 2. Run local dev server (http://localhost:3000)
npm run dev

# 3. Build production standalone bundle
npm run build:standalone`}
                </pre>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 font-mono">
                💡 Output bundle is saved to <code className="text-amber-300">dist/verdant-depths-standalone.html</code>.
              </div>
            </div>
          )}

          {activeTab === 'save' && (
            <div className="flex flex-col gap-4">
              <p className="text-slate-300 text-xs leading-relaxed">
                Transfer your farmstead layout, gold, weapon tiers, and deepest floor cleared between devices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportSave}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500 p-4 rounded-xl text-center cursor-pointer transition-colors"
                >
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span className="font-pixel-sm text-slate-200">Export Save File</span>
                  <span className="text-[10px] text-slate-400 font-mono">Download JSON backup</span>
                </button>

                <label className="flex flex-col items-center justify-center gap-2 bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-amber-500 p-4 rounded-xl text-center cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span className="font-pixel-sm text-slate-200">Import Save File</span>
                  <span className="text-[10px] text-slate-400 font-mono">Load from JSON backup</span>
                  <input type="file" accept=".json" onChange={handleImportSave} className="hidden" />
                </label>
              </div>

              {saveStatus && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center font-pixel-sm text-xs text-emerald-400 animate-pulse">
                  {saveStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
