"""
Relativistic Kerr Metric & Gravitational Physics Compute Module
Calculates Frame-Dragging (Lense-Thirring effect), Ergosphere, and Accretion Geodesics.
Strictly Zero Emojis.
"""

import numpy as np


class KerrBlackHole:
    """
    Computes relativistic physics for a spinning Kerr black hole in Boyer-Lindquist coordinates.
    M: Mass of Black Hole (geometric units)
    a: Dimensionless spin parameter (-1.0 to 1.0, where |a| <= M)
    """

    def __init__(self, mass: float = 1.0, spin: float = 0.92):
        self.mass = mass
        self.spin = np.clip(spin, -0.998, 0.998) * mass  # Thorne limit
        self.r_horizon = self.mass + np.sqrt(max(0.0, self.mass**2 - self.spin**2))
        self.r_cauchy = self.mass - np.sqrt(max(0.0, self.mass**2 - self.spin**2))
        self.r_isco = self._compute_isco()

    def _compute_isco(self) -> float:
        """Computes Innermost Stable Circular Orbit (ISCO) radius."""
        m, a = self.mass, self.spin
        z1 = 1.0 + (1.0 - a**2 / m**2)**(1/3) * ((1.0 + a/m)**(1/3) + (1.0 - a/m)**(1/3))
        z2 = np.sqrt(3.0 * a**2 / m**2 + z1**2)
        sign = 1.0 if a >= 0 else -1.0
        return m * (3.0 + z2 - sign * np.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2)))

    def compute_frame_dragging_velocity(self, r: np.ndarray, theta: np.ndarray) -> np.ndarray:
        """
        Computes the frame-dragging angular velocity omega(r, theta) = -g_{t phi} / g_{phi phi}.
        """
        m, a = self.mass, self.spin
        rho2 = r**2 + (a * np.cos(theta))**2
        delta = r**2 - 2.0 * m * r + a**2
        sigma2 = (r**2 + a**2)**2 - a**2 * delta * (np.sin(theta))**2
        
        # Frame-dragging angular velocity
        omega = (2.0 * m * a * r) / (sigma2 + 1e-6)
        return omega

    def generate_accretion_and_jets(self, count: int) -> dict:
        """
        Generates 3D particles distributed according to the relativistic accretion disc
        and collimated polar relativistic jets.
        """
        jet_count = int(count * 0.35)
        disk_count = count - jet_count

        # 1. Accretion Disk (Keplerian + Frame-Dragging Velocity)
        r_inner = max(self.r_horizon * 1.1, self.r_isco)
        r_outer = 4.2 * self.mass
        
        # Radial power-law distribution
        t_disk = np.random.power(0.55, disk_count)
        r_disk = r_inner + t_disk * (r_outer - r_inner)
        phi_disk = np.random.uniform(0, 2 * np.pi, disk_count)
        theta_disk = np.pi / 2.0 + np.random.normal(0, 0.05 * (r_disk / r_outer), disk_count)

        x_disk = r_disk * np.sin(theta_disk) * np.cos(phi_disk)
        y_disk = r_disk * np.cos(theta_disk)  # Height perpendicular to equatorial plane
        z_disk = r_disk * np.sin(theta_disk) * np.sin(phi_disk)

        # Orbital velocities
        omega_disk = 1.0 / (np.power(r_disk, 1.5) + self.spin)
        vx_disk = -omega_disk * z_disk
        vy_disk = np.zeros_like(y_disk)
        vz_disk = omega_disk * x_disk

        # 2. Dual Relativistic Magnetohydrodynamic Polar Jets
        t_jet = np.random.power(0.8, jet_count)
        dir_jet = np.random.choice([-1.0, 1.0], size=jet_count)
        y_jet = dir_jet * (0.6 * self.r_horizon + t_jet * 5.5 * self.mass)
        spread = np.power(t_jet, 1.6) * 0.45 * self.mass
        phi_jet = np.random.uniform(0, 2 * np.pi, jet_count)

        x_jet = spread * np.cos(phi_jet)
        z_jet = spread * np.sin(phi_jet)

        # High relativistic velocities along polar axis with helical twist
        vy_jet = dir_jet * (0.15 + 0.35 * (1.0 - t_jet))
        twist_speed = 3.0 * dir_jet
        vx_jet = -twist_speed * z_jet * 0.1
        vz_jet = twist_speed * x_jet * 0.1

        positions = np.empty((count, 3), dtype=np.float32)
        velocities = np.empty((count, 3), dtype=np.float32)

        positions[:disk_count] = np.column_stack((x_disk, y_disk, z_disk))
        positions[disk_count:] = np.column_stack((x_jet, y_jet, z_jet))

        velocities[:disk_count] = np.column_stack((vx_disk, vy_disk, vz_disk))
        velocities[disk_count:] = np.column_stack((vx_jet, vy_jet, vz_jet))

        return {
            "positions": positions.flatten().tolist(),
            "velocities": velocities.flatten().tolist(),
            "metrics": {
                "mass": float(self.mass),
                "spin": float(self.spin),
                "horizon_radius": float(self.r_horizon),
                "isco_radius": float(self.r_isco),
                "particle_count": count,
            }
        }
