'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  destroyed: boolean;
}

interface GameState {
  isPlaying: boolean;
  score: number;
  lives: number;
  level: number;
  isVisible: boolean;
}

const BLOCK_BREAKER_CONFIG = {
  CANVAS_WIDTH: 300,
  CANVAS_HEIGHT: 200,
  PADDLE_WIDTH: 60,
  PADDLE_HEIGHT: 10,
  BALL_RADIUS: 5,
  BALL_SPEED: 3,
  PADDLE_SPEED: 4,
  BLOCK_WIDTH: 30,
  BLOCK_HEIGHT: 15,
  BLOCK_ROWS: 4,
  BLOCK_COLS: 8,
  BLOCK_PADDING: 2,
  MAX_LIVES: 3,
  COLORS: ['#00843D', '#F5A623', '#0088CC', '#00A99D', '#0B4C7C', '#D32F2F'],
};

export function BlockBreakerGame({ isSnakePlaying }: { isSnakePlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    lives: BLOCK_BREAKER_CONFIG.MAX_LIVES,
    level: 1,
    isVisible: false,
  });

  // Game objects
  const ballRef = useRef<Ball>({
    x: BLOCK_BREAKER_CONFIG.CANVAS_WIDTH / 2,
    y: BLOCK_BREAKER_CONFIG.CANVAS_HEIGHT - 30,
    dx: BLOCK_BREAKER_CONFIG.BALL_SPEED,
    dy: -BLOCK_BREAKER_CONFIG.BALL_SPEED,
    radius: BLOCK_BREAKER_CONFIG.BALL_RADIUS,
  });

  const paddleRef = useRef<Paddle>({
    x: BLOCK_BREAKER_CONFIG.CANVAS_WIDTH / 2 - BLOCK_BREAKER_CONFIG.PADDLE_WIDTH / 2,
    y: BLOCK_BREAKER_CONFIG.CANVAS_HEIGHT - 20,
    width: BLOCK_BREAKER_CONFIG.PADDLE_WIDTH,
    height: BLOCK_BREAKER_CONFIG.PADDLE_HEIGHT,
  });

  const blocksRef = useRef<Block[]>([]);

  // Initialize blocks
  const initializeBlocks = useCallback(() => {
    const blocks: Block[] = [];
    const startX = (BLOCK_BREAKER_CONFIG.CANVAS_WIDTH - 
      (BLOCK_BREAKER_CONFIG.BLOCK_COLS * (BLOCK_BREAKER_CONFIG.BLOCK_WIDTH + BLOCK_BREAKER_CONFIG.BLOCK_PADDING))) / 2;
    const startY = 20;

    for (let row = 0; row < BLOCK_BREAKER_CONFIG.BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_BREAKER_CONFIG.BLOCK_COLS; col++) {
        blocks.push({
          x: startX + col * (BLOCK_BREAKER_CONFIG.BLOCK_WIDTH + BLOCK_BREAKER_CONFIG.BLOCK_PADDING),
          y: startY + row * (BLOCK_BREAKER_CONFIG.BLOCK_HEIGHT + BLOCK_BREAKER_CONFIG.BLOCK_PADDING),
          width: BLOCK_BREAKER_CONFIG.BLOCK_WIDTH,
          height: BLOCK_BREAKER_CONFIG.BLOCK_HEIGHT,
          color: BLOCK_BREAKER_CONFIG.COLORS[row % BLOCK_BREAKER_CONFIG.COLORS.length],
          points: (BLOCK_BREAKER_CONFIG.BLOCK_ROWS - row) * 10,
          destroyed: false,
        });
      }
    }
    blocksRef.current = blocks;
  }, []);

  // AI logic for paddle movement
  const updateAIPaddle = useCallback(() => {
    const paddle = paddleRef.current;
    const ball = ballRef.current;
    
    // Simple AI: follow the ball
    const paddleCenter = paddle.x + paddle.width / 2;
    const ballCenter = ball.x;
    
    if (paddleCenter < ballCenter - 5) {
      paddle.x += BLOCK_BREAKER_CONFIG.PADDLE_SPEED;
    } else if (paddleCenter > ballCenter + 5) {
      paddle.x -= BLOCK_BREAKER_CONFIG.PADDLE_SPEED;
    }
    
    // Keep paddle in bounds
    paddle.x = Math.max(0, Math.min(BLOCK_BREAKER_CONFIG.CANVAS_WIDTH - paddle.width, paddle.x));
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, BLOCK_BREAKER_CONFIG.CANVAS_WIDTH, BLOCK_BREAKER_CONFIG.CANVAS_HEIGHT);

    // Draw blocks
    blocksRef.current.forEach(block => {
      if (!block.destroyed) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
      }
    });

    // Draw paddle
    ctx.fillStyle = '#00843D';
    ctx.fillRect(paddleRef.current.x, paddleRef.current.y, paddleRef.current.width, paddleRef.current.height);

    // Draw ball
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw UI
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 10, 15);
    ctx.fillText(`Lives: ${gameState.lives}`, 10, 30);
    ctx.fillText(`Level: ${gameState.level}`, 10, 45);
  }, [gameState.score, gameState.lives, gameState.level]);

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying) return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // Update AI paddle
    updateAIPaddle();

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with walls
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= BLOCK_BREAKER_CONFIG.CANVAS_WIDTH) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius <= 0) {
      ball.dy = -ball.dy;
    }

    // Ball collision with paddle
    if (ball.y + ball.radius >= paddle.y &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width &&
        ball.dy > 0) {
      ball.dy = -Math.abs(ball.dy);
      // Add some spin based on where ball hits paddle
      const hitPos = (ball.x - paddle.x) / paddle.width;
      ball.dx = (hitPos - 0.5) * 6;
    }

    // Ball collision with blocks
    blocksRef.current.forEach(block => {
      if (!block.destroyed &&
          ball.x + ball.radius >= block.x &&
          ball.x - ball.radius <= block.x + block.width &&
          ball.y + ball.radius >= block.y &&
          ball.y - ball.radius <= block.y + block.height) {
        
        block.destroyed = true;
        setGameState(prev => ({ ...prev, score: prev.score + block.points }));
        
        // Reverse ball direction
        ball.dy = -ball.dy;
      }
    });

    // Check if ball fell off screen
    if (ball.y > BLOCK_BREAKER_CONFIG.CANVAS_HEIGHT) {
      setGameState(prev => ({ ...prev, lives: prev.lives - 1 }));
      
      if (gameState.lives <= 1) {
        // Game over
        setGameState(prev => ({ ...prev, isPlaying: false }));
        return;
      }
      
      // Reset ball
      ball.x = BLOCK_BREAKER_CONFIG.CANVAS_WIDTH / 2;
      ball.y = BLOCK_BREAKER_CONFIG.CANVAS_HEIGHT - 30;
      ball.dx = BLOCK_BREAKER_CONFIG.BALL_SPEED;
      ball.dy = -BLOCK_BREAKER_CONFIG.BALL_SPEED;
    }

    // Check if all blocks destroyed
    const remainingBlocks = blocksRef.current.filter(block => !block.destroyed);
    if (remainingBlocks.length === 0) {
      // Level complete
      setGameState(prev => ({ 
        ...prev, 
        level: prev.level + 1,
        lives: Math.min(prev.lives + 1, BLOCK_BREAKER_CONFIG.MAX_LIVES)
      }));
      initializeBlocks();
      
      // Reset ball
      ball.x = BLOCK_BREAKER_CONFIG.CANVAS_WIDTH / 2;
      ball.y = BLOCK_BREAKER_CONFIG.CANVAS_HEIGHT - 30;
      ball.dx = BLOCK_BREAKER_CONFIG.BALL_SPEED;
      ball.dy = -BLOCK_BREAKER_CONFIG.BALL_SPEED;
    }

    drawGame();
  }, [gameState.isPlaying, gameState.lives, updateAIPaddle, drawGame, initializeBlocks]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isVisible: true,
      score: 0,
      lives: BLOCK_BREAKER_CONFIG.MAX_LIVES,
      level: 1
    }));
    initializeBlocks();
  }, [initializeBlocks]);

  const stopGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isVisible: false
    }));
  }, []);

  // Start/stop game based on snake game state
  useEffect(() => {
    if (isSnakePlaying && !gameState.isPlaying) {
      startGame();
    } else if (!isSnakePlaying && gameState.isPlaying) {
      stopGame();
    }
  }, [isSnakePlaying, gameState.isPlaying, startGame, stopGame]);

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying) {
      gameLoopRef.current = window.setInterval(updateGame, 16); // ~60 FPS
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
  }, [gameState.isPlaying, updateGame]);

  // Initial draw
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  if (!gameState.isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 bg-black rounded-lg shadow-2xl border-2 border-zus-green p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white">🧱 Block Breaker</h3>
        <button
          onClick={stopGame}
          className="text-white hover:text-zus-grey-300 text-lg font-bold"
        >
          ×
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={BLOCK_BREAKER_CONFIG.CANVAS_WIDTH}
        height={BLOCK_BREAKER_CONFIG.CANVAS_HEIGHT}
        className="border border-zus-grey-300 rounded"
      />

      <div className="mt-2 text-xs text-zus-grey-300 text-center">
        🤖 AI Paddle • Auto-starts with Snake
      </div>
    </div>
  );
}
