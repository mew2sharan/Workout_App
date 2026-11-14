import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Volume2, VolumeX, Bell } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface RestTimerProps {
  initialSeconds: number;
  secondsRemaining: number;
  isActive: boolean;
  soundEnabled: boolean;
  onTick: (updater: (prev: number) => number) => void;
  onToggleActive: () => void;
  onReset: (newSeconds?: number) => void;
  onAdjustSeconds: (delta: number) => void;
  onDismiss: () => void;
  onToggleSound: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  secondsRemaining,
  isActive,
  soundEnabled,
  onTick,
  onToggleActive,
  onReset,
  onAdjustSeconds,
  onDismiss,
  onToggleSound
}) => {
  const timerRef = useRef<number | null>(null);
  const prevSecRef = useRef<number>(secondsRemaining);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        onTick((prev) => {
          if (prev <= 1) {
            if (soundEnabled) {
              soundManager.playCompletionChime();
            }
            return 0;
          }
          if (prev <= 4 && prev > 1 && soundEnabled) {
            soundManager.playWarningTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, soundEnabled, onTick]);

  useEffect(() => {
    prevSecRef.current = secondsRemaining;
  }, [secondsRemaining]);

  const progressPct = initialSeconds > 0
    ? Math.min(100, Math.max(0, ((initialSeconds - secondsRemaining) / initialSeconds) * 100))
    : 0;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isCompleted = secondsRemaining === 0 && initialSeconds > 0;

  return (
    <aside aria-label="Rest timer" className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-orange-500/40 rounded-2xl shadow-2xl p-4 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wide uppercase text-slate-300">
              {isCompleted ? 'Rest Complete! Ready for Next Set' : 'Rest Period Timer'}
            </div>
            <div className="text-[11px] text-slate-400">
              {isActive ? 'Counting down...' : isCompleted ? 'Take a breath & lift' : 'Paused'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSound}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title="Minimize Timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer Progress & Display */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-baseline gap-2">
          <span className={`font-mono-numbers text-3xl font-extrabold tracking-tight ${
            isCompleted ? 'text-emerald-400' : secondsRemaining <= 5 && secondsRemaining > 0 ? 'text-amber-400 animate-pulse' : 'text-white'
          }`}>
            {formattedTime}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ {Math.floor(initialSeconds / 60)}m {initialSeconds % 60}s</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAdjustSeconds(-15)}
            disabled={secondsRemaining <= 15}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
            title="-15 seconds"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleActive}
            className={`p-2.5 rounded-xl font-bold transition-transform active:scale-95 ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
                : isActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-950'
            }`}
            title={isActive ? 'Pause' : 'Start'}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={() => onAdjustSeconds(15)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="+15 seconds"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onReset(initialSeconds)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Reset to initial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-600 to-amber-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Quick Interval Presets */}
      <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
        {[30, 60, 90, 120, 180].map((presetSec) => (
          <button
            key={presetSec}
            onClick={() => onReset(presetSec)}
            className={`py-1 text-[11px] font-semibold rounded-md transition-colors ${
              initialSeconds === presetSec && !isCompleted
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {presetSec < 60 ? `${presetSec}s` : `${presetSec / 60}m`}
          </button>
        ))}
      </div>
    </aside>
  );
};
