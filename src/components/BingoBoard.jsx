import React from 'react';

export default function BingoBoard({ board, onMarkSquare, latestEvent }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-slate-700">
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {board.map((square) => {
          
          // Check if this specific square matches what is happening right now in the match
          const isLiveTarget = square.action === latestEvent && !square.isMarked;
          
          return (
            <button
              key={square.id}
              onClick={() => onMarkSquare(square.id, square.action)}
              disabled={square.isMarked}
              className={`
                relative flex items-center justify-center aspect-square p-2 rounded-xl text-center transition-all duration-300 font-medium text-sm md:text-base
                ${square.isMarked 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 border border-slate-600 hover:border-slate-400'}
                ${isLiveTarget 
                  ? 'animate-pulse ring-4 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-slate-600' 
                  : ''}
              `}
            >
              {/* The text inside the square */}
              <span className="z-10">{square.action}</span>
              
              {/* A visual overlay when marked */}
              {square.isMarked && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}