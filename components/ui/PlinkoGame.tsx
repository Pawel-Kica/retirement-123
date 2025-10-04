'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  id: number;
  isActive: boolean;
}

interface Peg {
  x: number;
  y: number;
  radius: number;
}

interface Separator {
  x: number;
  y: number;
  width: number;
  height: number;
  multiplier: number;
  color: string;
}

interface VerticalLine {
  x: number;
  y: number;
  width: number;
  height: number;
  multiplier: number;
  color: string;
}

interface GameState {
  isPlaying: boolean;
  totalMoney: number;
  isVisible: boolean;
  currentBall: number;
  lastWin: number;
  isAnimating: boolean;
}

const PLINKO_CONFIG = {
  CANVAS_WIDTH: 250,
  CANVAS_HEIGHT: 350, // Increased height for more layers
  BALL_RADIUS: 5,
  PEG_RADIUS: 1, // Even smaller pegs to prevent sticking
  PEG_ROWS: 10, // More rows for more layers
  PEG_COLS: 13, // More columns
  BUCKET_COUNT: 9, // More buckets
  GRAVITY: 0.15, // Much slower gravity
  BOUNCE_DAMPING: 0.6, // Better bouncing
  FRICTION: 0.995, // Less friction for more movement
  BALL_SPAWN_X: 125, // Center of canvas - will fall on middle peg
  BALL_SPAWN_Y: 20,
  BALL_SPAWN_DX: 0,
  BALL_SPAWN_DY: 0,
  BUCKET_WIDTH: 25,
  BUCKET_HEIGHT: 30,
  STARTING_MONEY: 10,
  BALL_COST: 1,
};

