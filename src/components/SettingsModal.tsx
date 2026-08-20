import React from 'react';
import { GameSettings } from '../types';
import { BOARD_THEMES, STRIKER_SKINS, GOTI_THEMES, QUEEN_THEMES } from '../data/carromConstants';
import {
  X,
  Check,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Eye,
  Clock,
  Crown,
  Palette,
  Sparkles,
  Zap,
  Shield,
  CircleDot,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col bg-gradient-to-b from-[#1c1a24] to-[#121118] border-2 border-[#d4af37]/40 rounded-2xl shadow-2xl text-[#f3e5ab] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/20 bg-[#171923]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2a2212] border border-[#d4af37]/40 text-[#ffdf73]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-royal font-bold text-base text-[#f3e5ab]">Settings & Atmosphere</h2>
              <p className="text-[11px] text-[#d4af37]">Board, Audio, Striker & Physics Tuning</p>
            </div>
          </div>

          <button
            id="settings-modal-close-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-[#232738] hover:bg-[#2d3248] text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* 1. Audio & Music Suite */}
          <div className="p-3.5 rounded-2xl bg-[#171923] border border-[#d4af37]/25 space-y-3.5">
            <div className="text-xs font-bold text-[#ffdf73] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#d4af37]" /> Audio & Sound Effects
              </span>
              <button
                type="button"
                onClick={() => {
                  const newMuted = !settings.soundEnabled;
                  onUpdateSettings({ soundEnabled: !settings.soundEnabled });
                  soundManager.setMuted(!newMuted);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition flex items-center gap-1 ${
                  settings.soundEnabled
                    ? 'bg-[#2ecc71]/20 text-[#2ecc71] border-[#2ecc71]/40'
                    : 'bg-[#e74c3c]/20 text-[#ff7675] border-[#e74c3c]/40'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                {settings.soundEnabled ? 'Audio Active' : 'Muted'}
              </button>
            </div>

            {/* Master Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#f3e5ab]">
                <span>Master Volume</span>
                <span className="font-bold text-[#ffdf73]">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                id="settings-master-vol"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ soundVolume: val });
                  soundManager.setVolume(val);
                }}
                className="w-full h-1.5 bg-[#202434] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>

            {/* Ambient Background Music (Tanpura Drone) */}
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#a29bfe]" />
                  <div>
                    <div className="text-xs font-bold text-[#f3e5ab]">Royal Tanpura Drone (BGM)</div>
                    <div className="text-[10px] text-gray-400">Meditative harmonic Sa-Pa Indian drone</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !settings.bgmEnabled;
                    onUpdateSettings({ bgmEnabled: next });
                    soundManager.toggleBGM(next);
                  }}
                  className={`w-10 h-5 rounded-full transition relative flex items-center p-0.5 ${
                    settings.bgmEnabled ? 'bg-[#a29bfe]' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.bgmEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.bgmEnabled && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-300">
                    <span>BGM Intensity</span>
                    <span className="text-[#a29bfe] font-semibold">{Math.round(settings.bgmVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={settings.bgmVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateSettings({ bgmVolume: val });
                      soundManager.setBgmVolume(val);
                    }}
                    className="w-full h-1.5 bg-[#202434] rounded-lg appearance-none cursor-pointer accent-[#a29bfe]"
                  />
                </div>
              )}
            </div>

            {/* Screen Shake Toggle */}
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#ff9f43]" />
                <div>
                  <div className="text-xs font-bold text-[#f3e5ab]">Screen Shake on Heavy Strikes</div>
                  <div className="text-[10px] text-gray-400">Haptic visual impact on power shots</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ screenShakeEnabled: !settings.screenShakeEnabled });
                }}
                className={`w-10 h-5 rounded-full transition relative flex items-center p-0.5 ${
                  settings.screenShakeEnabled ? 'bg-[#ff9f43]' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.screenShakeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Board Felt Themes */}
          <div>
            <label className="block text-xs font-bold text-[#ffdf73] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#d4af37]" /> Board Felt Atmosphere
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {BOARD_THEMES.map((theme) => {
                const isSelected = theme.id === settings.boardTheme;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onUpdateSettings({ boardTheme: theme.id });
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#2a2212] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                        : 'bg-[#171923] border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg border border-[#d4af37]/40 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: theme.feltColor }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#ffdf73]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#f3e5ab] truncate">{theme.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Striker Skins */}
          <div>
            <label className="block text-xs font-bold text-[#ffdf73] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#d4af37]" /> Striker Crystal Skins
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {STRIKER_SKINS.map((skin) => {
                const isSelected = skin.id === settings.strikerSkin;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onUpdateSettings({ strikerSkin: skin.id });
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#2a2212] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                        : 'bg-[#171923] border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 border-[#fff] shadow-md flex items-center justify-center"
                      style={{ backgroundColor: skin.primaryColor }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: skin.gemColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#f3e5ab] truncate">{skin.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3b. Matching Goti Themes (Carrom Men) */}
          <div>
            <label className="block text-xs font-bold text-[#ffdf73] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-[#d4af37]" /> Board-Matched Goti Sets
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {GOTI_THEMES.map((theme) => {
                const isSelected = theme.id === (settings.gotiTheme || GOTI_THEMES[0].id);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onUpdateSettings({ gotiTheme: theme.id });
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#2a2212] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                        : 'bg-[#171923] border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center -space-x-1.5">
                      <div
                        className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: theme.whiteGradMid }}
                        title="White Goti"
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.blackGradMid }}
                        title="Black Goti"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#f3e5ab] truncate">{theme.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3c. Red Queen Themes */}
          <div>
            <label className="block text-xs font-bold text-[#ffdf73] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#ff4d6d]" /> Empress Queen Styling
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {QUEEN_THEMES.map((theme) => {
                const isSelected = theme.id === (settings.queenTheme || QUEEN_THEMES[0].id);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      onUpdateSettings({ queenTheme: theme.id });
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#3b121e] border-[#ff4d6d] shadow-[0_0_12px_rgba(255,77,109,0.35)]'
                        : 'bg-[#171923] border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-[#ffdf73] shadow-md flex items-center justify-center"
                      style={{ backgroundColor: theme.gradMid }}
                    >
                      <Crown className="w-3.5 h-3.5" style={{ color: theme.crownColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#f3e5ab] truncate">{theme.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Boric Powder Speed Slider */}
          <div className="p-3 rounded-xl bg-[#171923] border border-[#d4af37]/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#f3e5ab] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#d4af37]" /> Boric Powder (Board Friction)
              </label>
              <span className="text-xs font-bold text-[#ffdf73]">
                {settings.powderLevel < 0.95
                  ? '⚡ Slick Glide'
                  : settings.powderLevel > 1.05
                  ? 'Heavy Grip'
                  : 'Smooth Standard'}
              </span>
            </div>
            <input
              id="settings-powder-slider"
              type="range"
              min="0.85"
              max="1.25"
              step="0.05"
              value={settings.powderLevel}
              onChange={(e) => onUpdateSettings({ powderLevel: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[#202434] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Fast Glide (0.85x)</span>
              <span>Standard (1.0x)</span>
              <span>High Friction (1.25x)</span>
            </div>
          </div>

          {/* 5. Aim Guideline Length */}
          <div className="p-3 rounded-xl bg-[#171923] border border-[#d4af37]/20 space-y-2">
            <label className="text-xs font-bold text-[#f3e5ab] flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#d4af37]" /> Aim Trajectory Guide Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'extended', 'full'] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onUpdateSettings({ aimGuidelineLength: len });
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase transition border ${
                    settings.aimGuidelineLength === len
                      ? 'bg-[#d4af37] text-[#1a0f0a] border-white font-bold shadow-md'
                      : 'bg-[#202434] text-gray-300 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Queens Count Rule Toggle */}
          <div className="p-3 rounded-xl bg-[#171923] border border-[#d4af37]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#ff4d6d]" />
              <div>
                <div className="text-xs font-bold text-[#f3e5ab]">Number of Red Queens</div>
                <div className="text-[10px] text-gray-400">2 Queens is the King's Strike Special Rule</div>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#202434] p-1 rounded-xl border border-gray-700">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ queensCount: 2 });
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  settings.queensCount === 2
                    ? 'bg-[#c9184a] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                2 Queens
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ queensCount: 1 });
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  settings.queensCount === 1
                    ? 'bg-[#d4af37] text-[#1a0f0a] shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                1 Queen
              </button>
            </div>
          </div>

          {/* 7. Turn Timer Toggle */}
          <div className="p-3 rounded-xl bg-[#171923] border border-[#d4af37]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ffdf73]" />
              <div>
                <div className="text-xs font-bold text-[#f3e5ab]">Shot Turn Timer (30s)</div>
                <div className="text-[10px] text-gray-400">Enforces turn time limit for fast action</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onUpdateSettings({ enableTurnTimer: !settings.enableTurnTimer });
              }}
              className={`w-11 h-6 rounded-full transition relative flex items-center p-0.5 ${
                settings.enableTurnTimer ? 'bg-[#2ecc71]' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enableTurnTimer ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#d4af37]/20 bg-[#171923]">
          <button
            id="settings-done-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl font-royal font-bold text-sm bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#1a0f0a] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
