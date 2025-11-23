import React from 'react';
import { StepHistory } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';

interface AnalysisChartsProps {
  history: StepHistory[];
}

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ history }) => {
  if (!history || history.length === 0) return null;

  // Prepare data: Convert theta to degrees for easier reading
  const data = history.map(h => ({
    ...h,
    thetaDeg: h.theta * (180 / Math.PI),
  }));

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6">
       <div className="flex items-center gap-2 mb-6 border-b pb-2">
        <Activity className="text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-800">Episode Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Angle Chart */}
        <div className="h-64">
          <h3 className="text-sm font-semibold text-center text-gray-500 mb-2">Pole Angle (Degrees)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="step" hide />
              <YAxis domain={[-15, 15]} />
              <Tooltip 
                labelFormatter={(label) => `Step: ${label}`}
                formatter={(value: number) => [value.toFixed(2), 'Deg']}
              />
              <ReferenceLine y={0} stroke="#666" />
              <ReferenceLine y={12} stroke="#ffcccc" strokeDasharray="3 3" />
              <ReferenceLine y={-12} stroke="#ffcccc" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="thetaDeg" stroke="#d97706" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Position Chart */}
        <div className="h-64">
          <h3 className="text-sm font-semibold text-center text-gray-500 mb-2">Cart Position (Meters)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="step" hide />
              <YAxis domain={[-2.5, 2.5]} />
              <Tooltip 
                labelFormatter={(label) => `Step: ${label}`}
                formatter={(value: number) => [value.toFixed(2), 'm']}
              />
              <ReferenceLine y={0} stroke="#666" />
              <Line type="monotone" dataKey="x" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-4">Charts show data from the most recent completed episode.</p>
    </div>
  );
};

export default AnalysisCharts;