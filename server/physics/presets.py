"""
High-Precision Astrophysical & Geometric Preset Formations (Python Backend)
Strictly Zero Emojis.
"""

import numpy as np
from .kerr import KerrBlackHole


def generate_kerr_black_hole(count: int, params: dict = None) -> dict:
    params = params or {}
    mass = float(params.get("mass", 1.0))
    spin = float(params.get("spin", 0.94))
    kerr = KerrBlackHole(mass=mass, spin=spin)
    return kerr.generate_accretion_and_jets(count)


def generate_einstein_rosen_bridge(count: int, params: dict = None) -> dict:
    """
    Computes an Einstein-Rosen Bridge (Traversable Lorentzian Wormhole).
    Throat radius b0, connecting two asymptotically flat universes.
    """
    params = params or {}
    b0 = float(params.get("throat_radius", 1.2))
    
    positions = np.empty((count, 3), dtype=np.float32)
    velocities = np.empty((count, 3), dtype=np.float32)

    # Proper distance along wormhole axis l (-4 to 4)
    l = np.random.uniform(-3.5, 3.5, count)
    # Circumferential radius r(l) = sqrt(b0^2 + l^2)
    r = np.sqrt(b0**2 + l**2)
    phi = np.random.uniform(0, 2 * np.pi, count)
    
    x = r * np.cos(phi)
    y = l  # Throat length axis
    z = r * np.sin(phi)

    # Throat rotation velocity
    omega = 0.8 / (r**1.2)
    vx = -omega * z
    vy = -0.05 * np.sign(l)  # Slight suction towards throat
    vz = omega * x

    positions[:] = np.column_stack((x, y, z))
    velocities[:] = np.column_stack((vx, vy, vz))

    return {
        "positions": positions.flatten().tolist(),
        "velocities": velocities.flatten().tolist(),
        "metrics": {
            "throat_radius": b0,
            "particle_count": count,
            "geometry_type": "lorentzian_wormhole"
        }
    }


def generate_binary_star_system(count: int, params: dict = None) -> dict:
    """
    Computes Roche Lobe overflow and accretion stream in a close binary star system.
    """
    positions = np.empty((count, 3), dtype=np.float32)
    velocities = np.empty((count, 3), dtype=np.float32)

    star1_center = np.array([-1.5, 0.0, 0.0])
    star2_center = np.array([1.5, 0.0, 0.0])
    star1_count = int(count * 0.4)
    star2_count = int(count * 0.4)
    stream_count = count - star1_count - star2_count

    # Star 1 (Primary - Dense compact object with accretion disc)
    r1 = np.random.power(0.6, star1_count) * 1.0
    phi1 = np.random.uniform(0, 2 * np.pi, star1_count)
    positions[:star1_count, 0] = star1_center[0] + r1 * np.cos(phi1)
    positions[:star1_count, 1] = (np.random.normal(0, 0.08, star1_count))
    positions[:star1_count, 2] = star1_center[2] + r1 * np.sin(phi1)

    # Star 2 (Secondary Donor Star - Mass losing giant)
    u2 = np.random.uniform(0, 1, star2_count)
    v2 = np.random.uniform(0, 1, star2_count)
    theta2 = u2 * 2.0 * np.pi
    phi2 = np.arccos(2.0 * v2 - 1.0)
    r2 = np.cbrt(np.random.uniform(0, 1, star2_count)) * 0.9
    positions[star1_count:star1_count+star2_count, 0] = star2_center[0] + r2 * np.sin(phi2) * np.cos(theta2)
    positions[star1_count:star1_count+star2_count, 1] = star2_center[1] + r2 * np.sin(phi2) * np.sin(theta2)
    positions[star1_count:star1_count+star2_count, 2] = star2_center[2] + r2 * np.cos(phi2)

    # Mass Transfer Stream between Lagrange Point L1
    t_stream = np.linspace(0, 1, stream_count)
    positions[star1_count+star2_count:, 0] = star2_center[0] * (1 - t_stream) + star1_center[0] * t_stream + np.random.normal(0, 0.08, stream_count)
    positions[star1_count+star2_count:, 1] = np.random.normal(0, 0.05, stream_count)
    positions[star1_count+star2_count:, 2] = 0.4 * np.sin(t_stream * np.pi) + np.random.normal(0, 0.05, stream_count)

    velocities[:] = 0.0

    return {
        "positions": positions.flatten().tolist(),
        "velocities": velocities.flatten().tolist(),
        "metrics": {
            "separation": 3.0,
            "particle_count": count,
            "geometry_type": "binary_roche_lobe"
        }
    }


def generate_dark_matter_web(count: int, params: dict = None) -> dict:
    """
    Computes a cosmological large-scale structure dark matter filament network.
    """
    positions = np.empty((count, 3), dtype=np.float32)
    node_count = 14
    nodes = np.random.uniform(-3.8, 3.8, (node_count, 3))

    for i in range(count):
        if np.random.rand() < 0.45:
            # Clustered in massive halo node
            node = nodes[i % node_count]
            r = np.power(np.random.rand(), 2.5) * 0.75
            u, v = np.random.rand(), np.random.rand()
            theta, phi = u * 2 * np.pi, np.arccos(2 * v - 1)
            positions[i] = node + np.array([
                r * np.sin(phi) * np.cos(theta),
                r * np.sin(phi) * np.sin(theta),
                r * np.cos(phi)
            ])
        else:
            # Filament string
            n1 = nodes[i % node_count]
            n2 = nodes[(i + 1 + (i % 3)) % node_count]
            frac = np.random.rand()
            scatter = np.random.normal(0, 0.12, 3)
            positions[i] = n1 * (1 - frac) + n2 * frac + scatter

    velocities = np.zeros_like(positions)

    return {
        "positions": positions.flatten().tolist(),
        "velocities": velocities.flatten().tolist(),
        "metrics": {
            "nodes": node_count,
            "particle_count": count,
            "geometry_type": "cosmic_filament_web"
        }
    }


PRESET_GENERATORS = {
    "kerr-black-hole": generate_kerr_black_hole,
    "einstein-rosen": generate_einstein_rosen_bridge,
    "binary-system": generate_binary_star_system,
    "dark-matter-web": generate_dark_matter_web,
}
