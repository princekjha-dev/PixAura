// Cosmic Color Palettes with procedural HSL generators (Strictly NO Emojis)
export const COLOR_PALETTES = [
  {
    id: 'deep-nebula',
    name: 'Deep Nebula',
    category: 'Cosmic',
    colors: ['#00f0ff', '#7000ff', '#ff007b'],
    fn: (t) => [(t * 0.35 + 0.55) % 1, 0.92, 0.65],
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    category: 'Stellar',
    colors: ['#ffaa00', '#ff3300', '#ff0055'],
    fn: (t) => [t * 0.12, 0.98, 0.5 + t * 0.45],
  },
  {
    id: 'cyan-frost',
    name: 'Cyan Frost',
    category: 'Cryo',
    colors: ['#00ffff', '#0099ff', '#ffffff'],
    fn: (t) => [0.52 + t * 0.12, 0.9, 0.55 + t * 0.4],
  },
  {
    id: 'synthwave',
    name: 'Neon Synthwave',
    category: 'Cyber',
    colors: ['#ff007f', '#a000ff', '#00e5ff'],
    fn: (t) => [(t * 0.6 + 0.75) % 1, 0.98, 0.62],
  },
  {
    id: 'cyber-gold',
    name: 'Cyber Gold',
    category: 'Luxe',
    colors: ['#ffd700', '#ff8800', '#ffcc00'],
    fn: (t) => [0.1 + t * 0.06, 0.95, 0.45 + t * 0.45],
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    category: 'Atmosphere',
    colors: ['#00ff88', '#00ffff', '#9900ff'],
    fn: (t) => [0.35 + t * 0.35, 0.92, 0.58],
  },
  {
    id: 'ultraviolet',
    name: 'Ultraviolet',
    category: 'Quantum',
    colors: ['#6b00ff', '#9e00ff', '#e100ff'],
    fn: (t) => [0.72 + t * 0.12, 0.95, 0.65],
  },
  {
    id: 'hyper-spectrum',
    name: 'Hyper Spectrum',
    category: 'Prism',
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    fn: (t) => [t % 1, 0.95, 0.6],
  }
];

