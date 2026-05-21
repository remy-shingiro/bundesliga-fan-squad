import React from 'react';

export default function ScoreHeader({ playerScore, opponentScore, target = 1600 }) {
  // Calculate progress percentages (capped at 100%)
  const playerProgress = Math.min((playerScore / target) * 100, 100);
  const opponentProgress = Math.min((opponentScore / target) * 100, 100);

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-8 mb-4">
      
      {/* Player Score Card */}
      <div className="bg-slate-800/80 rounded-xl p-4 border-b-4 border-emerald-500 shadow-lg">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Score</p>
        <p className="text-4xl font-black text-emerald-400" style={{ fontFamily: 'Bebas Neue' }}>
          {playerScore}
        </p>
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 h-2 mt-3 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-700 ease-out" 
            style={{ width: `${playerProgress}%` }}
          />
        </div>
      </div>

      {/* Opponent Score Card */}
      <div className="bg-slate-800/80 rounded-xl p-4 border-b-4 border-rose-500 shadow-lg relative overflow-hidden">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Opponent</p>
        <p className="text-4xl font-black text-rose-400" style={{ fontFamily: 'Bebas Neue' }}>
          {opponentScore}
        </p>
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 h-2 mt-3 rounded-full overflow-hidden">
          <div 
            className="bg-rose-500 h-full transition-all duration-700 ease-out" 
            style={{ width: `${opponentProgress}%` }}
          />
        </div>
      </div>

    </div>
  );
}