import React from 'react';
import {
  X,
  Minimize2,
  CircleDot,
  Hand,
  Compass,
  Palette,
  RotateCw,
  Activity,
  Move,
  Keyboard,
  MousePointer,
} from 'lucide-react';
import { GESTURE_DEFINITIONS, KEYBOARD_SHORTCUTS } from '../constants/gestures';

const ICON_MAP = {
  Minimize2,
  CircleDot,
  Hand,
  Compass,
  Palette,
  RotateCw,
  Activity,
  Move,
};

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Controls & Shortcuts Guide</h2>
          <button
            className="glass-btn glass-icon-btn"
            onClick={onClose}
            aria-label="Close Guide"
          >
            <X size={16} />
          </button>
        </div>

        {/* Section 1: Hand Gestures */}
        <div>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Hand size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Hand Gesture Tracking (Camera Mode)</span>
          </div>

          <div className="grid-rows">
            {GESTURE_DEFINITIONS.map((g) => {
              const IconComp = ICON_MAP[g.iconName] || Move;
              return (
                <div key={g.id} className="guide-row">
                  <div className="guide-icon-wrap">
                    <IconComp size={18} />
                  </div>
                  <div className="guide-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="guide-title">{g.name}</span>
                      <span className="gesture-tag">{g.action}</span>
                    </div>
                    <p className="guide-desc">{g.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Keyboard Shortcuts */}
        <div>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Keyboard size={14} style={{ color: 'var(--accent-purple)' }} />
            <span>Keyboard Shortcuts</span>
          </div>

          <div className="grid-rows">
            {KEYBOARD_SHORTCUTS.map((s) => (
              <div key={s.key} className="guide-row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className="guide-title">{s.action}</div>
                  <div className="guide-desc">{s.description}</div>
                </div>
                <kbd>{s.key}</kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Mouse & Touch Controls */}
        <div>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MousePointer size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Mouse & Touch Fallback</span>
          </div>

          <div className="grid-rows">
            <div className="guide-row">
              <div className="guide-details">
                <div className="guide-title">Drag / Swipe</div>
                <p className="guide-desc">Rotate the 3D particle universe in spherical space</p>
              </div>
            </div>
            <div className="guide-row">
              <div className="guide-details">
                <div className="guide-title">Scroll Wheel / Pinch Zoom</div>
                <p className="guide-desc">Zoom camera distance smoothly towards or away from cluster</p>
              </div>
            </div>
            <div className="guide-row">
              <div className="guide-details">
                <div className="guide-title">Click / Tap</div>
                <p className="guide-desc">Trigger instant outward shockwave blast</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          className="glass-btn"
          onClick={onClose}
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          <span>Dismiss Guide</span>
        </button>
      </div>
    </div>
  );
}