// High-Energy Cosmic Formations (Strictly NO Emojis)
export const SHAPE_PRESETS = [
  {
    id: 'black-hole-jets',
    name: 'Singularity & Jets',
    description: 'Black hole event horizon with dual relativistic plasma jets',
    dynamics: 'vortex-jets',
    generate: (count) => {
      const positions = new Float32Array(count * 3);
      const jetCount = Math.floor(count * 0.3); // 30% particles in relativistic polar jets
      const diskCount = count - jetCount;

      // 1. Accretion Disk & Photon Ring (70%)
      for (let i = 0; i < diskCount; i++) {
        const i3 = i * 3;
        const t = Math.random();
        // Concentrated near event horizon (inner radius 0.6) out to 3.8
        const r = 0.6 + Math.pow(t, 1.8) * 3.2;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 0.15 * (1 + r * 0.3);

        positions[i3] = Math.cos(angle) * r;
        positions[i3 + 1] = height;
        positions[i3 + 2] = Math.sin(angle) * r;
      }

      // 2. Dual Relativistic Plasma Jets (30%)
      for (let i = diskCount; i < count; i++) {
        const i3 = i * 3;
        const dir = i % 2 === 0 ? 1 : -1; // Positive or negative polar jet
        const t = Math.random();
        const distY = 0.4 + Math.pow(t, 0.9) * 4.2; // Jet length
        const spread = Math.pow(t, 1.5) * 0.45; // Jet divergence cone
        const angle = Math.random() * Math.PI * 2;

        positions[i3] = Math.cos(angle) * spread;
        positions[i3 + 1] = distY * dir;
        positions[i3 + 2] = Math.sin(angle) * spread;
      }

      return positions;
    }
  },
  {
    id: 'hyperspace-warp',
    name: 'Hyperspace Warp',
    description: 'Relativistic starfield streaming past camera in 3D tunnel',
    dynamics: 'warp-tunnel',
    generate: (count) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.pow(Math.random(), 0.7) * 3.5;
        const zDepth = (Math.random() - 0.5) * 12.0;

        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = Math.sin(angle) * radius;
        positions[i3 + 2] = zDepth;
      }
      return positions;
    }
  },
  {
    id: 'cyber-torus',
    name: 'Quantum Cyber Torus',
    description: 'High-speed rotating 4D donut vortex with circulating energy loops',
    dynamics: 'torus-vortex',
    generate: (count) => {
      const positions = new Float32Array(count * 3);
      const R = 2.2; // Major radius
      const r = 0.85; // Minor radius
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        const scatter = (Math.random() - 0.5) * 0.12;

        positions[i3] = (R + (r + scatter) * Math.cos(v)) * Math.cos(u);
        positions[i3 + 1] = (r + scatter) * Math.sin(v);
        positions[i3 + 2] = (R + (r + scatter) * Math.cos(v)) * Math.sin(u);
      }
      return positions;
    }
  },
  {
    id: 'spiral-galaxy-vortex',
    name: 'Spiral Galaxy Vortex',
    description: 'Multi-armed galactic cyclone with outward turbulent stellar winds',
    dynamics: 'galaxy-swirl',
    generate: (count) => {
      const arms = 5;
      const maxRadius = 3.6;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = Math.random();
        const arm = i % arms;
        const armAngle = arm * ((Math.PI * 2) / arms);
        const angle = Math.pow(t, 0.7) * Math.PI * 7.5 + armAngle;
        const radius = Math.pow(t, 0.75) * maxRadius + Math.random() * 0.12;
        const scatter = (1 - t) * 0.22 + 0.03;

        positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * scatter;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.5 * (1 - t * 0.7);
        positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * scatter;
      }
      return positions;
    }
  },
  {
    id: 'cosmic-neural-web',
    name: 'Cosmic Neural Web',
    description: 'Interconnected galactic filament network with pulsing energy nodes',
    dynamics: 'neural-web',
    generate: (count) => {
      const positions = new Float32Array(count * 3);
      // Generate 12 main cosmic cluster nodes
      const nodeCount = 12;
      const nodes = [];
      for (let n = 0; n < nodeCount; n++) {
        nodes.push({
          x: (Math.random() - 0.5) * 4.5,
          y: (Math.random() - 0.5) * 3.5,
          z: (Math.random() - 0.5) * 4.5,
        });
      }

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        if (Math.random() < 0.4) {
          // Clustered around a node
          const node = nodes[i % nodeCount];
          const r = Math.pow(Math.random(), 2) * 0.8;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          positions[i3] = node.x + r * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = node.y + r * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = node.z + r * Math.cos(phi);
        } else {
          // Traveling along filament between two nodes
          const n1 = nodes[i % nodeCount];
          const n2 = nodes[(i + 1 + Math.floor(Math.random() * 3)) % nodeCount];
          const frac = Math.random();
          const scatter = 0.15;
          positions[i3] = n1.x * (1 - frac) + n2.x * frac + (Math.random() - 0.5) * scatter;
          positions[i3 + 1] = n1.y * (1 - frac) + n2.y * frac + (Math.random() - 0.5) * scatter;
          positions[i3 + 2] = n1.z * (1 - frac) + n2.z * frac + (Math.random() - 0.5) * scatter;
        }
      }
      return positions;
    }
  },
  {
    id: 'supernova-nebula',
    name: 'Supernova Nebula',
    description: 'Exploding stellar blast with oscillating outer nebular shockfronts',
    dynamics: 'supernova-pulse',
    generate: (count) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        // Multi-layered shell distribution
        const layer = Math.random();
        let r;
        if (layer < 0.25) {
          r = Math.pow(Math.random(), 3) * 0.7; // Dense blazing core
        } else if (layer < 0.75) {
          r = 1.4 + Math.pow(Math.random(), 1.5) * 1.5; // Expanding main shell
        } else {
          r = 2.8 + Math.random() * 0.9; // Outer shock front
        }

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);
      }
      return positions;
    }
  }
];
