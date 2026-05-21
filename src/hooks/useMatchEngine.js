import { useState, useEffect, useCallback } from 'react';

// A list of the parsed DFL events to generate our board
const POSSIBLE_EVENTS = [
  "Goal", "Shot on Target", "Tackle", "Foul", "Yellow Card", 
  "Substitution", "Pass", "Throw-in", "Cross", "Corner", 
  "Offside", "Save", "Free Kick", "Clearance", "Interception", "Block"
];

// Helper to shuffle and pick 16 random events for the 4x4 board
const generateRandomBoard = () => {
  const shuffled = [...POSSIBLE_EVENTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 16).map((action, index) => ({
    id: index,
    action: action,
    isMarked: false,
  }));
};

export function useMatchEngine() {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [recentEvents, setRecentEvents] = useState([]);
  const [gameState, setGameState] = useState({
    playerScore: 0,
    opponentScore: 0, 
    latestLiveEvent: null,
    board: generateRandomBoard(),
  });

  const AWS_WSS_URL = import.meta.env.VITE_AWS_WSS_URL;

  useEffect(() => {
    if (!AWS_WSS_URL) return;

    let ws = new WebSocket(AWS_WSS_URL);

    ws.onopen = () => setConnectionStatus('Connected');
    ws.onclose = () => setConnectionStatus('Disconnected');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'LIVE_MATCH_EVENT') {
          const liveAction = data.payload.event;
          
          setGameState(prev => ({ ...prev, latestLiveEvent: liveAction }));
          
          setRecentEvents(prev => [
            { id: Date.now(), text: `Live: ${liveAction}`, type: 'system' },
            ...prev
          ].slice(0, 8)); // Keep the feed clean and performant
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    // Cleanup on unmount
    return () => ws.close();
  }, [AWS_WSS_URL]);

  // The Gamification Logic: Reward users for marking the correct square 
  const markSquare = useCallback((squareId, squareAction) => {
    setGameState(prev => {
      // Rule 1: You can only mark a square if it hasn't been marked yet
      const square = prev.board.find(sq => sq.id === squareId);
      if (square?.isMarked) return prev;

      // Rule 2: It must match the event currently happening in the live match
      if (squareAction === prev.latestLiveEvent) {
        const updatedBoard = prev.board.map(sq => 
          sq.id === squareId ? { ...sq, isMarked: true } : sq
        );
        return { 
          ...prev, 
          board: updatedBoard, 
          playerScore: prev.playerScore + 100 // +100 points for a correct hit! 
        };
      }
      
      // If they click the wrong square, nothing happens (or you could deduct points here!)
      return prev;
    });
  }, []);

  return { gameState, markSquare, connectionStatus, recentEvents };
}