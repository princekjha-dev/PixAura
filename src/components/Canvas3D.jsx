import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTES, SHAPE_PRESETS } from '../constants/palettes';
import { computeCurl } from '../utils/curlNoise';
import { audioEngine } from '../utils/audioEngine';

const Canvas3D = forwardRef(function Canvas3D(
  {
    paletteIndex = 0,
    shapeIndex = 0,
    particleCount = 28000,
    expandFactor = 1,
    waveActive = false,
    twistAmount = 0,
    shockwaveTrigger = 0,
    rotationSpeed = { x: 0, y: 0 },
    autoRotate = true,
    trailPoint = null,
    handAttractor = null,
    turbulenceIntensity = 1.0,
    gravityPull = 1.0,
    audioReactive = true,
    physicsEngineMode = 'client', // 'client' | 'python'
    pythonFramePositions = null,
    onFpsUpdate,
    onAudioMetricsUpdate,
  },
  ref
) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    trailParticles: null,
    geometry: null,
    material: null,
    trailGeo: null,
    trailMat: null,
    targetPositions: null,
    currentPositions: null,
    basePositions: null,
    velocities: null,
    colors: null,
    sizes: null,
    trailPositions: null,
    trailColors: null,
    trailIndex: 0,
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
    zoom: 5.2,
    targetZoom: 5.2,
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    mouseScreen: { x: 0, y: 0, active: false },
    shockwaves: [],
    frameCount: 0,
    lastTime: performance.now(),
    fps: 60,
    camShake: { x: 0, y: 0, z: 0 },
  });

  // Expose methods for taking screenshots, triggering shockwaves, and reading current state
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      const { renderer } = stateRef.current;
      if (renderer) {
        return renderer.domElement.toDataURL('image/png');
      }
      return null;
    },
    getCurrentCoordinates: () => {
      return {
        positions: stateRef.current.currentPositions,
        velocities: stateRef.current.velocities,
      };
    },
    triggerShockwave: (origin = { x: 0, y: 0, z: 0 }) => {
      stateRef.current.shockwaves.push({
        time: 0,
        origin,
        maxTime: 2.5,
        strength: 1.0,
      });
      stateRef.current.camShake = {
        x: (Math.random() - 0.5) * 0.35,
        y: (Math.random() - 0.5) * 0.35,
        z: (Math.random() - 0.5) * 0.35,
      };
    },
    resetView: () => {
      stateRef.current.rotX = 0;
      stateRef.current.rotY = 0;
      stateRef.current.velX = 0;
      stateRef.current.velY = 0;
      stateRef.current.targetZoom = 5.2;
      if (stateRef.current.particles) {
        stateRef.current.particles.rotation.set(0, 0, 0);
      }
    },
  }));

  // Initialize Three.js Scene and Particle Physics
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060b, 0.032);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x05060b, 1);
    mount.appendChild(renderer.domElement);

    // Build Particles with High-Precision Physics Arrays
    const count = particleCount;
    const preset = SHAPE_PRESETS[shapeIndex] || SHAPE_PRESETS[0];
    const initialPos = preset.generate(count);
    const curPos = new Float32Array(initialPos);
    const basePos = new Float32Array(initialPos);
    const targetPos = new Float32Array(initialPos);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = COLOR_PALETTES[paletteIndex] || COLOR_PALETTES[0];
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count;
      const c = new THREE.Color().setHSL(...palette.fn(t));
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      sizes[i] = Math.random() * 0.04 + 0.035;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(curPos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // High-Intensity Glowing Particle Texture
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const ctx = particleCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(particleCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.055,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3D High-Energy Celestial Trail System
    const trailCount = 800;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailColors = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trailMat = new THREE.PointsMaterial({
      size: 0.1,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const trailParticles = new THREE.Points(trailGeo, trailMat);
    scene.add(trailParticles);

    // Save internal state refs
    stateRef.current = {
      ...stateRef.current,
      scene,
      camera,
      renderer,
      particles,
      trailParticles,
      geometry,
      material,
      trailGeo,
      trailMat,
      targetPositions: targetPos,
      currentPositions: curPos,
      basePositions: basePos,
      velocities,
      colors,
      sizes,
      trailPositions,
      trailColors,
      trailIndex: 0,
    };

    // Window resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Pointer Listeners
    const onPointerDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = -(e.clientY / window.innerHeight - 0.5) * 2;
      stateRef.current.mouseScreen = { x: normX, y: normY, active: true };

      if (stateRef.current.isDragging) {
        const dx = e.clientX - stateRef.current.prevMouse.x;
        const dy = e.clientY - stateRef.current.prevMouse.y;
        stateRef.current.velY += dx * 0.006;
        stateRef.current.velX += dy * 0.006;
        stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      stateRef.current.targetZoom = THREE.MathUtils.clamp(
        stateRef.current.targetZoom + e.deltaY * 0.0035,
        1.2,
        15
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // ═══════════════════════════════════════════════════════════
    //  MAIN SIMULATION & RENDER LOOP
    // ═══════════════════════════════════════════════════════════
    let animId;
    let clock = 0;

    const animate = (time) => {
      animId = requestAnimationFrame(animate);
      const st = stateRef.current;
      const deltaSec = 0.016;
      clock += deltaSec;

      // FPS Metrics
      st.frameCount++;
      if (time - st.lastTime >= 500) {
        st.fps = Math.round((st.frameCount * 1000) / (time - st.lastTime));
        st.frameCount = 0;
        st.lastTime = time;
        if (onFpsUpdate) onFpsUpdate(st.fps);
      }

      // Audio Engine Metrics Update
      const audio = audioEngine.update();
      if (onAudioMetricsUpdate) onAudioMetricsUpdate(audio);

      const audioBoost = audioReactive ? audio.energy * 1.8 : 0;
      const bassPulse = audioReactive ? audio.bass * 2.2 : 0;

      // Beat triggered micro-shockwave
      if (audio.beat && audioReactive) {
        st.shockwaves.push({
          time: 0,
          origin: { x: 0, y: 0, z: 0 },
          maxTime: 1.6,
          strength: 0.6 + audio.bass * 0.8,
        });
      }

      // Camera Smooth Zoom & Camera Shake Damping
      st.zoom += (st.targetZoom - st.zoom) * 0.08;
      st.camShake.x *= 0.88;
      st.camShake.y *= 0.88;
      st.camShake.z *= 0.88;

      camera.position.x = st.camShake.x;
      camera.position.y = st.camShake.y;
      camera.position.z = st.zoom + st.camShake.z;

      // Dynamic Camera Rotation with Inertia
      if (particles) {
        st.rotX += st.velX;
        st.rotY += st.velY;
        st.velX *= 0.93;
        st.velY *= 0.93;

        const autoSpeedY = autoRotate ? 0.0008 + audioBoost * 0.002 : 0;
        const autoSpeedX = autoRotate ? 0.0003 : 0;

        particles.rotation.x = st.rotX + rotationSpeed.x;
        particles.rotation.y = st.rotY + rotationSpeed.y;
        st.rotY += autoSpeedY;
        st.rotX += autoSpeedX;

        // Dynamic Scale & Breathing Pulse
        const targetScale = expandFactor * (1.0 + bassPulse * 0.18);
        const curScale = particles.scale.x;
        particles.scale.setScalar(curScale + (targetScale - curScale) * 0.1);
      }

      // Particle Physics Arrays
      const cur = st.currentPositions;
      const tgt = st.targetPositions;
      const base = st.basePositions;
      const vel = st.velocities;
      const posAttr = st.geometry.attributes.position;

      // Active Attractor Position (Hand / Mouse Gravity)
      let attractor = null;
      if (handAttractor && handAttractor.active) {
        attractor = {
          x: handAttractor.x * 4.2,
          y: handAttractor.y * 3.2,
          z: (handAttractor.z || 0) * 3.0,
          strength: gravityPull * 1.8,
        };
      } else if (st.mouseScreen.active && st.isDragging) {
        attractor = {
          x: st.mouseScreen.x * 4.0,
          y: st.mouseScreen.y * 3.0,
          z: 0,
          strength: gravityPull * 1.2,
        };
      }

      // Update Shockwaves
      for (let s = st.shockwaves.length - 1; s >= 0; s--) {
        const sw = st.shockwaves[s];
        sw.time += 0.045;
        if (sw.time > sw.maxTime) {
          st.shockwaves.splice(s, 1);
        }
      }

      const activePreset = SHAPE_PRESETS[shapeIndex] || SHAPE_PRESETS[0];
      const dynamicsType = activePreset.dynamics || 'galaxy-swirl';
      const hasTwist = Math.abs(twistAmount) > 0.01;
      const waveAmp = waveActive ? 0.25 + audioBoost * 0.2 : 0;
      const turbScale = turbulenceIntensity * (0.8 + audioBoost * 0.7);

      // If Python WebSocket frame is available and in Python mode, apply directly
      if (physicsEngineMode === 'python' && pythonFramePositions && pythonFramePositions.length > 0) {
        const pyLen = Math.min(pythonFramePositions.length, count * 3);
        for (let i = 0; i < pyLen; i++) {
          cur[i] = pythonFramePositions[i];
        }
        posAttr.needsUpdate = true;
        renderer.render(scene, camera);
        return;
      }

      // ═══════════════════════════════════════════════════════════
      //  CLIENT-SIDE HYPER-DYNAMIC PHYSICS SIMULATION
      // ═══════════════════════════════════════════════════════════
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        let px = cur[i3];
        let py = cur[i3 + 1];
        let pz = cur[i3 + 2];

        // 1. Morphing towards Target Formation Baseline
        const tx = tgt[i3];
        const ty = tgt[i3 + 1];
        const tz = tgt[i3 + 2];

        base[i3] += (tx - base[i3]) * 0.045;
        base[i3 + 1] += (ty - base[i3 + 1]) * 0.045;
        base[i3 + 2] += (tz - base[i3 + 2]) * 0.045;

        let bx = base[i3];
        let by = base[i3 + 1];
        let bz = base[i3 + 2];

        // 2. Formation-Specific Dynamic Flow Vector
        if (dynamicsType === 'vortex-jets') {
          const isJet = i >= Math.floor(count * 0.7);
          if (isJet) {
            const dir = i % 2 === 0 ? 1 : -1;
            by += dir * (0.06 + audioBoost * 0.04);
            const jetAngle = clock * 4.0 * dir;
            bx += Math.cos(jetAngle) * 0.015;
            bz += Math.sin(jetAngle) * 0.015;
            if (Math.abs(by) > 5.5) {
              by = dir * 0.5;
              bx = (Math.random() - 0.5) * 0.2;
              bz = (Math.random() - 0.5) * 0.2;
            }
            base[i3] = bx;
            base[i3 + 1] = by;
            base[i3 + 2] = bz;
          } else {
            const rDisk = Math.sqrt(bx * bx + bz * bz) + 0.1;
            const omega = (0.04 / Math.pow(rDisk, 1.2)) * (1.0 + audioBoost * 0.8);
            const cosO = Math.cos(omega);
            const sinO = Math.sin(omega);
            const nx = bx * cosO - bz * sinO;
            const nz = bx * sinO + bz * cosO;
            bx = nx;
            bz = nz;
            base[i3] = bx;
            base[i3 + 2] = bz;
          }
        } else if (dynamicsType === 'warp-tunnel') {
          bz += 0.12 + audioBoost * 0.18;
          if (bz > 6.0) bz = -6.5;
          base[i3 + 2] = bz;
        } else if (dynamicsType === 'torus-vortex') {
          const uAngle = clock * 0.8;
          const vAngle = clock * 2.2;
          const R = 2.2;
          const r = 0.85 + Math.sin(clock * 3.0 + i * 0.01) * 0.15;
          const u = (i / count) * Math.PI * 2 + uAngle;
          const v = ((i % 100) / 100) * Math.PI * 2 + vAngle;
          bx = (R + r * Math.cos(v)) * Math.cos(u);
          by = r * Math.sin(v);
          bz = (R + r * Math.cos(v)) * Math.sin(u);
        } else if (dynamicsType === 'neural-web') {
          const pulse = Math.sin(clock * 4.0 + i * 0.05) * 0.06;
          bx += pulse;
          by += pulse;
          bz += pulse;
        }

        // 3. Fluid 3D Curl Noise Turbulence
        if (turbScale > 0.05) {
          const noiseSample = computeCurl(
            bx * 0.45 + clock * 0.15,
            by * 0.45 + clock * 0.15,
            bz * 0.45 + clock * 0.15
          );
          vel[i3] += noiseSample.x * 0.012 * turbScale;
          vel[i3 + 1] += noiseSample.y * 0.012 * turbScale;
          vel[i3 + 2] += noiseSample.z * 0.012 * turbScale;
        }

        // 4. Gravitational Attractor Force Field
        if (attractor) {
          const dx = attractor.x - px;
          const dy = attractor.y - py;
          const dz = attractor.z - pz;
          const distSq = dx * dx + dy * dy + dz * dz + 0.2;
          const dist = Math.sqrt(distSq);
          const force = (attractor.strength / distSq) * 0.04;

          vel[i3] += (dx / dist) * force - (dz / dist) * force * 0.8;
          vel[i3 + 1] += (dy / dist) * force;
          vel[i3 + 2] += (dz / dist) * force + (dx / dist) * force * 0.8;
        }

        // 5. Elastic Spring Return to Base Position
        const springK = 0.08;
        vel[i3] += (bx - px) * springK;
        vel[i3 + 1] += (by - py) * springK;
        vel[i3 + 2] += (bz - pz) * springK;

        vel[i3] *= 0.88;
        vel[i3 + 1] *= 0.88;
        vel[i3 + 2] *= 0.88;

        px += vel[i3];
        py += vel[i3 + 1];
        pz += vel[i3 + 2];

        // 6. Wave Ripple Oscillation
        const r = Math.sqrt(px * px + pz * pz);
        if (waveAmp > 0) {
          py += Math.sin(r * 3.2 - clock * 5.0) * waveAmp * Math.max(0, 1.2 - r * 0.25);
        }

        // 7. Space-Time Twist Torque
        if (hasTwist) {
          const twistAngle = twistAmount * r * 0.45;
          const cosT = Math.cos(twistAngle);
          const sinT = Math.sin(twistAngle);
          const nx = px * cosT - pz * sinT;
          const nz = px * sinT + pz * cosT;
          px = nx;
          pz = nz;
        }

        // 8. Gravitational Shockwave Bursts
        for (let s = 0; s < st.shockwaves.length; s++) {
          const sw = st.shockwaves[s];
          const swRadius = sw.time * 4.2;
          const distFromOrigin = Math.hypot(px - sw.origin.x, pz - sw.origin.z);
          const waveDelta = distFromOrigin - swRadius;
          const shockIntensity = Math.exp(-(waveDelta * waveDelta) / 0.4) * sw.strength;
          const decay = Math.max(0, 1.0 - sw.time / sw.maxTime);

          const push = shockIntensity * 0.28 * decay;
          px += (px - sw.origin.x) * push;
          py += shockIntensity * 0.4 * decay * Math.sin(sw.time * 8.0);
          pz += (pz - sw.origin.z) * push;
        }

        cur[i3] = px;
        cur[i3 + 1] = py;
        cur[i3 + 2] = pz;
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      if (mount.contains(dom)) mount.removeChild(dom);
      geometry.dispose();
      material.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      renderer.dispose();
    };
  }, [particleCount, physicsEngineMode]);

  // Update Color Palettes Dynamically
  useEffect(() => {
    const st = stateRef.current;
    if (!st.geometry || !st.colors) return;
    const palette = COLOR_PALETTES[paletteIndex] || COLOR_PALETTES[0];
    const colAttr = st.geometry.attributes.color;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const t = i / particleCount;
      const c = new THREE.Color().setHSL(...palette.fn(t));
      st.colors[i3] = c.r;
      st.colors[i3 + 1] = c.g;
      st.colors[i3 + 2] = c.b;
    }
    colAttr.needsUpdate = true;
  }, [paletteIndex, particleCount]);

  // Switch Shape Formations Dynamically
  useEffect(() => {
    const st = stateRef.current;
    if (!st.targetPositions) return;
    const preset = SHAPE_PRESETS[shapeIndex] || SHAPE_PRESETS[0];
    const newPositions = preset.generate(particleCount);
    for (let i = 0; i < particleCount * 3; i++) {
      st.targetPositions[i] = newPositions[i];
    }
  }, [shapeIndex, particleCount]);

  // Trigger Shockwave from Parent Prop
  useEffect(() => {
    if (shockwaveTrigger > 0) {
      stateRef.current.shockwaves.push({
        time: 0,
        origin: { x: 0, y: 0, z: 0 },
        maxTime: 2.5,
        strength: 1.2,
      });
      stateRef.current.camShake = {
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.4,
      };
    }
  }, [shockwaveTrigger]);

  // Add 3D High-Energy Celestial Trail Stream
  useEffect(() => {
    if (!trailPoint) return;
    const st = stateRef.current;
    if (!st.trailPositions || !st.trailGeo) return;

    const n = 800;
    const i = (st.trailIndex % n) * 3;
    st.trailPositions[i] = trailPoint.x;
    st.trailPositions[i + 1] = trailPoint.y;
    st.trailPositions[i + 2] = trailPoint.z;

    const pal = COLOR_PALETTES[paletteIndex] || COLOR_PALETTES[0];
    const c = new THREE.Color().setHSL(...pal.fn((Date.now() * 0.0015) % 1));
    st.trailColors[i] = c.r;
    st.trailColors[i + 1] = c.g;
    st.trailColors[i + 2] = c.b;

    st.trailIndex++;
    st.trailGeo.attributes.position.needsUpdate = true;
    st.trailGeo.attributes.color.needsUpdate = true;
  }, [trailPoint, paletteIndex]);

  return <div ref={mountRef} className="canvas-container" />;
});

export default Canvas3D;
