"use client"

import { useEffect, useRef } from "react"

interface WheelProps {
  isSpinning: boolean,
  result: number | null
}
export function Wheel({ isSpinning, result }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Colors for the wheel segments
  const colors = [
    "#e74c3c", // red
    "#2ecc71", // green
    "#3498db", // blue
    "#f39c12", // orange
    "#9b59b6", // purple
    "#1abc9c", // teal
    "#e67e22", // dark orange
    "#e74c3c", // red
    "#2ecc71", // green
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw wheel segments
    const numSegments = 16
    const anglePerSegment = (2 * Math.PI) / numSegments

    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * anglePerSegment
      const endAngle = (i + 1) * anglePerSegment

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()

      // Draw number
      ctx.save()
      ctx.translate(
        centerX + radius * 0.75 * Math.cos(startAngle + anglePerSegment / 2),
        centerY + radius * 0.75 * Math.sin(startAngle + anglePerSegment / 2),
      )
      ctx.rotate(startAngle + anglePerSegment / 2 + Math.PI / 2)
      ctx.fillStyle = "white"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText((i + 1).toString(), 0, 0)
      ctx.restore()
    }

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI)
    ctx.fillStyle = "#34495e"
    ctx.fill()

    // Draw pointer
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius - 10)
    ctx.lineTo(centerX - 10, centerY - radius + 10)
    ctx.lineTo(centerX + 10, centerY - radius + 10)
    ctx.closePath()
    ctx.fillStyle = "#34495e"
    ctx.fill()

    // Highlight result if available
    if (result && !isSpinning) {
      const resultIndex = result - 1
      const resultAngle = resultIndex * anglePerSegment

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius + 5, resultAngle, resultAngle + anglePerSegment)
      ctx.closePath()
      ctx.lineWidth = 5
      ctx.strokeStyle = "white"
      ctx.stroke()
    }

    // Animation effect for spinning
    if (isSpinning) {
      let rotation = 0
      let speed = 0.3
      const slowdown = 0.0005

      const animate = () => {
        rotation += speed
        speed = Math.max(0, speed - slowdown)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(rotation)
        ctx.translate(-centerX, -centerY)

        // Redraw wheel
        for (let i = 0; i < numSegments; i++) {
          const startAngle = i * anglePerSegment
          const endAngle = (i + 1) * anglePerSegment

          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, startAngle, endAngle)
          ctx.closePath()

          ctx.fillStyle = colors[i % colors.length]
          ctx.fill()

          // Draw number
          ctx.save()
          ctx.translate(
            centerX + radius * 0.75 * Math.cos(startAngle + anglePerSegment / 2),
            centerY + radius * 0.75 * Math.sin(startAngle + anglePerSegment / 2),
          )
          ctx.rotate(startAngle + anglePerSegment / 2 + Math.PI / 2)
          ctx.fillStyle = "white"
          ctx.font = "bold 16px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText((i + 1).toString(), 0, 0)
          ctx.restore()
        }

        // Draw center circle
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI)
        ctx.fillStyle = "#34495e"
        ctx.fill()

        ctx.restore()

        // Draw pointer (not rotating)
        ctx.beginPath()
        ctx.moveTo(centerX, centerY - radius - 10)
        ctx.lineTo(centerX - 10, centerY - radius + 10)
        ctx.lineTo(centerX + 10, centerY - radius + 10)
        ctx.closePath()
        ctx.fillStyle = "#34495e"
        ctx.fill()

        if (speed > 0) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    }
  }, [isSpinning, result])

  return <canvas ref={canvasRef} width={300} height={300} className="border-4 border-gray-700 rounded-full" />
}

