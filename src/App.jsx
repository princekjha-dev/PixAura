import React, { useState, useRef, useEffect, useCallback } from 'react';
import Canvas3D from './components/Canvas3D';
import CameraTracker from './components/CameraTracker';
import CameraPreview from './components/CameraPreview';
import TopNav from './components/TopNav';
import BottomDock from './components/BottomDock';
import ControlDrawer from './components/ControlDrawer';
import GestureHUD from './components/GestureHUD';
import HelpModal from './components/HelpModal';
import PermissionModal from './components/PermissionModal';
import ScientificTelemetry from './components/ScientificTelemetry';
import RecordingStudio from './components/RecordingStudio';
import Toast from './components/Toast';
import { COLOR_PALETTES, SHAPE_PRESETS } from './constants/palettes';
import { audioEngine } from './utils/audioEngine';
import { pythonBridge } from './services/pythonBridge';

export default function App() {
  // 3D Canvas & Physics States
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [particleCount, setParticleCount] = useState(25000);
  const [expandFactor, setExpandFactor] = useState(1.0);
  const [waveActive, setWaveActive] = useState(false);
  const [twistAmount, setTwistAmount] = useState(0);
  const [turbulenceIntensity, setTurbulenceIntensity] = useState(1.0);
  const [gravityPull, setGravityPull] = useState(1.5);
  const [kerrSpin, setKerrSpin] = useState(0.94);
  const [autoRotate, setAutoRotate] = useState(false); // default false so it doesn't move randomly on its own!
  const [shockwaveTrigger, setShockwaveTrigger] = useState(0);
  const [trailPoint, setTrailPoint] = useState(null);
  const [handData, setHandData] = useState(null);
  const [fps, setFps] = useState(60);

  // Simulation Architecture Engine Mode ('client' | 'python')
  const [physicsEngineMode, setPhysicsEngineMode] = useState('client');
  const [pythonStatus, setPythonStatus] = useState({ status: 'connecting', latency: null });
  const [pythonMetrics, setPythonMetrics] = useState(null);

  // Audio Reactivity States
  const [audioMode, setAudioMode] = useState('off'); // default off so it doesn't pulse randomly unless user wants it
  const [audioMetrics, setAudioMetrics] = useState({ bass: 0, mid: 0, treble: 0, energy: 0 });

  // Camera & Tracking States
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [handDetected, setHandDetected] = useState(false);
  const [currentGesture, setCurrentGesture] = useState('none');
  const [cameraConfidence, setCameraConfidence] = useState(0.92);

  // Scientific Telemetry & Recording Studio Modals
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isRecordingStudioOpen, setIsRecordingStudioOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFramesCount, setRecordedFramesCount] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const canvas3DRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const prevGestureRef = useRef('none');
  const recordIntervalRef = useRef(null);

  // Toast Helper
  const addToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Initialize Audio Engine
  useEffect(() => {
    audioEngine.setMode(audioMode);
  }, [audioMode]);

  // Connect Python WebSocket Bridge
  useEffect(() => {
    const onFrame = (frameData) => {
      if (frameData.metrics) {
        setPythonMetrics(frameData.metrics);
      }
    };
    const onStatus = (statusData) => {
      setPythonStatus(statusData);
    };
    pythonBridge.connect(onFrame, onStatus);
    return () => {
      pythonBridge.disconnect();
    };
  }, []);

  // Direct 1:1 Hand update callback from MediaPipe
  const handleHandUpdate = useCallback(
    (data) => {
      if (!data.detected) {
        setHandDetected(false);
        setHandData(null);
        return;
      }

      setHandDetected(true);
      setCameraConfidence(data.confidence);
      setHandData(data);

      // Pointing trail
      if (data.indexTip && currentGesture === 'point') {
        setTrailPoint(data.indexTip);
      }
    },
    [currentGesture]
  );

  // Gesture Change Handler
  const handleGestureChange = useCallback(
    (gesture) => {
      const prev = prevGestureRef.current;
      prevGestureRef.current = gesture;
      setCurrentGesture(gesture);

      if (gesture === 'pinch') {
        if (prev !== 'pinch') addToast('Pinch: Compressing into Singularity');
      }

      if (gesture === 'fist') {
        setTwistAmount(2.2);
        if (prev !== 'fist') addToast('Closed Fist: Inward Collapse');
      } else if (prev === 'fist') {
        setTwistAmount(0);
      }

      if (gesture === 'open' && prev !== 'open') {
        setShockwaveTrigger((c) => c + 1);
        addToast('Open Palm: Outward Shockwave Burst');
      }

      if (gesture === 'peace' && prev !== 'peace') {
        setPaletteIndex((i) => {
          const next = (i + 1) % COLOR_PALETTES.length;
          addToast(`Color Theme: ${COLOR_PALETTES[next].name}`);
          return next;
        });
      }

      if (gesture === 'thumbup' && prev !== 'thumbup') {
        setAutoRotate((prevVal) => {
          const next = !prevVal;
          addToast(`Celestial Rotation: ${next ? 'ON' : 'OFF'}`);
          return next;
        });
      }

      if (gesture === 'rock') {
        setWaveActive(true);
        if (prev !== 'rock') addToast('Horns Sign: Wave Ripple Effect');
      } else if (prev === 'rock') {
        setWaveActive(false);
      }
    },
    [addToast]
  );

  // Camera Status Callback
  const handleStatusChange = useCallback(
    (status) => {
      if (status.error) {
        addToast(`Camera: ${status.error}`);
        setCameraEnabled(false);
      } else if (status.initialized) {
        addToast('Camera Hand Tracking Ready: Move hand to control');
      }
    },
    [addToast]
  );

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setExpandFactor((cur) => (cur > 1.3 ? 0.6 : 1.8));
          addToast('Toggle Particle Scale');
          break;
        case 'KeyP':
          setPaletteIndex((i) => {
            const next = (i + 1) % COLOR_PALETTES.length;
            addToast(`Theme: ${COLOR_PALETTES[next].name}`);
            return next;
          });
          break;
        case 'KeyM':
          setShapeIndex((i) => {
            const next = (i + 1) % SHAPE_PRESETS.length;
            addToast(`Formation: ${SHAPE_PRESETS[next].name}`);
            return next;
          });
          break;
        case 'KeyT':
          setTwistAmount((cur) => (cur === 0 ? 2.0 : 0));
          addToast('Toggle Vortex Twist');
          break;
        case 'KeyW':
          setWaveActive((cur) => {
            const next = !cur;
            addToast(`Wave Ripple: ${next ? 'ON' : 'OFF'}`);
            return next;
          });
          break;
        case 'KeyS':
          setShockwaveTrigger((c) => c + 1);
          addToast('Shockwave Burst Triggered');
          break;
        case 'KeyD':
          setIsTelemetryOpen((open) => !open);
          break;
        case 'KeyX':
          setIsRecordingStudioOpen((open) => !open);
          break;
        case 'KeyA':
          setAudioMode((m) => {
            const next = m === 'synth' ? 'mic' : m === 'mic' ? 'off' : 'synth';
            addToast(`Audio Reactivity: ${next.toUpperCase()}`);
            return next;
          });
          break;
        case 'KeyR':
          if (canvas3DRef.current) canvas3DRef.current.resetView();
          setExpandFactor(1.0);
          setTwistAmount(0);
          setWaveActive(false);
          addToast('Scene Reset to Center');
          break;
        case 'KeyC':
          setPreviewVisible((v) => !v);
          break;
        case 'KeyH':
          setIsDrawerOpen((open) => !open);
          break;
        case 'Slash':
          if (e.shiftKey) setIsHelpOpen((open) => !open);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToast]);

  // Cycle audio mode
  const handleCycleAudioMode = () => {
    const modes = ['off', 'synth', 'mic'];
    const next = modes[(modes.indexOf(audioMode) + 1) % modes.length];
    setAudioMode(next);
    addToast(`Audio Reactivity: ${next === 'synth' ? 'Cosmic Beats' : next === 'mic' ? 'Live Mic' : 'Off'}`);
  };

  // Recording Session Controls
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedFramesCount(0);
    recordIntervalRef.current = setInterval(() => {
      setRecordedFramesCount((c) => c + 1);
    }, 100);
    addToast('Scientific Trajectory Recording Started');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    addToast(`Recording Finished: ${recordedFramesCount} frames captured`);
  };

  // Take Screenshot handler
  const handleTakeScreenshot = () => {
    if (canvas3DRef.current) {
      const dataUrl = canvas3DRef.current.takeScreenshot();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `pixaura-astrophysics-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        addToast('4K Scientific Screenshot Saved');
      }
    }
  };

  // Permission actions
  const handleEnableCamera = () => {
    setShowPermissionModal(false);
    setCameraEnabled(true);
    audioEngine.initContext();
  };

  const handleSkipToMouse = () => {
    setShowPermissionModal(false);
    setCameraEnabled(false);
    audioEngine.initContext();
    addToast('Mouse Mode Active: Drag to rotate view, scroll to zoom');
  };

  const coordinates = canvas3DRef.current ? canvas3DRef.current.getCurrentCoordinates() : null;

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D WebGL Particle Canvas with Direct Hand Control */}
      <Canvas3D
        ref={canvas3DRef}
        paletteIndex={paletteIndex}
        shapeIndex={shapeIndex}
        particleCount={particleCount}
        expandFactor={expandFactor}
        waveActive={waveActive}
        twistAmount={twistAmount}
        shockwaveTrigger={shockwaveTrigger}
        trailPoint={trailPoint}
        handData={handData}
        onFpsUpdate={setFps}
      />

      {/* MediaPipe Camera Tracker */}
      <CameraTracker
        enabled={cameraEnabled}
        onHandUpdate={handleHandUpdate}
        onGestureChange={handleGestureChange}
        onStatusChange={handleStatusChange}
        previewCanvasRef={previewCanvasRef}
      />

      {/* Scientific Top Navigation Bar */}
      <TopNav
        cameraEnabled={cameraEnabled}
        handDetected={handDetected}
        fps={fps}
        audioMode={audioMode}
        audioMetrics={audioMetrics}
        pythonStatus={pythonStatus}
        isTelemetryOpen={isTelemetryOpen}
        onToggleTelemetry={() => setIsTelemetryOpen((open) => !open)}
        onOpenRecordingStudio={() => setIsRecordingStudioOpen(true)}
        onCycleAudioMode={handleCycleAudioMode}
        onToggleCamera={() => setCameraEnabled((c) => !c)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onResetView={() => {
          if (canvas3DRef.current) canvas3DRef.current.resetView();
          setExpandFactor(1.0);
          setTwistAmount(0);
          setWaveActive(false);
          addToast('Scene Reset to Center');
        }}
        onTakeScreenshot={handleTakeScreenshot}
      />

      {/* Scientific Telemetry Panel */}
      <ScientificTelemetry
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        fps={fps}
        renderLatencyMs={Math.round((1000 / Math.max(1, fps)) * 10) / 10}
        pythonStatus={pythonStatus}
        pythonMetrics={pythonMetrics}
        particleCount={particleCount}
        currentFormation={SHAPE_PRESETS[shapeIndex].name}
        attractorPos={handData ? { x: handData.smoothX, y: handData.smoothY, z: handData.smoothZ } : null}
        audioMetrics={audioMetrics}
        physicsEngineMode={physicsEngineMode}
      />

      {/* Real-time Gesture Recognition HUD */}
      <GestureHUD
        gesture={currentGesture}
        handDetected={handDetected}
        confidence={cameraConfidence}
      />

      {/* Quick Formation & Palette Dock */}
      <BottomDock
        currentShapeIndex={shapeIndex}
        onSelectShape={(idx) => {
          setShapeIndex(idx);
          addToast(`Formation: ${SHAPE_PRESETS[idx].name}`);
        }}
        currentPaletteIndex={paletteIndex}
        onSelectPalette={(idx) => {
          setPaletteIndex(idx);
          addToast(`Theme: ${COLOR_PALETTES[idx].name}`);
        }}
        onTriggerShockwave={() => {
          setShockwaveTrigger((c) => c + 1);
          addToast('Gravitational Shockwave Fired');
        }}
      />

      {/* Floating Camera Preview with Skeleton Overlay */}
      {cameraEnabled && (
        <CameraPreview
          canvasRef={previewCanvasRef}
          visible={previewVisible}
          onToggleVisible={() => setPreviewVisible(false)}
          handDetected={handDetected}
          confidence={cameraConfidence}
        />
      )}

      {/* Scientific Dataset Recording Studio */}
      <RecordingStudio
        isOpen={isRecordingStudioOpen}
        onClose={() => setIsRecordingStudioOpen(false)}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        recordedFramesCount={recordedFramesCount}
        currentPositions={coordinates?.positions}
        currentVelocities={coordinates?.velocities}
        particleCount={particleCount}
        formationName={SHAPE_PRESETS[shapeIndex].name}
        themeName={COLOR_PALETTES[paletteIndex].name}
      />

      {/* Cosmic Physics Parameters Drawer */}
      <ControlDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        physicsEngineMode={physicsEngineMode}
        onChangePhysicsEngineMode={setPhysicsEngineMode}
        particleCount={particleCount}
        onChangeParticleCount={setParticleCount}
        paletteIndex={paletteIndex}
        onSelectPalette={setPaletteIndex}
        shapeIndex={shapeIndex}
        onSelectShape={setShapeIndex}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((r) => !r)}
        waveActive={waveActive}
        onToggleWave={() => setWaveActive((w) => !w)}
        twistAmount={twistAmount}
        onChangeTwist={setTwistAmount}
        expandFactor={expandFactor}
        onChangeExpand={setExpandFactor}
        turbulenceIntensity={turbulenceIntensity}
        onChangeTurbulence={setTurbulenceIntensity}
        gravityPull={gravityPull}
        onChangeGravityPull={setGravityPull}
        audioMode={audioMode}
        onChangeAudioMode={setAudioMode}
        kerrSpin={kerrSpin}
        onChangeKerrSpin={setKerrSpin}
        onResetView={() => {
          if (canvas3DRef.current) canvas3DRef.current.resetView();
          setExpandFactor(1.0);
          setTwistAmount(0);
          setWaveActive(false);
        }}
        onTakeScreenshot={handleTakeScreenshot}
      />

      {/* Comprehensive Help & Shortcuts Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Initial Camera Permission Modal */}
      {showPermissionModal && (
        <PermissionModal
          onEnableCamera={handleEnableCamera}
          onSkipToMouse={handleSkipToMouse}
        />
      )}

      {/* Toast Notification Stack */}
      <Toast toasts={toasts} />
    </main>
  );
}
