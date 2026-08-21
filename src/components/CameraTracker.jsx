import React, { useEffect, useRef } from 'react';
import { loadMediaPipe } from '../utils/mediapipeLoader';

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

function isFingerExtended(lm, idx) {
  if (idx === 0) {
    // Thumb
    return Math.abs(lm[4].x - lm[0].x) > Math.abs(lm[2].x - lm[0].x) * 0.85;
  }
  return lm[FINGER_TIPS[idx]].y < lm[FINGER_PIPS[idx]].y - 0.02;
}

function detectGesture(lm) {
  const thumb = lm[4];
  const index = lm[8];
  const pinchDist = Math.hypot(
    thumb.x - index.x,
    thumb.y - index.y,
    (thumb.z - index.z) * 3
  );

  if (pinchDist < 0.075) {
    return { name: 'pinch', pinchDist };
  }

  const ext = [0, 1, 2, 3, 4].map((i) => isFingerExtended(lm, i));
  const [th, ix, md, rg, pk] = ext;
  const count = ext.filter(Boolean).length;

  if (count === 0) return { name: 'fist', pinchDist };
  if (count >= 4) return { name: 'open', pinchDist };
  if (ix && !md && !rg && !pk) return { name: 'point', pinchDist };
  if (!th && ix && md && !rg && !pk) return { name: 'peace', pinchDist };
  if (th && !ix && !md && !rg && !pk) return { name: 'thumbup', pinchDist };
  if (ix && !md && !rg && pk) return { name: 'rock', pinchDist };

  return { name: 'hand', pinchDist };
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
  const smoothPosRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!enabled) {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          // ignore
        }
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

        // Initialize MediaPipe Hands
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

          // Draw skeleton on preview canvas
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

          // Process hand landmarks
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const lm = results.multiHandLandmarks[0];
            const palm = lm[9]; // Middle MCP
            const targetX = (palm.x - 0.5) * 2;
            const targetY = -(palm.y - 0.5) * 2;
            const targetZ = -palm.z * 3;

            // Exponential smoothing for fluid attractor motion
            smoothPosRef.current.x += (targetX - smoothPosRef.current.x) * 0.25;
            smoothPosRef.current.y += (targetY - smoothPosRef.current.y) * 0.25;
            smoothPosRef.current.z += (targetZ - smoothPosRef.current.z) * 0.25;

            const gestureData = detectGesture(lm);

            onHandUpdate({
              detected: true,
              rawX: targetX,
              rawY: targetY,
              rawZ: targetZ,
              smoothX: smoothPosRef.current.x,
              smoothY: smoothPosRef.current.y,
              smoothZ: smoothPosRef.current.z,
              landmarks: lm,
              pinchDist: gestureData.pinchDist,
              confidence: results.multiHandedness?.[0]?.score || 0.92,
            });

            onGestureChange(gestureData.name);
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
        } catch (e) {
          // ignore
        }
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
