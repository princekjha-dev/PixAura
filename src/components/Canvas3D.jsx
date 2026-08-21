import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTES, SHAPE_PRESETS } from '../constants/palettes';

const Canvas3D = forwardRef(function Canvas3D(
  {
    paletteIndex = 0,
    shapeIndex = 0,
    particleCount = 25000,
    expandFactor = 1.0,
    waveActive = false,
    twistAmount = 0,
    shockwaveTrigger = 0,
    trailPoint = null,
    handData = null, // Direct hand metrics: { detected, smoothX, smoothY, smoothZ, handAngle, openness, pinchDist, indexTip }
    onFpsUpdate,
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
    trailPositions: null,
    trailColors: null,
    trailIndex: 0,
    zoom: 5.0,
    targetZoom: 5.0,
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    mouseRotation: { x: 0, y: 0 },
    shockwaves: [],
    frameCount: 0,
    lastTime: performance.now(),
    fps: 60,
  });

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      const { renderer } = stateRef.current;
      return renderer ? renderer.domElement.toDataURL('image/png') : null;
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
        maxTime: 2.0,
      });
    },
    resetView: () => {
      stateRef.current.mouseRotation = { x: 0, y: 0 };
      stateRef.current.targetZoom = 5.0;
      if (stateRef.current.particles) {
        stateRef.current.particles.rotation.set(0, 0, 0);
        stateRef.current.particles.position.set(0, 0, 0);
      }
    },
  }));

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060b, 0.035);

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 5.0;

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

    // Generate Initial Clean Particle Geometry
    const count = particleCount;
    const preset = SHAPE_PRESETS[shapeIndex] || SHAPE_PRESETS[0];
    const initialPos = preset.generate(count);
    const curPos = new Float32Array(initialPos);
    const basePos = new Float32Array(initialPos);
    const targetPos = new Float32Array(initialPos);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = COLOR_PALETTES[paletteIndex] || COLOR_PALETTES[0];
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count;
      const c = new THREE.Color().setHSL(...palette.fn(t));
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(curPos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Crisp glowing circular particle sprite
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const ctx = particleCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(particleCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.05,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3D Trail System
    const trailCount = 600;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailColors = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trailMat = new THREE.PointsMaterial({
      size: 0.09,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const trailParticles = new THREE.Points(trailGeo, trailMat);
    scene.add(trailParticles);

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
      trailPositions,
      trailColors,
      trailIndex: 0,
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Controls (Fallback when camera is off)
    const onPointerDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.prevMouse.x;
      const dy = e.clientY - stateRef.current.prevMouse.y;
      stateRef.current.mouseRotation.y += dx * 0.005;
      stateRef.current.mouseRotation.x += dy * 0.005;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      stateRef.current.targetZoom = THREE.MathUtils.clamp(
        stateRef.current.targetZoom + e.deltaY * 0.003,
        1.5,
        12.0
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // ═══════════════════════════════════════════════════════════
    //  DIRECT 1:1 HAND-CONTROLLED SIMULATION LOOP
    // ═══════════════════════════════════════════════════════════
    let animId;
    let clock = 0;

    const animate = (time) => {
      animId = requestAnimationFrame(animate);
      const st = stateRef.current;
      clock += 0.016;

      // FPS Calculation
      st.frameCount++;
      if (time - st.lastTime >= 500) {
        st.fps = Math.round((st.frameCount * 1000) / (time - st.lastTime));
        st.frameCount = 0;
        st.lastTime = time;
        if (onFpsUpdate) onFpsUpdate(st.fps);
      }

      // Smooth Camera Zoom
      st.zoom += (st.targetZoom - st.zoom) * 0.08;
      camera.position.z = st.zoom;

      const cur = st.currentPositions;
      const tgt = st.targetPositions;
      const base = st.basePositions;
      const posAttr = st.geometry.attributes.position;

      // Update Shockwaves
      for (let s = st.shockwaves.length - 1; s >= 0; s--) {
        const sw = st.shockwaves[s];
        sw.time += 0.04;
        if (sw.time > sw.maxTime) {
          st.shockwaves.splice(s, 1);
        }
      }

      // ── DIRECT HAND TRANSFORMS ──────────────────────────────
      if (particles) {
        if (handData && handData.detected) {
          // 1. Position follows hand palm directly in 3D
          const targetPosX = handData.smoothX * 2.2;
          const targetPosY = handData.smoothY * 1.8;
          const targetPosZ = (handData.smoothZ || 0) * 1.5;
          particles.position.x += (targetPosX - particles.position.x) * 0.15;
          particles.position.y += (targetPosY - particles.position.y) * 0.15;
          particles.position.z += (targetPosZ - particles.position.z) * 0.15;

          // 2. Rotation follows hand tilt & palm angle directly
          const targetRotY = handData.smoothX * 1.6;
          const targetRotX = -handData.smoothY * 1.4;
          const targetRotZ = handData.handAngle || 0;
          particles.rotation.y += (targetRotY - particles.rotation.y) * 0.12;
          particles.rotation.x += (targetRotX - particles.rotation.x) * 0.12;
          particles.rotation.z += (targetRotZ - particles.rotation.z) * 0.12;

          // 3. Dynamic Scale follows Hand Openness & Pinch directly
          let handScale = 1.0;
          if (handData.pinchDist !== undefined && handData.pinchDist < 0.075) {
            // Squeezed pinch -> shrink into singularity
            const pinchRatio = Math.max(0.0, handData.pinchDist / 0.075);
            handScale = 0.2 + pinchRatio * 0.6;
          } else if (handData.openness !== undefined) {
            // Open hand expands (0.4 to 2.2x)
            handScale = 0.4 + handData.openness * 1.8;
          }
          const curScale = particles.scale.x;
          particles.scale.setScalar(curScale + (handScale * expandFactor - curScale) * 0.14);
        } else {
          // Mouse Fallback: Rotate with mouse drag & default resting scale
          particles.position.set(0, 0, 0);
          particles.rotation.x = st.mouseRotation.x;
          particles.rotation.y = st.mouseRotation.y + clock * 0.15; // gentle slow cosmic rotation
          particles.rotation.z = 0;

          const curScale = particles.scale.x;
          particles.scale.setScalar(curScale + (expandFactor - curScale) * 0.1);
        }
      }

      // ── PER-PARTICLE DISPLACEMENTS & FORMATION MORPHING ───────
      const hasTwist = Math.abs(twistAmount) > 0.01;
      const isWaveOn = waveActive;
      const hasShockwave = st.shockwaves.length > 0;
      const isPointing = handData?.detected && handData?.indexTip;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Smooth morphing to target preset positions
        base[i3] += (tgt[i3] - base[i3]) * 0.05;
        base[i3 + 1] += (tgt[i3 + 1] - base[i3 + 1]) * 0.05;
        base[i3 + 2] += (tgt[i3 + 2] - base[i3 + 2]) * 0.05;

        let px = base[i3];
        let py = base[i3 + 1];
        let pz = base[i3 + 2];

        // 1. Optional Wave Oscillation (Horns gesture or W key)
        const r = Math.sqrt(px * px + pz * pz);
        if (isWaveOn) {
          py += Math.sin(r * 2.8 - clock * 4.0) * 0.18 * Math.max(0, 1 - r * 0.2);
        }

        // 2. Space-Time Twist Torque (Fist gesture or T key)
        if (hasTwist) {
          const angle = twistAmount * r * 0.45;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const nx = px * cosA - pz * sinA;
          const nz = px * sinA + pz * cosA;
          px = nx;
          pz = nz;
        }

        // 3. Shockwave Radial Bursts (Open hand gesture or Click/Space)
        for (let s = 0; s < st.shockwaves.length; s++) {
          const sw = st.shockwaves[s];
          const swRadius = sw.time * 3.8;
          const dist = Math.hypot(px - sw.origin.x, pz - sw.origin.z);
          const waveDelta = dist - swRadius;
          const shockIntensity = Math.exp(-(waveDelta * waveDelta) / 0.35);
          const decay = Math.max(0, 1.0 - sw.time / sw.maxTime);

          const push = shockIntensity * 0.25 * decay;
          px += (px - sw.origin.x) * push;
          py += shockIntensity * 0.3 * decay;
          pz += (pz - sw.origin.z) * push;
        }

        // 4. Pointing Index Finger Attraction Stream (Point gesture)
        if (isPointing && (i % 8 === 0)) {
          const tip = handData.indexTip;
          const dx = tip.x - px;
          const dy = tip.y - py;
          const dz = tip.z - pz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + 0.1);
          px += (dx / dist) * 0.12;
          py += (dy / dist) * 0.12;
          pz += (dz / dist) * 0.12;
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
  }, [particleCount]);

  // Color Palette Updates
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

  // Shape Preset Formation Updates
  useEffect(() => {
    const st = stateRef.current;
    if (!st.targetPositions) return;
    const preset = SHAPE_PRESETS[shapeIndex] || SHAPE_PRESETS[0];
    const newPositions = preset.generate(particleCount);
    for (let i = 0; i < particleCount * 3; i++) {
      st.targetPositions[i] = newPositions[i];
    }
  }, [shapeIndex, particleCount]);

  // Trigger Shockwave Prop
  useEffect(() => {
    if (shockwaveTrigger > 0) {
      stateRef.current.shockwaves.push({
        time: 0,
        origin: { x: 0, y: 0, z: 0 },
        maxTime: 2.0,
      });
    }
  }, [shockwaveTrigger]);

  // Add 3D Trail Stream
  useEffect(() => {
    if (!trailPoint) return;
    const st = stateRef.current;
    if (!st.trailPositions || !st.trailGeo) return;

    const n = 600;
    const i = (st.trailIndex % n) * 3;
    st.trailPositions[i] = trailPoint.x;
    st.trailPositions[i + 1] = trailPoint.y;
    st.trailPositions[i + 2] = trailPoint.z;

    const pal = COLOR_PALETTES[paletteIndex] || COLOR_PALETTES[0];
    const c = new THREE.Color().setHSL(...pal.fn((Date.now() * 0.001) % 1));
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
