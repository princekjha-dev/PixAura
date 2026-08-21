import React from 'react';
import { Layers, Palette, Zap, Sparkles } from 'lucide-react';
import { SHAPE_PRESETS, COLOR_PALETTES } from '../constants/palettes';

export default function BottomDock({
  currentShapeIndex,
  onSelectShape,
  currentPaletteIndex,
  onSelectPalette,
  onTriggerShockwave,
}) {
  return (
    <nav className="bottom-dock glass-panel" aria-label="Formation and Theme Selector">
      {/* Shape Formations */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            paddingRight: '6px',
            borderRight: '1px solid var(--border-subtle)',
            marginRight: '4px',
          }}
        >
          <Layers size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span>Form</span>
        </div>

        {SHAPE_PRESETS.map((shape, idx) => (
          <button
            key={shape.id}
            className={`glass-btn dock-item ${currentShapeIndex === idx ? 'active' : ''}`}
            onClick={() => onSelectShape(idx)}
            title={shape.description}
          >
            {shape.name}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '22px', background: 'var(--border-glass)', margin: '0 6px' }} />

      {/* Quick Color Palette Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            paddingRight: '6px',
            borderRight: '1px solid var(--border-subtle)',
            marginRight: '4px',
          }}
        >
          <Palette size={13} style={{ color: 'var(--accent-magenta)' }} />
          <span>Theme</span>
        </div>

        <button
          className="glass-btn dock-item"
          onClick={() => onSelectPalette((currentPaletteIndex + 1) % COLOR_PALETTES.length)}
          title="Cycle Color Palette (Key: P)"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLOR_PALETTES[currentPaletteIndex].colors.join(', ')})`,
              display: 'inline-block',
            }}
          />
          <span>{COLOR_PALETTES[currentPaletteIndex].name}</span>
        </button>
      </div>

      {/* Big Bang Shockwave Burst Action */}
      <button
        className="glass-btn dock-item"
        onClick={onTriggerShockwave}
        title="Fire Gravitational Shockwave Burst (Key: S, Open Palm, or Click)"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 0, 123, 0.2), rgba(112, 0, 255, 0.2))',
          borderColor: 'rgba(255, 0, 123, 0.4)',
          boxShadow: '0 0 14px rgba(255, 0, 123, 0.25)',
        }}
      >
        <Zap size={13} style={{ color: 'var(--accent-magenta)' }} />
        <span>Shockwave</span>
      </button>
    </nav>
  );
}
