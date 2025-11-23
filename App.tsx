import React, { useState } from 'react';
import Simulation from './components/Simulation';
import ConfigPanel from './components/ConfigPanel';
import AnalysisCharts from './components/AnalysisCharts';
import { DEFAULT_CONFIG } from './constants';
import { SimulationConfig, StepHistory } from './types';
import { BrainCircuit } from 'lucide-react';

function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<StepHistory[]>([]);

  const handleConfigChange = (newConfig: SimulationConfig) => {
    setConfig(newConfig);
  };

  const handleHistoryUpdate = (newHistory: StepHistory[]) => {
    setHistory(newHistory);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-gray-900">CartPole RL</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Reinforcement Learning Environment Demo</p>
            </div>
          </div>
          <div className="text-right">
             <a href="https://github.com/openai/gym/blob/master/gym/envs/classic_control/cartpole.py" target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
               Based on OpenAI Gym
             </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Intro Text */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <p className="text-gray-600 text-lg">
            Balance the pole by moving the cart left or right. 
            <br />
            <span className="text-sm text-gray-500">
              This simulation demonstrates the classic control problem used in Reinforcement Learning. 
              The cart uses <strong className="text-gray-700">Bang-Bang control</strong> (constant force), making it inherently unstable.
            </span>
          </p>
        </div>

        {/* Game Area */}
        <section className="flex flex-col items-center">
          <Simulation config={config} onHistoryUpdate={handleHistoryUpdate} />
        </section>

        {/* Parameters */}
        <section>
          <ConfigPanel 
            config={config} 
            onChange={handleConfigChange} 
            disabled={false} 
          />
        </section>

        {/* Analytics */}
        <section>
           <AnalysisCharts history={history} />
        </section>
      </main>
    </div>
  );
}

export default App;