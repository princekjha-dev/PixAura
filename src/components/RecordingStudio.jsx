import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Play,
  Square,
  FileSpreadsheet,
  FileCode,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { pythonBridge } from '../services/pythonBridge';

export default function RecordingStudio({
  isOpen,
  onClose,
  isRecording,
  onStartRecording,
  onStopRecording,
  recordedFramesCount,
  currentPositions,
  currentVelocities,
  particleCount,
  formationName,
  themeName,
}) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [datasetTitle, setDatasetTitle] = useState('Cosmic Simulation Run 01');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!currentPositions || currentPositions.length === 0) return;

    setIsExporting(true);
    setExportSuccess(false);

    const metadata = {
      title: datasetTitle,
      formation: formationName,
      theme: themeName,
      particle_count: particleCount,
      timestamp: new Date().toISOString(),
    };

    const success = await pythonBridge.exportDataset(
      Array.from(currentPositions.slice(0, 15000 * 3)), // up to 15,000 coordinates
      currentVelocities ? Array.from(currentVelocities.slice(0, 15000 * 3)) : [],
      exportFormat,
      metadata
    );

    setIsExporting(false);
    if (success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="modal-title">Scientific Dataset Recording Studio</h2>
          </div>
          <button className="glass-btn glass-icon-btn" onClick={onClose} aria-label="Close Studio">
            <X size={16} />
          </button>
        </div>

        {/* Live Recording Controller */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Trajectory Stream Capture
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {isRecording ? `Recording... (${recordedFramesCount} frames)` : 'Idle / Ready to record'}
            </div>
          </div>

          <button
            className={`glass-btn ${isRecording ? 'active' : ''}`}
            onClick={isRecording ? onStopRecording : onStartRecording}
            style={{
              borderColor: isRecording ? 'var(--accent-magenta)' : 'var(--border-glass)',
              boxShadow: isRecording ? '0 0 14px rgba(255, 0, 123, 0.35)' : 'none',
            }}
          >
            {isRecording ? (
              <>
                <Square size={14} style={{ color: 'var(--accent-magenta)' }} />
                <span>Stop Capture</span>
              </>
            ) : (
              <>
                <Play size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span>Start Capture</span>
              </>
            )}
          </button>
        </div>

        {/* Dataset Metadata Fields */}
        <div className="control-group" style={{ marginBottom: '18px' }}>
          <label className="control-label">Dataset Title / Experiment Tag</label>
          <input
            type="text"
            value={datasetTitle}
            onChange={(e) => setDatasetTitle(e.target.value)}
            className="custom-text-input"
            placeholder="e.g. Kerr_Black_Hole_Accretion_Run_01"
          />
        </div>

        {/* Export Formats */}
        <div className="control-group" style={{ marginBottom: '22px' }}>
          <label className="control-label">Export Format Specification</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              className={`glass-btn ${exportFormat === 'csv' ? 'active' : ''}`}
              style={{ justifyContent: 'center', padding: '10px' }}
              onClick={() => setExportFormat('csv')}
            >
              <FileSpreadsheet size={14} />
              <span>CSV Table</span>
            </button>

            <button
              className={`glass-btn ${exportFormat === 'json' ? 'active' : ''}`}
              style={{ justifyContent: 'center', padding: '10px' }}
              onClick={() => setExportFormat('json')}
            >
              <FileCode size={14} />
              <span>JSON Stream</span>
            </button>

            <button
              className={`glass-btn ${exportFormat === 'npy' ? 'active' : ''}`}
              style={{ justifyContent: 'center', padding: '10px' }}
              onClick={() => setExportFormat('npy')}
            >
              <Layers size={14} />
              <span>NumPy .NPY</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="glass-btn active"
          onClick={handleExport}
          disabled={isExporting}
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px' }}
        >
          {exportSuccess ? (
            <>
              <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
              <span>Dataset Exported Successfully</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>{isExporting ? 'Compiling Dataset...' : `Export Scientific ${exportFormat.toUpperCase()} Dataset`}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
