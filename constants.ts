import { SimulationConfig } from './types';

export const DEFAULT_CONFIG: SimulationConfig = {
  gravity: 9.8,
  cartMass: 1.0,
  poleMass: 0.1,
  poleLength: 1.0, // Increased length (slower rotation)
  forceMag: 10.0,
  tau: 0.015, // Reduced time step (slow motion relative to 60fps)
  maxSteps: 1000, // Longer episodes
  xThreshold: 2.4,
  thetaThresholdDegrees: 24, // Wider angle tolerance
};

// Visualization Scale
export const SCALE_METERS_TO_PIXELS = 100;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;