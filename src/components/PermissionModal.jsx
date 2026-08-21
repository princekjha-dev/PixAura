import React from 'react';
import { Camera, MousePointer, Sparkles, ShieldCheck } from 'lucide-react';

export default function PermissionModal({ onEnableCamera, onSkipToMouse }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(112, 0, 255, 0.2))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: 'var(--glow-cyan)',
          }}
        >
          <Camera size={30} style={{ color: 'var(--accent-cyan)' }} />
        </div>

        <h2 className="modal-title" style={{ marginBottom: '12px' }}>
          Interactive Hand Tracking
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
          PixAura uses real-time computer vision to let you manipulate 25,000+ cosmic particles with natural hand gestures. All processing is computed locally in your browser.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            className="glass-btn active"
            onClick={onEnableCamera}
            style={{
              padding: '14px',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            <Camera size={16} />
            <span>Enable Camera Tracking</span>
          </button>

          <button
            className="glass-btn"
            onClick={onSkipToMouse}
            style={{
              padding: '12px',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <MousePointer size={15} />
            <span>Continue with Mouse / Touch</span>
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '24px',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <ShieldCheck size={13} />
          <span>Camera stream is private and never recorded or uploaded</span>
        </div>
      </div>
    </div>
  );
}
