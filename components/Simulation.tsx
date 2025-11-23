import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Action, SimulationConfig, SimulationState, StepHistory } from '../types';
import { updatePhysics, getInitialState } from '../utils/physics';
import { SCALE_METERS_TO_PIXELS, CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants';
import { Play, RotateCcw, Pause, Trophy, MoveHorizontal } from 'lucide-react';

interface SimulationProps {
  config: SimulationConfig;
  onHistoryUpdate: (history: StepHistory[]) => void;
}

const Simulation: React.FC<SimulationProps> = ({ config, onHistoryUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Physics state held in ref for performance (avoiding React render cycle for 60fps logic)
  const physicsStateRef = useRef<SimulationState>(getInitialState());
  const historyRef = useRef<StepHistory[]>([]);
  
  // Current Action (Persistent because the cart *always* moves)
  // Defaulting to RIGHT (1) initially
  const currentActionRef = useRef<Action>(Action.RIGHT);
  
  // UI State
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [terminationMsg, setTerminationMsg] = useState<string | null>(null);

  // Start Game
  const handleStart = useCallback(() => {
    if (physicsStateRef.current.done) {
      physicsStateRef.current = getInitialState();
      historyRef.current = [];
      setScore(0);
      setTerminationMsg(null);
    }
    setIsRunning(true);
  }, []);

  // Reset Game
  const handleReset = useCallback(() => {
    physicsStateRef.current = getInitialState();
    historyRef.current = [];
    setScore(0);
    setTerminationMsg(null);
    setIsRunning(false);
    
    // Initial Draw
    setTimeout(draw, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]); // Re-draw if config changes

  const handlePause = () => {
    setIsRunning(false);
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (e.key === 'ArrowLeft') {
          currentActionRef.current = Action.LEFT;
        } else if (e.key === 'ArrowRight') {
          currentActionRef.current = Action.RIGHT;
        }

        // Auto-start or Resume on key press
        if (!isRunning) {
          handleStart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, handleStart]);

  // Game Loop
  const tick = useCallback(() => {
    if (!isRunning) return;

    const currentState = physicsStateRef.current;
    const action = currentActionRef.current;

    // Update Physics
    const nextState = updatePhysics(currentState, action, config);
    physicsStateRef.current = nextState;

    // Record History (limit size to prevent memory leaks in long runs, though maxSteps handles this)
    historyRef.current.push({
      step: nextState.steps,
      x: nextState.x,
      theta: nextState.theta,
      action: action === Action.LEFT ? -1 : 1,
    });

    // Update UI Score (throttled effectively by React batching, but good to be safe)
    setScore(nextState.steps);

    // Draw Frame
    draw();

    if (nextState.done) {
      setIsRunning(false);
      if (nextState.steps > highScore) {
        setHighScore(nextState.steps);
      }
      onHistoryUpdate(historyRef.current);
      
      // Set message
      switch (nextState.terminatedCode) {
        case 'pole_fell': setTerminationMsg("Failed: Pole tilted too far!"); break;
        case 'out_of_bounds': setTerminationMsg("Failed: Cart went off track!"); break;
        case 'max_steps': setTerminationMsg("Success: Maximum steps reached!"); break;
        default: setTerminationMsg("Game Over");
      }
    } else {
      requestRef.current = requestAnimationFrame(tick);
    }
  }, [isRunning, config, highScore, onHistoryUpdate]);

  // Trigger loop when running state changes
  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(tick);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, tick]);

  // Initial draw on mount and config change
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // Canvas Drawing Logic
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = physicsStateRef.current;
    
    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#f3f4f6'; // bg-gray-100
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT * 0.7; // Ground level
    
    // Track Limits
    const limitPixels = config.xThreshold * SCALE_METERS_TO_PIXELS;
    
    // Draw Track
    ctx.beginPath();
    ctx.moveTo(centerX - limitPixels, centerY + 20);
    ctx.lineTo(centerX + limitPixels, centerY + 20);
    ctx.strokeStyle = '#9ca3af'; // gray-400
    ctx.lineWidth = 4;
    ctx.stroke();

    // Limit Markers
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.fillRect(centerX - limitPixels - 5, centerY + 10, 10, 20);
    ctx.fillRect(centerX + limitPixels - 5, centerY + 10, 10, 20);

    // Calculate Cart Position
    const cartX = centerX + state.x * SCALE_METERS_TO_PIXELS;
    const cartY = centerY;
    const cartWidth = 60;
    const cartHeight = 35;

    // Draw Cart
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.fillRect(cartX - cartWidth / 2, cartY - cartHeight / 2, cartWidth, cartHeight);
    ctx.strokeRect(cartX - cartWidth / 2, cartY - cartHeight / 2, cartWidth, cartHeight);

    // Draw Wheel 1
    ctx.beginPath();
    ctx.arc(cartX - 20, cartY + cartHeight/2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();

    // Draw Wheel 2
    ctx.beginPath();
    ctx.arc(cartX + 20, cartY + cartHeight/2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();

    // Draw Force Indicator (Arrow)
    const arrowDir = currentActionRef.current === Action.LEFT ? -1 : 1;
    const arrowColor = '#f59e0b'; // amber-500
    
    ctx.beginPath();
    // Start of arrow shaft
    ctx.moveTo(cartX + (arrowDir * 35), cartY);
    // End of arrow shaft
    ctx.lineTo(cartX + (arrowDir * 60), cartY);
    // Top wing
    ctx.lineTo(cartX + (arrowDir * 50), cartY - 8);
    // Back to tip
    ctx.moveTo(cartX + (arrowDir * 60), cartY);
    // Bottom wing
    ctx.lineTo(cartX + (arrowDir * 50), cartY + 8);
    
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Pole Geometry
    // Visual length: Scale * (poleLength * 2)
    const visualPoleLen = config.poleLength * 2 * SCALE_METERS_TO_PIXELS;
    
    // Tip coordinates
    const poleTipX = cartX + visualPoleLen * Math.sin(state.theta);
    const poleTipY = cartY - visualPoleLen * Math.cos(state.theta);

    // Draw Failure Angle Threshold Guides
    const threshRad = config.thetaThresholdDegrees * Math.PI / 180;
    const guideLen = visualPoleLen * 1.2;
    
    ctx.beginPath();
    ctx.moveTo(cartX, cartY);
    ctx.lineTo(cartX + guideLen * Math.sin(threshRad), cartY - guideLen * Math.cos(threshRad));
    ctx.moveTo(cartX, cartY);
    ctx.lineTo(cartX + guideLen * Math.sin(-threshRad), cartY - guideLen * Math.cos(-threshRad));
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)'; // Faint red
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Pole
    ctx.beginPath();
    ctx.moveTo(cartX, cartY);
    ctx.lineTo(poleTipX, poleTipY);
    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Highlight Pole if near failure
    if (Math.abs(state.theta) > threshRad * 0.8) {
       ctx.beginPath();
       ctx.moveTo(cartX, cartY);
       ctx.lineTo(poleTipX, poleTipY);
       ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // red glow overlay
       ctx.lineWidth = 8;
       ctx.lineCap = 'round';
       ctx.stroke();
    }

    // Draw Pivot
    ctx.beginPath();
    ctx.arc(cartX, cartY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="relative mb-4 border-4 border-gray-300 rounded-lg overflow-hidden bg-gray-100 select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
        
        {/* Overlay for Game Over */}
        {terminationMsg && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col text-white animate-in fade-in duration-200">
            <h3 className="text-2xl font-bold mb-2 text-center">{terminationMsg}</h3>
            <div className="text-5xl font-mono font-bold my-2 text-amber-400">{score}</div>
            <p className="text-gray-300 text-sm uppercase tracking-widest mb-6">Steps Survived</p>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full animate-pulse">
                <MoveHorizontal size={20} />
                <span className="font-semibold">Press Arrow Keys to Try Again</span>
            </div>
          </div>
        )}

        {/* HUD */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm text-gray-800 pointer-events-none">
           <div className="font-mono font-bold text-xl">Steps: {score}</div>
           <div className="text-xs text-gray-500 uppercase tracking-wide">Target: {config.maxSteps}</div>
        </div>

        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-amber-600 pointer-events-none">
           <Trophy size={20} />
           <span className="font-mono font-bold text-xl">{highScore}</span>
        </div>
        
        {/* Instructions overlay (only if not running and no result yet) */}
        {!isRunning && !terminationMsg && score === 0 && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="bg-white/90 backdrop-blur px-8 py-6 rounded-xl shadow-xl text-center pointer-events-auto border border-gray-200">
               <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready?</h2>
               <div className="flex items-center justify-center gap-4 my-6">
                  <div className="flex flex-col items-center">
                    <span className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg border-b-4 border-gray-300 text-2xl font-bold text-gray-700">←</span>
                    <span className="text-xs text-gray-500 mt-2 font-medium">Left</span>
                  </div>
                   <span className="text-gray-400 font-bold text-sm">OR</span>
                  <div className="flex flex-col items-center">
                    <span className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg border-b-4 border-gray-300 text-2xl font-bold text-gray-700">→</span>
                    <span className="text-xs text-gray-500 mt-2 font-medium">Right</span>
                  </div>
               </div>
               <p className="text-indigo-600 font-semibold animate-pulse">Press any arrow key to start</p>
             </div>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full justify-between items-center px-2">
        <div className="text-sm text-gray-500 font-mono">
          Action: {currentActionRef.current === Action.LEFT ? 'PUSH LEFT' : 'PUSH RIGHT'}
        </div>
        <div className="flex gap-2">
          {isRunning ? (
             <button
               onClick={handlePause}
               className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
             >
               <Pause size={16} /> Pause
             </button>
          ) : (
            score > 0 && !terminationMsg && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Play size={16} /> Resume
              </button>
            )
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Simulation;