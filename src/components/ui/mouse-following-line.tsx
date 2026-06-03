"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useAnimate } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from 'next-themes'

// --- COMPONENT PROPS ---
interface GridAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number
  rows?: number
  spacing?: number
  strokeLength?: number
  strokeWidth?: number
}

/**
 * An interactive grid animation where lines dynamically point away from a user-controlled ball.
 * It uses CSS variables for theming and is fully responsive.
 * @requires framer-motion
 */
export function GridAnimation({
  className,
  cols = 40,
  rows = 40,
  spacing = 30,
  strokeLength = 10,
  strokeWidth = 1,
  ...props
}: GridAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [ballRef, animate] = useAnimate()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const animationFrameRef = useRef<number | undefined>(undefined)
  const isMouseOverRef = useRef(false)
  const currentBallPosition = useRef({ x: 0, y: 0 })

  // Calculate canvas dimensions and set initial ball position
  useEffect(() => {
    const calculateDimensions = () => {
      // Use window size to fill the screen
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : cols * spacing;
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : rows * spacing;
      
      const width = screenWidth + spacing * 2; // Extra padding
      const height = screenHeight + spacing * 2;
      
      setDimensions({ width, height })

      // Set initial ball position to the center
      const centerX = width / 2
      const centerY = height / 2
      currentBallPosition.current = { x: centerX, y: centerY }

      if (ballRef.current) {
        animate(ballRef.current, { x: centerX, y: centerY }, { duration: 0 })
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, [cols, rows, spacing, ballRef, animate])

  // Finds the nearest grid point to a given coordinate
  const snapToGrid = (pointX: number, pointY: number) => {
    const nearestX = Math.round(pointX / spacing) * spacing
    const nearestY = Math.round(pointY / spacing) * spacing
    return { x: nearestX, y: nearestY }
  }

  // Main animation loop to draw the grid lines on the canvas
  const animateCanvas = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas for redrawing
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Use the current ball position from our ref
    const ballX = currentBallPosition.current.x
    const ballY = currentBallPosition.current.y

    // For Kessler Vision, default to white lines on dark theme
    const foregroundColor = theme === 'light' ? '#111' : 'rgba(255, 255, 255, 0.4)' 

    // Calculate actual columns and rows based on dimensions
    const actualCols = Math.ceil(dimensions.width / spacing)
    const actualRows = Math.ceil(dimensions.height / spacing)

    // Draw strokes for each point on the grid
    for (let col = 0; col <= actualCols; col++) {
      for (let row = 0; row <= actualRows; row++) {
        const pointX = col * spacing
        const pointY = row * spacing
        const dx = ballX - pointX
        const dy = ballY - pointY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Don't draw lines too close to the ball
        if (distance < 15) continue

        const angle = Math.atan2(dy, dx)

        // Draw the line pointing AWAY from the ball
        ctx.beginPath()
        ctx.moveTo(pointX, pointY)
        // By subtracting the cos/sin, we draw in the opposite direction of the angle
        ctx.lineTo(pointX - Math.cos(angle) * strokeLength, pointY - Math.sin(angle) * strokeLength)
        ctx.strokeStyle = foregroundColor
        ctx.lineWidth = strokeWidth
        ctx.stroke()
      }
    }

    // Continue the animation loop if mouse is over the component
    if (isMouseOverRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateCanvas)
    }
  }, [dimensions, spacing, strokeLength, strokeWidth, theme])

  // Start the continuous animation loop
  const startAnimationLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    isMouseOverRef.current = true
    animationFrameRef.current = requestAnimationFrame(animateCanvas)
  }, [animateCanvas])

  // Stop the animation loop
  const stopAnimationLoop = useCallback(() => {
    isMouseOverRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    // Draw one final frame
    requestAnimationFrame(animateCanvas)
  }, [animateCanvas])

  // Handle mouse move events to animate the ball
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const { x: snapX, y: snapY } = snapToGrid(mouseX, mouseY)

    // Update our position reference immediately for smooth canvas updates
    currentBallPosition.current = { x: snapX, y: snapY }

    if (ballRef.current) {
      animate(
        ballRef.current,
        { x: snapX, y: snapY },
        {
          type: "spring",
          stiffness: 300,
          damping: 20,
        },
      )
    }
  }

  // Handle mouse enter to start animation loop
  const handleMouseEnter = () => {
    startAnimationLoop()
  }

  // Handle mouse leave event to return the ball to the center
  const handleMouseLeave = () => {
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2

    currentBallPosition.current = { x: centerX, y: centerY }

    if (ballRef.current) {
      animate(
        ballRef.current,
        { x: centerX, y: centerY },
        {
          type: "spring",
          stiffness: 300,
          damping: 20,
        },
      )
    }

    stopAnimationLoop()
  }

  // Effect for initial draw and cleanup
  useEffect(() => {
    // Initial draw
    if (canvasRef.current) {
      requestAnimationFrame(animateCanvas)
    }

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animateCanvas])

  return (
    <div
      className={cn("relative cursor-pointer overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: "100%",
        height: "100%",
      }}
      {...props}
    >
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="absolute inset-0" />
      <motion.div
        ref={ballRef}
        className="hidden" // Escondendo a bolinha como solicitado pelo usuario
      />
    </div>
  )
}
