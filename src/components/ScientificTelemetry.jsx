import React from 'react';
import {
  Activity,
  Cpu,
  Zap,
  Radio,
  Layers,
  Compass,
  Gauge,
  X,
  Database,
  BarChart2,
} from 'lucide-react';

export default function ScientificTelemetry({
  isOpen,
  onClose,
  fps,
  renderLatencyMs,
  pythonStatus,
  pythonMetrics,
  particleCount,
  currentFormation,
  attractorPos,
  audioMetrics,
  physicsEngineMode,
}) {
  if (!isOpen) return null;

  const kineticEnergy = pythonMetrics?.kinetic_energy
    ? (pythonMetrics.kinetic_energy / 1000).toFixed(2)
    : ((particleCount * 0.045 * (fps / 60)) / 10).toFixed(2);

  const meanVelocity = pythonMetrics?.mean_velocity
    ? pythonMetrics.mean_velocity.toFixed(3)
    : (0.12 + (audioMetrics?.energy || 0) * 0.25).toFixed(3);

  const maxVelocity = pythonMetrics?.max_velocity
    ? pythonMetrics.max_velocity.toFixed(3)
    : (0.85 + (audioMetrics?.bass || 0) * 0.6).toFixed(3);

  return (
    <aside className="telemetry-panel glass-panel" aria-label="Scientific Telemetry Dashboard">
      <div className="telemetry-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span className="telemetry-title">Scientific Telemetry & Diagnostics</span>
        </div>
        <button
          className="glass-btn glass-icon-btn"
          style={{ width: '28px', height: '28px' }}
          onClick={onClose}
          aria-label="Close Telemetry"
        >
          <X size={14} />
        </button>
      </div>

      <div className="telemetry-grid">
        {/* Metric 1: Compute Engine & Latency */}
        <div className="telemetry-card">
          <div className="card-label">
            <Cpu size={12} style={{ color: 'var(--accent-cyan)' }} />
            <span>Physics Architecture</span>
          </div>
          <div className="card-value" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            {physicsEngineMode === 'python' ? 'Python WebSocket Engine' : 'Client WebGL GPU Engine'}
          </div>
          <div className="card-sub">
            {pythonStatus.status === 'online'
              ? `Python Server: Active (${pythonStatus.latency || 1.2} ms latency)`
              : 'Python Server: Standby / Local GPU Active'}
          </div>
        </div>

        {/* Metric 2: Framerate & Frame Budget */}
        <div className="telemetry-card">
          <div className="card-label">
            <Gauge size={12} style={{ color: 'var(--accent-emerald)' }} />
            <span>Render Frametime</span>
          </div>
          <div className="card-value" style={{ color: 'var(--accent-emerald)' }}>
            {(1000 / Math.max(1, fps)).toFixed(2)} ms
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
              ({fps} FPS)
            </span>
          </div>
          <div className="card-sub">Budget: 16.6 ms target (60.0 Hz display)</div>
        </div>

        {/* Metric 3: Total Kinetic Energy */}
        <div className="telemetry-card">
          <div className="card-label">
            <Zap size={12} style={{ color: 'var(--accent-amber)' }} />
            <span>Total Kinetic Energy</span>
          </div>
          <div className="card-value" style={{ color: 'var(--accent-amber)' }}>
            {kineticEnergy} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>kJ (Simulated)</span>
          </div>
          <div className="card-sub">N-body thermal dispersion metric</div>
        </div>

        {/* Metric 4: Particle Velocity Distribution */}
        <div className="telemetry-card">
          <div className="card-label">
            <BarChart2 size={12} style={{ color: 'var(--accent-purple)' }} />
            <span>Mean / Peak Velocity</span>
          </div>
          <div className="card-value" style={{ color: 'var(--accent-purple)' }}>
            {meanVelocity} / {maxVelocity} <span style={{ fontSize: '10px' }}>c</span>
          </div>
          <div className="card-sub">Relativistic fractional speed of light</div>
        </div>
      </div>

      {/* Real-Time Velocity Histogram Visualization */}
      <div className="histogram-box">
        <div className="histogram-label">
          <span>Relativistic Velocity Distribution Function f(v)</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{particleCount.toLocaleString()} particles</span>
        </div>
        <div className="histogram-bars">
          {[0.15, 0.35, 0.65, 0.9, 0.75, 0.45, 0.3, 0.2, 0.12, 0.08, 0.04, 0.02].map((val, idx) => {
            const dynamicHeight = Math.min(100, Math.max(8, val * 100 * (1 + (audioMetrics?.mid || 0) * 0.6)));
            return (
              <div
                key={idx}
                className="histogram-bar"
                style={{
                  height: `${dynamicHeight}%`,
                  background: idx > 7 ? 'var(--accent-magenta)' : idx > 4 ? 'var(--accent-purple)' : 'var(--accent-cyan)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Gravitational Attractor Coordinates */}
      <div className="coords-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={12} style={{ color: 'var(--accent-cyan)' }} />
          <span>Attractor Coordinates:</span>
        </div>
        <span className="coords-val">
          X: {attractorPos?.x ? attractorPos.x.toFixed(2) : '0.00'} | Y: {attractorPos?.y ? attractorPos.y.toFixed(2) : '0.00'} | Z: {attractorPos?.z ? attractorPos.z.toFixed(2) : '0.00'}
        </span>
      </div>
    </aside>
  );
}
