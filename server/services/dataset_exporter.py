"""
Scientific Trajectory Dataset Exporter (CSV, JSON, Binary NPY)
Strictly Zero Emojis.
"""

import io
import json
import numpy as np


class DatasetExporter:
    @staticmethod
    def export_csv(positions: list, velocities: list, metadata: dict = None) -> str:
        """Exports 3D coordinates and velocities to standard scientific CSV format."""
        output = io.StringIO()
        output.write("# PixAura Scientific Astrophysics Particle Dataset\n")
        if metadata:
            for k, v in metadata.items():
                output.write(f"# {k}: {v}\n")
        output.write("particle_index,pos_x,pos_y,pos_z,vel_x,vel_y,vel_z\n")

        pos_arr = np.array(positions).reshape(-1, 3)
        vel_arr = np.array(velocities).reshape(-1, 3) if velocities else np.zeros_like(pos_arr)

        for i in range(len(pos_arr)):
            px, py, pz = pos_arr[i]
            vx, vy, vz = vel_arr[i] if i < len(vel_arr) else (0.0, 0.0, 0.0)
            output.write(f"{i},{px:.6f},{py:.6f},{pz:.6f},{vx:.6f},{vy:.6f},{vz:.6f}\n")

        return output.getvalue()

    @staticmethod
    def export_json(positions: list, velocities: list, metadata: dict = None) -> str:
        """Exports formatted JSON dataset."""
        data = {
            "metadata": metadata or {},
            "particle_count": len(positions) // 3,
            "positions": positions,
            "velocities": velocities,
        }
        return json.dumps(data, indent=2)

    @staticmethod
    def export_npy_bytes(positions: list, velocities: list) -> bytes:
        """Exports NumPy binary array format (.npy)."""
        pos_arr = np.array(positions, dtype=np.float32).reshape(-1, 3)
        buffer = io.BytesIO()
        np.save(buffer, pos_arr)
        return buffer.getvalue()
