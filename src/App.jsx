import { useMatchEngine } from './hooks/useMatchEngine';
import ScoreHeader from './components/ScoreHeader';
import BingoBoard from './components/BingoBoard';
import LiveFeed from './components/LiveFeed';

export default function App() {
  const { 
    gameState, 
    markSquare, 
    connectionStatus,
    recentEvents 
  } = useMatchEngine();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Top Navigation & Status */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-widest uppercase" style={{ fontFamily: 'Bebas Neue' }}>
            Matchday <span className="text-blue-500">Bingo</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400">Room: DFL-99</span>
            <div className={`h-3 w-3 rounded-full animate-pulse ${
              connectionStatus === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
          </div>
        </div>
      </nav>

      {/* Main Game Interface */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Gamification & Board */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <ScoreHeader 
            playerScore={gameState.playerScore} 
            opponentScore={gameState.opponentScore} 
            target={16} // Assuming a 4x4 board
          />
          <BingoBoard 
            board={gameState.board} 
            onMarkSquare={markSquare} 
            latestEvent={gameState.latestLiveEvent}
          />
        </div>

        {/* Right Column: Multiplayer Live Feed */}
        <div className="lg:col-span-4">
          <LiveFeed events={recentEvents} />
        </div>

      </main>
    </div>
  );
}