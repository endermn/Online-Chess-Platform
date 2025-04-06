import React, { useEffect, useRef, useState } from 'react';

const ChessBot = ({ fen, onMove, playerColor, difficulty = 10, enabled = false }) => {
  const [isThinking, setIsThinking] = useState(false);
  const engineRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      const stockfishScript = document.createElement('script');
      stockfishScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';
      stockfishScript.async = true;
      stockfishScript.onload = initEngine;
      document.body.appendChild(stockfishScript);
    }
    
    return () => {
      if (engineRef.current) {
        engineRef.current.terminate();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled]);

  const initEngine = () => {
    try {
      engineRef.current = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
      
      engineRef.current.postMessage('uci');
      engineRef.current.postMessage('setoption name Skill Level value ' + difficulty);
      engineRef.current.postMessage('isready');
      
      engineRef.current.onmessage = (e) => {
        const message = e.data;
        
        if (message.includes('bestmove')) {
          const bestMove = message.split(' ')[1];
          if (bestMove && bestMove !== '(none)') {
            makeMove(bestMove);
          }
          setIsThinking(false);
        }
      };
      
      console.log('Chess engine initialized');
    } catch (error) {
      console.error('Failed to initialize chess engine:', error);
    }
  };

  const makeMove = (lanMove) => {
    if (!lanMove || !onMove) return;
    
    const fromSquare = lanMove.substring(0, 2);
    const toSquare = lanMove.substring(2, 4);
    const promotion = lanMove.length > 4 ? lanMove.substring(4, 5) : null;
    
    const moveObj = {
      move: {
        lan: lanMove,
        from: fromSquare,
        to: toSquare,
        color: playerColor === 'white' ? 'b' : 'w',
        promotion: promotion
      },
      piece: null,
      from: null,
      to: null
    };
    
    onMove(moveObj, null, promotion);
  };

  useEffect(() => {
    const isBotTurn = fen && enabled && (
      (playerColor === 'white' && fen.includes(' b ')) || 
      (playerColor === 'black' && fen.includes(' w '))
    );
    
    if (isBotTurn && engineRef.current && !isThinking) {
      setIsThinking(true);
      
      timeoutRef.current = setTimeout(() => {
        engineRef.current.postMessage('position fen ' + fen);
        engineRef.current.postMessage('go movetime 1000');
      }, 500);
    }
  }, [fen, playerColor, enabled]);

  return null;
};

export default ChessBot;