import React from 'react';
import { SimulationConfig } from '../types';
import { Settings2 } from 'lucide-react';

interface ConfigPanelProps {
  config: SimulationConfig;
  onChange: (newConfig: SimulationConfig) => void;
  disabled: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, disabled }) => {
  
  const handleChange = (key: keyof SimulationConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-6 border-b pb-2">
        <Settings2 className="text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-800">Environment Parameters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gravity */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Gravity (m/s²)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.1"
              value={config.gravity}
              disabled={disabled}
              onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <span className="w-12 text-right font-mono text-sm text-gray-700">{config.gravity.toFixed(1)}</span>
          </div>
        </div>

        {/* Force Magnitude */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Force Magnitude (N)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1.0"
              max="50.0"
              step="1.0"
              value={config.forceMag}
              disabled={disabled}
              onChange={(e) => handleChange('forceMag', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <span className="w-12 text-right font-mono text-sm text-gray-700">{config.forceMag}</span>
          </div>
        </div>

        {/* Pole Mass */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Pole Mass (kg)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.05"
              max="2.0"
              step="0.05"
              value={config.poleMass}
              disabled={disabled}
              onChange={(e) => handleChange('poleMass', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <span className="w-12 text-right font-mono text-sm text-gray-700">{config.poleMass.toFixed(2)}</span>
          </div>
        </div>

        {/* Pole Length */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Pole Half-Length (m)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={config.poleLength}
              disabled={disabled}
              onChange={(e) => handleChange('poleLength', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <span className="w-12 text-right font-mono text-sm text-gray-700">{config.poleLength.toFixed(1)}</span>
          </div>
        </div>

        {/* Max Steps */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Max Steps</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={config.maxSteps}
              disabled={disabled}
              onChange={(e) => handleChange('maxSteps', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <span className="w-12 text-right font-mono text-sm text-gray-700">{config.maxSteps}</span>
          </div>
        </div>

         {/* Update Frequency (Speed) */}
         <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Physics Timestep (s)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.001"
              value={config.tau}
              disabled={disabled}
              onChange={(e) => handleChange('tau', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <span className="w-12 text-right font-mono text-sm text-gray-700">{config.tau.toFixed(3)}</span>
          </div>
        </div>

        {/* Failure Angle */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Fail Angle (Deg)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              value={config.thetaThresholdDegrees}
              disabled={disabled}
              onChange={(e) => handleChange('thetaThresholdDegrees', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
            />
            <span className="w-12 text-right font-mono text-sm text-gray-700">{config.thetaThresholdDegrees}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConfigPanel;