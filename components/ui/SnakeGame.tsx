'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './Button';

interface Position {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
  color: string;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  highScore: number;
}

const GAME_CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 300,
  GRID_SIZE: 20,
  INITIAL_SPEED: 150,
  MIN_SPEED: 80,
  SPEED_INCREMENT: 5,
  FOOD_COLORS: ['#00843D', '#F5A623', '#0088CC', '#00A99D', '#0B4C7C'],
};

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [typedSequence, setTypedSequence] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,
  });

  // Game state
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Position>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Position>({ x: 1, y: 0 });
  const foodRef = useRef<Food>({ x: 15, y: 15, color: '#00843D' });
  const speedRef = useRef(GAME_CONFIG.INITIAL_SPEED);

  // Hidden trigger: listen for "snake" typing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Only process letter keys
      if (key.length === 1 && /[a-z]/.test(key)) {
        setTypedSequence(prev => {
          const newSequence = (prev + key).slice(-5); // Keep last 5 characters
          
          // Check if "snake" is typed
          if (newSequence.includes('snake')) {
            setShowButton(true);
            return ''; // Reset sequence after finding "snake"
          }
          
          return newSequence;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const generateFood = useCallback((): Food => {
    const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE) - 1;
    const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) - 1;
    
    let newFood: Food;
    do {
      newFood = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
        color: GAME_CONFIG.FOOD_COLORS[Math.floor(Math.random() * GAME_CONFIG.FOOD_COLORS.length)],
      };
    } while (snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_CONFIG.CANVAS_WIDTH; x += GAME_CONFIG.GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_CONFIG.CANVAS_HEIGHT; y += GAME_CONFIG.GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONFIG.CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#00843D' : '#00A99D';
      ctx.fillRect(
        segment.x * GAME_CONFIG.GRID_SIZE + 1,
        segment.y * GAME_CONFIG.GRID_SIZE + 1,
        GAME_CONFIG.GRID_SIZE - 2,
        GAME_CONFIG.GRID_SIZE - 2
      );
      
      // Add eyes to head
      if (index === 0) {
        ctx.fillStyle = '#FFFFFF';
        const eyeSize = 3;
        const eyeOffset = 4;
        ctx.fillRect(
          segment.x * GAME_CONFIG.GRID_SIZE + eyeOffset,
          segment.y * GAME_CONFIG.GRID_SIZE + eyeOffset,
          eyeSize,
          eyeSize
        );
        ctx.fillRect(
          segment.x * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE - eyeOffset - eyeSize,
          segment.y * GAME_CONFIG.GRID_SIZE + eyeOffset,
          eyeSize,
          eyeSize
        );
      }
    });

    // Draw food
    ctx.fillStyle = foodRef.current.color;
    ctx.fillRect(
      foodRef.current.x * GAME_CONFIG.GRID_SIZE + 2,
      foodRef.current.y * GAME_CONFIG.GRID_SIZE + 2,
      GAME_CONFIG.GRID_SIZE - 4,
      GAME_CONFIG.GRID_SIZE - 4
    );
  }, []);

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const snake = snakeRef.current;
    const direction = nextDirectionRef.current;
    const food = foodRef.current;

    // Update direction
    directionRef.current = direction;

    // Move snake head
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Check wall collision
    const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE) - 1;
    const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) - 1;
    
    if (head.x < 0 || head.x > maxX || head.y < 0 || head.y > maxY) {
      gameOver();
      return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      // Eat food
      setGameState(prev => ({ ...prev, score: prev.score + 10 }));
      foodRef.current = generateFood();
      
      // Increase speed
      speedRef.current = Math.max(
        GAME_CONFIG.MIN_SPEED,
        speedRef.current - GAME_CONFIG.SPEED_INCREMENT
      );
    } else {
      // Remove tail
      snake.pop();
    }

    drawGame();
  }, [gameState.isPlaying, gameState.isPaused, generateFood, drawGame]);

  const gameOver = useCallback(() => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      return {
        ...prev,
        isPlaying: false,
        isPaused: false,
        highScore: newHighScore,
      };
    });
    
    // Reset game
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood();
    speedRef.current = GAME_CONFIG.INITIAL_SPEED;
  }, [generateFood]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: true, isPaused: false, score: 0 }));
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood();
    speedRef.current = GAME_CONFIG.INITIAL_SPEED;
  }, [generateFood]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: false, isPaused: false, score: 0 }));
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood();
    speedRef.current = GAME_CONFIG.INITIAL_SPEED;
  }, [generateFood]);

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      gameLoopRef.current = window.setInterval(updateGame, speedRef.current);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, updateGame]);

  // Keyboard controls for snake movement
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      const key = e.key;
      const currentDirection = directionRef.current;

      // Prevent reverse direction
      switch (key) {
        case 'ArrowUp':
          if (currentDirection.y === 0) {
            nextDirectionRef.current = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
          if (currentDirection.y === 0) {
            nextDirectionRef.current = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
          if (currentDirection.x === 0) {
            nextDirectionRef.current = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
          if (currentDirection.x === 0) {
            nextDirectionRef.current = { x: 1, y: 0 };
          }
          break;
        case ' ':
          e.preventDefault();
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying, pauseGame]);

  // Initial draw
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  // Don't render anything if the button shouldn't be shown
  if (!showButton) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="success"
          size="sm"
          className="shadow-lg"
        >
          🐍 Graj w Snake
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border-2 border-zus-green p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-zus-grey-900">🐍 Snake Game</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-zus-grey-500 hover:text-zus-grey-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <div className="mb-3 flex justify-between text-sm">
        <span className="text-zus-grey-700">Wynik: <span className="font-bold text-zus-green">{gameState.score}</span></span>
        <span className="text-zus-grey-700">Rekord: <span className="font-bold text-zus-orange">{gameState.highScore}</span></span>
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS_WIDTH}
        height={GAME_CONFIG.CANVAS_HEIGHT}
        className="border border-zus-grey-300 rounded"
      />

      <div className="mt-3 flex gap-2">
        {!gameState.isPlaying ? (
          <Button onClick={startGame} variant="success" size="sm" className="flex-1">
            ▶️ Start
          </Button>
        ) : (
          <Button onClick={pauseGame} variant="secondary" size="sm" className="flex-1">
            {gameState.isPaused ? '▶️ Wznów' : '⏸️ Pauza'}
          </Button>
        )}
        <Button onClick={resetGame} variant="secondary" size="sm" className="flex-1">
          🔄 Reset
        </Button>
      </div>

      <div className="mt-2 text-xs text-zus-grey-600 text-center">
        Użyj strzałek do sterowania • Spacja = pauza
      </div>
    </div>
  );
}