import React from 'react';

export default function LiveFeed({ events }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-slate-700 h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: 'Bebas Neue' }}>
          Live <span className="text-emerald-400">Match Feed</span>
        </h2>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center mt-10">Waiting for kickoff...</p>
        ) : (
          events.map((event, index) => (
            <div 
              key={event.id} 
              // The newest event gets a special highlight animation
              className={`p-3 rounded-lg text-sm transition-all duration-500 ${
                index === 0 
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-100 translate-x-0 opacity-100' 
                  : 'bg-slate-700/30 text-slate-400 translate-x-0 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono opacity-50">
                  {new Date(event.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </span>
                <span className="font-medium">{event.text}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}