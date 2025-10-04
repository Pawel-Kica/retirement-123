'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import { BlockBreakerGame } from './BlockBreakerGame';
import { PlinkoGame } from './PlinkoGame';
import MinecraftGame from './MinecraftGame';

interface Position {
  x: number;
  y: number;
}

interface AStarNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent: AStarNode | null;
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
  isAutoPlaying: boolean;
  isRestarting: boolean;
}

const GAME_CONFIG = {
  CANVAS_WIDTH: 320, // 20% smaller (was 400, now 320)
  CANVAS_HEIGHT: 240, // 20% smaller (was 300, now 240)
  GRID_SIZE: 20,
  INITIAL_SPEED: 40, // 4x faster (was 150, now 40)
  MIN_SPEED: 20, // 4x faster (was 80, now 20)
  SPEED_INCREMENT: 5,
  FOOD_COLORS: ['#00843D', '#F5A623', '#0088CC', '#00A99D', '#0B4C7C'],
};

interface SnakeGameProps {
  isSnakePlaying?: boolean;
}

export function SnakeGame({ isSnakePlaying = false }: SnakeGameProps = {}) {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(true); // Start visible
  const [showButton, setShowButton] = useState(false);
  const [typedSequence, setTypedSequence] = useState('');
  
  // Only work on /zus page
  const isOnZusPage = pathname === '/zus';
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false, // Start not playing, will be controlled by props
    isPaused: false,
    score: 0,
    highScore: 0,
    isAutoPlaying: false, // Will be controlled by props
    isRestarting: false,
  });

  // Game state
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Position>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Position>({ x: 1, y: 0 });
  const foodRef = useRef<Food>({ x: 15, y: 15, color: '#00843D' });
  const speedRef = useRef(GAME_CONFIG.INITIAL_SPEED);
  
  // AI state for loop detection and A* pathfinding
  const aiStateRef = useRef({
    lastPositions: [] as Position[],
    moveHistory: [] as Position[],
    stuckCounter: 0,
    lastFoodPosition: { x: 15, y: 15 },
    explorationMode: false,
    panicMode: false,
    lastPath: [] as Position[],
    pathIndex: 0,
  });

  // A* pathfinding functions
  const heuristic = useCallback((a: Position, b: Position) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }, []);

  const getNeighbors = useCallback((node: Position, snake: Position[]) => {
    const neighbors: Position[] = [];
    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }  // Left
    ];

    directions.forEach(dir => {
      const newPos = { x: node.x + dir.x, y: node.y + dir.y };
      
      // Check bounds
      if (newPos.x >= 0 && newPos.x < GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE &&
          newPos.y >= 0 && newPos.y < GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) {
        
        // Check if position is not occupied by snake body (except tail)
        const isOccupied = snake.slice(0, -1).some(segment => 
          segment.x === newPos.x && segment.y === newPos.y
        );
        
        if (!isOccupied) {
          neighbors.push(newPos);
        }
      }
    });

    return neighbors;
  }, []);

  const aStarPathfind = useCallback((start: Position, goal: Position, snake: Position[]) => {
    const openSet: AStarNode[] = [];
    const closedSet: Set<string> = new Set();
    
    const startNode: AStarNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: heuristic(start, goal),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    
    openSet.push(startNode);
    
    while (openSet.length > 0) {
      // Find node with lowest f cost
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }
      
      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = `${current.x},${current.y}`;
      closedSet.add(currentKey);
      
      // Check if we reached the goal
      if (current.x === goal.x && current.y === goal.y) {
        const path: Position[] = [];
        let node: AStarNode | null = current;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }
      
      // Check neighbors
      const neighbors = getNeighbors({ x: current.x, y: current.y }, snake);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(neighborKey)) continue;
        
        const tentativeG = current.g + 1;
        
        // Check if this path to neighbor is better
        const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          const neighborNode: AStarNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: heuristic(neighbor, goal),
            f: 0,
            parent: current
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openSet.push(neighborNode);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }
    
    return []; // No path found
  }, [heuristic, getNeighbors]);

  const isPositionSafe = useCallback((pos: Position, snake: Position[]) => {
    // Check if position is within bounds
    if (pos.x < 0 || pos.x >= GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE ||
        pos.y < 0 || pos.y >= GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) {
      return false;
    }
    
    // Check if position is not occupied by snake body
    return !snake.some(segment => segment.x === pos.x && segment.y === pos.y);
  }, []);

  const canReachFood = useCallback((snake: Position[], food: Position) => {
    const head = snake[0];
    const path = aStarPathfind(head, food, snake);
    return path.length > 0;
  }, [aStarPathfind]);

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

  // Helper function to check if AI is self-trapped
  const checkSelfTrap = useCallback((snake: Position[], head: Position): boolean => {
    // Check if we're surrounded by our own body in a small area
    const directions = [
      { x: 1, y: 0 },   // Right
      { x: -1, y: 0 },  // Left
      { x: 0, y: 1 },   // Down
      { x: 0, y: -1 },  // Up
    ];
    
    let blockedDirections = 0;
    const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE) - 1;
    const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) - 1;
    
    for (const dir of directions) {
      const newPos = { x: head.x + dir.x, y: head.y + dir.y };
      
      // Check wall collision
      if (newPos.x < 0 || newPos.x > maxX || newPos.y < 0 || newPos.y > maxY) {
        blockedDirections++;
        continue;
      }
      
      // Check self collision
      if (snake.some(segment => segment.x === newPos.x && segment.y === newPos.y)) {
        blockedDirections++;
        continue;
      }
    }
    
    // If 3 or more directions are blocked, we're likely self-trapped
    return blockedDirections >= 3;
  }, []);

  // Helper function to check for circular movement patterns
  const checkCircularMovement = useCallback((moveHistory: Position[]): boolean => {
    if (moveHistory.length < 8) return false;
    
    // Check for common circular patterns
    const recentMoves = moveHistory.slice(-8);
    
    // Pattern 1: Right-Down-Left-Up (clockwise square)
    const clockwiseSquare = [
      { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
      { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }
    ];
    
    // Pattern 2: Up-Right-Down-Left (counter-clockwise square)
    const counterClockwiseSquare = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
    ];
    
    // Check for exact pattern matches
    const isClockwise = recentMoves.every((move, i) => 
      move.x === clockwiseSquare[i].x && move.y === clockwiseSquare[i].y
    );
    
    const isCounterClockwise = recentMoves.every((move, i) => 
      move.x === counterClockwiseSquare[i].x && move.y === counterClockwiseSquare[i].y
    );
    
    // Check for repeating 4-move patterns
    if (recentMoves.length >= 8) {
      const pattern1 = recentMoves.slice(0, 4);
      const pattern2 = recentMoves.slice(4, 8);
      const isRepeating = pattern1.every((move, i) => 
        move.x === pattern2[i].x && move.y === pattern2[i].y
      );
      
      if (isRepeating) return true;
    }
    
    return isClockwise || isCounterClockwise;
  }, []);

  // Enhanced AI logic with loop detection and avoidance

  // Helper function to analyze field state around a position
  const analyzeFieldState = useCallback((pos: Position, snake: Position[], food: Position) => {
    const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE) - 1;
    const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) - 1;
    
    let score = 0;
    
    // Check 3x3 area around position
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkPos = { x: pos.x + dx, y: pos.y + dy };
        
        // Skip if out of bounds
        if (checkPos.x < 0 || checkPos.x > maxX || checkPos.y < 0 || checkPos.y > maxY) {
          continue;
        }
        
        // Check if position is occupied by snake
        const isOccupied = snake.some(segment => 
          segment.x === checkPos.x && segment.y === checkPos.y
        );
        
        if (!isOccupied) {
          // Open space - good for mobility
          score += 5;
          
          // Extra bonus for spaces near food
          const distanceToFood = Math.abs(checkPos.x - food.x) + Math.abs(checkPos.y - food.y);
          if (distanceToFood <= 2) {
            score += 10;
          }
        } else {
          // Occupied space - reduces mobility
          score -= 2;
        }
      }
    }
    
    // Check if position is in a corner or edge (generally less desirable)
    const isCorner = (pos.x === 0 || pos.x === maxX) && (pos.y === 0 || pos.y === maxY);
    const isEdge = pos.x === 0 || pos.x === maxX || pos.y === 0 || pos.y === maxY;
    
    if (isCorner) {
      score -= 20; // Corners are dangerous
    } else if (isEdge) {
      score -= 5; // Edges are less flexible
    }
    
    return { score, isCorner, isEdge };
  }, []);

  // Helper function to calculate path to food using simple pathfinding
  const findPathToFood = useCallback((start: Position, goal: Position, snake: Position[]) => {
    // Simple pathfinding - just return the direct path if possible
    const dx = goal.x - start.x;
    const dy = goal.y - start.y;
    
    // If we can move directly towards the goal, do it
    if (Math.abs(dx) > Math.abs(dy)) {
      // Move horizontally first
      const nextX = start.x + (dx > 0 ? 1 : -1);
      if (isPositionSafe({ x: nextX, y: start.y }, snake)) {
        return [{ x: nextX, y: start.y }, goal];
      }
    } else {
      // Move vertically first
      const nextY = start.y + (dy > 0 ? 1 : -1);
      if (isPositionSafe({ x: start.x, y: nextY }, snake)) {
        return [{ x: start.x, y: nextY }, goal];
      }
    }
    
    // If direct path is blocked, try alternative moves
    const possibleMoves = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
    ].filter(move => isPositionSafe({ x: start.x + move.x, y: start.y + move.y }, snake));
    
    if (possibleMoves.length > 0) {
      // Pick the move that gets us closest to the goal
      const bestMove = possibleMoves.reduce((best, current) => {
        const currentDist = Math.abs(goal.x - (start.x + current.x)) + Math.abs(goal.y - (start.y + current.y));
        const bestDist = Math.abs(goal.x - (start.x + best.x)) + Math.abs(goal.y - (start.y + best.y));
        return currentDist < bestDist ? current : best;
      });
      
      return [{ x: start.x + bestMove.x, y: start.y + bestMove.y }, goal];
    }
    
    return []; // No path found
  }, [isPositionSafe]);

  const getAIMove = useCallback((): Position => {
    const snake = snakeRef.current;
    const head = snake[0];
    const food = foodRef.current;
    const currentDirection = directionRef.current;
    const aiState = aiStateRef.current;
    
    // Update AI state
    aiState.lastPositions.push({ ...head });
    if (aiState.lastPositions.length > 10) {
      aiState.lastPositions.shift(); // Keep only last 10 positions
    }
    
    // Check if food position changed (reset stuck counter)
    if (food.x !== aiState.lastFoodPosition.x || food.y !== aiState.lastFoodPosition.y) {
      aiState.stuckCounter = 0;
      aiState.explorationMode = false;
      aiState.lastFoodPosition = { x: food.x, y: food.y };
    }
    
    // Calculate distance to food
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    const distanceToFood = Math.abs(dx) + Math.abs(dy);
    
    // Check if food is in a corner
    const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE) - 1;
    const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) - 1;
    const isCornerFood = (food.x === 0 || food.x === maxX) && (food.y === 0 || food.y === maxY);
    
    // Check if food is near a wall
    const isNearWall = food.x === 0 || food.x === maxX || food.y === 0 || food.y === maxY;
    
    // Find optimal path to food
    const pathToFood = findPathToFood(head, food, snake);
    
    // Simple 1% random move system for exploration
    const shouldMakeRandomMove = Math.random() < 0.01; // 1% chance
    
    // Reset exploration and panic modes (simplified with random moves)
    if (aiState.explorationMode && distanceToFood < 3) {
      aiState.explorationMode = false;
      aiState.stuckCounter = 0;
    }
    
    if (aiState.panicMode && distanceToFood < 5) {
      aiState.panicMode = false;
    }
    
    // Get possible moves (excluding reverse direction)
    let possibleMoves: Position[] = [
      { x: 1, y: 0 },   // Right
      { x: -1, y: 0 },  // Left
      { x: 0, y: 1 },   // Down
      { x: 0, y: -1 },  // Up
    ].filter(move => 
      !(move.x === -currentDirection.x && move.y === -currentDirection.y) // Not reverse
    );

    // If random move is triggered, filter to only safe moves
    if (shouldMakeRandomMove) {
      possibleMoves = possibleMoves.filter(move => {
        const newHead = { x: head.x + move.x, y: head.y + move.y };
        
        // Check wall collision
        const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE) - 1;
        const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) - 1;
        
        if (newHead.x < 0 || newHead.x > maxX || newHead.y < 0 || newHead.y > maxY) {
          return false; // Not safe
        }
        
        // Check self collision
        if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          return false; // Not safe
        }
        
        return true; // Safe move
      });
    }
    
    // Check each possible move for safety and scoring
    const moveScores = possibleMoves.map(move => {
      const newHead = { x: head.x + move.x, y: head.y + move.y };
      
      // Check wall collision
      const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE) - 1;
      const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE) - 1;
      
      if (newHead.x < 0 || newHead.x > maxX || newHead.y < 0 || newHead.y > maxY) {
        return { move, score: -1000 }; // Very bad move
      }
      
      // Check self collision
      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        return { move, score: -1000 }; // Very bad move
      }
      
      // Initialize move score for this move
      let moveScore = 0;
      
      // Simple loop prevention - avoid recent positions
      const wouldCreateLoop = aiState.lastPositions.some(pos =>
        pos.x === newHead.x && pos.y === newHead.y
      );
      
      if (wouldCreateLoop) {
        return { move, score: -500 }; // Bad move if it creates a loop
      }
      
      // Check if this move would lead to self-trapping
      const wouldSelfTrap = checkSelfTrap([...snake, newHead], newHead);
      if (wouldSelfTrap && !aiState.explorationMode) {
        return { move, score: -800 }; // Very bad move if it leads to self-trapping
      }
      
      // Analyze future positions - simulate 3 moves ahead
      const futureSnake = [...snake, newHead];
      const futureHead = newHead;
      const futureMoves = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
      ].filter(futureMove => 
        !(futureMove.x === -move.x && futureMove.y === -move.y) // Not reverse
      );
      
      // Check how many future moves are available
      const availableFutureMoves = futureMoves.filter(futureMove => {
        const futurePos = { x: futureHead.x + futureMove.x, y: futureHead.y + futureMove.y };
        return isPositionSafe(futurePos, futureSnake);
      }).length;
      
      // Penalty for moves that reduce future options
      if (availableFutureMoves === 0) {
        return { move, score: -1000 }; // Dead end
      } else if (availableFutureMoves === 1) {
        moveScore -= 200; // Very limited options
      } else if (availableFutureMoves === 2) {
        moveScore -= 50; // Limited options
      }
      
      // Bonus for moves that maintain or increase future options
      if (availableFutureMoves >= 3) {
        moveScore += 30; // Good future mobility
      }
      
      // Analyze field state - consider open areas vs crowded areas
      const fieldAnalysis = analyzeFieldState(newHead, snake, food);
      moveScore += fieldAnalysis.score;
      
      // Consider snake length and available space
      const totalCells = (maxX + 1) * (maxY + 1);
      const snakeLength = snake.length;
      const spaceRatio = (totalCells - snakeLength) / totalCells;
      
      // If snake is getting long, prioritize moves that keep more space available
      if (spaceRatio < 0.3) { // Less than 30% space left
        const spaceScore = availableFutureMoves * 50; // Heavily weight space preservation
        moveScore += spaceScore;
      }
      
      // Check if this move would create circular movement
      const testMoveHistory = [...aiState.moveHistory, move];
      const wouldCreateCircular = checkCircularMovement(testMoveHistory);
      if (wouldCreateCircular && !aiState.explorationMode) {
        return { move, score: -600 }; // Bad move if it creates circular movement
      }
      
      // Calculate distance to food after this move
      const newDx = food.x - newHead.x;
      const newDy = food.y - newHead.y;
      const newDistance = Math.abs(newDx) + Math.abs(newDy);
      const currentDistance = Math.abs(dx) + Math.abs(dy);
      
      // Base score based on getting closer to food
      moveScore += currentDistance - newDistance;
      
      // Special handling for corner food
      if (isCornerFood) {
        // For corner food, prioritize moves that approach from the correct direction
        const approachX = food.x - head.x;
        const approachY = food.y - head.y;
        
        // If we're close to the corner, prioritize the correct approach direction
        if (distanceToFood <= 3) {
          if (Math.abs(approachX) > Math.abs(approachY)) {
            // Food is more horizontal, prioritize horizontal movement
            if ((approachX > 0 && move.x > 0) || (approachX < 0 && move.x < 0)) {
              moveScore += 50; // Big bonus for correct horizontal approach
            }
          } else {
            // Food is more vertical, prioritize vertical movement
            if ((approachY > 0 && move.y > 0) || (approachY < 0 && move.y < 0)) {
              moveScore += 50; // Big bonus for correct vertical approach
            }
          }
        }
        
        // Extra bonus for moves that get us closer to corner food
        if (newDistance < currentDistance) {
          moveScore += 30;
        }
      }
      
      // Special handling for wall food (not corner)
      else if (isNearWall && !isCornerFood) {
        // For wall food, prioritize moves that approach along the wall
        const wallSide = food.x === 0 ? 'left' : food.x === maxX ? 'right' : 
                        food.y === 0 ? 'top' : 'bottom';
        
        if (wallSide === 'left' || wallSide === 'right') {
          // Vertical wall - prioritize vertical movement towards food
          if ((dy > 0 && move.y > 0) || (dy < 0 && move.y < 0)) {
            moveScore += 25;
          }
        } else {
          // Horizontal wall - prioritize horizontal movement towards food
          if ((dx > 0 && move.x > 0) || (dx < 0 && move.x < 0)) {
            moveScore += 25;
          }
        }
      }
      
      // In panic mode, prioritize any safe move that gets us away from current position
      if (aiState.panicMode) {
        // Any move that doesn't immediately trap us is good
        if (!wouldSelfTrap && !wouldCreateCircular) {
          moveScore += 100; // Huge bonus for any safe move
        }
        
        // Prefer moves that go to completely new areas
        const isUnexplored = !aiState.lastPositions.some(pos =>
          pos.x === newHead.x && pos.y === newHead.y
        );
        if (isUnexplored) {
          moveScore += 200; // Massive bonus for unexplored areas
        }
        
        // Ignore food completely in panic mode
        return { move, score: moveScore };
      }
      // In exploration mode, prioritize unexplored areas
      else if (aiState.explorationMode) {
        // Prefer moves that go to areas we haven't visited recently
        const isUnexplored = !aiState.lastPositions.some(pos =>
          pos.x === newHead.x && pos.y === newHead.y
        );
        if (isUnexplored) {
          moveScore += 50; // Big bonus for unexplored areas
        }
        
        // Still try to move towards food but with less priority
        if ((dx > 0 && move.x > 0) || (dx < 0 && move.x < 0) || 
            (dy > 0 && move.y > 0) || (dy < 0 && move.y < 0)) {
          moveScore += 5; // Smaller bonus for moving towards food
        }
      } else {
        // Normal mode: prioritize food
        if ((dx > 0 && move.x > 0) || (dx < 0 && move.x < 0) || 
            (dy > 0 && move.y > 0) || (dy < 0 && move.y < 0)) {
          moveScore += 20; // Big bonus for moving towards food
        }
        
        // Penalty for moving away from food
        if ((dx > 0 && move.x < 0) || (dx < 0 && move.x > 0) || 
            (dy > 0 && move.y < 0) || (dy < 0 && move.y > 0)) {
          moveScore -= 10;
        }
      }
      
      // Simple loop prevention bonus
      if (!wouldCreateLoop) {
        moveScore += 10;
      }
      
      // Bonus for moves that go to unexplored areas
      const isUnexplored = !aiState.lastPositions.some(pos =>
        pos.x === newHead.x && pos.y === newHead.y
      );
      if (isUnexplored) {
        moveScore += 25; // Big bonus for unexplored areas
      }
      
      // Penalty for moves that would trap us
      const wouldTrap = possibleMoves.filter(otherMove => {
        const otherHead = { x: head.x + otherMove.x, y: head.y + otherMove.y };
        return otherHead.x === newHead.x && otherHead.y === newHead.y;
      }).length === 0;
      
      if (wouldTrap) {
        moveScore -= 20;
      }

      return { move, score: moveScore };
    });
    
    // Select move based on pathfinding, random trigger, or best score
    let bestMove: Position;
    
    // If we have a path to food, follow it
    if (pathToFood.length > 1) {
      const nextStep = pathToFood[1];
      const moveToNext = {
        x: nextStep.x - head.x,
        y: nextStep.y - head.y
      };
      
      // Check if this move is safe and valid
      if (possibleMoves.some(move => move.x === moveToNext.x && move.y === moveToNext.y)) {
        bestMove = moveToNext;
      } else {
        // Fallback to scoring system
        moveScores.sort((a, b) => b.score - a.score);
        bestMove = moveScores[0]?.move || { x: 1, y: 0 };
      }
    } else if (shouldMakeRandomMove && possibleMoves.length > 0) {
      // Random move from safe moves only
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      bestMove = possibleMoves[randomIndex];
    } else {
      // Normal AI logic - sort by score and pick best
      moveScores.sort((a, b) => b.score - a.score);
      bestMove = moveScores[0]?.move || { x: 1, y: 0 };
    }
    
    // Update move history for loop detection
    aiState.moveHistory.push(bestMove);
    if (aiState.moveHistory.length > 20) {
      aiState.moveHistory.shift();
    }
    
    // Reset exploration mode if we found food or made progress
    if (distanceToFood === 0 || (aiState.explorationMode && distanceToFood < 3)) {
      aiState.explorationMode = false;
      aiState.stuckCounter = 0;
    }
    
    return bestMove;
  }, [checkSelfTrap, checkCircularMovement, findPathToFood, analyzeFieldState, isPositionSafe]);

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
    const food = foodRef.current;

    // Use AI move if auto-playing
    if (gameState.isAutoPlaying) {
      nextDirectionRef.current = getAIMove();
    }

    const direction = nextDirectionRef.current;

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
  }, [gameState.isPlaying, gameState.isPaused, gameState.isAutoPlaying, generateFood, drawGame, getAIMove]);

  const gameOver = useCallback(() => {
    const wasAutoPlaying = gameState.isAutoPlaying;
    
    setGameState(prev => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      return {
        ...prev,
        isPlaying: false,
        isPaused: false,
        isAutoPlaying: false,
        highScore: newHighScore,
      };
    });
    
    // Reset game
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood();
    speedRef.current = GAME_CONFIG.INITIAL_SPEED;
    
    // Reset AI state
    aiStateRef.current = {
      lastPositions: [],
      moveHistory: [],
      stuckCounter: 0,
      lastFoodPosition: { x: 15, y: 15 },
      explorationMode: false,
      panicMode: false,
      lastPath: [],
      pathIndex: 0,
    };
    
    // Auto-restart if was in AI mode
    if (wasAutoPlaying) {
      setGameState(prev => ({
        ...prev,
        isRestarting: true,
      }));
      
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          isPlaying: true,
          isAutoPlaying: true,
          isRestarting: false,
          score: 0,
        }));
      }, 500); // Small delay before restart
    }
  }, [generateFood, gameState.isAutoPlaying]);

  const toggleAutoPlay = useCallback(() => {
    setGameState(prev => ({ ...prev, isAutoPlaying: !prev.isAutoPlaying }));
  }, []);

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
    setGameState(prev => ({ ...prev, isPlaying: false, isPaused: false, isAutoPlaying: false, isRestarting: false, score: 0 }));
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood();
    speedRef.current = GAME_CONFIG.INITIAL_SPEED;
    
    // Reset AI state
    aiStateRef.current = {
      lastPositions: [],
      moveHistory: [],
      stuckCounter: 0,
      lastFoodPosition: { x: 15, y: 15 },
      explorationMode: false,
      panicMode: false,
      lastPath: [],
      pathIndex: 0,
    };
  }, [generateFood]);

  // Auto-start game with AI when component mounts or when isSnakePlaying prop changes
  // Only work on /zus page
  useEffect(() => {
    if (isSnakePlaying && isVisible && isOnZusPage) {
      // Small delay to ensure canvas is ready
      setTimeout(() => {
        // Generate initial food
        foodRef.current = generateFood();
        
        setGameState(prev => ({
          ...prev,
          isPlaying: true,
          isAutoPlaying: true,
        }));
      }, 100);
    }
  }, [isSnakePlaying, isVisible, isOnZusPage, generateFood]);

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

  // Only work on /zus page - don't render anything on other pages
  if (!isOnZusPage) {
    return null;
  }
  
  // Don't render anything if the button shouldn't be shown (unless auto-playing from props)
  if (!showButton && !isSnakePlaying) {
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
    <>
      {/* Minecraft Game - Top Left */}
      <MinecraftGame isSnakePlaying={gameState.isPlaying} />
      
      {/* Block Breaker Game - Top Right */}
      <BlockBreakerGame isSnakePlaying={gameState.isPlaying} />
      
      {/* Plinko Game - Bottom Left */}
      <PlinkoGame isSnakePlaying={gameState.isPlaying} />
      
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border-2 border-zus-green p-3 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-zus-grey-900">🎮 Auto Game</h3>
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

      <div className="mt-2 flex gap-2">
        <Button 
          onClick={toggleAutoPlay} 
          variant={gameState.isAutoPlaying ? "success" : "secondary"} 
          size="sm" 
          className="flex-1"
        >
          {gameState.isAutoPlaying ? '🤖 AI ON' : '🤖 AI OFF'}
        </Button>
      </div>

      {gameState.isRestarting && (
        <div className="mt-2 text-xs text-center">
          <span className="px-2 py-1 rounded text-white bg-zus-blue animate-pulse">
            🔄 Auto-restarting...
          </span>
        </div>
      )}


    </div>
    </>
  );
}