# PixAura - Astrophysics & Particle Dynamics Research Suite

PixAura is a high-precision, professional astrophysics visualization and simulation suite built with a **Python FastAPI / NumPy compute engine**, **React 18**, **Three.js WebGL rendering**, and **MediaPipe Hand tracking**.

## Full-Stack Architecture

### Python Scientific Backend (`server/`)
- **Relativistic Kerr Metric Dynamics** (`server/physics/kerr.py`): Calculates frame-dragging (Lense-Thirring effect), Boyer-Lindquist coordinate transformations, Innermost Stable Circular Orbit (ISCO) limits, and dual relativistic polar plasma jets.
- **N-Body Gravitational Engine** (`server/physics/nbody.py`): NumPy-vectorized gravitational orbital mechanics and fluid attractor physics.
- **Astrophysical Formations** (`server/physics/presets.py`): High-precision mathematical formulations for Kerr Black Holes, Einstein-Rosen Bridge Wormholes, Accreting Binary Star Systems, and Dark Matter Cosmic Webs.
- **Dataset Recording & Exporter** (`server/services/dataset_exporter.py`): Exports trajectory datasets directly to scientific CSV, JSON, and NumPy binary (`.npy`) formats.
- **FastAPI / WebSocket Gateway** (`server/main.py`): Low-latency WebSocket streaming (`/ws/physics`) and REST endpoints (`/api/health`, `/api/presets`, `/api/export`).

### Frontend Scientific Observational Telemetry (`src/`)
- **WebGL 3D GPU Engine**: 30,000+ particles with dynamic 3D Curl Noise fluid vector fields and additive glowing shaders.
- **Scientific Telemetry & Diagnostics**: Real-time velocity vector distribution function $f(v)$, kinetic energy dissipation (kJ), GPU render frametime (ms), and Python server latency.
- **Dual Physics Compute Mode**: Seamlessly switch between client-side WebGL GPU simulation and server-side Python NumPy streaming.
- **Scientific Dataset Studio**: Frame-accurate trajectory capture with metadata tagging and one-click dataset download.
- **Strictly Zero Emojis**: Enterprise-grade UI design with vector iconography (Lucide Icons) and scientific typography (`JetBrains Mono`, `Inter`, `Outfit`).

## Getting Started

### 1. Start Python Compute Backend

```bash
python3 -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

### 2. Start Frontend Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

## System Controls & Keybindings

| Action | Shortcut | Description |
| :--- | :--- | :--- |
| **Toggle Telemetry** | `D` | Show/hide NASA-style scientific telemetry dashboard |
| **Recording Studio** | `X` | Open trajectory recorder and scientific dataset exporter |
| **Expansion Factor** | `Space` | Scale or compress particle formation |
| **Cycle Theme** | `P` | Switch cosmic color spectrum |
| **Cycle Formation** | `M` | Morph between astrophysical geometries |
| **Vortex Torque** | `T` | Toggle space-time rotational twist |
| **Wave Oscillation** | `W` | Toggle harmonic wave oscillation |
| **Shockwave Burst** | `S` | Trigger gravitational shockwave blast |
| **Audio Reactivity** | `A` | Cycle Off / Cosmic Beats / Live Microphone |
| **Reset Scene** | `R` | Recenter 3D coordinates and velocity vectors |
| **Parameters Drawer**| `H` | Open astrophysics compute parameter sliders |
| **Shortcuts Guide** | `?` | Display complete controls reference modal |

## License

MIT License.