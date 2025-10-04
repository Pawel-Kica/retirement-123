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
  dy: number;
}

interface GameState {
  isPlaying: boolean;
  leftScore: number;
  rightScore: number;
  isVisible: boolean;
}

const PONG_CONFIG = {
  CANVAS_WIDTH: 300,
  CANVAS_HEIGHT: 200,
  PADDLE_WIDTH: 10,
  PADDLE_HEIGHT: 60,
  BALL_RADIUS: 8,
  BALL_SPEED: 3,
  PADDLE_SPEED: 2.5,
  WIN_SCORE: 5,
};

export function PongGame({ isSnakePlaying }: { isSnakePlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    leftScore: 0,
    rightScore: 0,
    isVisible: false,
  });

  // Game objects
  const ballRef = useRef<Ball>({
    x: PONG_CONFIG.CANVAS_WIDTH / 2,
    y: PONG_CONFIG.CANVAS_HEIGHT / 2,
    dx: PONG_CONFIG.BALL_SPEED,
    dy: PONG_CONFIG.BALL_SPEED,
    radius: PONG_CONFIG.BALL_RADIUS,
  });

  const leftPaddleRef = useRef<Paddle>({
    x: 10,
    y: PONG_CONFIG.CANVAS_HEIGHT / 2 - PONG_CONFIG.PADDLE_HEIGHT / 2,
    width: PONG_CONFIG.PADDLE_WIDTH,
    height: PONG_CONFIG.PADDLE_HEIGHT,
    dy: 0,
  });

  const rightPaddleRef = useRef<Paddle>({
    x: PONG_CONFIG.CANVAS_WIDTH - 20,
    y: PONG_CONFIG.CANVAS_HEIGHT / 2 - PONG_CONFIG.PADDLE_HEIGHT / 2,
    width: PONG_CONFIG.PADDLE_WIDTH,
    height: PONG_CONFIG.PADDLE_HEIGHT,
    dy: 0,
  });

  // AI logic for both paddles
  const updateAIPaddle = useCallback((paddle: Paddle, ball: Ball, isLeft: boolean) => {
    const paddleCenter = paddle.y + paddle.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: follow the ball with some prediction
    const prediction = ballCenter + (ball.dy * 10); // Predict where ball will be
    const targetY = Math.max(0, Math.min(PONG_CONFIG.CANVAS_HEIGHT - paddle.height, prediction));
    
    if (paddleCenter < targetY - 5) {
      paddle.dy = PONG_CONFIG.PADDLE_SPEED;
    } else if (paddleCenter > targetY + 5) {
      paddle.dy = -PONG_CONFIG.PADDLE_SPEED;
    } else {
      paddle.dy = 0;
    }
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, PONG_CONFIG.CANVAS_WIDTH, PONG_CONFIG.CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(PONG_CONFIG.CANVAS_WIDTH / 2, 0);
    ctx.lineTo(PONG_CONFIG.CANVAS_WIDTH / 2, PONG_CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00843D';
    ctx.fillRect(
      leftPaddleRef.current.x,
      leftPaddleRef.current.y,
      leftPaddleRef.current.width,
      leftPaddleRef.current.height
    );

    ctx.fillStyle = '#F5A623';
    ctx.fillRect(
      rightPaddleRef.current.x,
      rightPaddleRef.current.y,
      rightPaddleRef.current.width,
      rightPaddleRef.current.height
    );

    // Draw ball
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${gameState.leftScore} - ${gameState.rightScore}`,
      PONG_CONFIG.CANVAS_WIDTH / 2,
      30
    );
  }, [gameState.leftScore, gameState.rightScore]);

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying) return;

    const ball = ballRef.current;
    const leftPaddle = leftPaddleRef.current;
    const rightPaddle = rightPaddleRef.current;

    // Update AI paddles
    updateAIPaddle(leftPaddle, ball, true);
    updateAIPaddle(rightPaddle, ball, false);

    // Update paddle positions
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // Keep paddles in bounds
    leftPaddle.y = Math.max(0, Math.min(PONG_CONFIG.CANVAS_HEIGHT - leftPaddle.height, leftPaddle.y));
    rightPaddle.y = Math.max(0, Math.min(PONG_CONFIG.CANVAS_HEIGHT - rightPaddle.height, rightPaddle.y));

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ensure minimum speed to prevent ball from getting stuck
    const minSpeed = 2.5;
    if (Math.abs(ball.dx) < minSpeed) {
      ball.dx = ball.dx > 0 ? minSpeed : -minSpeed;
    }
    if (Math.abs(ball.dy) < minSpeed) {
      ball.dy = ball.dy > 0 ? minSpeed : -minSpeed;
    }

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius; // Ensure ball is not stuck at top
      ball.dy = Math.abs(ball.dy) + Math.random() * 0.5; // Add small random angle change
    } else if (ball.y + ball.radius >= PONG_CONFIG.CANVAS_HEIGHT) {
      ball.y = PONG_CONFIG.CANVAS_HEIGHT - ball.radius; // Ensure ball is not stuck at bottom
      ball.dy = -Math.abs(ball.dy) - Math.random() * 0.5; // Add small random angle change
    }

    // Ball collision with left paddle
    if (ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
        ball.y >= leftPaddle.y &&
        ball.y <= leftPaddle.y + leftPaddle.height &&
        ball.dx < 0) {
      ball.x = leftPaddle.x + leftPaddle.width + ball.radius; // Ensure ball is not stuck
      ball.dx = Math.abs(ball.dx) + Math.random() * 0.3; // Add small random speed increase
      // Add some spin based on where ball hits paddle
      const hitPos = (ball.y - leftPaddle.y) / leftPaddle.height;
      ball.dy = (hitPos - 0.5) * 8 + (Math.random() - 0.5) * 2; // Add random angle variation
    }

    // Ball collision with right paddle
    if (ball.x + ball.radius >= rightPaddle.x &&
        ball.y >= rightPaddle.y &&
        ball.y <= rightPaddle.y + rightPaddle.height &&
        ball.dx > 0) {
      ball.x = rightPaddle.x - ball.radius; // Ensure ball is not stuck
      ball.dx = -Math.abs(ball.dx) - Math.random() * 0.3; // Add small random speed increase
      // Add some spin based on where ball hits paddle
      const hitPos = (ball.y - rightPaddle.y) / rightPaddle.height;
      ball.dy = (hitPos - 0.5) * 8 + (Math.random() - 0.5) * 2; // Add random angle variation
    }

    // Ball out of bounds - scoring
    if (ball.x < 0) {
      // Right player scores
      setGameState(prev => ({
        ...prev,
        rightScore: prev.rightScore + 1
      }));
      resetBall();
    } else if (ball.x > PONG_CONFIG.CANVAS_WIDTH) {
      // Left player scores
      setGameState(prev => ({
        ...prev,
        leftScore: prev.leftScore + 1
      }));
      resetBall();
    }

    drawGame();
  }, [gameState.isPlaying, updateAIPaddle, drawGame]);

  const resetBall = useCallback(() => {
    ballRef.current = {
      x: PONG_CONFIG.CANVAS_WIDTH / 2,
      y: PONG_CONFIG.CANVAS_HEIGHT / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * PONG_CONFIG.BALL_SPEED,
      dy: (Math.random() > 0.5 ? 1 : -1) * PONG_CONFIG.BALL_SPEED,
      radius: PONG_CONFIG.BALL_RADIUS,
    };
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isVisible: true,
      leftScore: 0,
      rightScore: 0
    }));
    resetBall();
  }, [resetBall]);

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

  // Check for win condition
  useEffect(() => {
    if (gameState.leftScore >= PONG_CONFIG.WIN_SCORE || gameState.rightScore >= PONG_CONFIG.WIN_SCORE) {
      // Reset scores and continue playing
      setGameState(prev => ({
        ...prev,
        leftScore: 0,
        rightScore: 0
      }));
    }
  }, [gameState.leftScore, gameState.rightScore]);

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
        <h3 className="text-sm font-bold text-white">🏓 AI Pong</h3>
        <button
          onClick={stopGame}
          className="text-white hover:text-zus-grey-300 text-lg font-bold"
        >
          ×
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={PONG_CONFIG.CANVAS_WIDTH}
        height={PONG_CONFIG.CANVAS_HEIGHT}
        className="border border-zus-grey-300 rounded"
      />

      <div className="mt-2 text-xs text-zus-grey-300 text-center">
        🤖 AI vs AI • Auto-starts with Snake
      </div>
    </div>
  );
}
