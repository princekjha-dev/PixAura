import React from 'react';
import {
  Minimize2,
  CircleDot,
  Hand,
  Compass,
  Palette,
  RotateCw,
  Activity,
  Move,
  Zap,
} from 'lucide-react';
import { GESTURE_DEFINITIONS } from '../constants/gestures';

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

export default function GestureHUD({ gesture, handDetected, confidence }) {
  const current = GESTURE_DEFINITIONS.find((g) => g.id === gesture);

  if (!handDetected || !current || gesture === 'none') {
    return null;
  }

  const IconComponent = ICON_MAP[current.iconName] || Move;

  return (
    <div className="gesture-hud glass-panel">
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(112, 0, 255, 0.25))',
          color: 'var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-cyan)',
        }}
      >
        <IconComponent size={15} />
      </div>

      <span style={{ color: '#fff', fontWeight: 700, letterSpacing: '0.3px' }}>
        {current.name}
      </span>
      <span style={{ color: 'var(--text-secondary)' }}>• {current.action}</span>
      <span className="gesture-tag">{current.tag}</span>
    </div>
  );
}
