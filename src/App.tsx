/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game.ts';
import { Volume2, VolumeX, Music, Maximize2, Shield, Sparkles, Swords } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Game | null>(null);

  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [showControlsHint, setShowControlsHint] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Game
    const game = new Game(canvas);
    gameRef.current = game;
    game.start();

    // Scale canvas responsively to maintain 1280x720 aspect ratio
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const targetAspect = 1280 / 720;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth = containerWidth;
      let displayHeight = containerHeight;

      if (containerAspect > targetAspect) {
        // Container is wider than 16:9
        displayHeight = containerHeight;
        displayWidth = containerHeight * targetAspect;
      } else {
        // Container is taller than 16:9
        displayWidth = containerWidth;
        displayHeight = containerWidth / targetAspect;
      }

      canvas.style.width = `${Math.floor(displayWidth)}px`;
      canvas.style.height = `${Math.floor(displayHeight)}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleToggleSound = () => {
    if (gameRef.current) {
      const state = gameRef.current.audioSystem.toggleSound();
      setSoundOn(state);
    }
  };

  const handleToggleMusic = () => {
    if (gameRef.current) {
      const state = gameRef.current.audioSystem.toggleMusic();
      setMusicOn(state);
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative w-screen h-screen bg-stone-950 text-stone-200 overflow-hidden flex flex-col font-serif select-none">
      {/* Top Header Bar */}
      <header className="h-10 px-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <Shield className="w-4 h-4 text-sky-400" />
          <h1 className="font-cinzel text-xs md:text-sm font-bold tracking-widest text-stone-200">
            ECHOES OF THE FORGOTTEN KINGDOM
          </h1>
          <span className="hidden sm:inline-block text-[11px] text-stone-500 font-serif">
            · 2D Side-Scrolling Fantasy Adventure
          </span>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowControlsHint(!showControlsHint)}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-cinzel rounded border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Controls & Echo Mechanics"
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Controls</span>
          </button>

          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded border border-stone-700 transition-colors ${
              soundOn ? 'bg-stone-800 text-sky-400 hover:bg-stone-700' : 'bg-stone-900 text-stone-500'
            }`}
            title="Toggle SFX"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleMusic}
            className={`p-1.5 rounded border border-stone-700 transition-colors ${
              musicOn ? 'bg-stone-800 text-amber-400 hover:bg-stone-700' : 'bg-stone-900 text-stone-500'
            }`}
            title="Toggle Ambient Soundtrack"
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Canvas Viewport Container */}
      <main
        ref={containerRef}
        className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
      >
        <canvas
          id="game-canvas"
          ref={canvasRef}
          width={1280}
          height={720}
          className="pixel-sharp block bg-black shadow-2xl outline-none"
          tabIndex={0}
        />

        {/* Quick Controls Modal Overlay */}
        {showControlsHint && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-40">
            <div className="max-w-md w-full bg-stone-900 border border-sky-600/60 p-6 rounded-lg shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <h3 className="font-cinzel text-lg font-bold text-sky-300">
                    Echoes & Combat Guide
                  </h3>
                </div>
                <button
                  onClick={() => setShowControlsHint(false)}
                  className="text-stone-400 hover:text-white text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-stone-300 font-cinzel">
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-amber-400 font-bold">A / D or ← / →</span>
                  <span>Move Kael</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-amber-400 font-bold">W / Space / ↑</span>
                  <span>Jump / Platform Vault</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-amber-400 font-bold">J (Tap)</span>
                  <span>Light Attack (20 dmg)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-amber-400 font-bold">J (Hold)</span>
                  <span>Heavy Cleave (42 dmg + knockback)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-amber-400 font-bold">K (Hold)</span>
                  <span>Shield Block (Absorbs 70% damage)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-amber-400 font-bold">Shift</span>
                  <span>Dash (Invulnerable glide)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-sky-400 font-bold">Q</span>
                  <span>Create Echo (Replays past actions)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-sky-400 font-bold">R</span>
                  <span>Recall / Dissipate Echoes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800/60">
                  <span className="text-amber-400 font-bold">E</span>
                  <span>Commune Checkpoints & Statues</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400 font-bold">ESC / P</span>
                  <span>Pause / Menu</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-800 text-[11px] text-stone-400 font-serif italic text-center">
                Tip: Walk onto a pressure plate, create an Echo with [Q], and your Echo will repeat stepping on it to keep gates open!
              </div>

              <button
                onClick={() => setShowControlsHint(false)}
                className="w-full mt-4 py-2 bg-sky-700 hover:bg-sky-600 text-white font-cinzel text-xs font-bold rounded tracking-wider transition-colors"
              >
                RETURN TO ADVENTURE
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
