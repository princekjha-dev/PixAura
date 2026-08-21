"""
PixAura Scientific Astrophysics Compute Server (FastAPI + NumPy)
Serves REST API, WebSocket streams, and built React frontend.
Strictly Zero Emojis.
"""

import asyncio
import json
import time
import sys
import os

# Ensure server package directory is in sys.path
server_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(server_dir)
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse, FileResponse
from pydantic import BaseModel

from physics.presets import PRESET_GENERATORS, generate_kerr_black_hole
from physics.nbody import NBodyPhysicsEngine
from services.dataset_exporter import DatasetExporter

app = FastAPI(
    title="PixAura Astrophysics Compute Server",
    description="High-precision scientific computing backend for N-body astrophysics and relativistic Kerr dynamics.",
    version="3.0.0",
)

# Enable CORS for local and production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

physics_engine = NBodyPhysicsEngine()
start_time = time.time()


class PresetRequest(BaseModel):
    preset_id: str = "kerr-black-hole"
    particle_count: int = 15000
    params: dict = {}


class ExportRequest(BaseModel):
    positions: list[float]
    velocities: list[float] = []
    format: str = "csv"  # "csv" | "json" | "npy"
    metadata: dict = {}


@app.get("/api/health")
async def health_check():
    """Returns server health, uptime, and compute statistics."""
    uptime_sec = time.time() - start_time
    return {
        "status": "online",
        "service": "PixAura Astrophysics Compute Engine",
        "version": "3.0.0",
        "python_version": sys.version.split()[0],
        "uptime_seconds": round(uptime_sec, 2),
        "numpy_version": np.__version__,
        "available_presets": list(PRESET_GENERATORS.keys()),
    }


@app.get("/api/presets")
async def list_presets():
    """Returns available astrophysical models."""
    return {
        "presets": [
            {
                "id": "kerr-black-hole",
                "name": "Kerr Black Hole & Relativistic Jets",
                "category": "General Relativity",
                "equation": "omega = 2*a*r / ((r^2 + a^2)^2 - a^2*Delta*sin^2(theta))",
                "description": "Rotating Kerr metric with frame-dragging, ISCO orbital limit, and polar collimated plasma jets.",
            },
            {
                "id": "einstein-rosen",
                "name": "Einstein-Rosen Bridge Wormhole",
                "category": "Lorentzian Spacetime",
                "equation": "ds^2 = -dt^2 + dl^2 + (b0^2 + l^2)*(dtheta^2 + sin^2(theta)*dphi^2)",
                "description": "Traversable throat connecting two asymptotically flat cosmic sheets.",
            },
            {
                "id": "binary-system",
                "name": "Accreting Binary Star System",
                "category": "Astrophysics",
                "equation": "Roche Lobe equipotential surface mass transfer",
                "description": "Close binary pair with Lagrange L1 mass-transfer accretion stream.",
            },
            {
                "id": "dark-matter-web",
                "name": "Dark Matter Cosmic Web",
                "category": "Cosmology",
                "equation": "Large-scale structure N-body halo filament network",
                "description": "Interconnected cosmological filamentary network with high-density galactic cluster nodes.",
            },
        ]
    }


@app.post("/api/presets/generate")
async def generate_preset(req: PresetRequest):
    """Generates procedural 3D particle positions and initial velocities."""
    gen_fn = PRESET_GENERATORS.get(req.preset_id)
    if not gen_fn:
        raise HTTPException(status_code=404, detail=f"Preset {req.preset_id} not found")

    result = gen_fn(count=req.particle_count, params=req.params)
    return result


@app.post("/api/export")
async def export_dataset(req: ExportRequest):
    """Exports particle trajectories into scientific datasets."""
    fmt = req.format.lower()
    if fmt == "csv":
        content = DatasetExporter.export_csv(req.positions, req.velocities, req.metadata)
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=pixaura_astrophysics_{int(time.time())}.csv"}
        )
    elif fmt == "json":
        content = DatasetExporter.export_json(req.positions, req.velocities, req.metadata)
        return Response(
            content=content,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=pixaura_astrophysics_{int(time.time())}.json"}
        )
    elif fmt == "npy":
        content = DatasetExporter.export_npy_bytes(req.positions, req.velocities)
        return Response(
            content=content,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename=pixaura_astrophysics_{int(time.time())}.npy"}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: csv, json, npy")


@app.websocket("/ws/physics")
async def websocket_physics_stream(websocket: WebSocket):
    """
    Real-time high-speed bi-directional WebSocket stream.
    Receives attractor and parameter state from client, executes NumPy vectorized physics step,
    and returns positions + velocities + energy telemetry.
    """
    await websocket.accept()

    # Initial default simulation state (10,000 particles)
    N = 10000
    kerr_init = generate_kerr_black_hole(N)
    positions = np.array(kerr_init["positions"], dtype=np.float32).reshape(-1, 3)
    velocities = np.array(kerr_init["velocities"], dtype=np.float32).reshape(-1, 3)

    try:
        while True:
            data_text = await websocket.receive_text()
            data = json.loads(data_text)
            command = data.get("cmd", "step")

            if command == "reset":
                preset_id = data.get("preset_id", "kerr-black-hole")
                N = data.get("particle_count", 10000)
                gen_fn = PRESET_GENERATORS.get(preset_id, generate_kerr_black_hole)
                kerr_data = gen_fn(N, data.get("params", {}))
                positions = np.array(kerr_data["positions"], dtype=np.float32).reshape(-1, 3)
                velocities = np.array(kerr_data["velocities"], dtype=np.float32).reshape(-1, 3)

            elif command == "step":
                attractor_pos = np.array([
                    data.get("attractor_x", 0.0),
                    data.get("attractor_y", 0.0),
                    data.get("attractor_z", 0.0),
                ], dtype=np.float32)
                attractor_strength = float(data.get("attractor_strength", 1.5))
                dt = float(data.get("dt", 0.016))

                t0 = time.perf_counter()
                positions, velocities, metrics = physics_engine.step_attractor_physics(
                    positions=positions,
                    velocities=velocities,
                    attractor_pos=attractor_pos,
                    attractor_strength=attractor_strength,
                    dt=dt,
                )
                compute_time_ms = (time.perf_counter() - t0) * 1000.0
                metrics["compute_time_ms"] = round(compute_time_ms, 3)

                response = {
                    "type": "physics_frame",
                    "positions": positions.flatten().tolist(),
                    "metrics": metrics,
                    "server_timestamp": time.time(),
                }
                await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket exception: {e}")


# Serve React production build from dist directory
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    dist_dir = os.path.join(root_dir, "dist")
    file_path = os.path.join(dist_dir, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "PixAura API online. Run `npm run build` to generate static frontend."}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
