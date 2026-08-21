// Gesture definitions, keybindings, and descriptions (Strictly NO Emojis)
export const GESTURE_DEFINITIONS = [
  {
    id: 'pinch',
    name: 'Pinch',
    iconName: 'Minimize2',
    action: 'Expand / Contract',
    description: 'Bring thumb and index finger together to pinch; adjust distance to scale particles.',
    tag: 'Continuous'
  },
  {
    id: 'fist',
    name: 'Closed Fist',
    iconName: 'CircleDot',
    action: 'Implode & Twist',
    description: 'Close all fingers into a fist to compress galaxy inwards and induce rotational torque.',
    tag: 'Hold'
  },
  {
    id: 'open',
    name: 'Open Palm',
    iconName: 'Hand',
    action: 'Shockwave & Disperse',
    description: 'Spread all fingers wide to trigger an outward gravitational shockwave ring.',
    tag: 'Trigger'
  },
  {
    id: 'point',
    name: 'Index Point',
    iconName: 'Compass',
    action: 'Draw 3D Light Ribbon',
    description: 'Point with your index finger to cast glowing particle trails in 3D space.',
    tag: 'Motion'
  },
  {
    id: 'peace',
    name: 'Peace Sign',
    iconName: 'Palette',
    action: 'Cycle Color Theme',
    description: 'Show index and middle fingers to cycle to the next cosmic color palette.',
    tag: 'Trigger'
  },
  {
    id: 'thumbup',
    name: 'Thumbs Up',
    iconName: 'RotateCw',
    action: 'Toggle Auto Orbit',
    description: 'Extend thumb upwards to toggle autonomous cosmic rotation.',
    tag: 'Toggle'
  },
  {
    id: 'rock',
    name: 'Horns Sign',
    iconName: 'Activity',
    action: 'Wave Ripple Distortion',
    description: 'Extend index and pinky fingers to generate harmonic sine wave ripples.',
    tag: 'Hold'
  },
  {
    id: 'hand',
    name: 'Palm Track',
    iconName: 'Move',
    action: 'Rotate & Orbit View',
    description: 'Move palm across camera frame to tilt and rotate the particle universe.',
    tag: 'Continuous'
  }
];

export const KEYBOARD_SHORTCUTS = [
  { key: 'Space', action: 'Toggle Expansion', description: 'Smoothly expand or contract particle cluster' },
  { key: 'P', action: 'Cycle Theme', description: 'Switch to the next color palette' },
  { key: 'M', action: 'Cycle Preset', description: 'Morph into next geometry shape formation' },
  { key: 'T', action: 'Toggle Twist', description: 'Induce vortex torque deformation' },
  { key: 'W', action: 'Toggle Wave', description: 'Activate harmonic wave oscillation' },
  { key: 'S', action: 'Trigger Shockwave', description: 'Fire a radial gravitational burst' },
  { key: 'R', action: 'Reset Camera', description: 'Recenter 3D view and reset rotation speeds' },
  { key: 'C', action: 'Toggle Camera Preview', description: 'Show or hide the live hand tracking view' },
  { key: 'H', action: 'Toggle Controls Drawer', description: 'Show or hide the advanced parameters drawer' },
  { key: '?', action: 'Open Shortcuts Guide', description: 'Display complete gesture and key controls modal' }
];
