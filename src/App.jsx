import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Users, Zap, CheckCircle2 } from 'lucide-react';

// The mock events that can happen in our simulated match
const MATCH_EVENTS = [
  "Home Goal", "Away Goal", "Yellow Card", "Corner Kick",
  "Shot on Target", "Foul", "Substitution", "Red Card",
  "VAR Review", "Free Kick", "Penalty", "Header",
  "Goalkeeper Save", "Cross", "Tackle", "Throw-in"
];

// Shuffle function to randomize the bingo board for different players
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function App() {
  const [board, setBoard] = useState([]);
  const [marked, setMarked] = useState([]);
  const [feed, setFeed] = useState([]);
  const [hasBingo, setHasBingo] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize a random board on load
  useEffect(() => {
    setBoard(shuffleArray(MATCH_EVENTS));
  }, []);

  // Check for Bingo every time a square is marked
  useEffect(() => {
    if (marked.length < 4 || hasBingo) return;

    const winningLines = [
      [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
      [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Cols
      [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
    ];

    const isBingo = winningLines.some(line => 
      line.every(index => marked.includes(board[index]))
    );

    if (isBingo) {
      setHasBingo(true);
      setScore(prev => prev + 500); // 500 bonus points for Bingo
      setFeed(prev => [{ time: new Date().toLocaleTimeString(), text: "🎉 BINGO! +500 PTS", highlight: true }, ...prev]);
    }
  }, [marked, board, hasBingo]);

  // Simulate receiving a live WebSocket event from AWS API Gateway
  const simulateLiveEvent = () => {
    // Pick a random event that hasn't been marked yet
    const unmarkedEvents = board.filter(event => !marked.includes(event));
    if (unmarkedEvents.length === 0) return;

    const randomEvent = unmarkedEvents[Math.floor(Math.random() * unmarkedEvents.length)];
    
    // Update the live feed
    setFeed(prev => [{ time: new Date().toLocaleTimeString(), text: `Live: ${randomEvent} occurred!`, highlight: false }, ...prev]);
    
    // Mark the square and give points
    setMarked(prev => [...prev, randomEvent]);
    setScore(prev => prev + 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Fan Squad</h1>
            <p className="text-sm text-slate-400">Live Match Experience</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">Squad Room: #DFL-99</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-xl font-bold text-yellow-500">{score} pts</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Bingo Board */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            
            {hasBingo && (
              <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col animate-in fade-in duration-500">
                <Trophy className="w-24 h-24 text-yellow-400 mb-4 animate-bounce" />
                <h2 className="text-5xl font-extrabold text-white tracking-wider drop-shadow-lg">BINGO!</h2>
                <p className="text-blue-200 mt-2 font-medium">Squad Multiplier Activated</p>
                <button 
                  onClick={() => { setHasBingo(false); setMarked([]); setBoard(shuffleArray(MATCH_EVENTS)); }}
                  className="mt-6 px-6 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 transition"
                >
                  New Card
                </button>
              </div>
            )}

            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Matchday Bingo</h2>
                <p className="text-sm text-slate-400">Squares unlock automatically via live match data.</p>
              </div>
              
              {/* This button represents what AWS API Gateway WebSockets will do later! */}
              <button 
                onClick={simulateLiveEvent}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition active:scale-95 shadow-lg shadow-blue-900/20"
              >
                <Activity className="w-4 h-4" />
                Simulate Data Feed
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {board.map((event, index) => {
                const isMarked = marked.includes(event);
                return (
                  <div 
                    key={index}
                    className={`aspect-square flex flex-col items-center justify-center p-3 text-center rounded-xl border-2 transition-all duration-300 ${
                      isMarked 
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {isMarked ? <CheckCircle2 className="w-6 h-6 text-blue-400 mb-2" /> : <div className="w-6 h-6 mb-2 opacity-10" />}
                    <span className="text-xs sm:text-sm font-semibold leading-tight">
                      {event}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Feed & Squad Leaderboard */}
        <div className="space-y-6">
          
          {/* Live Event Feed */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-lg font-bold">Live Pitch Events</h3>
            </div>
            
            <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {feed.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center mt-10">Waiting for match kickoff...</p>
              ) : (
                feed.map((item, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm border ${item.highlight ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    <span className="text-xs opacity-50 block mb-1">{item.time}</span>
                    {item.text}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mock Leaderboard */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Squad Leaderboard
            </h3>
            <div className="space-y-3">
              {[
                { name: "You", score: score, isMe: true },
                { name: "Alex_M", score: 1250, isMe: false },
                { name: "Sarah11", score: 850, isMe: false },
                { name: "KigaliDev", score: 400, isMe: false },
              ].sort((a, b) => b.score - a.score).map((player, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${player.isMe ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-slate-950'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm">#{i + 1}</span>
                    <span className={`font-medium ${player.isMe ? 'text-blue-400' : 'text-slate-200'}`}>{player.name}</span>
                  </div>
                  <span className="font-bold text-slate-300">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}