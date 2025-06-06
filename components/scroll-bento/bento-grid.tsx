"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type BentoGridContextValue = {
  register: (id: string, el: HTMLElement | null) => void
  scrollTo: (id: string) => void
  containerRef: React.RefObject<HTMLDivElement>
}

const BentoGridContext = React.createContext<BentoGridContextValue | null>(null)

export function useBentoGrid() {
  const ctx = React.useContext(BentoGridContext)
  if (!ctx) {
    throw new Error("useBentoGrid must be used within BentoGridProvider")
  }
  return ctx
}

interface BentoGridProviderProps {
  children: React.ReactNode
}

function BentoGridProvider({ children }: BentoGridProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const itemsRef = React.useRef(new Map<string, HTMLElement>())

  const register = React.useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemsRef.current.set(id, el)
    else itemsRef.current.delete(id)
  }, [])

  const scrollTo = React.useCallback((id: string) => {
    const el = itemsRef.current.get(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [])

  const value = React.useMemo(() => ({ register, scrollTo, containerRef }), [register, scrollTo])

  return <BentoGridContext.Provider value={value}>{children}</BentoGridContext.Provider>
}

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
}

function Grid({ rows = 3, className, style, children, ...props }: BentoGridProps) {
  const { containerRef } = useBentoGrid()

  // stores the current scroll target for keyboard-driven navigation
  const targetScrollLeftRef = React.useRef(0)
  const animationFrameId = React.useRef(0)

  const animateScroll = React.useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const delta = targetScrollLeftRef.current - el.scrollLeft
    if (Math.abs(delta) < 1) {
      el.scrollLeft = targetScrollLeftRef.current
      return
    }
    el.scrollLeft += delta * 0.2
    animationFrameId.current = requestAnimationFrame(animateScroll)
  }, [containerRef])

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    targetScrollLeftRef.current = el.scrollLeft

    function handleWheel(e: WheelEvent) {
      if (!el) return
      e.preventDefault()
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      el.scrollLeft += delta
      targetScrollLeftRef.current = el.scrollLeft
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [containerRef])

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!containerRef.current) return

      const STEP = 300
      if (e.key === "ArrowRight") {
        e.preventDefault()
        targetScrollLeftRef.current += STEP
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = requestAnimationFrame(animateScroll)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        targetScrollLeftRef.current -= STEP
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = requestAnimationFrame(animateScroll)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [animateScroll, containerRef])
  return (
    <div
      ref={containerRef}
      className={cn(
        "grid overflow-x-auto scroll-smooth gap-4 touch-auto [grid-auto-flow:column_dense]",
        className
      )}
      style={{
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

interface BentoBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  rowSpan?: number
  colSpan?: number
}

function BentoBox({ id, rowSpan = 1, colSpan = 1, className, style, ...props }: BentoBoxProps) {
  const { register } = useBentoGrid()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    register(id, ref.current)
    return () => register(id, null)
  }, [id, register])

  return (
    <div
      ref={ref}
      className={cn("scroll-m-4", className)}
      style={{
        gridRow: `span ${rowSpan} / span ${rowSpan}`,
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        scrollSnapAlign: "start",
        ...style,
      }}
      {...props}
    />
  )
}

export { BentoGridProvider, Grid as BentoGrid, BentoBox }