export function PlinkoGame({ isSnakePlaying }: { isSnakePlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    totalMoney: PLINKO_CONFIG.STARTING_MONEY,
    isVisible: false,
    currentBall: 0,
    lastWin: 0,
    isAnimating: false,
  });

  // Game objects
  const ballsRef = useRef<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const separatorsRef = useRef<Separator[]>([]);
  const verticalLinesRef = useRef<VerticalLine[]>([]);

  // Initialize pegs in proper triangular pattern (wide at top, narrow at bottom)
  const initializePegs = useCallback(() => {
    const pegs: Peg[] = [];
    const startY = 50; // Moved up for more spacing
    const spacingX = 20; // Increased horizontal spacing
    const spacingY = 22; // Increased vertical spacing

    for (let row = 0; row < PLINKO_CONFIG.PEG_ROWS; row++) {
      // Calculate number of pegs in this row (triangular pattern - wide at top)
      const colsInRow = 3 + row; // Start with 3 pegs, add one each row
      const totalWidth = (colsInRow - 1) * spacingX;
      const rowStartX = (PLINKO_CONFIG.CANVAS_WIDTH - totalWidth) / 2; // Center the row
      
      for (let col = 0; col < colsInRow; col++) {
        pegs.push({
          x: rowStartX + col * spacingX,
          y: startY + row * spacingY,
          radius: PLINKO_CONFIG.PEG_RADIUS,
        });
      }
    }
    pegsRef.current = pegs;
  }, []);

  // Initialize separators (bottom rectangles)
  const initializeSeparators = useCallback(() => {
    const separators: Separator[] = [];
    const separatorY = PLINKO_CONFIG.CANVAS_HEIGHT - 60;
    const separatorWidth = PLINKO_CONFIG.BUCKET_WIDTH;
    const totalWidth = PLINKO_CONFIG.BUCKET_COUNT * separatorWidth;
    const startX = (PLINKO_CONFIG.CANVAS_WIDTH - totalWidth) / 2;

    // Symmetrical multiplier distribution
    const multipliers = [10.0, 4.0, 2.0, 1.0, 0.2, 1.0, 2.0, 4.0, 10.0];
    const colors = ['#D32F2F', '#F5A623', '#00843D', '#0088CC', '#00A99D', '#0088CC', '#00843D', '#F5A623', '#D32F2F'];

    for (let i = 0; i < PLINKO_CONFIG.BUCKET_COUNT; i++) {
      separators.push({
        x: startX + i * separatorWidth,
        y: separatorY,
        width: separatorWidth,
        height: 15,
        multiplier: multipliers[i],
        color: colors[i],
      });
    }
    separatorsRef.current = separators;
  }, []);

  // Initialize vertical lines (dividers between separators)
  const initializeVerticalLines = useCallback(() => {
    const verticalLines: VerticalLine[] = [];
    const lineY = PLINKO_CONFIG.CANVAS_HEIGHT - 80; // More spacing from separators
    const lineWidth = 2; // Slightly wider for better visibility
    const lineHeight = 30; // Taller for better collision detection
    const separatorWidth = PLINKO_CONFIG.BUCKET_WIDTH;
    const totalWidth = PLINKO_CONFIG.BUCKET_COUNT * separatorWidth;
    const startX = (PLINKO_CONFIG.CANVAS_WIDTH - totalWidth) / 2;

    // Create dividers between separators (not on separators)
    for (let i = 0; i < PLINKO_CONFIG.BUCKET_COUNT - 1; i++) {
      verticalLines.push({
        x: startX + (i + 1) * separatorWidth - lineWidth / 2, // Between separators
        y: lineY,
        width: lineWidth,
        height: lineHeight,
        multiplier: 0, // No multiplier for dividers
        color: '#666666', // Gray color for dividers
      });
    }
    verticalLinesRef.current = verticalLines;
  }, []);

  // Spawn a new ball
  const spawnBall = useCallback(() => {
    if (gameState.totalMoney < PLINKO_CONFIG.BALL_COST) return;

    const newBall: Ball = {
      x: PLINKO_CONFIG.BALL_SPAWN_X,
      y: PLINKO_CONFIG.BALL_SPAWN_Y,
      dx: PLINKO_CONFIG.BALL_SPAWN_DX + (Math.random() - 0.5) * 2,
      dy: PLINKO_CONFIG.BALL_SPAWN_DY,
      radius: PLINKO_CONFIG.BALL_RADIUS,
      id: gameState.currentBall,
      isActive: true,
    };

    ballsRef.current.push(newBall);
    setGameState(prev => ({
      ...prev,
      currentBall: prev.currentBall + 1,
      totalMoney: prev.totalMoney - PLINKO_CONFIG.BALL_COST,
    }));
  }, [gameState.totalMoney, gameState.currentBall]);

  // Check ball collision with pegs
  const checkPegCollision = useCallback((ball: Ball) => {
    pegsRef.current.forEach(peg => {
      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < ball.radius + peg.radius) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        // Reflect ball
        ball.dx = Math.cos(angle) * speed * PLINKO_CONFIG.BOUNCE_DAMPING;
        ball.dy = Math.sin(angle) * speed * PLINKO_CONFIG.BOUNCE_DAMPING;
        
        // Add some randomness
        ball.dx += (Math.random() - 0.5) * 0.5;
        ball.dy += (Math.random() - 0.5) * 0.5;
      }
    });
  }, []);

  // Check ball collision with vertical lines
  const checkVerticalLineCollision = useCallback((ball: Ball) => {
    verticalLinesRef.current.forEach((line, index) => {
      if (ball.y + ball.radius >= line.y &&
          ball.y - ball.radius <= line.y + line.height &&
          ball.x + ball.radius >= line.x &&
          ball.x - ball.radius <= line.x + line.width) {
        
        // Ball hits vertical line - determine which separator it should go to
        const separatorIndex = index;
        const separator = separatorsRef.current[separatorIndex];
        
        if (separator) {
          // Ball falls into corresponding separator
          ball.isActive = false;
          
          // Calculate win amount based on separator multiplier
          const winAmount = separator.multiplier * PLINKO_CONFIG.BALL_COST;
          
          setGameState(prev => ({
            ...prev,
            totalMoney: prev.totalMoney + winAmount,
            lastWin: winAmount,
            isAnimating: true,
          }));
          
          // Stop animation after 1 second
          setTimeout(() => {
            setGameState(prev => ({ ...prev, isAnimating: false }));
          }, 1000);
        }
      }
    });
  }, []);

  // Check ball collision with separators
  const checkSeparatorCollision = useCallback((ball: Ball) => {
    separatorsRef.current.forEach((separator, index) => {
      if (ball.y + ball.radius >= separator.y &&
          ball.y - ball.radius <= separator.y + separator.height &&
          ball.x + ball.radius >= separator.x &&
          ball.x - ball.radius <= separator.x + separator.width) {
        
        // Ball hits separator - calculate win and delete ball
        const winAmount = separator.multiplier * PLINKO_CONFIG.BALL_COST;
        
        setGameState(prev => ({
          ...prev,
          totalMoney: prev.totalMoney + winAmount,
          lastWin: winAmount,
          isAnimating: true,
        }));
        
        // Stop animation after 1 second
        setTimeout(() => {
          setGameState(prev => ({ ...prev, isAnimating: false }));
        }, 1000);
        
        // Delete ball immediately
        ball.isActive = false;
      }
    });
  }, []);


  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, PLINKO_CONFIG.CANVAS_WIDTH, PLINKO_CONFIG.CANVAS_HEIGHT);

    // Draw pegs with better styling
    pegsRef.current.forEach(peg => {
      // Peg shadow
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      ctx.arc(peg.x + 1, peg.y + 1, peg.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Peg main
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Peg highlight
      ctx.fillStyle = '#CCCCCC';
      ctx.beginPath();
      ctx.arc(peg.x - 1, peg.y - 1, peg.radius - 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw vertical lines (dividers between separators)
    verticalLinesRef.current.forEach((line, index) => {
      // Simple gray divider line
      ctx.fillStyle = '#666666';
      ctx.fillRect(line.x, line.y, line.width, line.height);
    });

    // Draw separators (bottom rectangles)
    separatorsRef.current.forEach((separator, index) => {
      // Separator shadow
      ctx.fillStyle = '#333333';
      ctx.fillRect(separator.x + 1, separator.y + 1, separator.width, separator.height);
      
      // Separator main
      ctx.fillStyle = separator.color;
      ctx.fillRect(separator.x, separator.y, separator.width, separator.height);
      
      // Separator highlight
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(separator.x, separator.y, separator.width, separator.height);
      
      // Draw multiplier text on separator
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${separator.multiplier}x`,
        separator.x + separator.width / 2,
        separator.y + separator.height / 2 + 2
      );
    });

    // Draw balls
    ballsRef.current.forEach(ball => {
      if (ball.isActive) {
        // Draw falling ball
        // Ball shadow
        ctx.fillStyle = '#B8860B';
        ctx.beginPath();
        ctx.arc(ball.x + 1, ball.y + 1, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball main
        ctx.fillStyle = '#F5A623';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball highlight
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(ball.x - 1, ball.y - 1, ball.radius - 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = '#F5A623';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw UI
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Money: $${gameState.totalMoney.toFixed(2)}`, 10, 15);
    ctx.fillText(`Balls: ${ballsRef.current.length}`, 10, 30);
    
    if (gameState.lastWin > 0) {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `+$${gameState.lastWin.toFixed(2)}!`,
        PLINKO_CONFIG.CANVAS_WIDTH / 2,
        50
      );
    }
  }, [gameState.totalMoney, gameState.lastWin]);

  const updateGame = useCallback(() => {
    if (!gameState.isPlaying) return;

    // Update balls
    ballsRef.current.forEach(ball => {
      if (ball.isActive) {
        // Apply gravity
        ball.dy += PLINKO_CONFIG.GRAVITY;
        
        // Apply friction
        ball.dx *= PLINKO_CONFIG.FRICTION;
        ball.dy *= PLINKO_CONFIG.FRICTION;
        
        // Update position
        ball.x += ball.dx;
        ball.y += ball.dy;
        
          // Check collisions
          checkPegCollision(ball);
          checkVerticalLineCollision(ball);
          checkSeparatorCollision(ball);
        
        // Remove ball if it falls off screen
        if (ball.y > PLINKO_CONFIG.CANVAS_HEIGHT + 50) {
          ball.isActive = false;
        }
      }
    });

    // Remove inactive balls
    ballsRef.current = ballsRef.current.filter(ball => ball.isActive);

    // Spawn new ball if no active balls and we have money
    if (ballsRef.current.length === 0 && gameState.totalMoney >= PLINKO_CONFIG.BALL_COST) {
      spawnBall();
    }

    drawGame();
  }, [gameState.isPlaying, gameState.totalMoney, checkPegCollision, checkSeparatorCollision, spawnBall, drawGame]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isVisible: true,
      totalMoney: PLINKO_CONFIG.STARTING_MONEY,
      currentBall: 0,
      lastWin: 0,
      isAnimating: false,
    }));
    initializePegs();
    initializeVerticalLines();
    initializeSeparators();
    
    // Clear any existing balls
    ballsRef.current = [];
    
    // Spawn first ball after a short delay to ensure state is updated
    setTimeout(() => {
      if (gameState.totalMoney >= PLINKO_CONFIG.BALL_COST) {
        const newBall: Ball = {
          x: PLINKO_CONFIG.BALL_SPAWN_X,
          y: PLINKO_CONFIG.BALL_SPAWN_Y,
          dx: PLINKO_CONFIG.BALL_SPAWN_DX + (Math.random() - 0.5) * 2,
          dy: PLINKO_CONFIG.BALL_SPAWN_DY,
          radius: PLINKO_CONFIG.BALL_RADIUS,
          id: 0,
          isActive: true,
        };
        ballsRef.current.push(newBall);
        setGameState(prev => ({
          ...prev,
          currentBall: 1,
          totalMoney: prev.totalMoney - PLINKO_CONFIG.BALL_COST,
        }));
      }
    }, 100);
  }, [initializePegs, initializeVerticalLines, initializeSeparators, gameState.totalMoney]);

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
    <div className="fixed bottom-4 z-50 bg-black rounded-lg shadow-2xl border-2 border-zus-green p-2" style={{ right: '420px' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white">🎯 Plinko</h3>
        <button
          onClick={stopGame}
          className="text-white hover:text-zus-grey-300 text-lg font-bold"
        >
          ×
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={PLINKO_CONFIG.CANVAS_WIDTH}
        height={PLINKO_CONFIG.CANVAS_HEIGHT}
        className="border border-zus-grey-300 rounded"
      />

      <div className="mt-2 text-xs text-zus-grey-300 text-center">
        🎲 Auto-launch • Start: $10 • Cost: $1
      </div>
    </div>
  );
}
