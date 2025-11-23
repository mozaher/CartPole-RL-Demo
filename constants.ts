import { SimulationConfig } from './types';

export const DEFAULT_CONFIG: SimulationConfig = {
  gravity: 9.8,
  cartMass: 1.0,
  poleMass: 0.1,
  poleLength: 1.5, // Increased length significantly for slower dynamics
  forceMag: 10.0,
  tau: 0.008, // Significantly reduced time step for slow-motion effect
  maxSteps: 1000, 
  xThreshold: 2.4,
  thetaThresholdDegrees: 24, 
};

// Visualization Scale
export const SCALE_METERS_TO_PIXELS = 100;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;