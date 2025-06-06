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

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [containerRef])
  return (
    <div
      ref={containerRef}
      className={cn(
        "grid overflow-x-auto scroll-smooth gap-4 touch-pan-x [grid-auto-flow:column_dense]",
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
