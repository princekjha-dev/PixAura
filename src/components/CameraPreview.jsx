import React, { useState } from 'react';
import { Camera, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

export default function CameraPreview({
  canvasRef,
  visible,
  onToggleVisible,
  handDetected,
  confidence,
}) {
  const [minimized, setMinimized] = useState(false);

  if (!visible) return null;

  return (
    <div className={`camera-box glass-panel ${minimized ? 'minimized' : ''}`}>
      <div className="camera-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Camera size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span>Tracking Feed</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="glass-btn"
            style={{ padding: '3px 6px', borderRadius: '4px' }}
            onClick={() => setMinimized(!minimized)}
            title={minimized ? 'Expand View' : 'Minimize View'}
            aria-label="Toggle Minimize"
          >
            {minimized ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            className="glass-btn"
            style={{ padding: '3px 6px', borderRadius: '4px' }}
            onClick={onToggleVisible}
            title="Hide Camera Preview (Key: C)"
            aria-label="Hide Preview"
          >
            <EyeOff size={12} />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="camera-canvas-wrapper">
          <canvas ref={canvasRef} className="camera-canvas" />
          <div className="camera-overlay-stats">
            {handDetected
              ? `Tracked (${Math.round((confidence || 0.9) * 100)}%)`
              : 'Scanning...'}
          </div>
        </div>
      )}
    </div>
  );
}
