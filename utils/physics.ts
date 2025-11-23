import { SimulationConfig, SimulationState, Action } from '../types';

/**
 * Updates the physics state of the CartPole system by one timestep.
 * Implementation based on correct dynamics (e.g. OpenAI Gym source).
 */
export const updatePhysics = (
  state: SimulationState,
  action: Action,
  config: SimulationConfig
): SimulationState => {
  const {
    gravity,
    cartMass,
    poleMass,
    poleLength,
    forceMag,
    tau,
    xThreshold,
    thetaThresholdDegrees,
    maxSteps,
  } = config;

  const totalMass = cartMass + poleMass;
  const poleMassLength = poleMass * poleLength;
  
  // Determine force direction: 0 -> -force, 1 -> +force
  const force = action === Action.RIGHT ? forceMag : -forceMag;

  const { x, xDot, theta, thetaDot, steps } = state;
  
  const costheta = Math.cos(theta);
  const sintheta = Math.sin(theta);

  // Calculations for acceleration
  const temp = (force + poleMassLength * thetaDot * thetaDot * sintheta) / totalMass;
  
  const thetaAcc =
    (gravity * sintheta - costheta * temp) /
    (poleLength * (4.0 / 3.0 - (poleMass * costheta * costheta) / totalMass));

  const xAcc = temp - (poleMassLength * thetaAcc * costheta) / totalMass;

  // Euler integration
  const nextX = x + tau * xDot;
  const nextXDot = xDot + tau * xAcc;
  const nextTheta = theta + tau * thetaDot;
  const nextThetaDot = thetaDot + tau * thetaAcc;

  // Check termination conditions
  const thetaThresholdRad = (thetaThresholdDegrees * Math.PI) / 180;
  const nextSteps = steps + 1;

  let terminatedCode: SimulationState['terminatedCode'] = 'running';
  let done = false;

  if (nextX < -xThreshold || nextX > xThreshold) {
    done = true;
    terminatedCode = 'out_of_bounds';
  } else if (nextTheta < -thetaThresholdRad || nextTheta > thetaThresholdRad) {
    done = true;
    terminatedCode = 'pole_fell';
  } else if (nextSteps >= maxSteps) {
    done = true;
    terminatedCode = 'max_steps';
  }

  return {
    x: nextX,
    xDot: nextXDot,
    theta: nextTheta,
    thetaDot: nextThetaDot,
    done,
    steps: nextSteps,
    terminatedCode,
  };
};

/**
 * Generates a random initial state closer to the center/vertical
 */
export const getInitialState = (): SimulationState => {
  // Randomize slightly (-0.05 to 0.05)
  const rand = () => Math.random() * 0.1 - 0.05;
  
  return {
    x: rand(),
    xDot: rand(),
    theta: rand(), // +/- ~3 degrees start
    thetaDot: rand(),
    done: false,
    steps: 0,
    terminatedCode: 'running',
  };
};