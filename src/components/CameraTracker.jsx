import React, { useEffect, useRef } from 'react';
import { loadMediaPipe } from '../utils/mediapipeLoader';

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

function isFingerExtended(lm, idx) {
  if (idx === 0) {
    return Math.abs(lm[4].x - lm[0].x) > Math.abs(lm[2].x - lm[0].x) * 0.85;
  }
  return lm[FINGER_TIPS[idx]].y < lm[FINGER_PIPS[idx]].y - 0.02;
}

function computeHandMetrics(lm) {
  const wrist = lm[0];
  const thumbTip = lm[4];
  const indexTip = lm[8];
  const middleMcp = lm[9];

  // 1. Pinch Distance (Thumb Tip to Index Tip)
  const pinchDist = Math.hypot(
    thumbTip.x - indexTip.x,
    thumbTip.y - indexTip.y,
    (thumbTip.z - indexTip.z) * 2.5
  );

  // 2. Hand Openness / Spread (Average distance from all 5 fingertips to wrist)
  let totalSpread = 0;
  for (let i = 0; i < FINGER_TIPS.length; i++) {
    const tip = lm[FINGER_TIPS[i]];
    totalSpread += Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z);
  }
  const avgSpread = totalSpread / 5;
  // Normalized openness from 0.0 (tight fist) to 1.0 (fully open hand)
  const openness = Math.min(1.0, Math.max(0.0, (avgSpread - 0.18) / 0.32));

  // 3. Hand Tilt / Rotation Angle in 2D Screen Space
  const dx = middleMcp.x - wrist.x;
  const dy = -(middleMcp.y - wrist.y);
  const handAngle = Math.atan2(dx, dy); // Angle in radians

  // 4. Extended Fingers
  const ext = [0, 1, 2, 3, 4].map((i) => isFingerExtended(lm, i));
  const [th, ix, md, rg, pk] = ext;
  const count = ext.filter(Boolean).length;

  let gestureName = 'hand';
  if (pinchDist < 0.065) {
    gestureName = 'pinch';
  } else if (count === 0 || openness < 0.15) {
    gestureName = 'fist';
  } else if (count >= 4 && openness > 0.75) {
    gestureName = 'open';
  } else if (ix && !md && !rg && !pk) {
    gestureName = 'point';
  } else if (!th && ix && md && !rg && !pk) {
    gestureName = 'peace';
  } else if (th && !ix && !md && !rg && !pk) {
    gestureName = 'thumbup';
  } else if (ix && !md && !rg && pk) {
    gestureName = 'rock';
  }

  return {
    gestureName,
    pinchDist,
    openness,
    handAngle,
    pinchCenter: {
      x: (thumbTip.x + indexTip.x) / 2,
      y: (thumbTip.y + indexTip.y) / 2,
      z: (thumbTip.z + indexTip.z) / 2,
    },
    indexTip: {
      x: (indexTip.x - 0.5) * 6,
      y: -(indexTip.y - 0.5) * 4.5,
      z: -indexTip.z * 4,
    }
  };
}

export default function CameraTracker({
  enabled,
  onHandUpdate,
  onGestureChange,
  onStatusChange,
  previewCanvasRef,
}) {
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const isRunningRef = useRef(false);
  const smoothPosRef = useRef({ x: 0, y: 0, z: 0, angle: 0, openness: 0.5, pinch: 0.2 });

  useEffect(() => {
    if (!enabled) {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      isRunningRef.current = false;
      onStatusChange({ initialized: false, tracking: false, error: null });
      return;
    }

    let isMounted = true;

    async function startTracking() {
      onStatusChange({ initialized: false, tracking: false, loading: true, error: null });

      try {
        await loadMediaPipe();
        if (!isMounted) return;

        const video = videoRef.current;
        if (!video) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        video.srcObject = stream;
        await new Promise((res) => {
          video.onloadedmetadata = () => video.play().then(res);
        });

        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((results) => {
          if (!isMounted) return;

          // Draw clean hand skeleton on preview canvas
          const canvas = previewCanvasRef?.current;
          if (canvas && results.image) {
            canvas.width = results.image.width;
            canvas.height = results.image.height;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const lm = results.multiHandLandmarks[0];
              if (window.drawConnectors && window.HAND_CONNECTIONS) {
                window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
                  color: '#00f0ff',
                  lineWidth: 2.5,
                });
              }
              if (window.drawLandmarks) {
                window.drawLandmarks(ctx, lm, {
                  color: '#ff007b',
                  lineWidth: 1.5,
                  radius: 3.5,
                });
              }
            }
            ctx.restore();
          }

          // Process direct 1:1 hand metrics
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const lm = results.multiHandLandmarks[0];
            const palm = lm[9]; // Middle MCP (Palm Center)
            const targetX = (palm.x - 0.5) * 2;
            const targetY = -(palm.y - 0.5) * 2;
            const targetZ = -palm.z * 3;

            const metrics = computeHandMetrics(lm);

            // Responsive smoothing
            const lerp = 0.35;
            smoothPosRef.current.x += (targetX - smoothPosRef.current.x) * lerp;
            smoothPosRef.current.y += (targetY - smoothPosRef.current.y) * lerp;
            smoothPosRef.current.z += (targetZ - smoothPosRef.current.z) * lerp;
            smoothPosRef.current.angle += (metrics.handAngle - smoothPosRef.current.angle) * lerp;
            smoothPosRef.current.openness += (metrics.openness - smoothPosRef.current.openness) * lerp;
            smoothPosRef.current.pinch += (metrics.pinchDist - smoothPosRef.current.pinch) * lerp;

            onHandUpdate({
              detected: true,
              rawX: targetX,
              rawY: targetY,
              rawZ: targetZ,
              smoothX: smoothPosRef.current.x,
              smoothY: smoothPosRef.current.y,
              smoothZ: smoothPosRef.current.z,
              handAngle: smoothPosRef.current.angle,
              openness: smoothPosRef.current.openness,
              pinchDist: smoothPosRef.current.pinch,
              indexTip: metrics.indexTip,
              confidence: results.multiHandedness?.[0]?.score || 0.92,
            });

            onGestureChange(metrics.gestureName);
          } else {
            onHandUpdate({
              detected: false,
              landmarks: null,
            });
            onGestureChange('none');
          }
        });

        handsRef.current = hands;

        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (handsRef.current && video.readyState >= 2) {
              await handsRef.current.send({ image: video }).catch(() => {});
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        isRunningRef.current = true;

        onStatusChange({ initialized: true, tracking: true, loading: false, error: null });
      } catch (err) {
        console.error('Hand tracking init error:', err);
        onStatusChange({
          initialized: false,
          tracking: false,
          loading: false,
          error: err.message || 'Camera or MediaPipe initialization failed',
        });
      }
    }

    startTracking();

    return () => {
      isMounted = false;
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, [enabled]);

  return (
    <video
      ref={videoRef}
      playsInline
      muted
      autoPlay
      style={{ display: 'none' }}
    />
  );
}
