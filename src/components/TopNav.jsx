import React from 'react';
import {
  Sparkles,
  Camera,
  CameraOff,
  MousePointer,
  HelpCircle,
  Sliders,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  Activity,
  Database,
  Cpu,
} from 'lucide-react';

export default function TopNav({
  cameraEnabled,
  handDetected,
  fps,
  audioMode,
  audioMetrics,
  pythonStatus,
  isTelemetryOpen,
  onToggleTelemetry,
  onOpenRecordingStudio,
  onCycleAudioMode,
  onToggleCamera,
  onOpenHelp,
  onOpenDrawer,
  onResetView,
  onTakeScreenshot,
}) {
  return (
    <header className="top-nav">
      {/* Brand & Scientific Model Badge */}
      <div className="brand-badge glass-panel">
        <div className="brand-logo-icon">
          <Sparkles size={16} color="#ffffff" />
        </div>
        <span className="brand-title">PixAura Astrophysics Suite</span>
        <span className="brand-version">v3.0 Python+WebGL</span>
      </div>

      {/* Status Cluster & Scientific Action Controls */}
      <div className="status-cluster">
        {/* Python Compute Server Status */}
        <div className="status-pill glass-panel" title="Python FastAPI Compute Engine Connection Status">
          <div
            className="status-dot"
            style={{
              background: pythonStatus?.status === 'online' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              boxShadow: pythonStatus?.status === 'online' ? '0 0 8px var(--accent-emerald)' : 'none',
            }}
          />
          <Cpu size={13} style={{ color: pythonStatus?.status === 'online' ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            {pythonStatus?.status === 'online' ? `PY-SRV (${pythonStatus.latency || 1.2}ms)` : 'PY-OFFLINE'}
          </span>
        </div>

        {/* Audio Reactivity Mode Button & Live Meter */}
        <button
          className={`glass-btn ${audioMode !== 'off' ? 'active' : ''}`}
          onClick={onCycleAudioMode}
          title={`Audio Reactivity: ${audioMode.toUpperCase()} (Click to cycle Off / Synth Beat / Mic)`}
          aria-label="Cycle Audio Mode"
        >
          {audioMode === 'synth' && <Volume2 size={14} style={{ color: 'var(--accent-cyan)' }} />}
          {audioMode === 'mic' && <Mic size={14} style={{ color: 'var(--accent-magenta)' }} />}
          {audioMode === 'off' && <VolumeX size={14} style={{ color: 'var(--text-muted)' }} />}

          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {audioMode === 'synth' ? 'Cosmic Beats' : audioMode === 'mic' ? 'Live Mic' : 'Audio Off'}
          </span>

          {audioMode !== 'off' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '2px',
                height: '12px',
                marginLeft: '3px',
              }}
            >
              <div
                style={{
                  width: '2.5px',
                  height: `${Math.max(2, (audioMetrics?.bass || 0) * 12)}px`,
                  background: 'var(--accent-cyan)',
                  borderRadius: '1px',
                }}
              />
              <div
                style={{
                  width: '2.5px',
                  height: `${Math.max(2, (audioMetrics?.mid || 0) * 12)}px`,
                  background: 'var(--accent-purple)',
                  borderRadius: '1px',
                }}
              />
              <div
                style={{
                  width: '2.5px',
                  height: `${Math.max(2, (audioMetrics?.treble || 0) * 12)}px`,
                  background: 'var(--accent-magenta)',
                  borderRadius: '1px',
                }}
              />
            </div>
          )}
        </button>

        {/* Mode Status Pill */}
        <div className="status-pill glass-panel">
          <div
            className={`status-dot ${
              cameraEnabled
                ? handDetected
                  ? 'tracking'
                  : 'active'
                : ''
            }`}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {cameraEnabled ? (
              <>
                <Camera size={13} style={{ color: 'var(--accent-cyan)' }} />
                <span>{handDetected ? 'Gravity Tracking Active' : 'Scanning Hand...'}</span>
              </>
            ) : (
              <>
                <MousePointer size={13} style={{ color: 'var(--text-secondary)' }} />
                <span>Mouse / Touch Mode</span>
              </>
            )}
          </span>
        </div>

        {/* Framerate / FPS Pill */}
        <div className="status-pill glass-panel" style={{ fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{fps}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>FPS</span>
        </div>

        {/* Scientific Telemetry Panel Button */}
        <button
          className={`glass-btn glass-icon-btn ${isTelemetryOpen ? 'active' : ''}`}
          onClick={onToggleTelemetry}
          title="Toggle Scientific Telemetry & Diagnostics (Key: D)"
          aria-label="Toggle Telemetry"
        >
          <Activity size={16} />
        </button>

        {/* Dataset Recording Studio Button */}
        <button
          className="glass-btn glass-icon-btn"
          onClick={onOpenRecordingStudio}
          title="Scientific Trajectory Recording & Dataset Studio (Key: X)"
          aria-label="Open Recording Studio"
        >
          <Database size={16} />
        </button>

        {/* 4K Screenshot Export Button */}
        <button
          className="glass-btn glass-icon-btn"
          onClick={onTakeScreenshot}
          title="Export 4K Scientific Screenshot"
          aria-label="Save Screenshot"
        >
          <Download size={16} />
        </button>

        {/* Camera Tracking Toggle */}
        <button
          className={`glass-btn glass-icon-btn ${cameraEnabled ? 'active' : ''}`}
          onClick={onToggleCamera}
          title={cameraEnabled ? 'Switch to Mouse Mode' : 'Enable Camera Tracking'}
          aria-label="Toggle Camera Mode"
        >
          {cameraEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
        </button>

        {/* Reset 3D Space Button */}
        <button
          className="glass-btn glass-icon-btn"
          onClick={onResetView}
          title="Reset 3D Coordinates (Key: R)"
          aria-label="Reset View"
        >
          <RotateCcw size={16} />
        </button>

        {/* Help & Guide Modal */}
        <button
          className="glass-btn glass-icon-btn"
          onClick={onOpenHelp}
          title="Astrophysics & Controls Guide (Key: ?)"
          aria-label="Open Help"
        >
          <HelpCircle size={16} />
        </button>

        {/* Parameters Drawer */}
        <button
          className="glass-btn glass-icon-btn"
          onClick={onOpenDrawer}
          title="Astrophysical Parameters & Physics Drawer (Key: H)"
          aria-label="Open Settings Drawer"
        >
          <Sliders size={16} />
        </button>
      </div>
    </header>
  );
}
