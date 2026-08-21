import React from 'react';
import {
  X,
  Sliders,
  Palette,
  Layers,
  RotateCw,
  Activity,
  Zap,
  Download,
  RotateCcw,
  Volume2,
  Mic,
  VolumeX,
  Wind,
  Magnet,
  Cpu,
  Orbit,
  Radio,
} from 'lucide-react';
import { COLOR_PALETTES, SHAPE_PRESETS } from '../constants/palettes';

export default function ControlDrawer({
  isOpen,
  onClose,
  physicsEngineMode,
  onChangePhysicsEngineMode,
  particleCount,
  onChangeParticleCount,
  paletteIndex,
  onSelectPalette,
  shapeIndex,
  onSelectShape,
  autoRotate,
  onToggleAutoRotate,
  waveActive,
  onToggleWave,
  twistAmount,
  onChangeTwist,
  expandFactor,
  onChangeExpand,
  turbulenceIntensity,
  onChangeTurbulence,
  gravityPull,
  onChangeGravityPull,
  audioMode,
  onChangeAudioMode,
  kerrSpin,
  onChangeKerrSpin,
  onResetView,
  onTakeScreenshot,
}) {
  return (
    <>
      {/* Backdrop */}
      <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />

      {/* Slide-out Panel */}
      <div className={`drawer-panel ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="drawer-title">Astrophysics Compute Engine</h2>
          </div>
          <button className="glass-btn glass-icon-btn" onClick={onClose} aria-label="Close Settings Drawer">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Architecture Selector: Client GPU vs Python Server */}
          <div className="control-group">
            <label className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>Simulation Backend</span>
              </span>
              <span className="control-val">{physicsEngineMode.toUpperCase()}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                className={`glass-btn ${physicsEngineMode === 'client' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={() => onChangePhysicsEngineMode('client')}
              >
                <span>WebGL 3D GPU</span>
              </button>

              <button
                className={`glass-btn ${physicsEngineMode === 'python' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={() => onChangePhysicsEngineMode('python')}
              >
                <span>Python WebSocket</span>
              </button>
            </div>
          </div>

          {/* Relativistic Kerr Spin Parameter a/M */}
          <div className="control-group">
            <label className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Orbit size={13} style={{ color: 'var(--accent-magenta)' }} />
                <span>Kerr Dimensionless Spin (a/M)</span>
              </span>
              <span className="control-val">{kerrSpin.toFixed(3)}</span>
            </label>
            <input
              type="range"
              min="0.0"
              max="0.998"
              step="0.01"
              value={kerrSpin}
              onChange={(e) => onChangeKerrSpin(Number(e.target.value))}
              className="custom-slider"
            />
          </div>

          {/* Audio Reactivity Mode */}
          <div className="control-group">
            <label className="control-label">
              <span>Audio Reactivity</span>
              <span className="control-val">{audioMode.toUpperCase()}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                className={`glass-btn ${audioMode === 'off' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '8px' }}
                onClick={() => onChangeAudioMode('off')}
              >
                <VolumeX size={13} />
                <span>Off</span>
              </button>
              <button
                className={`glass-btn ${audioMode === 'synth' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '8px' }}
                onClick={() => onChangeAudioMode('synth')}
              >
                <Volume2 size={13} />
                <span>Beats</span>
              </button>
              <button
                className={`glass-btn ${audioMode === 'mic' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '8px' }}
                onClick={() => onChangeAudioMode('mic')}
              >
                <Mic size={13} />
                <span>Live Mic</span>
              </button>
            </div>
          </div>

          {/* Fluid Curl Noise Turbulence */}
          <div className="control-group">
            <label className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wind size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>3D Curl Noise Turbulence</span>
              </span>
              <span className="control-val">{turbulenceIntensity.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={turbulenceIntensity}
              onChange={(e) => onChangeTurbulence(Number(e.target.value))}
              className="custom-slider"
            />
          </div>

          {/* Gravitational Attractor Force */}
          <div className="control-group">
            <label className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Magnet size={13} style={{ color: 'var(--accent-magenta)' }} />
                <span>Gravitational Force Constant (G)</span>
              </span>
              <span className="control-val">{gravityPull.toFixed(2)}G</span>
            </label>
            <input
              type="range"
              min="0.2"
              max="3.5"
              step="0.1"
              value={gravityPull}
              onChange={(e) => onChangeGravityPull(Number(e.target.value))}
              className="custom-slider"
            />
          </div>

          {/* Formations Architecture */}
          <div className="control-group">
            <label className="control-label">
              <span>Astrophysical Models</span>
              <span className="control-val">{SHAPE_PRESETS[shapeIndex].name}</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SHAPE_PRESETS.map((shape, idx) => (
                <button
                  key={shape.id}
                  className={`glass-btn ${shapeIndex === idx ? 'active' : ''}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => onSelectShape(idx)}
                >
                  <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{shape.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {shape.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes Grid */}
          <div className="control-group">
            <label className="control-label">
              <span>Color Themes</span>
              <span className="control-val">{COLOR_PALETTES[paletteIndex].name}</span>
            </label>
            <div className="palette-grid">
              {COLOR_PALETTES.map((pal, idx) => (
                <div
                  key={pal.id}
                  className={`palette-card ${paletteIndex === idx ? 'active' : ''}`}
                  onClick={() => onSelectPalette(idx)}
                >
                  <div
                    className="palette-preview"
                    style={{
                      background: `linear-gradient(90deg, ${pal.colors.join(', ')})`,
                    }}
                  />
                  <div className="palette-name">{pal.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Particle Density */}
          <div className="control-group">
            <label className="control-label">
              <span>Particle Density</span>
              <span className="control-val">{particleCount.toLocaleString()} units</span>
            </label>
            <input
              type="range"
              min="10000"
              max="50000"
              step="2000"
              value={particleCount}
              onChange={(e) => onChangeParticleCount(Number(e.target.value))}
              className="custom-slider"
            />
          </div>

          {/* Scale & Expansion */}
          <div className="control-group">
            <label className="control-label">
              <span>Expansion Scale</span>
              <span className="control-val">{expandFactor.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.3"
              max="3.5"
              step="0.05"
              value={expandFactor}
              onChange={(e) => onChangeExpand(Number(e.target.value))}
              className="custom-slider"
            />
          </div>

          {/* Space-Time Twist Torque */}
          <div className="control-group">
            <label className="control-label">
              <span>Space-Time Vortex Torque</span>
              <span className="control-val">{twistAmount.toFixed(2)} rad</span>
            </label>
            <input
              type="range"
              min="-3.5"
              max="3.5"
              step="0.1"
              value={twistAmount}
              onChange={(e) => onChangeTwist(Number(e.target.value))}
              className="custom-slider"
            />
          </div>

          {/* Dynamic Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className={`glass-btn ${autoRotate ? 'active' : ''}`}
              onClick={onToggleAutoRotate}
              style={{ justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCw size={14} />
                <span>Autonomous Celestial Orbit</span>
              </span>
              <span className="control-val">{autoRotate ? 'ENABLED' : 'OFF'}</span>
            </button>

            <button
              className={`glass-btn ${waveActive ? 'active' : ''}`}
              onClick={onToggleWave}
              style={{ justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={14} />
                <span>Harmonic Wave Oscillation</span>
              </span>
              <span className="control-val">{waveActive ? 'ENABLED' : 'OFF'}</span>
            </button>
          </div>

          {/* Global Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="glass-btn" onClick={onTakeScreenshot} style={{ flex: 1, justifyContent: 'center' }}>
              <Download size={14} />
              <span>Capture 4K Image</span>
            </button>

            <button className="glass-btn" onClick={onResetView} style={{ flex: 1, justifyContent: 'center' }}>
              <RotateCcw size={14} />
              <span>Reset Scene</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
