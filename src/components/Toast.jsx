import React from 'react';
import { Info, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast-item glass-panel">
          <Zap size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
