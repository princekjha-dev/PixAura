"""
NumPy-Accelerated Vectorized N-Body Gravitational Dynamics & Attractor Solver
Strictly Zero Emojis.
"""

import numpy as np


class NBodyPhysicsEngine:
    def __init__(self, softening: float = 0.15, g_const: float = 1.0, damping: float = 0.96):
        self.softening = softening
        self.g_const = g_const
        self.damping = damping

    def step_attractor_physics(
        self,
        positions: np.ndarray,
        velocities: np.ndarray,
        attractor_pos: np.ndarray,
        attractor_strength: float = 1.5,
        dt: float = 0.016,
    ) -> tuple[np.ndarray, np.ndarray, dict]:
        """
        Steps positions and velocities subject to a primary dynamic 3D attractor and mutual damping.
        positions: (N, 3)
        velocities: (N, 3)
        attractor_pos: (3,)
        """
        N = positions.shape[0]

        # Vector from particles to attractor
        delta = attractor_pos[np.newaxis, :] - positions  # (N, 3)
        dist_sq = np.sum(delta**2, axis=1, keepdims=True) + self.softening**2  # (N, 1)
        dist = np.sqrt(dist_sq)

        # Gravitational force F = G * M / (r^2 + eps^2)
        acc_magnitude = (self.g_const * attractor_strength) / dist_sq
        acc_linear = (delta / dist) * acc_magnitude

        # Orbital Coriolis/Vortex force (perpendicular in XZ plane)
        acc_vortex = np.empty_like(acc_linear)
        acc_vortex[:, 0] = -delta[:, 2] / dist[:, 0] * acc_magnitude[:, 0] * 0.75
        acc_vortex[:, 1] = 0.0
        acc_vortex[:, 2] = delta[:, 0] / dist[:, 0] * acc_magnitude[:, 0] * 0.75

        total_acc = acc_linear + acc_vortex

        # Leapfrog integration
        velocities = (velocities + total_acc * dt) * self.damping
        positions = positions + velocities * dt

        # Compute scientific diagnostics
        v_sq = np.sum(velocities**2, axis=1)
        kinetic_energy = 0.5 * float(np.sum(v_sq))
        mean_velocity = float(np.mean(np.sqrt(v_sq)))
        max_velocity = float(np.max(np.sqrt(v_sq)))

        metrics = {
            "kinetic_energy": kinetic_energy,
            "mean_velocity": mean_velocity,
            "max_velocity": max_velocity,
            "particle_count": N,
        }

        return positions, velocities, metrics
