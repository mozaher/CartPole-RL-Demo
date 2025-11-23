export interface SimulationConfig {
  gravity: number;
  cartMass: number;
  poleMass: number;
  poleLength: number; // actually half-length in standard physics equations
  forceMag: number;
  tau: number; // seconds between state updates
  maxSteps: number;
  xThreshold: number; // limit of track from center
  thetaThresholdDegrees: number; // fail angle
}

export interface SimulationState {
  x: number; // cart position (meters)
  xDot: number; // cart velocity
  theta: number; // pole angle (radians)
  thetaDot: number; // pole angular velocity
  done: boolean;
  steps: number;
  terminatedCode: 'running' | 'pole_fell' | 'out_of_bounds' | 'max_steps' | 'manual_stop';
}

export interface StepHistory {
  step: number;
  x: number;
  theta: number;
  action: number; // -1 (left) or 1 (right)
}

export enum Action {
  LEFT = 0,
  RIGHT = 1,
}